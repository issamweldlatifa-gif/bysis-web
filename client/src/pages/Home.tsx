import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { ChevronRight, Zap, Package, Star, Clock, ShieldCheck, Truck } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { trpc } from '@/lib/trpc';
import { useChatContext } from '@/App';

/* ── Amazon-style star row ── */
function StarRow({ rating = 4.3, count = 0 }: { rating?: number; count?: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} width="11" height="11" viewBox="0 0 24 24"
          fill={i < Math.floor(rating) ? '#FF9900' : '#D5D9D9'}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      {count > 0 && <span className="text-[11px] ml-1" style={{ color: '#007185' }}>{count.toLocaleString()}</span>}
    </span>
  );
}

/* ── Section header with "Voir tout" ── */
function SectionHeader({ title, href }: { title: string; href?: string }) {
  const [, navigate] = useLocation();
  return (
    <div className="flex items-center justify-between px-3 pt-4 pb-2">
      <h2 className="text-base font-bold" style={{ color: '#0F1111', fontFamily: '"Nunito", sans-serif' }}>
        {title}
      </h2>
      {href && (
        <button
          onClick={() => navigate(href)}
          className="flex items-center gap-0.5 text-xs font-semibold"
          style={{ color: '#007185', background: 'transparent', border: 'none' }}
        >
          Voir tout <ChevronRight size={13} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}

/* ── Flash Deal Card ── */
function FlashCard({ item }: { item: any }) {
  const [, navigate] = useLocation();
  const discount = item.priceEur
    ? Math.round((1 - item.priceTnd / (item.priceEur * 3.4)) * 100)
    : Math.floor(Math.random() * 20 + 5);

  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate('/arrivage')}
      className="flex-shrink-0 bg-white rounded overflow-hidden cursor-pointer"
      style={{
        width: '140px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        border: '1px solid #E3E6E6',
      }}
    >
      {/* Image */}
      <div className="relative" style={{ height: '140px', background: '#F8F8F8' }}>
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-contain p-2"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={40} color="#D5D9D9" />
          </div>
        )}
        {/* Discount badge */}
        {discount > 0 && (
          <span
            className="absolute top-1.5 left-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-sm"
            style={{ background: '#CC0C39', color: '#FFFFFF' }}
          >
            -{discount}%
          </span>
        )}
      </div>
      {/* Info */}
      <div className="p-2">
        <p className="text-[11px] line-clamp-2 mb-1" style={{ color: '#0F1111', fontWeight: 500 }}>
          {item.name}
        </p>
        <StarRow rating={4.2} count={Math.floor(Math.random() * 500 + 50)} />
        <p className="text-sm font-bold mt-1" style={{ color: '#B12704' }}>
          {item.priceTnd.toFixed(2)} TND
        </p>
        <p className="text-[10px] mt-0.5" style={{ color: '#007600' }}>
          Livraison GRATUITE
        </p>
      </div>
    </motion.div>
  );
}

/* ── Category Grid ── */
function CategoryGrid() {
  const [, navigate] = useLocation();
  const cats = [
    { label: 'Mode', emoji: '👗', href: '/arrivage', color: '#FEF0E7' },
    { label: 'Électronique', emoji: '📱', href: '/arrivage', color: '#EAF4FB' },
    { label: 'Maison', emoji: '🏠', href: '/arrivage', color: '#F0FBF0' },
    { label: 'Beauté', emoji: '💄', href: '/arrivage', color: '#FDF0F8' },
    { label: 'Sport', emoji: '⚽', href: '/arrivage', color: '#FFFBEA' },
    { label: 'Livres', emoji: '📚', href: '/arrivage', color: '#F0F4FF' },
  ];
  return (
    <div className="grid grid-cols-3 gap-2 px-3 py-2">
      {cats.map((cat) => (
        <motion.button
          key={cat.label}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(cat.href)}
          className="flex flex-col items-center justify-center py-4 rounded text-center"
          style={{ background: cat.color, border: '1px solid rgba(0,0,0,0.06)' }}
        >
          <span className="text-2xl mb-1">{cat.emoji}</span>
          <span className="text-[11px] font-bold" style={{ color: '#0F1111' }}>{cat.label}</span>
        </motion.button>
      ))}
    </div>
  );
}

