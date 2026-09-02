/**
 * KisaanDost i18n Configuration
 *
 * Wires up `i18n-js` with the translations dictionary and exposes a
 * convenience `t()` helper that the rest of the app can import directly.
 *
 * NOTE: The active locale is managed by `LanguageContext`.  This module
 * only bootstraps the i18n instance and provides the `t` shortcut.
 */
import { I18n } from 'i18n-js';
import { translations } from './translations';

const i18n = new I18n(translations);

// When a key is missing in the active locale, fall back to the other locale
// rather than returning the raw key.
i18n.enableFallback = true;

// Default locale — will be overridden at runtime by LanguageContext.
i18n.defaultLocale = 'ur';
i18n.locale = 'ur';

/**
 * Translate a dot-separated key, optionally interpolating `params`.
 *
 * ```ts
 * t('common.loading')            // 'لوڈ ہو رہا ہے…'
 * t('common.loading', {}, { locale: 'en' })  // 'Loading…'
 * ```
 */
export function t(
  key: string,
  params?: Record<string, string | number>,
  options?: { locale?: string },
): string {
  return i18n.t(key, { ...params, ...options });
}

export { i18n };
