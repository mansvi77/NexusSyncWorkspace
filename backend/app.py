# ============================================================
# SyncMind Backend — app.py (Frontend-Compatible Version)
# Matches exact endpoint names and response keys that
# page.js expects: /transcribe, /summarize, /question
# ============================================================

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from dotenv import load_dotenv
import os
import tempfile

# Database imports
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

load_dotenv()

# ============================================================
# DATABASE SETUP
# SQLite = zero config, single file (syncmind.db appears in
# your backend folder automatically on first run)
# ============================================================
engine = create_engine(
    "sqlite:///./syncmind.db",
    connect_args={"check_same_thread": False}
)
Base = declarative_base()
SessionLocal = sessionmaker(bind=engine)

class Meeting(Base):
    __tablename__ = "meetings"
    id          = Column(Integer, primary_key=True, index=True)
    meeting_name = Column(String, default="Untitled Meeting")
    transcript  = Column(Text)
    summary     = Column(Text)
    created_at  = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

# ============================================================
# APP + GROQ CLIENT
# ============================================================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# ============================================================
# /transcribe
# Frontend sends: FormData { file: <audio/video> }
# Frontend expects back: { transcription: "..." }
#                         ↑ this exact key name matters
# ============================================================
@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    try:
        # Save upload to a temp file so Groq can read it
        suffix = os.path.splitext(file.filename)[1] or ".wav"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        # Call Groq Whisper-large-v3
        with open(tmp_path, "rb") as f:
            result = client.audio.transcriptions.create(
                model="whisper-large-v3",
                file=f,
                response_format="text"   # returns plain string
            )

        os.unlink(tmp_path)  # delete temp file

        # Save to DB (no summary yet — that comes in /summarize)
        db = SessionLocal()
        meeting = Meeting(transcript=result)
        db.add(meeting)
        db.commit()
        db.refresh(meeting)
        db.close()

        # KEY: frontend reads response.data.transcription
        return JSONResponse({"transcription": result})

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# /summarize
# Frontend sends: FormData { transcription: "..." }
# Frontend expects back: { summary: "..." }
# ============================================================
@app.post("/summarize")
async def summarize(transcription: str = Form(...)):
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a professional meeting analyst. Given a transcript, produce:\n"
                        "1. EXECUTIVE SUMMARY (3 paragraphs)\n"
                        "2. ACTION ITEMS (numbered list, include owner and deadline if mentioned)\n"
                        "Be concise and professional."
                    )
                },
                {
                    "role": "user",
                    "content": f"Transcript:\n\n{transcription}"
                }
            ]
        )
        summary_text = response.choices[0].message.content

        # Update the most recent DB record with the summary
        db = SessionLocal()
        meeting = db.query(Meeting).order_by(Meeting.id.desc()).first()
        if meeting:
            meeting.summary = summary_text
            db.commit()
        db.close()

        return JSONResponse({"summary": summary_text})

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# /question
# Frontend sends: FormData { question: "...", context: "..." }
# Frontend expects back: { answer: "..." }
# ============================================================
@app.post("/question")
async def ask_question(question: str = Form(...), context: str = Form(...)):
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a helpful assistant. Answer questions strictly based on "
                        "the provided meeting context. If the answer isn't in the context, "
                        "say 'This wasn't discussed in the meeting.'"
                    )
                },
                {
                    "role": "user",
                    "content": f"Meeting context:\n{context}\n\nQuestion: {question}"
                }
            ]
        )
        return JSONResponse({"answer": response.choices[0].message.content})

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# /meetings — history of all past meetings
# ============================================================
@app.get("/meetings")
def get_meetings():
    db = SessionLocal()
    meetings = db.query(Meeting).order_by(Meeting.created_at.desc()).all()
    db.close()
    return JSONResponse([{
        "id": m.id,
        "meeting_name": m.meeting_name,
        "created_at": m.created_at.isoformat(),
        "preview": (m.summary or m.transcript or "")[:120] + "..."
    } for m in meetings])


@app.get("/meetings/{meeting_id}")
def get_meeting(meeting_id: int):
    db = SessionLocal()
    m = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    db.close()
    if not m:
        raise HTTPException(status_code=404, detail="Not found")
    return JSONResponse({
        "id": m.id,
        "meeting_name": m.meeting_name,
        "transcript": m.transcript,
        "summary": m.summary,
        "created_at": m.created_at.isoformat()
    })