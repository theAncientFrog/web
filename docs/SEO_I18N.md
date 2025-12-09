# SEO для багатомовного сайту

## Canonical URLs та hreflang

### 1. Додати hreflang теги в layout

```tsx
// app/layout.tsx (Server Component)
import { headers } from 'next/headers';
import { getLocaleFromRequest } from '@/lib/i18n-helpers';

export default async function RootLayout({ children }) {
  const headersList = await headers();
  const locale = getLocaleFromRequest({ headers: headersList });
  
  return (
    <html lang={locale}>
      <head>
        {/* hreflang для альтернативних версій */}
        <link rel="alternate" hreflang="uk" href="https://yoursite.com/uk/menu" />
        <link rel="alternate" hreflang="en" href="https://yoursite.com/en/menu" />
        <link rel="alternate" hreflang="x-default" href="https://yoursite.com/ua/menu" />
        
        {/* Canonical URL */}
        <link rel="canonical" href={`https://yoursite.com/${locale}/menu`} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### 2. Middleware для локалізованих URL

```ts
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Перевіряємо чи є локаль в URL
  const pathnameHasLocale = ['/ua', '/en'].some(
    (locale) => pathname.startsWith(locale)
  );

  if (!pathnameHasLocale) {
    // Визначаємо локаль з cookie або Accept-Language
    const locale = request.cookies.get('i18next')?.value || 'ua';
    
    // Перенаправляємо на локалізований URL
    return NextResponse.redirect(
      new URL(`/${locale}${pathname}`, request.url)
    );
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### 3. Metadata для кожної сторінки

```tsx
// app/menu/[restaurantId]/page.tsx
import { Metadata } from 'next';
import { getLocaleFromRequest } from '@/lib/i18n-helpers';
import { headers } from 'next/headers';

export async function generateMetadata({ params }): Promise<Metadata> {
  const headersList = await headers();
  const locale = getLocaleFromRequest({ headers: headersList });
  
  return {
    title: locale === 'en' ? 'Menu' : 'Меню',
    description: locale === 'en' 
      ? 'Restaurant menu with delicious dishes'
      : 'Меню ресторану з смачними стравами',
    alternates: {
      languages: {
        'uk-UA': '/ua/menu',
        'en-US': '/en/menu',
      },
    },
  };
}
```

## Структура URL

### Варіант 1: Піддомени (рекомендовано для великих проектів)
- `ua.yoursite.com` - українська версія
- `en.yoursite.com` - англійська версія

### Варіант 2: Префікси в URL (поточна реалізація)
- `/ua/menu` - українська версія
- `/en/menu` - англійська версія

### Варіант 3: Query параметри (не рекомендовано для SEO)
- `/menu?lang=ua`
- `/menu?lang=en`

## Open Graph та Twitter Cards

```tsx
export const metadata = {
  openGraph: {
    title: 'Menu',
    description: 'Restaurant menu',
    locale: 'en_US',
    alternateLocale: 'uk_UA',
    url: 'https://yoursite.com/en/menu',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Menu',
    description: 'Restaurant menu',
  },
};
```

