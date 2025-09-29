
const { Op, fn, col, literal, where } = require('sequelize');
const { Transaction, Category,  } = require('../models'); 
const redis = require('../utils/redis'); 
const CACHE_KEYS = {
  USER_ANALYTICS_PREFIX: (userId) => `analytics:user:${userId}`,
  CATEGORIES: 'categories:list',
};


function canModifyTransactions(user) {

  return user && (user.role === 'admin' || user.role === 'user');
}


function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const perPage = Math.min(200, Math.max(5, parseInt(query.perPage, 10) || 10)); // limit perPage to avoid heavy queries
  const offset = (page - 1) * perPage;
  return { page, perPage, offset };
}


function buildTransactionFilter({ q, categoryId, type, dateFrom, dateTo, minAmount, maxAmount, userId, isAdmin }) {
  const whereClause = {};


  if (!isAdmin) whereClause.userId = userId;

  if (type) whereClause.type = type;

  if (categoryId) whereClause.categoryId = categoryId;

  if (minAmount || maxAmount) {
    whereClause.amount = {};
    if (minAmount) whereClause.amount[Op.gte] = parseFloat(minAmount);
    if (maxAmount) whereClause.amount[Op.lte] = parseFloat(maxAmount);
  }

  if (dateFrom || dateTo) {
    whereClause.date = {};
    if (dateFrom) whereClause.date[Op.gte] = new Date(dateFrom);
    if (dateTo) whereClause.date[Op.lte] = new Date(dateTo);
  }

  if (q) {

    whereClause[Op.or] = [
      { description: { [Op.iLike]: `%${q}%` } },
      { notes: { [Op.iLike]: `%${q}%` } },
    ];
  }

  return whereClause;
}


  
  const createTransaction  = async (req, res)=> {
    try {
      const user = req.user;
      if (!canModifyTransactions(user)) {
        return res.status(403).json({ message: 'Insufficient permissions to create transactions.' });
      }

      const { amount, type, categoryId, description, date, notes } = req.body;

 
      if (!amount || !type) {
        return res.status(400).json({ message: 'amount and type are required.' });
      }
      if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({ message: "type must be 'income' or 'expense'." });
      }

      if (!date || isNaN(new Date(date).getTime())) {
  return res.status(404).json({ message: "Please provide date in correct format (YYYY-MM-DD)" });
}


      if (categoryId) {
        const category = await Category.findByPk(categoryId);
        if (!category) return res.status(400).json({ message: 'Invalid categoryId.' });
      }


      const transaction = await Transaction.create({
        userId: user.id,
        amount,
        type,
        categoryId: categoryId || null,
        description: description || null,
        notes: notes || null,
        date: date ? new Date(date) : new Date(),
      });

      await Promise.all([
        redis.deleteCache(CACHE_KEYS.USER_ANALYTICS_PREFIX(user.id)).catch(() => {}),
      ]);

      return res.status(201).json({ data: transaction });
    } catch (err) {
      console.error('createTransaction error:', err);
      return res.status(500).json({ message: 'Server error creating transaction.' });
    }
  }


  const getTransactions = async (req, res)=> {
    try {
      const user = req.user || {};
      const isAdmin = user.role === 'admin';
      const {
        q,
        categoryId,
        type,
        dateFrom,
        dateTo,
        minAmount,
        maxAmount,
        sortBy = 'date',
        sortDir = 'DESC',
      } = req.query;

      const { page, perPage, offset } = parsePagination(req.query);

      const whereClause = buildTransactionFilter({
        q,
        categoryId,
        type,
        dateFrom,
        dateTo,
        minAmount,
        maxAmount,
        userId: user.id,
        isAdmin,
      });

      const allowedSort = ['date', 'amount', 'createdAt'];
      const orderCol = allowedSort.includes(sortBy) ? sortBy : 'date';

      const { rows, count } = await Transaction.findAndCountAll({
        where: whereClause,
        include: [
          { model: Category, as: 'Category', attributes: ['id', 'name'] },
        ],
        order: [[orderCol, sortDir.toUpperCase() === 'ASC' ? 'ASC' : 'DESC']],
        limit: perPage,
        offset,
      });

      const totalPages = Math.ceil(count / perPage);

      return res.json({
        data: rows,
        meta: {
          page,
          perPage,
          total: count,
          totalPages,
        },
      });
    } catch (err) {
      console.error('getTransactions error:', err);
      return res.status(500).json({ message: 'Server error fetching transactions.' });
    }
  }

 
