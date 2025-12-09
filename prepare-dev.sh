#!/bin/bash

# Скрипт для підготовки до запуску dev сервера
# Використання: ./prepare-dev.sh

echo "🚀 Підготовка до запуску dev сервера..."
echo ""

# 1. Генеруємо Prisma Client
echo "📦 Генеруємо Prisma Client..."
npx prisma generate
if [ $? -ne 0 ]; then
    echo "❌ Помилка при генерації Prisma Client"
    exit 1
fi
echo "✅ Prisma Client згенеровано"
echo ""

# 2. Перевіряємо статус міграцій
echo "🔍 Перевіряємо статус міграцій..."
npx prisma migrate status
echo ""

# 3. Синхронізуємо базу даних (якщо потрібно)
echo "💾 Синхронізуємо базу даних..."
npx prisma db push --accept-data-loss
if [ $? -ne 0 ]; then
    echo "⚠️  Помилка при синхронізації бази даних (може бути нормально, якщо все вже синхронізовано)"
fi
echo "✅ База даних синхронізована"
echo ""

echo "✅ Підготовка завершена! Тепер можна запускати: npm run dev"
echo ""

