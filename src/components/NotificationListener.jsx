import { useEffect } from 'react'
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'
import { Bell } from 'lucide-react'

export default function NotificationListener() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user?.uid) return

    // Listen for new notifications specifically for THIS user
    const q = query(
      collection(db, 'notifications'),
      where('targetUid', '==', user.uid),
      orderBy('sentAt', 'desc'),
      limit(1)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const notif = change.doc.data()
          // Only show if it's "fresh" (within last minute) to avoid showing old ones on load
          const isFresh = notif.sentAt?.toMillis() > (Date.now() - 60000)
          
          if (isFresh && Notification.permission === 'granted') {
             // System notification
             new Notification(notif.title, {
               body: notif.message,
               icon: '/logo.png' // Ensure this exists or use a generic icon
             })
          }
        }
      })
    })

    return () => unsubscribe()
  }, [user?.uid])

  return null // This is a logic-only component
}
