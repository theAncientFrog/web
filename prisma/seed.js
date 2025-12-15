// prisma/seed.js
console.log('!!! DEBUG: seed.js script is starting !!!');
const { PrismaClient, Role, CategoryType } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// =========================================================================
// ФУНКЦІЯ ДЛЯ СТВОРЕННЯ ІЄРАРХІЧНОГО МЕНЮ З PARENT-CHILD СТРУКТУРОЮ
// =========================================================================
async function createHierarchicalMenuForRestaurant(restaurantId, menuStructure) {
    for (const mainCategoryData of menuStructure) {
        // Створюємо головну категорію
        const mainCategory = await prisma.category.create({
            data: {
                name: mainCategoryData.name,
                description: mainCategoryData.description,
                type: mainCategoryData.type,
                restaurantId: restaurantId
            }
        });

        // Створюємо підкатегорії
        if (mainCategoryData.subcategories) {
            for (const subCategoryData of mainCategoryData.subcategories) {
                const subCategory = await prisma.category.create({
                    data: {
                        name: subCategoryData.name,
                        description: subCategoryData.description,
                        parentId: mainCategory.id,
                        restaurantId: restaurantId
                    }
                });

                // Створюємо страви для підкатегорії
                if (subCategoryData.dishes) {
                    for (const dishData of subCategoryData.dishes) {
                        await prisma.dish.create({
                            data: {
                                name: dishData.name,
                                description: dishData.description,
                                price: dishData.price,
                                calories: dishData.calories,
                                allergens: dishData.allergens || null,
                                imageUrl: dishData.imageUrl,
                                categoryId: subCategory.id
                            }
                        });
                    }
                }
            }
        }
    }
}

// =========================================================================
// СТРУКТУРА МЕНЮ ДЛЯ РЕСТОРАНУ NAZVA (З ІЄРАРХІЄЮ PARENT-CHILD)
// =========================================================================

