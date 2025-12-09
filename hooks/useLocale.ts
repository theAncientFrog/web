/**
 * React Hook для роботи з локаллю на клієнті
 * 
 * Використання:
 * const { locale, setLocale, getLocalizedValue } = useLocale();
 * const dishName = getLocalizedValue(dish, 'name');
 */

'use client';

import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';
import { getLocalizedValue as getLocalizedValueHelper, type SupportedLocale } from '@/lib/i18n-helpers';

export function useLocale() {
  const { i18n } = useTranslation();
  
  // Визначаємо поточну локаль
  const currentLang = i18n.language || 'ua';
  const locale: SupportedLocale = currentLang.startsWith('en') ? 'en' : 'ua';

  // Функція для зміни мови
  const setLocale = useCallback((newLocale: SupportedLocale) => {
    i18n.changeLanguage(newLocale);
    // Оновлюємо cookie для серверних компонентів
    document.cookie = `i18next=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
  }, [i18n]);

  // Функція для отримання локалізованого значення
  const getLocalizedValueForData = useCallback(<T extends {
    name?: string | null;
    nameEn?: string | null;
    description?: string | null;
    descriptionEn?: string | null;
  }>(
    data: T,
    field: 'name' | 'description' = 'name'
  ): string => {
    return getLocalizedValueHelper(data, locale, field);
  }, [locale]);

  // Функція для створення заголовків для fetch запитів
  const getFetchHeaders = useCallback(() => {
    return {
      'x-lang': locale,
      'Accept-Language': locale,
    };
  }, [locale]);

  return {
    locale,
    setLocale,
    getLocalizedValue: getLocalizedValueForData,
    getFetchHeaders,
  };
}

