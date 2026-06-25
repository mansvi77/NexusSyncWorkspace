'use client'

export default function TasksPanel({ meetings, onToggle }) {
  const allTasks = meetings.flatMap(m => (m.action_items || []).map(t => ({ ...t, sourceNode: m.title })))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {allTasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, background: '#0b0f19', border: '1px solid #1e293b', borderRadius: 12, color: '#64748b', fontSize: 14 }}>Zero task metrics found in localized memory state maps.</div>
      ) : (
        allTasks.map(task => {
          // HIGHLIGHT LOGIC: Detect if the task is assigned to you
          const isMe = task.assignee?.toLowerCase() === 'mansvi'

          return (
            <div 
              key={task.id} 
              style={{ 
                background: '#111827', 
                // Highlights your specific task card with a sleek Cisco-blue edge border!
                border: isMe ? '1px solid #3b82f6' : '1px solid #1e293b', 
                borderRadius: 12, 
                padding: 20, 
                display: 'flex', 
                justify: 'space-between', 
                alignItems: 'center',
                boxShadow: isMe ? '0 0 12px rgba(59, 130, 246, 0.15)' : 'none'
              }}
            >
              <div>
                <p style={{ color: '#f8fafc', fontSize: 15, fontWeight: 500, margin: '0 0 6px' }}>{task.task}</p>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#64748b' }}>
                  <span>Origin: <strong style={{ color: '#94a3b8' }}>{task.sourceNode}</strong></span>
                  <span>Assignee: <strong style={{ color: isMe ? '#3b82f6' : '#94a3b8' }}>@{task.assignee} {isMe && '(You)'}</strong></span>
                </div>
              </div>
              <button onClick={() => onToggle(task.id)} style={{ padding: '8px 16px', background: task.completed ? '#10b981' : 'transparent', border: '1px solid #1e293b', color: task.completed ? 'white' : '#94a3b8', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                {task.completed ? '✓ Vector Resolved' : 'Resolve Trigger'}
              </button>
            </div>
          )
        })
      )}
    </div>
  )
}   