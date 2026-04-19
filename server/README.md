# Edicto Backend API

Production-ready REST API for the Edicto vocabulary learning application.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Auth**: JWT (access + refresh tokens) with bcrypt
- **Validation**: Joi
- **Security**: Helmet, CORS, express-rate-limit
- **Logging**: Morgan

## Quick Start

### 1. Install dependencies

```bash
cd server
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/edicto
JWT_ACCESS_SECRET=your_super_secret_access_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
BCRYPT_SALT_ROUNDS=12
```

### 3. Start the server

```bash
npm run dev     # Development (with nodemon)
npm start       # Production
```

Server runs at `http://localhost:5000`

### 4. Add words (fetched live from Free Dictionary API)

```bash
# Add a single word
curl -X POST http://localhost:5000/api/words \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{"word": "ephemeral", "category": "GRE", "difficulty": 3}'

# Add multiple words at once
curl -X POST http://localhost:5000/api/words/bulk \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{"words": [
    {"word": "ubiquitous", "category": "GRE", "difficulty": 3},
    {"word": "pragmatic", "category": "IELTS", "difficulty": 2},
    {"word": "leverage", "category": "Business", "difficulty": 1}
  ]}'
```

All word data (definitions, pronunciations, synonyms, examples) is automatically fetched from the **Free Dictionary API** — no static data!

## API Endpoints (36 total)

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login (sets refresh cookie) |
| POST | `/api/auth/logout` | Yes | Clear refresh token |
| POST | `/api/auth/refresh` | Cookie | Issue new access token |
| GET | `/api/auth/me` | Yes | Get current user |
| PUT | `/api/auth/profile` | Yes | Update name/avatar |

### Words (powered by Free Dictionary API)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/words` | No | List with filters & pagination |
| GET | `/api/words/count-by-category` | No | Category counts |
| GET | `/api/words/daily` | No | Today's word |
| GET | `/api/words/random` | No | Random words |
| GET | `/api/words/:id` | No | Single word |
| GET | `/api/words/:id/related` | No | Related words (max 3) |
| POST | `/api/words` | Yes | Add word (fetched from Dictionary API) |
| POST | `/api/words/bulk` | Yes | Add multiple words (max 50) |
| DELETE | `/api/words/:id` | Yes | Delete a word |

### Bookmarks
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/bookmarks` | Yes | User's bookmarks |
| GET | `/api/bookmarks/:wordId/status` | Yes | Is bookmarked? |
| POST | `/api/bookmarks/:wordId` | Yes | Add bookmark |
| DELETE | `/api/bookmarks/:wordId` | Yes | Remove bookmark |

### Learned
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/learned` | Yes | Learned words |
| GET | `/api/learned/:wordId/status` | Yes | Is learned? |
| POST | `/api/learned/:wordId` | Yes | Mark learned |

### Revision
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/revision` | Yes | All (due + upcoming) |
| GET | `/api/revision/due` | Yes | Due today |
| GET | `/api/revision/progress` | Yes | Progress metrics |
| PUT | `/api/revision/:wordId/review` | Yes | Mark reviewed |

### Quiz
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/quiz/generate` | Yes | Generate 10 MCQs |
| POST | `/api/quiz/submit` | Yes | Submit result |
| GET | `/api/quiz/results` | Yes | Result history |
| POST | `/api/quiz/retry` | Yes | New quiz |

### Streak & Activity
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/streak` | Yes | Current streak |
| GET | `/api/activities` | Yes | Recent 20 activities |

### Stats & Leaderboard
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/stats` | Yes | Dashboard totals |
| GET | `/api/stats/weekly` | Yes | Weekly chart data |
| GET | `/api/leaderboard` | Yes | Ranked users |

## Response Format

All responses follow this structure:

```json
{
  "success": true,
  "message": "Fetched successfully",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 32,
    "totalPages": 2
  }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["Email is required", "Password must be at least 6 characters"]
}
```

## Authentication Flow

1. **Register** → `POST /api/auth/register`
2. **Login** → `POST /api/auth/login` → Returns `accessToken` in body + sets `refreshToken` HTTP-only cookie
3. **Use API** → Send `Authorization: Bearer <accessToken>` header
4. **Token expired** → `POST /api/auth/refresh` → Returns new `accessToken` (reads cookie automatically)
5. **Logout** → `POST /api/auth/logout` → Clears refresh cookie

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Steve", "email": "steve@example.com", "password": "password123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email": "steve@example.com", "password": "password123"}'
```

### Get words
```bash
curl http://localhost:5000/api/words?category=GRE&difficulty=3&page=1&limit=10
```

### Bookmark a word (use token from login response)
```bash
curl -X POST http://localhost:5000/api/bookmarks/<wordId> \
  -H "Authorization: Bearer <accessToken>"
```

### Refresh token
```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -b cookies.txt
```

## Project Structure

```
server/
├── src/
│   ├── config/          # DB connection, env validation
│   ├── constants/       # Enums, limits, defaults
│   ├── controllers/     # Request handlers (9 controllers)
│   ├── middleware/       # Auth, validation, error handling
│   ├── models/          # Mongoose schemas (8 models)
│   ├── routes/          # Express routers (10 route files)
│   ├── services/        # Business logic (7 services incl. dictionary)
│   ├── utils/           # ApiError, ApiResponse, dateUtils
│   └── validations/     # Joi schemas
├── .env.example
├── package.json
├── server.js            # Entry point
└── README.md
```

## How Words Are Added

There is **no seed script or static data**. All word content is fetched live from the [Free Dictionary API](https://dictionaryapi.dev/):

1. You send `POST /api/words` with just the word, category, and difficulty
2. The backend calls `https://api.dictionaryapi.dev/api/v2/entries/en/{word}`
3. It parses the response to extract: definition, pronunciation, part of speech, synonyms, example sentence
4. The parsed data is saved to MongoDB

For bulk loading, use `POST /api/words/bulk` with up to 50 words per request.

## Key Behaviors

- **Adding words** fetches real data from Free Dictionary API — zero static data
- **Bookmarking** auto-adds word to revision list
- **Unbookmarking** auto-removes from revision
- **Mark learned** is idempotent (cannot un-learn)
- **Spaced repetition** doubles interval on each review (max 30 days)
- **Quiz results** capped at 50 per user
- **Activity log** capped at 20 per user
- **Streak** updates on bookmark, learn, review, and quiz completion
- **Refresh tokens** are hashed in DB with rotation and reuse detection

## Future Improvements

- [ ] Admin panel for word CRUD
- [ ] Word search endpoint (text index already created)
- [ ] Email verification on registration
- [ ] Password reset flow
- [ ] Profile picture upload
- [ ] WebSocket for real-time leaderboard
- [ ] Redis caching for daily word and leaderboard
- [ ] Unit and integration tests
- [ ] Docker + Docker Compose
- [ ] CI/CD pipeline
