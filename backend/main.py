from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Email Threat Intelligence API",
    description="Backend for the AI-powered email investigation platform",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "status": "ok",
        "message": "Email Threat Intelligence API is running"
    }


@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "service": "backend"
    }