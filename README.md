# NexusSyncWorkspace

**NexusSyncWorkspace** is an AI-powered meeting intelligence platform that converts meeting recordings into structured transcripts, summaries, key decisions, and actionable tasks.

It uses a **Next.js + React frontend**, **Flask backend**, **Groq Whisper for transcription**, **Llama 3 for meeting analysis**, and **SQLite for persistence**.

---

## ✨ Features

* 🎙️ Upload meeting audio recordings
* 📝 Automatic speech-to-text transcription
* 🤖 AI-generated meeting summaries
* ✅ Automatic action-item extraction
* 📌 Key decision extraction
* 📊 Meeting and task dashboard
* 🔎 Meeting search and filtering
* 💾 Persistent meeting data storage

---

## 🛠️ Tech Stack

| Layer             | Technologies               |
| ----------------- | -------------------------- |
| **Frontend**      | Next.js, React, JavaScript |
| **Styling**       | Tailwind CSS               |
| **Backend**       | Python, Flask              |
| **AI / ML**       | Groq Whisper, Llama 3      |
| **Database**      | SQLite                     |
| **Communication** | REST APIs, Fetch API       |
| **Configuration** | Environment Variables      |

---

## 🏗️ Architecture

```text
User
 │
 ▼
Next.js / React
 │
 │ REST API
 ▼
Flask Backend
 │
 ├──► Groq Whisper
 │       │
 │       ▼
 │    Transcript
 │
 ├──► Llama 3
 │       │
 │       ▼
 │  Summary + Decisions + Tasks
 │
 ▼
SQLite Database
 │
 ▼
JSON Response
 │
 ▼
Next.js Dashboard
```

---

## 🔄 Workflow

1. User uploads a meeting recording through the Next.js frontend.
2. `UploadZone.js` sends the audio to the Flask `/api/upload` endpoint.
3. Flask sends the audio to **Groq Whisper** for transcription.
4. The transcript is passed to **Llama 3** for summarization and action-item extraction.
5. The structured meeting data is stored in **SQLite**.
6. Flask returns the processed data as JSON.
7. React updates the dashboard with meetings, summaries, and tasks.

```text
Audio
  ↓
Whisper
  ↓
Transcript
  ↓
Llama 3
  ↓
Summary + Decisions + Tasks
  ↓
SQLite
  ↓
Dashboard
```

---

## 📂 Project Structure

```text
NexusSyncWorkspace/
│
├── backend/
│   ├── app.py
│   ├── syncmind.db
│   ├── requirements.txt
│   └── .env
│
├── nexus-sync-front/
│   ├── app/
│   │   ├── layout.js
│   │   ├── page.js
│   │   └── globals.css
│   │
│   └── components/
│       ├── Sidebar.js
│       ├── UploadZone.js
│       ├── MeetingCard.js
│       ├── MeetingDetail.js
│       ├── TasksPanel.js
│       └── StatsBar.js
│
└── README.md
```

---

## ⚙️ Getting Started

### Backend

```bash
cd backend

python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt
```

Create a `.env` file:

```env
GROQ_API_KEY=your_groq_api_key
```

Run the backend:

```bash
python app.py
```

Backend:

```text
http://localhost:5000
```

### Frontend

```bash
cd nexus-sync-front
npm install
npm run dev
```

Frontend:

```text
http://localhost:3000
```

---

## 🔐 Environment Variables

```env
GROQ_API_KEY=your_groq_api_key
```

> Never commit `.env` or API keys to the repository.

---

## 🚀 Future Scope

* PostgreSQL for scalable persistence
* User authentication and multi-user workspaces
* Speaker identification
* Semantic meeting search
* Calendar and Slack integrations
* Background processing for large recordings
* Cloud deployment and object storage

---

## 👩‍💻 Project Goal

**NexusSyncWorkspace transforms unstructured meeting conversations into structured, actionable intelligence — reducing the effort required to review meetings and track follow-up tasks.**
