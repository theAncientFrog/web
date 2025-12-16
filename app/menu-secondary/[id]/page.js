'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
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
    Settings,
    Search,
    Filter,
    X,
} from 'lucide-react';
import ProfileModal from '../../components/ProfileModal';
import CartModal from '../../components/CartModal';
import MyOrdersModal from '../../components/MyOrdersModal';
import MenuSettingsModal from '../../components/MenuSettingsModal';
import TableNumberInputModal from '../../components/TableNumberInputModal';
import Footer from '../../components/Footer';
import MenuItem from '../../components/MenuItem';

function MenuSecondaryContent() {
    const { t, i18n } = useTranslation();
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { data: session, status } = useSession();
    const { cartCount } = useCart();
    
    // Визначаємо поточну мову
    const currentLang = i18n.language || 'ua';
    const isEnglish = currentLang.startsWith('en');

    const [restaurant, setRestaurant] = useState(null);
    const [allDishesByCategory, setAllDishesByCategory] = useState([]); // [{ categoryName, dishes, categoryId }]
    const [categories, setCategories] = useState([]);
    const [isLoadingRestaurant, setIsLoadingRestaurant] = useState(true);
    const [isLoadingDishes, setIsLoadingDishes] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isOrdersOpen, setIsOrdersOpen] = useState(false);
    const [isMenuSettingsOpen, setIsMenuSettingsOpen] = useState(false);
    const [isTableNumberModalOpen, setIsTableNumberModalOpen] = useState(false);
    const [loyalty, setLoyalty] = useState({ level: 1, progress: 0 });
    const [isLoadingLoyalty, setIsLoadingLoyalty] = useState(true);
    const [expandedCategories, setExpandedCategories] = useState(new Set());
    const [selectedMainCategory, setSelectedMainCategory] = useState(null); // Для мобільної версії
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [priceFilter, setPriceFilter] = useState({ min: '', max: '' });
    const [caloriesFilter, setCaloriesFilter] = useState({ min: '', max: '' });
    const [excludedAllergens, setExcludedAllergens] = useState([]); // Масив алергенів, які потрібно приховати

    // Список стандартних алергенів
    const commonAllergens = [
        'Глютен',
        'Яйця',
        'Молочні продукти',
        'Риба',
        'Морепродукти',
        'Горіхи',
        'Арахіс',
        'Соя',
        'Сіль',
        'Цукор',
        'Лактоза'
    ];

    const categoryRefs = useRef({});
    const headerRef = useRef(null);
    const [headerHeight, setHeaderHeight] = useState(0);
    const restaurantId = params.id;
    const currentCategory = searchParams.get('category');
    const tableNumber = searchParams.get('table'); // Номер столика з URL
    
    // Діагностика: логування tableNumber
    useEffect(() => {
        if (tableNumber) {
            console.log('[Menu] tableNumber з URL:', tableNumber);
        }
    }, [tableNumber]);

    // Обчислюємо висоту хедера для sticky навбара
    useEffect(() => {
        const updateHeaderHeight = () => {
            if (headerRef.current) {
                setHeaderHeight(headerRef.current.offsetHeight);
            }
        };
        
        updateHeaderHeight();
        window.addEventListener('resize', updateHeaderHeight);
        
        return () => window.removeEventListener('resize', updateHeaderHeight);
    }, [restaurant, loyalty]);

    const userName = session?.user?.name || 'Клієнт';
    const profileInitial = userName.charAt(0);
    const userImage = session?.user?.image;
    const userId = session?.user?.id;

    // Завантаження даних ресторану
    useEffect(() => {
        if (restaurantId) {
            setIsLoadingRestaurant(true);
            fetch(`/api/restaurants/${restaurantId}`)
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`Failed to load restaurant: ${res.status}`);
                    }
                    return res.json();
                })
                .then(data => {
                    setRestaurant(data);
                })
                .catch(error => {
                    console.error('Failed to load restaurant:', error);
                    setRestaurant(null);
                })
                .finally(() => {
                    setIsLoadingRestaurant(false);
                });
        }
    }, [restaurantId]);

    // Завантаження категорій
    useEffect(() => {
        if (restaurantId) {
            // Додаємо локаль до запиту
            const langParam = isEnglish ? '&lang=en' : '&lang=ua';
            fetch(`/api/categories?restaurantId=${restaurantId}${langParam}`, {
                headers: {
                    'x-lang': isEnglish ? 'en' : 'ua',
                    'Accept-Language': isEnglish ? 'en' : 'ua',
                }
            })
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`Failed to load categories: ${res.status}`);
                    }
                    return res.json();
                })
                .then(data => {
                    // Перевіряємо, чи дані є масивом
                    if (Array.isArray(data)) {
                        setCategories(data);
                    } else {
                        console.error('Categories data is not an array:', data);
                        setCategories([]);
                    }
                    
                    // Якщо немає категорії в URL, переходимо до першої підкатегорії
                    if (!currentCategory && Array.isArray(data) && data.length > 0) {
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
                    setCategories([]); // Встановлюємо порожній масив у разі помилки
                });
        }
    }, [restaurantId, currentCategory, router, searchParams, isEnglish]);

    // Завантаження всіх страв з усіх підкатегорій
    useEffect(() => {
        if (restaurantId && Array.isArray(categories) && categories.length > 0) {
            setIsLoadingDishes(true);
            
            // AbortController для захисту від race conditions
            const abortController = new AbortController();
            const signal = abortController.signal;
            
            // Збираємо всі підкатегорії
            const allSubcategories = [];
            categories.forEach(mainCat => {
                // Використовуємо числовий ID головної категорії
                const mainCatId = mainCat.id;
                
                if (mainCat.subcategories && mainCat.subcategories.length > 0) {
                    mainCat.subcategories.forEach(subCat => {
                        // API вже повертає локалізовані дані (без nameEn), тому просто використовуємо name
                        allSubcategories.push({
                            name: subCat.name, // Вже локалізована назва
                            id: subCat.id,
                            mainCategoryName: mainCat.name, // Вже локалізована назва
                            mainCategoryId: mainCatId // Додаємо ID головної категорії одразу
                        });
                    });
                }
            });

            // Завантажуємо страви для кожної підкатегорії
            const fetchAllDishes = async () => {
                const dishesByCategory = [];
                
                for (const subCat of allSubcategories) {
                    if (signal.aborted) break;
                    
                    try {
                        // Додаємо локаль до запиту для правильної локалізації
                        const langParam = isEnglish ? '&lang=en' : '&lang=ua';
                        const res = await fetch(`/api/dishes?category=${encodeURIComponent(subCat.name)}&restaurantId=${restaurantId}${langParam}`, { 
                            signal,
                            headers: {
                                'x-lang': isEnglish ? 'en' : 'ua',
                                'Accept-Language': isEnglish ? 'en' : 'ua',
                            }
                        });
                        
                        if (!res.ok) {
                            throw new Error(`Failed to fetch dishes: ${res.status}`);
                        }
                        
                        const dishes = await res.json();
                        
                        if (Array.isArray(dishes) && dishes.length > 0) {
                            // Використовуємо mainCategoryId, який вже є в subCat
                            const mainCategoryId = subCat.mainCategoryId || null;
                            console.log(`[Category Mapping] Підкатегорія ${subCat.name} (ID: ${subCat.id}) → Головна категорія ${subCat.mainCategoryName} (ID: ${mainCategoryId})`);

                            // Застосовуємо знижку закладу до всіх товарів (якщо немає знижки підкатегорії)
                            const dishesWithDiscount = dishes.map(dish => {
                                // Якщо у підкатегорії немає спеціальної знижки, застосовуємо знижку закладу
                                const discountPercent = restaurantDiscount; // Використовуємо знижку закладу як базову

                                const discountedPrice = dish.price * (1 - discountPercent / 100);


                                return {
                                    ...dish,
                                    price: discountedPrice, // Знижена ціна стає основною ціною
                                    originalPrice: dish.price, // Оригінальна ціна зберігається окремо
                                    discountPercent: discountPercent,
                                    subcategoryLevel: 1, // Базовий рівень для візуалізації
                                    discountSource: 'restaurant' // Вказуємо, що знижка від закладу
                                };
                            });

                            // API вже повертає локалізовані дані, тому просто використовуємо name
                            dishesByCategory.push({
                                categoryName: subCat.name, // Вже локалізована назва
                                categoryId: subCat.id,
                                mainCategoryId: mainCategoryId,
                                mainCategoryName: subCat.mainCategoryName, // Вже локалізована назва
                                dishes: dishesWithDiscount,
                                restaurantDiscount: restaurantDiscount
                            });
                        }
                    } catch (error) {
                        if (error.name === 'AbortError') {
                            console.log('Fetch aborted');
                            return;
                        }
                        console.error(`Error fetching dishes for ${subCat.name}:`, error);
                    }
                }
                
                if (!signal.aborted) {
                    setAllDishesByCategory(dishesByCategory);
                    setIsLoadingDishes(false);
                }
            };

            fetchAllDishes();
            
            // Cleanup function для скасування запитів
            return () => {
                abortController.abort();
            };
        }
    }, [restaurantId, categories, isEnglish, status]);

    // Завантаження рівня лояльності закладу
    useEffect(() => {
        if (restaurantId && status === 'authenticated') {
            setIsLoadingLoyalty(true);
            fetch(`/api/loyalty/${restaurantId}`)
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`Failed to load loyalty: ${res.status}`);
                    }
                    return res.json();
                })
                .then(data => {
                    setLoyalty(data || { level: 1, progress: 0 });
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

    // Обчислюємо знижку закладу на основі рівня (плавний ріст, максимум 10%)
    const restaurantDiscount = status === 'authenticated' ? Math.min(loyalty.level * 0.4, 10) : 0; // 0.4% за рівень, максимум 10%



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
        if (currentCategory && Array.isArray(categories) && categories.length > 0) {
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
        if (Array.isArray(categories) && categories.length > 0 && !selectedMainCategory) {
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
                <div className="text-gray-500 dark:text-gray-400">{t('common.loading')}</div>
            </div>
        );
    }

    if (!restaurant) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
                <div className="text-red-600 dark:text-red-400">{t('common.restaurant_not_found')}</div>
            </div>
        );
    }

    const { name, description, address, logoUrl } = restaurant;
    const defaultPlaceholder = '/images/placeholder.jpg';

    return (
        <>
            {/* Modals */}
            <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
            <MenuSettingsModal 
                isOpen={isMenuSettingsOpen} 
                onClose={() => setIsMenuSettingsOpen(false)} 
            />
            <CartModal
                isOpen={isCartOpen}
                onClose={() => {
                    setIsCartOpen(false);
                }}
                restaurantId={restaurantId}
                tableNumber={tableNumber || null}
            />
            <MyOrdersModal isOpen={isOrdersOpen} onClose={() => setIsOrdersOpen(false)} restaurantId={restaurantId} />
            
            <TableNumberInputModal 
                isOpen={isTableNumberModalOpen} 
                onClose={() => setIsTableNumberModalOpen(false)} 
                restaurantId={restaurantId}
            />

            <div className="min-h-screen bg-white dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100">
                {/* Header з лого, назвою та описом */}
                <header ref={headerRef} className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700">
                    <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-3 sm:pt-4 pb-0">
                        <div className="flex items-center justify-between gap-2 sm:gap-4">
                            {/* Ліва частина: кнопка назад + логотип + назва + опис */}
                            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                <button 
                                    onClick={() => router.back()}
                                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition flex-shrink-0"
                                >
                                    <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                                </button>

                                {/* Логотип */}
                                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex-shrink-0 overflow-hidden">
                                    <Image
                                        src={logoUrl || '/images/default_logo.png'}
                                        alt={`${name} Logo`}
                                        width={56}
                                        height={56}
                                        className="object-cover w-full h-full"
                                        unoptimized={true}
                                    />
                                </div>

                                {/* Назва та опис */}
                                <div className="flex-grow min-w-0">
                                    <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white truncate">{name}</h1>
                                    {description && (
                                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{description}</p>
                                    )}
                                    {address && (
                                        <p className="text-xs text-gray-700 dark:text-gray-400 line-clamp-1">{address}</p>
                                    )}
                                </div>
                            </div>

                            {/* Права частина: рівень закладу + іконки */}
                            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                                        {/* Рівень закладу */}
                                        {status === 'authenticated' && (
                                            <div className="flex flex-col items-end gap-1 sm:gap-2">
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
                                                    {restaurantDiscount > 0 && (
                                                        <span className="text-xs text-blue-600 dark:text-blue-400 block whitespace-nowrap">
                                                            -{restaurantDiscount.toFixed(1)}% на всі страви
                                                        </span>
                                                    )}
                                                </div>
                                                {/* Маленькі кнопки справа під рівнем */}
                                                <div className="flex flex-col gap-1">
                                                    {!tableNumber && (
                                                        <button
                                                            onClick={() => setIsTableNumberModalOpen(true)}
                                                            className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-900/50 transition whitespace-nowrap"
                                                            title={t('menu.enter_table_manually')}
                                                        >
                                                            {t('menu.enter_table_number')}
                                                        </button>
                                                    )}
                                                    {tableNumber && (
                                                        <div className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md whitespace-nowrap">
                                                            {t('menu.table_number')} {tableNumber}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                {/* Іконки */}
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <button
                                        onClick={() => setIsMenuSettingsOpen(true)}
                                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                    >
                                        <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300" />
                                    </button>

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
                    
                    {/* Мобільна версія категорій - дві смужки під хедером (всередині хедера) */}
                    <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
                        {/* Перша смужка - батьківські категорії */}
                    <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                            {Array.isArray(categories) && categories.map((mainCat) => {
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
                        const selectedMainCat = Array.isArray(categories) ? categories.find(cat => cat.name === selectedMainCategory) : null;
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
                </header>

                {/* Пошук та фільтри */}
                <div className="max-w-7xl mx-auto px-4 pt-4 sm:pt-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
                        {/* Рядок з пошуком та кнопкою фільтрів */}
                        <div className="flex gap-3 mb-4">
                            {/* Поле пошуку */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder={t('menu.search')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    >
                                        <X size={18} />
                                    </button>
                                )}
                            </div>
                            
                            {/* Кнопка фільтрів */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                                    showFilters
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                <Filter size={18} />
                                <span className="hidden sm:inline">{t('menu.filters')}</span>
                            </button>
                        </div>

                        {/* Панель фільтрів */}
                        {showFilters && (
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
                                {/* Фільтр за ціною */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            {t('menu.min_price')} ({t('menu.currency')})
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="0"
                                            value={priceFilter.min}
                                            onChange={(e) => setPriceFilter(prev => ({ ...prev, min: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            {t('menu.max_price')} ({t('menu.currency')})
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder={t('menu.no_limit')}
                                            value={priceFilter.max}
                                            onChange={(e) => setPriceFilter(prev => ({ ...prev, max: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Фільтр за калорійністю */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            {t('menu.min_calories')}
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="0"
                                            value={caloriesFilter.min}
                                            onChange={(e) => setCaloriesFilter(prev => ({ ...prev, min: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            {t('menu.max_calories')}
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder={t('menu.no_limit')}
                                            value={caloriesFilter.max}
                                            onChange={(e) => setCaloriesFilter(prev => ({ ...prev, max: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Фільтр за алергенами */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t('menu.hide_dishes_with_allergens')}
                                    </label>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                        {t('menu.select_allergens_description')}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {commonAllergens.map((allergen) => {
                                            const isSelected = excludedAllergens.includes(allergen);
                                            return (
                                                <button
                                                    key={allergen}
                                                    onClick={() => {
                                                        setExcludedAllergens(prev => 
                                                            isSelected
                                                                ? prev.filter(a => a !== allergen)
                                                                : [...prev, allergen]
                                                        );
                                                    }}
                                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                                                        isSelected
                                                            ? 'bg-red-600 text-white hover:bg-red-700'
                                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                    }`}
                                                >
                                                    {allergen}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Кнопка скидання фільтрів */}
                                {(searchQuery || priceFilter.min || priceFilter.max || caloriesFilter.min || caloriesFilter.max || excludedAllergens.length > 0) && (
                                    <button
                                        onClick={() => {
                                            setSearchQuery('');
                                            setPriceFilter({ min: '', max: '' });
                                            setCaloriesFilter({ min: '', max: '' });
                                            setExcludedAllergens([]);
                                        }}
                                        className="w-full py-2 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                                    >
                                        {t('menu.clear_filters')}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8 flex gap-4 sm:gap-8 lg:gap-12">
                    {/* Sidebar - прихований на мобільних, показується на планшетах і десктопі */}
                    <aside className="w-56 hidden md:block flex-shrink-0 sticky top-24 md:top-32 h-[calc(100vh-120px)] md:h-[calc(100vh-140px)] overflow-y-auto select-none custom-scrollbar pr-2">
                        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('menu.categories')}</h2>
                        <nav className="space-y-1">
                            {Array.isArray(categories) && categories.map((mainCat) => {
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
                                {t('menu.loading_dishes')}
                            </div>
                        ) : (() => {
                            // Фільтрація страв
                            const filteredDishesByCategory = allDishesByCategory.map(categoryData => {
                                const filteredDishes = categoryData.dishes.filter(dish => {
                                    // Пошук за назвою та описом
                                    // API вже повертає локалізовані дані, тому використовуємо name та description
                                    if (searchQuery) {
                                        const query = searchQuery.toLowerCase();
                                        const dishName = dish.name || '';
                                        const dishDesc = dish.description || '';
                                        const matchesSearch = 
                                            dishName.toLowerCase().includes(query) ||
                                            dishDesc.toLowerCase().includes(query);
                                        if (!matchesSearch) return false;
                                    }

                                    // Фільтр за ціною
                                    if (priceFilter.min && dish.price < parseFloat(priceFilter.min)) {
                                        return false;
                                    }
                                    if (priceFilter.max && dish.price > parseFloat(priceFilter.max)) {
                                        return false;
                                    }

                                    // Фільтр за калорійністю
                                    if (caloriesFilter.min && (!dish.calories || dish.calories < parseFloat(caloriesFilter.min))) {
                                        return false;
                                    }
                                    if (caloriesFilter.max && (!dish.calories || dish.calories > parseFloat(caloriesFilter.max))) {
                                        return false;
                                    }

                                    // Фільтр за алергенами - приховуємо страви, які містять вибрані алергени
                                    if (excludedAllergens.length > 0) {
                                        // Якщо у страви немає алергенів, вона залишається видимою
                                        if (!dish.allergens || dish.allergens.trim() === '') {
                                            // Страва без алергенів - показуємо
                                        } else {
                                            // Нормалізуємо рядок алергенів: видаляємо зайві пробіли та переводимо в нижній регістр
                                            const normalizedDishAllergens = dish.allergens
                                                .split(',')
                                                .map(a => a.trim().toLowerCase())
                                                .filter(a => a.length > 0);
                                            
                                            // Нормалізуємо вибрані алергени
                                            const normalizedExcluded = excludedAllergens.map(a => a.trim().toLowerCase());
                                            
                                            // Перевіряємо, чи є хоча б один вибраний алерген у страві
                                            const hasExcludedAllergen = normalizedExcluded.some(excluded => {
                                                // Перевіряємо кожен алерген страви
                                                return normalizedDishAllergens.some(dishAllergen => {
                                                    // Точне співпадіння
                                                    if (dishAllergen === excluded) {
                                                        console.log(`[Allergen Filter] Exact match: "${dishAllergen}" === "${excluded}" for dish "${dish.name}"`);
                                                        return true;
                                                    }
                                                    // Перевіряємо, чи містить алерген страви вибраний алерген
                                                    // Наприклад: "молочні продукти" містить "молочні"
                                                    if (dishAllergen.includes(excluded)) {
                                                        console.log(`[Allergen Filter] Contains match: "${dishAllergen}" includes "${excluded}" for dish "${dish.name}"`);
                                                        return true;
                                                    }
                                                    // Перевіряємо навпаки (на випадок, якщо назви трохи відрізняються)
                                                    if (excluded.includes(dishAllergen)) {
                                                        console.log(`[Allergen Filter] Reverse match: "${excluded}" includes "${dishAllergen}" for dish "${dish.name}"`);
                                                        return true;
                                                    }
                                                    return false;
                                                });
                                            });
                                            
                                            // Якщо знайдено вибраний алерген - приховуємо страву
                                            if (hasExcludedAllergen) {
                                                console.log(`[Allergen Filter] Hiding dish "${dish.name}" with allergens: "${dish.allergens}"`);
                                                return false;
                                            }
                                        }
                                    }

                                    return true;
                                });

                                return {
                                    ...categoryData,
                                    dishes: filteredDishes
                                };
                            }).filter(categoryData => categoryData.dishes.length > 0); // Прибираємо категорії без страв

                            if (filteredDishesByCategory.length === 0) {
                                return (
                                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                        <p className="text-lg mb-2">{t('menu.no_dishes_found')}</p>
                                        <p className="text-sm">{t('menu.try_changing_search')}</p>
                                    </div>
                                );
                            }

                            return (
                                <div className="space-y-12">
                                    {filteredDishesByCategory.map((categoryData) => {
                                        const categoryId = `category-${categoryData.categoryName}`;
                                        return (
                                            <div
                                                key={categoryData.categoryId}
                                                id={categoryId}
                                                ref={(el) => (categoryRefs.current[categoryId] = el)}
                                                className="scroll-mt-24"
                                            >
                                                {/* Заголовок категорії */}
                                                <div className="mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-200 dark:border-gray-700">
                                                    <div className="flex items-center justify-between mb-2 gap-2">
                                                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate flex-1">
                                                            {categoryData.categoryName}
                                                            <span className="ml-2 text-sm font-normal text-gray-700 dark:text-gray-300">
                                                                ({categoryData.dishes.length})
                                                            </span>
                                                        </h2>
                                                    </div>
                                                </div>

                                                {/* Страви категорії */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                                    {categoryData.dishes.map((dish) => (
                                                        <MenuItem
                                                            key={dish.id}
                                                            dish={dish}
                                                            restaurantId={restaurantId}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })()}
                    </main>
                </div>

                <Footer />
            </div>
        </>
    );
}

export default function MenuSecondaryPage() {
    // Прибрали Suspense, щоб уникнути помилок гідрації з i18n
    return <MenuSecondaryContent />;
}
