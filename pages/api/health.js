import fs from 'fs/promises';
import path from 'path';
import nextConfig from '../../next.config.js';
import { getMonitoringDb } from '../../lib/monitoring/databaseLogger.js';

// Force Node.js runtime for Vercel
export const config = {
  runtime: 'nodejs'
};

async function checkDatabase() {
  try {
    const db = await getMonitoringDb();
    if (!db) {
      throw new Error('Database connection unavailable');
    }

    await db.query('SELECT 1');

    return {
      component: 'database',
      status: 'ok'
    };
  } catch (error) {
    return {
      component: 'database',
      status: 'error',
      detail: error.message
    };
  }
}

async function checkAnalyticsCompliance() {
  try {
    const db = await getMonitoringDb();
    if (!db) {
      throw new Error('Database connection unavailable');
    }

    const result = await db.query(
      `SELECT COUNT(*)::int AS flagged
       FROM analytics_events
       WHERE data ? 'clientIp' OR data ? 'text'`
    );

    const flagged = result.rows[0]?.flagged || 0;

    return {
      component: 'analytics',
      status: flagged === 0 ? 'ok' : 'warn',
      detail: flagged === 0 ? 'No PII fields detected' : `${flagged} events contain potential PII fields`
    };
  } catch (error) {
    return {
      component: 'analytics',
      status: 'error',
      detail: error.message
    };
  }
}

async function checkCSPViolations() {
  try {
    const headersFactory = nextConfig.headers;
    if (typeof headersFactory !== 'function') {
      return {
        component: 'csp',
        status: 'warn',
        detail: 'No custom headers defined in Next.js configuration'
      };
    }

    const headerConfigs = await headersFactory();
    const rootHeaders = headerConfigs.find((entry) => entry.source === '/(.*)');

    const cspHeader = rootHeaders?.headers?.find((header) => header.key.toLowerCase() === 'content-security-policy');
    const value = cspHeader?.value || '';

    const hasUnsafeInline = value.includes("'unsafe-inline'");
    const hasUnsafeEval = value.includes("'unsafe-eval'");

    return {
      component: 'csp',
      status: !hasUnsafeInline && !hasUnsafeEval ? 'ok' : 'warn',
      detail: !hasUnsafeInline && !hasUnsafeEval
        ? 'CSP does not contain unsafe directives'
        : 'CSP still references unsafe inline/eval directives'
    };
  } catch (error) {
    return {
      component: 'csp',
      status: 'error',
      detail: error.message
    };
  }
}

async function listFilesMatching(directory, patterns) {
  const matches = [];

  async function walk(current) {
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (patterns.some((pattern) => entry.name.endsWith(pattern))) {
        matches.push(fullPath);
      }
    }
  }

  try {
    await walk(directory);
  } catch (error) {
    // Ignore missing directories
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  return matches;
}

async function checkRepositoryArtifacts() {
  try {
    const backupFiles = await listFilesMatching(path.join(process.cwd(), 'pages'), [
      '.html.backup',
      '.html.cachebak',
      '.html.guard_backup'
    ]);

    const coverageArtifacts = await listFilesMatching(path.join(process.cwd(), 'coverage'), ['.html.cachebak']);

    const leftover = backupFiles.length + coverageArtifacts.length;

    return {
      component: 'repository',
      status: leftover === 0 ? 'ok' : 'warn',
      detail: leftover === 0
        ? 'No backup artifacts detected'
        : `${leftover} backup artifacts detected`
    };
  } catch (error) {
    return {
      component: 'repository',
      status: 'error',
      detail: error.message
    };
  }
}

export default async function handler(req, res) {
  const checks = await Promise.all([
    checkDatabase(),
    checkAnalyticsCompliance(),
    checkCSPViolations(),
    checkRepositoryArtifacts()
  ]);

  const status = checks.every((check) => check.status === 'ok')
    ? 'healthy'
    : checks.some((check) => check.status === 'error')
      ? 'error'
      : 'degraded';

  res.status(status === 'healthy' ? 200 : 503).json({
    status,
    generatedAt: new Date().toISOString(),
    checks
  });
}
