# ✅ Чеклист перед запуском `npm run dev`

## 🚀 Швидкий варіант (рекомендовано):

```bash
# Використайте готовий скрипт
./prepare-dev.sh

# Або вручну (3 кроки):
npx prisma generate
npx prisma db push
npm run dev
```

---

## 📋 Детальні кроки:

### 1. Згенерувати Prisma Client (ОБОВ'ЯЗКОВО!)
```bash
npx prisma generate
```
**Навіщо:** 
- Після змін у `schema.prisma` потрібно оновити Prisma Client
- TypeScript має знати про поля i18n (`nameEn`, `descriptionEn`, `allergensEn`)
- **Примітка:** `postinstall` скрипт автоматично виконує це після `npm install`, але краще перевірити

### 2. Синхронізувати базу даних (якщо потрібно)
```bash
npx prisma db push
```
**Навіщо:** 
- Синхронізує схему БД з `schema.prisma`
- Додає нові поля, якщо їх немає
- **Примітка:** Використовуйте `--accept-data-loss` тільки якщо впевнені

### 3. Перевірити міграції (опціонально)
```bash
npx prisma migrate status
```
**Навіщо:** Переконатися, що всі міграції застосовані до бази даних.

### 4. Запустити dev сервер
```bash
npm run dev
```

---

## ⚠️ Важливо:

- Якщо ви бачите помилки типу `Property 'nameEn' does not exist on type...` - це означає, що Prisma Client не згенерований. Виконайте крок 1.

- Якщо база даних не синхронізована зі схемою, виконайте крок 3.

- Після змін у `schema.prisma` завжди виконуйте `npx prisma generate` перед запуском сервера.

---

## 🚀 Швидкий старт (все в одному):

```bash
# 1. Згенерувати Prisma Client
npx prisma generate

# 2. Синхронізувати базу даних (якщо потрібно)
npx prisma db push

# 3. Запустити dev сервер
npm run dev
```

---

## 📝 Останні зміни (i18n Implementation):

1. ✅ **Database Schema**: Підтримка `nameEn`, `descriptionEn`, `allergensEn` для всіх моделей
2. ✅ **API Routes**: Всі API використовують `getLocaleFromRequest` та `localizeEntities`
3. ✅ **Frontend Components**: 
   - `EstablishmentsSection` - виправлено hardcoded "Establishments"
   - `RestaurantCard` - виправлено hardcoded "Address missing"
   - Всі компоненти використовують `t()` для локалізації
4. ✅ **Translation Files**: Додано всі відсутні ключі в `ua.json` та `en.json`
5. ✅ **Locale Detection**: Працює через headers, query params, cookies

---

## ⚠️ Якщо виникають помилки:

### Помилка: `Property 'nameEn' does not exist on type...`
**Рішення:** Виконайте `npx prisma generate`

### Помилка: `The underlying table for model X does not exist`
**Рішення:** Виконайте `npx prisma db push`

### Помилка: `Cannot find module '@/lib/i18n-helpers'`
**Рішення:** Перевірте, що файл `lib/i18n-helpers.ts` існує

### Помилка: `Translation key 'common.establishments' not found`
**Рішення:** Перевірте, що файли `public/locales/ua/translation.json` та `public/locales/en/translation.json` містять ключ

---

## 🔍 Перевірка після запуску:

1. ✅ Відкрийте `http://localhost:3000`
2. ✅ Перевірте, що `LocaleSwitcher` працює
3. ✅ Перемкніть мову (UA ↔ EN)
4. ✅ Переконайтеся, що:
   - Всі UI тексти змінюються
   - Назви категорій змінюються
   - Назви страв змінюються
   - Назви ресторанів змінюються
   - Немає змішування мов

