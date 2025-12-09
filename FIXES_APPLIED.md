# Виправлення помилок i18n

## ✅ Виправлені проблеми

### 1. Module not found: '@/hooks/useLocale'
**Проблема:** TypeScript не знав про path alias `@/hooks/*`

**Рішення:** Додано в `tsconfig.json`:
```json
"@/hooks/*": ["hooks/*"]
```

### 2. TypeError: Cannot read properties of undefined (reading 'startsWith')
**Проблема:** `currentLang` міг бути `undefined` при першому рендері

**Рішення:** Додано fallback в `LocaleSwitcher.js`:
```javascript
const currentLang = i18n?.language || 'ua';
const isActive = currentLang && currentLang.startsWith(lang.code);
```

### 3. Міграція не може застосуватись
**Проблема:** Міграція `20250120000000_add_multilang_fields` вже застосована, але Prisma намагається застосувати її до shadow database

**Рішення:** Виконайте одну з команд:

```bash
# Варіант 1: Позначити міграцію як застосовану
npx prisma migrate resolve --applied 20250120000000_add_multilang_fields

# Варіант 2: Використати db push (якщо не потрібна історія міграцій)
npx prisma db push

# Варіант 3: Якщо міграція вже застосована, просто згенерувати Prisma Client
npx prisma generate
```

## 📝 Зміни в файлах

1. **tsconfig.json** - додано path для hooks
2. **app/components/LocaleSwitcher.js** - виправлено обробку undefined

## 🚀 Наступні кроки

1. Перезапустіть dev server: `npm run dev`
2. Перевірте чи працює перемикач мови
3. Якщо міграція все ще викликає проблеми, використайте `npx prisma db push`

