import json
import queue
from collections import defaultdict
from store import store

class NotificationService:
    # Dictionary mapping user_id to a list of their active queues
    _queues = defaultdict(list)

    @classmethod
    def listen(cls, user_id):
        """Returns a new queue for the user to listen for events."""
        q = queue.Queue()
        cls._queues[str(user_id)].append(q)
        return q

    @classmethod
    def unlisten(cls, user_id, q):
        """Removes the queue for the user."""
        try:
            cls._queues[str(user_id)].remove(q)
        except ValueError:
            pass

    @classmethod
    def send(cls, user_id, title, message, type="info", payload=None):
        """
        Creates a notification in the DB and broadcasts to any active SSE listeners.
        """
        notification_data = {
            "user_id": str(user_id),
            "type": type,
            "title": title,
            "message": message,
            "is_read": False,
            "payload": payload or {}
        }
        
        # Save to store
        notification = store.insert("notifications", notification_data)
        
        # Broadcast to active queues for this user
        sse_data = f"data: {json.dumps(notification)}\n\n"
        for q in cls._queues[str(user_id)]:
            try:
                q.put_nowait(sse_data)
            except queue.Full:
                pass
                
        return notification

