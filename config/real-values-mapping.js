/**
 * Real Values Mapping for Placeholder Replacement
 * M3.9 Phase 2: Comprehensive validation patterns and environment-specific mappings
 */

export const realValuesMapping = {
  // Environment-specific configurations
  environments: {
    development: {
      'YOUR_API_KEY_HERE': 'dev-api-key-12345',
      'YOUR_SECRET_KEY': 'dev-secret-key-67890',
      'YOUR_DATABASE_URL': 'postgresql://user:pass@localhost:5432/dealradar_dev',
      'YOUR_REDIS_URL': 'redis://localhost:6379/0',
      'YOUR_FRONTEND_URL': 'http://localhost:3000',
      'YOUR_DOMAIN': 'localhost:3001',
      'YOUR_EMAIL_HOST': 'smtp.mailtrap.io',
      'YOUR_EMAIL_USER': 'test@mailtrap.io',
      'YOUR_SENTRY_DSN': 'https://dev-sentry-dsn@sentry.io/project'
    },
    production: {
      'YOUR_API_KEY_HERE': '${PRODUCTION_API_KEY}',
      'YOUR_SECRET_KEY': '${PRODUCTION_SECRET_KEY}',
      'YOUR_DATABASE_URL': '${DATABASE_URL}',
      'YOUR_REDIS_URL': '${REDIS_URL}',
      'YOUR_FRONTEND_URL': '${FRONTEND_URL}',
      'YOUR_DOMAIN': '${DOMAIN}',
      'YOUR_EMAIL_HOST': '${SMTP_HOST}',
      'YOUR_EMAIL_USER': '${SMTP_USER}',
      'YOUR_SENTRY_DSN': '${SENTRY_DSN}'
    },
    test: {
      'YOUR_API_KEY_HERE': 'test-api-key-12345',
      'YOUR_SECRET_KEY': 'test-secret-key-67890',
      'YOUR_DATABASE_URL': 'postgresql://user:pass@localhost:5433/dealradar_test',
      'YOUR_REDIS_URL': 'redis://localhost:6380/0',
      'YOUR_FRONTEND_URL': 'http://localhost:3001',
      'YOUR_DOMAIN': 'localhost:3001',
      'YOUR_EMAIL_HOST': 'smtp.ethereal.email',
      'YOUR_EMAIL_USER': 'test@ethereal.email',
      'YOUR_SENTRY_DSN': 'https://test-sentry-dsn@sentry.io/project'
    }
  },

  // Service-specific mappings
  services: {
    // Google Analytics 4
    googleAnalytics: {
      'GA4_MEASUREMENT_ID': 'G-XXXXXXXXXX',
      'GA4_API_SECRET': '${GA4_API_SECRET}',
      'YOUR_GA4_STREAM_ID': '${GA4_STREAM_ID}',
      'YOUR_GA_TRACKING_ID': 'G-DEALRADAR123'
    },

    // Google Tag Manager
    googleTagManager: {
      'GTM_CONTAINER_ID': 'GTM-XXXXXXX',
      'GTM_AUTH_TOKEN': '${GTM_AUTH_TOKEN}',
      'YOUR_GTM_ID': 'GTM-DEALRADAR'
    },

    // Facebook/Meta
    facebook: {
      'YOUR_FB_APP_ID': '${FACEBOOK_APP_ID}',
      'YOUR_FB_APP_SECRET': '${FACEBOOK_APP_SECRET}',
      'YOUR_FB_PAGE_ACCESS_TOKEN': '${FACEBOOK_PAGE_ACCESS_TOKEN}',
      'YOUR_FACEBOOK_PIXEL_ID': '${FACEBOOK_PIXEL_ID}'
    },

    // Payment Services
    stripe: {
      'YOUR_STRIPE_PUBLIC_KEY': 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxx',
      'YOUR_STRIPE_SECRET_KEY': '${STRIPE_SECRET_KEY}',
      'YOUR_STRIPE_WEBHOOK_SECRET': '${STRIPE_WEBHOOK_SECRET}'
    },

    // Email Services
    sendgrid: {
      'YOUR_SENDGRID_API_KEY': '${SENDGRID_API_KEY}',
      'YOUR_SENDGRID_FROM_EMAIL': 'deals@dealradarus.com'
    },

    // SMS Services
    twilio: {
      'YOUR_TWILIO_SID': '${TWILIO_ACCOUNT_SID}',
      'YOUR_TWILIO_AUTH_TOKEN': '${TWILIO_AUTH_TOKEN}',
      'YOUR_TWILIO_PHONE_NUMBER': '${TWILIO_PHONE_NUMBER}'
    },

    // Monitoring
    sentry: {
      'YOUR_SENTRY_DSN': '${SENTRY_DSN}',
      'YOUR_SENTRY_ORG': 'dealradarus',
      'YOUR_SENTRY_PROJECT': 'deal-aggregator'
    },

    // Cloud Storage
    aws: {
      'YOUR_AWS_ACCESS_KEY_ID': '${AWS_ACCESS_KEY_ID}',
      'YOUR_AWS_SECRET_ACCESS_KEY': '${AWS_SECRET_ACCESS_KEY}',
      'YOUR_S3_BUCKET_NAME': '${S3_BUCKET_NAME}',
      'YOUR_AWS_REGION': 'us-east-1'
    }
  },

  // Security patterns - These should never be replaced with real values
  securityPatterns: {
    // JWT Secrets
    'your-jwt-secret-key': '${JWT_SECRET}',
    'your-secret-key-here': '${SECRET_KEY}',
    'replace-with-secure-secret': '${SECURE_SECRET}',
    
    // API Keys (generic patterns)
    'your-api-key': '${API_KEY}',
    'api-key-here': '${API_KEY}',
    'insert-api-key': '${API_KEY}',
    
    // Passwords
    'your-password-here': '${DATABASE_PASSWORD}',
    'admin-password': '${ADMIN_PASSWORD}',
    'default-password': '${USER_PASSWORD}'
  },

  // Domain-specific mappings
  domains: {
    'example.com': 'dealradarus.com',
    'yoursite.com': 'dealradarus.com',
    'yourdomain.com': 'dealradarus.com',
    'localhost:3000': process.env.NODE_ENV === 'production' ? 'dealradarus.com' : 'localhost:3000'
  },

  // Database configurations
  database: {
    'database_name_here': 'dealradar_db',
    'your_database_name': 'dealradar_db',
    'localhost:5432': process.env.NODE_ENV === 'production' ? '${DB_HOST}:${DB_PORT}' : 'localhost:5432'
  },

  // Common placeholder patterns
  common: {
    // Company/Project specific
    'Your Company': 'DealRadarUS',
    'Your Project': 'DealRadarUS',
    'Your App': 'DealRadarUS',
    'CompanyName': 'DealRadarUS',
    'ProjectName': 'DealRadarUS',
    'AppName': 'DealRadarUS',
    
    // Contact information
    'your-email@domain.com': 'admin@dealradarus.com',
    'contact@example.com': 'contact@dealradarus.com',
    'support@example.com': 'support@dealradarus.com',
    'admin@example.com': 'admin@dealradarus.com',
    
    // URLs
    'https://example.com': 'https://dealradarus.com',
    'http://localhost:3000': process.env.NODE_ENV === 'production' ? 'https://dealradarus.com' : 'http://localhost:3000',
    
    // Numeric placeholders
    'PORT_NUMBER': '3001',
    'YOUR_PORT': '3001',
    'SERVER_PORT': '3001'
  }
};

