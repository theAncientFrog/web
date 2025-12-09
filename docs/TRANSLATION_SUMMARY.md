# Complete English Translation Summary

## Overview

This document provides a complete summary of all English translations for the bilingual restaurant menu application. All translations use proper culinary English terminology suitable for premium European restaurants.

## Files Created/Updated

1. **`lib/en-translations.ts`** - Complete translation dictionary with:
   - Dish name translations (100+ dishes)
   - Category name translations
   - Allergen translations
   - Helper functions

2. **`prisma/seed-i18n.ts`** - Updated seed script to use translations

3. **`public/locales/en/translation.json`** - Updated UI text translations

## Translation Standards

### Terminology Standards

| Ukrainian | English | Notes |
|-----------|---------|-------|
| Ккал | kcal | lowercase |
| Молочні продукти | Dairy | Short form |
| Глютен | Gluten | Standard |
| Яйця | Eggs | Plural |
| Риба | Fish | Singular |
| Морепродукти | Seafood | Standard |
| Соя | Soy | Standard |
| Горіхи | Nuts | Standard |

### Category Translation Standards

| UA | EN |
|----|----|
| Їжа | Food |
| Напої | Beverages |
| Алкоголь | Alcoholic Beverages |
| Мерч | Merchandise |
| Гарячі страви / Основні страви | Main Courses |
| Супи | Soups |
| Салати | Salads |
| Десерти | Desserts |
| Кава | Coffee |
| Чай | Tea |
| Безалкогольні напої | Soft Drinks |

## Key Translation Principles

### 1. Culinary Accuracy
- "Фуа-гра з трюфелями" → "Foie Gras with Black Truffle" (not literal translation)
- "Теляча вирізка Велінгтон" → "Beef Wellington" (traditional name)
- "Чорна тріска" → "Sablefish" (correct English name)

### 2. Natural English Order
- "Салат з телятиною та руколою" → "Veal and Arugula Salad"
- "Вареники з картоплею та грибами" → "Potato and Mushroom Varenyky"

### 3. Professional Terminology
- "Наполеон" → "Mille-Feuille" (more accurate French term)
- "Шоколадний фондан" → "Chocolate Lava Cake" (common English term)
- "Мохіто б/а" → "Virgin Mojito" (standard term)

### 4. Capitalization Rules
- Dish names: Title Case
- Category names: Title Case
- Button labels: Title Case
- Allergens: Capitalized

## Restaurant-Specific Translations

### Nazva Restaurant (Casual)
- Ukrainian comfort food
- Standard international dishes
- Focus on clarity and accessibility

### BaboGarden (Premium)
- Fine dining terminology
- Premium ingredients emphasized
- Formal descriptions

### Pstrug (Fish Restaurant)
- Seafood-focused terminology
- Wine pairings
- Craft beer descriptions

### Sicily Courtyard (Italian)
- Italian cuisine terms
- Breakfast items
- Cocktail bar terminology

### Cheese Bakery
- Bakery terminology
- Breakfast combos
- Specialty coffee

## Usage Instructions

### To Apply Translations to Database

1. Ensure Prisma Client is generated:
```bash
npx prisma generate
```

2. Run the seed script:
```bash
npx tsx prisma/seed-i18n.ts
```

This will:
- Find all dishes without English translations
- Apply translations from `lib/en-translations.ts`
- Update categories with English names/descriptions
- Translate allergens from Ukrainian to English

### Manual Updates

If you need to add new dishes:

1. Add Ukrainian name to `prisma/seed.js`
2. Add English translation to `lib/en-translations.ts` in `dishTranslations` object
3. Add category translation if needed to `categoryTranslations` object
4. Run seed script

## Quality Checklist

✅ All dish names use proper culinary English
✅ Descriptions are natural and professional
✅ Allergens use standard English terms
✅ Category names are consistent
✅ UI text follows title case where appropriate
✅ No literal translations (all contextual)
✅ Premium restaurant tone maintained
✅ Technical terms (e.g., wine names) preserved

## Notes

- Some dish names preserve original (e.g., "Varenyky", "Solyanka", "Olivier Salad") as they are internationally recognized
- Wine names (e.g., "Château Lafite Rothschild") are kept in original form
- Cocktail names follow international standards
- "Sugar" (Цукор) is filtered out from allergens as it's not a true allergen

## Next Steps

1. Review translations in application
2. Test language switching functionality
3. Verify all dishes display correctly in English
4. Check allergen display
5. Ensure consistency across all restaurants

