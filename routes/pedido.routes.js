const express    = require('express');
const router     = express.Router();
const PedidoController = require('../controllers/pedido.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// ─── Rutas nuevas (requieren JWT) — deben ir ANTES de /:id ───────────────────
router.post('/nuevo',             verifyToken, PedidoController.createNew);
router.get('/mis-pedidos',        verifyToken, PedidoController.getMisPedidos);
router.get('/mis-pedidos/:id',    verifyToken, PedidoController.getMiPedidoById);

// ─── Rutas antiguas (públicas) ────────────────────────────────────────────────
router.post('/',                  PedidoController.create);
router.get('/',                   PedidoController.getAll);
router.get('/order/:orderNumber', PedidoController.getByOrderNumber);
router.get('/:id',                PedidoController.getById);

module.exports = router;
