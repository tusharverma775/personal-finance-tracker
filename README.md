💰 Full Stack Personal Finance Tracker

A personal finance tracker application that allows users to manage their income, expenses, and analytics with role-based access.
Built with React, Node.js (Express), PostgreSQL, Redis, and Chart.js.

🚀 Features

User authentication & authorization (JWT + role-based access)

Track income and expenses

Analytics dashboard with charts

Role-based access control:

Admin: Full access, user management

User: Manage personal transactions

Read-only: View only, no modifications

Redis caching for faster analytics queries

Swagger API documentation

⚙️ Tech Stack

Frontend: React 18+, TailwindCSS, Chart.js

Backend: Node.js, Express.js

Database: PostgreSQL + Sequelize ORM

Caching: Redis

API Docs: Swagger

🛠️ Setup Locally
1. Clone the repository
git clone https://github.com/your-username/finance-tracker.git
cd finance-tracker

2. Setup environment variables

Create a .env file inside /backend:

# Server
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=yourpassword
DB_NAME=finance_tracker

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

3. Install dependencies

Backend:

cd backend
npm install


Frontend:

cd frontend
npm install

4. Setup PostgreSQL Database
createdb finance_tracker
npx sequelize-cli db:migrate

5. Start Redis Server
redis-server

6. Run the application

Backend:

cd backend
npm run dev


Frontend:

cd frontend
npm start


The app should now be running on:

Backend → http://localhost:5000

Frontend → http://localhost:3000

🔑 Demo Credentials
Role	Email	Password
Admin	admin@test.com
	admin123
User	user@test.com
	user123
Read-only	readonly@test.com
	readonly123
📊 Performance Metrics (Caching Effectiveness)

We use Redis caching for analytics queries.

Without cache: ~200–250ms per analytics request

With cache: ~15–20ms per analytics request

Cache TTL: 60 seconds (configurable in utils/redis.js)

Logs will show:

get cache mei aaya
getAnalytics error: ...


when cache is hit or missed.

📜 API Documentation

Swagger docs available at:
👉 http://localhost:5000/api/docs

✅ Working Application

Fully functional with role-based access

Transactions CRUD with validations

Dashboard analytics with charts

Redis caching for faster response times



1. Admin User

Email: admin@example.com

Password: Admin@123

Role: admin

2. Regular User

Email: user@example.com

Password: User@123

Role: user

3. Read-Only User

Email: readonly@example.com

Password: ReadOnly@123

Role: readonly
