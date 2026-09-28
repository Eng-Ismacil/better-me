"use client";

/**
 * Tiny in-memory store for notification count.
 * Prevents multiple components from making duplicate API calls.
 * Polls once every 60s across the whole app (not per-component).
 */

type Listener = (count: number) => void;

let unreadCount = 0;
let lastFetchedAt = 0;
const listeners = new Set<Listener>();
let pollTimer: NodeJS.Timeout | null = null;

function notify() {
  listeners.forEach((fn) => fn(unreadCount));
}

async function fetchNotifications() {
  try {
    const res = await fetch("/api/notifications", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (typeof data.unreadCount === "number") {
        unreadCount = data.unreadCount;
        lastFetchedAt = Date.now();
        notify();
      }
    }
  } catch {}
}

function startPolling() {
  if (pollTimer) return; // already running
  fetchNotifications();  // immediate first load
  pollTimer = setInterval(fetchNotifications, 60_000);
}

if (typeof window !== "undefined") {
  startPolling();
}

export function subscribeToNotifications(fn: Listener): () => void {
  listeners.add(fn);
  // Immediately give the subscriber the current value
  fn(unreadCount);
  // If cache is stale (> 5 min) or never fetched, refresh
  if (Date.now() - lastFetchedAt > 300_000) fetchNotifications();
  return () => listeners.delete(fn);
}

export function getUnreadCount() {
  return unreadCount;
}
