# Leno Software Ecosystem

Monorepo for the Leno operational stack: a Next.js console and a FastAPI API with SQLAlchemy.

```
leno_software_ecosystem/
├── frontend/                 # Next.js, TypeScript, Tailwind CSS
├── backend/                  # FastAPI, SQLAlchemy
│   ├── main.py
│   └── requirements.txt
└── README.md
```

ChemVault Global remains the production Next.js product at the repository root. This folder is the isolated ecosystem scaffold (API on `:8000`, console on `:3001`).

## Backend

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

- Health: `GET http://localhost:8000/api/health`
- OpenAPI: `http://localhost:8000/docs`
- SQLite file: `backend/data/leno_ecosystem.db` (created on first run)

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3001`. The console calls the API via `NEXT_PUBLIC_API_URL` (default `http://localhost:8000`).

## Stack

| Layer | Technology |
|--------|------------|
| UI | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| API | FastAPI, Pydantic, Uvicorn |
| Persistence | SQLAlchemy 2.0, SQLite |
