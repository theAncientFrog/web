/**
 * Complete English Translation Dictionary for Restaurant Menu
 * 
 * Professional restaurant-grade translations with proper culinary terminology
 */

export const dishTranslations: Record<string, { 
  nameEn: string; 
  descriptionEn?: string;
  allergensEn?: string;
}> = {
  // ===== NAZVA RESTAURANT (Casual) =====
  
  // Hot Dishes / Гарячі страви
  'Котлета по-київськи': {
    nameEn: 'Chicken Kiev',
    descriptionEn: '200g, served with mashed potatoes',
    allergensEn: 'Gluten, Eggs, Dairy'
  },
  'Вареники з картоплею та грибами': {
    nameEn: 'Potato and Mushroom Varenyky',
    descriptionEn: '250g, with cracklings and sour cream',
    allergensEn: 'Gluten, Dairy'
  },
  'Деруни з м\'ясом': {
    nameEn: 'Potato Pancakes with Meat',
    descriptionEn: '280g, served with sour cream',
    allergensEn: 'Dairy'
  },
  'Стейк Рібай': {
    nameEn: 'Ribeye Steak',
    descriptionEn: '300g, with grilled vegetables',
    allergensEn: null
  },
  'Лосось на грилі': {
    nameEn: 'Grilled Salmon',
    descriptionEn: '180g, with rice and teriyaki sauce',
    allergensEn: 'Fish, Soy'
  },
  'Паста Карбонара': {
    nameEn: 'Spaghetti Carbonara',
    descriptionEn: '350g',
    allergensEn: 'Gluten, Eggs, Dairy'
  },

  // Soups / Супи
  'Борщ Український': {
    nameEn: 'Ukrainian Borscht',
    descriptionEn: '350ml, with sour cream, garlic bread, and garlic',
    allergensEn: 'Dairy, Gluten'
  },
  'Солянка м\'ясна': {
    nameEn: 'Meat Solyanka',
    descriptionEn: '350ml',
    allergensEn: 'Dairy'
  },
  'Грибний крем-суп': {
    nameEn: 'Cream of Mushroom Soup',
    descriptionEn: '300ml, with croutons',
    allergensEn: 'Gluten, Dairy'
  },

  // Salads / Салати
  'Салат Цезар з куркою': {
    nameEn: 'Chicken Caesar Salad',
    descriptionEn: '250g',
    allergensEn: 'Eggs, Dairy'
  },
  'Грецький салат': {
    nameEn: 'Greek Salad',
    descriptionEn: '300g',
    allergensEn: 'Dairy'
  },
  'Салат з телятиною та руколою': {
    nameEn: 'Veal and Arugula Salad',
    descriptionEn: '220g',
    allergensEn: null
  },
  'Салат Олів\'є': {
    nameEn: 'Olivier Salad',
    descriptionEn: '250g',
    allergensEn: 'Eggs, Dairy'
  },

  // Desserts / Десерти
  'Наполеон': {
    nameEn: 'Mille-Feuille',
    descriptionEn: '150g',
    allergensEn: 'Gluten, Eggs, Dairy'
  },
  'Чізкейк Нью-Йорк': {
    nameEn: 'New York Cheesecake',
    descriptionEn: '140g',
    allergensEn: 'Eggs, Dairy, Gluten'
  },
  'Шоколадний фондан': {
    nameEn: 'Chocolate Lava Cake',
    descriptionEn: '120g, with ice cream scoop',
    allergensEn: 'Gluten, Eggs, Dairy'
  },
  'Тирамісу': {
    nameEn: 'Tiramisu',
    descriptionEn: '130g',
    allergensEn: 'Eggs, Dairy, Gluten'
  },

  // Coffee / Кава
  'Кава "По домашньому"': {
    nameEn: 'House Blend Coffee',
    descriptionEn: 'Special recipe',
    allergensEn: 'Dairy'
  },
  'Еспресо': {
    nameEn: 'Espresso',
    descriptionEn: '30ml',
    allergensEn: null
  },
  'Американо': {
    nameEn: 'Americano',
    descriptionEn: '150ml',
    allergensEn: null
  },
  'Капучино': {
    nameEn: 'Cappuccino',
    descriptionEn: '200ml',
    allergensEn: 'Dairy'
  },
  'Лате': {
    nameEn: 'Caffè Latte',
    descriptionEn: '250ml',
    allergensEn: 'Dairy'
  },

  // Tea / Чай
  'Чай чорний': {
    nameEn: 'Black Tea',
    descriptionEn: '400ml',
    allergensEn: null
  },
  'Чай зелений': {
    nameEn: 'Green Tea',
    descriptionEn: '400ml',
    allergensEn: null
  },
  'Чай фруктовий': {
    nameEn: 'Fruit Tea',
    descriptionEn: '400ml',
    allergensEn: null
  },

  // Soft Drinks / Безалкогольні напої
  'Лимонад класичний': {
    nameEn: 'Classic Lemonade',
    descriptionEn: '300ml',
    allergensEn: null
  },
  'Мохіто б/а': {
    nameEn: 'Virgin Mojito',
    descriptionEn: '350ml',
    allergensEn: null
  },
  'Сік апельсиновий фреш': {
    nameEn: 'Fresh Orange Juice',
    descriptionEn: '250ml',
    allergensEn: null
  },
  'Coca-Cola': {
    nameEn: 'Coca-Cola',
    descriptionEn: '330ml',
    allergensEn: null
  },

  // Alcoholic Drinks / Алкогольні напої
  'Пиво світле "NAZVA"': {
    nameEn: 'NAZVA Light Beer',
    descriptionEn: '0.5L',
    allergensEn: 'Gluten'
  },
  'Вино червоне сухе': {
    nameEn: 'Dry Red Wine',
    descriptionEn: '150ml',
    allergensEn: null
  },
  'Коктейль "Мохіто"': {
    nameEn: 'Mojito',
    descriptionEn: '300ml',
    allergensEn: null
  },

  // Merchandise / Мерч
  'Футболка NAZVA': {
    nameEn: 'NAZVA T-Shirt',
    descriptionEn: 'Cotton t-shirt with logo',
    allergensEn: null
  },
  'Кружка NAZVA': {
    nameEn: 'NAZVA Mug',
    descriptionEn: 'Ceramic mug with design',
    allergensEn: null
  },

  // ===== BABO GARDEN (Premium) =====

  // Main Courses / Основні страви
  'Фуа-гра з трюфелями': {
    nameEn: 'Foie Gras with Black Truffle',
    descriptionEn: 'Goose liver with black truffle, 150g',
    allergensEn: null
  },
  'Теляча вирізка Велінгтон': {
    nameEn: 'Beef Wellington',
    descriptionEn: 'With mushrooms and spinach, 200g',
    allergensEn: 'Gluten, Eggs, Dairy'
  },
  'Чорна тріска з морепродуктами': {
    nameEn: 'Sablefish with Seafood',
    descriptionEn: 'With langoustines and caviar, 180g',
    allergensEn: 'Fish, Seafood'
  },
  'Ягняча корейка': {
    nameEn: 'Rack of Lamb',
    descriptionEn: 'With grilled vegetables and mint sauce, 220g',
    allergensEn: null
  },
  'Бургер з вагю': {
    nameEn: 'Wagyu Beef Burger',
    descriptionEn: 'Premium beef, black truffle, 280g',
    allergensEn: 'Gluten, Eggs'
  },

  // Premium Salads / Салати
  'Салат з молодими паростками': {
    nameEn: 'Young Sprouts Salad',
    descriptionEn: 'With honey, nuts, and ricotta cheese, 180g',
    allergensEn: 'Nuts, Dairy'
  },
  'Цезар з телятиною': {
    nameEn: 'Veal Caesar Salad',
    descriptionEn: 'Marinated veal, parmesan, 220g',
    allergensEn: 'Eggs, Dairy'
  },
  'Грецький салат з авокадо': {
    nameEn: 'Greek Salad with Avocado',
    descriptionEn: 'Organic vegetables, feta, 250g',
    allergensEn: 'Dairy'
  },

  // Premium Desserts / Десерти
  'Шоколадний фондан з лавою': {
    nameEn: 'Chocolate Lava Cake',
    descriptionEn: '70% cocoa, raspberry, ice cream scoop',
    allergensEn: 'Gluten, Eggs, Dairy'
  },
  'Крем-брюле ванільний': {
    nameEn: 'Vanilla Crème Brûlée',
    descriptionEn: 'With seasonal berries',
    allergensEn: 'Eggs, Dairy'
  },
  'Панна котта з чорницею': {
    nameEn: 'Panna Cotta with Blueberries',
    descriptionEn: 'Italian dessert with berry sauce',
    allergensEn: 'Dairy'
  },

  // Premium Wines / Вина
  'Chateau Lafite Rothschild 2009': {
    nameEn: 'Château Lafite Rothschild 2009',
    descriptionEn: 'France, Bordeaux, 150ml',
    allergensEn: null
  },
  'Opus One 2018': {
    nameEn: 'Opus One 2018',
    descriptionEn: 'USA, California, Cabernet Sauvignon, 150ml',
    allergensEn: null
  },
  'Dom Perignon 2012': {
    nameEn: 'Dom Pérignon 2012',
    descriptionEn: 'France, Champagne, 150ml',
    allergensEn: null
  },

  // Premium Cocktails / Коктейлі
  'Old Fashioned': {
    nameEn: 'Old Fashioned',
    descriptionEn: 'Bourbon, sugar, Angostura, 200ml',
    allergensEn: null
  },
  'Negroni': {
    nameEn: 'Negroni',
    descriptionEn: 'Gin, vermouth, Campari, 180ml',
    allergensEn: null
  },
  'French 75': {
    nameEn: 'French 75',
    descriptionEn: 'Gin, lemon, sugar, champagne, 200ml',
    allergensEn: null
  },

  // Whiskey / Віскі
  'Macallan 18yo': {
    nameEn: 'The Macallan 18 Year Old',
    descriptionEn: 'Scotland, Speyside, 50ml',
    allergensEn: null
  },
  'Glenfiddich 21yo': {
    nameEn: 'Glenfiddich 21 Year Old',
    descriptionEn: 'Scotland, Speyside, 50ml',
    allergensEn: null
  },

  // ===== PSTRUG (Fish Restaurant) =====

  // Fish & Seafood / Риба та морепродукти
  'Стейк форелі на грилі': {
    nameEn: 'Grilled Trout Steak',
    descriptionEn: '220g, with vegetables and lemon',
    allergensEn: 'Fish'
  },
  'Форель запечена': {
    nameEn: 'Baked Trout',
    descriptionEn: '250g, with herbs and butter',
    allergensEn: 'Fish, Dairy'
  },
  'Форель копчена': {
    nameEn: 'Smoked Trout',
    descriptionEn: '180g, cold-smoked',
    allergensEn: 'Fish'
  },
  'Форель в клярі': {
    nameEn: 'Battered Trout',
    descriptionEn: '200g, with tartar sauce',
    allergensEn: 'Fish, Gluten, Eggs'
  },
  'Креветки на грилі': {
    nameEn: 'Grilled Shrimp',
    descriptionEn: '300g, with garlic and butter',
    allergensEn: 'Seafood, Dairy'
  },
  'Мідії в вині': {
    nameEn: 'Mussels in Wine',
    descriptionEn: '400g, white wine, garlic',
    allergensEn: 'Seafood'
  },
  'Дорадо на грилі': {
    nameEn: 'Grilled Sea Bream',
    descriptionEn: '280g, with vegetables',
    allergensEn: 'Fish'
  },

  // Baguettes / Багети та намазки
  'Багет з лососем': {
    nameEn: 'Salmon Baguette',
    descriptionEn: '180g, cream cheese, red caviar',
    allergensEn: 'Gluten, Fish, Dairy'
  },
  'Багет з авокадо': {
    nameEn: 'Avocado Baguette',
    descriptionEn: '170g, prosciutto, arugula',
    allergensEn: 'Gluten'
  },
  'Багет з паштетом': {
    nameEn: 'Pâté Baguette',
    descriptionEn: '175g, liver pâté, onion',
    allergensEn: 'Gluten'
  },
  'Багет з сиром': {
    nameEn: 'Cheese Baguette',
    descriptionEn: '165g, camembert, honey, nuts',
    allergensEn: 'Gluten, Dairy, Nuts'
  },

  // Wines / Вино
  'Шардоне біле сухе': {
    nameEn: 'Dry White Chardonnay',
    descriptionEn: '150ml, France',
    allergensEn: null
  },
  'Мерло червоне сухе': {
    nameEn: 'Dry Red Merlot',
    descriptionEn: '150ml, Italy',
    allergensEn: null
  },
  'Рислінг напівсолодкий': {
    nameEn: 'Off-Dry Riesling',
    descriptionEn: '150ml, Germany',
    allergensEn: null
  },

  // Craft Beer / Крафтове пиво
  'IPA "Рибальський ель"': {
    nameEn: 'Fisherman\'s IPA',
    descriptionEn: '0.5L, bitter hops',
    allergensEn: 'Gluten'
  },
  'Stout "Чорна риба"': {
    nameEn: 'Black Fish Stout',
    descriptionEn: '0.5L, chocolate notes',
    allergensEn: 'Gluten'
  },
  'Wheat "Біла хвиля"': {
    nameEn: 'White Wave Wheat Beer',
    descriptionEn: '0.5L, wheat beer',
    allergensEn: 'Gluten'
  },

  // ===== SICILY COURTYARD (Italian Restaurant) =====

  // Breakfasts / Континентальні сніданки
  'Сніданок італійський': {
    nameEn: 'Italian Breakfast',
    descriptionEn: 'Cappuccino, croissant, fruits, yogurt',
    allergensEn: 'Dairy, Gluten'
  },
  'Сніданок американський': {
    nameEn: 'American Breakfast',
    descriptionEn: 'Coffee, bacon, eggs, toast',
    allergensEn: 'Eggs, Gluten'
  },
  'Сніданок вегетаріанський': {
    nameEn: 'Vegetarian Breakfast',
    descriptionEn: 'Fresh juice, granola, fruits, yogurt',
    allergensEn: 'Gluten, Dairy'
  },

  // Egg Dishes / Яєчні страви
  'Яйця Бенедикт': {
    nameEn: 'Eggs Benedict',
    descriptionEn: 'With salmon and hollandaise sauce',
    allergensEn: 'Eggs, Dairy, Fish'
  },
  'Шакшука': {
    nameEn: 'Shakshuka',
    descriptionEn: 'Eggs in tomato sauce with bell peppers',
    allergensEn: 'Eggs'
  },
  'Омлет з овочами': {
    nameEn: 'Vegetable Omelet',
    descriptionEn: 'With seasonal vegetables and cheese',
    allergensEn: 'Eggs, Dairy'
  },

  // Pastry / Випічка
  'Круасан з шоколадом': {
    nameEn: 'Chocolate Croissant',
    descriptionEn: 'Classic French croissant',
    allergensEn: 'Gluten, Dairy'
  },
  'Панна котта': {
    nameEn: 'Panna Cotta',
    descriptionEn: 'Italian dessert with berries',
    allergensEn: 'Dairy'
  },
  'Тірамісу': {
    nameEn: 'Tiramisu',
    descriptionEn: 'Classic Italian dessert',
    allergensEn: 'Eggs, Dairy, Gluten'
  },

  // Main Kitchen / Основна кухня
  'Карбонара': {
    nameEn: 'Spaghetti Carbonara',
    descriptionEn: 'Spaghetti with bacon and egg, 350g',
    allergensEn: 'Gluten, Eggs, Dairy'
  },
  'Болоньєзе': {
    nameEn: 'Spaghetti Bolognese',
    descriptionEn: 'Spaghetti with meat sauce, 380g',
    allergensEn: 'Gluten'
  },
  'Ризотто з морепродуктами': {
    nameEn: 'Seafood Risotto',
    descriptionEn: 'Rice with seafood, 320g',
    allergensEn: 'Seafood, Dairy'
  },
  'Маргарита': {
    nameEn: 'Margherita Pizza',
    descriptionEn: 'Mozzarella, tomatoes, basil, 400g',
    allergensEn: 'Gluten, Dairy'
  },
  'Пепероні': {
    nameEn: 'Pepperoni Pizza',
    descriptionEn: 'Mozzarella, pepperoni, oregano, 420g',
    allergensEn: 'Gluten, Dairy'
  },
  'Чотири сири': {
    nameEn: 'Four Cheese Pizza',
    descriptionEn: 'Mozzarella, gorgonzola, parmesan, fontina, 410g',
    allergensEn: 'Gluten, Dairy'
  },

  // Cocktails / Коктейлі
  'Негроні': {
    nameEn: 'Negroni',
    descriptionEn: 'Gin, vermouth, Campari, 180ml',
    allergensEn: null
  },
  'Мартіні сухий': {
    nameEn: 'Dry Martini',
    descriptionEn: 'Gin, dry vermouth, 150ml',
    allergensEn: null
  },
  'Олд фешн': {
    nameEn: 'Old Fashioned',
    descriptionEn: 'Bourbon, sugar, Angostura, 180ml',
    allergensEn: null
  },
  'Сицилійський сад': {
    nameEn: 'Sicilian Garden',
    descriptionEn: 'Vodka, lemon, mint, sugar, 200ml',
    allergensEn: null
  },
  'Етна спреш': {
    nameEn: 'Etna Spritz',
    descriptionEn: 'Gin, orange juice, ginger, 180ml',
    allergensEn: null
  },
  'Палермська ніч': {
    nameEn: 'Palermo Night',
    descriptionEn: 'Rum, pineapple, coconut, 190ml',
    allergensEn: null
  },

  // ===== CHEESE BAKERY =====

  // Cheesecakes / Сирники
  'Сирники класичні': {
    nameEn: 'Classic Cottage Cheese Pancakes',
    descriptionEn: 'With sour cream and jam, 300g',
    allergensEn: 'Gluten, Eggs, Dairy'
  },
  'Сирники з шоколадом': {
    nameEn: 'Chocolate Cottage Cheese Pancakes',
    descriptionEn: 'With chocolate filling, 280g',
    allergensEn: 'Gluten, Eggs, Dairy'
  },
  'Сирники з ягодами': {
    nameEn: 'Berry Cottage Cheese Pancakes',
    descriptionEn: 'With seasonal berries, 320g',
    allergensEn: 'Gluten, Eggs, Dairy'
  },

  // Pastries / Булочки та хліб
  'Круасан з сиром': {
    nameEn: 'Cheese Croissant',
    descriptionEn: 'With camembert and honey',
    allergensEn: 'Gluten, Dairy'
  },
  'Булочка з корицею': {
    nameEn: 'Cinnamon Roll',
    descriptionEn: 'With glaze, 120g',
    allergensEn: 'Gluten, Dairy'
  },
  'Хліб зерновий': {
    nameEn: 'Multigrain Bread',
    descriptionEn: 'With seeds, 200g',
    allergensEn: 'Gluten'
  },

  // Cakes / Торти та десерти
  'Чізкейк Нью-Йорк': {
    nameEn: 'New York Cheesecake',
    descriptionEn: 'Classic cheesecake, 150g',
    allergensEn: 'Eggs, Dairy, Gluten'
  },
  'Торт "Три шоколаду"': {
    nameEn: 'Triple Chocolate Cake',
    descriptionEn: 'Dark, milk, and white chocolate, 140g',
    allergensEn: 'Gluten, Eggs, Dairy'
  },
  'Маффін з сиром': {
    nameEn: 'Cheese Muffin',
    descriptionEn: 'With cream cheese, 120g',
    allergensEn: 'Gluten, Dairy, Eggs'
  },

  // Breakfast Combos / Комбо сніданки
  'Сніданок "Завтрак чемпіона"': {
    nameEn: 'Champion Breakfast',
    descriptionEn: 'Omelet, toast, coffee, fruits',
    allergensEn: 'Eggs, Gluten, Dairy'
  },
  'Сніданок "Сирний рай"': {
    nameEn: 'Cheese Paradise Breakfast',
    descriptionEn: 'Cottage cheese pancakes, yogurt, croissant, tea',
    allergensEn: 'Gluten, Eggs, Dairy'
  },
  'Сніданок "Енергія"': {
    nameEn: 'Energy Breakfast',
    descriptionEn: 'Granola, smoothie, avocado toast',
    allergensEn: 'Gluten, Dairy'
  },

  // Individual Breakfast Dishes / Окремі страви
  'Овсянка з ягодами': {
    nameEn: 'Berry Oatmeal',
    descriptionEn: 'With nuts and honey, 300g',
    allergensEn: 'Dairy, Nuts'
  },
  'Йогурт з гранолою': {
    nameEn: 'Yogurt with Granola',
    descriptionEn: 'Greek yogurt with toppings, 250g',
    allergensEn: 'Dairy, Gluten'
  },
  'Тост з авокадо': {
    nameEn: 'Avocado Toast',
    descriptionEn: 'On multigrain bread, 180g',
    allergensEn: 'Gluten'
  },

  // Special Coffee / Спеціальна кава
  'Лате з лавандою': {
    nameEn: 'Lavender Latte',
    descriptionEn: 'Espresso, lavender syrup, milk, 350ml',
    allergensEn: 'Dairy'
  },
  'Матча лате': {
    nameEn: 'Matcha Latte',
    descriptionEn: 'Japanese green tea, milk, 330ml',
    allergensEn: 'Dairy'
  },
  'Кава по-ірландськи': {
    nameEn: 'Irish Coffee',
    descriptionEn: 'Espresso, whiskey, cream, 200ml',
    allergensEn: 'Dairy'
  },

  // Classic Coffee / Класична кава (already covered above)
  // Tea / Чай (already covered above)

  // Other Drinks / Чай та інші напої
  'Чай з лимоном': {
    nameEn: 'Lemon Tea',
    descriptionEn: '400ml',
    allergensEn: null
  },
  'Гарячий шоколад': {
    nameEn: 'Hot Chocolate',
    descriptionEn: '300ml',
    allergensEn: 'Dairy'
  },
};

export const categoryTranslations: Record<string, { 
  nameEn: string; 
  descriptionEn?: string;
}> = {
  // Main Categories
  'Їжа': {
    nameEn: 'Food',
    descriptionEn: 'Main dishes and food items'
  },
  'Напої': {
    nameEn: 'Beverages',
    descriptionEn: 'Non-alcoholic beverages'
  },
  'Алкоголь': {
    nameEn: 'Alcoholic Beverages',
    descriptionEn: 'Alcoholic beverages and cocktails'
  },
  'Мерч': {
    nameEn: 'Merchandise',
    descriptionEn: 'Restaurant merchandise'
  },
  'Пиво': {
    nameEn: 'Beer',
    descriptionEn: 'Craft and traditional beer'
  },

  // Subcategories - Food
  'Гарячі страви': {
    nameEn: 'Main Courses',
    descriptionEn: 'Main hot dishes of Ukrainian and European cuisine'
  },
  'Основні страви': {
    nameEn: 'Main Courses',
    descriptionEn: 'Chef\'s masterpieces with premium ingredients'
  },
  'Супи': {
    nameEn: 'Soups',
    descriptionEn: 'Traditional Ukrainian soups'
  },
  'Салати': {
    nameEn: 'Salads',
    descriptionEn: 'Fresh salads with natural ingredients'
  },
  'Десерти': {
    nameEn: 'Desserts',
    descriptionEn: 'Sweet treats and desserts'
  },

  // Subcategories - Beverages
  'Кава': {
    nameEn: 'Coffee',
    descriptionEn: 'Various types of coffee'
  },
  'Чай': {
    nameEn: 'Tea',
    descriptionEn: 'Traditional and fruit teas'
  },
  'Безалкогольні напої': {
    nameEn: 'Soft Drinks',
    descriptionEn: 'Refreshing non-alcoholic beverages'
  },

  // Subcategories - Alcohol
  'Алкогольні напої': {
    nameEn: 'Alcoholic Beverages',
    descriptionEn: 'Beer, wine, and cocktails'
  },
  'Вина': {
    nameEn: 'Wines',
    descriptionEn: 'Collection of fine wines from around the world'
  },
  'Коктейлі': {
    nameEn: 'Cocktails',
    descriptionEn: 'Signature cocktails from our bartender'
  },
  'Віскі': {
    nameEn: 'Whiskey',
    descriptionEn: 'Collection of rare whiskeys'
  },
  'Вино': {
    nameEn: 'Wine',
    descriptionEn: 'Wine collection for connoisseurs'
  },
  'Крафтове пиво': {
    nameEn: 'Craft Beer',
    descriptionEn: 'Artisanal craft beer'
  },

  // Subcategories - Other
  'Сувеніри': {
    nameEn: 'Souvenirs',
    descriptionEn: 'Memorabilia from the restaurant'
  },
  'Риба та морепродукти': {
    nameEn: 'Fish & Seafood',
    descriptionEn: 'Fresh trout and other seafood'
  },
  'Багети та намазки': {
    nameEn: 'Baguettes & Spreads',
    descriptionEn: 'Fresh baguettes with various spreads'
  },
  'Континентальні сніданки': {
    nameEn: 'Continental Breakfasts',
    descriptionEn: 'Full breakfasts with various options'
  },
  'Яєчні страви': {
    nameEn: 'Egg Dishes',
    descriptionEn: 'Various egg preparations'
  },
  'Випічка': {
    nameEn: 'Pastries',
    descriptionEn: 'Fresh pastries and baked goods'
  },
  'Основна кухня': {
    nameEn: 'Main Kitchen',
    descriptionEn: 'Italian cuisine and various dishes'
  },
  'Класичні коктейлі': {
    nameEn: 'Classic Cocktails',
    descriptionEn: 'Timeless cocktails'
  },
  'Авторські коктейлі': {
    nameEn: 'Signature Cocktails',
    descriptionEn: 'Exclusive recipes from our bartender'
  },
  'Сирники': {
    nameEn: 'Cottage Cheese Pancakes',
    descriptionEn: 'Homemade cottage cheese pancakes of various types'
  },
  'Булочки та хліб': {
    nameEn: 'Pastries & Bread',
    descriptionEn: 'Various pastries'
  },
  'Торти та десерти': {
    nameEn: 'Cakes & Desserts',
    descriptionEn: 'Cheese cakes and desserts'
  },
  'Комбо сніданки': {
    nameEn: 'Breakfast Combos',
    descriptionEn: 'Complete breakfast sets'
  },
  'Окремі страви': {
    nameEn: 'À La Carte',
    descriptionEn: 'Individual breakfast dishes'
  },
  'Сніданки': {
    nameEn: 'Breakfast',
    descriptionEn: 'Breakfast combos and morning kitchen'
  },
  'Спеціальна кава': {
    nameEn: 'Specialty Coffee',
    descriptionEn: 'Signature coffee beverages'
  },
  'Класична кава': {
    nameEn: 'Classic Coffee',
    descriptionEn: 'Traditional coffee beverages'
  },
  'Чай та інші напої': {
    nameEn: 'Tea & Other Beverages',
    descriptionEn: 'Tea and alternative beverages'
  },
};

export const allergenTranslations: Record<string, string | null> = {
  'Глютен': 'Gluten',
  'Яйця': 'Eggs',
  'Молочні продукти': 'Dairy',
  'Риба': 'Fish',
  'Морепродукти': 'Seafood',
  'Соя': 'Soy',
  'Горіхи': 'Nuts',
  'Цукор': null, // Sugar is not typically an allergen - filter it out
};

/**
 * Convert Ukrainian allergen string to English
 * Filters out non-allergens like "Sugar" (Цукор)
 */
export function translateAllergens(uaAllergens: string | null): string | null {
  if (!uaAllergens) return null;
  
  const translated = uaAllergens
    .split(',')
    .map(a => {
      const trimmed = a.trim();
      const translation = allergenTranslations[trimmed];
      // Return translation, or null if not found (might be non-allergen)
      return translation !== undefined ? translation : trimmed;
    })
    .filter(a => a !== null && a !== undefined && a !== '') // Filter out nulls and empty strings
    .join(', ');
  
  return translated || null; // Return null if empty result
}

