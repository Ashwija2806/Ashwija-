import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Banner } from '../types';

interface CarouselProps {
  banners: Banner[];
  intervalMs?: number;
}

export function Carousel({ banners, intervalMs = 5000 }: CarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || banners.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % banners.length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [isPaused, banners.length, intervalMs]);

  const goPrev = () => {
    setActiveIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % banners.length);
  };

  const current = banners[activeIndex];

  return (
    <section
      aria-label="Featured fashion campaigns"
      className="relative overflow-hidden bg-[#F5F5F6]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative h-[360px] w-full sm:h-[440px] lg:h-[520px]">
        <img
          src={current.image}
          alt={current.title}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-[50%_15%] transition-opacity duration-300"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#282C3F]/85 via-[#282C3F]/45 to-transparent"
          aria-hidden="true"
        />

        <div className="absolute inset-0 mx-auto flex max-w-[1440px] items-center px-6 sm:px-16 lg:px-20">
          <div className="max-w-xl text-white">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#FF905A]">
              {current.accentLabel}
            </p>
            <h1 className="mt-2 font-display text-3xl font-extrabold leading-tight tracking-tight text-balance sm:text-4xl lg:text-5xl">
              {current.title}
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/90 sm:text-base">
              {current.subtitle}
            </p>
            <div className="mt-6">
              <Link
                to={current.link}
                className="inline-flex items-center justify-center rounded bg-[#FF3F6C] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#E02D59] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                {current.ctaText}
              </Link>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous campaign slide"
          className="absolute top-1/2 left-3 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[#282C3F] shadow-sm transition hover:bg-white sm:flex"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={goNext}
          aria-label="Next campaign slide"
          className="absolute top-1/2 right-3 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[#282C3F] shadow-sm transition hover:bg-white sm:flex"
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2">
          {banners.map((b, idx) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setActiveIndex(idx)}
              aria-label={`Show slide ${idx + 1}: ${b.title}`}
              aria-current={idx === activeIndex ? 'true' : undefined}
              className={`h-2 rounded-full transition-all ${
                idx === activeIndex ? 'w-7 bg-[#FF3F6C]' : 'w-2 bg-white/70 hover:bg-white'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
