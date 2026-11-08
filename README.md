# IronTrack – Modern Gym Tracking Web App

IronTrack is a fitness SaaS dashboard and strength tracking web application built with a dark aesthetic, neon orange highlights, JWT authentication, and a persistent database.

![IronTrack](https://raw.githubusercontent.com/CODEWITH-Manthan/IronTrack/main/public/preview.png)

## ⚡ Highlights

- **Visual Identity**: Dark theme (`#090909` pitch-black background, `#141414` secondary, `#1B1B1B` cards, `#FF6B00` neon orange accent, `#32D583` success green).
- **Authentication**: JWT authentication with `bcryptjs` password hashing and profile onboarding.
- **Persistent Storage**: Atomic-write JSON database engine (`src/server/db.ts`) for multi-user isolation, workouts, and movements.
- **Live Workout Tracker**: Real-time duration timer, interactive rest intervals with audible chimes, set-by-set weight and repetition logging, and 1RM estimation via the Brzycki equation.
- **Technique & Movement Vault**: 14+ standard exercise movement templates with anatomical muscle targets and instructions, plus support for custom exercises with category and difficulty filters.
- **Progress & Strength Analytics**: Weekly volume bar charts, day-by-day tonnage tracking, muscle group distribution breakdown, and Personal Record (PR) hall of fame.
- **Responsive Navigation**: Desktop sidebar with athlete biometrics and mobile bottom navigation bar.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React, Recharts, Canvas Confetti
- **Backend**: Node.js, Express, TypeScript (`tsx`)
- **Security**: JSON Web Tokens (`jsonwebtoken`), Bcrypt (`bcryptjs`)
- **Build Tool**: Vite 8

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/CODEWITH-Manthan/IronTrack.git
cd IronTrack
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run the development server
```bash
npm run dev
```
The server will start on `http://localhost:3000`.

### 4. Build for production
```bash
npm run build
npm start
```

## 🧪 Testing

Run the automated backend database and calculation unit tests:
```bash
npx tsx --test src/server/db.test.ts src/utils/calculations.test.ts
```

## 📄 License

MIT
