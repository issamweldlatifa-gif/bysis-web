'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import AppLayout from '@/components/AppLayout';
import { useBgColor } from '@/contexts/BgColorContext';
import { ArrowRight, Check, Star, Truck, Shield, Zap, Users, Globe } from 'lucide-react';

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
  thankyou: '/manus-storage/Thankyou_compressed_3943c545.webp',
  carousel1: '/manus-storage/BluePlayfulTypographicComingSoonFashionPoster-1_compressed_6a8730f3.webp',
  carousel2: '/manus-storage/BluePlayfulTypographicComingSoonFashionPoster-2_compressed_a2ab5f0a.webp',
  carousel3: '/manus-storage/BluePlayfulTypographicComingSoonFashionPoster-3_compressed_bc735147.webp',
  unboxing1: '/manus-storage/unboxing-clothes_5637a1dc.jpg',
  unboxing2: '/manus-storage/unboxing-happy_b2d19bf8.jpg',
  unboxing3: '/manus-storage/happy-unboxing_eda27441.jpg',
  couple: '/manus-storage/couple-phone_771f441d.jpg',
  womanPhone: '/manus-storage/woman-shopping-phone_0ed1d14c.jpg',
};

/* ── Slide Background Colors (Predefined) ────────────────────────────────── */
const SLIDE_COLORS = [
  '#1a1a2e', // Dark blue for thankyou
  '#e8f4f8', // Light cyan for carousel1
  '#0047AB', // Blue for carousel2
  '#1a5f3f', // Green for carousel3
];

/* ── Animation Variants ───────────────────────────────────────────────────── */
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
};

const fadeInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
};

/* ── Feature Card Component ───────────────────────────────────────────────── */
function FeatureCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={fadeInUp}
      className="p-6 bg-white border border-gray-200 rounded-lg text-center hover:shadow-lg transition-shadow"
    >
      <div className="flex justify-center mb-4">
        <Icon size={40} style={{ color: COLORS.blue }} />
      </div>
      <h3 className="text-lg font-bold mb-2" style={{ color: COLORS.charcoal }}>
        {title}
      </h3>
      <p className="text-sm" style={{ color: COLORS.darkGray }}>
        {description}
      </p>
    </motion.div>
  );
}

