# 🌍 Complete i18n Implementation Guide

## Executive Summary

This guide provides a comprehensive solution for implementing full Internationalization (i18n) across your Next.js application, ensuring 100% language consistency for both **Static UI** and **Dynamic Database Content**.

---

## 📋 1. Content Audit & Cleanup

### 1.1 Identified Issues

#### ❌ Hardcoded English Strings (Need Translation Files)

| Location | Current String | Translation Key | Status |
|----------|---------------|-----------------|--------|
| `EstablishmentsSection.tsx:58` | `"Establishments:"` | `common.establishments` | ❌ Missing |
| `HeaderCopy.tsx:13` | `"Breadcrumb"` | `footer.breadcrumb_title` | ✅ Exists |
| `HeaderManager.tsx:32` | `"Breadcrumb"` | `footer.breadcrumb_title` | ✅ Exists |
| Multiple pages | `"Breadcrumb"` | `footer.breadcrumb_title` | ✅ Exists |
| `RestaurantCard` | `"Address missing"` | `menu.address_missing` | ✅ Exists |

#### ✅ Already Localized (Just Need Usage)

| Translation Key | Ukrainian | English | Used In |
|----------------|-----------|---------|---------|
| `menu.calories_label` | "Калорійність" | "Calories" | ✅ MenuItem.tsx |
| `menu.address_missing` | "Адреса відсутня" | "Address missing" | ⚠️ Need to check |
| `footer.breadcrumb` | "Breadcrumb" | "Breadcrumb" | ⚠️ Need to check |

### 1.2 Action Checklist

#### Frontend (Translation Files)
- [x] Add `common.establishments` to both `ua.json` and `en.json`
- [ ] Replace hardcoded `"Establishments:"` in `EstablishmentsSection.tsx`
- [ ] Replace all hardcoded `"Breadcrumb"` strings with `t('footer.breadcrumb_title')`
- [ ] Verify `menu.address_missing` is used in `RestaurantCard`
- [ ] Add missing translations for sidebar categories (if hardcoded)

#### Database (Dynamic Content)
- [x] Schema already has `nameEn`, `descriptionEn`, `allergensEn` fields
- [ ] Run `check-translations.sql` to identify missing translations
- [ ] Use `seed-i18n.ts` to populate missing translations
- [ ] Verify all categories have `nameEn` values
- [ ] Verify all dishes have `nameEn` and `descriptionEn` values

---

## 🗄️ 2. Database Architecture (Prisma)

### 2.1 Architecture Decision: Separate Columns vs JSONB

#### Recommendation: **Separate Columns** ✅

**Why Separate Columns?**

1. **Type Safety**: Prisma generates TypeScript types automatically
2. **Performance**: Direct column access is faster than JSONB parsing
3. **Query Simplicity**: Easy to filter/search by language
4. **Indexing**: Can create indexes on specific language columns
5. **Migration Path**: Easier to add/remove languages incrementally

**JSONB Drawbacks:**
- ❌ No automatic TypeScript types
- ❌ Requires custom serialization/deserialization
- ❌ More complex queries for filtering
- ❌ Harder to index specific language fields

### 2.2 Current Schema (Already Implemented ✅)

```prisma
model Category {
  id           Int     @id @default(autoincrement())
  name         String  // Ukrainian (default)
  nameEn       String? // English translation
  description  String?
  descriptionEn String? // English description
  // ... other fields
}

model Dish {
  id          Int     @id @default(autoincrement())
  name        String  // Ukrainian (default)
  nameEn      String? // English translation
  description String?
  descriptionEn String? // English description
  allergens   String? // Ukrainian allergens
  allergensEn String? // English allergens
  // ... other fields
}

model Restaurant {
  id          Int      @id @default(autoincrement())
  name        String   // Ukrainian (default)
  nameEn      String?  // English translation
  description String?
  descriptionEn String? // English description
  // ... other fields
}
```

### 2.3 Migration Status

✅ **Already Applied**: The schema includes all i18n fields. If you need to verify:

