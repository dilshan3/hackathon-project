"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const constants_1 = require("@/config/constants");
const errorHandler_1 = require("@/middleware/errorHandler");
const auth_1 = __importDefault(require("@/routes/auth"));
const me_1 = __importDefault(require("@/routes/me"));
const health_1 = __importDefault(require("@/routes/health"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: constants_1.APP_CONFIG.CORS_ORIGIN,
    credentials: true
}));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: constants_1.APP_CONFIG.RATE_LIMIT_WINDOW_MS,
    max: constants_1.APP_CONFIG.RATE_LIMIT_MAX_REQUESTS,
    message: {
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests from this IP, please try again later.'
        }
    }
});
app.use('/api/', limiter);
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, compression_1.default)());
if (constants_1.APP_CONFIG.NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
else {
    app.use((0, morgan_1.default)('combined'));
}
app.use('/healthz', health_1.default);
app.use('/api/auth', auth_1.default);
app.use('/api/me', me_1.default);
app.use('*', errorHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
const PORT = constants_1.APP_CONFIG.PORT;
app.listen(PORT, () => {
    console.log(`🚀 ReadLoop Backend Server running on port ${PORT}`);
    console.log(`📊 Environment: ${constants_1.APP_CONFIG.NODE_ENV}`);
    console.log(`🔗 CORS Origin: ${constants_1.APP_CONFIG.CORS_ORIGIN}`);
    console.log(`⏰ Rate Limit: ${constants_1.APP_CONFIG.RATE_LIMIT_MAX_REQUESTS} requests per ${constants_1.APP_CONFIG.RATE_LIMIT_WINDOW_MS / 1000 / 60} minutes`);
});
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});
exports.default = app;
//# sourceMappingURL=index.js.map