'use client';

import { useState, useEffect } from 'react';
import { X, Clock } from 'lucide-react';

export default function TimePickerModal({ isOpen, onClose, onSelect, restaurantId, tableId, selectedDate, selectedTime }) {
    const [availableTimes, setAvailableTimes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && selectedDate) {
            fetchAvailableTimes();
        }
    }, [isOpen, selectedDate, tableId]);

    const fetchAvailableTimes = async () => {
        if (!selectedDate) return;
        
        setIsLoading(true);
        setError('');
        try {
            const url = `/api/reservations/${restaurantId}/available-times?date=${selectedDate}${tableId ? `&tableId=${tableId}` : ''}`;
            const res = await fetch(url);
            if (!res.ok) {
                throw new Error('Не вдалося завантажити вільні години');
            }
            const data = await res.json();
            setAvailableTimes(data.availableTimes || []);
        } catch (error) {
            console.error('Error fetching available times:', error);
            setError('Помилка завантаження вільних годин');
            // Якщо помилка, показуємо стандартні години
            generateDefaultTimes();
        } finally {
            setIsLoading(false);
        }
    };

    const generateDefaultTimes = () => {
        const times = [];
        for (let hour = 10; hour <= 22; hour++) {
            times.push(`${String(hour).padStart(2, '0')}:00`);
            if (hour < 22) {
                times.push(`${String(hour).padStart(2, '0')}:30`);
            }
        }
        setAvailableTimes(times);
    };

    const handleTimeSelect = (time) => {
        onSelect(time);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Clock size={20} />
                        Оберіть час
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                    >
                        <X size={20} className="text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg text-yellow-700 dark:text-yellow-300 text-sm">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">Завантаження...</p>
                    </div>
                ) : availableTimes.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">Вільних годин немає</p>
                    </div>
                ) : (
                    <div className="max-h-96 overflow-y-auto">
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {availableTimes.map((time) => {
                                const isSelected = time === selectedTime;
                                return (
                                    <button
                                        key={time}
                                        type="button"
                                        onClick={() => handleTimeSelect(time)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                            isSelected
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                    >
                                        {time}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}


