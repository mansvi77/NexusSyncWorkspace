'use client'
const sc = { positive:'#22c55e', neutral:'#7b8599', mixed:'#f59e0b', tense:'#ef4444' }

export default function MeetingCard({ meeting, onClick }) {
  const pending = meeting.action_items?.filter(t => !t.completed).length || 0
  const total = meeting.action_items?.length || 0
  const date = new Date(meeting.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })

  return (
    <div onClick={onClick} style={{
      background:'#161b27', border:'1px solid #2a3347', borderRadius:12,
      padding:'18px 20px', cursor:'pointer', transition:'all 0.15s'
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor='#6c63ff55'; e.currentTarget.style.background='#1a2035' }}
    onMouseLeave={e => { e.currentTarget.style.borderColor='#2a3347'; e.currentTarget.style.background='#161b27' }}
    >
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
        <h3 style={{ fontSize:14, fontWeight:600, color:'#e8eaf0', flex:1, marginRight:8, lineHeight:1.4 }}>{meeting.title}</h3>
        {meeting.sentiment && (
          <span style={{ fontSize:11, color:sc[meeting.sentiment]||'#7b8599', background:(sc[meeting.sentiment]||'#7b8599')+'22', padding:'2px 8px', borderRadius:20, fontWeight:500, flexShrink:0 }}>
            {meeting.sentiment}
          </span>
        )}
      </div>

      {meeting.summary && (
        <p style={{ fontSize:12, color:'#7b8599', lineHeight:1.6, marginBottom:12, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
          {meeting.summary}
        </p>
      )}

      {meeting.topics?.length > 0 && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:12 }}>
          {meeting.topics.slice(0,3).map((t,i) => (
            <span key={i} style={{ fontSize:11, color:'#6c63ff', background:'#6c63ff18', padding:'2px 8px', borderRadius:20 }}>{t}</span>
          ))}
        </div>
      )}

      <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#7b8599' }}>
        <span>{date}</span>
        <span style={{ color: pending > 0 ? '#f59e0b' : '#22c55e' }}>
          {total === 0 ? 'No tasks' : pending > 0 ? `${pending} pending` : '✓ all done'}
        </span>
      </div>
    </div>
  )
}