// Advanced validation patterns for different contexts
export const validationPatterns = {
  // Email validation patterns
  email: {
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    placeholders: [
      'your-email@domain.com',
      'admin@example.com',
      'user@company.com',
      'test@test.com',
      'example@example.com'
    ]
  },

  // URL validation patterns
  url: {
    pattern: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_.+~#?&//=]*)/g,
    placeholders: [
      'https://example.com',
      'http://localhost:3000',
      'https://yoursite.com',
      'https://yourdomain.com'
    ]
  },

  // API Key patterns
  apiKey: {
    pattern: /[A-Za-z0-9_-]{20,}/g,
    placeholders: [
      'your-api-key-here',
      'YOUR_API_KEY',
      'api-key-placeholder',
      'insert-your-key-here'
    ]
  },

  // Database connection strings
  database: {
    pattern: /(postgresql|mysql|mongodb):\/\/[^/\s]+/g,
    placeholders: [
      'postgresql://user:password@localhost:5432/database',
      'mysql://user:password@localhost:3306/database',
      'mongodb://localhost:27017/database'
    ]
  },

  // JWT Token patterns
  jwt: {
    pattern: /eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*/g,
    placeholders: [
      'your-jwt-secret-here',
      'jwt-secret-key',
      'replace-with-jwt-secret'
    ]
  }
};

// Environment-specific validation rules
export const environmentRules = {
  development: {
    allowHardcodedSecrets: true,
    requireEnvironmentVariables: false,
    allowTestValues: true
  },
  production: {
    allowHardcodedSecrets: false,
    requireEnvironmentVariables: true,
    allowTestValues: false,
    mandatoryEnvironmentVars: [
      'DATABASE_URL',
      'REDIS_URL',
      'JWT_SECRET',
      'SMTP_HOST',
      'SMTP_USER',
      'SMTP_PASS'
    ]
  },
  test: {
    allowHardcodedSecrets: true,
    requireEnvironmentVariables: false,
    allowTestValues: true
  }
};

// Security classification for different types of placeholders
export const securityClassification = {
  HIGH_RISK: [
    'password', 'secret', 'private', 'key', 'token', 'auth',
    'credential', 'api_key', 'jwt', 'hash', 'salt'
  ],
  MEDIUM_RISK: [
    'database', 'redis', 'smtp', 'email', 'host', 'port'
  ],
  LOW_RISK: [
    'domain', 'url', 'name', 'title', 'description', 'version'
  ]
};

export const getRealValue = (placeholder, environment = 'development') => {
  if (realValuesMapping.environments[environment] && realValuesMapping.environments[environment][placeholder]) {
    return realValuesMapping.environments[environment][placeholder];
  }
  for (const service in realValuesMapping.services) {
    if (realValuesMapping.services[service][placeholder]) {
      return realValuesMapping.services[service][placeholder];
    }
  }
  if (realValuesMapping.common[placeholder]) {
    return realValuesMapping.common[placeholder];
  }
  if (realValuesMapping.domains[placeholder]) {
    return realValuesMapping.domains[placeholder];
  }
  if (realValuesMapping.database[placeholder]) {
    return realValuesMapping.database[placeholder];
  }
  return null;
};

export const getSecurityLevel = (placeholder) => {
  const lowerPlaceholder = placeholder.toLowerCase();
  for (const risk of securityClassification.HIGH_RISK) {
    if (lowerPlaceholder.includes(risk)) {
      return 'HIGH_RISK';
    }
  }
  for (const risk of securityClassification.MEDIUM_RISK) {
    if (lowerPlaceholder.includes(risk)) {
      return 'MEDIUM_RISK';
    }
  }
  return 'LOW_RISK';
};

export const validateEnvironment = (environment) => {
  return environmentRules[environment] || environmentRules.development;
};
