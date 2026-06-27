import os
import json
import sqlite3
import tempfile
import uuid
import subprocess
import re

from dotenv import load_dotenv
load_dotenv()

from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq

app = Flask(__name__)
# Crucial networking configuration: allow clean local resource handshakes
CORS(app, origins=["http://localhost:3000"])

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
DB_PATH = os.path.join(os.path.dirname(__file__), "syncmind.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS meetings (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            transcript TEXT,
            summary TEXT,
            key_points TEXT,
            decisions TEXT,
            sentiment TEXT,
            topics TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            duration TEXT
        );
        CREATE TABLE IF NOT EXISTS action_items (
            id TEXT PRIMARY KEY,
            meeting_id TEXT NOT NULL,
            task TEXT NOT NULL,
            assignee TEXT DEFAULT 'Mansvi',
            deadline TEXT,
            priority TEXT DEFAULT 'medium',
            completed INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (meeting_id) REFERENCES meetings(id)
        );
    """)
    conn.commit()
    conn.close()

init_db()

def denoise_audio(input_path, output_path):
    try:
        subprocess.run([
            'ffmpeg', '-y', '-i', input_path,
            '-af', 'highpass=f=200,lowpass=f=3000,afftdn=nf=-25',
            '-ar', '16000', '-ac', '1',
            output_path
        ], capture_output=True, timeout=120)
        return output_path if os.path.exists(output_path) else input_path
    except Exception:
        return input_path

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "message": "SyncMind backend running"})

@app.route('/api/transcribe', methods=['POST'])
def transcribe():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files['audio']
    title = request.form.get('title', 'Untitled Meeting')

    suffix = os.path.splitext(audio_file.filename)[1] or '.webm'
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        audio_file.save(tmp.name)
        original_path = tmp.name

    denoised_path = original_path + '_denoised.wav'  
    final_path = denoise_audio(original_path, denoised_path)

    try:
        with open(final_path, 'rb') as f:
            transcription = client.audio.transcriptions.create(
                file=(os.path.basename(final_path), f),
                model="whisper-large-v3",
                language="en",
                response_format="verbose_json"
            )

        transcript_text = transcription.text
        
        # Core AI Processing Leap
        insights = extract_insights(transcript_text)

        meeting_id = str(uuid.uuid4())
        conn = get_db()
        conn.execute(
            """INSERT INTO meetings (id, title, transcript, summary, key_points, decisions, sentiment, topics, duration)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                meeting_id, title, transcript_text,
                insights.get('summary', 'No summary generated.'),
                json.dumps(insights.get('keyPoints') or insights.get('key_points') or []),
                json.dumps(insights.get('decisions', [])),
                insights.get('sentiment', 'neutral'),
                json.dumps(insights.get('topics', [])),
                insights.get('duration_estimate') or insights.get('duration') or 'Unknown'
            )
        )
        
        # PERFECTED NORMALIZATION LAYER: Checks both naming conventions to prevent dropping arrays
        action_items_list = insights.get('actionItems') or insights.get('action_items') or []

        for item in action_items_list:
            conn.execute(
                """INSERT INTO action_items (id, meeting_id, task, assignee, deadline, priority, completed)
                   VALUES (?, ?, ?, ?, ?, ?, ?)""",
                (
                    str(uuid.uuid4()), meeting_id,
                    item.get('task') or item.get('description') or 'Unspecified task metric',
                    item.get('assignee') or 'Mansvi',
                    item.get('deadline') or 'None specified',
                    item.get('priority', 'medium'),
                    0
                )
            )
        conn.commit()
        conn.close()

        return jsonify({
            "meeting_id": meeting_id,
            "transcript": transcript_text,
            "insights": insights
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        for p in [original_path, denoised_path]:
            try:
                os.unlink(p)
            except Exception:
                pass

def extract_insights(transcript):
    try:
        chat = client.chat.completions.create(
            model="llama-3.1-70b-versatile",
            temperature=0.0,  # Absolute zero temperature forces strict deterministic JSON outputs
            response_format={"type": "json_object"},  
            messages=[
                {
                    "role": "system",
                    "content": "You are SyncMind, an automated JSON metadata generator. Your output must be a clean, single stringified JSON object containing keys: summary, keyPoints, actionItems, decisions, sentiment, duration_estimate, and topics. Do not write text wrappers or conversational prefaces."
                },
                {
                    "role": "user",
                    "content": f"""Analyze this meeting transcript and output a valid JSON object matching this structure:
{{
  "summary": "Detailed paragraph summarizing the core systems roadmap discussed.",
  "keyPoints": ["Technical milestone 1", "Technical milestone 2"],
  "actionItems": [
    {{
      "task": "Precise workload tracking details",
      "assignee": "Name of the player, or 'Unassigned'",
      "deadline": "Deadline details or 'None specified'",
      "priority": "high | medium | low",
      "completed": false
    }}
  ],
  "decisions": ["Agreed tactical alignment 1"],
  "sentiment": "positive | neutral | mixed | tense",
  "duration_estimate": "Estimated verbal track length",
  "topics": ["Core technical framework topic 1"]
}}

Transcript to evaluate:
{transcript}"""
                }
            ]
        )
        
        raw_content = chat.choices[0].message.content.strip()
        
        # Self-Healing Layer 1: Clean out markdown block backticks if present
        raw_content = re.sub(r'^```json\s*', '', raw_content, flags=re.IGNORECASE)
        raw_content = re.sub(r'^```\s*', '', raw_content)
        raw_content = re.sub(r'\s*```$', '', raw_content)
        
        return json.loads(raw_content)
        
    except Exception as e:
        print(f"Error parsing insights: {e}")
        return {
            "summary": "Failed to generate summary.",
            "keyPoints": [],
            "actionItems": [],
            "decisions": [],
            "sentiment": "neutral",
            "duration_estimate": "Unknown",
            "topics": []
        }

# Execution wrapper to start up the local server
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)