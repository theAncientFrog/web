// This is a file representation.
// You can directly edit, format, and save this code.
// Your changes will be reflected in the user's view.

'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import { Settings, ArrowLeft, Utensils, Coffee, Wine, Package, User } from 'lucide-react';
import ProfileModal from '../../components/ProfileModal';
import MenuSettingsModal from '../../components/MenuSettingsModal';
import TableReservationModal from '../../components/TableReservationModal';
import TableNumberInputModal from '../../components/TableNumberInputModal';
import MyReservationsModal from '../../components/MyReservationsModal';
import Footer from '../../components/Footer';

// Мапування іконок для категорій (підтримує обидві мови)
const CATEGORY_ICONS = {
    // Українські назви
    'Їжа': Utensils,
    'Кухня': Utensils,
    'Напої': Coffee,
    'Алкоголь': Wine,
    'Мерч': Package,
    'Алкогольні напої': Wine,
    'Безалкогольні напої': Coffee,
    'Кава': Coffee,
    'Чай': Coffee,
    'Випічка': Package,
    'Десерти': Package,
    'Снеки': Package,
    // Англійські назви
    'Food': Utensils,
    'Beverages': Coffee,
    'Alcoholic Beverages': Wine,
    'Merchandise': Package,
    'Coffee': Coffee,
    'Tea': Coffee,
    'Soft Drinks': Coffee,
    'Beer': Wine,
    'Wines': Wine,
    'Cocktails': Wine,
    // Додайте інші категорії за потребою
};

const getIconForCategory = (categoryName) => {
    return CATEGORY_ICONS[categoryName] || Utensils; // Дефолтна іконка
};

