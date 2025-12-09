'use client';

import { useState, useEffect } from 'react';
import { X, QrCode, Hash } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TableNumberInputModal({ isOpen, onClose, restaurantId }) {
    const [tableNumber, setTableNumber] = useState('');
    const [availableTables, setAvailableTables] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        if (isOpen && restaurantId) {
            fetchAvailableTables();
        }
    }, [isOpen, restaurantId]);

    const fetchAvailableTables = async () => {
        setIsLoading(true);
        try {
            // Отримуємо всі столики ресторану (публічний доступ, тільки номери)
            const res = await fetch(`/api/tables/${restaurantId}/public`);
            if (res.ok) {
                const data = await res.json();
                setAvailableTables(data.map(t => t.number));
            }
        } catch (error) {
            console.error('Error fetching tables:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!tableNumber.trim()) {
            setError('Введіть номер столика');
            return;
        }

        // Перевіряємо, чи столик існує
        if (availableTables.length > 0 && !availableTables.includes(tableNumber.trim())) {
            setError(`Столик з номером "${tableNumber.trim()}" не знайдено`);
            return;
        }

        // Перенаправляємо на меню з параметром table
        router.push(`/menu-secondary/${restaurantId}?table=${encodeURIComponent(tableNumber.trim())}`);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Hash size={24} />
                        Введіть номер столика
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                    >
                        <X size={24} className="text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Якщо у вас немає можливості відсканувати QR код, введіть номер столика вручну
                </p>

                {error && (
                    <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Номер столика
                        </label>
                        <input
                            type="text"
                            value={tableNumber}
                            onChange={(e) => setTableNumber(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
                            placeholder="Наприклад: 1, A1, VIP-1"
                            autoFocus
                            required
                        />
                    </div>

                    {availableTables.length > 0 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            Доступні столики: {availableTables.join(', ')}
                        </div>
                    )}

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
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                        >
                            <QrCode size={18} />
                            Продовжити
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

