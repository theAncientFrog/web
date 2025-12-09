// app/dashboard/[restaurantId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Pusher from 'pusher-js';
import { useParams } from 'next/navigation';
import { Utensils, Timer, Clock } from 'lucide-react';

// --- ТИПИ ---

// Локальний тип, який використовує UI для відображення
type ItemDetails = {
    name: string;
    quantity: number;
    price: number;
}

// Локальний тип замовлення для UI
type Order = {
    id: number;
    createdAt: string;
    totalPrice: number;
    userName: string;
    items: ItemDetails[];
    status: 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
    tableNumber?: string | null; // 💡 Номер столика
};

// (Припускаємо, що API повертає таку структуру з Prisma)
type ApiOrderResponse = {
    id: number;
    createdAt: string;
    totalPrice: number;
    status: Order['status'];
    tableNumber?: string | null; // 💡 Номер столика
    user: {
        name: string | null;
    };
    items: {
        quantity: number;
        priceAtPurchase: number;
        dish: {
            name: string;
        };
    }[];
};

type NewOrderPusherPayload = {
    message: string;
    order: {
        id: number;
        totalPrice: number;
        status: 'PENDING';
        createdAt: string;
        tableNumber?: string | null;
        items: {
            name: string;
            quantity: number;
            priceAtPurchase: number;
        }[];
    };
    userName: string;
};

// --- КОНСТАНТИ ТА ХЕЛПЕРИ ---

const getStatusColor = (status: Order['status']) => {
    switch (status) {
        case 'READY': return 'text-green-600 bg-green-100';
        case 'PREPARING': return 'text-yellow-600 bg-yellow-100';
        case 'COMPLETED': return 'text-gray-600 bg-gray-100';
        case 'CANCELLED': return 'text-red-600 bg-red-100';
        default: return 'text-red-600 bg-red-100';
    }
};

const STATUS_PRIORITY = {
    'READY': 1,
    'PREPARING': 2,
    'PENDING': 3,
    'COMPLETED': 4,
    'CANCELLED': 5,
};

