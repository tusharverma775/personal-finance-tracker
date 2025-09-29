
const { Op, fn, col, literal } = require('sequelize');
const { Transaction, Category ,sequelize} = require('../models');
const redis = require('../utils/redis');

const CACHE_KEYS = {
  USER_ANALYTICS: (userId) => `analytics:user:${userId}`,
};


  const getAnalytics = async (req, res)=> {
    try {
      const user = req.user;
      const isAdmin = user.role === 'admin';
      const targetUserId = isAdmin && req.query.userId ? parseInt(req.query.userId, 10) : user.id;

      if (!targetUserId) return res.status(400).json({ message: 'User ID is required.' });

      const cacheKey = CACHE_KEYS.USER_ANALYTICS(targetUserId);
      const cached = await redis.getCache(cacheKey);
      if (cached) {
        return res.json({ data: JSON.parse(cached), cached: true });
      }

      // Monthly totals
      const monthly = await Transaction.findAll({
        attributes: [
          [fn('to_char', col('date'), 'YYYY-MM'), 'month'],
          [fn('SUM', literal(`CASE WHEN type='income' THEN amount ELSE 0 END`)), 'income'],
          [fn('SUM', literal(`CASE WHEN type='expense' THEN amount ELSE 0 END`)), 'expense'],
        ],
        where: { userId: targetUserId },
        group: [literal(`to_char("date", 'YYYY-MM')`)],
        order: [[literal(`to_char("date", 'YYYY-MM')`), 'ASC']],
        raw: true,
      });

      // Category breakdown (expenses only)
     const categoryBreakdown = await Transaction.findAll({
  attributes: [
    'categoryId',
    [fn('SUM', literal(`CASE WHEN type='expense' THEN amount ELSE 0 END`)), 'totalExpense'],
  ],
  where: { userId: targetUserId },
  include: [{ model: Category, as: 'Category', attributes: ['id', 'name'] }],
  group: ['categoryId', 'Category.id', 'Category.name'], // ✅ Corrected
  raw: true,
  nest: true,
});

      const payload = { monthly, categoryBreakdown };
      await redis.setCache(cacheKey, JSON.stringify(payload), 900); // 15 min cache

      res.json({ data: payload, cached: false });
    } catch (err) {
      console.error('getAnalytics error:', err);
      res.status(500).json({ message: 'Server error fetching analytics.' });
    }
  }


  const piecharApi = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Category Distribution (for Pie Chart)
    const categoryData = await Transaction.findAll({
  where: { userId },
  attributes: [
    [Transaction.sequelize.col("Category.name"), "category"], // 👈 category name from joined table
    [Transaction.sequelize.fn("SUM", Transaction.sequelize.col("Transaction.amount")), "total"]
  ],
  include: [
    {
      model: Category,
      attributes: [] // we only want the name for grouping
    }
  ],
  group: ["Category.name"]
});

    // Format: [{ category: 'Food', total: 200 }, ...]
    const categoryDistribution = categoryData.map(row => ({
      category: row.category,
      total: parseFloat(row.get("total"))
    }));

    // 2. Monthly Trends (for Line Chart)
    // 2. Monthly Trends (for Line Chart)
const monthlyData = await Transaction.findAll({
  where: { userId},
  attributes: [
    [
      Transaction.sequelize.fn(
        "TO_CHAR",
        Transaction.sequelize.col("date"),
        "YYYY-MM"
      ),
      "month"
    ],
    [Transaction.sequelize.fn("SUM", Transaction.sequelize.col("amount")), "total"],
  ],
  group: ["month"],
  order: [[Transaction.sequelize.literal("month"), "ASC"]],
});


    // Format: [{ month: '2025-01', total: 500 }, ...]
    const monthlyTrends = monthlyData.map(row => ({
      month: row.get("month"),
      total: parseFloat(row.get("total"))
    }));

    // 3. Income vs Expense (for Bar Chart)
    const incomeExpenseData = await Transaction.findAll({
      where: { userId},
      attributes: [
        "type", // 'income' or 'expense'
        [Transaction.sequelize.fn("SUM", Transaction.sequelize.col("amount")), "total"],
      ],
      group: ["type"],
    });

    // Format: [{ type: 'income', total: 1200 }, { type: 'expense', total: 800 }]
    const incomeVsExpenses = incomeExpenseData.map(row => ({
      type: row.type,
      total: parseFloat(row.get("total"))
    }));

    // Final response
    res.json({
      categoryDistribution, // Pie chart
      monthlyTrends,        // Line chart
      incomeVsExpenses,     // Bar chart
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch transaction stats" });
  }}
module.exports = {getAnalytics,piecharApi};
