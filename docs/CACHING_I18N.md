# Кешування та ISR для багатомовного контенту

## Проблема

При зміні мови через перемикач, Next.js ISR/SSG може повертати закешовані дані неправильної мови.

## Рішення

### 1. Використання Vary заголовків

```ts
// app/api/dishes/route.ts
return NextResponse.json(data, {
  headers: {
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    'Vary': 'Accept-Language, x-lang', // Важливо!
    'Content-Language': locale,
  },
});
```

### 2. Dynamic Route Segments для мови

```tsx
// app/[locale]/menu/[restaurantId]/page.tsx
export default async function MenuPage({ 
  params 
}: { 
  params: { locale: string; restaurantId: string } 
}) {
  const locale = params.locale as 'ua' | 'en';
  // ...
}
```

### 3. Revalidation при зміні мови

```tsx
// app/components/LocaleSwitcher.tsx
const changeLanguage = async (lng: string) => {
  i18n.changeLanguage(lng);
  
  // Очищаємо кеш для поточної сторінки
  await fetch('/api/revalidate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: window.location.pathname }),
  });
  
  router.refresh();
};
```

### 4. ISR з локаллю в ключі

```tsx
// app/menu/[restaurantId]/page.tsx
export async function generateStaticParams() {
  return [
    { restaurantId: '1', locale: 'ua' },
    { restaurantId: '1', locale: 'en' },
    // ...
  ];
}

export const revalidate = 3600; // 1 година
```

### 5. SWR/React Query з ключем локалі

```tsx
import useSWR from 'swr';
import { useLocale } from '@/hooks/useLocale';

function useDishes(restaurantId: number) {
  const { locale } = useLocale();
  
  // Ключ включає локаль - при зміні мови дані перезавантажаються
  const { data, error } = useSWR(
    [`/api/dishes?restaurantId=${restaurantId}`, locale],
    (url) => fetch(`${url}&lang=${locale}`).then(r => r.json())
  );
  
  return { data, error };
}
```

## ETag для кешування

```ts
// app/api/dishes/route.ts
import { createHash } from 'crypto';

export async function GET(request: Request) {
  const dishes = await getDishes();
  const locale = getLocaleFromRequest(request);
  
  // Створюємо ETag на основі даних та локалі
  const dataString = JSON.stringify(dishes) + locale;
  const etag = createHash('md5').update(dataString).digest('hex');
  
  // Перевіряємо If-None-Match
  const ifNoneMatch = request.headers.get('if-none-match');
  if (ifNoneMatch === etag) {
    return new Response(null, { status: 304 });
  }
  
  return NextResponse.json(dishes, {
    headers: {
      'ETag': etag,
      'Cache-Control': 'public, max-age=60',
    },
  });
}
```

## Рекомендації

1. **Використовуйте Vary заголовки** - обов'язково
2. **Додавайте локаль в ключі кешу** - для SWR/React Query
3. **Очищайте кеш при зміні мови** - router.refresh() або revalidate
4. **Використовуйте короткі TTL** - для динамічного контенту (60-300 сек)
5. **ETag для оптимізації** - зменшує трафік

