# Повна інструкція з реалізації i18n

## 📋 Огляд

Цей проект реалізує повну підтримку багатомовності для:
- ✅ UI елементів (через react-i18next)
- ✅ Динамічних даних з БД (назви страв, описи категорій)

## 🚀 Швидкий старт

### 1. Встановлення залежностей

Всі необхідні пакети вже встановлені:
- `react-i18next` - для UI перекладів
- `i18next-http-backend` - завантаження перекладів
- `i18next-browser-languagedetector` - визначення мови

### 2. Структура БД

Схема вже містить поля для перекладів:
```prisma
model Category {
  name         String
  nameEn       String?
  description  String?
  descriptionEn String?
}

model Dish {
  name        String
  nameEn      String?
  description String?
  descriptionEn String?
}
```

### 3. Застосування міграцій

```bash
# Застосувати міграцію для індексів (опціонально, для швидкого пошуку)
npx prisma migrate dev --name add_i18n_indexes

# Згенерувати Prisma Client
npx prisma generate
```

### 4. Додати переклади в БД

```bash
# Запустити seed скрипт для прикладу перекладів
npx tsx prisma/seed-i18n.ts
```

## 📖 Використання

### Backend (API Routes)

#### Приклад: GET /api/dishes

API автоматично визначає локаль з:
1. Query параметра `?lang=en`
2. HTTP заголовка `x-lang: en`
3. HTTP заголовка `Accept-Language: en-US,en;q=0.9`
4. Cookie `i18next=en`
5. За замовчуванням `ua`

```typescript
// app/api/dishes/route.ts
import { getLocaleFromRequest, localizeEntities } from '@/lib/i18n-helpers';

export async function GET(request: Request) {
  const locale = getLocaleFromRequest(request);
  const dishes = await prisma.dish.findMany({...});
  
  // Локалізуємо дані
  const localizedDishes = localizeEntities(dishes, locale);
  
  return NextResponse.json(localizedDishes, {
    headers: {
      'Content-Language': locale,
      'Vary': 'Accept-Language, x-lang',
    },
  });
}
```

### Frontend (React Components)

#### Client Component

```tsx
'use client';

import { useLocale } from '@/hooks/useLocale';
import { useLocalizedData } from '@/hooks/useLocalizedData';

export function MenuPage() {
  const { locale, getLocalizedValue } = useLocale();
  const { data: dishes, isLoading } = useLocalizedData('/api/dishes?restaurantId=1');
  
  return (
    <div>
      {dishes?.map(dish => (
        <div key={dish.id}>
          <h3>{dish.name}</h3>
          <p>{dish.description}</p>
        </div>
      ))}
    </div>
  );
}
```

#### Server Component (рекомендовано)

```tsx
import { headers } from 'next/headers';
import { getLocaleFromRequest, localizeEntities } from '@/lib/i18n-helpers';
import { prisma } from '@/lib/prisma';

export default async function MenuPage() {
  const headersList = await headers();
  const locale = getLocaleFromRequest({ headers: headersList });
  
  const dishes = await prisma.dish.findMany({
    where: { restaurantId: 1 }
  });
  
  const localizedDishes = localizeEntities(dishes, locale);
  
  return (
    <div>
      {localizedDishes.map(dish => (
        <div key={dish.id}>
          <h3>{dish.name}</h3>
        </div>
      ))}
    </div>
  );
}
```

### Використання хуків

#### useLocale

```tsx
const { locale, setLocale, getLocalizedValue, getFetchHeaders } = useLocale();

// Змінити мову
setLocale('en');

// Отримати локалізоване значення (якщо API не локалізував)
const name = getLocalizedValue(dish, 'name');

// Отримати заголовки для fetch
const headers = getFetchHeaders();
fetch('/api/dishes', { headers });
```

#### useLocalizedData

```tsx
const { data, isLoading, error } = useLocalizedData(
  '/api/dishes?restaurantId=1',
  { revalidate: 60 }
);
```

## 🔧 Налаштування

### Додати нову мову

1. Додати поля в schema.prisma:
```prisma
model Dish {
  nameRu String? // Нова мова
}
```

2. Оновити типи:
```typescript
// lib/i18n-helpers.ts
export type SupportedLocale = 'ua' | 'en' | 'ru';
export const SUPPORTED_LOCALES: SupportedLocale[] = ['ua', 'en', 'ru'];
```

3. Додати переклади UI:
```json
// public/locales/ru/translation.json
{
  "menu": {
    "title": "Меню"
  }
}
```

### Змінити мову за замовчуванням

```typescript
// lib/i18n-helpers.ts
export const DEFAULT_LOCALE: SupportedLocale = 'en'; // Було 'ua'
```

## 🧪 Тестування

```bash
# Запустити unit тести
npm test -- i18n.test.ts

# Перевірити API вручну
curl "http://localhost:3000/api/dishes?restaurantId=1&lang=en" \
  -H "x-lang: en"
```

## 📊 Продуктивність

### Індекси для пошуку

Міграція `add_i18n_indexes` створює:
- GIN індекси для швидкого ILIKE пошуку
- Композитні індекси для пошуку по ресторану + назві

### Кешування

API автоматично додає заголовки:
- `Cache-Control: public, s-maxage=60`
- `Vary: Accept-Language, x-lang` (важливо для правильного кешування)

## 🐛 Troubleshooting

### Проблема: Дані не змінюються при зміні мови

**Рішення:**
1. Перевірте, чи API повертає правильні заголовки `Vary`
2. Очистіть кеш браузера
3. Використовуйте `router.refresh()` після зміни мови

### Проблема: Fallback не працює

**Рішення:**
Перевірте, чи `name` (українська версія) завжди заповнена в БД.

### Проблема: Пошук не знаходить англійські назви

**Рішення:**
Застосуйте міграцію індексів:
```bash
npx prisma migrate dev --name add_i18n_indexes
```

## 📚 Додаткові ресурси

- [I18N Strategy](./I18N_STRATEGY.md) - детальне порівняння стратегій
- [SEO Guide](./SEO_I18N.md) - налаштування SEO
- [Caching Guide](./CACHING_I18N.md) - кешування та ISR

## ✅ Чеклист реалізації

- [x] Schema з полями nameEn/descriptionEn
- [x] Helper функції для локалізації
- [x] API routes з підтримкою локалі
- [x] React hooks для клієнта
- [x] LocaleSwitcher оновлено
- [x] Fallback логіка
- [x] Індекси для пошуку
- [x] Seed скрипт
- [x] Тести
- [x] Документація

## 🎯 Наступні кроки

1. Додати переклади для всіх страв в БД
2. Налаштувати SEO (hreflang, canonical)
3. Додати middleware для локалізованих URL (опціонально)
4. Налаштувати кешування на CDN (Vercel автоматично)

