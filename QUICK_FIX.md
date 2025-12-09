# ⚡ Швидке виправлення міграцій

## Проблема:
База даних не синхронізована з локальними міграціями, але сама база вже має всі необхідні поля (через `prisma db push`).

## Рішення (виберіть один варіант):

### Варіант 1: Автоматичний скрипт (рекомендовано) ⚡

```bash
./fix-migrations.sh
```

Скрипт автоматично позначить всі міграції як застосовані.

### Варіант 2: Вручну (якщо скрипт не працює)

```bash
# 1. Позначте міграцію з бази даних
npx prisma migrate resolve --applied 20251209154649_init

# 2. Позначте всі інші міграції (скопіюйте та виконайте всі рядки)
npx prisma migrate resolve --applied 20250101000000_add_tables_and_table_number
npx prisma migrate resolve --applied 20250115000000_add_allergens_to_dish
npx prisma migrate resolve --applied 20250116000000_add_comments_table
npx prisma migrate resolve --applied 20250116000001_add_order_status_enum
npx prisma migrate resolve --applied 20250116000002_add_price_at_purchase
npx prisma migrate resolve --applied 20250117000000_add_table_status_and_reservations
npx prisma migrate resolve --applied 20251022075008_init
npx prisma migrate resolve --applied 20251025152658_data
npx prisma migrate resolve --applied 20251025160912_data
npx prisma migrate resolve --applied 20251027125439_add_order_status
npx prisma migrate resolve --applied 20251027142611_add_order_item_model_for_details
npx prisma migrate resolve --applied 20251027164243_add_logo_and_banner_to_restaurant
npx prisma migrate resolve --applied 20251027172926_add_address_and_update_restaurant
npx prisma migrate resolve --applied 20251027182551_final_schema_update
npx prisma migrate resolve --applied 20251109022917_add_achievements
npx prisma migrate resolve --applied 20251109024808_add_email_verification_code
npx prisma migrate resolve --applied 20251109032243_update_achievements_with_rules
npx prisma migrate resolve --applied 20251109033542_add_loyalty_system
npx prisma migrate resolve --applied 20251110000000_add_tables_and_table_number
npx prisma migrate resolve --applied 20250120000000_add_multilang_fields
npx prisma migrate resolve --applied 20251209211215_add_restaurant_i18n_fields
npx prisma migrate resolve --applied 20251209211220_add_i18n_indexes
npx prisma migrate resolve --applied 20251209211225_add_user_id_to_reservations
```

### Перевірка:

Після виконання перевірте:

```bash
npx prisma migrate status
```

Має показати: **"Database schema is up to date!"**

---

## Що було виправлено:

1. ✅ Перейменовано `add_i18n_indexes` → `20251209211220_add_i18n_indexes`
2. ✅ Перейменовано `add_user_id_to_reservations` → `20251209211225_add_user_id_to_reservations`
3. ✅ Видалено дублікати міграцій
4. ✅ Створено скрипт для автоматичного виправлення

---

**Примітка:** Це безпечна операція, оскільки база даних вже має всі необхідні зміни. Ми просто синхронізуємо історію міграцій.

