'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Phone, FileText } from 'lucide-react';

export default function TableReservationModal({ isOpen, onClose, restaurantId }) {
    const [freeTables, setFreeTables] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTableId, setSelectedTableId] = useState('');
    const [reservedAt, setReservedAt] = useState('');
    const [reservedTime, setReservedTime] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isOpen && restaurantId) {
            fetchFreeTables();
        }
    }, [isOpen, restaurantId]);

    const fetchFreeTables = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/reservations/${restaurantId}`);
            if (!res.ok) {
                throw new Error('Не вдалося завантажити столики');
            }
            const data = await res.json();
            setFreeTables(data);
        } catch (error) {
            console.error('Error fetching free tables:', error);
            setError('Помилка завантаження столиків');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!selectedTableId) {
            setError('Оберіть столик');
            return;
        }

        if (!reservedAt || !reservedTime) {
            setError('Введіть дату та час бронювання');
            return;
        }

        const reservedDateTime = new Date(`${reservedAt}T${reservedTime}`);
        if (reservedDateTime < new Date()) {
            setError('Дата та час бронювання не можуть бути в минулому');
            return;
        }

        try {
            const res = await fetch(`/api/reservations/${restaurantId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tableId: selectedTableId,
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

            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSelectedTableId('');
                setReservedAt('');
                setReservedTime('');
                setCustomerName('');
                setCustomerPhone('');
                setNotes('');
                setSuccess(false);
            }, 2000);
        } catch (error) {
            setError(error.message || 'Помилка створення бронювання');
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
                        Бронювання успішно створено!
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Вибір столика */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <Calendar size={18} className="inline mr-2" />
                            Оберіть столик
                        </label>
                        {isLoading ? (
                            <p className="text-sm text-gray-500">Завантаження столиків...</p>
                        ) : freeTables.length === 0 ? (
                            <p className="text-sm text-gray-500">Вільних столиків немає</p>
                        ) : (
                            <select
                                value={selectedTableId}
                                onChange={(e) => setSelectedTableId(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                required
                            >
                                <option value="">-- Оберіть столик --</option>
                                {freeTables.map((table) => (
                                    <option key={table.id} value={table.id}>
                                        Столик {table.number}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

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
                        <input
                            type="time"
                            value={reservedTime}
                            onChange={(e) => setReservedTime(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            required
                        />
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
                            disabled={isLoading || freeTables.length === 0}
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            Забронювати
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}


