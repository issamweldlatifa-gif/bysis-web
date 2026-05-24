import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import AppLayout from '@/components/AppLayout';

/* ── Shein Design Tokens ────────────────────────────────────────────────── */
const RED    = '#1A1A1A';
const BLACK  = '#1A1A1A';
const GRAY1  = '#333333';
const GRAY2  = '#666666';
const GRAY3  = '#999999';
const GRAY4  = '#F5F5F5';
const BORDER = '#E5E5E5';
const GREEN  = '#00A650';
const ORANGE = '#FF6B35';

/* ── Image URLs (uploaded via manus-upload-file) ────────────────────────── */
const IMGS = {
  hero:       '/manus-storage/hero-delivery-tunisia_2914d89b.webp',
  unboxing1:  '/manus-storage/unboxing-clothes_5637a1dc.jpg',
  unboxing2:  '/manus-storage/unboxing-happy_b2d19bf8.jpg',
  unboxing3:  '/manus-storage/happy-unboxing_eda27441.jpg',
  couple:     '/manus-storage/couple-phone_771f441d.jpg',
  womanPhone: '/manus-storage/woman-shopping-phone_0ed1d14c.jpg',
};

/* ── Inline SVG Icons ───────────────────────────────────────────────────── */
const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconStar = ({ filled = true }: { filled?: boolean }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill={filled ? '#FFB800' : 'none'} stroke="#FFB800" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IconTruck = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" rx="1"/>
    <path d="M16 8h4l3 5v3h-7V8z"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);
const IconShield = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IconTag = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);
const IconSearch = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconPackage = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);

/* ── Data ────────────────────────────────────────────────────────────────── */
const platforms = [
  { name: 'SHEIN',      color: RED,    bg: '#FFF0F1', desc: 'Mode & Tendances',   tag: 'Mode' },
  { name: 'AliExpress', color: ORANGE, bg: '#FFF4EE', desc: 'Tout & Moins Cher',  tag: 'Tech' },
  { name: 'Temu',       color: '#FF6B35', bg: '#FFF4EF', desc: 'Prix Imbattables', tag: 'Maison' },
];

const steps = [
  { num: '01', title: 'Envoyez le lien',         desc: 'Copiez le lien du produit depuis Shein, AliExpress ou Temu et envoyez-le nous.', Icon: IconSearch,  color: RED },
  { num: '02', title: 'On commande pour vous',   desc: 'Notre équipe passe la commande, paie et gère toute la logistique internationale.', Icon: IconPackage, color: ORANGE },
  { num: '03', title: 'Livraison chez vous',     desc: 'Votre colis arrive directement à votre porte en Tunisie en 20–25 jours.', Icon: IconTruck,   color: GREEN },
];

const advantages = [
  { Icon: IconTruck,  title: 'Livraison 20–25j',   desc: 'Directement chez vous en Tunisie',    color: RED },
  { Icon: IconShield, title: '100% Sécurisé',       desc: 'Paiement et colis garantis',          color: GREEN },
  { Icon: IconTag,    title: 'Prix en TND',         desc: 'Calculé en dinars tunisiens',         color: ORANGE },
  { Icon: IconCheck,  title: 'Suivi temps réel',    desc: 'Suivez votre commande à tout moment', color: '#6C63FF' },
];

const testimonials = [
  {
    name: 'Sarra B.',     city: 'Tunis',
    text: "J'ai commandé une robe Shein et elle est arrivée en parfait état ! Prix très raisonnable, je recommande vivement.",
    rating: 5, img: IMGS.unboxing1, tag: 'Shein',
  },
  {
    name: 'Mohamed K.',   city: 'Sfax',
    text: "Service rapide et fiable. Mon colis AliExpress est arrivé en 22 jours. Emballage soigné.",
    rating: 5, img: IMGS.couple, tag: 'AliExpress',
  },
  {
    name: 'Ines M.',      city: 'Sousse',
    text: "Bysis m'a sauvé ! Je voulais des chaussures Temu introuvables en Tunisie. Parfait !",
    rating: 5, img: IMGS.womanPhone, tag: 'Temu',
  },
];

