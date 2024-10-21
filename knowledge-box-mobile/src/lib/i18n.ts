import { I18n } from "i18n-js";
import { getLocales } from "expo-localization";
import en from "../../locales/en.json";
import ru from "../../locales/ru.json";
import de from "../../locales/de.json";
import zh from "../../locales/zh.json";
export const deviceLanguage = getLocales()?.[0]?.languageCode ?? "en";

export const i18n = new I18n({
  en,
  zh,
  ru,
  de,
});

export const t = i18n.t;

i18n.defaultLocale = deviceLanguage;

//i18n.locale = deviceLanguage;
i18n.locale = "de";
