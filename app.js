process.env.TZ = 'Asia/Kolkata'; // Indian Standard Time


const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { rateLimiter } = require('./middleware/RateLimiter');
const { errorHandler } = require('./middleware/ErrorHandler');
const dotenv = require('dotenv');

const app = express();
dotenv.config()

// Middleware
app.use(cors({
  origin: 'https://causal-funnel-fe.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
// app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/', rateLimiter);
app.use(errorHandler);
app.get("/", (req, res) => {
  res.send("API is running...");
});

module.exports = app;