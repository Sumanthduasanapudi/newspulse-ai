# NewsPulse AI

NewsPulse AI is a full-stack AI news intelligence application that collects news, groups related stories, and uses an AI layer to generate structured insights and summaries.

## Why this project

The project demonstrates practical AI application engineering across data collection, AI orchestration, backend APIs, and a React user interface. It is designed as a portfolio project for AI / Generative AI engineering roles.

## Architecture

```text
News Sources / RSS
       |
       v
AI Layer (Python + FastAPI)
- news collection
- story matching and clustering
- story memory
- AI agents / orchestration
- LLM-powered analysis
       |
       v
Backend API Gateway (Node.js + Express)
       |
       v
Frontend (React)
       |
       v
User
```

## Main capabilities

- Collects news from external feeds/sources
- Groups related stories into useful clusters
- Maintains story context/memory
- Uses specialized AI agents for news intelligence workflows
- Generates AI-assisted briefing, evidence, impact and change/delta analysis
- Exposes services through APIs
- Provides a React frontend for users

## Tech stack

### AI layer
- Python
- FastAPI
- Anthropic integration
- LangChain / LangChain Anthropic
- Sentence Transformers
- NumPy
- Feedparser

### Backend
- Node.js
- Express
- Axios
- CORS
- dotenv

### Frontend
- React
- Axios
- Create React App / react-scripts

## Repository structure

```text
newspulse-ai/
├── ai_layer/
│   ├── agents/
│   ├── services/
│   ├── models/
│   ├── main.py
│   ├── requirements.txt
│   └── .env.example
├── backend_layer/
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend_layer/
│   ├── src/
│   ├── public/
│   └── package.json
├── AUTHENTICATION.md
└── README.md
```

## Local setup

### 1. Clone

```bash
git clone https://github.com/Sumanthduasanapudi/newspulse-ai.git
cd newspulse-ai
```

### 2. AI layer

```bash
cd ai_layer
python -m venv .venv
```

Windows:

```bash
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and provide the required configuration/API credentials. Never commit the real `.env` file.

Start the AI API (adjust the module command if your local entry point differs):

```bash
uvicorn main:app --reload
```

### 3. Backend gateway

```bash
cd ../backend_layer
npm install
npm start
```

Copy `.env.example` to `.env` and configure the local service URLs/settings first.

### 4. Frontend

```bash
cd ../frontend_layer
npm install
npm start
```

For a production build:

```bash
npm run build
```

## Security

- Real API keys and credentials should be stored only in local `.env` files or deployment secret managers.
- `.env.example` files document required configuration without exposing secrets.
- Do not commit production credentials.

## Portfolio highlights

This project demonstrates:

- Full-stack AI application development
- Multi-component AI architecture
- LLM integration
- Agent-style AI workflows
- NLP / semantic processing
- News ingestion and clustering
- REST API integration
- Python + Node.js + React development

## Author

**Dusanapudi Sumanth**  
Computer Science Engineering — 2026  
AI / Generative AI Engineer
