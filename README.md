<div align="center">
  <h1>📖 Edicto</h1>
  <p><strong>Your Intelligent Vocabulary Expansion & Tracking Companion.</strong></p>
  <p>
    <img src="https://img.shields.io/badge/React-19-blue.svg?style=for-the-badge&logo=react" alt="React 19" />
    <img src="https://img.shields.io/badge/Node.js-Express-green.svg?style=for-the-badge&logo=node.js" alt="Node.js" />
    <img src="https://img.shields.io/badge/MongoDB-Mongoose-success.svg?style=for-the-badge&logo=mongodb" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Vite-Fast%20Bundler-646CFF.svg?style=for-the-badge&logo=vite" alt="Vite" />
  </p>
</div>

<br />

## 🌟 Overview
**Edicto** is a full-stack MERN application built for continuous learners who want to actively expand their vocabulary. Far beyond a traditional dictionary, Edicto introduces learning through gamification, spaced reinforcement, and automated daily word discoveries. Make language learning a fun, effortless daily habit!

---

## ✨ Key Features

- **🗓️ Daily Words:** Discover a new, curated word every midnight automatically (powered by `node-cron` & Free Dictionary API).
- **🔎 Robust Search:** Look up words instantly, finding precise definitions, parts of speech, synonyms, and antonyms.
- **🔖 Bookmarks:** Save intriguing words for later reference with a single click.
- **🔄 Spaced Revision:** A dedicated Revision system tracks words you've learned and reinforces your memory at optimal intervals.
- **🧠 Interactive Quizzes:** Test your retention with dynamic, randomized vocabulary quizzes based on your learned words.
- **📊 Comprehensive Dashboard:** Beautiful visual data maps (via `recharts`) showing your learning streak, activity timeline, and quiz accuracy.
- **🏆 Global Leaderboards:** Compete with top learners around the world.
- **🌓 Dark/Light Mode Theme:** Built-in seamless Theme Context for eye comfort.
- **🔒 Secure Authentication:** JWT-based robust authentication utilizing both Access and Refresh tokens stored in secure HTTP-only cookies.

---

## 🛠 Tech Stack

### 💻 Client-Side (Frontend)
- **Framework:** React 19
- **Bundler:** Vite 
- **Routing:** React Router v7
- **Data Visualization:** Recharts
- **Icons & Styling:** React Icons, Modern Custom CSS Variables

### ⚙️ Server-Side (Backend)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (via Mongoose ORM)
- **Security:** Helmet, Express Rate Limit, bcryptjs
- **Background Jobs:** Node Cron
- **Authentication:** jsonwebtoken (JWT)

---

## 🚀 Getting Started

Follow the steps below to set up Edicto locally for development and testing.

### Prerequisites
Make sure you have the following installed on your machine:
- **Node.js** (v18.x or higher)
- **npm** or **yarn**
- **MongoDB** (Local instance or MongoDB Atlas cluster)

### 1. Clone & Install
```bash
# Clone the project (if applicable)
git clone <your-repository-url>

# Navigate to the project directory
cd EDicto

# Install Backend Dependencies
cd server
npm install

# Install Frontend Dependencies
cd ../client
npm install
```

### 2. Environment Variables

Create `.env` files in both `client` and `server` directories based on their respective `.env.example` configurations.

**Server (`server/.env`)**
```env
# ========== SERVER ==========
PORT=5001
NODE_ENV=development

# ========== DATABASE ==========
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/edicto-db

# ========== JWT ==========
JWT_ACCESS_SECRET=your_access_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ========== CORS ==========
CLIENT_URL=http://localhost:5173

# ========== BCRYPT ==========
BCRYPT_SALT_ROUNDS=12
```

**Client (`client/.env`)**
```env
# API URL for Vite
VITE_API_URL=http://localhost:5001/api
```

### 3. Run the Application Localy

You need to run both the Client and the Server simultaneously.

**Start the Server (in the `server/` directory):**
```bash
npm run dev
# The backend will run silently on http://localhost:5001
```

**Start the Client (in the `client/` directory):**
```bash
npm run dev
# Vite will quickly boot the frontend at http://localhost:5173
```


---

## 🏗️ Project Structure Architecture

### Client
```
client/
 ┣ src/
 ┃ ┣ components/  # Reusable UI parts (Layout, Loading, Cards)
 ┃ ┣ context/     # App-wide contexts (Auth, Theme, App state)
 ┃ ┣ pages/       # Code-split Lazy-loaded Route views
 ┃ ┣ services/    # API calling layer (Axios/fetch wrappers)
 ┃ ┣ styles/      # Global styling, CSS resets, brand tokens
 ┃ ┣ App.jsx      # Route Registry & Providers Wrapper
 ┃ ┗ main.jsx     # React DOM Mount node
```

### Server
```
server/
 ┣ src/
 ┃ ┣ config/      # DB & Env configs
 ┃ ┣ controllers/ # Request handler logic mapping for routes
 ┃ ┣ middleware/  # Auth checking, error handling, rate limits
 ┃ ┣ models/      # Mongoose Schemas (User, Word, QuizResult, etc.)
 ┃ ┣ routes/      # Express Router definitions
 ┃ ┣ services/    # Extracted business logic (Daily Cron jobs!)
 ┃ ┣ utils/       # Small utility functions
 ┃ ┗ validations/ # Input schema validation logic (Joi/Zod)
 ┣ server.js      # Main Express App, middlewares & Cron boots
```

---

## 🤝 Contributing

Contributions are always welcome! 

1. **Fork** the repository
2. **Create** your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your Changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the Branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

---

## 📜 License
This project is open source and available under the [ISC License](LICENSE).