export default function MenuPage() {
    const { t, i18n } = useTranslation();
    const currentLang = i18n.language || 'ua';
    const isEnglish = currentLang.startsWith('en');
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
    const [isTableNumberModalOpen, setIsTableNumberModalOpen] = useState(false);
    const [isMyReservationsModalOpen, setIsMyReservationsModalOpen] = useState(false);
    const [restaurant, setRestaurant] = useState(null);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [categories, setCategories] = useState([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);

    const [loyalty, setLoyalty] = useState({ level: 1, progress: 0 });
    const [isLoadingLoyalty, setIsLoadingLoyalty] = useState(true);

    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const restaurantId = params.restaurantId;

    const restaurantRating = '★★★★☆';
    const defaultPlaceholder = '/images/placeholder.jpg';

    const userName = session?.user?.name || 'Клієнт';
    const profileInitial = userName.charAt(0);
    const userImage = session?.user?.image;


    useEffect(() => {
        if (restaurantId) {
            setIsLoadingData(true);
            const langParam = isEnglish ? '?lang=en' : '?lang=ua';
            fetch(`/api/menu/${restaurantId}${langParam}`, {
                headers: {
                    'x-lang': isEnglish ? 'en' : 'ua',
                    'Accept-Language': isEnglish ? 'en' : 'ua',
                }
            })
                .then(res => res.json())
                .then(data => {
                    setRestaurant(data);
                })
                .catch(error => {
                    console.error('Failed to load restaurant data:', error);
                })
                .finally(() => {
                    setIsLoadingData(false);
                });
        }
    }, [restaurantId, isEnglish]);


    useEffect(() => {
        if (restaurantId) {
            setIsLoadingLoyalty(true);
            fetch(`/api/loyalty/${restaurantId}`)
                .then(res => res.json())
                .then(data => {
                    setLoyalty(data);
                })
                .catch(error => {
                    console.error('Failed to load loyalty data:', error);
                    setLoyalty({ level: 1, progress: 0 });
                })
                .finally(() => {
                    setIsLoadingLoyalty(false);
                });
        }
    }, [restaurantId]);

    useEffect(() => {
        if (restaurantId) {
            setIsLoadingCategories(true);
            const langParam = isEnglish ? '&lang=en' : '&lang=ua';
            fetch(`/api/categories?restaurantId=${restaurantId}${langParam}`, {
                headers: {
                    'x-lang': isEnglish ? 'en' : 'ua',
                    'Accept-Language': isEnglish ? 'en' : 'ua',
                }
            })
                .then(res => res.json())
                .then(data => {
                    const formattedCategories = data.map(category => ({
                        name: category.name,
                        icon: getIconForCategory(category.name),
                        link: category.name,
                    }));
                    setCategories(formattedCategories);
                })
                .catch(error => {
                    console.error('Failed to load categories:', error);
                    setCategories([]);
                })
                .finally(() => {
                    setIsLoadingCategories(false);
                });
        }
    }, [restaurantId, isEnglish]);


    // Стан завантаження
    if (status === "loading" || isLoadingData || isLoadingLoyalty || isLoadingCategories) {
        return (
            <main className="w-full min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 justify-center items-center">
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">{t('menu.loading')}</div>
            </main>
        );
    }

    const { name, address, bannerUrl, logoUrl } = restaurant || {};


    return (
        <>
            <ProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
            />
            <MenuSettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />
            <TableReservationModal 
                isOpen={isReservationModalOpen} 
                onClose={() => setIsReservationModalOpen(false)} 
                restaurantId={restaurantId}
            />
            <TableNumberInputModal 
                isOpen={isTableNumberModalOpen} 
                onClose={() => setIsTableNumberModalOpen(false)} 
                restaurantId={restaurantId}
            />
            <MyReservationsModal 
                isOpen={isMyReservationsModalOpen} 
                onClose={() => setIsMyReservationsModalOpen(false)} 
            />

            <main className="w-full min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 justify-start">

                {/* --- 1. ХЕДЕР З ФОНОМ (BANNER) --- */}
                <div className="w-full h-[clamp(200px,30vh,250px)] bg-gray-100 bg-cover bg-center relative flex-shrink-0">
                    <Image
                        src={bannerUrl || defaultPlaceholder}
                        alt="Restaurant Banner"
                        layout="fill"
                        objectFit="cover"
                        className="absolute inset-0"
                    />

                    {/* Накладання іконок */}
                    <div className="absolute inset-x-0 top-0 p-4 sm:p-6 flex justify-between items-center bg-gradient-to-b from-black/30 to-transparent w-full max-w-[1600px] mx-auto">
                        <button 
                            onClick={() => router.back()}
                            className="bg-white/80 text-gray-800 rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-lg sm:text-xl cursor-pointer transition backdrop-blur-sm shadow-md hover:bg-white/95 font-bold"
                        >
                            <ArrowLeft size={24} />
                        </button>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => setIsSettingsOpen(true)}
                                className="bg-white/80 text-gray-800 rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-lg sm:text-xl cursor-pointer transition backdrop-blur-sm shadow-md hover:bg-white/95"
                                title="Налаштування меню"
                            >
                                <Settings size={20} />
                            </button>
                            <button onClick={() => setIsProfileOpen(true)} className="bg-white/80 text-gray-800 rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-lg sm:text-xl cursor-pointer transition backdrop-blur-sm shadow-md hover:bg-white/95 overflow-hidden">
                                {userImage ? (
                                    <Image src={userImage} alt="Profile" width={40} height={40} className="rounded-full object-cover w-full h-full" />
                                ) : (
                                    <span className="font-semibold">{profileInitial}</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- 2. КАРТКА РЕСТОРАНУ --- */}
                <div className="relative z-10 w-full max-w-[1600px] mx-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-5 mx-4 lg:mx-8 -mt-20 sm:-mt-16 z-10 text-left">

                        <div className="flex items-center space-x-4">
                            {/* ЛОГОТИП */}
                            <div className="w-16 h-16 sm:w-16 sm:h-16 rounded-full bg-gray-200 dark:bg-gray-700 border-2 sm:border-4 border-white dark:border-gray-800 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                <Image
                                    src={logoUrl || defaultPlaceholder}
                                    alt="Restaurant Logo"
                                    width={64}
                                    height={64}
                                    className="object-cover w-full h-full"
                                />
                            </div>

                            <div className="flex-grow overflow-hidden">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{name || 'NAZVA'}</h2>
                                <p className="mt-0.5 mb-1 text-yellow-500 dark:text-yellow-400 text-sm">{restaurantRating}</p>
                                <span className="text-sm text-gray-500 dark:text-gray-400 truncate block">{address || t('menu.address_missing')}</span>
                            </div>
                            {/* 💡 --- 3. ОНОВЛЕНО РІВЕНЬ --- */}
                            {status === 'authenticated' && (
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-sm font-bold text-green-600 dark:text-green-400 whitespace-nowrap">
                                        lvl. {loyalty.level}
                                    </span>
                                    {/* Маленькі кнопки справа під рівнем */}
                                    <div className="flex flex-col gap-1">
                                        <button
                                            onClick={() => setIsReservationModalOpen(true)}
                                            className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition whitespace-nowrap"
                                        >
                                            {t('menu.reservation')}
                                        </button>
                                        <button
                                            onClick={() => setIsMyReservationsModalOpen(true)}
                                            className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-md hover:bg-purple-200 dark:hover:bg-purple-900/50 transition whitespace-nowrap"
                                        >
                                            {t('menu.my_reservations')}
                                        </button>
                                    </div>
                                </div>
                            )}
                            {status !== 'authenticated' && (
                                <span className="text-sm font-bold text-green-600 dark:text-green-400 self-start whitespace-nowrap">
                                    lvl. {loyalty.level}
                                </span>
                            )}
                        </div>

                        {/* Прогрес бар */}
                        {status === 'authenticated' && (
                            <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                    {/* 💡 --- 4. ОНОВЛЕНО ПРОГРЕС-БАР --- */}
                                    <div className="bg-green-500 dark:bg-green-600 h-2.5 rounded-full" style={{ width: `${loyalty.progress}%` }}></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- 3. СПИСОК КАТЕГОРІЙ МЕНЮ (ДИНАМІЧНІ КНОПКИ) --- */}
                <div className="w-full mx-auto max-w-[1600px] flex-grow flex flex-col pt-8 px-4 lg:px-8">
                    {categories.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                            {categories.map((category) => {
                            const Icon = category.icon;

                            return (
                                <Link
                                    key={category.name}
                                        href={`/menu-secondary/${restaurantId}?category=${encodeURIComponent(category.link)}`}
                                        className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center shadow-sm hover:shadow-md dark:hover:shadow-lg transition-shadow duration-200 border border-gray-100 dark:border-gray-700"
                                >
                                        <div className="bg-gray-100 dark:bg-gray-700 rounded-md p-2 flex-shrink-0">
                                            <Icon className="w-6 h-6 text-green-700 dark:text-green-400" />
                                    </div>

                                        <span className="text-base font-semibold ml-3 text-gray-800 dark:text-gray-200">
                                        {category.name}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                    ) : (
                        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                            {t('menu.categories_not_found')}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}

