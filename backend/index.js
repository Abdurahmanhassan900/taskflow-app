require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./src/routes/auth.routes');
const taskRoutes = require('./src/routes/tasks.routes');
const { notFound, errorHandler } = require('./src/middleware/errorHandler');

const app = express();

// --- Security & parsing middleware ---
app.use(helmet());

const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: allowedOrigin, credentials: true }));

app.use(express.json());
app.use(cookieParser());

// Global rate limit: 100 requests / 15 min / IP.
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// --- Routes ---
app.get('/health', (req, res) => res.json({ status: 'ok' }));

const API_PREFIX = '/api/v1';
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/tasks`, taskRoutes);

// --- Error handling (must be last) ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} (API at ${API_PREFIX})`));

module.exports = app;
