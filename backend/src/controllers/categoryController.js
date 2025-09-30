
const { where } = require('sequelize');
const { Category } = require('../models');
const redis = require('../utils/redis');

const CACHE_KEY = 'categories:list';


  const getCategories = async (req, res) => {
    try {
      const cached = await redis.getCache(CACHE_KEY);
      if (cached) {
        return res.json({ data: cached, cached: true });
      }

      const categories = await Category.findAll({ order: [['name', 'ASC']] });
       await redis.setCache(CACHE_KEY,  JSON.stringify(categories), 3600);

      res.json({ data: categories, cached: false });
    } catch (err) {
      console.error('getCategories error:', err);
      res.status(500).json({ message: 'Server error fetching categories.' });
    }
  }

  const createCategory = async (req, res)=> {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only admin can create categories.' });
      }

      const { name } = req.body;
      if (!name) return res.status(400).json({ message: 'Category name is required.' });

const existingname = await Category.findOne({where:{name:name}})
if(existingname){
  return res.status(400).json({message:"Category name already exist"})
}


      const category = await Category.create({ name });
      const d = await redis.deleteCache(CACHE_KEY); // invalidate cache
if(!d){
  console.log("deleted old cache")
}
      res.status(201).json({ data: category });
    } catch (err) {
      console.error('createCategory error:', err);
      res.status(500).json({ message: 'Server error creating category.' });
    }
  } 

  
  const updateCategory = async (req, res)=> {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only admin can update categories.' });
      }

      const { id } = req.params;
      const { name } = req.body;
      const category = await Category.findByPk(id);

      if (!category) return res.status(404).json({ message: 'Category not found.' });

      category.name = name || category.name;
      await category.save();
      await redis.deleteCache(CACHE_KEY);

      res.json({ data: category });
    } catch (err) {
      console.error('updateCategory error:', err);
      res.status(500).json({ message: 'Server error updating category.' });
    }
  }


  const deleteCategory = async(req, res)=> {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only admin can delete categories.' });
      }

      const { id } = req.params;
      const category = await Category.findByPk(id);

      if (!category) return res.status(404).json({ message: 'Category not found.' });

      await category.destroy();
      await redis.deleteCache(CACHE_KEY);

      res.json({ message: 'Category deleted.' });
    } catch (err) {
      console.error('deleteCategory error:', err);
      res.status(500).json({ message: 'Server error deleting category.' });
    }
  }
module.exports = {createCategory, deleteCategory, updateCategory, getCategories};
