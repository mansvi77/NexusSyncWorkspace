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
            model="llama3-70b-8192",
            temperature=0.1,  
            response_format={"type": "json_object"},  
            messages=[
                {
                    "role": "system",
                    "content": "You are SyncMind, an AI analytics engine. Extract key metrics, explicit summaries, and track exact task assignments and deadlines mentioned in meeting transcripts. Respond with zero conversational filler text. Output must be raw JSON matching the requested fields."
                },
                {
                    "role": "user",
                    "content": f"""Analyze this transcript and return a valid JSON object matching this structure:
{{
  "summary": "Provide a complete, detailed paragraph summarizing the critical architectural discussion points and deployment roadmap milestones mentioned.",
  "keyPoints": ["Key technical point or milestone 1", "Key technical point or milestone 2"],
  "actionItems": [
    {{
      "task": "The precise action item work description details mentioned",
      "assignee": "Extract the exact name of the player or employee assigned to this task. If no name is mentioned, use 'Unassigned'.",
      "deadline": "Extract explicit deadline details, target days, or timeline information mentioned for this task. If none, use 'None specified'.",
      "priority": "high | medium | low",
      "completed": false
    }}
  ],
  "decisions": ["Important collective decision or agreement 1"],
  "sentiment": "positive | neutral | mixed | tense",
  "duration_estimate": "Estimated verbal track layout length",
  "topics": ["Core technical framework topic 1", "Topic 2"]
}}

Transcript:
{transcript}"""
                }
            ]
        )
        raw = chat.choices[0].message.content.strip()
        return json.loads(raw)
    except Exception as e:
        print(f"Extraction Pipeline Intercepted Crash: {str(e)}")
        try:
            match = re.search(r'\{[\s\S]*\}', raw)
            if match:
                return json.loads(match.group(0))
        except Exception:
            pass
        return {
            "summary": "Data stream analytical breakdown failed.",
            "keyPoints": [],
            "actionItems": [],
            "decisions": [],
            "sentiment": "neutral",
            "duration_estimate": "Unknown",
            "topics": []
        }

@app.route('/api/meetings', methods=['GET'])
def get_meetings():
    conn = get_db()
    meetings = conn.execute("SELECT * FROM meetings ORDER BY created_at DESC").fetchall()
    result = []
    for m in meetings:
        items = conn.execute("SELECT * FROM action_items WHERE meeting_id = ?", (m['id'],)).fetchall()
        result.append({
            **dict(m),
            "key_points": json.loads(m['key_points'] or '[]'),
            "decisions": json.loads(m['decisions'] or '[]'),
            "topics": json.loads(m['topics'] or '[]'),
            "action_items": [dict(i) for i in items]
        })
    conn.close()
    return jsonify(result)

@app.route('/api/meetings/<meeting_id>', methods=['GET'])
def get_meeting(meeting_id):
    conn = get_db()
    m = conn.execute("SELECT * FROM meetings WHERE id = ?", (meeting_id,)).fetchone()
    if not m:
        return jsonify({"error": "Not found"}), 404
    items = conn.execute("SELECT * FROM action_items WHERE meeting_id = ?", (meeting_id,)).fetchall()
    result = {
        **dict(m),
        "key_points": json.loads(m['key_points'] or '[]'),
        "decisions": json.loads(m['decisions'] or '[]'),
        "topics": json.loads(m['topics'] or '[]'),
        "action_items": [dict(i) for i in items]
    }
    conn.close()
    return jsonify(result)

@app.route('/api/meetings/<meeting_id>', methods=['DELETE'])
def delete_meeting(meeting_id):
    conn = get_db()
    conn.execute("DELETE FROM action_items WHERE meeting_id = ?", (meeting_id,))
    conn.execute("DELETE FROM meetings WHERE id = ?", (meeting_id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

@app.route('/api/action-items/<item_id>/toggle', methods=['PATCH'])
def toggle_action_item(item_id):
    conn = get_db()
    item = conn.execute("SELECT * FROM action_items WHERE id = ?", (item_id,)).fetchone()
    if not item:
        return jsonify({"error": "Not found"}), 404
    new_status = 0 if item['completed'] else 1
    conn.execute("UPDATE action_items SET completed = ? WHERE id = ?", (new_status, item_id))
    conn.commit()
    conn.close()
    return jsonify({"completed": bool(new_status)})

@app.route('/api/action-items', methods=['GET'])
def get_all_action_items():
    conn = get_db()
    items = conn.execute(
        """SELECT a.*, m.title as meeting_title
           FROM action_items a
           JOIN meetings m ON a.meeting_id = m.id
           ORDER BY a.created_at DESC"""
    ).fetchall()
    conn.close()
    return jsonify([dict(i) for i in items])

if __name__ == '__main__':
    app.run(debug=True, port=5000)   