const sortOrders = (orders: Order[]) => {
    return [...orders].sort((a, b) => {
        const priorityA = STATUS_PRIORITY[a.status];
        const priorityB = STATUS_PRIORITY[b.status];

        if (priorityA !== priorityB) {
            return priorityA - priorityB;
        }

        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
};


export default function RestaurantDashboard() {
    const params = useParams();
    const restaurantId = params.restaurantId as string;

    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 1. Завантаження історії та налаштування Pusher
    useEffect(() => {
        if (!restaurantId) return;

        const channelName = `restaurant-${restaurantId}`;

        // --- A. Завантаження історії з БД ---
        const fetchInitialOrders = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/orders/restaurant/${restaurantId}`, {
                    cache: 'no-store'
                });

                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.message || 'Не вдалося завантажити історію замовлень.');
                }

                const data: ApiOrderResponse[] = await res.json();

                const transformedOrders: Order[] = data.map(order => ({
                    id: order.id,
                    createdAt: order.createdAt,
                    totalPrice: order.totalPrice,
                    status: order.status,
                    tableNumber: order.tableNumber || null, // 💡 Номер столика
                    // Мапимо вкладені дані
                    userName: order.user?.name || 'Клієнт', // ⬅️ з order.user.name
                    items: order.items.map(item => ({     // ⬅️ з order.items
                        name: item.dish.name,
                        quantity: item.quantity,
                        price: item.priceAtPurchase
                    }))
                }));

                setOrders(sortOrders(transformedOrders));
            } catch (err: any) {
                setError(err.message);
                setOrders([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialOrders();


        // --- B. Налаштування Pusher ---
        const pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        });

        const channel = pusherClient.subscribe(channelName);

        channel.bind('new-order', (data: NewOrderPusherPayload) => {
            console.log('Pusher: Отримано нове замовлення!', data);

            // Розпаковуємо дані згідно типу NewOrderPusherPayload
            const newOrder: Order = {
                id: data.order.id,
                createdAt: data.order.createdAt,
                totalPrice: data.order.totalPrice,
                status: data.order.status, // Це 'PENDING'
                tableNumber: data.order.tableNumber || null,
                userName: data.userName,
                items: data.order.items.map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    price: item.priceAtPurchase
                })),
            };

            setOrders(prev => sortOrders([newOrder, ...prev]));
        });

        // Слухач ОНОВЛЕННЯ СТАТУСУ
        channel.bind('order-status-update', (data: { orderId: number, newStatus: Order['status'] }) => {
            console.log('Pusher: Отримано оновлення статусу!', data);
            setOrders(prev => {
                const updatedOrders = prev.map(order =>
                    order.id === data.orderId ? { ...order, status: data.newStatus } : order
                );
                return sortOrders(updatedOrders);
            });
        });

        // Слухач СКАСУВАННЯ ЗАМОВЛЕННЯ (якщо потрібно окремо)
        channel.bind('order-cancelled', (data: { orderId: number }) => {
            console.log('Pusher: Отримано скасування замовлення!', data);
            setOrders(prev => {
                const updatedOrders = prev.map(order =>
                    order.id === data.orderId ? { ...order, status: 'CANCELLED' as Order['status'] } : order
                );
                return sortOrders(updatedOrders);
            });
        });


        // Cleanup
        return () => {
            channel.unbind_all();
            pusherClient.unsubscribe(channelName);
            pusherClient.disconnect();
        };
    }, [restaurantId]);


    // 3. Зміна статусу
    const handleStatusChange = async (orderId: number, currentStatus: Order['status']) => {
        let newStatus: Order['status'];

        if (currentStatus === 'PENDING') newStatus = 'PREPARING';
        else if (currentStatus === 'PREPARING') newStatus = 'READY';
        else if (currentStatus === 'READY') newStatus = 'COMPLETED';
        else return;

        // 1. Оптимістичне оновлення UI та сортування
        setOrders(prev => {
            const updatedOrders = prev.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            );
            return sortOrders(updatedOrders);
        });

        // 2. Виклик API для збереження та сповіщення
        try {
            const res = await fetch(`/api/manage/order/${orderId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) {
                throw new Error('Не вдалося оновити статус на сервері.');
                // (Тут можна додати логіку відкату стану, якщо запит не вдався)
            }
        } catch (error) {
            console.error("Помилка PUT-запиту:", error);
            // (Логіка відкату)
        }
    };

    // 4. Скасування замовлення
    const handleCancelOrder = async (orderId: number) => {
        if (!confirm('Ви впевнені, що хочете скасувати це замовлення?')) {
            return;
        }

        // 1. Оптимістичне оновлення UI
        setOrders(prev => {
            const updatedOrders = prev.map(order =>
                order.id === orderId ? { ...order, status: 'CANCELLED' as Order['status'] } : order
            );
            return sortOrders(updatedOrders);
        });

        // 2. Виклик API для скасування
        try {
            const res = await fetch(`/api/manage/order/${orderId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'CANCELLED' }),
            });

            if (!res.ok) {
                throw new Error('Не вдалося скасувати замовлення на сервері.');
            }
        } catch (error) {
            console.error("Помилка скасування замовлення:", error);
            alert('Не вдалося скасувати замовлення. Спробуйте ще раз.');
            // Відкат стану - перезавантажуємо замовлення
            const res = await fetch(`/api/orders/restaurant/${restaurantId}`, {
                cache: 'no-store'
            });
            if (res.ok) {
                const data: ApiOrderResponse[] = await res.json();
                const transformedOrders: Order[] = data.map(order => ({
                    id: order.id,
                    createdAt: order.createdAt,
                    totalPrice: order.totalPrice,
                    status: order.status as Order['status'],
                    tableNumber: order.tableNumber || null, // 💡 Номер столика
                    userName: order.user?.name || 'Клієнт',
                    items: order.items.map(item => ({
                        name: item.dish.name,
                        quantity: item.quantity,
                        price: item.priceAtPurchase
                    }))
                }));
                setOrders(sortOrders(transformedOrders));
            }
        }
    };

    // --- РЕНДЕР ---

    if (isLoading) return <div className="p-8 text-center text-gray-500">Завантаження історії замовлень...</div>;
    if (error) return <div className="p-8 text-center text-red-600">Помилка: {error}</div>;

    return (
        <main className="w-full min-h-screen bg-gray-50 p-3 sm:p-4 md:p-8">
            <header className="mb-4 sm:mb-6 md:mb-8">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3 flex-wrap">
                    <Utensils size={24} className="sm:w-8 sm:h-8 text-indigo-600 flex-shrink-0"/>
                    <span className="break-words">Кухня (Дашборд) - Ресторан #{restaurantId}</span>
                </h1>
                <p className="text-sm sm:text-base text-gray-500 mt-1">Очікують на прийняття: {orders.filter(o => o.status === 'PENDING').length || 0}</p>
            </header>

            {/* Список замовлень */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
                {orders.length > 0 ? (
                    orders.map((order) => (
                        // Картка замовлення
                        <div key={order.id} className={`bg-white rounded-xl shadow-lg border flex flex-col p-4 sm:p-5 ${order.status === 'PENDING' ? 'border-red-200' : 'border-gray-100'}`}>

                            {/* Хедер картки */}
                            <div className="mb-3 sm:mb-4">
                                <div className={`inline-flex items-center text-xs font-semibold px-2 sm:px-3 py-1 rounded-full ${getStatusColor(order.status)} mb-2`}>
                                    {order.status === 'PENDING' ? <Clock size={12} className="sm:w-3.5 sm:h-3.5 mr-1"/> : <Timer size={12} className="sm:w-3.5 sm:h-3.5 mr-1"/>}
                                    <span className="text-xs">{order.status}</span>
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold mb-1">Замовлення #{order.id}</h3>
                                <p className="text-xs sm:text-sm text-gray-600 truncate">Клієнт: {order.userName}</p>
                                {order.tableNumber && (
                                    <p className="text-xs sm:text-sm text-indigo-600 font-medium mt-1">Столик: {order.tableNumber}</p>
                                )}
                                <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleTimeString('uk-UA')}</p>
                            </div>

                            {/* Деталі замовлення */}
                            <div className="flex-grow py-4 border-y border-gray-100">
                                <ul className="space-y-1 text-sm max-h-40 overflow-y-auto pr-2">
                                    {order.items.map((item, index) => (
                                        <li key={index} className="flex justify-between items-start gap-2">
                                            <span className="text-gray-700 font-medium break-words pr-2">{item.name} (x{item.quantity})</span>
                                            <span className="text-gray-500 font-semibold flex-shrink-0">{item.price.toFixed(2)} грн</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Футер картки */}
                            <div className="mt-3 sm:mt-4 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-base font-extrabold text-indigo-600">
                                      Всього: {order.totalPrice.toFixed(2)} грн
                                    </span>
                                </div>

                                {/* Кнопки дій */}
                                <div className="flex gap-2 w-full">
                                    {order.status === 'PENDING' && (
                                        <>
                                            <button
                                                onClick={() => handleStatusChange(order.id, 'PENDING')}
                                                className="flex-1 bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition shadow-sm"
                                            >
                                                Прийняти
                                            </button>
                                            <button
                                                onClick={() => handleCancelOrder(order.id)}
                                                className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition shadow-sm"
                                            >
                                                Скасувати
                                            </button>
                                        </>
                                    )}
                                    {order.status === 'PREPARING' && (
                                        <>
                                            <button
                                                onClick={() => handleStatusChange(order.id, 'PREPARING')}
                                                className="flex-1 bg-indigo-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-600 transition shadow-sm"
                                            >
                                                Готово
                                            </button>
                                            <button
                                                onClick={() => handleCancelOrder(order.id)}
                                                className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition shadow-sm"
                                            >
                                                Скасувати
                                            </button>
                                        </>
                                    )}
                                    {order.status === 'READY' && (
                                        <>
                                            <button
                                                onClick={() => handleStatusChange(order.id, 'READY')}
                                                className="flex-1 bg-gray-400 text-white px-3 py-2 rounded-lg text-sm font-semibold cursor-pointer hover:bg-gray-500 transition shadow-sm"
                                            >
                                                Видати
                                            </button>
                                            <button
                                                onClick={() => handleCancelOrder(order.id)}
                                                className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition shadow-sm"
                                            >
                                                Скасувати
                                            </button>
                                        </>
                                    )}
                                    {order.status === 'COMPLETED' && (
                                        <span className="text-sm font-medium text-gray-500">Завершено</span>
                                    )}
                                    {order.status === 'CANCELLED' && (
                                        <span className="text-sm font-medium text-red-500">Скасовано</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="col-span-full text-center text-gray-500 p-10 bg-white rounded-xl shadow-inner">Нових замовлень не надходило.</p>
                )}
            </div>
        </main>
    );
}