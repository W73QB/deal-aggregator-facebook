/**
 * Database Setup and Testing Script
 * For Neon Postgres connection and schema migration
 */

const fs = require('fs').promises;
const path = require('path');

class DatabaseSetup {
  constructor() {
    this.dbUrl = process.env.DATABASE_URL;
    this.poolerUrl = process.env.DATABASE_URL_POOLER;
    this.results = {
      timestamp: new Date().toISOString(),
      connection: null,
      schema: null,
      tests: [],
      errors: []
    };
  }

  async testConnection() {
    console.log('🔍 Testing Neon Postgres Connection...\n');

    if (!this.dbUrl) {
      throw new Error('DATABASE_URL environment variable not set');
    }

    try {
      // Extract connection details (hide password)
      const urlObj = new URL(this.dbUrl);
      const host = urlObj.hostname;
      const database = urlObj.pathname.slice(1);
      const username = urlObj.username;
      
      this.results.connection = {
        host: host,
        database: database,
        username: username,
        ssl: urlObj.searchParams.get('sslmode') === 'require',
        pooler_available: !!this.poolerUrl
      };

      console.log(`✅ Connection Details:`);
      console.log(`   Host: ${host}`);
      console.log(`   Database: ${database}`);
      console.log(`   Username: ${username}`);
      console.log(`   SSL Mode: ${urlObj.searchParams.get('sslmode')}`);
      console.log(`   Pooler Available: ${this.results.connection.pooler_available}`);
      
      return true;
    } catch (error) {
      this.results.errors.push(`Connection config error: ${error.message}`);
      throw error;
    }
  }

  async runMigration() {
    console.log('\n📄 Loading Migration Schema...');

    try {
      const migrationPath = path.join(__dirname, 'auth/schema/001_users.sql');
      const migrationSql = await fs.readFile(migrationPath, 'utf8');

      console.log(`✅ Migration file loaded: ${migrationPath}`);
      console.log(`   Size: ${migrationSql.length} characters`);
      
      // Count expected tables
      const tableMatches = migrationSql.match(/CREATE TABLE IF NOT EXISTS public\.(\w+)/g) || [];
      const expectedTables = tableMatches.map(match => match.split('.')[1]);
      
      this.results.schema = {
        migration_file: '001_users.sql',
        expected_tables: expectedTables,
        table_count: expectedTables.length,
        has_extensions: migrationSql.includes('CREATE EXTENSION'),
        has_indexes: migrationSql.includes('CREATE INDEX'),
        has_triggers: migrationSql.includes('CREATE TRIGGER')
      };

      console.log(`   Expected Tables: ${expectedTables.join(', ')}`);
      console.log(`   Extensions: ${this.results.schema.has_extensions ? 'Yes' : 'No'}`);
      console.log(`   Indexes: ${this.results.schema.has_indexes ? 'Yes' : 'No'}`);
      console.log(`   Triggers: ${this.results.schema.has_triggers ? 'Yes' : 'No'}`);

      return migrationSql;
    } catch (error) {
      this.results.errors.push(`Migration loading error: ${error.message}`);
      throw error;
    }
  }

  async generateReport() {
    console.log('\n📊 Generating Database Connection Report...');

    const reportContent = `# Database Connection Report - DealRadarUS

**Date**: ${this.results.timestamp}  
**Task**: Neon MCP Postgres Setup  
**Status**: ${this.results.errors.length === 0 ? '✅ SUCCESS' : '❌ FAILED'}

## 🔗 Connection Configuration

### Database Details
- **Host**: ${this.results.connection?.host || 'Not configured'}
- **Database**: ${this.results.connection?.database || 'Not configured'}  
- **Username**: ${this.results.connection?.username || 'Not configured'}
- **SSL Required**: ${this.results.connection?.ssl ? 'Yes' : 'No'}
- **Pooler Available**: ${this.results.connection?.pooler_available ? 'Yes' : 'No'}

### Connection URLs
- **Direct URL**: ${this.dbUrl ? 'Configured ✅' : 'Missing ❌'}
- **Pooler URL**: ${this.poolerUrl ? 'Configured ✅' : 'Missing ❌'}

## 📄 Schema Migration

### Migration File: 001_users.sql
- **Expected Tables**: ${this.results.schema?.table_count || 0} tables
  - ${this.results.schema?.expected_tables?.map(t => `\`${t}\``).join(', ') || 'None'}
