import { useLangStore } from '@/store';
import { dashboardTranslations, menuTranslations } from '@/i18n/translations';
import type { LangCode, DashboardT, MenuT } from '@/i18n/translations';

/**
 * useTranslation — Returns the translation object for the active language.
 * Two overloads so TypeScript knows the exact return type per mode.
 */
export function useTranslation(mode: 'owner'): { t: DashboardT; lang: LangCode };
export function useTranslation(mode: 'customer'): { t: MenuT; lang: LangCode };
export function useTranslation(mode: 'owner' | 'customer'): { t: DashboardT | MenuT; lang: LangCode } {
  const { ownerLang, customerLang } = useLangStore();
  const lang: LangCode = mode === 'owner' ? ownerLang : customerLang;

  if (mode === 'owner') {
    return { t: dashboardTranslations[lang] as DashboardT, lang };
  }
  return { t: menuTranslations[lang] as MenuT, lang };
}
