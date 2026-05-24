import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Lang = 'fr' | 'ar';

const translations = {
  fr: {
    // Bottom Nav
    nav_home: 'Accueil',
    nav_boutiques: 'Boutiques',
    nav_scan: 'Scanner',
    nav_panier: 'Panier',
    nav_moi: 'Moi',
    // Profile sheet
    profile_guest: 'Visiteur',
    profile_guest_sub: 'Créez votre compte',
    profile_login: 'Se connecter',
    profile_orders: 'Mes Commandes',
    profile_track: 'Suivi en direct',
    profile_history: 'Historique prix',
    profile_settings: 'Paramètres',
    profile_language: 'Langue',
    profile_dark: 'Mode sombre',
    profile_terms: 'Termes & Conditions',
    profile_contact: 'Nous contacter',
    profile_logout: 'Se déconnecter',
    profile_version: 'Version',
    // General
    add_to_cart: 'Ajouter au panier',
    commander: 'Commander',
    cart_empty: 'Votre panier est vide',
    cart_title: 'Mon Panier',
    cart_total: 'Total',
    cart_checkout: 'Passer la commande',
    cart_remove: 'Supprimer',
    available: 'Disponible',
    unavailable: 'Indisponible',
    boutiques_title: 'Boutiques',
    boutiques_sub: 'Produits disponibles à commander',
    scan_title: 'Scanner un produit',
    scan_sub: 'Scannez un QR code ou collez un lien produit',
  },
  ar: {
    // Bottom Nav
    nav_home: 'الرئيسية',
    nav_boutiques: 'المتاجر',
    nav_scan: 'مسح',
    nav_panier: 'السلة',
    nav_moi: 'أنا',
    // Profile sheet
    profile_guest: 'زائر',
    profile_guest_sub: 'أنشئ حسابك',
    profile_login: 'تسجيل الدخول',
    profile_orders: 'طلباتي',
    profile_track: 'تتبع مباشر',
    profile_history: 'سجل الأسعار',
    profile_settings: 'الإعدادات',
    profile_language: 'اللغة',
    profile_dark: 'الوضع الداكن',
    profile_terms: 'الشروط والأحكام',
    profile_contact: 'اتصل بنا',
    profile_logout: 'تسجيل الخروج',
    profile_version: 'الإصدار',
    // General
    add_to_cart: 'أضف للسلة',
    commander: 'اطلب الآن',
    cart_empty: 'سلتك فارغة',
    cart_title: 'سلتي',
    cart_total: 'المجموع',
    cart_checkout: 'تأكيد الطلب',
    cart_remove: 'حذف',
    available: 'متوفر',
    unavailable: 'غير متوفر',
    boutiques_title: 'المتاجر',
    boutiques_sub: 'منتجات متاحة للطلب',
    scan_title: 'مسح منتج',
    scan_sub: 'امسح QR code أو الصق رابط المنتج',
  },
};

export type TranslationKey = keyof typeof translations.fr;

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextType>({
  lang: 'fr',
  setLang: () => {},
  t: (key) => key,
  isRTL: false,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      return (localStorage.getItem('bysis_lang') as Lang) || 'fr';
    } catch {
      return 'fr';
    }
  });

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem('bysis_lang', newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key: TranslationKey): string => {
    return translations[lang][key] || translations.fr[key] || key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t, isRTL: lang === 'ar' }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
