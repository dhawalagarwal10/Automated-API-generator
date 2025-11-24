require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// middleware setup
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// serve static files
app.use(express.static(path.join(__dirname, '../public')));

// api routes
app.use('/api', apiRoutes);

// serve generated apis
app.use('/generated', express.static(path.join(__dirname, '../generated')));

// health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// start server
app.listen(PORT, () => {
  console.log(`server running on http://localhost:${PORT}`);
  console.log(`environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