/* ── Home Component ───────────────────────────────────────────────────────── */
function HomeContent() {
  const { setBgColor } = useBgColor();

  const handleSlideChange = (swiper: any) => {
    setBgColor(SLIDE_COLORS[swiper.realIndex % SLIDE_COLORS.length]);
  };

  return (
    <div className="w-full overflow-hidden bg-white">
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* HERO CAROUSEL ─ 3 Dynamic Rotating Images ═════════════════════════════════ */}
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
          {/* Slide 1: Thank You */}
          <SwiperSlide>
            <div className="relative w-full h-full">
              <img
                src={IMGS.thankyou}
                alt="Merci - Thank You"
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          </SwiperSlide>

          {/* Slide 2: Collection with Overlay */}
          <SwiperSlide>
            <div className="relative w-full h-full">
              <img
                src={IMGS.carousel1}
                alt="Collection - Mode & Accessoires"
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
              {/* Overlay Banner */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 flex items-center justify-between px-6 md:px-12"
                style={{ background: 'rgba(0,0,0,0.3)' }}
              >
                {/* Left Content */}
                <div className="flex flex-col justify-center gap-4 max-w-xs">
                  <h2 className="text-3xl md:text-4xl font-bold text-white" style={{ color: COLORS.white }}>
                    Collection Mode
                  </h2>
                  <p className="text-sm md:text-base text-white opacity-90">
                    Découvrez nos dernières tendances en mode et accessoires
                  </p>
                  <button
                    className="px-6 py-2 rounded-lg font-bold text-white transition-all hover:shadow-lg"
                    style={{ background: COLORS.blue }}
                  >
                    Découvrir
                  </button>
                </div>

                {/* Right Product Images */}
                <div className="hidden md:flex gap-3">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-16 h-24 rounded-lg overflow-hidden shadow-md opacity-75"
                  >
                    <img
                      src={IMGS.unboxing1}
                      alt="Product 1"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-16 h-24 rounded-lg overflow-hidden shadow-md opacity-75"
                  >
                    <img
                      src={IMGS.unboxing2}
                      alt="Product 2"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-16 h-24 rounded-lg overflow-hidden shadow-md opacity-75"
                  >
                    <img
                      src={IMGS.unboxing3}
                      alt="Product 3"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </SwiperSlide>

          {/* Slide 3: Promo */}
          <SwiperSlide>
            <div className="relative w-full h-full">
              <img
                src={IMGS.carousel2}
                alt="Promo - Offres Spéciales"
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 flex items-center justify-between px-6 md:px-12"
                style={{ background: 'rgba(0,0,0,0.3)' }}
              >
                <div className="flex flex-col justify-center gap-4 max-w-xs">
                  <h2 className="text-3xl md:text-4xl font-bold text-white">
                    Offres Spéciales
                  </h2>
                  <p className="text-sm md:text-base text-white opacity-90">
                    Profitez de réductions exceptionnelles sur vos produits préférés
                  </p>
                  <button
                    className="px-6 py-2 rounded-lg font-bold text-white transition-all hover:shadow-lg"
                    style={{ background: COLORS.warning }}
                  >
                    Voir les Offres
                  </button>
                </div>

                <div className="hidden md:flex gap-3">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-16 h-24 rounded-lg overflow-hidden shadow-md opacity-75"
                  >
                    <img
                      src={IMGS.couple}
                      alt="Product 4"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-16 h-24 rounded-lg overflow-hidden shadow-md opacity-75"
                  >
                    <img
                      src={IMGS.womanPhone}
                      alt="Product 5"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </SwiperSlide>

          {/* Slide 4: New Collection */}
          <SwiperSlide>
            <div className="relative w-full h-full">
              <img
                src={IMGS.carousel3}
                alt="New Collection"
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 flex items-center justify-between px-6 md:px-12"
                style={{ background: 'rgba(0,0,0,0.3)' }}
              >
                <div className="flex flex-col justify-center gap-4 max-w-xs">
                  <h2 className="text-3xl md:text-4xl font-bold text-white">
                    Nouvelle Collection
                  </h2>
                  <p className="text-sm md:text-base text-white opacity-90">
                    Explorez nos dernières créations et tendances du moment
                  </p>
                  <button
                    className="px-6 py-2 rounded-lg font-bold text-white transition-all hover:shadow-lg"
                    style={{ background: COLORS.success }}
                  >
                    Explorer
                  </button>
                </div>

                <div className="hidden md:flex gap-3">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-16 h-24 rounded-lg overflow-hidden shadow-md opacity-75"
                  >
                    <img
                      src={IMGS.unboxing1}
                      alt="Product 6"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-16 h-24 rounded-lg overflow-hidden shadow-md opacity-75"
                  >
                    <img
                      src={IMGS.unboxing3}
                      alt="Product 7"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </SwiperSlide>
        </Swiper>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* WHY CHOOSE BYSIS ─ Feature Section ═════════════════════════════════════════ */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-white">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="max-w-6xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ color: COLORS.charcoal }}>
            Pourquoi choisir Bysis?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={Truck}
              title="Livraison Rapide"
              description="Livraison gratuite et rapide partout en Tunisie"
            />
            <FeatureCard
              icon={Shield}
              title="Sécurisé"
              description="Paiement sécurisé et protection des données"
            />
            <FeatureCard
              icon={Zap}
              title="Qualité Premium"
              description="Produits sélectionnés avec soin"
            />
            <FeatureCard
              icon={Users}
              title="Support 24/7"
              description="Équipe dédiée à votre service"
            />
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* CTA SECTION ──────────────────────────────────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 px-4 md:px-8" style={{ background: COLORS.blue }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Prêt à commencer?
          </h2>
          <p className="text-lg text-white opacity-90 mb-8">
            Rejoignez des milliers de clients satisfaits et découvrez notre sélection exclusive
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 rounded-lg font-bold text-lg transition-all hover:shadow-lg flex items-center gap-2 mx-auto"
            style={{ background: COLORS.white, color: COLORS.blue }}
          >
            Commencer maintenant
            <ArrowRight size={20} />
          </motion.button>
        </motion.div>
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
