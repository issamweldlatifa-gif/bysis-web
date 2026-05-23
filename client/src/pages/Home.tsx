import { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import {
  Scan, ShoppingCart, Package,
  ChatCircleDots, Rocket,
  CurrencyCircleDollar, MagnifyingGlass, Storefront, Truck,
} from '@phosphor-icons/react';
import { ChevronDown } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import AboutPopup from '@/components/AboutPopup';
import { useChatContext } from '@/App';

/* ── PayPal Design System ─────────────────────────────────────────────── */
const BG     = '#EEF2F7';   // PayPal page background
const WHITE  = '#FFFFFF';   // PayPal card white
const BLUE   = '#0070BA';   // PayPal Blue
const NAVY   = '#003087';   // PayPal Navy
const SKY    = '#009CDE';   // PayPal Sky
const TEXT   = '#2C2E2F';   // PayPal Near-Black
const MUTED  = '#6C7378';   // PayPal Gray
const SUBTLE = '#9DA3A6';   // PayPal Light Gray
const BORDER = '#CBD2D9';   // PayPal Border
const INPUT  = '#F5F7FA';   // PayPal Input BG
const GREEN  = '#00A651';   // PayPal Green
const SHADOW = '0 1px 4px rgba(0,0,0,0.08), 0 0 1px rgba(0,0,0,0.04)';
const SHADOW_MD = '0 4px 14px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)';

const platforms = [
  { name: 'Shein',       desc: 'Mode & tendances',  letter: 'S', color: '#111111' },
  { name: 'AliExpress',  desc: 'Tout & moins cher', letter: 'A', color: '#D0021B' },
  { name: 'Temu',        desc: 'Prix imbattables',  letter: 'T', color: '#E07B00' },
];

const stats = [
  { value: '170+',   label: 'Commandes livrées' },
  { value: '98%',    label: 'Satisfaction client' },
  { value: '20-25j', label: 'Délai de livraison' },
  { value: '3',      label: 'Plateformes' },
];

const features = [
  { icon: CurrencyCircleDollar, title: 'Prix en TND',          desc: 'Calcul instantané en dinars tunisiens, sans surprises ni frais cachés.' },
  { icon: Truck,                title: 'Livraison 20–25 jours', desc: 'Votre colis livré à domicile en Tunisie, rapidement et en sécurité.' },
  { icon: MagnifyingGlass,      title: 'Suivi en temps réel',  desc: 'Suivez chaque étape de votre commande depuis notre application.' },
  { icon: Storefront,           title: '3 plateformes',        desc: 'Shein, AliExpress et Temu — tout en un seul endroit.' },
];

const steps = [
  { n: '1', title: 'Scannez ou collez le lien', desc: 'Prenez une photo du produit ou collez son URL depuis Shein, AliExpress ou Temu.' },
  { n: '2', title: 'Obtenez le prix en TND',    desc: 'Notre calculateur convertit instantanément avec tous les frais inclus.' },
  { n: '3', title: 'Confirmez et suivez',        desc: 'Passez commande en quelques secondes et suivez la livraison en temps réel.' },
];

const faqs = [
  { q: 'Comment calculer le prix final ?',
    a: 'Scannez le produit depuis Shein, AliExpress ou Temu. Notre outil calcule automatiquement le prix en TND avec les frais de service et de livraison.' },
  { q: 'Quel est le délai de livraison ?',
    a: 'En général 20 à 25 jours ouvrables selon la plateforme et la destination en Tunisie.' },
  { q: 'Comment suivre ma commande ?',
    a: "Depuis la section \"Commandes\" dans l'application, entrez votre nom ou numéro de téléphone." },
  { q: 'Quels modes de paiement ?',
    a: 'Paiement à la livraison (cash) ou virement bancaire selon votre wilaya.' },
];

/* ── Micro-components ─────────────────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: BLUE, letterSpacing: '0.12em' }}>
      {children}
    </p>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl font-extrabold leading-tight" style={{ color: TEXT, letterSpacing: '-0.02em', fontFamily: 'Inter, sans-serif' }}>
      {children}
    </h2>
  );
}

export default function Home() {
  const [aboutOpen, setAboutOpen]     = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const { openChat }                  = useChatContext();

  return (
    <AppLayout onAboutClick={() => setAboutOpen(true)} onChatOpen={openChat}>
      <AboutPopup isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="px-5 pt-10 pb-12" style={{ background: BG }}>
        <div className="max-w-lg mx-auto">

          {/* Headline — PayPal-style: very large, very bold */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
            className="mb-4"
            style={{
              fontSize: 'clamp(2rem, 8vw, 2.75rem)',
              fontWeight: 800,
              lineHeight: 1.12,
              letterSpacing: '-0.03em',
              color: TEXT,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Achetez depuis{' '}
            <span style={{ color: '#111111' }}>Shein</span>,{' '}
            <span style={{ color: '#D0021B' }}>AliExpress</span>{' '}
            &amp;{' '}
            <span style={{ color: '#E07B00' }}>Temu</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
            className="mb-8 text-base leading-relaxed"
            style={{ color: MUTED, fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
          >
            On commande pour vous et on livre directement chez vous en Tunisie.
            Prix calculé en dinars, livraison 20–25 jours, zéro stress.
          </motion.p>

          {/* CTA buttons — PayPal pill shape */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Link href="/calculator">
              <button
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 font-semibold text-white transition-all duration-150 active:scale-[0.97]"
                style={{
                  background: BLUE,
                  borderRadius: 24,
                  fontSize: '0.9375rem',
                  letterSpacing: '0.01em',
                  boxShadow: `0 4px 14px ${BLUE}40`,
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                <Scan size={18} weight="bold" />
                Calculer mon prix
              </button>
            </Link>
            <Link href="/order">
              <button
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 font-semibold text-white transition-all duration-150 active:scale-[0.97]"
                style={{
                  background: NAVY,
                  borderRadius: 24,
                  fontSize: '0.9375rem',
                  letterSpacing: '0.01em',
                  boxShadow: `0 4px 14px ${NAVY}40`,
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                <ShoppingCart size={18} weight="bold" />
                Passer commande
              </button>
            </Link>
            <button
              onClick={openChat}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 font-semibold transition-all duration-150 active:scale-[0.97]"
              style={{
                background: WHITE,
                color: BLUE,
                borderRadius: 24,
                fontSize: '0.9375rem',
                border: `1.5px solid ${BLUE}`,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              <ChatCircleDots size={18} weight="bold" />
              Parler au chatbot
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── STATS BAND — PayPal navy ───────────────────────────────────── */}
      <section className="py-7 px-5" style={{ background: NAVY }}>
        <div className="max-w-lg mx-auto grid grid-cols-4 gap-2">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              className="text-center"
            >
              <div
                className="font-extrabold leading-none mb-1 text-white"
                style={{ fontSize: 'clamp(1.1rem, 4vw, 1.5rem)', fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}
              >
                {s.value}
              </div>
              <div className="text-[10px] font-medium leading-tight" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'Inter, sans-serif' }}>
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── PLATFORMS ─────────────────────────────────────────────────── */}
      <section className="py-12 px-5" style={{ background: WHITE }}>
        <div className="max-w-lg mx-auto">
          <SectionLabel>Plateformes</SectionLabel>
          <SectionHeading>Où on commande pour vous</SectionHeading>
          <p className="mt-2 mb-7 text-sm" style={{ color: MUTED, fontFamily: 'Inter, sans-serif' }}>
            Trois des plus grandes plateformes mondiales, accessibles depuis la Tunisie.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {platforms.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="flex flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-150 hover:shadow-md"
                style={{ background: BG, border: `1px solid ${BORDER}` }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black text-white"
                  style={{ background: p.color }}
                >
                  {p.letter}
                </div>
                <div className="text-center">
                  <div className="font-bold text-sm" style={{ color: TEXT, fontFamily: 'Inter, sans-serif' }}>{p.name}</div>
                  <div className="text-[11px] mt-0.5" style={{ color: MUTED }}>{p.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────── */}
      <section className="py-12 px-5" style={{ background: BG }}>
        <div className="max-w-lg mx-auto">
          <SectionLabel>Avantages</SectionLabel>
          <SectionHeading>Pourquoi choisir Bysis ?</SectionHeading>
          <div className="mt-7 grid grid-cols-2 gap-3">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                  className="p-4 rounded-2xl"
                  style={{ background: WHITE, border: `1px solid ${BORDER}`, boxShadow: SHADOW }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: '#EBF4FB' }}
                  >
                    <Icon size={18} weight="duotone" style={{ color: BLUE }} />
                  </div>
                  <h3 className="font-bold text-sm mb-1" style={{ color: TEXT, fontFamily: 'Inter, sans-serif' }}>{f.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: MUTED }}>{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────── */}
      <section className="py-12 px-5" style={{ background: WHITE }}>
        <div className="max-w-lg mx-auto">
          <SectionLabel>Processus</SectionLabel>
          <SectionHeading>Comment ça marche ?</SectionHeading>
          <div className="mt-7 space-y-3">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="flex gap-4 p-4 rounded-2xl"
                style={{ background: BG, border: `1px solid ${BORDER}` }}
              >
                {/* Step number — PayPal blue circle */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 text-white"
                  style={{ background: BLUE, minWidth: 40 }}
                >
                  {step.n}
                </div>
                <div>
                  <div className="font-bold text-sm mb-1" style={{ color: TEXT, fontFamily: 'Inter, sans-serif' }}>{step.title}</div>
                  <p className="text-xs leading-relaxed" style={{ color: MUTED }}>{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section className="py-12 px-5" style={{ background: BG }}>
        <div className="max-w-lg mx-auto">
          <SectionLabel>FAQ</SectionLabel>
          <SectionHeading>Questions fréquentes</SectionHeading>
          <div className="mt-7 space-y-2">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                className="rounded-2xl overflow-hidden"
                style={{ background: WHITE, border: `1px solid ${BORDER}`, boxShadow: SHADOW }}
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full p-4 flex items-center justify-between gap-3"
                  style={{ color: TEXT }}
                >
                  <span className="font-semibold text-left text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>{faq.q}</span>
                  <motion.div animate={{ rotate: expandedFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0">
                    <ChevronDown size={16} style={{ color: BLUE }} />
                  </motion.div>
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: expandedFaq === i ? 'auto' : 0 }}
                  transition={{ duration: 0.22 }}
                  className="overflow-hidden"
                >
                  <div
                    className="px-4 pb-4 text-xs leading-relaxed"
                    style={{ color: MUTED, borderTop: `1px solid ${BORDER}`, paddingTop: 12, fontFamily: 'Inter, sans-serif' }}
                  >
                    {faq.a}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AVIS CLIENTS ───────────────────────────────────────────────── */}
      <section className="py-12 px-5" style={{ background: WHITE }}>
        <div className="max-w-lg mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8">
            <SectionLabel>آراء العملاء</SectionLabel>
            <SectionHeading>ماذا يقول عملاؤنا؟</SectionHeading>
          </motion.div>
          <div className="space-y-4">
            {[
              { name: 'أمير بن سالم',       city: 'تونس العاصمة', rating: 5, text: 'خدمة ممتازة! طلبت من Shein وجاء الطرد في 22 يوم. السعر بالدينار واضح ومحسوب بدقة. نوصي بيها برشا!' },
              { name: 'سارة المنصوري',  city: 'صفاقس',             rating: 5, text: 'أول مرة نطلب من AliExpress وما عرفتش كيفاش. Bysis ساعدتني في كل شيء من البداية للنهاية. شكراً جزيلاً!' },
              { name: 'خالد الطرابلسي', city: 'سوسة',              rating: 5, text: 'الشات بوت سريع ويجاوب على كل الأسئلة. حسبتلي السعر بالدينار في ثواني. تجربة محترفة جداً.' },
            ].map((rev, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="rounded-2xl p-5" style={{ background: BG, border: `1px solid ${BORDER}` }}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold text-white flex-shrink-0"
                    style={{ background: BLUE, fontFamily: 'Inter, sans-serif' }}>
                    {rev.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <p className="font-bold text-sm" style={{ color: TEXT, fontFamily: 'Inter, sans-serif' }}>{rev.name}</p>
                        <p className="text-xs" style={{ color: MUTED }}>{rev.city}</p>
                      </div>
                      <div className="flex gap-0.5">{Array.from({ length: rev.rating }).map((_,s) => <span key={s} style={{ color: '#F59E0B', fontSize: '14px' }}>★</span>)}</div>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: '#4A4F54' }}>{rev.text}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL — PayPal navy ────────────────────────────────────── */}
      <section className="py-16 px-5 safe-area-bottom" style={{ background: NAVY }}>
        <div className="max-w-lg mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            {/* Icon */}
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5"
              style={{ background: 'rgba(255,255,255,0.10)' }}
            >
              <Rocket size={28} weight="fill" color="white" />
            </div>

            <h2
              className="text-2xl font-extrabold mb-3 text-white"
              style={{ letterSpacing: '-0.02em', fontFamily: 'Inter, sans-serif' }}
            >
              Prêt à commencer ?
            </h2>
            <p
              className="text-sm mb-8 leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.58)', fontFamily: 'Inter, sans-serif' }}
            >
              Rejoignez des milliers de clients qui font confiance à Bysis pour leurs achats en ligne.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/calculator">
                <button
                  className="flex items-center justify-center gap-2 px-8 py-3.5 font-semibold text-white transition-all duration-150 active:scale-[0.97]"
                  style={{
                    background: BLUE,
                    borderRadius: 24,
                    fontSize: '0.9375rem',
                    boxShadow: `0 4px 16px rgba(0,112,186,0.45)`,
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  <Scan size={18} weight="bold" />
                  Calculer mon prix
                </button>
              </Link>
              <Link href="/order">
                <button
                  className="flex items-center justify-center gap-2 px-8 py-3.5 font-semibold text-white transition-all duration-150 active:scale-[0.97]"
                  style={{
                    background: 'rgba(255,255,255,0.12)',
                    borderRadius: 24,
                    fontSize: '0.9375rem',
                    border: '1.5px solid rgba(255,255,255,0.28)',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  <ShoppingCart size={18} weight="bold" />
                  Passer une commande
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </AppLayout>
  );
}
