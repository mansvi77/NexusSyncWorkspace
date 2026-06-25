'use client'
import { useState, useRef } from 'react'

export default function UploadZone({ onUpload, uploading, onCancel }) {
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [recording, setRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState(null)
  const [recordTime, setRecordTime] = useState(0)
  const fileRef = useRef()
  const mediaRef = useRef()
  const timerRef = useRef()
  const chunksRef = useRef([])

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) { setFile(f); setTitle(f.name.replace(/\.[^.]+$/, '')) }
  }

  const handleFile = (e) => {
    const f = e.target.files[0]
    if (f) { setFile(f); setTitle(f.name.replace(/\.[^.]+$/, '')) }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      chunksRef.current = []
      const mr = new MediaRecorder(stream)
      mediaRef.current = mr
      mr.ondataavailable = e => chunksRef.current.push(e.data)
      mr.onstop = () => {
        setRecordedBlob(new Blob(chunksRef.current, { type: 'audio/webm' }))
        stream.getTracks().forEach(t => t.stop())
      }
      mr.start(); setRecording(true); setRecordTime(0)
      timerRef.current = setInterval(() => setRecordTime(t => t + 1), 1000)
    } catch { alert('Microphone access denied.') }
  }

  const stopRecording = () => {
    mediaRef.current?.stop()
    clearInterval(timerRef.current)
    setRecording(false)
  }

  const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  const activeFile = recordedBlob
    ? new File([recordedBlob], 'recording.webm', { type: 'audio/webm' })
    : file

  return (
    <div style={{ maxWidth: 580, margin: '0 auto' }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, color: '#e8eaf0', marginBottom: 6 }}>Upload a Recording</h2>
      <p style={{ color: '#7b8599', fontSize: 13, marginBottom: 24 }}>
        Supports MP3, MP4, WAV, WEBM, M4A. Background noise filtered automatically.
      </p>

      <div style={{ marginBottom: 18 }}>
        <label style={{ fontSize: 13, color: '#7b8599', display: 'block', marginBottom: 6 }}>Meeting title</label>
        <input
          value={title} onChange={e => setTitle(e.target.value)}
          placeholder="e.g. Team standup, Client call..."
          style={{
            width: '100%', background: '#1e2535', border: '1px solid #2a3347',
            borderRadius: 8, padding: '10px 14px', color: '#e8eaf0', fontSize: 14, outline: 'none'
          }}
        />
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !file && fileRef.current.click()}
        style={{
          border: `2px dashed ${dragging ? '#6c63ff' : file ? '#22c55e' : '#2a3347'}`,
          borderRadius: 12, padding: '36px 24px', textAlign: 'center',
          cursor: file ? 'default' : 'pointer',
          background: dragging ? '#6c63ff11' : file ? '#22c55e0a' : '#161b27',
          marginBottom: 14
        }}
      >
        <input ref={fileRef} type="file" accept="audio/*,video/*" onChange={handleFile} style={{ display: 'none' }} />
        {file ? (
          <div>
            <div style={{ fontSize: 24, marginBottom: 6 }}>✅</div>
            <p style={{ color: '#22c55e', fontWeight: 500, fontSize: 14 }}>{file.name}</p>
            <p style={{ color: '#7b8599', fontSize: 12, marginTop: 4 }}>{(file.size/1024/1024).toFixed(2)} MB</p>
            <button onClick={e => { e.stopPropagation(); setFile(null) }} style={{
              marginTop: 10, background: 'transparent', border: '1px solid #2a3347',
              borderRadius: 6, padding: '4px 12px', color: '#7b8599', fontSize: 12, cursor: 'pointer'
            }}>Remove</button>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📁</div>
            <p style={{ color: '#e8eaf0', fontSize: 14, fontWeight: 500 }}>Drop file here or click to browse</p>
            <p style={{ color: '#7b8599', fontSize: 12, marginTop: 4 }}>MP3, MP4, WAV, WEBM, M4A</p>
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{ flex: 1, height: 1, background: '#2a3347' }} />
        <span style={{ color: '#7b8599', fontSize: 12 }}>or record from mic</span>
        <div style={{ flex: 1, height: 1, background: '#2a3347' }} />
      </div>

      {/* Mic */}
      <div style={{
        background: '#161b27', border: '1px solid #2a3347',
        borderRadius: 12, padding: '18px 24px', textAlign: 'center', marginBottom: 20
      }}>
        {recording ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
              <span style={{ color: '#ef4444', fontSize: 13, fontWeight: 500 }}>Recording {fmt(recordTime)}</span>
            </div>
            <button onClick={stopRecording} style={{
              background: '#ef4444', color: 'white', border: 'none',
              borderRadius: 8, padding: '8px 20px', fontSize: 13, cursor: 'pointer'
            }}>Stop</button>
          </div>
        ) : recordedBlob ? (
          <div>
            <p style={{ color: '#22c55e', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>✅ Recording ready ({fmt(recordTime)})</p>
            <button onClick={() => { setRecordedBlob(null); setRecordTime(0) }} style={{
              background: 'transparent', border: '1px solid #2a3347', borderRadius: 6,
              padding: '4px 12px', color: '#7b8599', fontSize: 12, cursor: 'pointer'
            }}>Discard</button>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 24, marginBottom: 8 }}>🎙️</div>
            <p style={{ color: '#7b8599', fontSize: 13, marginBottom: 10 }}>Record from your microphone</p>
            <button onClick={startRecording} style={{
              background: '#1e2535', color: '#e8eaf0', border: '1px solid #2a3347',
              borderRadius: 8, padding: '8px 20px', fontSize: 13, cursor: 'pointer'
            }}>Start Recording</button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onCancel} style={{
          flex: 1, background: 'transparent', border: '1px solid #2a3347',
          borderRadius: 8, padding: '11px', color: '#7b8599', fontSize: 13, cursor: 'pointer'
        }}>Cancel</button>
        <button
          onClick={() => onUpload(activeFile, title)}
          disabled={!activeFile || uploading}
          style={{
            flex: 2, background: activeFile && !uploading ? '#6c63ff' : '#2a3347',
            color: activeFile && !uploading ? 'white' : '#7b8599',
            border: 'none', borderRadius: 8, padding: '11px', fontSize: 13,
            fontWeight: 500, cursor: activeFile && !uploading ? 'pointer' : 'not-allowed'
          }}
        >
          {uploading ? '⏳ Transcribing... please wait' : 'Transcribe & Analyze'}
        </button>
      </div>
    </div>
  )
}