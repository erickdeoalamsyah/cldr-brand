import Link from "next/link";
import { HeroCarousel } from "@/components/HeroCarousel";

export default function HomePage() {
  return (
    <main className=" bg-white">
      {/* FULL-WIDTH CAROUSEL */}
      <HeroCarousel />
    </main>
  );
}
