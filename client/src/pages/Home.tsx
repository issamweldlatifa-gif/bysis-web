/**
 * Home — Bysis Homepage V2.0 with Hero Video, Card Stack, and Stores Grid
 */
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Package, ShoppingBag } from 'lucide-react';

export default function Home() {
  const [, navigate] = useLocation();
  const [isPaused, setIsPaused] = useState(false);
  const [cards] = useState([
    { id: 1, title: 'Arrivage Europe ••', link: '/arrivage', order: 1 },
    { id: 2, title: 'Bysis Garantie ••', link: '/garantie', order: 2 },
    { id: 3, title: 'Wifi Dinar ••', link: '/wifidinar', order: 3 },
    { id: 4, title: 'Livraison 48H ••', link: '/livraison', order: 4 },
  ]);
  const [stores] = useState([
    { name: 'SHEIN', emoji: '🛍️' },
    { name: 'Amazon', emoji: '📦' },
    { name: 'Zara', emoji: '👗' },
    { name: 'Nike', emoji: '👟' },
    { name: 'H&M', emoji: '🎽' },
    { name: 'Pieuvre', emoji: '🐙' },
  ]);

  return (
    <div className="bg-white">
      {/* HERO VIDEO SECTION */}
      <section className="relative h-screen overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay={!isPaused}
          muted
          loop
          playsInline
          className="absolute top-1/2 left-1/2 w-full h-full min-w-full min-h-full object-cover transform -translate-x-1/2 -translate-y-1/2 z-0"
        >
          <source src="https://via.placeholder.com/1920x1080/1a1a1a/ffffff" type="video/mp4" />
        </video>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30 z-10"></div>

        {/* Hero Content */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center text-white px-5">
          <h1 className="text-5xl font-bold mb-3 tracking-tight">DESTOCKAGE EUROPE ••</h1>
          <p className="text-lg opacity-90 mb-8">Qualité Française, Prix Tunisien</p>
          <button
            onClick={() => navigate('/arrivage')}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-3 rounded-lg font-bold text-base transition-all duration-200 transform hover:scale-105"
          >
            DÉCOUVRIR ••
          </button>
        </div>

        {/* Pause Button */}
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="absolute bottom-24 right-5 z-30 bg-black/50 hover:bg-black/70 text-white w-10 h-10 rounded-full text-xs transition-all duration-200 flex items-center justify-center"
        >
          {isPaused ? '▶' : '▌▌'}
        </button>
      </section>

      {/* CARD STACK */}
      <main className="bg-white pt-5 pb-24">
        <section className="px-4">
          {cards.map((card) => (
            <a
              key={card.id}
              href={card.link}
              className="block w-full h-44 rounded-2xl overflow-hidden relative mb-3 hover:opacity-90 transition-opacity duration-200"
            >
              {/* Card Video Background */}
              <video
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              >
                <source src="https://via.placeholder.com/400x180/2a2a2a/ffffff" type="video/mp4" />
              </video>

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/0 flex items-center pl-6">
                <h2 className="text-white text-2xl font-bold">{card.title}</h2>
              </div>
            </a>
          ))}
        </section>

        {/* STORES GRID */}
        <section className="px-4 py-8">
          <h2 className="text-center text-2xl font-bold mb-6 text-black">نشريو منهم مباشرة ليك ••</h2>
          <div className="grid grid-cols-2 gap-3">
            {stores.map((store) => (
              <div
                key={store.name}
                className="aspect-square rounded-2xl bg-gray-100 flex items-center justify-center text-5xl hover:bg-gray-200 transition-colors duration-200"
              >
                {store.emoji}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-100 px-4 py-8 text-black">
        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Column 1 */}
          <div>
            <h3 className="font-bold text-sm mb-3">BYSIS ••</h3>
            <a href="#" className="text-xs text-gray-600 block mb-2 hover:text-black transition-colors">
              من نحن ••
            </a>
            <a href="#" className="text-xs text-gray-600 block hover:text-black transition-colors">
              Pieuvre SAS ••
            </a>
          </div>

          {/* Column 2 */}
          <div>
            <h3 className="font-bold text-sm mb-3">الامان ••</h3>
            <a href="#" className="text-xs text-gray-600 block mb-2 hover:text-black transition-colors">
              سياسة الخصوصية ••
            </a>
            <a href="#" className="text-xs text-gray-600 block hover:text-black transition-colors">
              Bysis Garantie ••
            </a>
          </div>

          {/* Column 3 */}
          <div>
            <h3 className="font-bold text-sm mb-3">تواصل ••</h3>
            <a href="mailto:support@bysis.shop" className="text-xs text-gray-600 block mb-2 hover:text-black transition-colors">
              support@bysis.shop
            </a>
            <a href="#" className="text-xs text-gray-600 block hover:text-black transition-colors">
              لمطة، المنستير ••
            </a>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="text-center pt-6 border-t border-gray-300 text-xs text-gray-600">
          © 2026 Bysis Group •• All Rights Reserved
        </div>
      </footer>
    </div>
  );
}
