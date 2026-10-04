"use client";

import { he } from "@/lib/strings/he";

// Replaces the root layout when it fails, so it carries its own <html> and inline styles.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="he" dir="rtl">
      <body style={{ fontFamily: "Arial, system-ui, sans-serif", margin: 0, padding: 24, textAlign: "center" }}>
        <main>
          <h1>{he.error.title}</h1>
          <p>{he.error.body}</p>
          <button type="button" onClick={reset} style={{ minHeight: 44, padding: "0 16px", fontSize: 16 }}>
            {he.error.retry}
          </button>
        </main>
        <footer style={{ marginTop: 32, fontSize: 12 }}>
          <p>{he.disclaimer}</p>
        </footer>
      </body>
    </html>
  );
}
