import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/_core/hooks/useAuth';
import { useI18n } from '@/contexts/I18nContext';
import { useTheme } from '@/contexts/ThemeContext';
import AuthGateModal from './AuthGateModal';
import { useState } from 'react';
import { useLocation } from 'wouter';

// Icons — all outline, stroke 1.8px
const SW = '1.8';
const IconOrders = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);
const IconTrack = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconHistory = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="12 8 12 12 14 14"/><path d="M3.05 11a9 9 0 1 0 .5-4.5"/><polyline points="3 3 3 9 9 9"/>
  </svg>
);
const IconSettings = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
  </svg>
);
const IconMoon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  </svg>
);
const IconSun = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);
const IconGlobe = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
  </svg>
);
const IconTerms = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
  </svg>
);
const IconMail = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
  </svg>
);
const IconLogout = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const IconLogin = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
  </svg>
);

interface ProfileSheetProps {
  open: boolean;
  onClose: () => void;
}

function MenuItem({
  icon, label, onClick, right, danger, accent
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  right?: React.ReactNode;
  danger?: boolean;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-150 active:scale-[0.98] text-left"
      style={{
        color: danger ? '#EF4444' : accent ? '#0070BA' : 'inherit',
      }}
    >
      <span
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: danger ? '#FEF2F2' : accent ? '#EBF4FB' : 'rgba(0,0,0,0.05)',
          color: danger ? '#EF4444' : accent ? '#0070BA' : '#6C7378',
        }}
      >
        {icon}
      </span>
      <span className="flex-1 text-sm font-semibold">{label}</span>
      {right && <span className="flex-shrink-0">{right}</span>}
    </button>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className="relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0"
      style={{ background: checked ? '#0070BA' : '#CBD2D9' }}
    >
      <motion.span
        animate={{ x: checked ? 20 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
      />
    </button>
  );
}

