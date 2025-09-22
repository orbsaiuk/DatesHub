export async function trackEvent(type, properties = {}) {
  try {
    await fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        path:
          typeof window !== "undefined" ? window.location.pathname : undefined,
        properties,
      }),
      keepalive: true,
    });
  } catch {}
}
