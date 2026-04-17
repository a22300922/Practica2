const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const productoRoutes = require('./routes/producto.routes');
const pedidoRoutes = require('./routes/pedido.routes');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/productos', productoRoutes);
app.use('/api/pedidos', pedidoRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Natureza API running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend API server running on http://localhost:${PORT}`);
});

module.exports = app;