export default function ProfileSheet({ open, onClose }: ProfileSheetProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const { lang, setLang, t } = useI18n();
  const { theme, toggleTheme: _toggleTheme } = useTheme();
  const toggleTheme = _toggleTheme || (() => {});
  const [authOpen, setAuthOpen] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [, navigate] = useLocation();
  const isDark = theme === 'dark';

  const bg = isDark ? '#1C1C1E' : '#FFFFFF';
  const cardBg = isDark ? '#2C2C2E' : '#F5F5F7';
  const textPrimary = isDark ? '#FFFFFF' : '#1C1C1E';
  const textSecondary = isDark ? 'rgba(255,255,255,0.5)' : '#6C7378';
  const divider = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleNavigate = (path: string) => {
    onClose();
    setTimeout(() => navigate(path), 150);
  };

  return (
    <>
      <AuthGateModal open={authOpen} onClose={() => setAuthOpen(false)} action="order" />

      <AnimatePresence>
        {showTerms && (
          <>
            <motion.div
              key="terms-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70]"
              style={{ background: 'rgba(0,0,0,0.6)' }}
              onClick={() => setShowTerms(false)}
            />
            <motion.div
              key="terms-sheet"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 38 }}
              className="fixed bottom-0 left-0 right-0 z-[71] overflow-y-auto"
              style={{ background: bg, borderRadius: '24px 24px 0 0', maxHeight: '85vh', paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full" style={{ background: divider }} />
              </div>
              <div className="px-5 pb-8">
                <h2 className="text-xl font-bold mb-4 mt-3" style={{ color: textPrimary }}>Termes & Conditions</h2>
                <div className="text-sm leading-relaxed space-y-4" style={{ color: textSecondary }}>
                  <p><strong style={{ color: textPrimary }}>1. Service Bysis</strong><br />
                  Bysis est un service d'intermédiaire qui vous permet de commander des produits depuis des plateformes internationales (Shein, AliExpress, Temu) et de les recevoir en Tunisie.</p>
                  <p><strong style={{ color: textPrimary }}>2. Délais de livraison</strong><br />
                  Les délais de livraison sont estimés entre 20 et 25 jours ouvrables à partir de la confirmation de commande. Ces délais peuvent varier selon les douanes et la disponibilité des produits.</p>
                  <p><strong style={{ color: textPrimary }}>3. Prix et paiement</strong><br />
                  Les prix sont calculés en dinars tunisiens (DT) et incluent le prix du produit, les frais de livraison internationale, et les frais de service Bysis. Le paiement peut être effectué par virement bancaire (UIB) ou mandat minute (La Poste).</p>
                  <p><strong style={{ color: textPrimary }}>4. Retours et remboursements</strong><br />
                  Les retours ne sont acceptés que si le produit reçu est défectueux ou ne correspond pas à la description. Toute demande de retour doit être soumise dans les 48h suivant la réception.</p>
                  <p><strong style={{ color: textPrimary }}>5. Responsabilités</strong><br />
                  Bysis n'est pas responsable des retards causés par les douanes tunisiennes, des produits en rupture de stock chez le vendeur, ou des variations de prix sur les plateformes tierces.</p>
                  <p><strong style={{ color: textPrimary }}>6. Données personnelles</strong><br />
                  Vos données (nom, téléphone, adresse) sont utilisées uniquement pour le traitement de vos commandes et ne sont jamais partagées avec des tiers.</p>
                  <p><strong style={{ color: textPrimary }}>7. Contact</strong><br />
                  Pour toute question: <a href="mailto:Iscof840@gmail.com" style={{ color: '#0070BA' }}>Iscof840@gmail.com</a></p>
                </div>
                <button
                  onClick={() => setShowTerms(false)}
                  className="w-full mt-6 py-3.5 rounded-2xl text-sm font-semibold"
                  style={{ background: '#0070BA', color: '#fff' }}
                >
                  J'ai compris
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="profile-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="fixed inset-0 z-50"
              style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)' }}
              onClick={onClose}
            />

            {/* Sheet */}
            <motion.div
              key="profile-sheet"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 38, mass: 0.9 }}
              className="fixed bottom-0 left-0 right-0 z-50"
              style={{
                background: bg,
                borderRadius: '24px 24px 0 0',
                paddingBottom: 'env(safe-area-inset-bottom, 16px)',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full" style={{ background: divider }} />
              </div>

              <div className="px-4 pb-6 pt-1">
                {/* User card */}
                <div
                  className="flex items-center gap-3.5 p-4 rounded-2xl mb-4"
                  style={{ background: cardBg }}
                >
                  {isAuthenticated ? (
                    <>
                      <div className="relative flex-shrink-0">
                        {user?.avatarUrl ? (
                          <img src={user.avatarUrl} alt="avatar" className="w-12 h-12 rounded-full object-cover" />
                        ) : (
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold"
                            style={{ background: 'linear-gradient(135deg, #0070BA, #003087)' }}
                          >
                            {user?.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                        )}
                        <span
                          className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2"
                          style={{ background: '#22C55E', borderColor: cardBg }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate" style={{ color: textPrimary }}>{user?.name || 'Mon compte'}</p>
                        <p className="text-xs truncate" style={{ color: textSecondary }}>{user?.email || ''}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: '#EBF4FB' }}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0070BA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold" style={{ color: textPrimary }}>{t('profile_guest')}</p>
                        <p className="text-xs" style={{ color: textSecondary }}>{t('profile_guest_sub')}</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Main actions */}
                <div className="rounded-2xl overflow-hidden mb-3" style={{ background: cardBg }}>
                  {isAuthenticated ? (
                    <>
                      <MenuItem icon={<IconOrders />} label={t('profile_orders')} onClick={() => handleNavigate('/orders')} />
                      <div style={{ height: 1, background: divider, margin: '0 16px' }} />
                      <MenuItem icon={<IconTrack />} label={t('profile_track')} onClick={() => handleNavigate('/track')} />
                      <div style={{ height: 1, background: divider, margin: '0 16px' }} />
                      <MenuItem icon={<IconHistory />} label={t('profile_history')} onClick={() => handleNavigate('/history')} />
                      <div style={{ height: 1, background: divider, margin: '0 16px' }} />
                      <MenuItem icon={<IconSettings />} label={t('profile_settings')} onClick={() => handleNavigate('/parametres')} />
                    </>
                  ) : (
                    <>
                      <MenuItem icon={<IconLogin />} label={t('profile_login')} onClick={() => { onClose(); setTimeout(() => setAuthOpen(true), 200); }} accent />
                      <div style={{ height: 1, background: divider, margin: '0 16px' }} />
                      <MenuItem icon={<IconTrack />} label={t('profile_track')} onClick={() => handleNavigate('/track')} />
                    </>
                  )}
                </div>

                {/* Preferences */}
                <div className="rounded-2xl overflow-hidden mb-3" style={{ background: cardBg }}>
                  <MenuItem
                    icon={isDark ? <IconSun /> : <IconMoon />}
                    label={t('profile_dark')}
                    right={<Toggle checked={isDark} onChange={toggleTheme} />}
                  />
                  <div style={{ height: 1, background: divider, margin: '0 16px' }} />
                  <MenuItem
                    icon={<IconGlobe />}
                    label={t('profile_language')}
                    right={
                      <div className="flex items-center gap-1 rounded-xl overflow-hidden" style={{ background: divider }}>
                        <button
                          onClick={() => setLang('fr')}
                          className="px-3 py-1.5 text-xs font-bold transition-all"
                          style={{
                            background: lang === 'fr' ? '#0070BA' : 'transparent',
                            color: lang === 'fr' ? '#fff' : textSecondary,
                            borderRadius: '10px',
                          }}
                        >
                          FR
                        </button>
                        <button
                          onClick={() => setLang('ar')}
                          className="px-3 py-1.5 text-xs font-bold transition-all"
                          style={{
                            background: lang === 'ar' ? '#0070BA' : 'transparent',
                            color: lang === 'ar' ? '#fff' : textSecondary,
                            borderRadius: '10px',
                          }}
                        >
                          AR
                        </button>
                      </div>
                    }
                  />
                </div>

                {/* Info */}
                <div className="rounded-2xl overflow-hidden mb-3" style={{ background: cardBg }}>
                  <MenuItem icon={<IconTerms />} label={t('profile_terms')} onClick={() => setShowTerms(true)} />
                  <div style={{ height: 1, background: divider, margin: '0 16px' }} />
                  <MenuItem
                    icon={<IconMail />}
                    label={t('profile_contact')}
                    onClick={() => window.open('mailto:Iscof840@gmail.com', '_blank')}
                  />
                </div>

                {/* Logout */}
                {isAuthenticated && (
                  <div className="rounded-2xl overflow-hidden mb-3" style={{ background: cardBg }}>
                    <MenuItem
                      icon={<IconLogout />}
                      label={t('profile_logout')}
                      onClick={() => { logout(); onClose(); }}
                      danger
                    />
                  </div>
                )}

                {/* Version */}
                <p className="text-center text-xs mt-2" style={{ color: textSecondary }}>
                  {t('profile_version')} 1.0.0
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
