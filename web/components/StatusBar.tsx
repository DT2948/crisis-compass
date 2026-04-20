"use client";

import { useEffect, useState } from "react";

function formatSecondsAgo(lastUpdatedAt: number | null, now: number): string {
  if (!lastUpdatedAt) {
    return "never";
  }

  return `${Math.max(0, Math.floor((now - lastUpdatedAt) / 1000))} seconds ago`;
}

export function StatusBar({
  lastUpdatedAt,
  totalAlerts,
}: {
  lastUpdatedAt: number | null;
  totalAlerts: number;
}) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <footer className="flex items-center justify-between border-t border-line/70 px-6 py-3 text-xs uppercase tracking-[0.18em] text-muted">
      <span>Centered on Pennsylvania • Response state coding active</span>
      <span>Gap alerts: {totalAlerts} • Last updated {formatSecondsAgo(lastUpdatedAt, now)}</span>
    </footer>
  );
}
