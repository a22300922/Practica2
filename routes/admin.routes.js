const express    = require('express');
const router     = express.Router();
const pool       = require('../config/db.config');
const Producto   = require('../models/producto.model');
const Pedido     = require('../models/pedido.model');
const Usuario    = require('../models/usuario.model');
const { verifyToken }    = require('../middleware/auth.middleware');
const { adminMiddleware } = require('../middleware/admin.middleware');

// Todas las rutas admin requieren JWT válido + isAdmin
router.use(verifyToken, adminMiddleware);

// ─── USUARIOS ────────────────────────────────────────────────────────────────
router.get('/usuarios', async (req, res) => {
  try {
    const users = await Usuario.getAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// ─── PRODUCTOS ───────────────────────────────────────────────────────────────
router.get('/productos', async (req, res) => {
  try { res.json(await Producto.getAll()); }
  catch { res.status(500).json({ error: 'Error al obtener productos' }); }
});

router.post('/productos', async (req, res) => {
  try {
    const p = await Producto.create(req.body);
    res.status(201).json(p);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

router.put('/productos/:id', async (req, res) => {
  try {
    const existing = await Producto.getById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Producto no encontrado' });
    const p = await Producto.update(req.params.id, req.body);
    res.json(p);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

router.delete('/productos/:id', async (req, res) => {
  try {
    const deleted = await Producto.delete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ message: 'Producto eliminado' });
  } catch {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

// ─── PEDIDOS ─────────────────────────────────────────────────────────────────
router.get('/pedidos', async (req, res) => {
  try {
    const [pedidos] = await pool.query(
      'SELECT * FROM pedidos WHERE userId IS NOT NULL ORDER BY createdAt DESC'
    );
    const pedidoIds = pedidos.map(p => p.id);
    if (pedidoIds.length === 0) return res.json([]);

    const [detalles] = await pool.query(
      `SELECT * FROM pedido_detalle WHERE pedidoId IN (${pedidoIds.map(() => '?').join(',')})`,
      pedidoIds
    );

    const result = pedidos.map(p => {
      const items = detalles.filter(d => d.pedidoId === p.id);
      return Pedido._mapToAngularOrder(p, items);
    });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
});

router.put('/pedidos/:id/status', async (req, res) => {
  try {
    const { orderStatus, shippingStatus } = req.body;
    const fields = [];
    const values = [];

    if (orderStatus)   { fields.push('orderStatus = ?');   values.push(orderStatus); }
    if (shippingStatus){ fields.push('shippingStatus = ?'); values.push(shippingStatus); }

    if (fields.length === 0) return res.status(400).json({ error: 'Nada que actualizar' });

    values.push(req.params.id);
    await pool.query(`UPDATE pedidos SET ${fields.join(', ')} WHERE id = ?`, values);

    const [rows] = await pool.query('SELECT * FROM pedidos WHERE id = ?', [req.params.id]);
    const [detalles] = await pool.query('SELECT * FROM pedido_detalle WHERE pedidoId = ?', [req.params.id]);
    res.json(Pedido._mapToAngularOrder(rows[0], detalles));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
});

module.exports = router;
