'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Edit2, Download, QrCode } from 'lucide-react';
import Image from 'next/image';

export default function ManageTablesPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session, status } = useSession();
    const restaurantId = params.restaurantId;

    const [tables, setTables] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [tableNumber, setTableNumber] = useState('');
    const [editingTable, setEditingTable] = useState(null);
    const [error, setError] = useState('');

    // Завантаження столиків
    useEffect(() => {
        if (status === 'authenticated' && restaurantId) {
            fetchTables();
        }
    }, [status, restaurantId]);

    const fetchTables = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/tables/${restaurantId}`);
            if (!res.ok) {
                throw new Error('Не вдалося завантажити столики');
            }
            const data = await res.json();
            setTables(data);
        } catch (error) {
            console.error('Error fetching tables:', error);
            setError('Помилка завантаження столиків');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddTable = async (e) => {
        e.preventDefault();
        setError('');

        if (!tableNumber.trim()) {
            setError('Введіть номер столика');
            return;
        }

        try {
            const res = await fetch(`/api/tables/${restaurantId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ number: tableNumber.trim() })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Не вдалося створити столик');
            }

            const newTable = await res.json();
            setTables([newTable, ...tables]);
            setTableNumber('');
            setIsModalOpen(false);
        } catch (error) {
            setError(error.message || 'Помилка створення столика');
        }
    };

    const handleEditTable = (table) => {
        setEditingTable(table);
        setTableNumber(table.number);
        setIsEditModalOpen(true);
    };

    const handleUpdateTable = async (e) => {
        e.preventDefault();
        setError('');

        if (!tableNumber.trim()) {
            setError('Введіть номер столика');
            return;
        }

        try {
            const res = await fetch(`/api/tables/${restaurantId}/${editingTable.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ number: tableNumber.trim() })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Не вдалося оновити столик');
            }

            const updatedTable = await res.json();
            setTables(tables.map(t => t.id === updatedTable.id ? updatedTable : t));
            setTableNumber('');
            setEditingTable(null);
            setIsEditModalOpen(false);
        } catch (error) {
            setError(error.message || 'Помилка оновлення столика');
        }
    };

    const handleDeleteTable = async (tableId) => {
        if (!confirm('Ви впевнені, що хочете видалити цей столик?')) {
            return;
        }

        try {
            const res = await fetch(`/api/tables/${restaurantId}/${tableId}`, {
                method: 'DELETE'
            });

            if (!res.ok) {
                throw new Error('Не вдалося видалити столик');
            }

            setTables(tables.filter(t => t.id !== tableId));
        } catch (error) {
            setError('Помилка видалення столика');
        }
    };

    const downloadQRCode = (table) => {
        if (!table.qrCodeUrl) return;
        
        const link = document.createElement('a');
        link.href = table.qrCodeUrl;
        link.download = `table-${table.number}-qr.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (status === 'loading') {
        return (
            <main className="w-full min-h-screen flex flex-col bg-white justify-start">
                <div className="p-8 text-center text-gray-500">Завантаження...</div>
            </main>
        );
    }

    if (status === 'unauthenticated') {
        return (
            <main className="w-full min-h-screen flex flex-col bg-white justify-start">
                <div className="p-8 text-center text-gray-500">Доступ заборонено.</div>
            </main>
        );
    }

    return (
        <>
            {/* Модальне вікно додавання столика */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white rounded-xl w-full max-w-md shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold mb-4">Додати столик</h2>
                        <form onSubmit={handleAddTable}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Номер столика
                                </label>
                                <input
                                    type="text"
                                    value={tableNumber}
                                    onChange={(e) => setTableNumber(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Наприклад: 1, A1, VIP-1"
                                    autoFocus
                                />
                            </div>
                            {error && (
                                <div className="mb-4 text-red-600 text-sm">{error}</div>
                            )}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setTableNumber('');
                                        setError('');
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                >
                                    Скасувати
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    Додати
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Модальне вікно редагування столика */}
            {isEditModalOpen && editingTable && (
                <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50" onClick={() => setIsEditModalOpen(false)}>
                    <div className="bg-white rounded-xl w-full max-w-md shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold mb-4">Редагувати столик</h2>
                        <form onSubmit={handleUpdateTable}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Номер столика
                                </label>
                                <input
                                    type="text"
                                    value={tableNumber}
                                    onChange={(e) => setTableNumber(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Наприклад: 1, A1, VIP-1"
                                    autoFocus
                                />
                            </div>
                            {error && (
                                <div className="mb-4 text-red-600 text-sm">{error}</div>
                            )}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditModalOpen(false);
                                        setTableNumber('');
                                        setEditingTable(null);
                                        setError('');
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                >
                                    Скасувати
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    Зберегти
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <main className="w-full min-h-screen flex flex-col bg-white justify-start">
                <div className="max-w-6xl mx-auto w-full px-4 sm:px-8 py-6 sm:py-8">
                    <header className="flex justify-between items-center mb-8 pb-6 border-b border-gray-200 flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push('/manage/restaurants')}
                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <h1 className="m-0 text-sm font-semibold tracking-wider text-gray-900 uppercase">MANAGER MODE</h1>
                                <h2 className="text-2xl sm:text-3xl font-bold mt-2">Управління столиками</h2>
                                <p className="text-gray-500 text-base mt-1">Ресторан #{restaurantId}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-indigo-600 text-white border-none rounded-lg px-5 py-3 text-sm sm:text-base font-medium cursor-pointer whitespace-nowrap transition hover:bg-indigo-700 flex items-center gap-2"
                        >
                            <Plus size={20} />
                            Додати столик
                        </button>
                    </header>

                    {error && !isModalOpen && !isEditModalOpen && (
                        <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
                            {error}
                        </div>
                    )}

                    {isLoading ? (
                        <p className="text-center text-gray-500 p-8">Завантаження столиків...</p>
                    ) : tables.length === 0 ? (
                        <div className="text-center py-12">
                            <QrCode size={64} className="mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500 text-lg mb-4">Столиків ще немає</p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
                            >
                                Додати перший столик
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {tables.map((table) => (
                                <div key={table.id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-bold">Столик {table.number}</h3>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEditTable(table)}
                                                className="p-2 text-gray-500 hover:text-indigo-600 transition"
                                                title="Редагувати"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTable(table.id)}
                                                className="p-2 text-gray-500 hover:text-red-600 transition"
                                                title="Видалити"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {table.qrCodeUrl && (
                                        <div className="mb-4">
                                            <div className="bg-gray-50 rounded-lg p-4 flex justify-center">
                                                <Image
                                                    src={table.qrCodeUrl}
                                                    alt={`QR код для столика ${table.number}`}
                                                    width={200}
                                                    height={200}
                                                    className="rounded-lg"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => downloadQRCode(table)}
                                        className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
                                        disabled={!table.qrCodeUrl}
                                    >
                                        <Download size={18} />
                                        Завантажити QR код
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}

