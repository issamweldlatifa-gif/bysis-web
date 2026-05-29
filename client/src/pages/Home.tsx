import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import AppLayout from '@/components/AppLayout';
import { useBgColor } from '@/contexts/BgColorContext';

/* ── Image URLs ───────────────────────────────────────────────────────────── */
const IMGS = {
  boutique: '/manus-storage/BluePlayfulTypographicComingSoonFashionPoster-3_47ac2e8d.png',
};

/* ── Dominant color extracted from boutique image ────────────────────────── */
// python3: Average color = #8d847c (warm gray/beige)
const SLIDE_COLORS = ['#8d847c'];

/* ── Home Component ───────────────────────────────────────────────────────── */
function HomeContent() {
  const { setBgColor } = useBgColor();

  // Set initial background color on mount
  useEffect(() => {
    setBgColor(SLIDE_COLORS[0]);
  }, []);

  const handleSlideChange = (swiper: any) => {
    setBgColor(SLIDE_COLORS[swiper.realIndex % SLIDE_COLORS.length]);
  };

  return (
    <div className="w-full overflow-hidden">
      {/* HERO CAROUSEL */}
      <section className="relative w-full h-[600px] md:h-[700px] overflow-hidden">
        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          pagination={{ clickable: false }}
          navigation={false}
          loop={false}
          onSlideChange={handleSlideChange}
          className="w-full h-full"
        >
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

      {/* FOOTER SECTION */}
      <section className="w-full py-12 px-6 md:px-12 text-center bg-white">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">
          Pourquoi choisir Bysis?
        </h2>
        <p className="text-base md:text-lg mb-8 text-gray-600">
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
