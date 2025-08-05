import { Request, Response } from 'express';

/**
 * Generate OpenAPI specification for API documentation
 */
export function generateOpenAPISpec(req: Request, res: Response) {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  
  const openAPISpec = {
    openapi: '3.0.0',
    info: {
      title: 'Safra Report API',
      description: 'API for Safra Report - Dominican Republic news and business directory',
      version: '1.0.0',
      contact: {
        name: 'Safra Report',
        email: 'info@safrareport.com',
        url: baseUrl
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: baseUrl,
        description: 'Production server'
      },
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      }
    ],
    paths: {
      '/api/health': {
        get: {
          summary: 'Health check',
          description: 'Check API health status',
          tags: ['System'],
          responses: {
            '200': {
              description: 'API is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string' },
                      timestamp: { type: 'string', format: 'date-time' },
                      uptime: { type: 'number' },
                      memory: { type: 'number' },
                      dominican: {
                        type: 'object',
                        properties: {
                          currency: { type: 'string' },
                          mobile_optimized: { type: 'boolean' },
                          network: { type: 'string' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/articles': {
        get: {
          summary: 'Get articles',
          description: 'Retrieve paginated list of articles',
          tags: ['Articles'],
          parameters: [
            {
              name: 'limit',
              in: 'query',
              description: 'Number of articles to return',
              schema: { type: 'integer', default: 20, minimum: 1, maximum: 100 }
            },
            {
              name: 'offset',
              in: 'query',
              description: 'Number of articles to skip',
              schema: { type: 'integer', default: 0, minimum: 0 }
            },
            {
              name: 'category',
              in: 'query',
              description: 'Filter by category slug',
              schema: { type: 'string' }
            }
          ],
          responses: {
            '200': {
              description: 'List of articles',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Article'
                    }
                  }
                }
              }
            },
            '500': {
              description: 'Internal server error'
            }
          }
        }
      },
      '/api/articles/{slug}': {
        get: {
          summary: 'Get article by slug',
          description: 'Retrieve a specific article by its slug',
          tags: ['Articles'],
          parameters: [
            {
              name: 'slug',
              in: 'path',
              required: true,
              description: 'Article slug',
              schema: { type: 'string' }
            }
          ],
          responses: {
            '200': {
              description: 'Article found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Article'
                  }
                }
              }
            },
            '404': {
              description: 'Article not found'
            }
          }
        }
      },
      '/api/articles/featured': {
        get: {
          summary: 'Get featured articles',
          description: 'Retrieve featured articles',
          tags: ['Articles'],
          parameters: [
            {
              name: 'limit',
              in: 'query',
              description: 'Number of featured articles to return',
              schema: { type: 'integer', default: 5, minimum: 1, maximum: 20 }
            }
          ],
          responses: {
            '200': {
              description: 'List of featured articles',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Article'
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/articles/breaking': {
        get: {
          summary: 'Get breaking news',
          description: 'Retrieve breaking news articles',
          tags: ['Articles'],
          responses: {
            '200': {
              description: 'List of breaking news articles',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Article'
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/businesses': {
        get: {
          summary: 'Get businesses',
          description: 'Retrieve paginated list of businesses',
          tags: ['Businesses'],
          parameters: [
            {
              name: 'limit',
              in: 'query',
              description: 'Number of businesses to return',
              schema: { type: 'integer', default: 20, minimum: 1, maximum: 100 }
            },
            {
              name: 'offset',
              in: 'query',
              description: 'Number of businesses to skip',
              schema: { type: 'integer', default: 0, minimum: 0 }
            },
            {
              name: 'category',
              in: 'query',
              description: 'Filter by category slug',
              schema: { type: 'string' }
            },
            {
              name: 'province',
              in: 'query',
              description: 'Filter by province ID',
              schema: { type: 'integer' }
            }
          ],
          responses: {
            '200': {
              description: 'List of businesses',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Business'
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/classifieds': {
        get: {
          summary: 'Get classifieds',
          description: 'Retrieve paginated list of classifieds',
          tags: ['Classifieds'],
          parameters: [
            {
              name: 'limit',
              in: 'query',
              description: 'Number of classifieds to return',
              schema: { type: 'integer', default: 20, minimum: 1, maximum: 100 }
            },
            {
              name: 'offset',
              in: 'query',
              description: 'Number of classifieds to skip',
              schema: { type: 'integer', default: 0, minimum: 0 }
            },
            {
              name: 'category',
              in: 'query',
              description: 'Filter by category slug',
              schema: { type: 'string' }
            },
            {
              name: 'province',
              in: 'query',
              description: 'Filter by province ID',
              schema: { type: 'integer' }
            }
          ],
          responses: {
            '200': {
              description: 'List of classifieds',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Classified'
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/fuel-prices': {
        get: {
          summary: 'Get fuel prices',
          description: 'Retrieve current fuel prices in Dominican Republic',
          tags: ['Real-time Data'],
          responses: {
            '200': {
              description: 'Current fuel prices',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      gasolina95: { type: 'number' },
                      gasolinaRegular: { type: 'number' },
                      gasoil: { type: 'number' },
                      glp: { type: 'number' },
                      lastUpdated: { type: 'string', format: 'date-time' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/exchange-rates': {
        get: {
          summary: 'Get exchange rates',
          description: 'Retrieve current exchange rates',
          tags: ['Real-time Data'],
          responses: {
            '200': {
              description: 'Current exchange rates',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      usd: {
                        type: 'object',
                        properties: {
                          rate: { type: 'number' },
                          trend: { type: 'string', enum: ['up', 'down'] },
                          change: { type: 'string' }
                        }
                      },
                      eur: {
                        type: 'object',
                        properties: {
                          rate: { type: 'number' },
                          trend: { type: 'string', enum: ['up', 'down'] },
                          change: { type: 'string' }
                        }
                      },
                      lastUpdated: { type: 'string', format: 'date-time' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/weather': {
        get: {
          summary: 'Get weather data',
          description: 'Retrieve current weather information',
          tags: ['Real-time Data'],
          responses: {
            '200': {
              description: 'Current weather data',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      temp: { type: 'number' },
                      feelsLike: { type: 'number' },
                      condition: { type: 'string' },
                      humidity: { type: 'number' },
                      wind: { type: 'number' },
                      location: { type: 'string' },
                      description: { type: 'string' },
                      uv: { type: 'number' },
                      pressure: { type: 'number' },
                      lastUpdated: { type: 'string', format: 'date-time' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/sitemap.xml': {
        get: {
          summary: 'Get sitemap',
          description: 'Retrieve XML sitemap for search engines',
          tags: ['SEO'],
          responses: {
            '200': {
              description: 'XML sitemap',
              content: {
                'application/xml': {
                  schema: { type: 'string' }
                }
              }
            }
          }
        }
      },
      '/feed.xml': {
        get: {
          summary: 'Get RSS feed',
          description: 'Retrieve RSS feed of latest articles',
          tags: ['SEO'],
          responses: {
            '200': {
              description: 'RSS feed',
              content: {
                'application/rss+xml': {
                  schema: { type: 'string' }
                }
              }
            }
          }
        }
      },
      '/robots.txt': {
        get: {
          summary: 'Get robots.txt',
          description: 'Retrieve robots.txt for search engines',
          tags: ['SEO'],
          responses: {
            '200': {
              description: 'Robots.txt content',
              content: {
                'text/plain': {
                  schema: { type: 'string' }
                }
              }
            }
          }
        }
      }
    },
    components: {
      schemas: {
        Article: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            title: { type: 'string' },
            slug: { type: 'string' },
            content: { type: 'string' },
            excerpt: { type: 'string' },
            imageUrl: { type: 'string' },
            publishedAt: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            views: { type: 'integer' },
            likes: { type: 'integer' },
            category: {
              $ref: '#/components/schemas/Category'
            },
            author: {
              $ref: '#/components/schemas/Author'
            }
          }
        },
        Business: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            slug: { type: 'string' },
            description: { type: 'string' },
            address: { type: 'string' },
            city: { type: 'string' },
            phone: { type: 'string' },
            email: { type: 'string' },
            website: { type: 'string' },
            logoUrl: { type: 'string' },
            hours: { type: 'string' },
            priceRange: { type: 'string' },
            latitude: { type: 'number' },
            longitude: { type: 'number' },
            category: {
              $ref: '#/components/schemas/BusinessCategory'
            },
            province: {
              $ref: '#/components/schemas/Province'
            }
          }
        },
        Classified: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            title: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            condition: { type: 'string' },
            images: {
              type: 'array',
              items: { type: 'string' }
            },
            contactInfo: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            category: {
              $ref: '#/components/schemas/ClassifiedCategory'
            },
            province: {
              $ref: '#/components/schemas/Province'
            },
            user: {
              $ref: '#/components/schemas/User'
            }
          }
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            slug: { type: 'string' },
            description: { type: 'string' }
          }
        },
        BusinessCategory: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            slug: { type: 'string' },
            description: { type: 'string' }
          }
        },
        ClassifiedCategory: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            slug: { type: 'string' },
            description: { type: 'string' }
          }
        },
        Author: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            email: { type: 'string' },
            bio: { type: 'string' }
          }
        },
        Province: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            code: { type: 'string' }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    tags: [
      {
        name: 'Articles',
        description: 'Article and news management'
      },
      {
        name: 'Businesses',
        description: 'Business directory management'
      },
      {
        name: 'Classifieds',
        description: 'Classified ads management'
      },
      {
        name: 'Real-time Data',
        description: 'Real-time data endpoints'
      },
      {
        name: 'SEO',
        description: 'Search engine optimization endpoints'
      },
      {
        name: 'System',
        description: 'System and health check endpoints'
      }
    ]
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
  res.json(openAPISpec);
} 