const nazvaMenuStructure = [
    {
        name: 'Їжа',
        description: 'Основні страви та кухня ресторану',
        type: CategoryType.KITCHEN,
        subcategories: [
            {
                name: 'Гарячі страви',
                description: 'Основні гарячі страви української та європейської кухні',
                dishes: [
                    { name: 'Котлета по-київськи', description: '200г, з картопляним пюре', price: 220.0, calories: 550, allergens: 'Глютен, Яйця, Молочні продукти', imageUrl: 'https://rud.ua/uploads/under_recipe/02_600x300_5f686cb1bd6ca.jpg' },
                    { name: 'Вареники з картоплею та грибами', description: '250г, зі шкварками та сметаною', price: 130.0, calories: 480, allergens: 'Глютен, Молочні продукти', imageUrl: 'https://tasty1.siteo.xyz/r/o/vareniki-z-kartopleyu-163vq.jpg' },
                    { name: 'Деруни з м\'ясом', description: '280г, зі сметаною', price: 160.0, calories: 520, allergens: 'Молочні продукти', imageUrl: 'https://static.espreso.tv/uploads/photobank/328000_329000/328338_fried-potato-pancakes_2829-13788_new_960x380_0.webp' },
                    { name: 'Стейк Рібай', description: '300г, з овочами гриль', price: 450.0, calories: 600, allergens: null, imageUrl: 'https://images.gastronom.ru/mXFaZVz9foGqDfAlI2be0e3yuvJbsYw0PW_WQgqaRgo/pr:article-preview-image/g:ce/rs:auto:0:0:0/L2Ntcy9hbGwtaW1hZ2VzL2U0NGZkZDczLWFjYWQtNGIxZi05ZWU1LTlkMzBkOTc5Y2VkNy5qcGc.webp' },
                    { name: 'Лосось на грилі', description: '180г, з рисом та соусом теріякі', price: 350.0, calories: 420, allergens: 'Риба, Соя', imageUrl: 'https://static.tildacdn.com/tild6362-6134-4835-b832-386538323538/1716378.jpg' },
                    { name: 'Паста Карбонара', description: '350г', price: 210.0, calories: 650, allergens: 'Глютен, Яйця, Молочні продукти', imageUrl: 'https://klopotenko.com/wp-content/uploads/2018/10/Pasta-Karbonara_siteWEb.jpg' }
                ]
            },
            {
                name: 'Супи',
                description: 'Традиційні українські супи',
                dishes: [
                    { name: 'Борщ Український', description: '350мл, зі сметаною, пампушками та часником', price: 150.0, calories: 320, allergens: 'Молочні продукти, Глютен', imageUrl: 'https://images.unian.net/photos/2020_04/thumb_files/1200_0_1588081977-7108.jpg' },
                    { name: 'Солянка м\'ясна', description: '350мл', price: 170.0, calories: 400, allergens: 'Молочні продукти', imageUrl: 'https://myastoriya.com.ua/upload/resize_cache/iblock/2a5/1000_800_1/4ormr5v1ub932o99qtyemxhg57wgpxoe.jpg' },
                    { name: 'Грибний крем-суп', description: '300мл, з грінками', price: 130.0, calories: 280, allergens: 'Глютен, Молочні продукти', imageUrl: 'https://www.herbalife.com/dmassets/regional-reusable-assets/emea/images/ri-creamy-mushroom-soup-recipe-emea.jpg' }
                ]
            },
            {
                name: 'Салати',
                description: 'Свіжі салати з натуральних інгредієнтів',
                dishes: [
                    { name: 'Салат Цезар з куркою', description: '250г', price: 180.0, calories: 380, allergens: 'Яйця, Молочні продукти', imageUrl: 'https://yapiko.com.ua/media/catalog/product/cache/90c631851bfc82ed3538a672fa9488bb/c/a/caesar_salad_with_chicken_sous_vide.jpg' },
                    { name: 'Грецький салат', description: '300г', price: 160.0, calories: 300, allergens: 'Молочні продукти', imageUrl: 'https://smachno.ua/wp-content/uploads/2009/10/03/Depositphotos_7299284_m-2015.jpg' },
                    { name: 'Салат з телятиною та руколою', description: '220г', price: 230.0, calories: 350, allergens: null, imageUrl: 'https://schedryk.vn.ua/uploads/640ed2823fe3d.jpg' },
                    { name: 'Салат Олів\'є', description: '250г', price: 140.0, calories: 420, allergens: 'Яйця, Молочні продукти', imageUrl: 'https://images.unian.net/photos/2018_12/thumb_files/1200_0_1544783934-3964.jpg' }
                ]
            },
            {
                name: 'Десерти',
                description: 'Солодощі та десерти',
                dishes: [
                    { name: 'Наполеон', description: '150г', price: 90.0, calories: 500, allergens: 'Глютен, Яйця, Молочні продукти', imageUrl: 'https://www.novavizia.com/wp-content/uploads/napoleon-za-kompetentnostta.jpg' },
                    { name: 'Чізкейк Нью-Йорк', description: '140г', price: 110.0, calories: 480, allergens: 'Яйця, Молочні продукти, Глютен', imageUrl: 'https://la-torta.ua/content/uploads/images/12-cake.jpg' },
                    { name: 'Шоколадний фондан', description: '120г, з кулькою морозива', price: 130.0, calories: 550, allergens: 'Глютен, Яйця, Молочні продукти', imageUrl: 'https://images.unian.net/photos/2020_12/thumb_files/1200_0_1608796072-3763.jpg' },
                    { name: 'Тирамісу', description: '130г', price: 120.0, calories: 450, allergens: 'Яйця, Молочні продукти, Глютен', imageUrl: 'https://lasunka.com/s165-prew.jpg' }
                ]
            }
        ]
    },
    {
        name: 'Напої',
        description: 'Безалкогольні напої та прохолоджувальні напої',
        type: CategoryType.DRINKS,
        subcategories: [
            {
                name: 'Кава',
                description: 'Різноманітні види кави',
                dishes: [
                    { name: 'Кава "По домашньому"', description: 'Особливий рецепт', price: 80.0, calories: 120, allergens: 'Молочні продукти', imageUrl: 'https://images.prom.ua/4708817402_w1280_h640_4708817402.jpg' },
                    { name: 'Еспресо', description: '30мл', price: 50.0, calories: 5, allergens: null, imageUrl: 'https://westcupgroup.com/wp-content/uploads/2020/06/1_4FzJWow3qJOV_O-3iKgBOw.jpeg' },
                    { name: 'Американо', description: '150мл', price: 55.0, calories: 10, allergens: null, imageUrl: 'https://delonghi-shop.by/upload/file/-/stati/americano_kofe_(1).jpg' },
                    { name: 'Капучино', description: '200мл', price: 65.0, calories: 120, allergens: 'Молочні продукти', imageUrl: 'https://static.tildacdn.com/tild6333-3739-4834-a663-303339653030/photo.png' },
                    { name: 'Лате', description: '250мл', price: 70.0, calories: 150, allergens: 'Молочні продукти', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-76R7O1chQfHoeMZFwjt8dNoFkjXAdAuodg&s' }
                ]
            },
            {
                name: 'Чай',
                description: 'Традиційні та фруктові чаї',
                dishes: [
                    { name: 'Чай чорний', description: '400мл', price: 50.0, calories: 0, allergens: null, imageUrl: 'https://i.pinimg.com/736x/6e/55/5c/6e555c660fa1e3694c7571848c6b10b2.jpg' },
                    { name: 'Чай зелений', description: '400мл', price: 50.0, calories: 0, allergens: null, imageUrl: 'https://i.pinimg.com/736x/51/13/5f/51135f64443cb1d6df758ba58b351bb0.jpg' },
                    { name: 'Чай фруктовий', description: '400мл', price: 60.0, calories: 10, allergens: null, imageUrl: 'https://i.pinimg.com/736x/4e/68/06/4e680652321a87187f068e62b65b627a.jpg' }
                ]
            },
            {
                name: 'Безалкогольні напої',
                description: 'Прохолодні безалкогольні напої',
                dishes: [
                    { name: 'Лимонад класичний', description: '300мл', price: 60.0, calories: 100, allergens: null, imageUrl: 'https://i.pinimg.com/1200x/96/4a/5b/964a5bb357736ed3d41211fd9715af0b.jpg' },
                    { name: 'Мохіто б/а', description: '350мл', price: 80.0, calories: 120, allergens: null, imageUrl: 'https://images.unian.net/photos/2021_06/thumb_files/1200_0_1625047238-4569.jpg' },
                    { name: 'Сік апельсиновий фреш', description: '250мл', price: 75.0, calories: 110, allergens: null, imageUrl: 'https://shuba.life/static/content/thumbs/1200x630/8/71/wwppvh---c2000x1050x0sx282s-up--a33f6e7440547f23e5404a750c59c718.jpg' },
                    { name: 'Coca-Cola', description: '330мл', price: 45.0, calories: 140, allergens: null, imageUrl: 'https://www.cocacolaep.com/assets/RY_CC_TSP231115-182__FocusFillMaxWyIwLjAwIiwiMC4wMCIsOTQ4LDcxNF0.jpg' }
                ]
            }
        ]
    },
    {
        name: 'Алкоголь',
        description: 'Алкогольні напої та коктейлі',
        type: CategoryType.ALCOHOL,
        subcategories: [
            {
                name: 'Алкогольні напої',
                description: 'Пиво, вино та коктейлі',
                dishes: [
                    { name: 'Пиво світле "NAZVA"', description: '0.5л', price: 80.0, calories: 200, allergens: 'Глютен', imageUrl: 'https://i.pinimg.com/736x/db/0f/ba/db0fba6d0b1617c089fd298082831703.jpg' },
                    { name: 'Вино червоне сухе', description: '150мл', price: 120.0, calories: 125, allergens: null, imageUrl: 'https://i.pinimg.com/736x/a1/fc/e5/a1fce538e8c5278d5dee7df4e03182f2.jpg' },
                    { name: 'Коктейль "Мохіто"', description: '300мл', price: 160.0, calories: 180, allergens: null, imageUrl: 'https://simplewine.ru/upload/iblock/ebc/ebc238796294c3e554a42eded7d49d83.jpg' }
                ]
            }
        ]
    },
    {
        name: 'Мерч',
        description: 'Сувеніри та мерч ресторану',
        type: CategoryType.MERCH,
        subcategories: [
            {
                name: 'Сувеніри',
                description: 'Пам\'ятні речі від ресторану NAZVA',
                dishes: [
                    { name: 'Футболка NAZVA', description: 'Бавовняна футболка з логотипом', price: 350.0, calories: null, allergens: null, imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfk5Ob-DSQI85VhJvKK4Nye0XDSsNwDA2j3w&s' },
                    { name: 'Кружка NAZVA', description: 'Керамічна кружка з дизайном', price: 120.0, calories: null, allergens: null, imageUrl: 'https://s13emagst.akamaized.net/products/93890/93889975/images/res_6ea71d52c3dd8313589a4a114aa78bed.jpg?width=720&height=720&hash=4971A70E9AB45F4759AF5AF5121AFD85' }
                ]
            }
        ]
    }
];

// =========================================================================
// МЕНЮ ДЛЯ BABO GARDEN (ДОРОЖЧА КУХНЯ)
// =========================================================================

const baboGardenMenuStructure = [
    {
        name: 'Їжа',
        description: 'Вишукана європейська кухня преміум класу',
        type: CategoryType.KITCHEN,
        subcategories: [
            {
                name: 'Основні страви',
                description: 'Шедеври шеф-кухаря з преміум інгредієнтів',
                dishes: [
                    { name: 'Фуа-гра з трюфелями', description: 'Печінка гуски з чорним трюфелем, 150г', price: 850.0, calories: 450, allergens: null, imageUrl: 'https://cdn.vkusnoo.com.ua/images/14197/14197-592_5225c5740225a-600x408.jpg' },
                    { name: 'Теляча вирізка Велінгтон', description: 'З печерицями та шпинатом, 200г', price: 720.0, calories: 520, allergens: 'Глютен, Яйця, Молочні продукти', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRj8u8uO1O6Kdptl5ttD9VX37ppvehC4Y8gTg&s' },
                    { name: 'Чорна тріска з морепродуктами', description: 'З лангустинами та ікрою, 180г', price: 680.0, calories: 380, allergens: 'Риба, Морепродукти', imageUrl: 'https://eeu.alaskaseafood.org/wp-content/uploads/2020/04/ALASKA-SABLEFISH-MARINATED-WITH-ACACIA-HONEY.jpg' },
                    { name: 'Ягняча корейка', description: 'З овочами гриль та мятним соусом, 220г', price: 650.0, calories: 480, allergens: null, imageUrl: 'https://myasnuyray.com.ua/wp-content/uploads/2020/04/1-04-20-3-4.jpg' },
                    { name: 'Бургер з вагю', description: 'Преміум яловичина, чорний трюфель, 280г', price: 420.0, calories: 650, allergens: 'Глютен, Яйця', imageUrl: 'https://bdaily.ru/wp-content/uploads/2024/07/FARSH_%D0%92%D0%B0%D0%B3%D1%8E-scaled.jpg' }
                ]
            },
            {
                name: 'Салати',
                description: 'Свіжі салати з органічних інгредієнтів',
                dishes: [
                    { name: 'Салат з молодими паростками', description: 'З медом, горіхами та сиром рікота, 180г', price: 280.0, calories: 320, allergens: 'Горіхи, Молочні продукти', imageUrl: 'https://images.unian.net/photos/2023_06/thumb_files/1200_0_1686566194-6619.jpg' },
                    { name: 'Цезар з телятиною', description: 'Маринована телятина, пармезан, 220г', price: 320.0, calories: 380, allergens: 'Яйця, Молочні продукти', imageUrl: 'https://images.unian.net/photos/2019_02/thumb_files/620_324_1551364909-4775.jpg?1' },
                    { name: 'Грецький салат з авокадо', description: 'Органічні овочі, фета, 250г', price: 260.0, calories: 290, allergens: 'Молочні продукти', imageUrl: 'https://static.apostrophe.ua/uploads/image/2b9a0884064689fdf914d5ed3a6c20e3.jpg' }
                ]
            },
            {
                name: 'Десерти',
                description: 'Шоколадні шедеври та десерти ручної роботи',
                dishes: [
                    { name: 'Шоколадний фондан з лавою', description: '70% какао, малина, кулька морозива', price: 220.0, calories: 480, allergens: 'Глютен, Яйця, Молочні продукти', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNmTovZVWhbNE81hm6U3JPf42w-X38Rqh33A&s' },
                    { name: 'Крем-брюле ванільний', description: 'З сезонними ягодами', price: 180.0, calories: 350, allergens: 'Яйця, Молочні продукти', imageUrl: 'https://fayni-recepty.com.ua/wp-content/uploads/2021/04/creme-brulee.jpg' },
                    { name: 'Панна котта з чорницею', description: 'Італійський десерт з ягідним соусом', price: 160.0, calories: 280, allergens: 'Молочні продукти', imageUrl: 'https://ekava.com.ua/image/catalog/products/torti-dlya-horeca/panna-kotta-z-chorniceyu-2432.jpg' }
                ]
            }
        ]
    },
    {
        name: 'Напої',
        description: 'Колекція вин та коктейлів преміум класу',
        type: CategoryType.DRINKS,
        subcategories: [
            {
                name: 'Вина',
                description: 'Колекція елітних вин з усього світу',
                dishes: [
                    { name: 'Chateau Lafite Rothschild 2009', description: 'Франція, Бордо, 150мл', price: 2500.0, calories: 125, allergens: null, imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLqg2d5XeFUcl4aJSO6ayBmeJhzhPhpNuZDA&s' },
                    { name: 'Opus One 2018', description: 'США, Каліфорнія, Каберне Совіньйон, 150мл', price: 1800.0, calories: 130, allergens: null, imageUrl: 'https://en.opusonewinery.com/wp-content/uploads/2022/03/OpusOne2018_Domestic_2.jpg' },
                    { name: 'Dom Perignon 2012', description: 'Франція, Шампань, 150мл', price: 2200.0, calories: 135, allergens: null, imageUrl: 'https://res.cloudinary.com/winecom/image/upload/leimliumifmzicv5wf7h' }
                ]
            },
            {
                name: 'Коктейлі',
                description: 'Авторські коктейлі від нашого бармена',
                dishes: [
                    { name: 'Old Fashioned', description: 'Бурбон, цукор, ангостура, 200мл', price: 280.0, calories: 220, allergens: 'Цукор', imageUrl: 'https://www.allrecipes.com/thmb/DQIEfVzC7KndUnnHJbmB44a0u3Y=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/221320-old-fashioned-cocktail-ddmfs-3X4-13181414-bf1365252476463b9650096c28b5acfd.jpg' },
                    { name: 'Negroni', description: 'Джин, вермут, кампарі, 180мл', price: 260.0, calories: 180, allergens: null, imageUrl: 'https://assets.tmecosys.com/image/upload/t_web_rdp_recipe_584x480_1_5x/img/recipe/ras/Assets/1D4CCB7D-D830-4ED3-9535-875D10CFC801/Derivates/DAD3AE52-E326-4309-90BA-10F6BEEB1EC7.jpg' },
                    { name: 'French 75', description: 'Джин, лимон, цукор, шампанське, 200мл', price: 320.0, calories: 190, allergens: 'Цукор', imageUrl: 'https://spirits-navigator.com/wp-content/uploads/2024/06/French75_02.jpg' }
                ]
            }
        ]
    },
    {
        name: 'Алкоголь',
        description: 'Преміум алкогольні напої',
        type: CategoryType.ALCOHOL,
        subcategories: [
            {
                name: 'Віскі',
                description: 'Колекція рідкісних віскі',
                dishes: [
                    { name: 'Macallan 18yo', description: 'Шотландія, спейсайд, 50мл', price: 450.0, calories: 140, allergens: null, imageUrl: 'https://brand-assets.edrington.com/transform/dde8619f-4e19-4f41-9e98-b5e55db3816b/MAC-2023-SignatureTaste-Sherry-Oak-18YO-HighRes-WEB-initial?quality=100&io=transform%3Afill%2Cwidth%3A575%2Cheight%3A551' },
                    { name: 'Glenfiddich 21yo', description: 'Шотландія, спейсайд, 50мл', price: 380.0, calories: 135, allergens: null, imageUrl: 'https://henrysliquorhouse.com/cdn/shop/files/glenfiddichserving-Max-Quality.jpg?v=1737601139&width=1445' }
                ]
            }
        ]
    }
];

// =========================================================================
// МЕНЮ ДЛЯ ПСТРУГ (РИБА, ВИНО, БАГЕТИ, ПИВО)
// =========================================================================

const pstrugMenuStructure = [
    {
        name: 'Їжа',
        description: 'Свіжа форель та інші морепродукти',
        type: CategoryType.KITCHEN,
        subcategories: [
            {
                name: 'Риба та морепродукти',
                description: 'Свіжа форель та інші морепродукти',
                dishes: [
                    { name: 'Стейк форелі на грилі', description: '220г, з овочами та лимоном', price: 280.0, calories: 320, allergens: 'Риба', imageUrl: 'https://karelian-fish.ru/shop/tpost/180ileuyh1-retsept-prigotovleniya-steika-foreli-na' },
                    { name: 'Форель запечена', description: '250г, з травами та маслом', price: 260.0, calories: 340, allergens: 'Риба, Молочні продукти', imageUrl: 'https://static.shaketopay.com.ua/menu-prod/dish-1063107.jpg?t=0' },
                    { name: 'Форель копчена', description: '180г, холодного копчення', price: 240.0, calories: 280, allergens: 'Риба', imageUrl: 'https://static.shaketopay.com.ua/menu-prod/dish-1063106.jpg?t=0' },
                    { name: 'Форель в клярі', description: '200г, з тар-tar соусом', price: 220.0, calories: 380, allergens: 'Риба, Глютен, Яйця', imageUrl: 'https://static.shaketopay.com.ua/menu-prod/dish-1285407.jpg?t=0' },
                    { name: 'Креветки на грилі', description: '300г, з часником та маслом', price: 320.0, calories: 220, allergens: 'Морепродукти, Молочні продукти', imageUrl: 'https://bbq24.com.ua/image/catalog/%D0%B1%D0%BB%D0%BE%D0%B3/%D0%BA%D1%80%D0%B5%D0%B2%D0%B5%D1%82%D0%BA%D0%B8%20%D0%BD%D0%B0%20%D0%B3%D1%80%D0%B8%D0%BB%D0%B5-min.jpg' },
                    { name: 'Мідії в вині', description: '400г, біле вино, часник', price: 260.0, calories: 180, allergens: 'Морепродукти', imageUrl: 'https://gastropubfather.com/image/cache/catalog/photo_2023-03-04_18-44-17-500x500.jpg' },
                    { name: 'Дорадо на грилі', description: '280г, з овочами', price: 240.0, calories: 260, allergens: 'Риба', imageUrl: 'https://assets.dots.live/misteram-public/018f6310-a96f-71d1-b993-cfd2e1d8f29b-826x0.png' }
                ]
            },
            {
                name: 'Багети та намазки',
                description: 'Свіжі багети з різними намазками',
                dishes: [
                    { name: 'Багет з лососем', description: '180г, крем-чиз, червона ікра', price: 180.0, calories: 320, allergens: 'Глютен, Риба, Молочні продукти', imageUrl: 'https://static.shaketopay.com.ua/menu-prod/dish-1361262.jpg?t=1754226844997' },
                    { name: 'Багет з авокадо', description: '170г, пармська шинка, рукола', price: 160.0, calories: 290, allergens: 'Глютен', imageUrl: 'https://static.shaketopay.com.ua/menu-prod/dish-1063118.jpg?t=0' },
                    { name: 'Багет з паштетом', description: '175г, печінковий паштет, цибуля', price: 140.0, calories: 340, allergens: 'Глютен', imageUrl: 'https://static.shaketopay.com.ua/menu-prod/dish-1063121.jpg?t=0' },
                    { name: 'Багет з сиром', description: '165г, камамбер, мед, горіхи', price: 170.0, calories: 310, allergens: 'Глютен, Молочні продукти, Горіхи', imageUrl: 'https://static.shaketopay.com.ua/menu-prod/dish-1063122.jpg?t=0' }
                ]
            }
        ]
    },
    {
        name: 'Напої',
        description: 'Вино та прохолодні напої',
        type: CategoryType.DRINKS,
        subcategories: [
            {
                name: 'Вино',
                description: 'Колекція вин для поціновувачів',
                dishes: [
                    { name: 'Шардоне біле сухе', description: '150мл, Франція', price: 180.0, calories: 120, allergens: null, imageUrl: 'https://static.shaketopay.com.ua/menu-prod/dish-1372567.jpg?t=1756048890390' },
                    { name: 'Мерло червоне сухе', description: '150мл, Італія', price: 170.0, calories: 125, allergens: null, imageUrl: 'https://static.shaketopay.com.ua/menu-prod/dish-1280995.jpg?t=0' },
                    { name: 'Рислінг напівсолодкий', description: '150мл, Німеччина', price: 190.0, calories: 135, allergens: 'Цукор', imageUrl: 'https://static.shaketopay.com.ua/menu-prod/dish-1280995.jpg?t=0' }
                ]
            }
        ]
    },
    {
        name: 'Пиво',
        description: 'Крафтове та традиційне пиво',
        type: CategoryType.ALCOHOL,
        subcategories: [
            {
                name: 'Крафтове пиво',
                description: 'Авторське крафтове пиво',
                dishes: [
                    { name: 'IPA "Рибальський ель"', description: '0.5л, гіркий хмель', price: 85.0, calories: 250, allergens: 'Глютен', imageUrl: 'https://static.shaketopay.com.ua/menu-prod/dish-1057381.jpg?t=0' },
                    { name: 'Stout "Чорна риба"', description: '0.5л, шоколадний смак', price: 90.0, calories: 240, allergens: 'Глютен', imageUrl: 'https://static.shaketopay.com.ua/menu-prod/dish-1127067.jpg?t=0' },
                    { name: 'Wheat "Біла хвиля"', description: '0.5л, пшеничне пиво', price: 80.0, calories: 220, allergens: 'Глютен', imageUrl: 'https://static.shaketopay.com.ua/menu-prod/dish-1057379.jpg?t=0' }
                ]
            },
        ]
    }
];

// =========================================================================
// МЕНЮ ДЛЯ СИЦИЛІЙСЬКОГО ДВОРИКА (КОКТЕЙЛІ, СНІДАНКИ)
// =========================================================================

const sicilyMenuStructure = [
    {
        name: 'Їжа',
        description: 'Італійська кухня та сніданки',
        type: CategoryType.KITCHEN,
        subcategories: [
            {
                name: 'Континентальні сніданки',
                description: 'Повні сніданки з різними варіантами',
                dishes: [
                    { name: 'Сніданок італійський', description: 'Капучіно, круасан, фрукти, йогурт', price: 180.0, calories: 450, imageUrl: '/images/placeholder.jpg' },
                    { name: 'Сніданок американський', description: 'Кава, бекон, яйця, тост', price: 220.0, calories: 520, imageUrl: '/images/placeholder.jpg' },
                    { name: 'Сніданок вегетаріанський', description: 'Фреш, гранола, фрукти, йогурт', price: 160.0, calories: 380, imageUrl: '/images/placeholder.jpg' }
                ]
            },
            {
                name: 'Яєчні страви',
                description: 'Різноманітні варіанти яєць',
                dishes: [
                    { name: 'Яйця Бенедикт', description: 'З лососем та голландським соусом', price: 190.0, calories: 420, imageUrl: '/images/placeholder.jpg' },
                    { name: 'Шакшука', description: 'Яйця в томатному соусі з паприкою', price: 140.0, calories: 320, imageUrl: '/images/placeholder.jpg' },
                    { name: 'Омлет з овочами', description: 'З сезонними овочами та сиром', price: 120.0, calories: 280, imageUrl: '/images/placeholder.jpg' }
                ]
            },
            {
                name: 'Випічка',
                description: 'Свіжа випічка та хлібобулочні вироби',
                dishes: [
                    { name: 'Круасан з шоколадом', description: 'Класичний французький круасан', price: 65.0, calories: 280, imageUrl: '/images/placeholder.jpg' },
                    { name: 'Панна котта', description: 'Італійський десерт з ягодами', price: 85.0, calories: 220, imageUrl: '/images/placeholder.jpg' },
                    { name: 'Тірамісу', description: 'Класичний італійський десерт', price: 95.0, calories: 320, imageUrl: '/images/placeholder.jpg' }
                ]
            },
            {
                name: 'Основна кухня',
                description: 'Італійська кухня та різноманітні страви',
                dishes: [
                    { name: 'Карбонара', description: 'Спагеті з беконом та яйцем, 350г', price: 160.0, calories: 580, imageUrl: '/images/placeholder.jpg' },
                    { name: 'Болоньєзе', description: 'Спагеті з м\'ясним соусом, 380г', price: 170.0, calories: 520, imageUrl: '/images/placeholder.jpg' },
                    { name: 'Ризотто з морепродуктами', description: 'Рис з морепродуктами, 320г', price: 220.0, calories: 480, imageUrl: '/images/placeholder.jpg' },
                    { name: 'Маргарита', description: 'Моцарела, томати, базилік, 400г', price: 140.0, calories: 420, imageUrl: '/images/placeholder.jpg' },
                    { name: 'Пепероні', description: 'Моцарела, пепероні, орегано, 420г', price: 170.0, calories: 480, imageUrl: '/images/placeholder.jpg' },
                    { name: 'Чотири сири', description: 'Моцарела, горгонзола, пармезан, 410г', price: 180.0, calories: 460, imageUrl: '/images/placeholder.jpg' }
                ]
            }
        ]
    },
    {
        name: 'Напої',
        description: 'Коктейлі та прохолодні напої',
        type: CategoryType.DRINKS,
        subcategories: [
            {
                name: 'Класичні коктейлі',
                description: 'Вічнозелені коктейлі',
                dishes: [
                    { name: 'Негроні', description: 'Джин, вермут, кампарі, 180мл', price: 140.0, calories: 180, imageUrl: '/images/placeholder.jpg' },
                    { name: 'Мартіні сухий', description: 'Джин, сухий вермут, 150мл', price: 130.0, calories: 160, imageUrl: '/images/placeholder.jpg' },
                    { name: 'Олд фешн', description: 'Бурбон, цукор, ангостура, 180мл', price: 150.0, calories: 200, imageUrl: '/images/placeholder.jpg' }
                ]
            },
            {
                name: 'Авторські коктейлі',
                description: 'Ексклюзивні рецепти нашого бармена',
                dishes: [
                    { name: 'Сицилійський сад', description: 'Водка, лимон, мята, цукор, 200мл', price: 160.0, calories: 190, imageUrl: '/images/placeholder.jpg' },
                    { name: 'Етна спреш', description: 'Джин, апельсиновий фреш, імбир, 180мл', price: 155.0, calories: 175, imageUrl: '/images/placeholder.jpg' },
                    { name: 'Палермська ніч', description: 'Ром, ананас, кокос, 190мл', price: 165.0, calories: 210, imageUrl: '/images/placeholder.jpg' }
                ]
            }
        ]
    }
];

// =========================================================================
// МЕНЮ ДЛЯ CHEESE BAKERY (ВИПІЧКА, СНІДАНКИ, КАВА)
// =========================================================================

const cheeseBakeryMenuStructure = [
    {
        name: 'Їжа',
        description: 'Випічка, сирники та сніданки',
        type: CategoryType.KITCHEN,
        subcategories: [
            {
                name: 'Сирники',
                description: 'Домашні сирники різних видів',
                dishes: [
                    { name: 'Сирники класичні', description: 'З сметаною та варенням, 300г', price: 85.0, calories: 420, imageUrl: '/images/placeholder.jpg' },
                    { name: 'Сирники з шоколадом', description: 'З шоколадною начинкою, 280г', price: 90.0, calories: 450, imageUrl: '/images/placeholder.jpg' },
                    { name: 'Сирники з ягодами', description: 'З сезонними ягодами, 320г', price: 95.0, calories: 380, imageUrl: '/images/placeholder.jpg' }
                ]
            },
            {
                name: 'Булочки та хліб',
                description: 'Різноманітна випічка',
                dishes: [
                    { name: 'Круасан з сиром', description: 'З камамбером та медом', price: 75.0, calories: 320, imageUrl: '/images/placeholder.jpg' },
                    { name: 'Булочка з корицею', description: 'З глазур\'ю, 120г', price: 45.0, calories: 280, imageUrl: '/images/placeholder.jpg' },
                    { name: 'Хліб зерновий', description: 'З насінням, 200г', price: 35.0, calories: 180, imageUrl: '/images/placeholder.jpg' }
                ]
            },
            {
                name: 'Торти та десерти',
                description: 'Сирні торти та десерти',
                dishes: [
                    { name: 'Чізкейк Нью-Йорк', description: 'Класичний сирний торт, 150г', price: 120.0, calories: 380, imageUrl: '/images/placeholder.jpg' },
                    { name: 'Торт "Три шоколаду"', description: 'Темний, молочний та білий шоколад, 140г', price: 110.0, calories: 420, imageUrl: '/images/placeholder.jpg' },
                    { name: 'Маффін з сиром', description: 'З вершковим сиром, 120г', price: 65.0, calories: 290, imageUrl: '/images/placeholder.jpg' }
                ]
            }
        ]
    },
    {
        name: 'Сніданки',
        description: 'Комбо сніданки та ранкова кухня',
        type: CategoryType.KITCHEN,
        subcategories: [
            {
                name: 'Комбо сніданки',
                description: 'Комплекси для ситного сніданку',
                dishes: [
                    { name: 'Сніданок "Завтрак чемпіона"', description: 'Омлет, тост, кава, фрукти', price: 160.0, calories: 480, imageUrl: '/images/placeholder.jpg' },
                    { name: 'Сніданок "Сирний рай"', description: 'Сирники, йогурт, круасан, чай', price: 145.0, calories: 520, imageUrl: '/images/placeholder.jpg' },
                    { name: 'Сніданок "Енергія"', description: 'Гранола, смузі, тост з авокадо', price: 130.0, calories: 380, imageUrl: '/images/placeholder.jpg' }
                ]
            },
            {
                name: 'Окремі страви',
                description: 'Індивідуальні страви для сніданку',
                dishes: [
                    { name: 'Овсянка з ягодами', description: 'З горіхами та медом, 300г', price: 75.0, calories: 280, imageUrl: '/images/placeholder.jpg' },
                    { name: 'Йогурт з гранолою', description: 'Грецький йогурт з добавками, 250г', price: 65.0, calories: 220, imageUrl: '/images/placeholder.jpg' },
                    { name: 'Тост з авокадо', description: 'На зерновому хлібі, 180г', price: 70.0, calories: 260, imageUrl: '/images/placeholder.jpg' }
                ]
            },
            {
                name: 'Випічка',
                description: 'Свіжа випічка та хлібобулочні вироби',
                dishes: [
                    { name: 'Сирники класичні', description: 'З сметаною та варенням, 300г', price: 85.0, calories: 420, imageUrl: '/images/placeholder.jpg' },
                    { name: 'Сирники з шоколадом', description: 'З шоколадною начинкою, 280г', price: 90.0, calories: 450, imageUrl: '/images/placeholder.jpg' },
                    { name: 'Сирники з ягодами', description: 'З сезонними ягодами, 320г', price: 95.0, calories: 380, imageUrl: '/images/placeholder.jpg' },
                    { name: 'Круасан з сиром', description: 'З камамбером та медом', price: 75.0, calories: 320, imageUrl: '/images/placeholder.jpg' },
                    { name: 'Булочка з корицею', description: 'З глазур\'ю, 120г', price: 45.0, calories: 280, imageUrl: '/images/placeholder.jpg' },
                    { name: 'Хліб зерновий', description: 'З насінням, 200г', price: 35.0, calories: 180, imageUrl: '/images/placeholder.jpg' },
                    { name: 'Чізкейк Нью-Йорк', description: 'Класичний сирний торт, 150г', price: 120.0, calories: 380, imageUrl: '/images/placeholder.jpg' },
                    { name: 'Торт "Три шоколаду"', description: 'Темний, молочний та білий шоколад, 140г', price: 110.0, calories: 420, imageUrl: '/images/placeholder.jpg' },
                    { name: 'Маффін з сиром', description: 'З вершковим сиром, 120г', price: 65.0, calories: 290, imageUrl: '/images/placeholder.jpg' }
                ]
            }
        ]
    },
    {
        name: 'Напої',
        description: 'Кава та гарячі напої',
        type: CategoryType.DRINKS,
        subcategories: [
            {
                name: 'Спеціальна кава',
                description: 'Авторські кавові напої',
                dishes: [
                    { name: 'Лате з лавандою', description: 'Еспресо, лавандовий сироп, молоко, 350мл', price: 85.0, calories: 180, imageUrl: '/images/placeholder.jpg' },
                    { name: 'Матча лате', description: 'Японський зелений чай, молоко, 330мл', price: 80.0, calories: 160, imageUrl: '/images/placeholder.jpg' },
                    { name: 'Кава по-ірландськи', description: 'Еспресо, віскі, вершки, 200мл', price: 95.0, calories: 220, imageUrl: '/images/placeholder.jpg' }
                ]
            },
            {
                name: 'Класична кава',
                description: 'Традиційні кавові напої',
                dishes: [
                    { name: 'Еспресо', description: '30мл', price: 35.0, calories: 5, imageUrl: '/images/placeholder.jpg' },
                    { name: 'Американо', description: '150мл', price: 40.0, calories: 10, imageUrl: '/images/placeholder.jpg' },
                    { name: 'Капучино', description: '250мл', price: 55.0, calories: 120, imageUrl: '/images/placeholder.jpg' },
                    { name: 'Лате', description: '300мл', price: 60.0, calories: 140, imageUrl: '/images/placeholder.jpg' }
                ]
            },
            {
                name: 'Чай та інші напої',
                description: 'Чай та альтернативні напої',
                dishes: [
                    { name: 'Зелений чай', description: '400мл', price: 45.0, calories: 0, imageUrl: '/images/placeholder.jpg' },
                    { name: 'Чай з лимоном', description: '400мл', price: 50.0, calories: 10, imageUrl: '/images/placeholder.jpg' },
                    { name: 'Гарячий шоколад', description: '300мл', price: 65.0, calories: 200, imageUrl: '/images/placeholder.jpg' }
                ]
            }
        ]
    }
];

// =========================================================================
// ГОЛОВНА ФУНКЦІЯ (MAIN)
// =========================================================================
async function main() {
    console.log('Start seeding ...');

    // --- ОЧИЩЕННЯ БАЗИ ---
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.dish.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.userRestaurantStats.deleteMany({});
    await prisma.achievement.deleteMany({});
    await prisma.restaurant.deleteMany({});
    await prisma.user.deleteMany({});

    console.log('Cleaned existing data.');

    // --- СТВОРЕННЯ КОРИСТУВАЧІВ ---
    const hashedPasswordOwner = await bcrypt.hash('123456', 10);
    const owner = await prisma.user.create({
        data: {
            email: 'owner@nazva.com',
            password: hashedPasswordOwner,
            role: Role.OWNER,
            name: 'Restaurant Owner',
        },
    });

    // Власники для нових закладів
    const ownerBaboGarden = await prisma.user.create({
        data: {
            email: 'owner@babogarden.com',
            password: hashedPasswordOwner,
            role: Role.OWNER,
            name: 'BaboGarden Owner',
        },
    });

    const ownerPstrug = await prisma.user.create({
        data: {
            email: 'owner@pstrug.com',
            password: hashedPasswordOwner,
            role: Role.OWNER,
            name: 'Pstrug Owner',
        },
    });

    const ownerSicily = await prisma.user.create({
        data: {
            email: 'owner@sicily.com',
            password: hashedPasswordOwner,
            role: Role.OWNER,
            name: 'Sicily Owner',
        },
    });

    const ownerCheeseBakery = await prisma.user.create({
        data: {
            email: 'owner@cheesebakery.com',
            password: hashedPasswordOwner,
            role: Role.OWNER,
            name: 'Cheese Bakery Owner',
        },
    });

    const hashedPasswordCustomer = await bcrypt.hash('password', 10);
    const customer = await prisma.user.create({
        data: {
            email: 'customer@test.com',
            password: hashedPasswordCustomer,
            role: Role.CUSTOMER,
            name: 'Test Customer'
        },
    });

    console.log('Created users.');

    // --- СТВОРЕННЯ РЕСТОРАНУ NAZVA ---
    const restaurantNazva = await prisma.restaurant.create({
        data: {
            name: 'Flat5',
            description: 'A warm and welcoming place for coffee lovers',
            bannerUrl: 'https://cdn-media.choiceqr.com/prod-eat-flat5/aXyIeko-egYJPqB-XimVTlX.jpeg.webp',
            logoUrl: 'https://instagram.fiev13-1.fna.fbcdn.net/v/t51.2885-19/573225613_18049963178670553_8013675427755324872_n.jpg?efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=instagram.fiev13-1.fna.fbcdn.net&_nc_cat=101&_nc_oc=Q6cZ2QGzsHWf2DPwF1OGbEO5dLHtbk0SVDaW-TIsWVKqgiEEL5hHWKGSiMKBa-rjQ00epdo&_nc_ohc=1Af_8ueBRvQQ7kNvwHJMjrd&_nc_gid=AWwWMCMTUTepMhv8e83dtg&edm=ALGbJPMBAAAA&ccb=7-5&oh=00_AfjeA5FrMUhbV7DmnVmWm4VMiY5F9yooS66Zg5_z72v5Cg&oe=693280B8&_nc_sid=7d3ac5',
            ownerId: owner.id,
        },
    });

    console.log(`Created restaurant: ${restaurantNazva.name}`);

    // --- СТВОРЕННЯ ІЄРАРХІЧНОГО МЕНЮ ---
    await createHierarchicalMenuForRestaurant(restaurantNazva.id, nazvaMenuStructure);

    console.log('Created hierarchical menu for Flat5');

    // --- СТВОРЕННЯ BABO GARDEN ---
    const restaurantBaboGarden = await prisma.restaurant.create({
        data: {
            name: 'BaboGarden',
            description: 'Вишукана європейська кухня преміум класу',
            bannerUrl: 'https://production.api.restaron.kitg.com.ua/public/lending/mainSlider/6889e150a96448e396c63ef2_image.jpg',
            logoUrl: 'https://instagram.fiev13-1.fna.fbcdn.net/v/t51.2885-19/485447827_1345673003149287_6010484723226474993_n.jpg?efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby42MDAuYzIifQ&_nc_ht=instagram.fiev13-1.fna.fbcdn.net&_nc_cat=103&_nc_oc=Q6cZ2QGwG0XSMvR2hBT9xSlzXVQsHbEAeS6rH988vVjL0e25xOjReLZ_dodYopx-ULyunms&_nc_ohc=9PYnmC0D1q4Q7kNvwF_S_8x&_nc_gid=rEvXXE8zuzkASwLrKxOLcQ&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_Afgl8PGhe9jp6oIx7xpjqnH3Sb6GbYfIaBmdOvEwjj-sjA&oe=69328CC8&_nc_sid=7a9f4b',
            ownerId: owner.id,
        },
    });

    console.log(`Created restaurant: ${restaurantBaboGarden.name}`);
    await createHierarchicalMenuForRestaurant(restaurantBaboGarden.id, baboGardenMenuStructure);
    console.log('Created hierarchical menu for BaboGarden');

    // --- СТВОРЕННЯ ПСТРУГ ---
    const restaurantPstrug = await prisma.restaurant.create({
        data: {
            name: 'Пструг',
            description: 'Рибний ресторан з автентичною кухнею',
            bannerUrl: 'https://www.lvivconvention.com.ua/wp-content/uploads/2021/03/Pstruhkhlib-ta-vyno-nadano-festom-8-scaled.jpg',
            logoUrl: 'https://instagram.fiev13-1.fna.fbcdn.net/v/t51.2885-19/433138897_947732130234264_3521150477103078962_n.jpg?efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=instagram.fiev13-1.fna.fbcdn.net&_nc_cat=100&_nc_oc=Q6cZ2QEmQCutJ2WPbniaruGzFnf0WZgGd0SUfqeoIqBPd920YfMgXg-S-GcuUQmSjycxthc&_nc_ohc=F-RkIvIRiv4Q7kNvwHpS24w&_nc_gid=4VX8kFr63L79py8FjhD8dg&edm=ALGbJPMBAAAA&ccb=7-5&oh=00_Afi3tb4o5SwuZudq-aLSgYUGc-aHoM91i55mVqqi76KrGg&oe=693282D1&_nc_sid=7d3ac5',
            ownerId: owner.id,
        },
    });

    console.log(`Created restaurant: ${restaurantPstrug.name}`);
    await createHierarchicalMenuForRestaurant(restaurantPstrug.id, pstrugMenuStructure);
    console.log('Created hierarchical menu for Пструг');

    // --- СТВОРЕННЯ СИЦИЛІЙСЬКОГО ДВОРИКА ---
    const restaurantSicily = await prisma.restaurant.create({
        data: {
            name: 'Сицилійський дворик',
            description: 'Італійська атмосфера та кухня',
            bannerUrl: 'https://posteat.ua/wp-content/uploads/2023/06/343418019_2150965938436876_1734399969313336000_n-1-1-1-min.jpg',
            logoUrl: 'https://instagram.fiev13-1.fna.fbcdn.net/v/t51.2885-19/334844354_227606193069043_7988247861179557118_n.jpg?efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4zMjAuYzIifQ&_nc_ht=instagram.fiev13-1.fna.fbcdn.net&_nc_cat=107&_nc_oc=Q6cZ2QF5IvNZVCduQueXrEnpsKWytlezqIE9vuxvQeGw5zIl4xUF1UOatgDolaXAxMu8xb8&_nc_ohc=aHnMqE6ONx8Q7kNvwGVHFor&_nc_gid=CKf3o-j24eCUVAcus0bubA&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_AfilmiLcCxNNsZ0_9VVPg8vzR8DxAG4XYEAooWbjXwEprA&oe=69329DBB&_nc_sid=7a9f4b',
            ownerId: owner.id,
        },
    });

    console.log(`Created restaurant: ${restaurantSicily.name}`);
    await createHierarchicalMenuForRestaurant(restaurantSicily.id, sicilyMenuStructure);
    console.log('Created hierarchical menu for Сицилійський дворик');

    // --- СТВОРЕННЯ CHEESE BAKERY ---
    const restaurantCheeseBakery = await prisma.restaurant.create({
        data: {
            name: 'Cheese bakery',
            description: 'Сирна випічка та кавові спеціалітети',
            bannerUrl: 'https://lviv.travel/image/seo/07/e4/07e4407455b8faa3355271032d931f1e2c8a8ab1_1666257298.jpg?crop=960%2C504%2C3%2C22&w=1200&h=630',
            logoUrl: 'https://instagram.fiev13-1.fna.fbcdn.net/v/t51.2885-19/552703182_18423040081110729_1365917561731406789_n.jpg?efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby41MTIuYzIifQ&_nc_ht=instagram.fiev13-1.fna.fbcdn.net&_nc_cat=109&_nc_oc=Q6cZ2QFQeaXAwkf95ZdolRnq8nLbQnUObKBixPr8ZkvVugcQm-QoFt2MnCC4q54KLk1oDU4&_nc_ohc=6jfk8Dx06r0Q7kNvwG4aQrs&_nc_gid=8mOVOHAggOodgTyT2KjmPw&edm=ALGbJPMBAAAA&ccb=7-5&oh=00_AfjG6Yf20szCpJiCoEiXHOlXPHggCxEgRQEhLRbaE-Bfzg&oe=693294B9&_nc_sid=7d3ac5',
            ownerId: owner.id,
        },
    });

    console.log(`Created restaurant: ${restaurantCheeseBakery.name}`);
    await createHierarchicalMenuForRestaurant(restaurantCheeseBakery.id, cheeseBakeryMenuStructure);
    console.log('Created hierarchical menu for Cheese bakery');

    // --- СТВОРЕННЯ АЧІВКИ ---
    const achievementsData = [
        { code: 'FOODIE_1', name: 'Смачний початок', description: 'Зробити перше замовлення', iconUrl: '/icons/foodie_1.png' },
        { code: 'FOODIE_2', name: 'Постійний гість', description: 'Зробити 5 замовлень', iconUrl: '/icons/foodie_2.png' },
        { code: 'FOODIE_3', name: 'Легенда закладів', description: 'Зробити 10 замовлень', iconUrl: '/icons/foodie_3.png' },
        { code: 'EXPLORER_1', name: 'На розвідці', description: 'Замовити в 3 різних закладах', iconUrl: '/icons/explorer_1.png' },
        { code: 'EXPLORER_2', name: 'Місцевий експерт', description: 'Замовити в 5 різних закладах', iconUrl: '/icons/explorer_2.png' }
    ];

    for (const ach of achievementsData) {
        await prisma.achievement.upsert({
            where: { code: ach.code },
            update: { name: ach.name, description: ach.description, iconUrl: ach.iconUrl },
            create: ach,
        });
    }

    console.log('Achievements created.');
    console.log('Seeding finished successfully.');
}

main()
    .catch((e) => {
        console.error('Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });