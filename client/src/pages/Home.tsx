'use client';

import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { Search, Heart, Camera, ChevronRight, Star } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import 'swiper/css';
import 'swiper/css/pagination';

export default function HomePage() {
  // Categories for horizontal scroll
  const categories = [
    { id: 1, name: 'Tout', icon: '🏠' },
    { id: 2, name: 'Entrepôt UE', icon: '📦' },
    { id: 3, name: 'Femme', icon: '👗' },
    { id: 4, name: 'Lingerie', icon: '👙' },
    { id: 5, name: 'Homme', icon: '👔' },
    { id: 6, name: 'Enfant', icon: '👶' },
    { id: 7, name: 'Maison', icon: '🏠' },
    { id: 8, name: 'Beauté', icon: '💄' },
  ];

  // Product categories (circular grid)
  const productCategories = [
    { id: 1, name: 'Femme', image: '👗' },
    { id: 2, name: 'Curvy', image: '👯' },
    { id: 3, name: 'Enfant', image: '👧' },
    { id: 4, name: 'Homme', image: '👨' },
    { id: 5, name: 'Bébé', image: '👶' },
    { id: 6, name: 'Maison', image: '🏠' },
    { id: 7, name: 'Lingerie', image: '👙' },
    { id: 8, name: 'Sports', image: '⚽' },
    { id: 9, name: 'Beauté', image: '💄' },
  ];

  // Carousel images
  const carouselImages = [
    '/manus-storage/9vxTX23dpFU4_983af5df.jpg',
    '/manus-storage/9vxTX23dpFU4_983af5df.jpg',
    '/manus-storage/9vxTX23dpFU4_983af5df.jpg',
  ];

  // Deals section
  const deals = [
    { id: 1, title: 'Câbles USB', price: '0,96€', originalPrice: '1,48€', image: '🔌' },
    { id: 2, title: 'Chaussures', price: '7,18€', originalPrice: '10,98€', image: '👟' },
    { id: 3, title: 'iPhone 15 Pro', price: '544,26€', image: '📱' },
  ];

  return (
    <AppLayout>
      {/* Header with Search */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-40 bg-white border-b border-gray-100"
      >
        {/* Top bar with icons */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Camera size={20} className="text-gray-600" />
            <div className="w-6 h-6 bg-gray-200 rounded"></div>
          </div>
          <span className="text-xs text-gray-500">39</span>
        </div>

        {/* Search bar */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Claquette Homme trends"
              className="flex-1 bg-transparent text-sm outline-none"
            />
            <Heart size={18} className="text-gray-400" />
          </div>
        </div>

        {/* Categories horizontal scroll */}
        <div className="overflow-x-auto border-t border-gray-100">
          <div className="flex gap-4 px-4 py-3 min-w-max">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className="text-xs text-gray-600 whitespace-nowrap hover:text-gray-900 transition"
              >
                {cat.name}
              </button>
            ))}
            <button className="text-xs text-gray-600 whitespace-nowrap">⋯</button>
          </div>
        </div>
      </motion.header>

      {/* Hero Carousel */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="relative w-full"
      >
        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{ delay: 4000 }}
          pagination={{ clickable: true }}
          className="w-full h-64"
        >
          {carouselImages.map((img, idx) => (
            <SwiperSlide key={idx}>
              <div className="relative w-full h-full bg-gradient-to-b from-blue-200 to-blue-100">
                <img
                  src={img}
                  alt={`Slide ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center">
                  <h2 className="text-white text-2xl font-bold text-center px-4">
                    MODE VACANCES
                  </h2>
                  <p className="text-white text-4xl font-bold mt-2">JUSQU'À -60%</p>
                  <button className="mt-4 bg-white text-black px-6 py-2 rounded text-sm font-semibold">
                    ACHETEZ MAINTENANT
                  </button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </motion.section>

      {/* Info bars */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-2 gap-3 px-4 py-4 bg-gray-50"
      >
        <div className="flex items-center gap-2 bg-white p-3 rounded">
          <span className="text-lg">✓</span>
          <div className="text-xs">
            <p className="font-semibold">Livraison gratuite</p>
            <p className="text-gray-600">Éligible pour obtenir</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white p-3 rounded">
          <span className="text-lg">🔄</span>
          <div className="text-xs">
            <p className="font-semibold">Retours gratuits</p>
            <p className="text-gray-600">Sous 30 jours</p>
          </div>
        </div>
      </motion.div>

      {/* Product Categories Grid (Circular) */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="px-4 py-6"
      >
        <div className="grid grid-cols-3 gap-4">
          {productCategories.map((cat) => (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-3xl hover:bg-gray-200 transition">
                {cat.image}
              </div>
              <p className="text-xs text-center font-medium">{cat.name}</p>
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* Bonnes Affaires Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="px-4 py-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">
            Nos <span className="italic">Bonnes Affaires</span>
          </h2>
          <ChevronRight size={20} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {deals.slice(0, 2).map((deal) => (
            <motion.div
              key={deal.id}
              whileHover={{ y: -4 }}
              className="bg-white rounded border border-gray-200 overflow-hidden"
            >
              <div className="w-full h-32 bg-gray-100 flex items-center justify-center text-4xl">
                {deal.image}
              </div>
              <div className="p-3">
                <p className="text-xs text-gray-600 line-through">{deal.originalPrice}</p>
                <p className="text-sm font-bold text-orange-500">{deal.price}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Marques Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="px-4 py-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">
            <span className="text-orange-500">Offres</span> Marques
          </h2>
          <ChevronRight size={20} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {['Apple', 'Medicube', 'Adidas'].map((brand, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4 }}
              className="bg-white rounded border border-gray-200 overflow-hidden"
            >
              <div className="w-full h-24 bg-gray-100 flex items-center justify-center text-2xl">
                {idx === 0 ? '📱' : idx === 1 ? '💅' : '👟'}
              </div>
              <div className="p-2 text-center">
                <p className="text-xs font-semibold">{brand}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="px-4 py-6 bg-gray-50"
      >
        <h2 className="text-lg font-bold mb-4">Avis des Clients</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-xs font-semibold">Client {i}</p>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={12} className="fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-600">Excellent produit, livraison rapide!</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Spacer for bottom nav */}
      <div className="h-20"></div>
    </AppLayout>
  );
}
