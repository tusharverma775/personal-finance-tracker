const app = require('./app');
const { sequelize } = require('./models'); // Sequelize instance
require('dotenv').config();

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    // Test DB connection
    await sequelize.authenticate();
    console.log('✅ Database connected successfully.');

    // Sync models (in dev, force:true resets tables – remove in production!)
    await sequelize.sync({ alter: true });
    console.log('✅ Database synchronized.');

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
})();
