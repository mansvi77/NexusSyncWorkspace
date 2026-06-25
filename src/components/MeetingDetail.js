'use client'
import { useState } from 'react'

const priorityColor = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e' }
const sentimentColor = { positive: '#22c55e', neutral: '#7b8599', mixed: '#f59e0b', tense: '#ef4444' }

export default function MeetingDetail({ meeting, onBack, onDelete, onToggleTask }) {
  const [tab, setTab] = useState('summary')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const date = new Date(meeting.created_at).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  const tabs = [
    { id: 'summary', label: 'Summary' },
    { id: 'transcript', label: 'Transcript' },
    { id: 'tasks', label: `Tasks (${meeting.action_items?.length || 0})` },
    { id: 'decisions', label: 'Decisions' },
  ]

  return (
    <div style={{ maxWidth: 780 }}>
      {/* Back button + title */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={onBack} style={{
          background: 'none', border: 'none', color: '#7b8599',
          fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 12,
          display: 'flex', alignItems: 'center', gap: 6
        }}>← Back to dashboard</button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#e8eaf0', marginBottom: 4 }}>{meeting.title}</h2>
            <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#7b8599', flexWrap: 'wrap' }}>
              <span>{date}</span>
              {meeting.duration && <span>⏱ {meeting.duration}</span>}
              {meeting.sentiment && (
                <span style={{ color: sentimentColor[meeting.sentiment] }}>● {meeting.sentiment}</span>
              )}
            </div>
          </div>
          <button
            onClick={() => setConfirmDelete(true)}
            style={{
              background: 'transparent', border: '1px solid #2a3347', borderRadius: 8,
              color: '#ef4444', padding: '6px 12px', fontSize: 12, cursor: 'pointer'
            }}
          >Delete</button>
        </div>

        {confirmDelete && (
          <div style={{
            marginTop: 12, padding: '12px 16px',
            background: '#2d1515', border: '1px solid #ef4444', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <span style={{ color: '#ef4444', fontSize: 13 }}>Delete this meeting permanently?</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setConfirmDelete(false)} style={{
                background: 'transparent', border: '1px solid #2a3347', borderRadius: 6,
                color: '#7b8599', padding: '4px 12px', fontSize: 12, cursor: 'pointer'
              }}>Cancel</button>
              <button onClick={() => onDelete(meeting.id)} style={{
                background: '#ef4444', border: 'none', borderRadius: 6,
                color: 'white', padding: '4px 12px', fontSize: 12, cursor: 'pointer'
              }}>Delete</button>
            </div>
          </div>
        )}
      </div>

      {/* Topics */}
      {meeting.topics?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
          {meeting.topics.map((t, i) => (
            <span key={i} style={{
              fontSize: 12, color: '#6c63ff', background: '#6c63ff18',
              padding: '4px 10px', borderRadius: 20
            }}>{t}</span>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 20, borderBottom: '1px solid #2a3347', paddingBottom: 0 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: 'none', border: 'none', padding: '8px 16px',
            fontSize: 13, cursor: 'pointer',
            color: tab === t.id ? '#6c63ff' : '#7b8599',
            borderBottom: tab === t.id ? '2px solid #6c63ff' : '2px solid transparent',
            fontWeight: tab === t.id ? 600 : 400,
            marginBottom: -1
          }}>{t.label}</button>
        ))}
      </div>

      {/* Summary tab */}
      {tab === 'summary' && (
        <div>
          {meeting.summary && (
            <div style={{
              background: '#161b27', border: '1px solid #2a3347',
              borderRadius: 10, padding: '16px 20px', marginBottom: 16
            }}>
              <p style={{ fontSize: 13, color: '#7b8599', marginBottom: 6, fontWeight: 500 }}>Overview</p>
              <p style={{ fontSize: 14, color: '#e8eaf0', lineHeight: 1.7 }}>{meeting.summary}</p>
            </div>
          )}

          {meeting.key_points?.length > 0 && (
            <div style={{
              background: '#161b27', border: '1px solid #2a3347',
              borderRadius: 10, padding: '16px 20px'
            }}>
              <p style={{ fontSize: 13, color: '#7b8599', marginBottom: 12, fontWeight: 500 }}>Key Points</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {meeting.key_points.map((pt, i) => (
                  <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ color: '#6c63ff', marginTop: 2, flexShrink: 0 }}>▸</span>
                    <span style={{ fontSize: 14, color: '#e8eaf0', lineHeight: 1.6 }}>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Transcript tab */}
      {tab === 'transcript' && (
        <div style={{
          background: '#161b27', border: '1px solid #2a3347',
          borderRadius: 10, padding: '20px',
          maxHeight: '60vh', overflowY: 'auto'
        }}>
          <p style={{ fontSize: 14, color: '#e8eaf0', lineHeight: 1.9, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
            {meeting.transcript || 'No transcript available.'}
          </p>
        </div>
      )}

      {/* Tasks tab */}
      {tab === 'tasks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {!meeting.action_items?.length ? (
            <p style={{ color: '#7b8599', fontSize: 14 }}>No action items found in this meeting.</p>
          ) : meeting.action_items.map(item => (
            <div key={item.id} style={{
              background: '#161b27', border: '1px solid #2a3347',
              borderRadius: 10, padding: '14px 16px',
              display: 'flex', gap: 14, alignItems: 'flex-start',
              opacity: item.completed ? 0.6 : 1
            }}>
              <button
                onClick={() => onToggleTask(item.id)}
                style={{
                  width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1,
                  border: `2px solid ${item.completed ? '#22c55e' : '#2a3347'}`,
                  background: item.completed ? '#22c55e' : 'transparent',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                {item.completed && <span style={{ color: 'white', fontSize: 11 }}>✓</span>}
              </button>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: 14, color: '#e8eaf0',
                  textDecoration: item.completed ? 'line-through' : 'none',
                  marginBottom: 6
                }}>{item.task}</p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 12 }}>
                  <span style={{ color: '#6c63ff' }}>@{item.assignee}</span>
                  {item.deadline && <span style={{ color: '#7b8599' }}>📅 {item.deadline}</span>}
                  <span style={{
                    color: priorityColor[item.priority] || '#7b8599',
                    background: (priorityColor[item.priority] || '#7b8599') + '22',
                    padding: '1px 8px', borderRadius: 20, fontWeight: 500
                  }}>{item.priority}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Decisions tab */}
      {tab === 'decisions' && (
        <div style={{
          background: '#161b27', border: '1px solid #2a3347',
          borderRadius: 10, padding: '16px 20px'
        }}>
          {!meeting.decisions?.length ? (
            <p style={{ color: '#7b8599', fontSize: 14 }}>No decisions recorded.</p>
          ) : (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {meeting.decisions.map((d, i) => (
                <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ color: '#22c55e', flexShrink: 0, marginTop: 2 }}>✓</span>
                  <span style={{ fontSize: 14, color: '#e8eaf0', lineHeight: 1.6 }}>{d}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}