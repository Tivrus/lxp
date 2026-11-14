import { useRealtime } from '../realtime/RealtimeContext'
import { formatTime } from '../utils/format'

function ActivityPage() {
  const { activity, online, username } = useRealtime()

  return (
    <>
      <h2>Лента событий</h2>
      <div className="activity">
        {activity.length === 0 ? (
          <p className="muted">Событий пока нет</p>
        ) : (
          <ul className="feed">
            {activity.map((item) => (
              <li key={item.id}>
                <span className="time">{formatTime(item.created_at)}</span>
                {item.text}
              </li>
            ))}
          </ul>
        )}

        <aside className="online">
          <b>Онлайн ({online.length})</b>
          {online.map((user) => (
            <div key={user}>
              {user}
              {user === username && ' (вы)'}
            </div>
          ))}
        </aside>
      </div>
    </>
  )
}

export default ActivityPage
