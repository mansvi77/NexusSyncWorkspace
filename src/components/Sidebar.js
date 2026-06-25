'use client'

export default function Sidebar({ view, setView, meetingCount }) {
  const nav = [
    { id: 'dashboard', icon: '⊞', label: 'Dashboard' },
    { id: 'upload', icon: '↑', label: 'New Recording' },
    { id: 'tasks', icon: '✓', label: 'Action Items' },
  ]

  return (
    <aside style={{
      width: 220, background: '#161b27',
      borderRight: '1px solid #2a3347',
      display: 'flex', flexDirection: 'column', flexShrink: 0
    }}>
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #2a3347' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32,
            background: 'linear-gradient(135deg, #6c63ff, #8b5cf6)',
            borderRadius: 8, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 16
          }}>🧠</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#e8eaf0' }}>SyncMind</div>
            <div style={{ fontSize: 11, color: '#7b8599' }}>Meeting Intelligence</div>
          </div>
        </div>
      </div>

      <nav style={{ padding: '12px 10px', flex: 1 }}>
        <p style={{ fontSize: 10, color: '#7b8599', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 10px', marginBottom: 8 }}>Menu</p>
        {nav.map(item => (
          <button key={item.id} onClick={() => setView(item.id)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', borderRadius: 8, border: 'none',
            background: view === item.id ? '#6c63ff22' : 'transparent',
            color: view === item.id ? '#6c63ff' : '#7b8599',
            fontSize: 13, fontWeight: view === item.id ? 600 : 400,
            cursor: 'pointer', textAlign: 'left', marginBottom: 2
          }}>
            <span style={{ fontSize: 15, width: 20, textAlign: 'center' }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div style={{ padding: '14px 20px', borderTop: '1px solid #2a3347' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, background: '#6c63ff33',
            borderRadius: '50%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 13, color: '#6c63ff', fontWeight: 700
          }}>M</div>
          <div>
            <div style={{ color: '#e8eaf0', fontWeight: 500, fontSize: 13 }}>Mansvi</div>
            <div style={{ fontSize: 11, color: '#7b8599' }}>{meetingCount} meetings</div>
          </div>
        </div>
      </div>
    </aside>
  )
}