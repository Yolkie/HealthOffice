"use client";

import { HealthCheckForm } from "@/components/HealthCheckForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-4xl">
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-2">
            Monthly Office Health Check-Up
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground px-2">
            Report on office property conditions and submit maintenance requests
          </p>
        </div>

        <HealthCheckForm
          onSubmit={(data) => {
            console.log("Form submitted:", data);
          }}
          onError={(error) => {
            console.error("Form error:", error);
          }}
        />
      </div>
    </main>
  );
}


