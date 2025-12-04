// In-memory presence registry.
// Could be upgraded later to Redis for scaling.

type PresenceRecord = {
  userId: string;
  online: boolean;
  lastSeen: number;
};

const presence = new Map<string, PresenceRecord>();

export function markOnline(userId: string) {
  presence.set(userId, {
    userId,
    online: true,
    lastSeen: Date.now(),
  });
}

export function markOffline(userId: string) {
  presence.set(userId, {
    userId,
    online: false,
    lastSeen: Date.now(),
  });
}

export function getPresence(userId: string) {
  return presence.get(userId) || { userId, online: false, lastSeen: 0 };
}

export function getAllPresence() {
  return Array.from(presence.values());
}
