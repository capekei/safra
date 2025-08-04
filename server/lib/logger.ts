import pino from 'pino';

// Configure Pino logger based on environment
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Base logger configuration
const loggerConfig: pino.LoggerOptions = {
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  
  // Production configuration
  ...(isProduction && {
    // Structured logging for production
    formatters: {
      level: (label) => {
        return { level: label };
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    // Remove sensitive data from logs
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'req.body.password',
        'req.body.passwordHash',
        'req.body.token',
        'res.headers["set-cookie"]',
        'err.config.headers.authorization',
        'password',
        'passwordHash',
        'token',
        'jwt',
        'secret'
      ],
      censor: '[REDACTED]'
    }
  }),

  // Development configuration
  ...(isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
        singleLine: false,
        hideObject: false
      }
    }
  })
};

// Create the main logger
export const logger = pino(loggerConfig);

// Create specialized loggers for different components
export const authLogger = logger.child({ component: 'auth' });
export const dbLogger = logger.child({ component: 'database' });
export const apiLogger = logger.child({ component: 'api' });
export const adminLogger = logger.child({ component: 'admin' });
export const securityLogger = logger.child({ component: 'security' });

// Helper functions for common logging patterns
export const logAuthEvent = (event: string, userId?: number, details?: any) => {
  authLogger.info({
    event,
    userId,
    ...details
  }, `Auth event: ${event}`);
};

export const logSecurityEvent = (event: string, severity: 'low' | 'medium' | 'high' | 'critical', details?: any) => {
  const logLevel = severity === 'critical' ? 'error' : severity === 'high' ? 'warn' : 'info';
  
  securityLogger[logLevel]({
    event,
    severity,
    timestamp: new Date().toISOString(),
    ...details
  }, `Security event: ${event}`);
};

export const logDatabaseEvent = (operation: string, table?: string, duration?: number, error?: any) => {
  if (error) {
    dbLogger.error({
      operation,
      table,
      duration,
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code
      }
    }, `Database error: ${operation}`);
  } else {
    dbLogger.debug({
      operation,
      table,
      duration
    }, `Database operation: ${operation}`);
  }
};

export const logAdminAction = (action: string, adminId: number, entityType?: string, entityId?: string, changes?: any) => {
  adminLogger.info({
    action,
    adminId,
    entityType,
    entityId,
    changes,
    timestamp: new Date().toISOString()
  }, `Admin action: ${action}`);
};

export const logAPIRequest = (method: string, url: string, statusCode: number, duration: number, userId?: number, adminId?: number) => {
  const logLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
  
  apiLogger[logLevel]({
    method,
    url,
    statusCode,
    duration,
    userId,
    adminId,
    timestamp: new Date().toISOString()
  }, `${method} ${url} - ${statusCode} (${duration}ms)`);
};

// Error logging with context
export const logError = (error: Error, context?: any) => {
  logger.error({
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name
    },
    context,
    timestamp: new Date().toISOString()
  }, `Error: ${error.message}`);
};

// Performance logging
export const logPerformance = (operation: string, duration: number, metadata?: any) => {
  logger.info({
    operation,
    duration,
    performance: true,
    ...metadata,
    timestamp: new Date().toISOString()
  }, `Performance: ${operation} took ${duration}ms`);
};

// Health check logging
export const logHealthCheck = (status: 'healthy' | 'unhealthy', checks: any) => {
  const logLevel = status === 'healthy' ? 'info' : 'warn';
  
  logger[logLevel]({
    healthCheck: true,
    status,
    checks,
    timestamp: new Date().toISOString()
  }, `Health check: ${status}`);
};

// Startup logging
export const logStartup = (port: number, environment: string) => {
  logger.info({
    startup: true,
    port,
    environment,
    nodeVersion: process.version,
    timestamp: new Date().toISOString()
  }, `SafraReport server started on port ${port} (${environment})`);
};

// Shutdown logging
export const logShutdown = (reason: string) => {
  logger.info({
    shutdown: true,
    reason,
    timestamp: new Date().toISOString()
  }, `SafraReport server shutting down: ${reason}`);
};

// Main logger is exported as named export 'logger'
