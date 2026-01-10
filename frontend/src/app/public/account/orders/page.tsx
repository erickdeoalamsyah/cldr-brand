"use client";

import { AccountOrdersSection } from "@/components/account/AccountOrdersSection";
export default function orderPage() {
  return (
    <main className="min-h-screen text-black">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <AccountOrdersSection />
      </div>
    </main>
  );
}
