import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import AppLayout from '@/components/AppLayout';
import { useBgColor } from '@/contexts/BgColorContext';

/* ── Color Palette ────────────────────────────────────────────────────────── */
const COLORS = {
  black: '#0A0A0A',
  white: '#FFFFFF',
  blue: '#0047AB',
  charcoal: '#2D2D2D',
  darkGray: '#4A4A4A',
  lightGray: '#E0E0E0',
  success: '#28A745',
  warning: '#FFC107',
  error: '#DC3545',
};

/* ── Image URLs ───────────────────────────────────────────────────────────── */
const IMGS = {
  boutique: '/manus-storage/BluePlayfulTypographicComingSoonFashionPoster-3_47ac2e8d.png',
};

/* ── Slide Background Colors ──────────────────────────────────────────────── */
const SLIDE_COLORS = ['#C0C0C0']; // Gray for boutique image (matching the image color)

/* ── Home Component ───────────────────────────────────────────────────────── */
function HomeContent() {
  const { setBgColor } = useBgColor();

  const handleSlideChange = (swiper: any) => {
    setBgColor(SLIDE_COLORS[swiper.realIndex % SLIDE_COLORS.length]);
  };

  return (
    <div className="w-full overflow-hidden bg-white">
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* HERO CAROUSEL ─ Single Boutique Image ═════════════════════════════════════ */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="relative w-full h-[600px] md:h-[700px] overflow-hidden">
        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation={false}
          loop={true}
          onSlideChange={handleSlideChange}
          className="w-full h-full"
        >
          {/* Slide: Boutique Bysis */}
          <SwiperSlide>
            <div className="relative w-full h-full">
              <img
                src={IMGS.boutique}
                alt="Boutique Bysis - Coming Soon"
                className="w-full h-full object-cover"
                loading="eager"
                decoding="async"
              />
            </div>
          </SwiperSlide>
        </Swiper>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* FOOTER SECTION ═══════════════════════════════════════════════════════════ */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="w-full py-12 px-6 md:px-12 text-center bg-white">
        <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: COLORS.charcoal }}>
          Pourquoi choisir Bysis?
        </h2>
        <p className="text-base md:text-lg mb-8" style={{ color: COLORS.darkGray }}>
          Votre partenaire de confiance pour vos achats en ligne
        </p>
      </section>
    </div>
  );
}

export default function Home() {
  return (
    <AppLayout>
      <HomeContent />
    </AppLayout>
  );
}
