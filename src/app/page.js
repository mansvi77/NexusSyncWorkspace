'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import UploadZone from '@/components/UploadZone'
import MeetingCard from '@/components/MeetingCard'
import MeetingDetail from '@/components/MeetingDetail'
import TasksPanel from '@/components/TasksPanel'
import StatsBar from '@/components/StatsBar'

export default function Home() {
  const [meetings, setMeetings] = useState([])
  const [selected, setSelected] = useState(null)
  const [view, setView] = useState('dashboard')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  const fetchMeetings = async () => {
    try {
      setError(null)
      // Matches the exact GET route in app.py
      const res = await fetch('http://localhost:5000/api/meetings')
      if (!res.ok) throw new Error('Failed to fetch meetings from server.')
      const data = await res.json()
      setMeetings(Array.isArray(data) ? data : [])
    } catch (err) {
      setError('Cannot connect to backend. Make sure your FastAPI server is active on port 5000.')
    }
  }

  useEffect(() => { 
    fetchMeetings() 
  }, [])

  const handleUpload = async (file, title) => {
    setUploading(true)
    setError(null)
    try {
      const form = new FormData()
      form.append('audio', file) // Matches request.files['audio'] in app.py
      form.append('title', title || file.name.replace(/\.[^.]+$/, '')) // Matches request.form['title']
      
      const res = await fetch('http://localhost:5000/api/transcribe', {
        method: 'POST', 
        body: form
      })
      
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Transcription pipeline failed')
      }
      
      // Refresh database records smoothly to populate the new item with all AI metrics
      await fetchMeetings()
      setView('dashboard')
    } catch (e) {
      setError(e.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/meetings/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete resource.')
      setSelected(null)
      fetchMeetings()
    } catch (e) {
      setError(e.message)
    }
  }

  const handleToggleTask = async (itemId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/action-items/${itemId}/toggle`, { method: 'PATCH' })
      if (!res.ok) throw new Error('Failed to update task state.')
      
      await fetchMeetings()
      
      // Keep selected detail panel context in sync with updated data matrices
      if (selected) {
        const detailRes = await fetch(`http://localhost:5000/api/meetings/${selected.id}`)
        if (detailRes.ok) {
          setSelected(await detailRes.json())
        }
      }
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f1117' }}>
      <Sidebar view={view} setView={setView} meetingCount={meetings.length} />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{
          padding: '20px 28px',
          borderBottom: '1px solid #2a3347',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#0f1117'
        }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: '#e8eaf0' }}>
              {view === 'dashboard' && 'Dashboard'}
              {view === 'tasks' && 'Action Items'}
              {view === 'upload' && 'New Recording'}
            </h1>
            <p style={{ fontSize: 13, color: '#7b8599', marginTop: 2 }}>
              {view === 'dashboard' && `${meetings.length} meetings processed`}
              {view === 'tasks' && 'Track your action items'}
              {view === 'upload' && 'Upload audio or video to transcribe'}
            </p>
          </div>
          {view === 'dashboard' && (
            <button
              onClick={() => setView('upload')}
              style={{
                background: '#6c63ff', color: 'white', border: 'none',
                borderRadius: 8, padding: '8px 16px', fontSize: 13,
                fontWeight: 500, cursor: 'pointer'
              }}
            >
              + New Recording
            </button>
          )}
        </div>

        {error && (
          <div style={{
            margin: '16px 28px 0', padding: '12px 16px',
            background: '#2d1515', border: '1px solid #ef4444',
            borderRadius: 8, color: '#ef4444', fontSize: 13
          }}>{error}</div>
        )}

        <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px' }}>
          {view === 'upload' && (
            <UploadZone onUpload={handleUpload} uploading={uploading} onCancel={() => setView('dashboard')} />
          )}
          {view === 'tasks' && (
            <TasksPanel meetings={meetings} onToggle={handleToggleTask} />
          )}
          {view === 'dashboard' && !selected && (
            <>
              <StatsBar meetings={meetings} />
              <div style={{ marginTop: 24 }}>
                {meetings.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 0', color: '#7b8599' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🎙️</div>
                    <p style={{ fontSize: 16, fontWeight: 500, color: '#e8eaf0' }}>No meetings yet</p>
                    <p style={{ fontSize: 13, marginTop: 6 }}>Upload a recording to get started</p>
                    <button
                      onClick={() => setView('upload')}
                      style={{
                        marginTop: 20, background: '#6c63ff', color: 'white',
                        border: 'none', borderRadius: 8, padding: '10px 20px',
                        fontSize: 14, cursor: 'pointer'
                      }}
                    >Upload Recording</button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                    {meetings.map(m => (
                      <MeetingCard key={m.id} meeting={m} onClick={() => setSelected(m)} />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
          {view === 'dashboard' && selected && (
            <MeetingDetail
              meeting={selected}
              onBack={() => setSelected(null)}
              onDelete={handleDelete}
              onToggleTask={handleToggleTask}
            />
          )}
        </div>
      </main>
    </div>
  )
}