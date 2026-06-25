'use client'

export default function StatsBar({ meetings }) {
  const totalTasks = meetings.flatMap(m => m.action_items || []).length
  const doneTasks = meetings.flatMap(m => m.action_items || []).filter(t => t.completed).length
  const sentiments = meetings.reduce((acc, m) => {
    if (m.sentiment) acc[m.sentiment] = (acc[m.sentiment] || 0) + 1
    return acc
  }, {})
  const topSentiment = Object.entries(sentiments).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'

  const stats = [
    { label: 'Meetings', val: meetings.length, color: '#6c63ff', icon: '🗂️' },
    { label: 'Action items', val: totalTasks, color: '#f59e0b', icon: '📋' },
    { label: 'Completed', val: doneTasks, color: '#22c55e', icon: '✅' },
    { label: 'Avg sentiment', val: topSentiment, color: '#7b8599', icon: '💬' },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 4 }}>
      {stats.map(s => (
        <div key={s.label} style={{
          background: '#161b27',
          border: '1px solid #2a3347',
          borderRadius: 10,
          padding: '16px 18px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: 22, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.val}</p>
              <p style={{ fontSize: 12, color: '#7b8599', marginTop: 4 }}>{s.label}</p>
            </div>
            <span style={{ fontSize: 20 }}>{s.icon}</span>
          </div>
        </div>
      ))}
    </div>
  )
}