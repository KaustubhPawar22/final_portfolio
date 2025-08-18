import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <div className=" text-center max-w-md">
        <h1 className="text-5xl font-bold mb-6 text-primary">404</h1>
        <p className="text-lg text-foreground/70 mb-8">
          Oopsie doopsie! <br></br>The page you are looking for does not exist.
        </p>
        <Link
          href="/"
          className="button-glass px-8 py-3 text-lg font-semibold inline-block"
        >
          Return Home
        </Link>
      </div>
    </main>
  );
}
