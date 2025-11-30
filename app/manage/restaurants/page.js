'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { Settings, Trash2, User, Plus, LogOut } from 'lucide-react';
// 💡 1. Імпортуємо модальне вікно
import AddRestaurantModal from '../../components/AddRestaurantModal';

export default function ManageRestaurantsPage() {
    // 💡 2. Додаємо стан для модального вікна
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [restaurants, setRestaurants] = useState([]);
    const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'authenticated') {
            setIsLoadingRestaurants(true);
            setFetchError(null);

            // Викликаємо API для отримання ресторанів власника
            fetch('/api/manage/restaurants')
                .then((res) => {
                    if (!res.ok) {
                        throw new Error(`Failed to fetch restaurants: ${res.status}`);
                    }
                    return res.json();
                })
                .then((data) => {
                    setRestaurants(data);
                })
                .catch((error) => {
                    console.error('Error fetching restaurants:', error);
                    setFetchError(error.message);
                })
                .finally(() => {
                    setIsLoadingRestaurants(false);
                });
        }

        // Очищаємо список, якщо статус змінився
        if (status === 'unauthenticated') {
            setRestaurants([]);
            setIsLoadingRestaurants(false);
        }
    }, [status]);

    if (status === 'loading') {
        return (
            <main className="w-full min-h-screen flex flex-col bg-white justify-start">
                <div className="p-8 text-center text-gray-500">Завантаження сесії...</div>
            </main>
        );
    }

    if (status === 'unauthenticated') {
        return (
            <main className="w-full min-h-screen flex flex-col bg-white justify-start">
                <div className="p-8 text-center text-gray-500">Доступ заборонено.</div>
            </main>
        );
    }

    // Функція виходу з системи
    const handleSignOut = () => {
        signOut({ callbackUrl: '/login' });
    };

    // 💡 3. Обробник для оновлення UI після додавання
    const handleRestaurantAdded = (newRestaurant) => {
        setRestaurants((prev) => [newRestaurant, ...prev]);
        // Модальне вікно закриється саме (через його внутрішній handleClose)
    };


    return (
        <>
            {/* 💡 4. Рендеримо модальне вікно */}
            <AddRestaurantModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onRestaurantAdded={handleRestaurantAdded}
            />

            <main className="w-full min-h-screen flex flex-col bg-white justify-start">
                <div className="max-w-6xl mx-auto w-full px-4 sm:px-8 py-6 sm:py-8">
                    <header className="flex justify-between items-center mb-8 pb-6 border-b border-gray-200 flex-wrap gap-4">
                        <div className="manageHeaderTitle">
                            <h1 className="m-0 text-sm font-semibold tracking-wider text-gray-900 uppercase">MANAGER MODE</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                <User size={16} className="text-gray-500" />
                                <span>{session?.user?.email}</span>
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="text-gray-500 hover:text-red-600 transition flex items-center gap-1 text-sm font-medium"
                                title="Вийти"
                            >
                                <LogOut size={18} />
                                <span className="hidden sm:inline">Вийти</span>
                            </button>
                        </div>
                    </header>

                    <section className="manageSection">
                        <div className="flex justify-between items-start mb-6 gap-4 flex-wrap">
                            <div>
                                <h2 className="m-0 mb-1 text-2xl sm:text-3xl font-bold">My Restaurants</h2>
                                <p className="m-0 text-gray-500 text-base">Manage your restaurants and menus</p>
                            </div>
                            {/* 💡 5. Додаємо onClick до кнопки */}
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-indigo-600 text-white border-none rounded-lg px-5 py-3 text-sm sm:text-base font-medium cursor-pointer whitespace-nowrap transition hover:bg-indigo-700 flex items-center gap-2"
                            >
                                <Plus size={20} />
                                Add Restaurant
                            </button>
                        </div>

                        <div className="flex flex-col gap-4 sm:gap-6">
                            {/* ⬅️ (Логіка рендерингу списку залишається без змін) */}
                            {isLoadingRestaurants ? (
                                <p className="text-center text-gray-500 p-8">Завантаження ресторанів...</p>
                            ) : fetchError ? (
                                <p className="text-center text-red-600 p-8">Помилка завантаження: {fetchError}</p>
                            ) : Array.isArray(restaurants) && restaurants.length > 0 ? (
                                restaurants.map((restaurant) => (
                                    <div key={restaurant.id} className="bg-white rounded-xl shadow-lg flex flex-col md:flex-row md:items-center gap-4 md:gap-6 p-4 md:p-6 overflow-hidden">
                                        {/* manageRestaurantImage */}
                                        <div className="relative w-full h-48 md:w-48 md:h-28 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                            <Image
                                                src={restaurant.bannerUrl || restaurant.logoUrl || '/images/placeholder.jpg'}
                                                alt={restaurant.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        {/* manageRestaurantInfo */}
                                        <div className="flex-grow text-left">
                                            <h3 className="m-0 mb-2 text-lg sm:text-xl font-semibold">{restaurant.name}</h3>
                                            <p className="m-0 mb-4 text-gray-500 text-sm line-clamp-2">{restaurant.description || 'No description'}</p>
                                            <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                                                <span><strong className="text-black">{restaurant.categoriesCount || 0}</strong> Categories</span>
                                                <span><strong className="text-black">{restaurant.ordersCount || 0}</strong> Orders</span>
                                                <span><strong className="text-black">{new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(restaurant.revenue || 0)}</strong> Revenue</span>
                                            </div>
                                        </div>
                                        {/* manageRestaurantActions */}
                                        <div className="flex items-center gap-4 flex-shrink-0 mt-4 pt-4 border-t border-gray-100 justify-between md:border-t-0 md:pt-0 md:mt-0 md:justify-end">
                                            <button className="text-xl cursor-pointer text-gray-500 transition hover:text-gray-800">
                                                <Settings size={20} />
                                            </button>
                                            <button className="text-xl cursor-pointer text-gray-500 transition hover:text-red-500">
                                                <Trash2 size={20} />
                                            </button>
                                            <Link
                                                href={`/dashboard/${restaurant.id}`}
                                                className="bg-gray-100 text-indigo-600 rounded-lg px-3 py-2 text-sm font-medium cursor-pointer no-underline whitespace-nowrap transition hover:bg-gray-200 ml-auto md:ml-0"
                                            >
                                                KITCHEN
                                            </Link>
                                            <Link
                                                href={`/manage/restaurants/${restaurant.id}/categories`}
                                                className="bg-gray-100 text-indigo-600 rounded-lg px-3 py-2 text-sm font-medium cursor-pointer no-underline whitespace-nowrap transition hover:bg-gray-200"
                                            >
                                                MANAGE MENU
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center p-8">You haven't added any restaurants yet.</p>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}
