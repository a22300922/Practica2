const pool = require('../config/db.config');

const Pedido = {
  async create(pedido) {
    const { orderNumber, nombre, email, telefono, direccion, ciudad, codigoPostal, notas, requiereFactura, rfcCliente, nombreFiscal, regimenFiscal, usoCFDI, domicilioFiscal, formaPago, metodoPago, subtotal, iva, total } = pedido;
    const [result] = await pool.query(
      `INSERT INTO pedidos (orderNumber, nombre, email, telefono, direccion, ciudad, codigoPostal, notas, requiereFactura, rfcCliente, nombreFiscal, regimenFiscal, usoCFDI, domicilioFiscal, formaPago, metodoPago, subtotal, iva, total)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderNumber, nombre, email, telefono, direccion, ciudad, codigoPostal, notas, requiereFactura ? 1 : 0, rfcCliente, nombreFiscal, regimenFiscal, usoCFDI, domicilioFiscal, formaPago, metodoPago, subtotal, iva, total]
    );
    return { id: result.insertId, ...pedido };
  },

  async createDetalle(detalle) {
    const { pedidoId, productoId, nombre, precio, cantidad, subtotal } = detalle;
    const [result] = await pool.query(
      'INSERT INTO pedido_detalle (pedidoId, productoId, nombre, precio, cantidad, subtotal) VALUES (?, ?, ?, ?, ?, ?)',
      [pedidoId, productoId, nombre, precio, cantidad, subtotal]
    );
    return { id: result.insertId, ...detalle };
  },

  async getAll() {
    const [rows] = await pool.query('SELECT * FROM pedidos ORDER BY createdAt DESC');
    return rows;
  },

  async getById(id) {
    const [pedidos] = await pool.query('SELECT * FROM pedidos WHERE id = ?', [id]);
    if (pedidos.length === 0) return null;

    const [detalles] = await pool.query('SELECT * FROM pedido_detalle WHERE pedidoId = ?', [id]);
    return { ...pedidos[0], detalles };
  },

  async getByOrderNumber(orderNumber) {
    const [pedidos] = await pool.query('SELECT * FROM pedidos WHERE orderNumber = ?', [orderNumber]);
    if (pedidos.length === 0) return null;

    const [detalles] = await pool.query('SELECT * FROM pedido_detalle WHERE pedidoId = ?', [pedidos[0].id]);
    return { ...pedidos[0], detalles };
  }
};

module.exports = Pedido;
