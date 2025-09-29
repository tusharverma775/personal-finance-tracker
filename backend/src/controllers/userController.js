
const { User } = require('../models');
  
  const getUsers  = async(req, res)=> {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only admin can view users.' });
      }

      const page = parseInt(req.query.page, 10) || 1;
      const perPage = parseInt(req.query.perPage, 10) || 10;
      const offset = (page - 1) * perPage;

      const { rows, count } = await User.findAndCountAll({
        attributes: ['id', 'email', 'role', 'createdAt'],
        limit: perPage,
        offset,
      });

      res.json({
        data: rows,
        meta: { page, perPage, total: count, totalPages: Math.ceil(count / perPage) },
      });
    } catch (err) {
      console.error('getUsers error:', err);
      res.status(500).json({ message: 'Server error fetching users.' });
    }
  }


  const updateUserRole  = async(req, res)=> {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only admin can update roles.' });
      }

      const { id } = req.params;
      const { role } = req.body;
      console.log(role)
      if (!['admin', 'user', 'read-only'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role.' });
      }

      const user = await User.findByPk(id);
      if (!user) return res.status(404).json({ message: 'User not found.' });

      user.role = role;
      await user.save();

      res.json({ data: user });
    } catch (err) {
      console.error('updateUserRole error:', err);
      res.status(500).json({ message: 'Server error updating role.' });
    }
  }

  
  const deleteUser  = async(req, res)=> {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only admin can delete users.' });
      }

      const { id } = req.params;
      const user = await User.findByPk(id);

      if (!user) return res.status(404).json({ message: 'User not found.' });

      await user.destroy();
      res.json({ message: 'User deleted.' });
    } catch (err) {
      console.error('deleteUser error:', err);
      res.status(500).json({ message: 'Server error deleting user.' });
    }
  }



module.exports = {deleteUser,updateUserRole , getUsers};