/* ── Sub-components ──────────────────────────────────────────────────────── */
function StarRow({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => <IconStar key={i} filled={i < count} />)}
    </div>
  );
}

function SectionHeader({ label, title, sub }: { label: string; title: string; sub?: string }) {
  return (
    <div className="px-4 mb-4">
      <p className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: RED }}>{label}</p>
      <h2 className="text-xl font-bold leading-tight" style={{ color: BLACK }}>{title}</h2>
      {sub && <p className="text-sm mt-1" style={{ color: GRAY2 }}>{sub}</p>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   HOME PAGE
   ══════════════════════════════════════════════════════════════════════════ */
export default function Home() {
  const [, navigate] = useLocation();

  return (
    <AppLayout>
    <div className="w-full" style={{ background: '#FFFFFF', fontFamily: '"Inter", sans-serif' }}>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: '#FFF0F1', minHeight: 220 }}>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${IMGS.hero})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            opacity: 0.15,
          }}
        />
        <div className="relative px-5 pt-6 pb-8">
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-4"
            style={{ background: RED, color: '#fff' }}
          >
            <span>🛍️</span>
            <span>Shein · AliExpress · Temu → Tunisie</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
            className="text-3xl font-black leading-tight mb-2"
            style={{ color: BLACK, letterSpacing: '-0.03em' }}
          >
            Achetez depuis<br />
            <span style={{ color: RED }}>n'importe où</span>,<br />
            livré chez vous
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
            className="text-sm mb-6 leading-relaxed"
            style={{ color: GRAY1 }}
          >
            On commande pour vous sur les plus grandes plateformes mondiales et on livre directement en Tunisie. Prix en TND, livraison 20–25 jours.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}
            className="flex gap-3"
          >
            <button
              onClick={() => navigate('/order')}
              className="flex-1 flex items-center justify-center gap-2 h-11 rounded-lg font-semibold text-sm text-white press-scale"
              style={{ background: RED }}
            >
              Commander maintenant
              <IconArrow />
            </button>
            <button
              onClick={() => navigate('/calculator')}
              className="flex items-center justify-center h-11 px-4 rounded-lg font-semibold text-sm press-scale"
              style={{ background: '#fff', color: RED, border: `1.5px solid ${RED}` }}
            >
              Calculer
            </button>
          </motion.div>

          <div className="flex gap-4 mt-5">
            {['Livraison garantie', 'Prix en TND', 'Suivi inclus'].map((b, i) => (
              <div key={i} className="flex items-center gap-1">
                <span className="text-xs font-bold" style={{ color: GREEN }}>✓</span>
                <span className="text-xs" style={{ color: GRAY2 }}>{b}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ──────────────────────────────────────────────────── */}
      <section style={{ background: BLACK }}>
        <div className="flex justify-around py-4 px-2">
          {[
            { value: '170+', label: 'Commandes livrées' },
            { value: '98%',  label: 'Satisfaction' },
            { value: '25j',  label: 'Délai moyen' },
            { value: '3',    label: 'Plateformes' },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-xl font-black" style={{ color: '#fff' }}>{s.value}</span>
              <span className="text-[10px] mt-0.5 text-center" style={{ color: 'rgba(255,255,255,0.5)' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <div style={{ height: 8, background: GRAY4 }} />

      {/* ── PLATFORMS ────────────────────────────────────────────────────── */}
      <section className="py-5">
        <SectionHeader label="Plateformes" title="Où on commande pour vous" sub="Trois des plus grandes plateformes mondiales, accessibles depuis la Tunisie." />
        <div className="px-4 flex gap-3 overflow-x-auto scrollbar-hide pb-1">
          {platforms.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
              className="flex-shrink-0 w-32 rounded-xl p-4 flex flex-col items-center gap-2 press-scale"
              style={{ background: p.bg, border: `1px solid ${BORDER}` }}
              onClick={() => navigate('/arrivage')}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-sm" style={{ background: p.color }}>
                {p.name.charAt(0)}
              </div>
              <span className="text-sm font-bold text-center" style={{ color: BLACK }}>{p.name}</span>
              <span className="text-[10px] text-center" style={{ color: GRAY2 }}>{p.desc}</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: p.color, color: '#fff' }}>{p.tag}</span>
            </motion.div>
          ))}
        </div>
      </section>

      <div style={{ height: 8, background: GRAY4 }} />

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="py-5">
        <SectionHeader label="Comment ça marche" title="Simple comme bonjour" sub="3 étapes pour recevoir vos achats internationaux en Tunisie." />
        <div className="px-4 flex flex-col gap-3">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              className="flex items-start gap-4 p-4 rounded-xl"
              style={{ background: GRAY4, border: `1px solid ${BORDER}` }}
            >
              <div className="flex-shrink-0 flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: step.color + '18', color: step.color }}>
                  <step.Icon />
                </div>
                <span className="text-[10px] font-black" style={{ color: step.color }}>{step.num}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold mb-1" style={{ color: BLACK }}>{step.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: GRAY2 }}>{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="px-4 mt-4">
          <button onClick={() => navigate('/order')} className="w-full h-11 rounded-lg font-semibold text-sm text-white press-scale" style={{ background: RED }}>
            Commencer maintenant →
          </button>
        </div>
      </section>

      <div style={{ height: 8, background: GRAY4 }} />

      {/* ── PHOTO SHOWCASE ───────────────────────────────────────────────── */}
      <section className="py-5">
        <SectionHeader label="Notre Service" title="Des milliers de produits livrés" sub="Vêtements, accessoires, électronique, maison... tout ce que vous voulez." />
        <div className="px-4 grid grid-cols-2 gap-2">
          <div className="col-span-2 rounded-xl overflow-hidden" style={{ height: 180 }}>
            <img src={IMGS.unboxing2} alt="Unboxing commande Bysis" className="w-full h-full object-cover" />
          </div>
          <div className="rounded-xl overflow-hidden" style={{ height: 130 }}>
            <img src={IMGS.unboxing1} alt="Vêtements commandés" className="w-full h-full object-cover" />
          </div>
          <div className="rounded-xl overflow-hidden" style={{ height: 130 }}>
            <img src={IMGS.unboxing3} alt="Colis reçu" className="w-full h-full object-cover" />
          </div>
        </div>
        <div className="mx-4 mt-3 rounded-xl px-4 py-3 flex items-center justify-between" style={{ background: '#FFF0F1', border: '1px solid #FECDD3' }}>
          <div>
            <p className="text-xs font-bold" style={{ color: RED }}>🔥 Livraison GRATUITE</p>
            <p className="text-xs mt-0.5" style={{ color: GRAY2 }}>Pour toute commande &gt; 150 TND</p>
          </div>
          <button onClick={() => navigate('/order')} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: RED }}>
            Commander
          </button>
        </div>
      </section>

      <div style={{ height: 8, background: GRAY4 }} />

      {/* ── ADVANTAGES ───────────────────────────────────────────────────── */}
      <section className="py-5">
        <SectionHeader label="Pourquoi Bysis" title="Vos avantages exclusifs" />
        <div className="px-4 grid grid-cols-2 gap-3">
          {advantages.map((adv, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.07 }}
              className="p-4 rounded-xl flex flex-col gap-2"
              style={{ background: GRAY4, border: `1px solid ${BORDER}` }}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: adv.color + '18', color: adv.color }}>
                <adv.Icon />
              </div>
              <h4 className="text-xs font-bold" style={{ color: BLACK }}>{adv.title}</h4>
              <p className="text-[11px] leading-relaxed" style={{ color: GRAY2 }}>{adv.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <div style={{ height: 8, background: GRAY4 }} />

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section className="py-5">
        <SectionHeader label="Avis Clients" title="Ce que disent nos clients" sub="Plus de 170 commandes livrées avec succès en Tunisie." />

        {/* Rating summary */}
        <div className="mx-4 mb-4 p-4 rounded-xl flex items-center gap-4" style={{ background: '#FFF0F1', border: '1px solid #FECDD3' }}>
          <div className="flex flex-col items-center">
            <span className="text-4xl font-black" style={{ color: RED }}>4.9</span>
            <StarRow count={5} />
            <span className="text-[10px] mt-1" style={{ color: GRAY3 }}>170+ avis</span>
          </div>
          <div className="flex-1">
            {[5, 4, 3].map((n) => (
              <div key={n} className="flex items-center gap-2 mb-1">
                <span className="text-[10px] w-2" style={{ color: GRAY3 }}>{n}</span>
                <div className="flex-1 h-1.5 rounded-full" style={{ background: BORDER }}>
                  <div className="h-full rounded-full" style={{ background: RED, width: n === 5 ? '88%' : n === 4 ? '9%' : '3%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial cards */}
        <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide pb-2">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              className="flex-shrink-0 w-64 rounded-xl p-4 flex flex-col gap-3"
              style={{ background: '#FFFFFF', border: `1px solid ${BORDER}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                  <img src={t.img} alt={t.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: BLACK }}>{t.name}</p>
                  <p className="text-[10px]" style={{ color: GRAY3 }}>{t.city}</p>
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: RED + '18', color: RED }}>
                  {t.tag}
                </span>
              </div>
              <StarRow count={t.rating} />
              <p className="text-xs leading-relaxed line-clamp-2" style={{ color: GRAY1 }}>"{t.text}"</p>
              <div className="flex items-center gap-1">
                <span style={{ color: GREEN }}><IconCheck /></span>
                <span className="text-[10px]" style={{ color: GREEN }}>Achat vérifié</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <div style={{ height: 8, background: GRAY4 }} />

      {/* ── ABOUT ────────────────────────────────────────────────────────── */}
      <section className="py-5 px-4">
        <SectionHeader label="À propos" title="Bysis, votre intermédiaire de confiance" />
        <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
          <div style={{ height: 160 }}>
            <img src={IMGS.womanPhone} alt="Shopping en ligne avec Bysis" className="w-full h-full object-cover" />
          </div>
          <div className="p-4">
            <p className="text-sm leading-relaxed mb-3" style={{ color: GRAY1 }}>
              <strong style={{ color: BLACK }}>Bysis</strong> est une plateforme tunisienne spécialisée dans l'achat et la livraison de produits depuis les grandes plateformes internationales — <strong>Shein, AliExpress et Temu</strong> — directement en Tunisie.
            </p>
            <p className="text-sm leading-relaxed mb-4" style={{ color: GRAY1 }}>
              Notre équipe gère tout pour vous : commande, paiement international, suivi et livraison à domicile. Vous payez en dinars tunisiens, sans stress.
            </p>
            <div className="flex flex-col gap-2">
              {[
                'Aucun compte international requis',
                'Paiement en TND uniquement',
                'Suivi de colis en temps réel',
                'Service client disponible 7j/7',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: GREEN + '18', color: GREEN }}>
                    <IconCheck />
                  </div>
                  <span className="text-xs" style={{ color: GRAY1 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
      <section className="mx-4 mb-6 rounded-2xl overflow-hidden" style={{ background: BLACK }}>
        <div className="px-5 py-6">
          <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: RED }}>Commencez dès aujourd'hui</p>
          <h2 className="text-xl font-black mb-2 leading-tight" style={{ color: '#fff' }}>
            Votre prochain achat<br />
            <span style={{ color: RED }}>commence ici</span>
          </h2>
          <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Envoyez-nous le lien de votre produit et on s'occupe du reste.
          </p>
          <button
            onClick={() => navigate('/order')}
            className="w-full h-11 rounded-lg font-bold text-sm press-scale"
            style={{ background: RED, color: '#fff' }}
          >
            Passer une commande →
          </button>
          <button
            onClick={() => navigate('/track')}
            className="w-full h-10 rounded-lg font-semibold text-sm mt-2 press-scale"
            style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}
          >
            Suivre ma commande
          </button>
        </div>
      </section>

    </div>
    </AppLayout>
  );
}
