/**
 * i18n Helper Functions
 * 
 * Допоміжні функції для роботи з багатомовністю на сервері та клієнті
 */

export type SupportedLocale = 'ua' | 'en';
export const DEFAULT_LOCALE: SupportedLocale = 'ua';
export const SUPPORTED_LOCALES: SupportedLocale[] = ['ua', 'en'];

/**
 * Визначає локаль з різних джерел (у порядку пріоритету):
 * 1. Query параметр ?lang=
 * 2. HTTP заголовок Accept-Language
 * 3. HTTP заголовок x-lang
 * 4. Cookie i18next
 * 5. За замовчуванням 'ua'
 */
export function getLocaleFromRequest(request: Request | { url?: string; headers?: Headers }): SupportedLocale {
  // 1. Перевіряємо query параметр
  if (request.url) {
    const url = new URL(request.url);
    const langParam = url.searchParams.get('lang');
    if (langParam && isValidLocale(langParam)) {
      return langParam as SupportedLocale;
    }
  }

  // 2. Перевіряємо заголовок x-lang
  if (request.headers) {
    const xLang = request.headers.get('x-lang');
    if (xLang && isValidLocale(xLang)) {
      return xLang as SupportedLocale;
    }

    // 3. Перевіряємо Accept-Language
    const acceptLanguage = request.headers.get('accept-language');
    if (acceptLanguage) {
      const locale = parseAcceptLanguage(acceptLanguage);
      if (locale) return locale;
    }
  }

  return DEFAULT_LOCALE;
}

/**
 * Парсить Accept-Language заголовок
 * Приклад: "en-US,en;q=0.9,uk;q=0.8" → "en"
 */
function parseAcceptLanguage(acceptLanguage: string): SupportedLocale | null {
  const languages = acceptLanguage
    .split(',')
    .map(lang => {
      const [code, q = 'q=1'] = lang.trim().split(';');
      const quality = parseFloat(q.replace('q=', ''));
      return { code: code.split('-')[0].toLowerCase(), quality };
    })
    .sort((a, b) => b.quality - a.quality);

  for (const lang of languages) {
    if (isValidLocale(lang.code)) {
      return lang.code as SupportedLocale;
    }
  }

  return null;
}

/**
 * Перевіряє чи є локаль підтримуваною
 */
export function isValidLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}

/**
 * Отримує локалізоване значення з fallback
 * 
 * @param data - Об'єкт з полями name, nameEn (або description, descriptionEn, allergens, allergensEn)
 * @param locale - Поточна локаль
 * @param field - Назва поля ('name', 'description', або 'allergens')
 * @returns Локалізоване значення або fallback
 */
export function getLocalizedValue<T extends { 
  name?: string | null; 
  nameEn?: string | null; 
  description?: string | null; 
  descriptionEn?: string | null;
  allergens?: string | null;
  allergensEn?: string | null;
}>(
  data: T,
  locale: SupportedLocale,
  field: 'name' | 'description' | 'allergens' = 'name'
): string {
  if (!data) return '';
  
  if (locale === 'en') {
    let enField: keyof T;
    if (field === 'name') {
      enField = 'nameEn' as keyof T;
    } else if (field === 'description') {
      enField = 'descriptionEn' as keyof T;
    } else if (field === 'allergens') {
      enField = 'allergensEn' as keyof T;
    } else {
      enField = field as keyof T;
    }
    
    const enValue = data[enField] as string | null | undefined;
    if (enValue && typeof enValue === 'string' && enValue.trim()) {
      return enValue;
    }
  }

  // Fallback на українську
  const uaField = field as keyof T;
  const uaValue = data[uaField] as string | null | undefined;
  return (uaValue && typeof uaValue === 'string') ? uaValue : '';
}

/**
 * Трансформує об'єкт з багатомовними полями в локалізований об'єкт
 * 
 * @param data - Об'єкт з полями name, nameEn, description, descriptionEn, allergens, allergensEn
 * @param locale - Поточна локаль
 * @returns Об'єкт з полями name, description, allergens (вже локалізовані)
 */
export function localizeEntity<T extends {
  name?: string | null;
  nameEn?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  allergens?: string | null;
  allergensEn?: string | null;
}>(
  data: T,
  locale: SupportedLocale
): Omit<T, 'nameEn' | 'descriptionEn' | 'allergensEn'> & {
  name: string;
  description?: string;
  allergens?: string;
} {
  // Безпечна локалізація з fallback
  // getLocalizedValue вже має fallback на українську, але переконуємося що name завжди є
  const localizedName = getLocalizedValue(data, locale, 'name');
  // Якщо після локалізації назва пуста, використовуємо українську як останній fallback
  const finalName = localizedName || data.name || '';
  
  if (!finalName) {
    console.warn('[localizeEntity] Warning: Dish/Category has no name after localization', {
      id: (data as any).id,
      originalName: data.name,
      nameEn: data.nameEn,
      locale
    });
  }
  
  const result: any = {
    ...data,
    name: finalName,
  };
  
  if (data.description !== undefined || data.descriptionEn !== undefined) {
    result.description = getLocalizedValue(data, locale, 'description') || data.description || undefined;
  }
  
  if (data.allergens !== undefined || data.allergensEn !== undefined) {
    result.allergens = getLocalizedValue(data, locale, 'allergens') || data.allergens || undefined;
  }
  
  // Видаляємо англійські поля
  delete result.nameEn;
  delete result.descriptionEn;
  delete result.allergensEn;
  
  return result;
}

/**
 * Трансформує масив об'єктів
 */
export function localizeEntities<T extends {
  name?: string | null;
  nameEn?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  allergens?: string | null;
  allergensEn?: string | null;
}>(
  data: T[],
  locale: SupportedLocale
): Array<Omit<T, 'nameEn' | 'descriptionEn' | 'allergensEn'> & { name: string; description?: string; allergens?: string }> {
  if (!Array.isArray(data)) {
    console.warn('[localizeEntities] Expected array, got:', typeof data);
    return [];
  }
  return data.map(item => localizeEntity(item, locale));
}

/**
 * Створює Prisma select об'єкт для вибору локалізованих полів
 * Використовується для оптимізації запитів
 */
export function getLocalizedSelect(locale: SupportedLocale) {
  if (locale === 'en') {
    return {
      id: true,
      name: true,
      nameEn: true,
      description: true,
      descriptionEn: true,
      // Інші поля...
    };
  }
  
  return {
    id: true,
    name: true,
    description: true,
    // nameEn та descriptionEn не потрібні для ua
  };
}

