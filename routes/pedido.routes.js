const express = require('express');
const router = express.Router();
const PedidoController = require('../controllers/pedido.controller');

router.post('/', PedidoController.create);
router.get('/', PedidoController.getAll);
router.get('/:id', PedidoController.getById);
router.get('/order/:orderNumber', PedidoController.getByOrderNumber);

module.exports = router;
