import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    resources: {
      en: {
        translation: {
          welcome: "Welcome to the global e‑content store!",
        },
      },
      zh: {
        translation: {
          welcome: "欢迎来到全球电子内容商城！",
        },
      },
    },
    react: { useSuspense: false },
  });

export default i18n;