'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Phone, FileText } from 'lucide-react';
import TimePickerModal from './TimePickerModal';

export default function TableReservationModal({ isOpen, onClose, restaurantId }) {
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingTables, setIsCheckingTables] = useState(false);
    const [hasFreeTables, setHasFreeTables] = useState(true);
    const [reservedAt, setReservedAt] = useState('');
    const [reservedTime, setReservedTime] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [assignedTableNumber, setAssignedTableNumber] = useState(null);
    const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);

    // Скидаємо стан при відкритті модального вікна
    useEffect(() => {
        if (isOpen) {
            setHasFreeTables(true);
            setError('');
            setSuccess(false);
            setAssignedTableNumber(null);
        }
    }, [isOpen]);

    // Перевірка вільних столиків при зміні дати
    useEffect(() => {
        if (reservedAt && restaurantId) {
            checkFreeTablesForDate();
        }
    }, [reservedAt, restaurantId]);

    const checkFreeTables = async () => {
        // Не перевіряємо при відкритті, тільки при виборі дати
        setHasFreeTables(true);
    };

    const checkFreeTablesForDate = async () => {
        if (!reservedAt) {
            setHasFreeTables(true);
            return;
        }
        
        setIsCheckingTables(true);
        try {
            // Перевіряємо вільні години для дати
            const res = await fetch(`/api/reservations/${restaurantId}/available-times?date=${reservedAt}`);
            if (res.ok) {
                const data = await res.json();
                const hasAvailable = data.availableTimes && data.availableTimes.length > 0;
                setHasFreeTables(hasAvailable);
                // Якщо немає вільних годин, очищаємо вибраний час
                if (!hasAvailable && reservedTime) {
                    setReservedTime('');
                }
            } else {
                // Якщо помилка API, дозволяємо спробувати
                setHasFreeTables(true);
            }
        } catch (error) {
            console.error('Error checking free tables for date:', error);
            // На випадок помилки дозволяємо спробувати
            setHasFreeTables(true);
        } finally {
            setIsCheckingTables(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!reservedAt || !reservedTime) {
            setError('Введіть дату та час бронювання');
            return;
        }

        const reservedDateTime = new Date(`${reservedAt}T${reservedTime}`);
        if (reservedDateTime < new Date()) {
            setError('Дата та час бронювання не можуть бути в минулому');
            return;
        }

        // Перевірка наявності вільних столиків перед відправкою
        if (!hasFreeTables) {
            setError('На жаль, вільних столиків немає. Спробуйте іншу дату або час.');
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(`/api/reservations/${restaurantId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reservedAt: reservedDateTime.toISOString(),
                    customerName: customerName || null,
                    customerPhone: customerPhone || null,
                    notes: notes || null
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Не вдалося створити бронювання');
            }

            const reservation = await res.json();
            setAssignedTableNumber(reservation.assignedTable || reservation.table?.number || null);
            setSuccess(true);
            setError(''); // Очищаємо помилки
            setTimeout(() => {
                onClose();
                setReservedAt('');
                setReservedTime('');
                setCustomerName('');
                setCustomerPhone('');
                setNotes('');
                setSuccess(false);
                setAssignedTableNumber(null);
            }, 3000);
        } catch (error) {
            setError(error.message || 'Помилка створення бронювання');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    // Встановлюємо мінімальну дату на сьогодні
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md shadow-2xl p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Бронювання столика</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                    >
                        <X size={24} className="text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {success && (
                    <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg text-green-700 dark:text-green-300">
                        <p className="font-semibold">Бронювання успішно створено!</p>
                        {assignedTableNumber && (
                            <p className="text-sm mt-1">Вам призначено столик: <span className="font-semibold">{assignedTableNumber}</span></p>
                        )}
                        {!assignedTableNumber && (
                            <p className="text-sm mt-1">Столик буде призначено автоматично при підтвердженні.</p>
                        )}
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300">
                        {error}
                    </div>
                )}

                {!hasFreeTables && !isCheckingTables && reservedAt && (
                    <div className="mb-4 p-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg text-yellow-700 dark:text-yellow-300">
                        <p className="text-sm">На жаль, вільних столиків немає на обрану дату. Будь ласка, оберіть іншу дату або час.</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Дата бронювання */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <Calendar size={18} className="inline mr-2" />
                            Дата бронювання
                        </label>
                        <input
                            type="date"
                            value={reservedAt}
                            onChange={(e) => setReservedAt(e.target.value)}
                            min={today}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            required
                        />
                    </div>

                    {/* Час бронювання */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <Clock size={18} className="inline mr-2" />
                            Час бронювання
                        </label>
                        <button
                            type="button"
                            onClick={() => {
                                if (!reservedAt) {
                                    setError('Спочатку оберіть дату');
                                    return;
                                }
                                setIsTimePickerOpen(true);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-left flex items-center justify-between"
                        >
                            <span className={reservedTime ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
                                {reservedTime || 'Оберіть час'}
                            </span>
                            <Clock size={18} className="text-gray-400" />
                        </button>
                    </div>

                    {/* Ім'я клієнта */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <User size={18} className="inline mr-2" />
                            Ваше ім'я (опціонально)
                        </label>
                        <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Введіть ваше ім'я"
                        />
                    </div>

                    {/* Телефон клієнта */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <Phone size={18} className="inline mr-2" />
                            Телефон (опціонально)
                        </label>
                        <input
                            type="tel"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="+380XXXXXXXXX"
                        />
                    </div>

                    {/* Нотатки */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <FileText size={18} className="inline mr-2" />
                            Додаткові побажання (опціонально)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Наприклад: столик біля вікна, день народження тощо"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                        >
                            Скасувати
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !hasFreeTables || isCheckingTables}
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            {isCheckingTables ? 'Перевірка...' : 'Забронювати'}
                        </button>
                    </div>
                </form>

                {/* Модальне вікно вибору часу */}
                <TimePickerModal
                    isOpen={isTimePickerOpen}
                    onClose={() => setIsTimePickerOpen(false)}
                    onSelect={(time) => {
                        setReservedTime(time);
                        setError('');
                    }}
                    restaurantId={restaurantId}
                    tableId={null}
                    selectedDate={reservedAt}
                    selectedTime={reservedTime}
                />
            </div>
        </div>
    );
}