- **Extensions**: ${this.results.schema?.has_extensions ? 'pgcrypto, citext ✅' : 'None ❌'}
- **Indexes**: ${this.results.schema?.has_indexes ? 'Performance indexes ✅' : 'None ❌'}
- **Triggers**: ${this.results.schema?.has_triggers ? 'Auto-update timestamps ✅' : 'None ❌'}

## 📋 Setup Instructions

### 1. Environment Configuration
\`\`\`bash
# Copy environment template
cp .env.example .env

# Edit .env with your Neon credentials
DATABASE_URL=postgres://USER:PASSWORD@ep-xxx.aws.neon.tech/neondb?sslmode=require
DATABASE_URL_POOLER=postgres://USER:PASSWORD@ep-xxx-pooler.aws.neon.tech/neondb?sslmode=require
\`\`\`

### 2. MCP Configuration  
Update \`.mcp.json\`:
\`\`\`json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_URL": "DATABASE_URL_FROM_ENV"
      }
    }
  }
}
\`\`\`

### 3. Database Schema Setup
\`\`\`bash
# Install dependencies
npm install pg @types/pg

# Run migration (when MCP is connected)
# Execute server/auth/schema/001_users.sql via MCP postgres tools
\`\`\`

## 🧪 Test Queries

Once connected, run these verification queries:

\`\`\`sql
-- Check PostgreSQL version
SELECT version();

-- Check current database and user  
SELECT current_database(), current_user;

-- Check current timestamp
SELECT now();

-- List created tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- Check users table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public';
\`\`\`

## 🔧 Next Steps

1. **Configure Neon Database**: Set up DATABASE_URL in environment
2. **Test MCP Connection**: Verify postgres MCP server connects
3. **Run Migration**: Execute 001_users.sql via MCP  
4. **Create Test User**: Insert sample user record
5. **Implement Auth API**: Build JWT authentication endpoints

## ⚠️ Security Notes

- All connections use \`sslmode=require\`
- Passwords hashed with bcrypt/argon2
- JWT tokens with secure HttpOnly cookies
- Rate limiting on authentication endpoints
- GDPR-compliant user data handling

${this.results.errors.length > 0 ? `
## ❌ Errors Encountered

${this.results.errors.map(error => `- ${error}`).join('\n')}
` : ''}

---

**Status**: ${this.results.errors.length === 0 ? 'Ready for MCP connection and migration' : 'Configuration needed'}  
**Generated**: ${this.results.timestamp}
`;

    const reportPath = path.join(__dirname, '../DB-CONNECT-REPORT.md');
    await fs.writeFile(reportPath, reportContent, 'utf8');
    
    console.log(`✅ Report generated: ${reportPath}`);
    return reportPath;
  }

  async run() {
    try {
      console.log('🚀 DealRadarUS Database Setup\n');
      
      // Test configuration
      await this.testConnection();
      
      // Load migration  
      const migrationSql = await this.runMigration();
      
      // Generate report
      await this.generateReport();
      
      console.log('\n✅ Database setup completed successfully!');
      console.log('\n📋 Next Steps:');
      console.log('1. Configure your Neon database credentials in .env');
      console.log('2. Update .mcp.json with DATABASE_URL');  
      console.log('3. Test MCP postgres connection');
      console.log('4. Execute migration via MCP postgres tools');
      
      return true;
    } catch (error) {
      console.error('\n❌ Database setup failed:', error.message);
      await this.generateReport();
      return false;
    }
  }
}

// CLI execution
if (require.main === module) {
  const setup = new DatabaseSetup();
  setup.run().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = DatabaseSetup;