"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [status, setStatus] = useState("Checking backend...");

  useEffect(() => {
    async function checkBackend() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/health`
        );

        if (!response.ok) {
          throw new Error("Backend request failed");
        }

        const data = await response.json();

        setStatus(`${data.service}: ${data.status}`);
      } catch (error) {
        console.error(error);
        setStatus("Backend connection failed");
      }
    }

    checkBackend();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="rounded-xl border p-8">
        <h1 className="mb-4 text-2xl font-bold">
          Email Threat Intelligence
        </h1>

        <p>
          Backend status:{" "}
          <strong>{status}</strong>
        </p>
      </div>
    </main>
  );
}