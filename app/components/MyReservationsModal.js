'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Trash2, AlertCircle } from 'lucide-react';
import Image from 'next/image';

export default function MyReservationsModal({ isOpen, onClose }) {
    const [reservations, setReservations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchReservations();
        }
    }, [isOpen]);

    const fetchReservations = async () => {
        setIsLoading(true);
        setError('');
        try {
            const res = await fetch('/api/reservations/my');
            if (!res.ok) {
                throw new Error('Не вдалося завантажити бронювання');
            }
            const data = await res.json();
            setReservations(data);
        } catch (error) {
            console.error('Error fetching reservations:', error);
            setError('Помилка завантаження бронювань');
        } finally {
            setIsLoading(false);
        }
    };

    const cancelReservation = async (reservationId, restaurantId) => {
        if (!confirm('Ви впевнені, що хочете скасувати це бронювання?')) {
            return;
        }

        try {
            const res = await fetch(`/api/reservations/${restaurantId}/${reservationId}`, {
                method: 'DELETE'
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Не вдалося скасувати бронювання');
            }

            // Оновлюємо список бронювань
            fetchReservations();
        } catch (error) {
            setError(error.message || 'Помилка скасування бронювання');
        }
    };

    if (!isOpen) return null;

    const now = new Date();

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Мої бронювання</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                    >
                        <X size={24} className="text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 flex items-center gap-2">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400">Завантаження...</p>
                    </div>
                ) : reservations.length === 0 ? (
                    <div className="text-center py-12">
                        <Calendar size={64} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-lg">У вас немає бронювань</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reservations.map((reservation) => {
                            const reservedDate = new Date(reservation.reservedAt);
                            const isPast = reservedDate < now;
                            const isToday = reservedDate.toDateString() === now.toDateString();

                            return (
                                <div
                                    key={reservation.id}
                                    className={`p-4 rounded-lg border-2 ${
                                        isPast
                                            ? 'bg-gray-50 dark:bg-gray-900/50 border-gray-300 dark:border-gray-700 opacity-60'
                                            : isToday
                                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            {/* Ресторан */}
                                            <div className="flex items-center gap-3 mb-3">
                                                {reservation.restaurant?.logoUrl && (
                                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                                                        <Image
                                                            src={reservation.restaurant.logoUrl}
                                                            alt={reservation.restaurant.name || 'Ресторан'}
                                                            width={48}
                                                            height={48}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                )}
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                                        {reservation.restaurant?.name || 'Ресторан'}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        <MapPin size={14} className="inline mr-1" />
                                                        Столик {reservation.table?.number}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Дата та час */}
                                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                <div className="flex items-center gap-1">
                                                    <Calendar size={16} />
                                                    <span>{reservedDate.toLocaleDateString('uk-UA', { 
                                                        weekday: 'short',
                                                        day: 'numeric', 
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock size={16} />
                                                    <span>{reservedDate.toLocaleTimeString('uk-UA', { 
                                                        hour: '2-digit', 
                                                        minute: '2-digit' 
                                                    })}</span>
                                                </div>
                                            </div>

                                            {/* Додаткова інформація */}
                                            {(reservation.customerName || reservation.customerPhone || reservation.notes) && (
                                                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-1 text-sm">
                                                    {reservation.customerName && (
                                                        <p className="text-gray-600 dark:text-gray-400">
                                                            <span className="font-medium">Ім'я:</span> {reservation.customerName}
                                                        </p>
                                                    )}
                                                    {reservation.customerPhone && (
                                                        <p className="text-gray-600 dark:text-gray-400">
                                                            <span className="font-medium">Телефон:</span> {reservation.customerPhone}
                                                        </p>
                                                    )}
                                                    {reservation.notes && (
                                                        <p className="text-gray-600 dark:text-gray-400">
                                                            <span className="font-medium">Примітка:</span> {reservation.notes}
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {/* Статус */}
                                            {isPast && (
                                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                                                    (Минуле бронювання)
                                                </p>
                                            )}
                                            {isToday && !isPast && (
                                                <p className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
                                                    Сьогодні
                                                </p>
                                            )}
                                        </div>

                                        {/* Кнопка скасування */}
                                        {!isPast && (
                                            <button
                                                onClick={() => cancelReservation(reservation.id, reservation.restaurantId)}
                                                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition flex-shrink-0"
                                                title="Скасувати бронювання"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}


