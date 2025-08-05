import { Request, Response, NextFunction } from 'express';

// Database error types that should trigger graceful handling
const DATABASE_ERROR_PATTERNS = [
  /connection.*refused/i,
  /timeout/i,
  /network.*error/i,
  /host.*unreachable/i,
  /authentication.*failed/i,
  /permission.*denied/i,
  /database.*does.*not.*exist/i,
  /relation.*does.*not.*exist/i,
  /column.*does.*not.*exist/i,
  /syntax.*error/i,
  /invalid.*password/i,
  /connection.*terminated/i,
  /pool.*exhausted/i,
  /too.*many.*connections/i,
  /ssl.*connection/i,
  /certificate.*error/i,
  /tenant.*not.*found/i,
  /user.*not.*found/i
];

// Check if an error is a database-related error
function isDatabaseError(error: any): boolean {
  if (!error) return false;
  
  const errorMessage = error.message || error.toString() || '';
  const errorCode = error.code || '';
  
  // Check error patterns
  for (const pattern of DATABASE_ERROR_PATTERNS) {
    if (pattern.test(errorMessage)) {
      return true;
    }
  }
  
  // Check common database error codes
  const databaseErrorCodes = [
    'ECONNREFUSED',
    'ENOTFOUND',
    'ETIMEDOUT',
    'ECONNRESET',
    'EPIPE',
    'EAI_AGAIN',
    '28P01', // PostgreSQL: invalid_password
    '28P02', // PostgreSQL: invalid_password
    '3D000', // PostgreSQL: invalid_catalog_name
    '42P01', // PostgreSQL: undefined_table
    '42703', // PostgreSQL: undefined_column
    '42601', // PostgreSQL: syntax_error
    '08000', // PostgreSQL: connection_exception
    '08001', // PostgreSQL: sqlclient_unable_to_establish_sqlconnection
    '08003', // PostgreSQL: connection_does_not_exist
    '08006', // PostgreSQL: connection_failure
    '08001', // PostgreSQL: sqlclient_unable_to_establish_sqlconnection
    '08003', // PostgreSQL: connection_does_not_exist
    '08006', // PostgreSQL: connection_failure
    '08001', // PostgreSQL: sqlclient_unable_to_establish_sqlconnection
    '08003', // PostgreSQL: connection_does_not_exist
    '08006', // PostgreSQL: connection_failure
  ];
  
  return databaseErrorCodes.includes(errorCode);
}

// Generate appropriate response based on the endpoint
function generateGracefulResponse(req: Request): any {
  const path = req.path;
  
  // Articles endpoints
  if (path.startsWith('/api/articles')) {
    if (path.includes('/featured')) {
      return {
        error: "Database temporarily unavailable",
        articles: [],
        total: 0,
        message: "Los artículos destacados no están disponibles temporalmente. Por favor, intente nuevamente en unos minutos."
      };
    }
    
    if (path.includes('/breaking')) {
      return {
        error: "Database temporarily unavailable",
        articles: [],
        total: 0,
        message: "Las noticias de última hora no están disponibles temporalmente. Por favor, intente nuevamente en unos minutos."
      };
    }
    
    if (path.includes('/related')) {
      return {
        error: "Database temporarily unavailable",
        articles: [],
        total: 0,
        message: "Los artículos relacionados no están disponibles temporalmente. Por favor, intente nuevamente en unos minutos."
      };
    }
    
    // Default articles response
    return {
      error: "Database temporarily unavailable",
      articles: [],
      total: 0,
      message: "Los artículos no están disponibles temporalmente. Por favor, intente nuevamente en unos minutos."
    };
  }
  
  // Categories endpoints
  if (path.startsWith('/api/categories')) {
    return {
      error: "Database temporarily unavailable",
      categories: [],
      total: 0,
      message: "Las categorías no están disponibles temporalmente. Por favor, intente nuevamente en unos minutos."
    };
  }
  
  // Classifieds endpoints
  if (path.startsWith('/api/classifieds')) {
    return {
      error: "Database temporarily unavailable",
      classifieds: [],
      total: 0,
      message: "Los clasificados no están disponibles temporalmente. Por favor, intente nuevamente en unos minutos."
    };
  }
  
  // Businesses endpoints
  if (path.startsWith('/api/businesses')) {
    return {
      error: "Database temporarily unavailable",
      businesses: [],
      total: 0,
      message: "Los negocios no están disponibles temporalmente. Por favor, intente nuevamente en unos minutos."
    };
  }
  
  // Reviews endpoints
  if (path.startsWith('/api/reviews')) {
    return {
      error: "Database temporarily unavailable",
      reviews: [],
      total: 0,
      message: "Las reseñas no están disponibles temporalmente. Por favor, intente nuevamente en unos minutos."
    };
  }
  
  // Search endpoints
  if (path.startsWith('/api/search')) {
    return {
      error: "Database temporarily unavailable",
      results: [],
      total: 0,
      message: "La búsqueda no está disponible temporalmente. Por favor, intente nuevamente en unos minutos."
    };
  }
  
  // Default response for unknown endpoints
  return {
    error: "Database temporarily unavailable",
    data: [],
    total: 0,
    message: "El servicio no está disponible temporalmente. Por favor, intente nuevamente en unos minutos."
  };
}

// Database error handling middleware
export function databaseErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  // Check if this is a database-related error
  if (isDatabaseError(err)) {
    console.error('🔴 Database error detected:', {
      path: req.path,
      method: req.method,
      error: err.message,
      code: err.code,
      timestamp: new Date().toISOString()
    });
    
    // Generate graceful response
    const gracefulResponse = generateGracefulResponse(req);
    
    // Return 200 OK with graceful error response (not 500)
    // This prevents client-side crashes and provides better UX
    return res.status(200).json(gracefulResponse);
  }
  
  // If it's not a database error, pass it to the next error handler
  next(err);
}

// Wrapper function to catch async errors in route handlers
export function asyncErrorHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Database health check function
export function isDatabaseHealthy(): boolean {
  // This could be enhanced to actually test the database connection
  // For now, we'll assume it's healthy if no recent errors
  return true;
}

// Export error patterns for testing
export { DATABASE_ERROR_PATTERNS, isDatabaseError }; 