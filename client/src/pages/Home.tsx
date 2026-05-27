'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Home, Grid3x3, TrendingUp, ShoppingCart, User, Plus, Search, Star, Truck, Shield, Clock, ArrowRight } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function HomePage() {
  const { ref: statsRef, inView: statsInView } = useInView({ threshold: 0.1 });
  const { ref: featuresRef, inView: featuresInView } = useInView({ threshold: 0.1 });
  const { ref: testimonialsRef, inView: testimonialsInView } = useInView({ threshold: 0.1 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <AppLayout>
      {/* Hero Section with Large Image */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative h-96 w-full overflow-hidden bg-gradient-to-b from-[#F5F5F5] to-white"
      >
        <img
          src="/manus-storage/9vxTX23dpFU4_983af5df.jpg"
          alt="International Shopping"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="max-w-2xl px-4 text-4xl font-bold text-white md:text-5xl"
          >
            Achetez depuis n'importe où, livré chez vous
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-4 max-w-xl px-4 text-lg text-white/90"
          >
            Commandez sur les plus grandes plateformes mondiales et nous livrons directement en Tunisie
          </motion.p>
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#FF9900] px-6 py-3 font-bold text-white transition-all hover:bg-[#E68A00] active:scale-95"
          >
            <Plus size={20} />
            Commencer maintenant
          </motion.button>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        ref={statsRef}
        variants={containerVariants}
        initial="hidden"
        animate={statsInView ? 'visible' : 'hidden'}
        className="bg-white py-12 px-4"
      >
        <div className="container mx-auto grid grid-cols-3 gap-4 max-w-6xl md:gap-8">
          {[
            { label: '170+', desc: 'Commandes' },
            { label: '98%', desc: 'Satisfaction' },
            { label: '25j', desc: 'Livraison' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="flex flex-col items-center justify-center rounded-lg bg-[#F5F5F5] p-4 md:p-6"
            >
              <div className="text-2xl font-bold text-[#333333] md:text-3xl">{stat.label}</div>
              <div className="text-sm text-[#666666] md:text-base">{stat.desc}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Platforms Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="bg-[#F5F5F5] py-12 px-4"
      >
        <div className="container mx-auto max-w-6xl">
          <motion.h2
            variants={itemVariants}
            className="mb-8 text-center text-2xl font-bold text-[#333333] md:text-3xl"
          >
            Plateformes Disponibles
          </motion.h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { name: 'Shein', desc: 'Mode & Accessoires' },
              { name: 'AliExpress', desc: 'Électronique & Maison' },
              { name: 'Temu', desc: 'Tendances & Gadgets' },
            ].map((platform, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="flex flex-col items-center justify-center rounded-lg border border-[#EEEEEE] bg-white p-6 transition-shadow hover:shadow-md"
              >
                <div className="mb-2 text-3xl font-bold text-[#FF9900]">{platform.name}</div>
                <div className="text-sm text-[#666666]">{platform.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="bg-white py-12 px-4"
      >
        <div className="container mx-auto max-w-6xl">
          <motion.h2
            variants={itemVariants}
            className="mb-8 text-center text-2xl font-bold text-[#333333] md:text-3xl"
          >
            Comment ça marche
          </motion.h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { icon: Search, title: 'Cherchez', desc: 'Trouvez ce que vous voulez' },
              { icon: ShoppingCart, title: 'Commandez', desc: 'Nous achetons pour vous' },
              { icon: Truck, title: 'Recevez', desc: 'Livraison en Tunisie' },
            ].map((step, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="flex flex-col items-center rounded-lg bg-[#F5F5F5] p-6 text-center"
              >
                <div className="mb-4 rounded-full bg-[#FF9900] p-4 text-white">
                  <step.icon size={32} />
                </div>
                <h3 className="mb-2 text-lg font-bold text-[#333333]">{step.title}</h3>
                <p className="text-sm text-[#666666]">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Services Carousel */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="bg-[#F5F5F5] py-12 px-4"
      >
        <div className="container mx-auto max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 text-center text-2xl font-bold text-[#333333] md:text-3xl"
          >
            Nos Services
          </motion.h2>
          <Swiper
            modules={[Autoplay, Navigation, Pagination]}
            autoplay={{ delay: 4000 }}
            pagination={{ clickable: true }}
            navigation
            slidesPerView={1}
            spaceBetween={20}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="pb-12"
          >
            {[
              { img: '/manus-storage/DeDLkNQm8s1o_a39a7961.jpg', title: 'Logistique Globale' },
              { img: '/manus-storage/9jYjDta1GFa2_5d7dfdb6.jpg', title: 'Shipping International' },
              { img: '/manus-storage/8UJ5W4JCQp6i_894944a4.jpg', title: 'Livraison Rapide' },
            ].map((service, i) => (
              <SwiperSlide key={i}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="relative h-64 overflow-hidden rounded-lg bg-white shadow-md"
                >
                  <img
                    src={service.img}
                    alt={service.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/50 to-transparent p-4">
                    <h3 className="text-lg font-bold text-white">{service.title}</h3>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        ref={featuresRef}
        variants={containerVariants}
        initial="hidden"
        animate={featuresInView ? 'visible' : 'hidden'}
        className="bg-white py-12 px-4"
      >
        <div className="container mx-auto max-w-6xl">
          <motion.h2
            variants={itemVariants}
            className="mb-8 text-center text-2xl font-bold text-[#333333] md:text-3xl"
          >
            Pourquoi Bysis
          </motion.h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Truck, title: 'Livraison Rapide', desc: '20-25 jours' },
              { icon: Shield, title: 'Sécurisé', desc: 'Assurance incluse' },
              { icon: Clock, title: 'Support 24/7', desc: 'Toujours disponible' },
              { icon: Star, title: 'Qualité', desc: 'Produits vérifiés' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="flex flex-col items-center rounded-lg border border-[#EEEEEE] bg-[#F5F5F5] p-6 text-center"
              >
                <div className="mb-4 text-[#FF9900]">
                  <feature.icon size={32} />
                </div>
                <h3 className="mb-2 font-bold text-[#333333]">{feature.title}</h3>
                <p className="text-sm text-[#666666]">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section
        ref={testimonialsRef}
        initial={{ opacity: 0 }}
        animate={testimonialsInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-[#F5F5F5] py-12 px-4"
      >
        <div className="container mx-auto max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={testimonialsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className="mb-8 text-center text-2xl font-bold text-[#333333] md:text-3xl"
          >
            Avis des Clients
          </motion.h2>
          <Swiper
            modules={[Autoplay, Pagination]}
            autoplay={{ delay: 5000 }}
            pagination={{ clickable: true }}
            slidesPerView={1}
            spaceBetween={20}
            breakpoints={{
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="pb-12"
          >
            {[
              { name: 'Fatima', rating: 5, text: 'Service excellent! Livraison rapide et produits de qualité.' },
              { name: 'Ahmed', rating: 5, text: 'Très satisfait. Je recommande vivement Bysis!' },
              { name: 'Leila', rating: 4, text: 'Bonne expérience. Support client très réactif.' },
            ].map((testimonial, i) => (
              <SwiperSlide key={i}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="rounded-lg border border-[#EEEEEE] bg-white p-6 shadow-sm"
                >
                  <div className="mb-4 flex gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, j) => (
                      <Star key={j} size={16} className="fill-[#FFC107] text-[#FFC107]" />
                    ))}
                  </div>
                  <p className="mb-4 text-[#666666]">"{testimonial.text}"</p>
                  <p className="font-bold text-[#333333]">{testimonial.name}</p>
                  <p className="text-sm text-[#999999]">Achat vérifié</p>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="bg-gradient-to-r from-[#FF9900] to-[#146EB4] py-12 px-4 text-white"
      >
        <div className="container mx-auto flex max-w-6xl flex-col items-center justify-center gap-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold md:text-4xl"
          >
            Prêt à commencer?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="max-w-xl text-lg"
          >
            Rejoignez des milliers de clients satisfaits qui font leurs achats avec Bysis
          </motion.p>
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 font-bold text-[#FF9900] transition-all hover:shadow-lg"
          >
            Commencer maintenant
            <ArrowRight size={20} />
          </motion.button>
        </div>
      </motion.section>
    </AppLayout>
  );
}
