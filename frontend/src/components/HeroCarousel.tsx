"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";

import Hero1 from "../../public/assets/home1.webp";
import Hero2 from "../../public/assets/home2.webp";
import Hero3 from "../../public/assets/home3.webp";

const slides = [
  {
    src: Hero2,
    alt: "CLRD crew in front of car",
  },
  {
    src: Hero3,
    alt: "Streetwear lookbook rooftop",
  },
  {
    src: Hero1,
    alt: "Friends hanging out in CLRD fits",
  },
];

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const total = slides.length;

  const goTo = useCallback(
    (index: number) => {
      if (isAnimating) return;
      setIsAnimating(true);
      setCurrent((index + total) % total);
      setTimeout(() => setIsAnimating(false), 700);
    },
    [isAnimating, total]
  );

  const next = useCallback(() => {
    goTo(current + 1);
  }, [current, goTo]);

  const prev = useCallback(() => {
    goTo(current - 1);
  }, [current, goTo]);

  // Auto-rotate dengan pause on hover
  useEffect(() => {
    const id = setInterval(() => {
      if (!isAnimating) {
        setCurrent((c) => (c + 1) % total);
      }
    }, 8000);
    return () => clearInterval(id);
  }, [total, isAnimating]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prev, next]);

  return (
    <div className="relative w-full overflow-hidden bg-black">
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ 
          transform: `translateX(-${current * 100}%)`,
          willChange: 'transform'
        }}
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            /* PERUBAHAN DISINI: 
               1. Gunakan w-full agar selebar layar.
               2. Gunakan aspect-[4/3] agar tinggi otomatis menyesuaikan lebar (4:3).
               3. Di layar mobile biasanya 4:3 terlalu pendek, 
                  kita bisa pakai aspect-[3/4] atau 1/1 (square) jika ingin lebih tinggi, 
                  tapi jika request Anda murni 4:3 di semua device, cukup aspect-[4/3].
            */
            className="relative w-full aspect-[4/3] flex-shrink-0"
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={i === 0}
              quality={90}
              placeholder="blur"
              sizes="100vw"
              /* object-cover memastikan gambar memenuhi container 4:3 
                 tanpa merusak rasio asli gambarnya. 
              */
              className="object-cover object-center"
            />
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      {/* ... kode button tetap sama ... */}

      {/* Dots Indicator */}
      <div className="absolute inset-x-0 bottom-6 z-10 flex justify-center">
        <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-4 py-2 backdrop-blur-md">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goTo(index)}
              disabled={isAnimating}
              className={`group transition-all duration-300 ${
                current === index ? "w-10" : "w-2.5"
              }`}
            >
              <span
                className={`block h-2.5 rounded-full transition-all duration-300 ${
                  current === index
                    ? "bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]"
                    : "bg-white/40 group-hover:bg-white/70"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}