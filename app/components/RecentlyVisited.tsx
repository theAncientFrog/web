// app/components/RecentlyVisited.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react'; 

// Тип для даних з API
interface RecentRestaurant {
    id: number;
    name: string;
    logoUrl?: string;
    lastVisited: string;
}

const MOCK_COLORS = ['bg-black', 'bg-green-600', 'bg-red-600', 'bg-indigo-600', 'bg-teal-600'];
const DEFAULT_LOGO_URL = '/images/nazva_logo.png'; // Заглушка

export default function RecentlyVisited() {
    const { status } = useSession(); 
    const [recent, setRecent] = useState<RecentRestaurant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const formatDate = (isoString: string) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: '2-digit' });
    };

    useEffect(() => {
        if (status === 'unauthenticated') {
            setIsLoading(false);
            return;
        }
        if (status !== 'authenticated') {
            return;
        }

        fetch('/api/recent-restaurants')
            .then(res => {
                if (res.status === 401) return [];
                if (!res.ok) throw new Error('Не вдалося завантажити дані.');
                return res.json();
            })
            .then(data => {
                setRecent(data);
            })
            .catch(err => {
                setError('Помилка завантаження історії.');
                console.error(err);
                setRecent([]); 
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [status]);


    return (
        <section className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-6">Нещодавно відвідані</h2>
            
            {isLoading ? (
                <div className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">Завантаження історії...</div>
            ) : error ? (
                <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
            ) : recent.length === 0 ? (
                 <div className="text-gray-500 dark:text-gray-400 text-sm">Немає недавніх відвідувань.</div>
            ) : (
                <div className="flex space-x-4 sm:space-x-6 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
                    {recent.map((item, index) => {
                        const colorClass = MOCK_COLORS[index % MOCK_COLORS.length];
                        const dateText = formatDate(item.lastVisited);
                        
                        return (
                            <Link 
                                key={item.id}
                                href={`/menu/${item.id}`} 
                                className="flex flex-col items-center no-underline text-gray-800 dark:text-gray-200 transition hover:opacity-80 flex-shrink-0"
                            >
                                <div className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl overflow-hidden shadow-md dark:shadow-lg mb-2 ${colorClass} flex items-center justify-center`}>
                                    {/* ⬅️ Використовуємо logoUrl з API */}
                                    <Image
                                        src={item.logoUrl || DEFAULT_LOGO_URL}
                                        alt={item.name}
                                        width={80}
                                        height={80}
                                        className="object-cover w-full h-full opacity-60"
                                    />
                                </div>
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 text-center">
                                    {dateText}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            )}
        </section>
    );
}