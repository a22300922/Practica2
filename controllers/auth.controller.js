const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const Usuario = require('../models/usuario.model');

const AuthController = {
  // ─── POST /api/auth/register ─────────────────────────────────────────────
  async register(req, res) {
    try {
      const { fullName, email, password } = req.body;

      if (!fullName || !email || !password) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
      }

      const existing = await Usuario.findByEmail(email.toLowerCase());
      if (existing) {
        return res.status(400).json({ error: 'Este email ya está registrado' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await Usuario.create(fullName, email.toLowerCase(), passwordHash);

      const token = jwt.sign(
        { userId: user.id, isAdmin: false },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        token,
        user: { id: user.id, fullName: user.fullName, email: user.email, isAdmin: false },
      });
    } catch (err) {
      console.error('Error en registro:', err);
      res.status(500).json({ error: 'Error al registrar usuario' });
    }
  },

  // ─── POST /api/auth/login ────────────────────────────────────────────────
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son requeridos' });
      }

      const user = await Usuario.findByEmail(email.toLowerCase());
      if (!user) {
        return res.status(401).json({ error: 'Email o contraseña incorrectos' });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Email o contraseña incorrectos' });
      }

      const isAdmin = Boolean(user.isAdmin);
      const token = jwt.sign(
        { userId: user.id, isAdmin },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: { id: user.id, fullName: user.fullName, email: user.email, isAdmin },
      });
    } catch (err) {
      console.error('Error en login:', err);
      res.status(500).json({ error: 'Error al iniciar sesión' });
    }
  },

  // ─── GET /api/auth/me (protected) ────────────────────────────────────────
  async me(req, res) {
    try {
      const user = await Usuario.findById(req.userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      res.json({ id: user.id, fullName: user.fullName, email: user.email, isAdmin: Boolean(user.isAdmin) });
    } catch (err) {
      console.error('Error en /me:', err);
      res.status(500).json({ error: 'Error al obtener usuario' });
    }
  },
};

module.exports = AuthController;
