# 🔧 Виправлення проблеми з міграціями

## Проблема:
- База даних має міграцію `20251209154649_init`, якої немає локально
- Всі локальні міграції не застосовані в базі
- Є міграції без timestamp (неправильний формат)

## Рішення:

Оскільки база даних вже синхронізована через `prisma db push`, найпростіше створити **baseline** міграцію.

### Варіант 1: Створити baseline (рекомендовано)

```bash
# 1. Створіть baseline міграцію, яка відповідає поточному стану бази
npx prisma migrate resolve --applied 20251209154649_init

# 2. Позначте всі інші міграції як застосовані
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
```

### Варіант 2: Видалити неправильні міграції та перейменувати

Міграції без timestamp потрібно перейменувати або видалити:
- `add_i18n_indexes` - перейменувати на timestamp
- `add_multilang_fields` - вже є `20250120000000_add_multilang_fields`
- `add_restaurant_i18n_fields` - вже є `20251209211215_add_restaurant_i18n_fields`
- `add_user_id_to_reservations` - перейменувати на timestamp

### Варіант 3: Використати скрипт (найшвидше)

Я створю скрипт для автоматичного виправлення.

