#!/bin/bash

# Скрипт для підготовки до запуску dev сервера
# Використання: ./prepare-dev.sh

set -e  # Зупиняє виконання при помилці

echo "🚀 Підготовка до запуску dev сервера..."
echo ""

# Перевірка наявності необхідних команд
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не встановлено. Будь ласка, встановіть Node.js."
    exit 1
fi

if ! command -v npx &> /dev/null; then
    echo "❌ npx не встановлено. Будь ласка, встановіть npm."
    exit 1
fi

# Перевірка наявності package.json
if [ ! -f "package.json" ]; then
    echo "❌ Файл package.json не знайдено. Переконайтеся, що ви знаходитесь в корені проекту."
    exit 1
fi

# Перевірка наявності schema.prisma
if [ ! -f "prisma/schema.prisma" ]; then
    echo "❌ Файл prisma/schema.prisma не знайдено."
    exit 1
fi

# 1. Генеруємо Prisma Client
echo "📦 Генеруємо Prisma Client..."
if npx prisma generate; then
    echo "✅ Prisma Client згенеровано"
else
    echo "❌ Помилка при генерації Prisma Client"
    exit 1
fi
echo ""

# 2. Перевіряємо статус міграцій
echo "🔍 Перевіряємо статус міграцій..."
npx prisma migrate status || echo "⚠️  Міграції можуть бути не застосовані"
echo ""

# 3. Синхронізуємо базу даних (якщо потрібно)
echo "💾 Синхронізуємо базу даних..."
if npx prisma db push --accept-data-loss; then
    echo "✅ База даних синхронізована"
else
    echo "⚠️  Помилка при синхронізації бази даних (може бути нормально, якщо все вже синхронізовано)"
fi
echo ""

# 4. Перевіряємо залежності (опціонально)
if [ -f "package-lock.json" ] || [ -f "yarn.lock" ]; then
    echo "📦 Перевіряємо залежності..."
    if [ -f "package-lock.json" ]; then
        npm ci --silent || echo "⚠️  Можливо, потрібно встановити залежності: npm install"
    elif [ -f "yarn.lock" ]; then
        yarn install --silent || echo "⚠️  Можливо, потрібно встановити залежності: yarn install"
    fi
    echo ""
fi

echo "✅ Підготовка завершена! Тепер можна запускати: npm run dev"
echo ""