```bash
# Check if columns exist
npx prisma db pull

# Or check migration status
npx prisma migrate status
```

---

## 🔧 3. Backend Logic (API)

### 3.1 Current Implementation Status

✅ **Already Implemented**: Your API routes use `getLocaleFromRequest` and `localizeEntities`.

### 3.2 API Route Pattern

**Example: `/api/dishes/route.ts`** (Already working ✅)

```typescript
import { getLocaleFromRequest, localizeEntities } from '@/lib/i18n-helpers';

export async function GET(request: Request) {
  const locale = getLocaleFromRequest(request); // Detects from header/query/cookie
  
  const dishes = await prisma.dish.findMany({
    select: {
      id: true,
      name: true,
      nameEn: true,        // ✅ Include English fields
      description: true,
      descriptionEn: true,
      allergens: true,
      allergensEn: true,
      // ... other fields
    }
  });

  // ✅ Localize: removes nameEn, descriptionEn, sets name/description based on locale
  const localizedDishes = localizeEntities(dishes, locale);

  return NextResponse.json(localizedDishes, {
    headers: {
      'Content-Language': locale,
      'Vary': 'Accept-Language, x-lang',
    }
  });
}
```

### 3.3 Locale Detection Priority

Your `getLocaleFromRequest` function checks in this order:
1. Query parameter: `?lang=en`
2. Header: `x-lang: en`
3. Header: `Accept-Language: en`
4. Cookie: `i18next=en`
5. Default: `ua`

### 3.4 Helper Functions (Already Implemented ✅)

**File: `lib/i18n-helpers.ts`**

```typescript
// ✅ Already implemented
export function getLocaleFromRequest(request: Request): SupportedLocale
export function localizeEntity<T>(data: T, locale: SupportedLocale): T
export function localizeEntities<T>(data: T[], locale: SupportedLocale): T[]
```

---

## 🎨 4. Frontend Implementation

### 4.1 Library Recommendation: **react-i18next** ✅

**Why `react-i18next` over `next-intl`?**

- ✅ **Already Integrated**: Your project uses `react-i18next`
- ✅ **Mature & Stable**: Battle-tested in production
- ✅ **Flexible**: Works with both client and server components
- ✅ **Feature-Rich**: Namespaces, interpolation, pluralization
- ✅ **No Breaking Changes**: Continue using existing setup

**When to Consider `next-intl`:**
- If starting a new project
- If you need App Router-specific features
- If you want built-in routing locale support

### 4.2 LocaleSwitcher Component (Already Implemented ✅)

**File: `app/components/LocaleSwitcher.js`**

```javascript
'use client';

import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';

export function LocaleSwitcher() {
    const { i18n } = useTranslation();
    const router = useRouter();
    const currentLang = i18n?.language || 'ua';

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        document.cookie = `i18next=${lng}; path=/; max-age=31536000; SameSite=Lax`;
        router.refresh(); // ✅ Refreshes to reload data with new locale
    };

    // ... UI code
}
```

### 4.3 Frontend Data Fetching Pattern

**Pattern 1: Client Component with useEffect**

```typescript
'use client';

import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

export default function MyComponent() {
  const { i18n } = useTranslation();
  const [data, setData] = useState([]);
  const currentLang = i18n.language || 'ua';

  useEffect(() => {
    // ✅ Pass locale in headers
    fetch('/api/dishes', {
      headers: {
        'Accept-Language': currentLang,
        'x-lang': currentLang,
      }
    })
      .then(res => res.json())
      .then(data => setData(data));
  }, [currentLang]); // ✅ Re-fetch when language changes

  return (
    <div>
      {data.map(item => (
        <div key={item.id}>{item.name}</div> // ✅ Already localized
      ))}
    </div>
  );
}
```

**Pattern 2: Server Component (if using App Router)**

