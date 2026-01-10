"use client";

import { WishlistSection } from "@/components/account/WishlistSection";

export default function WishlistPage() {
  return (
    <main className="min-h-screen text-black">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <WishlistSection />
      </div>
    </main>
  );
}
