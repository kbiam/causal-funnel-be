# CausalFunnel Quiz API

A Node.js/Express backend API for the quiz application.

## Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: MySQL (hosted on Railway)
- **Deployment**: Render
- **Architecture**: MVC pattern

## Database Tables

- `users` - User information
- `questions` - Quiz questions and answers
- `quiz_sessions` - Quiz session tracking
- `answers` - User submitted answers

## API Routes

### Health Check
```
GET /api/health
```

### Quiz Routes
```
POST /api/quiz/start           # Start new quiz
GET /api/quiz/:sessionId       # Get quiz questions
POST /api/quiz/:sessionId/answer  # Submit answer
GET /api/quiz/:sessionId/results  # Get results
```

### User Routes
```
GET /api/user/:email/current   # Check current status
GET /api/user/:email/history   # Get quiz history
GET /api/user/:email/report/:sessionId  # Detailed report
```

## Project Structure

```
├── config/
│   ├── db.js         # Database configuration
│   └── index.js      # App configuration
├── controllers/
│   ├── QuizController.js
│   └── UserController.js
├── middleware/
│   ├── ErrorHandler.js
│   └── RateLimiter.js
├── models/
│   ├── Answer.js
│   ├── Question.js
│   ├── QuizSession.js
│   └── User.js
├── routes/
│   ├── index.js      # Main router + health check
│   ├── Quiz.js       # Quiz routes
│   └── User.js       # User routes
├── services/
│   ├── QuestionService.js
│   └── ValidationService.js
├── utils/
│   ├── FallbackQuestions.js
│   └── Helpers.js
├── .env
├── .gitignore
└── app.js
└── server.js

```

## Environment Variables

```env
# Database Configuration
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=

# Server Configuration
PORT=5000
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Setup

1. Clone repository
2. Install dependencies: `npm install`
3. Set environment variables
4. Run: `node server.js`

## Deployment

- **Database**: MySQL on Railway
- **API**: Deployed on Render
- **Live URL**: `https://causal-funnel-be.onrender.com`

## Features

- Start quiz sessions
- Submit and validate answers
- Generate detailed reports
- User history tracking
- Rate limiting and error handling