/* ── Service Banner ── */
function ServiceBanner() {
  const [, navigate] = useLocation();
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate('/order')}
      className="mx-3 rounded overflow-hidden cursor-pointer"
      style={{
        background: 'linear-gradient(135deg, #131921 0%, #232F3E 100%)',
        border: '1px solid #3A4553',
      }}
    >
      <div className="flex items-center justify-between p-4">
        <div>
          <p className="text-xs font-semibold mb-1" style={{ color: '#FF9900' }}>
            SERVICE BYSIS
          </p>
          <h3 className="text-base font-bold mb-1" style={{ color: '#FFFFFF' }}>
            Commander depuis l'étranger
          </h3>
          <p className="text-xs" style={{ color: '#AAAAAA' }}>
            Shein • AliExpress • Temu • Amazon
          </p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,153,0,0.15)' }}
          >
            <Truck size={24} color="#FF9900" />
          </div>
          <ChevronRight size={16} color="#FF9900" />
        </div>
      </div>
    </motion.div>
  );
}

/* ── Trust Badges ── */
function TrustBadges() {
  const items = [
    { icon: ShieldCheck, label: 'Paiement sécurisé', color: '#007600' },
    { icon: Truck, label: 'Livraison rapide', color: '#007185' },
    { icon: Star, label: 'Qualité garantie', color: '#FF9900' },
    { icon: Clock, label: 'Suivi en temps réel', color: '#B12704' },
  ];
  return (
    <div className="grid grid-cols-4 gap-1 px-3 py-3" style={{ background: '#FFFFFF', borderTop: '1px solid #EAEDED', borderBottom: '1px solid #EAEDED' }}>
      {items.map(({ icon: Icon, label, color }) => (
        <div key={label} className="flex flex-col items-center gap-1 text-center">
          <Icon size={20} color={color} strokeWidth={1.8} />
          <span className="text-[9px] font-semibold leading-tight" style={{ color: '#565959' }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Promo Banner ── */
function PromoBanner() {
  const [, navigate] = useLocation();
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate('/calculator')}
      className="mx-3 rounded overflow-hidden cursor-pointer"
      style={{ background: '#FEF0E7', border: '1px solid #F5CBA7' }}
    >
      <div className="flex items-center gap-3 p-3.5">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: '#FF9900' }}
        >
          <Zap size={20} color="#FFFFFF" fill="#FFFFFF" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold" style={{ color: '#B12704' }}>CALCULATEUR DE PRIX</p>
          <p className="text-sm font-bold" style={{ color: '#0F1111' }}>Estimez le coût de votre commande</p>
          <p className="text-xs" style={{ color: '#565959' }}>Photo du produit → prix instantané</p>
        </div>
        <ChevronRight size={18} color="#FF9900" />
      </div>
    </motion.div>
  );
}

/* ── Main Home Content ── */
function HomeContent() {
  const { openChat } = useChatContext();
  const { data: arrivageData } = trpc.arrivage.list.useQuery();
  const items = ((arrivageData as any[]) || []).filter((i: any) => i.available !== 0).slice(0, 8);

  return (
    <div className="w-full" style={{ background: '#F3F3F3' }}>

      {/* ── Flash Deals Section ── */}
      {items.length > 0 && (
        <div className="bg-white mb-2">
          <div className="flex items-center gap-2 px-3 pt-4 pb-1">
            <Zap size={18} color="#CC0C39" fill="#CC0C39" />
            <h2 className="text-base font-bold" style={{ color: '#CC0C39', fontFamily: '"Nunito", sans-serif' }}>
              Ventes Flash
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-sm" style={{ background: '#CC0C39', color: '#FFFFFF' }}>
              Populaires
            </span>
            <div className="flex-1" />
            <button
              onClick={() => window.location.href = '/arrivage'}
              className="text-xs font-semibold flex items-center gap-0.5"
              style={{ color: '#007185', background: 'transparent', border: 'none' }}
            >
              Voir tout <ChevronRight size={12} strokeWidth={2.5} />
            </button>
          </div>
          <div className="flex gap-2 px-3 pb-4 overflow-x-auto scrollbar-hide">
            {items.map((item: any) => (
              <FlashCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* ── Service Banner ── */}
      <div className="py-2">
        <ServiceBanner />
      </div>

      {/* ── Trust Badges ── */}
      <TrustBadges />

      {/* ── Categories ── */}
      <div className="bg-white mb-2 mt-2">
        <SectionHeader title="Parcourir les catégories" href="/arrivage" />
        <CategoryGrid />
      </div>

      {/* ── Promo Banner ── */}
      <div className="py-2">
        <PromoBanner />
      </div>

      {/* ── More Products ── */}
      {items.length > 4 && (
        <div className="bg-white mb-2">
          <SectionHeader title="Offres recommandées pour vous" href="/arrivage" />
          <div className="grid grid-cols-2 gap-px" style={{ background: '#EAEDED' }}>
            {items.slice(0, 4).map((item: any) => {
              const discount = item.priceEur
                ? Math.round((1 - item.priceTnd / (item.priceEur * 3.4)) * 100)
                : Math.floor(Math.random() * 20 + 5);
              return (
                <motion.div
                  key={item.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.location.href = '/arrivage'}
                  className="bg-white p-3 cursor-pointer"
                >
                  <div className="relative mb-2" style={{ height: '120px', background: '#F8F8F8', borderRadius: '2px' }}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain p-1" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={32} color="#D5D9D9" />
                      </div>
                    )}
                    {discount > 0 && (
                      <span className="absolute top-1 left-1 text-[10px] font-bold px-1 py-0.5 rounded-sm" style={{ background: '#CC0C39', color: '#FFFFFF' }}>
                        -{discount}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs line-clamp-2 mb-1 font-medium" style={{ color: '#0F1111' }}>{item.name}</p>
                  <StarRow rating={4.1} count={Math.floor(Math.random() * 300 + 20)} />
                  <p className="text-sm font-bold mt-1" style={{ color: '#B12704' }}>{item.priceTnd.toFixed(2)} TND</p>
                  <p className="text-[10px] mt-0.5" style={{ color: '#007600' }}>Offre à durée limitée</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── How it works ── */}
      <div className="bg-white mb-2 px-3 py-4">
        <h2 className="text-base font-bold mb-3" style={{ color: '#0F1111' }}>Comment ça marche ?</h2>
        <div className="flex flex-col gap-3">
          {[
            { step: '1', title: 'Trouvez votre produit', desc: 'Sur Shein, AliExpress, Temu ou Amazon', color: '#FF9900' },
            { step: '2', title: 'Envoyez-nous le lien', desc: 'Via le formulaire ou Sisi AI', color: '#007185' },
            { step: '3', title: 'Recevez en Tunisie', desc: 'Livraison rapide et sécurisée', color: '#007600' },
          ].map(({ step, title, desc, color }) => (
            <div key={step} className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm"
                style={{ background: color, color: '#FFFFFF' }}
              >
                {step}
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: '#0F1111' }}>{title}</p>
                <p className="text-xs" style={{ color: '#565959' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom spacer */}
      <div style={{ height: '16px' }} />
    </div>
  );
}

export default function Home() {
  const { openChat } = useChatContext();
  return (
    <AppLayout onChatOpen={openChat}>
      <HomeContent />
    </AppLayout>
  );
}
