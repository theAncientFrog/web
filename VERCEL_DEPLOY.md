# Інструкція для деплою на Vercel

## ✅ Виправлення для Vercel

### 1. Suspense Boundaries
- ✅ `app/verify-email/page.tsx` - обгорнуто в Suspense
- ✅ `app/menu-secondary/[id]/page.js` - обгорнуто в Suspense

### 2. Dynamic Routes
- ✅ Додано `export const dynamic = 'force-dynamic'` до всіх API роутів, які використовують сесії або БД

### 3. Prisma Configuration
- ✅ `DIRECT_URL` зроблено опціональним (може бути таким самим як `DATABASE_URL` або не встановлюватись)

### 4. Window/Document Checks
- ✅ Додано перевірки `typeof window !== 'undefined'` для клієнтського коду

## Необхідні змінні оточення в Vercel

Додайте наступні змінні оточення в налаштуваннях проекту на Vercel (Settings → Environment Variables):

### Обов'язкові:
- `DATABASE_URL` - URL підключення до PostgreSQL бази даних
- `NEXTAUTH_URL` - URL вашого сайту (наприклад: `https://your-project.vercel.app`)
- `NEXTAUTH_SECRET` - Секретний ключ для NextAuth (згенеруйте через `openssl rand -base64 32`)

### Для автентифікації Google:
- `GOOGLE_CLIENT_ID` - Client ID з Google Cloud Console
- `GOOGLE_CLIENT_SECRET` - Client Secret з Google Cloud Console

### Для Pusher (опціонально):
- `PUSHER_APP_ID` - App ID з Pusher
- `PUSHER_KEY` - Key з Pusher
- `PUSHER_SECRET` - Secret з Pusher
- `PUSHER_CLUSTER` - Cluster з Pusher (наприклад: `eu`)
- `NEXT_PUBLIC_PUSHER_KEY` - Публічний ключ Pusher
- `NEXT_PUBLIC_PUSHER_CLUSTER` - Публічний cluster Pusher

### Для email (Resend):
- `RESEND_API_KEY` - API ключ з Resend
- `FROM_EMAIL` - Email адреса відправника (опціонально, за замовчуванням `onboarding@resend.dev`)

### Для оплати Monobank (опціонально):
- `MONOBANK_API_KEY` - API ключ з Monobank

### Для Prisma (опціонально):
- `DIRECT_URL` - Пряме підключення до БД для міграцій (може бути таким самим як DATABASE_URL)

## Важливо:

1. **DIRECT_URL** - на Vercel може бути таким самим як DATABASE_URL, або можна не встановлювати взагалі
2. **NEXTAUTH_URL** - має відповідати вашому домену на Vercel
3. Після додавання змінних оточення перезапустіть деплой

## Після деплою:

1. Застосуйте міграції до бази даних:
   ```bash
   npx prisma migrate deploy
   ```
   Або використайте Prisma Studio на Vercel через CLI

2. Перевірте, що всі API роути працюють правильно

3. Перевірте автентифікацію та сесії

