// app/partners/page.js
'use client';

// 1. Імпортуємо useState та ProfileModal
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../components/Header'; // Ваш Header.tsx
import Footer from '../components/Footer';
import RestaurantCard from '../components/RestaurantCard';
import ProfileModal from '../components/ProfileModal'; // ⬅️ 1. ІМПОРТ МОДАЛКИ

// (JSDoc та StarRating залишаємо без змін)
/**
 * @typedef {object} RestaurantPreview
 * @property {number} id
 * @property {string} name
 * @property {string} [description]
 * @property {string} [address]
 * @property {string} [logoUrl]
 * @property {string} [bannerUrl]
 */
const StarRating = ({ rating }) => {
    const stars = [];
    const maxStars = 5;
    for (let i = 1; i <= maxStars; i++) {
        stars.push(
            <svg key={i} className={`w-4 h-4 ${i <= rating ? 'text-yellow-500' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.071 3.292a1 1 0 00.95.695h3.46c.969 0 1.371 1.24.588 1.81l-2.8 2.031a1 1 0 00-.364 1.118l1.071 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.031a1 1 0 00-1.176 0l-2.8 2.031c-.784.57-1.84-.197-1.54-1.118l1.071-3.292a1 1 0 00-.364-1.118l-2.8-2.031c-.783-.57-.381-1.81.588-1.81h3.46a1 1 0 00.95-.695l1.07-3.292z" />
            </svg>
        );
    }
    return <div className="flex">{stars}</div>;
};


export default function PartnersPage() {
    // 2. Додайте стан для модального вікна
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const [restaurants, setRestaurants] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const defaultBanner = '/images/default_banner.jpg';
    const defaultLogo = '/images/default_logo.png';

    // Завантаження даних
    useEffect(() => {
        setIsLoading(true);
        fetch('/api/partners') // Використовуємо ваш API
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch partners data.');
                return res.json();
            })
            .then(data => {
                setRestaurants(data);
                setIsLoading(false);
            })
            .catch(err => {
                setError('Не вдалося завантажити список ресторанів.');
                setIsLoading(false);
            });
    }, []);

    const renderStarRating = (rating) => <StarRating rating={rating} />;


    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">

            {/* 3. Передайте функцію для відкриття модалки в Header */}
            <Header 
                breadcrumpText="Breadcrumb"
                onProfileClick={() => setIsProfileOpen(true)} 
            />

            {/* 4. Додайте ProfileModal сюди, щоб він міг рендеритись */}
            <ProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
            />

            {/* ОСНОВНИЙ КОНТЕНТ */}
            <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
                    Усі Партнери
                </h1>

                {isLoading ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-10">Завантаження...</div>
                ) : error ? (
                    <div className="text-center text-red-600 dark:text-red-400 py-10">{error}</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {restaurants.map((restaurant) => (
                            <RestaurantCard
                                key={restaurant.id}
                                restaurant={restaurant}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* Футер */}
            <Footer />
        </div>
    );
}