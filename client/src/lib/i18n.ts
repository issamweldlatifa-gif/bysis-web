import React from "react";

/**
 * Internationalization (i18n) support for Bysis AI
 * Default language: French
 */

export type Language = "fr" | "en" | "ar";

export const translations = {
  fr: {
    // AI Chat Box
    "chat.placeholder": "Posez votre question à l'IA...",
    "chat.emptyState": "Commencez une conversation avec l'IA",
    "chat.title": "Bysis AI",
    "chat.subtitle": "Assistant Intelligent",
    "chat.listening": "Écoute vocale",
    "chat.send": "Envoyer",
    "chat.thinking": "L'IA réfléchit...",
    
    // Suggested prompts
    "prompt.explain": "Expliquez-moi ce concept",
    "prompt.help": "Aidez-moi avec cette tâche",
    "prompt.generate": "Générez du contenu",
    "prompt.translate": "Traduisez ce texte",
    
    // Settings
    "settings.language": "Langue",
    "settings.theme": "Thème",
    "settings.notifications": "Notifications",
    "settings.privacy": "Confidentialité",
    
    // Common
    "common.cancel": "Annuler",
    "common.save": "Enregistrer",
    "common.delete": "Supprimer",
    "common.edit": "Modifier",
    "common.close": "Fermer",
  },
  en: {
    // AI Chat Box
    "chat.placeholder": "Ask the AI a question...",
    "chat.emptyState": "Start a conversation with AI",
    "chat.title": "Bysis AI",
    "chat.subtitle": "Intelligent Assistant",
    "chat.listening": "Voice listening",
    "chat.send": "Send",
    "chat.thinking": "AI is thinking...",
    
    // Suggested prompts
    "prompt.explain": "Explain this concept to me",
    "prompt.help": "Help me with this task",
    "prompt.generate": "Generate content",
    "prompt.translate": "Translate this text",
    
    // Settings
    "settings.language": "Language",
    "settings.theme": "Theme",
    "settings.notifications": "Notifications",
    "settings.privacy": "Privacy",
    
    // Common
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.close": "Close",
  },
  ar: {
    // AI Chat Box
    "chat.placeholder": "اسأل الذكاء الاصطناعي...",
    "chat.emptyState": "ابدأ محادثة مع الذكاء الاصطناعي",
    "chat.title": "Bysis AI",
    "chat.subtitle": "مساعد ذكي",
    "chat.listening": "الاستماع الصوتي",
    "chat.send": "إرسال",
    "chat.thinking": "الذكاء الاصطناعي يفكر...",
    
    // Suggested prompts
    "prompt.explain": "اشرح لي هذا المفهوم",
    "prompt.help": "ساعدني في هذه المهمة",
    "prompt.generate": "توليد محتوى",
    "prompt.translate": "ترجم هذا النص",
    
    // Settings
    "settings.language": "اللغة",
    "settings.theme": "المظهر",
    "settings.notifications": "الإخطارات",
    "settings.privacy": "الخصوصية",
    
    // Common
    "common.cancel": "إلغاء",
    "common.save": "حفظ",
    "common.delete": "حذف",
    "common.edit": "تعديل",
    "common.close": "إغلاق",
  },
};

/**
 * Get translation for a key in a specific language
 * Falls back to French if translation not found
 */
export function t(key: string, language: Language = "fr"): string {
  const trans = translations[language] as Record<string, string>;
  return trans?.[key] || translations.fr[key as keyof typeof translations.fr] || key;
}

/**
 * Create a language context hook
 */
export function useLanguage() {
  const [language, setLanguage] = React.useState<Language>(() => {
    // Try to get from localStorage
    const stored = typeof window !== "undefined" ? localStorage.getItem("language") : null;
    return (stored as Language) || "fr";
  });

  const setLanguageAndStore = (lang: Language) => {
    setLanguage(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("language", lang);
    }
  };

  return { language, setLanguage: setLanguageAndStore, t: (key: string) => t(key, language) };
}
