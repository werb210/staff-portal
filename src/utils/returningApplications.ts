import type { ReturningApplication } from '../types/auth';

const STORAGE_KEY = 'bf_staff_portal_recent_apps';
const isBrowser = typeof window !== 'undefined';

function sanitise(apps: ReturningApplication[]): ReturningApplication[] {
  return apps
    .filter((app) => Boolean(app.id))
    .map((app) => ({
      id: app.id,
      businessName: app.businessName,
      stage: app.stage,
      status: app.status,
      updatedAt: app.updatedAt,
    }));
}

export function loadReturningApplications(): ReturningApplication[] {
  if (!isBrowser) return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as ReturningApplication[];
    if (!Array.isArray(parsed)) return [];
    return sanitise(parsed);
  } catch (error) {
    console.warn('Failed to parse returning applications cache', error);
    return [];
  }
}

export function saveReturningApplications(apps: ReturningApplication[]) {
  if (!isBrowser) return;
  const payload = JSON.stringify(sanitise(apps).slice(0, 8));
  window.localStorage.setItem(STORAGE_KEY, payload);
}

export function mergeReturningApplications(apps: ReturningApplication[]) {
  if (apps.length === 0) return;
  const existing = loadReturningApplications();
  const map = new Map<string, ReturningApplication>();
  [...apps, ...existing].forEach((app) => {
    if (!map.has(app.id)) {
      map.set(app.id, app);
    }
  });
  saveReturningApplications(Array.from(map.values()));
}

export function rememberApplication(app: ReturningApplication) {
  mergeReturningApplications([app]);
}
