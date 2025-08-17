import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <Link
        to="/"
        className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
      >
        Return to Home
      </Link>
    </main>
  );
}
