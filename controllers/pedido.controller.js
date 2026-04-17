const Pedido = require('../models/pedido.model');

const PedidoController = {
  async create(req, res) {
    try {
      const { items, ...pedidoData } = req.body;

      const pedido = await Pedido.create(pedidoData);

      if (items && items.length > 0) {
        for (const item of items) {
          await Pedido.createDetalle({
            pedidoId: pedido.id,
            productoId: item.product.id,
            nombre: item.product.name,
            precio: item.product.price,
            cantidad: item.quantity,
            subtotal: item.product.price * item.quantity
          });
        }
      }

      res.status(201).json(pedido);
    } catch (error) {
      console.error('Error creando pedido:', error);
      res.status(500).json({ error: 'Error al crear pedido' });
    }
  },

  async getAll(req, res) {
    try {
      const pedidos = await Pedido.getAll();
      res.json(pedidos);
    } catch (error) {
      console.error('Error obteniendo pedidos:', error);
      res.status(500).json({ error: 'Error al obtener pedidos' });
    }
  },

  async getById(req, res) {
    try {
      const pedido = await Pedido.getById(req.params.id);
      if (!pedido) {
        return res.status(404).json({ error: 'Pedido no encontrado' });
      }
      res.json(pedido);
    } catch (error) {
      console.error('Error obteniendo pedido:', error);
      res.status(500).json({ error: 'Error al obtener pedido' });
    }
  },

  async getByOrderNumber(req, res) {
    try {
      const pedido = await Pedido.getByOrderNumber(req.params.orderNumber);
      if (!pedido) {
        return res.status(404).json({ error: 'Pedido no encontrado' });
      }
      res.json(pedido);
    } catch (error) {
      console.error('Error obteniendo pedido:', error);
      res.status(500).json({ error: 'Error al obtener pedido' });
    }
  }
};

module.exports = PedidoController;
