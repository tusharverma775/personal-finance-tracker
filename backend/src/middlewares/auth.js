const { verifyToken } = require('../utils/jwt');
const { User } = require('../models');

module.exports = async function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    const user = await User.findByPk(decoded.id, { attributes: ['id', 'email', 'role', 'name'] });
    if (!user) return res.status(401).json({ message: 'Invalid token' });

    req.user = user; // Attach user to request
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token', error: err.message });
  }
};
