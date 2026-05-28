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
  hero: '/manus-storage/hero-delivery-tunisia_2914d89b.webp',
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

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } },
};

/* ── Section Wrapper with Scroll Animation ────────────────────────────────── */
function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={fadeInUp}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  return (
    <AppLayout>
      <div className="w-full bg-white overflow-hidden">
        {/* ═══════════════════════════════════════════════════════════════════════════ */}
        {/* HERO SECTION — Large Dynamic Image with Parallax ═════════════════════════ */}
        {/* ═══════════════════════════════════════════════════════════════════════════ */}
        <section className="relative w-full h-[600px] md:h-[700px] overflow-hidden bg-black">
          {/* Background Image with Parallax */}
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <img
              src={IMGS.hero}
              alt="Bysis Delivery Service"
              className="w-full h-full object-cover"
            />
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/40" />
          </motion.div>

          {/* Content Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-2xl"
            >
              <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
                Achetez depuis n'importe où, livré chez vous
              </h1>
              <p className="text-lg md:text-xl text-gray-100 mb-8">
                On commande pour vous sur les plus grandes plateformes mondiales et on livre directement en Tunisie. Prix en TND, livraison 20-25 jours.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-blue-600 text-white font-bold rounded-lg text-lg transition-all hover:shadow-lg"
                style={{ background: COLORS.blue }}
              >
                Commander maintenant
                <ArrowRight className="inline-block ml-2" size={20} />
              </motion.button>
            </motion.div>
          </div>

          {/* Scroll Indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-6 h-10 border-2 border-white rounded-full flex items-center justify-center">
              <div className="w-1 h-2 bg-white rounded-full" />
            </div>
          </motion.div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════════ */}
        {/* STATS SECTION ═════════════════════════════════════════════════════════════ */}
        {/* ═══════════════════════════════════════════════════════════════════════════ */}
        <AnimatedSection className="py-12 md:py-16 px-4 bg-black text-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {[
                { value: '170+', label: 'Commandes livrées' },
                { value: '98%', label: 'Satisfaction' },
                { value: '25j', label: 'Délai moyen' },
                { value: '3', label: 'Plateformes' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-black mb-2">{stat.value}</div>
                  <div className="text-sm md:text-base text-gray-300">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* ═══════════════════════════════════════════════════════════════════════════ */}
        {/* PLATFORMS SECTION ════════════════════════════════════════════════════════ */}
        {/* ═══════════════════════════════════════════════════════════════════════════ */}
        <AnimatedSection className="py-16 md:py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black text-center mb-4">Où on commande pour vous</h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Trois des plus grandes plateformes mondiales, accessibles depuis la Tunisie.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: 'SHEIN', emoji: '👗', desc: 'Mode & Tendances' },
                { name: 'AliExpress', emoji: '🛍️', desc: 'Tout & Moins Cher' },
                { name: 'Temu', emoji: '🎁', desc: 'Prix Imbattables' },
              ].map((platform, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 }}
                  whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                  className="p-8 bg-gray-50 rounded-xl border border-gray-200 text-center cursor-pointer transition-all"
                >
                  <div className="text-5xl mb-4">{platform.emoji}</div>
                  <h3 className="text-xl font-bold mb-2">{platform.name}</h3>
                  <p className="text-gray-600 text-sm">{platform.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* ═══════════════════════════════════════════════════════════════════════════ */}
        {/* HOW IT WORKS SECTION ═════════════════════════════════════════════════════ */}
        {/* ═══════════════════════════════════════════════════════════════════════════ */}
        <AnimatedSection className="py-16 md:py-20 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black text-center mb-4">Comment ça marche</h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              3 étapes simples pour recevoir vos achats internationaux en Tunisie.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: '1',
                  title: 'Commandez',
                  desc: 'Donnez-nous vos liens de produits préférés',
                  icon: Globe,
                },
                {
                  step: '2',
                  title: 'Nous achetons',
                  desc: 'Nous commandons pour vous sur les plateformes',
                  icon: Zap,
                },
                {
                  step: '3',
                  title: 'Livraison',
                  desc: 'Reçu chez vous en 20-25 jours',
                  icon: Truck,
                },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: i === 0 ? -40 : i === 2 ? 40 : 0 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.2 }}
                    className="relative"
                  >
                    <div className="flex flex-col items-center text-center">
                      <motion.div
                        whileHover={{ rotate: 10, scale: 1.1 }}
                        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                        style={{ background: COLORS.blue }}
                      >
                        <Icon size={32} color="white" />
                      </motion.div>
                      <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                    {i < 2 && (
                      <motion.div
                        className="hidden md:block absolute top-8 -right-4 text-2xl font-light text-gray-300"
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        →
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </AnimatedSection>

        {/* ═══════════════════════════════════════════════════════════════════════════ */}
        {/* GALLERY CAROUSEL ══════════════════════════════════════════════════════════ */}
        {/* ═══════════════════════════════════════════════════════════════════════════ */}
        <AnimatedSection className="py-16 md:py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black text-center mb-4">Voir nos clients heureux</h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Des milliers de clients satisfaits reçoivent leurs commandes chaque mois.
            </p>

            <Swiper
              modules={[Autoplay, Pagination, Navigation]}
              autoplay={{ delay: 4000 }}
              pagination={{ clickable: true }}
              navigation
              className="rounded-xl overflow-hidden"
              loop
            >
              {[IMGS.unboxing1, IMGS.unboxing2, IMGS.unboxing3, IMGS.couple, IMGS.womanPhone].map((img, i) => (
                <SwiperSlide key={i}>
                  <img src={img} alt={`Unboxing ${i + 1}`} className="w-full h-96 object-cover" />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </AnimatedSection>

        {/* ═══════════════════════════════════════════════════════════════════════════ */}
        {/* TESTIMONIALS SECTION ═════════════════════════════════════════════════════ */}
        {/* ═══════════════════════════════════════════════════════════════════════════ */}
        <AnimatedSection className="py-16 md:py-20 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black text-center mb-4">Ce que disent nos clients</h2>

            <Swiper
              modules={[Autoplay, Pagination]}
              autoplay={{ delay: 5000 }}
              pagination={{ clickable: true }}
              className="mt-12"
              loop
              breakpoints={{
                640: { slidesPerView: 1 },
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
            >
              {[
                {
                  name: 'Amira Ben Ali',
                  text: 'Livraison rapide et produits de qualité. Très satisfaite!',
                  rating: 5,
                  verified: true,
                },
                {
                  name: 'Mohamed Saïd',
                  text: 'Excellent service, prix compétitifs. Je recommande!',
                  rating: 5,
                  verified: true,
                },
                {
                  name: 'Fatima Trabelsi',
                  text: 'Première commande réussie. Merci Bysis!',
                  rating: 4,
                  verified: true,
                },
              ].map((testimonial, i) => (
                <SwiperSlide key={i}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="p-6 bg-white rounded-lg border border-gray-200 h-full flex flex-col"
                  >
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: testimonial.rating }).map((_, j) => (
                        <Star key={j} size={16} fill={COLORS.warning} color={COLORS.warning} />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-4 flex-grow">{testimonial.text}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm">{testimonial.name}</p>
                        {testimonial.verified && (
                          <p className="text-xs text-green-600 flex items-center gap-1">
                            <Check size={12} /> Achat vérifié
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </AnimatedSection>

        {/* ═══════════════════════════════════════════════════════════════════════════ */}
        {/* FEATURES SECTION ═════════════════════════════════════════════════════════ */}
        {/* ═══════════════════════════════════════════════════════════════════════════ */}
        <AnimatedSection className="py-16 md:py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black text-center mb-12">Pourquoi choisir Bysis?</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  icon: Shield,
                  title: 'Sécurisé',
                  desc: 'Vos données sont protégées avec les meilleures normes de sécurité.',
                },
                {
                  icon: Truck,
                  title: 'Livraison Fiable',
                  desc: 'Suivi en temps réel de votre commande jusqu\'à la livraison.',
                },
                {
                  icon: Zap,
                  title: 'Rapide',
                  desc: 'Traitement rapide de vos commandes et expédition en 48h.',
                },
                {
                  icon: Users,
                  title: 'Support 24/7',
                  desc: 'Notre équipe est toujours disponible pour vous aider.',
                },
              ].map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-6 bg-gray-50 rounded-lg border border-gray-200 flex gap-4"
                  >
                    <div className="flex-shrink-0">
                      <Icon size={32} color={COLORS.blue} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                      <p className="text-gray-600 text-sm">{feature.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </AnimatedSection>

        {/* ═══════════════════════════════════════════════════════════════════════════ */}
        {/* CTA SECTION ═══════════════════════════════════════════════════════════════ */}
        {/* ═══════════════════════════════════════════════════════════════════════════ */}
        <AnimatedSection className="py-16 md:py-20 px-4 bg-black text-white">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-black mb-6">Prêt à commencer?</h2>
            <p className="text-lg text-gray-300 mb-8">
              Rejoignez des milliers de clients satisfaits et commencez vos achats internationaux dès aujourd'hui.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-lg text-lg font-bold transition-all hover:shadow-lg"
              style={{ background: COLORS.blue, color: 'white' }}
            >
              Commander maintenant
              <ArrowRight className="inline-block ml-2" size={20} />
            </motion.button>
          </div>
        </AnimatedSection>
      </div>
    </AppLayout>
  );
}
