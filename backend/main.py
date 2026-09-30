from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from detection.evidence_engine import build_evidence
from parsers.email_parser import parse_email


app = FastAPI(
    title="Email Threat Intelligence API",
    description="Backend for the AI-powered email investigation platform",
    version="0.1.0",
)


# Allow the Next.js frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "status": "ok",
        "message": "Email Threat Intelligence API is running",
    }


@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "service": "backend",
    }


@app.post("/api/investigate")
async def investigate(file: UploadFile = File(...)):
    """
    Receive an .eml file and return the complete investigation result.
    """

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file provided",
        )

    if not file.filename.lower().endswith(".eml"):
        raise HTTPException(
            status_code=400,
            detail="Only .eml files are supported",
        )

    try:
        file_bytes = await file.read()

        if not file_bytes:
            raise HTTPException(
                status_code=400,
                detail="Uploaded file is empty",
            )

        email_data = parse_email(file_bytes)
        investigation = await build_evidence(email_data)

        return {
            "status": "success",
            "filename": file.filename,
            "email": email_data,
            "investigation": investigation,
        }

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Unable to investigate email ({type(exc).__name__}). "
                "Check the .eml file and try again."
            ),
        )