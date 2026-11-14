import { useRealtime } from '../realtime/RealtimeContext'

function Notifications() {
  const { notifications, dismissNotification } = useRealtime()

  return (
    <div className="notifications" aria-live="polite">
      {notifications.map((notification) => (
        <div key={notification.id} className="notification" onClick={() => dismissNotification(notification.id)}>
          {notification.text}
        </div>
      ))}
    </div>
  )
}

export default Notifications
