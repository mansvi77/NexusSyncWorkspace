NexusSync: Enterprise Operational Intelligence & Workforce Synchronization Engine

NexusSync is a high-performance, dual-layer automation platform designed to ingest unstructured meeting audio streams and convert them into structured corporate assets. By combining Digital Signal Processing (DSP), Speech-to-Text inference, and Deterministic LLM Structured Extraction, NexusSync automates project governance, tracks organizational sentiment, and maps team deliverables directly to a relational SQL persistence matrix.

🛰️ System Architecture Overview

 [ Next.js Frontend UI ]            [ Flask Backend Gateway ]          [ Groq Inference Hub ]
    (Local Port 3000)                  (Local Port 5000)                (Whisper & Llama 3.1)
           |                                   |                                  |
           | --- 1. POST FormData Binary ----> |                                  |
           |    (Raw Audio + Metadata)         |                                  |
           |                                   | --- 2. FFT Denoising (FFmpeg) -> |
           |                                   | --- 3. Whisper Speech-to-Text -> |
           |                                   | <-- 4. Raw Text Transcription -- |
           |                                   |                                  |
           |                                   | --- 5. Deterministic Llama JSON ->|
           |                                   | <-- 6. Structured Metadata ----- |
           |                                   |                                  |
           |                                   | --- 7. Commit SQLite Relational -|
           | <-- 8. Synchronized JSON Stream - |                                  |


📜 Original Project State vs. Enhanced State

Before modernization, the project (previously "SyncMind") existed as a legacy boilerplate application with critical structural, networking, and processing vulnerabilities:

Operational Area

Legacy Boilerplate State

Mansvi's Advanced Modernization Upgrades

User Interface (UI)

Standard blank white webpage with generic components, prone to rendering errors and missing layout boundaries.

Completely rebuilt into a premium Systems Dark Terminal Dashboard with glowing node indicators, customized metadata counters, and structured navigation menus.

AI Inference Stability

Bound to the deprecated llama3-70b-8192 model string, causing immediate API execution failures (HTTP 400) upon decommission.

Upgraded to the active production-grade llama-3.1-70b-versatile model, optimizing temperature to 0.0 for highly deterministic metadata extractions.

JSON Deserialization

Fragile string-to-object parsing, causing complete backend failures ("Data stream analytical breakdown failed") on minor formatting anomalies.

Engineered a Self-Healing Parser Layer utilizing multi-stage regular expressions to sanitize raw string outputs, strip markdown blocks, and strip trailing array commas.

State Persistence

Unprotected memory maps; dashboards wiped completely clean of technical telemetry upon basic browser refreshes.

Built an Asynchronous Local Storage Backup State Machine on the client layer, ensuring persistent layout hydration even during offline node states.

Casing & Normalization

Mismatched property keys (actionItems vs. action_items) causing silent data drops across the API-to-frontend bridge.

Built a Unified Key Normalization Mapping Layer on the SQLite relational commit pipeline to seamlessly handle camelCase and snake_case variations.

Workplace Visibility

Generic list formatting with no clear hierarchy or visual priority for team members.

Crafted a Personalization CSS Highlight Engine on the Tasks Panel, applying glowing Cisco-blue borders and a special (You) tag to tasks assigned to @Mansvi.

🛠️ Industrial-Grade Feature Matrix

1. Acoustic Digital Signal Processing (DSP)

Before transcription, raw acoustic wave patterns are cleaned using a high-performance FFmpeg process filter:

High-pass Filter (highpass=f=200): Eliminates low-end ambient hums like air conditioning rumbles or desk micro-vibrations.

Low-pass Filter (lowpass=f=3000): Cuts off high-frequency line hissing, static, and electrical interference.

FFT Noise Reduction (afftdn=nf=-25): Runs a Fast Fourier Transform algorithm to dynamically isolate human vocal frequencies from environment white noise.

2. Conversational Entity Extraction & Sentiment Analysis

Rather than relying on fragile keyword matching, the platform utilizes semantic analysis and Named Entity Recognition (NER) to map out structural deliverables:

Task Ownership: Syntax dependencies isolate action verbs to resolve assignments (e.g., matching tasks directly to @Mansvi, @Rahul, or @Manav).

Timeline Extraction: Isolates conversational deadlines (such as "this coming Wednesday by 6 PM") and maps them into clear database rows.

Sentiment Tracking: Categorizes organizational team dynamics (positive, tense, mixed, neutral) to detect structural velocity friction before it impacts deliverables.

3. Automated Organizational Knowledge Graph

Every ingested conversation automatically generates categorized topics and technical summaries. This builds a searchable internal corporate knowledge repository, reducing the onboarding overhead for joining systems engineers.

🚀 Setting Up the Local Workspace

Ensure you have your environment variables set. Inside the backend/ folder, create a hidden file named .env and assign your keys:

GROQ_API_KEY=gsk_your_actual_key_here


1. Running the Flask Backend Gateway

Navigate directly to your backend folder, activate your isolated virtual environment shell, install the required packages, and execute the server natively:

# Step into the backend node
cd backend

# Activate your virtual environment
.\venv\Scripts\activate

# Install verified system dependencies
pip install flask flask-cors python-dotenv groq

# Run your production Python server
python app.py


The console will verify connection bindings: * Running on http://127.0.0.1:5000/

2. Running the Next.js Systems UI

Open a secondary terminal tab in VS Code and execute the frontend development server:

# Step into the frontend node
cd nexus-sync-front

# Launch the hot-reloading development server
npm run dev


Open http://localhost:3000 inside your browser to view your live, persistent dashboard.

🤝 Enterprise Video-Conference Integrations

To scale this platform to commercial production-grade environments, three integration paths are supported:

Webhook Triggers (Async): Map a web endpoint (e.g. /api/zoom-webhook) directly into Zoom’s Developer Portal. When a meeting completes, Zoom triggers an asynchronous event delivering a temporary cloud storage URL to your backend. The Flask engine downloads the stream automatically, processes denoising, and commits the extracted tasks to the SQL database.

Virtual Bot Attendance (Real-Time): Implement WebRTC recording bots that join Zoom or Teams as silent participants. The bot captures real-time audio channels, packages them into small binary chunks (e.g., every 30 seconds), and streams them to the AI engine, updating tasks on the dashboard live during the call.

Virtual Loopback Routing (Hobbyist): Route live desktop meeting audio directly into the Python processing thread using a virtual hardware driver (such as VB-Audio Virtual Cable), letting the app capture feed arrays natively during presentations.

👤 Engineered By

Developed and modernized by Mansvi Thakur—specializing in Distributed Systems, Operational Intelligence, and Cognitive API Implementations.
