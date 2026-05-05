const Pedido = require('../models/pedido.model');

const PedidoController = {
  // ─── Flujo antiguo ────────────────────────────────────────────────────────

  async create(req, res) {
    try {
      const { items, ...pedidoData } = req.body;
      const pedido = await Pedido.create(pedidoData);

      if (items && items.length > 0) {
        for (const item of items) {
          await Pedido.createDetalle({
            pedidoId:   pedido.id,
            productoId: item.product.id,
            nombre:     item.product.name,
            precio:     item.product.price,
            cantidad:   item.quantity,
            subtotal:   item.product.price * item.quantity,
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
      if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
      res.json(pedido);
    } catch (error) {
      console.error('Error obteniendo pedido:', error);
      res.status(500).json({ error: 'Error al obtener pedido' });
    }
  },

  async getByOrderNumber(req, res) {
    try {
      const pedido = await Pedido.getByOrderNumber(req.params.orderNumber);
      if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
      res.json(pedido);
    } catch (error) {
      console.error('Error obteniendo pedido:', error);
      res.status(500).json({ error: 'Error al obtener pedido' });
    }
  },

  // ─── Flujo nuevo (usuario autenticado) ────────────────────────────────────

  /**
   * POST /api/pedidos/nuevo  (requiere JWT)
   * Recibe el carrito, dirección, opción de envío y pago.
   */
  async createNew(req, res) {
    try {
      const {
        items,
        shippingAddress,
        shippingOption,
        shippingCost,
        trackingNumber,
        paymentMethod,
        paymentId,
      } = req.body;

      if (!items || items.length === 0) {
        return res.status(400).json({ error: 'El carrito está vacío' });
      }

      // Calcular subtotal y total desde los items
      const subtotal = items.reduce(
        (sum, i) => sum + (i.product?.price ?? i.unitPrice ?? 0) * i.quantity,
        0
      );
      const total = subtotal + (shippingCost ?? 0);

      const pedido = await Pedido.createNew({
        userId: req.userId,
        items,
        subtotal,
        total,
        shippingAddress,
        shippingOption,
        shippingCost,
        trackingNumber,
        paymentMethod,
        paymentId,
      });

      res.status(201).json(pedido);
    } catch (error) {
      console.error('Error creando pedido nuevo:', error);
      res.status(500).json({ error: 'Error al crear pedido' });
    }
  },

  /**
   * GET /api/pedidos/mis-pedidos  (requiere JWT)
   */
  async getMisPedidos(req, res) {
    try {
      const pedidos = await Pedido.getMisPedidos(req.userId);
      res.json(pedidos);
    } catch (error) {
      console.error('Error obteniendo mis pedidos:', error);
      res.status(500).json({ error: 'Error al obtener pedidos' });
    }
  },

  /**
   * GET /api/pedidos/mis-pedidos/:id  (requiere JWT)
   */
  async getMiPedidoById(req, res) {
    try {
      const pedido = await Pedido.getMiPedidoById(
        parseInt(req.params.id),
        req.userId
      );
      if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
      res.json(pedido);
    } catch (error) {
      console.error('Error obteniendo pedido:', error);
      res.status(500).json({ error: 'Error al obtener pedido' });
    }
  },
};

module.exports = PedidoController;
