'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import AppLayout from '@/components/AppLayout';
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
  thankyou: '/manus-storage/Thankyou_95cdb69e.png',
  carousel1: '/manus-storage/BluePlayfulTypographicComingSoonFashionPoster-1_a6370ec0.png',
  carousel2: '/manus-storage/BluePlayfulTypographicComingSoonFashionPoster-2_ac6372e4.png',
  carousel3: '/manus-storage/BluePlayfulTypographicComingSoonFashionPoster-3_482eefd5.png',
  unboxing1: '/manus-storage/unboxing-clothes_5637a1dc.jpg',
  unboxing2: '/manus-storage/unboxing-happy_b2d19bf8.jpg',
  unboxing3: '/manus-storage/happy-unboxing_eda27441.jpg',
  couple: '/manus-storage/couple-phone_771f441d.jpg',
  womanPhone: '/manus-storage/woman-shopping-phone_0ed1d14c.jpg',
};

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

export default function Home() {
  return (
    <AppLayout>
      <div className="w-full bg-white overflow-hidden">
        {/* ═══════════════════════════════════════════════════════════════════════════ */}
        {/* HERO CAROUSEL ─ 3 Dynamic Rotating Images ═════════════════════════════════ */}
        {/* ═══════════════════════════════════════════════════════════════════════════ */}
        <section className="relative w-full h-[600px] md:h-[700px] overflow-hidden bg-white">
          <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            navigation={true}
            loop={true}
            className="w-full h-full"
          >
            {/* Slide 1: Thank You */}
            <SwiperSlide>
              <div className="relative w-full h-full">
                <img
                  src={IMGS.thankyou}
                  alt="Merci - Thank You"
                  className="w-full h-full object-cover"
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
                  <div className="hidden md:flex gap-4">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="w-32 h-40 rounded-xl overflow-hidden shadow-lg"
                    >
                      <img
                        src={IMGS.unboxing1}
                        alt="Product 1"
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="w-32 h-40 rounded-xl overflow-hidden shadow-lg"
                    >
                      <img
                        src={IMGS.unboxing2}
                        alt="Product 2"
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </SwiperSlide>

            {/* Slide 3: Livraison with Overlay */}
            <SwiperSlide>
              <div className="relative w-full h-full">
                <img
                  src={IMGS.carousel2}
                  alt="Livraison Rapide"
                  className="w-full h-full object-cover"
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
                    <h2 className="text-3xl md:text-4xl font-bold text-white">
                      Livraison Rapide
                    </h2>
                    <p className="text-sm md:text-base text-white opacity-90">
                      20-25 jours de livraison directe en Tunisie
                    </p>
                    <button
                      className="px-6 py-2 rounded-lg font-bold text-white transition-all hover:shadow-lg"
                      style={{ background: COLORS.blue }}
                    >
                      Commander
                    </button>
                  </div>

                  {/* Right Product Images */}
                  <div className="hidden md:flex gap-4">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="w-32 h-40 rounded-xl overflow-hidden shadow-lg"
                    >
                      <img
                        src={IMGS.unboxing3}
                        alt="Product 3"
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="w-32 h-40 rounded-xl overflow-hidden shadow-lg"
                    >
                      <img
                        src={IMGS.couple}
                        alt="Product 4"
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </SwiperSlide>

            {/* Slide 4: Coming Soon */}
            <SwiperSlide>
              <div className="relative w-full h-full">
                <img
                  src={IMGS.carousel3}
                  alt="Boutique Bysis - Coming Soon"
                  className="w-full h-full object-cover"
                />
              </div>
            </SwiperSlide>
          </Swiper>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════════ */}
        {/* FEATURES SECTION ═════════════════════════════════════════════════════════ */}
        {/* ═══════════════════════════════════════════════════════════════════════════ */}
        <section className="py-16 px-4 md:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-bold text-center mb-12"
              style={{ color: COLORS.charcoal }}
            >
              Pourquoi choisir Bysis?
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard
                icon={Truck}
                title="Livraison Rapide"
                description="20-25 jours de livraison directe en Tunisie"
              />
              <FeatureCard
                icon={Shield}
                title="Sécurisé"
                description="Paiement sécurisé et protection des données"
              />
              <FeatureCard
                icon={Zap}
                title="Prix Compétitifs"
                description="Meilleurs prix en dinars tunisiens"
              />
              <FeatureCard
                icon={Users}
                title="Support Client"
                description="Assistance 24/7 en français et arabe"
              />
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════════ */}
        {/* HOW IT WORKS SECTION ═════════════════════════════════════════════════════ */}
        {/* ═══════════════════════════════════════════════════════════════════════════ */}
        <section className="py-16 px-4 md:px-8" style={{ backgroundColor: COLORS.lightGray }}>
          <div className="max-w-6xl mx-auto">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-bold text-center mb-12"
              style={{ color: COLORS.charcoal }}
            >
              Comment ça marche?
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: 1, title: 'Choisissez', description: 'Sélectionnez vos produits sur Shein, AliExpress ou Temu' },
                { step: 2, title: 'Payez', description: 'Versez le montant en dinars tunisiens' },
                { step: 3, title: 'Recevez', description: 'Nous livrons directement chez vous en 20-25 jours' },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.2 }}
                  className="text-center"
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-2xl"
                    style={{ backgroundColor: COLORS.blue }}
                  >
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: COLORS.charcoal }}>
                    {item.title}
                  </h3>
                  <p style={{ color: COLORS.darkGray }}>{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════════ */}
        {/* CTA SECTION ═══════════════════════════════════════════════════════════════ */}
        {/* ═══════════════════════════════════════════════════════════════════════════ */}
        <section className="py-16 px-4 md:px-8 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-bold mb-6"
              style={{ color: COLORS.charcoal }}
            >
              Prêt à commander?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg mb-8"
              style={{ color: COLORS.darkGray }}
            >
              Commencez votre shopping maintenant et recevez vos produits directement chez vous!
            </motion.p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 text-white font-bold rounded-lg text-lg transition-all hover:shadow-lg"
              style={{ background: COLORS.blue }}
            >
              Commander maintenant
              <ArrowRight className="inline-block ml-2" size={20} />
            </motion.button>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