const getTransactionById =   async (req, res)=> {
    try {
      const user = req.user || {};
      const isAdmin = user.role === 'admin';
      const id = req.params.id;

      const transaction = await Transaction.findByPk(id, {
        include: [{ model: Category, as: 'Category', attributes: ['id', 'name'] }],
      });

      if (!transaction) return res.status(404).json({ message: 'Transaction not found.' });


      if (!isAdmin && transaction.userId !== user.id) {
        return res.status(403).json({ message: 'Not authorized to view this transaction.' });
      }

      return res.json({ data: transaction });
    } catch (err) {
      console.error('getTransactionById error:', err);
      return res.status(500).json({ message: 'Server error fetching transaction.' });
    }
  }





  const updateTransaction  =  async (req, res) =>{
    try {
      const user = req.user;
      if (!canModifyTransactions(user)) {
        return res.status(403).json({ message: 'Insufficient permissions to update transactions.' });
      }

      const id = req.params.id;
      const transaction = await Transaction.findByPk(id);

      if (!transaction) return res.status(404).json({ message: 'Transaction not found.' });

     
      if (user.role !== 'admin' && transaction.userId !== user.id) {
        return res.status(403).json({ message: 'Not authorized to update this transaction.' });
      }

      const { amount, type, categoryId, description, date, notes } = req.body;

      if (type && !['income', 'expense'].includes(type)) {
        return res.status(400).json({ message: "type must be 'income' or 'expense'." });
      }

      if (categoryId) {
        const category = await Category.findByPk(categoryId);
        if (!category) return res.status(400).json({ message: 'Invalid categoryId.' });
      }

      transaction.amount = amount !== undefined ? amount : transaction.amount;
      transaction.type = type || transaction.type;
      transaction.categoryId = categoryId !== undefined ? categoryId : transaction.categoryId;
      transaction.description = description !== undefined ? description : transaction.description;
      transaction.notes = notes !== undefined ? notes : transaction.notes;
      transaction.date = date ? new Date(date) : transaction.date;

      await transaction.save();

      await redis.deleteCache(CACHE_KEYS.USER_ANALYTICS_PREFIX(transaction.userId)).catch(() => {});

      return res.json({ data: transaction });
    } catch (err) {
      console.error('updateTransaction error:', err);
      return res.status(500).json({ message: 'Server error updating transaction.' });
    }
  }

  const deleteTransaction  = async (req, res)=> {
    try {
      const user = req.user;
      if (!canModifyTransactions(user)) {
        return res.status(403).json({ message: 'Insufficient permissions to delete transactions.' });
      }

      const id = req.params.id;
      const transaction = await Transaction.findByPk(id);

      if (!transaction) return res.status(404).json({ message: 'Transaction not found.' });

      if (user.role !== 'admin' && transaction.userId !== user.id) {
        return res.status(403).json({ message: 'Not authorized to delete this transaction.' });
      }

      await transaction.destroy();

    
      await redis.deleteCache(CACHE_KEYS.USER_ANALYTICS_PREFIX(transaction.userId)).catch((err) => {console.log(err)});

      return res.json({ message: 'Transaction deleted.' });
    } catch (err) {
      console.error('deleteTransaction error:', err);
      return res.status(500).json({ message: 'Server error deleting transaction.' });
    }
  }
  /**
   * GET /api/transactions/stats
   * Simple aggregated stats for a user's dashboard (month totals, category breakdown)
   * Cached by the caller layer or by this method using Redis.
   *
   * Cache behavior:
   * - Key: analytics:user:<userId>
   * - TTL: 15 minutes (900s) as per requirements
   *
   * Returns:
   * {
   *   monthTotals: [{ month: '2025-09', income: 1000, expense: 700 }, ...],
   *   categoryBreakdown: [{ categoryId, categoryName, totalExpense }, ...],
   *   incomeVsExpense: [{ date, income, expense }, ...]
   * }
   */


   
  const getTransactionStats  = async (req, res)=> {
    try {
      const user = req.user || {};
      const isAdmin = user.role === 'admin';
      const targetUserId = isAdmin && req.query.userId ? parseInt(req.query.userId, 10) : user.id;

      if (!targetUserId) return res.status(400).json({ message: 'userId not available.' });

      const cacheKey = CACHE_KEYS.USER_ANALYTICS_PREFIX(targetUserId);
      // Try cache
      try {
        const cached = await redis.getCache(cacheKey);
        if (cached) {
          return res.json({ data: JSON.parse(cached), cached: true });
        }
      } catch (cacheErr) {
        console.warn('Redis GET failed:', cacheErr);
        // fallthrough to compute
      }
console.log("1");

      // Stats computation - make queries in transactions where possible for consistent snapshot
      // 1) monthly totals (last 12 months)
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
      twelveMonthsAgo.setDate(1); // start of month
console.log("2");

      // Use raw query or sequelize fn to group by year-month
      const monthTotals = await Transaction.findAll({
        attributes: [
          [fn('to_char', col('date'), 'YYYY-MM'), 'month'],
          [fn('SUM', literal(`CASE WHEN type = 'income' THEN amount ELSE 0 END`)), 'income'],
          [fn('SUM', literal(`CASE WHEN type = 'expense' THEN amount ELSE 0 END`)), 'expense'],
        ],
        where: {
          userId: targetUserId,
          date: { [Op.gte]: twelveMonthsAgo },
        },
        group: [literal(`to_char("date", 'YYYY-MM')`)],
        order: [[literal(`to_char("date", 'YYYY-MM')`), 'ASC']],
        raw: true,
      });
console.log("3");

      // 2) category breakdown (expenses only)
      const categoryBreakdown = await Transaction.findAll({
        attributes: [
          'categoryId',
          [fn('SUM', literal(`CASE WHEN type = 'expense' THEN amount ELSE 0 END`)), 'totalExpense'],
        ],
        where: { userId: targetUserId },
        group: ['categoryId',  'Category.id', 'Category.name'],
        include: [{ model: Category, as: 'Category', attributes: ['id', 'name'] }],
        raw: true,
        nest: true,
      });
console.log("4");

      const payload = {
        monthTotals,
        categoryBreakdown,
      };
console.log("5");

      // Cache result for 15 minutes
      try {
        await redis.setCache(cacheKey,  JSON.stringify(payload),900);
      } catch (cacheErr) {
        console.warn('Redis SETEX failed:', cacheErr);
      }
console.log("6");

      return res.json({ data: payload, cached: false });
    } catch (err) {
      console.error('getTransactionStats error:', err);
      return res.status(500).json({ message: 'Server error computing stats.' });
    }
  }

module.exports = {getTransactions,   createTransaction,getTransactionById,updateTransaction, deleteTransaction, getTransactionStats };
