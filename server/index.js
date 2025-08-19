/**
 * GCRC Backend Server
 * Express.js API server for Global Climate Risk Center
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

// Import routes
const alertsRouter = require('./routes/alerts');
const datasetsRouter = require('./routes/datasets');
const submitRouter = require('./routes/submit');
const partnersRouter = require('./routes/partners');
const systemRouter = require('./routes/system');

// Import services
const { initializeDatabase } = require('./services/db');
const { initializeBlockchain } = require('./services/chain');

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "ws:", "wss:"]
        }
    }
}));

// CORS configuration
const corsOptions = {
    origin: process.env.CORS_ORIGIN || [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://gcrc-dashboard.vercel.app'
    ],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Compression middleware
app.use(compression());

// Logging middleware
if (NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: NODE_ENV,
        uptime: process.uptime()
    });
});

// API routes
app.use('/api/alerts', alertsRouter);
app.use('/api/datasets', datasetsRouter);
app.use('/api/submit', submitRouter);
app.use('/api/partners', partnersRouter);
app.use('/api/system', systemRouter);

// Root API endpoint
app.get('/api', (req, res) => {
    res.json({
        name: 'GCRC API',
        version: '1.0.0',
        description: 'Global Climate Risk Center API',
        endpoints: {
            alerts: '/api/alerts',
            datasets: '/api/datasets',
            submit: '/api/submit',
            partners: '/api/partners',
            system: '/api/system'
        },
        documentation: '/api/docs',
        status: 'operational'
    });
});

// API documentation endpoint
app.get('/api/docs', (req, res) => {
    res.json({
        openapi: '3.0.0',
        info: {
            title: 'GCRC API',
            version: '1.0.0',
            description: 'Global Climate Risk Center API Documentation'
        },
        servers: [
            {
                url: `http://localhost:${PORT}/api`,
                description: 'Development server'
            }
        ],
        paths: {
            '/alerts': {
                get: {
                    summary: 'Get climate alerts',
                    parameters: [
                        {
                            name: 'limit',
                            in: 'query',
                            schema: { type: 'integer', default: 10 }
                        },
                        {
                            name: 'severity',
                            in: 'query',
                            schema: { type: 'string', enum: ['critical', 'warning', 'info'] }
                        }
                    ],
                    responses: {
                        200: {
                            description: 'List of alerts',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean' },
                                            data: {
                                                type: 'array',
                                                items: {
                                                    type: 'object',
                                                    properties: {
                                                        id: { type: 'integer' },
                                                        message: { type: 'string' },
                                                        severity: { type: 'string' },
                                                        timestamp: { type: 'string' },
                                                        region: { type: 'string' }
                                                    }
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
            '/datasets': {
                get: {
                    summary: 'Get climate datasets',
                    parameters: [
                        {
                            name: 'country',
                            in: 'query',
                            schema: { type: 'string' }
                        },
                        {
                            name: 'variable',
                            in: 'query',
                            schema: { type: 'string' }
                        },
                        {
                            name: 'startDate',
                            in: 'query',
                            schema: { type: 'string', format: 'date' }
                        },
                        {
                            name: 'endDate',
                            in: 'query',
                            schema: { type: 'string', format: 'date' }
                        }
                    ]
                }
            },
            '/submit': {
                post: {
                    summary: 'Submit climate data',
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        location: {
                                            type: 'object',
                                            properties: {
                                                lat: { type: 'number' },
                                                lng: { type: 'number' }
                                            }
                                        },
                                        measurements: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    variable: { type: 'string' },
                                                    value: { type: 'number' },
                                                    unit: { type: 'string' },
                                                    timestamp: { type: 'string' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    // Default error
    let error = {
        message: 'Internal Server Error',
        status: 500
    };
    
    // Handle specific error types
    if (err.name === 'ValidationError') {
        error.message = 'Validation Error';
        error.status = 400;
        error.details = err.details;
    } else if (err.name === 'UnauthorizedError') {
        error.message = 'Unauthorized';
        error.status = 401;
    } else if (err.name === 'CastError') {
        error.message = 'Invalid ID format';
        error.status = 400;
    }
    
    // Send error response
    res.status(error.status).json({
        success: false,
        error: {
            message: error.message,
            ...(NODE_ENV === 'development' && { stack: err.stack }),
            ...(error.details && { details: error.details })
        }
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: {
            message: 'Endpoint not found',
            path: req.originalUrl
        }
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Process terminated');
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    server.close(() => {
        console.log('Process terminated');
    });
});

// Initialize services and start server
async function startServer() {
    try {
        console.log('🚀 GCRC Server 시작 중...');
        
        // Initialize database
        if (process.env.MONGODB_URI) {
            await initializeDatabase();
            console.log('✅ 데이터베이스 연결 성공');
        } else {
            console.log('⚠️  MongoDB URI 없음 - Mock 모드로 실행');
        }
        
        // Initialize blockchain connection
        if (process.env.BLOCKCHAIN_RPC_URL) {
            await initializeBlockchain();
            console.log('✅ 블록체인 연결 성공');
        } else {
            console.log('⚠️  블록체인 RPC URL 없음 - Mock 모드로 실행');
        }
        
        // Start server
        const server = app.listen(PORT, () => {
            console.log(`🌍 GCRC Server running on port ${PORT}`);
            console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
            console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
            console.log(`🌐 Environment: ${NODE_ENV}`);
        });
        
        return server;
        
    } catch (error) {
        console.error('❌ 서버 시작 실패:', error);
        process.exit(1);
    }
}

// Export app for testing
module.exports = app;

// Start server if not in test environment
if (require.main === module) {
    startServer();
}