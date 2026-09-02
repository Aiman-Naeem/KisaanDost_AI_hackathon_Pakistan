/**
 * KisaanDost Translation Strings
 *
 * Centralised i18n dictionary.  Keys are dot-separated by convention
 * (e.g. `common.loading`).  Urdu (`ur`) is the default language; English
 * (`en`) is available as a toggle for bilingual users.
 *
 * Only a handful of sample keys exist for now — later prompts will fill
 * in the rest of the UI strings.
 */

const en = {
  common: {
    loading: 'Loading…',
    error: 'Something went wrong',
    retry: 'Try again',
    cancel: 'Cancel',
  },
  nav: {
    voiceAssistant: 'Voice Assistant',
    marketplace: 'Marketplace',
  },
};

const ur: Record<string, Record<string, string>> = {
  common: {
    loading: 'لوڈ ہو رہا ہے…',
    error: 'کچھ غلط ہو گیا',
    retry: 'دوبارہ کوشش کریں',
    cancel: 'منسوخ کریں',
  },
  nav: {
    voiceAssistant: 'آواز معاون',
    marketplace: 'منڈی',
  },
};

export const translations = { en, ur };

export type TranslationKeys = typeof en;
