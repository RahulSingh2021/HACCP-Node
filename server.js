const express = require('express');
require('dotenv').config();

const authRoutes = require('./src/routes/auth');

const app = express();

/**
 * ✅ Body parsers (MOST IMPORTANT)
 * Ye dono hone chahiye warna req.body undefined aayega
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * ✅ Routes
 */
app.use('/api/auth', authRoutes);

/**
 * ✅ Health check / base route
 */
app.get('/', (req, res) => {
  res.status(200).send('JWT MySQL Auth API Running');
});

/**
 * ✅ Global error handler (crash prevent)
 */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal Server Error'
  });
});

/**
 * ✅ Server start
 */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});