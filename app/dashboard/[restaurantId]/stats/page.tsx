// app/dashboard/[restaurantId]/stats/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import AnalyticsCard from '@/app/components/AnalyticsCard';
import { DollarSign, CheckCircle, BarChartHorizontal } from 'lucide-react';

// --- ТИПИ ---
// (Тут нічого не змінилось)
interface TopDish {
    dishId: string;
    name: string;
    quantitySold: number | null;
}

interface RestaurantStats {
    totalRevenue: number;
    completedOrders: number;
    totalOrdersAllTime: number;
    topDishes: TopDish[];
}

export default function StatsPage() {
    const params = useParams();
    const restaurantId = params.restaurantId as string;

    const [stats, setStats] = useState<RestaurantStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!restaurantId) return;

        const fetchStats = async () => {
            try {
                setIsLoading(true);
                const res = await fetch(
                    `/api/manage/restaurants/${restaurantId}/stats`
                );
                if (!res.ok) {
                    throw new Error('Не вдалося завантажити статистику');
                }
                const data: RestaurantStats = await res.json();
                setStats(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, [restaurantId]);

    if (isLoading) {
        return <div className="text-gray-500">Завантаження статистики...</div>;
    }

    if (error) {
        return <div className="text-red-500">Помилка: {error}</div>;
    }

    if (!stats) {
        return <div>Немає даних для відображення.</div>;
    }

    // Виправлено: прибираємо ділення на 100
    const formattedRevenue = new Intl.NumberFormat('uk-UA', {
        style: 'currency',
        currency: 'UAH',
    }).format(stats.totalRevenue);

    return (
        <div>
            {/* 2. Блок з основними показниками - ВИПРАВЛЕНО */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

                {/* Картка 1: Додано icon та valueColor, видалено description */}
                <AnalyticsCard
                    title="Загальний дохід"
                    value={formattedRevenue}
                    icon={<DollarSign size={20} />}
                    valueColor="text-green-600"
                />

                {/* Картка 2: Додано icon та valueColor, видалено description */}
                <AnalyticsCard
                    title="Завершено замовлень"
                    value={stats.completedOrders.toString()}
                    icon={<CheckCircle size={20} />}
                    valueColor="text-indigo-600"
                />

                {/* Картка 3: Додано icon та valueColor, видалено description */}
                <AnalyticsCard
                    title="Всього замовлень"
                    value={stats.totalOrdersAllTime.toString()}
                    icon={<BarChartHorizontal size={20} />}
                    valueColor="text-gray-800"
                />
            </div>

            {/* 3. Блок з найпопулярнішими стравами (тут нічого не змінилось) */}
            <div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                    Топ-5 страв
                </h2>
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {stats.topDishes.length > 0 ? (
                            stats.topDishes.map((dish, index) => (
                                <li
                                    key={dish.dishId}
                                    className="flex justify-between items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                  <span className="font-medium text-gray-900 dark:text-white">
                    {index + 1}. {dish.name}
                  </span>
                                    <span className="text-gray-600 dark:text-gray-300">
                    Продано: <strong>{dish.quantitySold}</strong>
                  </span>
                                </li>
                            ))
                        ) : (
                            <p className="p-4 text-center text-gray-500 dark:text-gray-400">
                                Ще не було продано жодної страви.
                            </p>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}