```typescript
import { cookies } from 'next/headers';

export default async function ServerComponent() {
  const cookieStore = cookies();
  const locale = cookieStore.get('i18next')?.value || 'ua';

  // ✅ Fetch with locale
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dishes`, {
    headers: {
      'Accept-Language': locale,
      'x-lang': locale,
    },
    cache: 'no-store', // ✅ Prevent caching issues
  });

  const data = await res.json();

  return (
    <div>
      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

---

## 🔨 5. Implementation Steps

### Step 1: Fix Hardcoded Strings

**File: `app/components/EstablishmentsSection.tsx`**

```typescript
// ❌ Before
<h2>Establishments:</h2>

// ✅ After
<h2>{t('common.establishments')}:</h2>
```

**Add to `public/locales/ua/translation.json`:**
```json
{
  "common": {
    "establishments": "Заклади"
  }
}
```

**Add to `public/locales/en/translation.json`:**
```json
{
  "common": {
    "establishments": "Establishments"
  }
}
```

### Step 2: Verify Database Translations

```bash
# Run the check script
psql $DATABASE_URL -f check-translations.sql

# Or use Prisma Studio
npx prisma studio
```

### Step 3: Populate Missing Translations

```bash
# Generate Prisma Client first
npx prisma generate

# Run seed script
npx tsx prisma/seed-i18n.ts
```

### Step 4: Test Language Switching

1. Open app in browser
2. Click language switcher (UA/EN)
3. Verify:
   - ✅ All UI text changes
   - ✅ All category names change
   - ✅ All dish names/descriptions change
   - ✅ All restaurant names change

---

## 📊 6. Verification Checklist

### Frontend (Static UI)
- [ ] All hardcoded strings moved to translation files
- [ ] `LocaleSwitcher` works and refreshes data
- [ ] All components use `t()` function
- [ ] Footer is fully localized
- [ ] Headers are fully localized
- [ ] Buttons are fully localized

### Backend (Dynamic Data)
- [ ] All API routes use `getLocaleFromRequest`
- [ ] All API routes use `localizeEntities`
- [ ] API returns correct language based on headers
- [ ] Database has translations for all categories
- [ ] Database has translations for all dishes
- [ ] Database has translations for all restaurants

### Integration
- [ ] Language change triggers data re-fetch
- [ ] No mixed languages visible
- [ ] Fallback to Ukrainian works when English missing
- [ ] SEO headers (`Content-Language`) are set correctly

---

## 🚀 7. Quick Fixes for Current Issues

### Fix 1: "Establishments:" Hardcoded

```typescript
// app/components/EstablishmentsSection.tsx
<h2 className="...">
  {t('common.establishments')}:
</h2>
```

### Fix 2: "Breadcrumb" Hardcoded

```typescript
// Replace in all files
{t('footer.breadcrumb_title')}
```

### Fix 3: Verify "Address missing"

```typescript
// app/components/RestaurantCard.tsx
{restaurant.address || t('menu.address_missing')}
```

---

## 📝 8. Translation File Structure

**Recommended structure:**

```json
{
  "common": {
    "establishments": "Заклади",
    "view_all": "Переглянути всі",
    "loading": "Завантаження...",
    "error": "Помилка"
  },
  "menu": {
    "calories_label": "Калорійність",
    "address_missing": "Адреса відсутня",
    "allergens_label": "Алергени"
  },
  "footer": {
    "breadcrumb_title": "Breadcrumb",
    "contacts_title": "Контакти"
  }
}
```

---

## ✅ Summary

**Current Status:**
- ✅ Database schema supports i18n
- ✅ API routes handle localization
- ✅ Frontend uses react-i18next
- ✅ LocaleSwitcher implemented
- ⚠️ Some hardcoded strings need fixing
- ⚠️ Database translations may be missing

**Next Steps:**
1. Fix hardcoded "Establishments" string
2. Run `check-translations.sql` to find missing DB translations
3. Use `seed-i18n.ts` to populate missing translations
4. Test complete language switching flow

**Expected Result:**
When user selects Ukrainian → Everything is Ukrainian
When user selects English → Everything is English

