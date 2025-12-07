'use client';

import { useEffect, useState, useRef, useCallback, Suspense } from 'react';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import Pusher from 'pusher-js';
import { 
    ArrowLeft, 
    ShoppingCart, 
    Package, 
    User,
    ChevronDown,
    ChevronRight,
} from 'lucide-react';
import ProfileModal from '../../components/ProfileModal';
import CartModal from '../../components/CartModal';
import MyOrdersModal from '../../components/MyOrdersModal';
import Footer from '../../components/Footer';
import MenuItem from '../../components/MenuItem';

function MenuSecondaryContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { data: session, status } = useSession();
    const { cartCount } = useCart();

    const [restaurant, setRestaurant] = useState(null);
    const [allDishesByCategory, setAllDishesByCategory] = useState([]); // [{ categoryName, dishes, categoryId }]
    const [categories, setCategories] = useState([]);
    const [isLoadingRestaurant, setIsLoadingRestaurant] = useState(true);
    const [isLoadingDishes, setIsLoadingDishes] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isOrdersOpen, setIsOrdersOpen] = useState(false);
    const [loyalty, setLoyalty] = useState({ level: 1, progress: 0 });
    const [isLoadingLoyalty, setIsLoadingLoyalty] = useState(true);
    const [categoryLevels, setCategoryLevels] = useState({}); // { categoryId: { level, progress } }
    const [expandedCategories, setExpandedCategories] = useState(new Set());
    const [selectedMainCategory, setSelectedMainCategory] = useState(null); // Для мобільної версії

    const categoryRefs = useRef({});
    const restaurantId = params.id;
    const currentCategory = searchParams.get('category');
    const tableNumber = searchParams.get('table'); // Номер столика з URL
    
    // Діагностика: логування tableNumber
    useEffect(() => {
        if (tableNumber) {
            console.log('[Menu] tableNumber з URL:', tableNumber);
        }
    }, [tableNumber]);

    const userName = session?.user?.name || 'Клієнт';
    const profileInitial = userName.charAt(0);
    const userImage = session?.user?.image;
    const userId = session?.user?.id;

    // Завантаження даних ресторану
    useEffect(() => {
        if (restaurantId) {
            setIsLoadingRestaurant(true);
            fetch(`/api/restaurants/${restaurantId}`)
                .then(res => res.json())
                .then(data => {
                    setRestaurant(data);
                })
                .catch(error => {
                    console.error('Failed to load restaurant:', error);
                })
                .finally(() => {
                    setIsLoadingRestaurant(false);
                });
        }
    }, [restaurantId]);

    // Завантаження категорій
    useEffect(() => {
        if (restaurantId) {
            fetch(`/api/categories?restaurantId=${restaurantId}`)
                .then(res => res.json())
                .then(data => {
                    setCategories(data);
                    
                    // Якщо немає категорії в URL, переходимо до першої підкатегорії
                    if (!currentCategory && data.length > 0) {
                        const firstMainCat = data[0];
                        // Встановлюємо першу батьківську категорію для мобільної версії
                        setSelectedMainCategory(firstMainCat.name);
                        if (firstMainCat.subcategories && firstMainCat.subcategories.length > 0) {
                            const firstSubCat = firstMainCat.subcategories[0];
                            // Зберігаємо параметр table при навігації
                            const tableParam = searchParams.get('table') ? `&table=${encodeURIComponent(searchParams.get('table'))}` : '';
                            router.replace(`/menu-secondary/${restaurantId}?category=${encodeURIComponent(firstSubCat.name)}${tableParam}`, { scroll: false });
                        }
                    }
                })
                .catch(error => {
                    console.error('Error fetching categories:', error);
                });
        }
    }, [restaurantId, currentCategory, router]);

    // Завантаження всіх страв з усіх підкатегорій
    useEffect(() => {
        if (restaurantId && categories.length > 0) {
            setIsLoadingDishes(true);
            
            // Збираємо всі підкатегорії
            const allSubcategories = [];
            categories.forEach(mainCat => {
                // Використовуємо числовий ID головної категорії
                const mainCatId = mainCat.id;
                
                if (mainCat.subcategories && mainCat.subcategories.length > 0) {
                    mainCat.subcategories.forEach(subCat => {
                        allSubcategories.push({
                            name: subCat.name,
                            id: subCat.id,
                            mainCategoryName: mainCat.name,
                            mainCategoryId: mainCatId // Додаємо ID головної категорії одразу
                        });
                    });
                }
            });

            // Завантажуємо страви для кожної підкатегорії
            const fetchAllDishes = async () => {
                const dishesByCategory = [];
                
                for (const subCat of allSubcategories) {
                    try {
                        const res = await fetch(`/api/dishes?category=${encodeURIComponent(subCat.name)}&restaurantId=${restaurantId}`);
                        const dishes = await res.json();
                        
                        if (dishes && dishes.length > 0) {
                            // Використовуємо mainCategoryId, який вже є в subCat
                            const mainCategoryId = subCat.mainCategoryId || null;
                            console.log(`[Category Mapping] Підкатегорія ${subCat.name} (ID: ${subCat.id}) → Головна категорія ${subCat.mainCategoryName} (ID: ${mainCategoryId})`);
                            dishesByCategory.push({
                                categoryName: subCat.name,
                                categoryId: subCat.id,
                                mainCategoryId: mainCategoryId,
                                mainCategoryName: subCat.mainCategoryName,
                                dishes: dishes
                            });
                        }
                    } catch (error) {
                        console.error(`Error fetching dishes for ${subCat.name}:`, error);
                    }
                }
                
                setAllDishesByCategory(dishesByCategory);
                setIsLoadingDishes(false);
            };

            fetchAllDishes();
        }
    }, [restaurantId, categories]);

    // Завантаження рівня лояльності закладу
    useEffect(() => {
        if (restaurantId && status === 'authenticated') {
            setIsLoadingLoyalty(true);
            fetch(`/api/loyalty/${restaurantId}`)
                .then(res => res.json())
                .then(data => {
                    setLoyalty(data);
                })
                .catch(error => {
                    console.error('Failed to load loyalty:', error);
                    setLoyalty({ level: 1, progress: 0 });
                })
                .finally(() => {
                    setIsLoadingLoyalty(false);
                });
        }
    }, [restaurantId, status]);

    // Функція для завантаження рівнів категорій
    const loadCategoryLevels = useCallback(() => {
        if (restaurantId && status === 'authenticated') {
            console.log('[Category Levels] Завантаження рівнів категорій для ресторану:', restaurantId);
            fetch(`/api/loyalty/categories/${restaurantId}`)
                .then(res => res.json())
                .then(data => {
                    console.log('[Category Levels] Отримано дані:', data);
                    const levelsMap = {};
                    if (Array.isArray(data)) {
                        data.forEach(cat => {
                            levelsMap[cat.categoryId] = {
                                level: cat.level,
                                progress: cat.progress,
                                hasStats: cat.hasStats || false, // Чи є статистика (чи робив покупки)
                            };
                            console.log(`[Category Levels] Категорія ${cat.categoryName} (ID: ${cat.categoryId}): level=${cat.level}, progress=${cat.progress}, hasStats=${cat.hasStats}`);
                        });
                    }
                    console.log('[Category Levels] Оновлено levelsMap:', levelsMap);
                    setCategoryLevels(levelsMap);
                })
                .catch(error => {
                    console.error('[Category Levels] Помилка завантаження:', error);
                    setCategoryLevels({});
                });
        }
    }, [restaurantId, status]);

    // Завантаження рівнів категорій при завантаженні сторінки
    useEffect(() => {
        loadCategoryLevels();
    }, [restaurantId, status]);

    // Оновлення рівнів категорій після закриття CartModal (якщо замовлення було створено)
    useEffect(() => {
        if (!isCartOpen && status === 'authenticated' && restaurantId) {
            // Оновлюємо рівні категорій після закриття кошика (якщо замовлення було створено)
            const timer = setTimeout(() => {
                console.log('[Category Levels] Оновлення після закриття кошика');
                loadCategoryLevels();
            }, 1500); // Збільшена затримка, щоб дати час API оновити дані
            return () => clearTimeout(timer);
        }
    }, [isCartOpen, status, restaurantId, loadCategoryLevels]);

    // Скрол до категорії при кліку на сайдбар
    const scrollToCategory = (categoryName) => {
        const categoryId = `category-${categoryName}`;
        const element = categoryRefs.current[categoryId];
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Оновлюємо URL без перезавантаження, зберігаючи параметр table
            const tableParam = tableNumber ? `&table=${encodeURIComponent(tableNumber)}` : '';
            router.replace(`/menu-secondary/${restaurantId}?category=${encodeURIComponent(categoryName)}${tableParam}`, { scroll: false });
        }
    };

    // Перемикання розгортання/згортання батьківської категорії
    const toggleCategory = (mainCategoryName) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(mainCategoryName)) {
                newSet.delete(mainCategoryName);
            } else {
                newSet.add(mainCategoryName);
            }
            return newSet;
        });
    };

    // Автоматично розгортаємо категорію, якщо вона містить активну підкатегорію
    useEffect(() => {
        if (currentCategory && categories.length > 0) {
            categories.forEach(mainCat => {
                if (mainCat.subcategories && mainCat.subcategories.some(sub => sub.name === currentCategory)) {
                    setExpandedCategories(prev => new Set(prev).add(mainCat.name));
                    // Для мобільної версії - вибираємо батьківську категорію
                    setSelectedMainCategory(mainCat.name);
                }
            });
        }
    }, [currentCategory, categories]);

    // Автоматично вибираємо першу батьківську категорію при завантаженні
    useEffect(() => {
        if (categories.length > 0 && !selectedMainCategory) {
            setSelectedMainCategory(categories[0].name);
        }
    }, [categories, selectedMainCategory]);

    // Pusher для оновлення замовлень
    useEffect(() => {
        if (status !== 'authenticated' || !userId || !restaurantId) return;

        const userChannelName = `user-${userId}`;
        const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY || '';
        const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || '';
        const pusherClient = new Pusher(pusherKey, {
            cluster: pusherCluster,
        });

        const userChannel = pusherClient.subscribe(userChannelName);

        userChannel.bind('order-status-update', (data) => {
            console.log('Order status updated:', data);
        });

        return () => {
            userChannel.unbind_all();
            pusherClient.unsubscribe(userChannelName);
            pusherClient.disconnect();
        };
    }, [status, userId, restaurantId]);

    if (isLoadingRestaurant) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
                <div className="text-gray-500 dark:text-gray-400">Завантаження...</div>
            </div>
        );
    }

    if (!restaurant) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
                <div className="text-red-600 dark:text-red-400">Ресторан не знайдено</div>
            </div>
        );
    }

    const { name, description, address, logoUrl } = restaurant;
    const defaultPlaceholder = '/images/placeholder.jpg';

    return (
        <>
            {/* Modals */}
            <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
            <CartModal 
                isOpen={isCartOpen} 
                onClose={() => {
                    setIsCartOpen(false);
                    // Оновлюємо рівні категорій після закриття кошика
                    setTimeout(() => {
                        loadCategoryLevels();
                    }, 1000);
                }} 
                restaurantId={restaurantId}
                tableNumber={tableNumber || null}
            />
            <MyOrdersModal isOpen={isOrdersOpen} onClose={() => setIsOrdersOpen(false)} restaurantId={restaurantId} />

            <div className="min-h-screen bg-white dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100">
                {/* Header з лого, назвою та описом */}
                <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700">
                    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
                        <div className="flex items-center justify-between gap-2 sm:gap-4">
                            {/* Ліва частина: кнопка назад + логотип + назва + опис */}
                            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                <Link href={`/menu/${restaurantId}`}>
                                    <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition flex-shrink-0">
                                        <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                                    </button>
                                </Link>

                                {/* Логотип */}
                                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex-shrink-0 overflow-hidden">
                                    <Image
                                        src={logoUrl || defaultPlaceholder}
                                        alt={`${name} Logo`}
                                        width={56}
                                        height={56}
                                        className="object-cover w-full h-full"
                                    />
                                </div>

                                {/* Назва та опис */}
                                <div className="flex-grow min-w-0">
                                    <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white truncate">{name}</h1>
                                    {description && (
                                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{description}</p>
                                    )}
                                    {address && (
                                        <p className="text-xs text-gray-500 dark:text-gray-500 line-clamp-1">{address}</p>
                                    )}
                                </div>
                            </div>

                            {/* Права частина: рівень закладу + іконки */}
                            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                                {/* Рівень закладу */}
                                {status === 'authenticated' && (
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <div className="text-right flex-shrink-0">
                                            <span className="text-xs sm:text-sm font-semibold text-green-600 dark:text-green-400 block whitespace-nowrap">
                                                lvl. {loyalty.level}
                                            </span>
                                            <div className="w-16 sm:w-20 h-1.5 sm:h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-0.5 sm:mt-1">
                                                <div 
                                                    className="bg-green-500 dark:bg-green-600 h-full rounded-full" 
                                                    style={{ width: `${loyalty.progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Іконки */}
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <button
                                        onClick={() => setIsOrdersOpen(true)}
                                        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                    >
                                        <Package className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300" />
                                    </button>

                                    <button
                                        onClick={() => setIsCartOpen(true)}
                                        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                    >
                                        <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300" />
                                        {cartCount > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs">
                                                {cartCount}
                                            </span>
                                        )}
                                    </button>

                                    <button
                                        onClick={() => setIsProfileOpen(true)}
                                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition overflow-hidden"
                                    >
                                        {userImage ? (
                                            <Image
                                                src={userImage}
                                                alt="Profile"
                                                width={32}
                                                height={32}
                                                className="rounded-full object-cover w-6 h-6 sm:w-8 sm:h-8"
                                            />
                                        ) : (
                                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                                                {profileInitial}
                                            </div>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Мобільна версія категорій - дві смужки під хедером */}
                <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-[80px] sm:top-[90px] z-40 shadow-sm">
                    {/* Перша смужка - батьківські категорії */}
                    <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                            {categories.map((mainCat) => {
                                const isSelected = selectedMainCategory === mainCat.name;
                                return (
                                    <button
                                        key={mainCat.id}
                                        onClick={() => {
                                            setSelectedMainCategory(mainCat.name);
                                            // Автоматично вибираємо першу підкатегорію, якщо є
                                            if (mainCat.subcategories && mainCat.subcategories.length > 0) {
                                                const firstSub = mainCat.subcategories[0];
                                                scrollToCategory(firstSub.name);
                                            }
                                        }}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap flex-shrink-0 transition ${
                                            isSelected
                                                ? 'bg-green-600 text-white'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                    >
                                        {mainCat.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Друга смужка - дочірні категорії вибраної батьківської */}
                    {selectedMainCategory && (() => {
                        const selectedMainCat = categories.find(cat => cat.name === selectedMainCategory);
                        const subcategories = selectedMainCat?.subcategories || [];
                        
                        if (subcategories.length === 0) return null;
                        
                        return (
                            <div className="px-3 py-2">
                                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                                    {subcategories.map((subCat) => {
                                        const isActive = currentCategory === subCat.name;
                                        return (
                                            <button
                                                key={subCat.id}
                                                onClick={() => scrollToCategory(subCat.name)}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap flex-shrink-0 transition ${
                                                    isActive
                                                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 font-semibold'
                                                        : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                                }`}
                                            >
                                                {subCat.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })()}
                </div>

                <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8 flex gap-4 sm:gap-8 lg:gap-12">
                    {/* Sidebar - прихований на мобільних, показується на планшетах і десктопі */}
                    <aside className="w-56 hidden md:block flex-shrink-0 sticky top-24 md:top-32 h-[calc(100vh-120px)] md:h-[calc(100vh-140px)] overflow-y-auto select-none custom-scrollbar pr-2">
                        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Категорії</h2>
                        <nav className="space-y-1">
                            {categories.map((mainCat) => {
                                const isExpanded = expandedCategories.has(mainCat.name);
                                const hasSubcategories = mainCat.subcategories && mainCat.subcategories.length > 0;
                                
                                return (
                                    <div key={mainCat.id} className="mb-1">
                                        {/* Батьківська категорія */}
                                        <button
                                            onClick={() => hasSubcategories && toggleCategory(mainCat.name)}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition flex items-center justify-between ${
                                                hasSubcategories
                                                    ? 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium'
                                                    : 'text-gray-600 dark:text-gray-400'
                                            }`}
                                        >
                                            <span>{mainCat.name}</span>
                                            {hasSubcategories && (
                                                isExpanded ? (
                                                    <ChevronDown className="w-4 h-4 flex-shrink-0" />
                                                ) : (
                                                    <ChevronRight className="w-4 h-4 flex-shrink-0" />
                                                )
                                            )}
                                        </button>
                                        
                                        {/* Дочірні категорії */}
                                        {hasSubcategories && isExpanded && (
                                            <div className="ml-4 mt-1 space-y-1">
                                                {mainCat.subcategories.map((subCat) => {
                                                    const isActive = currentCategory === subCat.name;
                                                    return (
                                                        <button
                                                            key={subCat.id}
                                                            onClick={() => scrollToCategory(subCat.name)}
                                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                                                                isActive
                                                                    ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 font-medium'
                                                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                            }`}
                                                        >
                                                            {subCat.name}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        {isLoadingDishes ? (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                Завантаження страв...
                            </div>
                        ) : allDishesByCategory.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                Страви не знайдено
                            </div>
                        ) : (
                            <div className="space-y-12">
                                {allDishesByCategory.map((categoryData) => {
                                    const categoryId = `category-${categoryData.categoryName}`;
                                    return (
                                        <div
                                            key={categoryData.categoryId}
                                            id={categoryId}
                                            ref={(el) => (categoryRefs.current[categoryId] = el)}
                                            className="scroll-mt-24"
                                        >
                                            {/* Заголовок категорії з рівнем та шкалою */}
                                            <div className="mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-200 dark:border-gray-700">
                                                <div className="flex items-center justify-between mb-2 gap-2">
                                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate flex-1">
                                                        {categoryData.categoryName}
                                                    </h2>
                                                    {status === 'authenticated' && (() => {
                                                        const catLevel = categoryLevels[categoryData.mainCategoryId];
                                                        console.log(`[Category Display] Категорія ${categoryData.categoryName} (mainCategoryId: ${categoryData.mainCategoryId}):`, catLevel);
                                                        // Показуємо рівень завжди, але знижку тільки якщо є статистика
                                                        if (!catLevel) {
                                                            // Якщо немає даних, показуємо рівень 1
                                                            return (
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                                                                        lvl. 1
                                                                    </span>
                                                                </div>
                                                            );
                                                        }
                                                        // Знижка тільки якщо є статистика (hasStats === true)
                                                        const discount = catLevel.hasStats ? Math.min(catLevel.level * 2, 20) : 0; // 2% за рівень, максимум 20%
                                                        return (
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                                                    lvl. {catLevel.level}
                                                                </span>
                                                                {discount > 0 && (
                                                                    <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                                                                        -{discount}%
                                                                    </span>
                                                                )}
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                                {status === 'authenticated' && (() => {
                                                    const catLevel = categoryLevels[categoryData.mainCategoryId];
                                                    // Показуємо прогрес завжди (навіть якщо 0%)
                                                    const progress = catLevel ? catLevel.progress : 0;
                                                    return (
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                                                                <div 
                                                                    className="bg-green-500 dark:bg-green-600 h-2 rounded-full transition-all duration-300" 
                                                                    style={{ width: `${progress}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                {progress}%
                                                            </span>
                                                        </div>
                                                    );
                                                })()}
                                            </div>

                                            {/* Страви категорії */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                                {categoryData.dishes.map((dish) => {
                                                    const catLevel = categoryLevels[categoryData.mainCategoryId];
                                                    // Знижка тільки якщо є статистика (hasStats === true)
                                                    const discount = catLevel && catLevel.hasStats ? Math.min(catLevel.level * 2, 20) : 0; // 2% за рівень, максимум 20%
                                                    return (
                                                        <MenuItem 
                                                            key={dish.id} 
                                                            dish={dish} 
                                                            restaurantId={restaurantId}
                                                            discount={discount}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </main>
                </div>

                <Footer />
            </div>
        </>
    );
}

export default function MenuSecondaryPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
                <div className="text-gray-500 dark:text-gray-400">Завантаження...</div>
            </div>
        }>
            <MenuSecondaryContent />
        </Suspense>
    );
}
