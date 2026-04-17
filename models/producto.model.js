const pool = require('../config/db.config');

const Producto = {
  async getAll() {
    const [rows] = await pool.query(
      'SELECT id, name, price, imageUrl, category, description, inStock FROM productos ORDER BY id ASC'
    );
    return rows.map(row => ({
      ...row,
      inStock: Boolean(row.inStock)
    }));
  },

  async getById(id) {
    const [rows] = await pool.query(
      'SELECT id, name, price, imageUrl, category, description, inStock FROM productos WHERE id = ?',
      [id]
    );
    if (rows.length === 0) return null;
    return { ...rows[0], inStock: Boolean(rows[0].inStock) };
  },

  async getByCategory(category) {
    const [rows] = await pool.query(
      'SELECT id, name, price, imageUrl, category, description, inStock FROM productos WHERE category = ? ORDER BY id ASC',
      [category]
    );
    return rows.map(row => ({ ...row, inStock: Boolean(row.inStock) }));
  },

  async create(producto) {
    const { name, price, imageUrl, category, description, inStock } = producto;
    const [result] = await pool.query(
      'INSERT INTO productos (name, price, imageUrl, category, description, inStock) VALUES (?, ?, ?, ?, ?, ?)',
      [name, price, imageUrl, category, description, inStock ? 1 : 0]
    );
    return { id: result.insertId, ...producto };
  },

  async update(id, producto) {
    const { name, price, imageUrl, category, description, inStock } = producto;
    await pool.query(
      'UPDATE productos SET name = ?, price = ?, imageUrl = ?, category = ?, description = ?, inStock = ? WHERE id = ?',
      [name, price, imageUrl, category, description, inStock ? 1 : 0, id]
    );
    return { id, ...producto };
  },

  async delete(id) {
    const [result] = await pool.query('DELETE FROM productos WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = Producto;
