// app/dashboard/[restaurantId]/layout.tsx
'use client';

import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link'; // 1. Імпортуємо Link
import { ReactNode } from 'react';
// 2. Імпортуємо іконку "назад"
import { Utensils, BarChart2, ArrowLeft } from 'lucide-react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const params = useParams();
    const pathname = usePathname();
    const restaurantId = params.restaurantId;

    // Базовий URL для навігації
    const baseUrl = `/dashboard/${restaurantId}`;

    const tabs = [
        {
            name: 'Замовлення',
            href: baseUrl,
            icon: Utensils,
            isActive: pathname === baseUrl,
        },
        {
            name: 'Статистика',
            href: `${baseUrl}/stats`,
            icon: BarChart2,
            isActive: pathname === `${baseUrl}/stats`,
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">

            {/* 1. Спільний Заголовок */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="container mx-auto px-4 sm:px-8 py-6 max-w-7xl">

                    {/* 3. ✅ ДОДАНО: Кнопка "Назад" */}
                    <Link
                        href="/manage/restaurants"
                        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4"
                    >
                        <ArrowLeft size={16} />
                        До списку ресторанів
                    </Link>

                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Панель Менеджера
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Ресторан #{restaurantId}
                        </p>
                    </div>
                </div>
            </header>

            {/* 2. Навігація по Вкладках (Без змін) */}
            <nav className="bg-white shadow-sm -mt-px">
                <div className="container mx-auto px-4 sm:px-8 max-w-7xl">
                    <div className="flex border-b border-gray-200">
                        {tabs.map((tab) => (
                            <Link
                                key={tab.name}
                                href={tab.href}
                                className={`
                  flex items-center gap-2
                  py-4 px-6
                  border-b-2
                  text-sm font-medium
                  transition-colors
                  ${
                                    tab.isActive
                                        ? 'border-indigo-600 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }
                `}
                            >
                                <tab.icon size={18} />
                                {tab.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </nav>

            {/* 3. Вміст (Без змін) */}
            <main className="container mx-auto px-4 sm:px-8 py-8 max-w-7xl">
                {children}
            </main>
        </div>
    );
}