# 🚀 JudgeLens

### AI-Powered Hackathon Evaluation Platform

JudgeLens is an AI-powered judging assistant designed to help hackathon organizers and judges evaluate submissions faster, more consistently, and at scale.

Instead of manually reviewing dozens or hundreds of repositories, pitch decks, and UI designs, JudgeLens automatically analyzes submissions and generates structured evaluations, rankings, and actionable feedback.

---

## 🎯 The Problem

Modern hackathons often receive hundreds of submissions.

Judges typically need to review:

- GitHub repositories
- Pitch decks
- UI/UX designs
- Business models
- Technical implementations

This process is:

- ⏳ Time-consuming
- 📈 Difficult to scale
- ⚖️ Subjective and inconsistent
- 😵 Prone to evaluator fatigue

JudgeLens helps solve this challenge using AI-powered evaluation pipelines.

---

## ✨ Features

### 📂 Repository Intelligence Engine

Analyze GitHub repositories for:

- Documentation Quality
- Technical Complexity
- Project Completeness
- Repository Structure
- Development Practices

Outputs:

- Repository Score
- Strengths
- Weaknesses
- Recommendations

### 📊 Pitch Deck Evaluation

Automatically reviews uploaded presentations and scores:

- Innovation
- Technical Complexity
- Business Impact
- Presentation Quality

Generates detailed feedback and recommendations.

### 🎨 UI/UX Evaluation

Analyze application screenshots using AI vision.

Measures:

- Visual Design
- UX Quality
- Professionalism
- Interface Clarity

Provides actionable UI improvement suggestions.

### 🏆 Dynamic Leaderboard

Projects are automatically ranked based on:

- Repository Evaluation
- Presentation Evaluation
- UI/UX Evaluation

Allowing judges to identify top-performing projects instantly.

### 🧠 AI-Powered Verdicts

JudgeLens doesn't just score projects.

It explains:

- Why a project received its score
- Key strengths
- Critical weaknesses
- Strategic recommendations

---

## 📸 Screenshots

### 🏆 Leaderboard Dashboard

<img width="1710" height="951" alt="image" src="https://github.com/user-attachments/assets/3bdb7bcf-4542-47f6-9c66-985ca7e0eb98" />


### 📤 Project Submission Portal

<img width="1710" height="947" alt="image" src="https://github.com/user-attachments/assets/499536ed-cfae-4688-a485-619f7bafa71a" />


### 📈 Evaluation Dashboard

<img width="1710" height="950" alt="image" src="https://github.com/user-attachments/assets/3ac141ed-2bea-4928-ac6a-eb942cd5945b" />


### 🔍 Detailed Project Analysis

<img width="1710" height="947" alt="image" src="https://github.com/user-attachments/assets/04718a28-0030-407a-ae36-50c30e869b48" />
<img width="1710" height="949" alt="image" src="https://github.com/user-attachments/assets/5ec0e622-5d9e-4e44-b271-1f8554a577a9" />
<img width="1710" height="949" alt="image" src="https://github.com/user-attachments/assets/fc6a42f5-0e10-4694-8985-e29ae36f53de" />




---

## ⚙️ How It Works

```text
Project Submission
        ↓
Repository Analysis
        ↓
Pitch Deck Analysis
        ↓
UI Screenshot Analysis
        ↓
AI Evaluation Engine
        ↓
Scoring & Ranking
        ↓
Leaderboard & Reports
```

---

## 🏗️ System Architecture

```text
Frontend (React + Tailwind)
            ↓
       FastAPI Backend
            ↓
      Google Gemini
            ↓
      MongoDB Atlas
            ↓
 Project Evaluations
```

---

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- shadcn/ui
- Recharts

### Backend

- FastAPI
- Python

### Database

- MongoDB Atlas

### Artificial Intelligence

- Google Gemini 2.5 Flash
- Vertex AI

### Cloud

- Google Cloud Platform (GCP)

### Integrations

- GitHub API
- PyMongo
- python-pptx

---

## 🚀 Local Setup

### Clone Repository

```bash
git clone https://github.com/JVikramV/JudgeLens.git

cd JudgeLens
```

### Backend Setup

```bash
cd backend

python -m venv venv

source venv/bin/activate

pip install -r requirements.txt

uvicorn main:app --reload
```

Backend runs at:

```text
http://localhost:8000
```

### Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

---

## 🔑 Environment Variables

Create:

```text
backend/.env
```

```env
MONGO_URI=your_mongodb_connection_string

DATABASE_NAME=judgelens

PROJECT_ID=your_google_cloud_project

LOCATION=us-central1

GITHUB_TOKEN=your_github_personal_access_token
```

---

## 📊 Evaluation Categories

| Category | Metrics |
|-----------|----------|
| Repository | Documentation, Technical Quality, Completeness |
| Pitch Deck | Innovation, Business Impact, Technical Complexity |
| UI/UX | Visual Design, User Experience, Professionalism |

---

## 🎯 Why JudgeLens?

Traditional Hackathon Judging:

- Manual repository review
- Manual PPT evaluation
- Manual UI assessment
- Subjective scoring
- Difficult to scale

JudgeLens:

✅ Automated Evaluation

✅ Consistent Scoring

✅ Detailed Feedback

✅ Dynamic Ranking

✅ AI-Powered Insights

✅ Scalable Judging

---

## 📈 Future Roadmap

### Phase 2

- Demo Video Analysis
- Deep Repository Inspection
- AI Judge Agents
- Team Evaluation

### Phase 3

- Multi-Agent Judging
- Fraud Detection
- Automatic Finalist Selection
- Investor Readiness Scoring
- AI-Powered Winner Prediction

---

## 👨‍💻 Author

**V Jayanth**

Built for innovation, learning, and the future of AI-assisted evaluation.

---

## 📜 License

MIT License

---

### ⭐ If you found JudgeLens interesting, consider starring the repository.
