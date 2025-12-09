'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Edit2, Download, QrCode, Map, Activity } from 'lucide-react';
import Image from 'next/image';

export default function ManageTablesPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session, status } = useSession();
    const restaurantId = params.restaurantId;

    const [tables, setTables] = useState([]);
    const [activeOrders, setActiveOrders] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isTableSettingsOpen, setIsTableSettingsOpen] = useState(false);
    const [selectedTable, setSelectedTable] = useState(null);
    const [tableNumber, setTableNumber] = useState('');
    const [tableStatus, setTableStatus] = useState('FREE');
    const [editingTable, setEditingTable] = useState(null);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('qr'); // 'qr', 'map', 'orders'

    // Завантаження столиків та активних замовлень
    useEffect(() => {
        if (status === 'authenticated' && restaurantId) {
            fetchTables();
            fetchActiveOrders();
            fetchReservations();
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

    const fetchActiveOrders = async () => {
        try {
            const res = await fetch(`/api/orders/restaurant/${restaurantId}`);
            if (!res.ok) {
                throw new Error('Не вдалося завантажити замовлення');
            }
            const data = await res.json();
            // Фільтруємо тільки активні замовлення (PENDING, PREPARING, READY)
            const active = data.filter(order => 
                ['PENDING', 'PREPARING', 'READY'].includes(order.status) && order.tableNumber
            );
            setActiveOrders(active);
        } catch (error) {
            console.error('Error fetching active orders:', error);
        }
    };

    const fetchReservations = async () => {
        try {
            const res = await fetch(`/api/reservations/${restaurantId}`);
            if (res.ok) {
                const data = await res.json();
                setReservations(data);
            }
        } catch (error) {
            console.error('Error fetching reservations:', error);
        }
    };

    const cancelReservation = async (reservationId) => {
        if (!confirm('Ви впевнені, що хочете скасувати це бронювання?')) {
            return;
        }

        try {
            const res = await fetch(`/api/reservations/${restaurantId}/${reservationId}`, {
                method: 'DELETE'
            });

            if (!res.ok) {
                throw new Error('Не вдалося скасувати бронювання');
            }

            // Оновлюємо список бронювань та столиків
            fetchReservations();
            fetchTables();
        } catch (error) {
            setError('Помилка скасування бронювання');
        }
    };

    const getTableReservations = (tableId) => {
        return reservations.filter(res => res.tableId === tableId);
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
        setTableStatus(table.status || 'FREE');
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
                body: JSON.stringify({ 
                    number: tableNumber.trim(),
                    status: tableStatus
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Не вдалося оновити столик');
            }

            const updatedTable = await res.json();
            setTables(tables.map(t => t.id === updatedTable.id ? updatedTable : t));
            setTableNumber('');
            setTableStatus('FREE');
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

    const handleTableClick = (table) => {
        setSelectedTable(table);
        setIsTableSettingsOpen(true);
    };

    const updateTableStatus = async (tableId, newStatus) => {
        try {
            const res = await fetch(`/api/tables/${restaurantId}/${tableId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (!res.ok) {
                throw new Error('Не вдалося оновити статус');
            }

            const updatedTable = await res.json();
            setTables(tables.map(t => t.id === updatedTable.id ? updatedTable : t));
            if (selectedTable && selectedTable.id === tableId) {
                setSelectedTable(updatedTable);
            }
        } catch (error) {
            setError('Помилка оновлення статусу');
        }
    };

    const downloadQRCode = (table) => {
        if (!table.qrCodeUrl || typeof window === 'undefined') return;
        
        const link = document.createElement('a');
        link.href = table.qrCodeUrl;
        link.download = `table-${table.number}-qr.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getTableOrders = (tableNumber) => {
        return activeOrders.filter(order => order.tableNumber === tableNumber);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'FREE': return 'bg-green-100 text-green-700 border-green-300';
            case 'OCCUPIED': return 'bg-red-100 text-red-700 border-red-300';
            case 'RESERVED': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
            default: return 'bg-gray-100 text-gray-700 border-gray-300';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'FREE': return 'Вільний';
            case 'OCCUPIED': return 'Зайнятий';
            case 'RESERVED': return 'Заброньований';
            default: return 'Невідомо';
        }
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
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Статус столика
                                </label>
                                <select
                                    value={tableStatus}
                                    onChange={(e) => setTableStatus(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="FREE">Вільний</option>
                                    <option value="OCCUPIED">Зайнятий</option>
                                    <option value="RESERVED">Заброньований</option>
                                </select>
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
                                        setTableStatus('FREE');
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

            {/* Модальне вікно налаштувань столика */}
            {isTableSettingsOpen && selectedTable && (
                <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50" onClick={() => setIsTableSettingsOpen(false)}>
                    <div className="bg-white rounded-xl w-full max-w-md shadow-2xl p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold mb-4">Налаштування столика {selectedTable.number}</h2>
                        
                        {/* Статус столика */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Статус столика
                            </label>
                            <select
                                value={selectedTable.status || 'FREE'}
                                onChange={(e) => updateTableStatus(selectedTable.id, e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                <option value="FREE">Вільний</option>
                                <option value="OCCUPIED">Зайнятий</option>
                                <option value="RESERVED">Заброньований</option>
                            </select>
                        </div>

                        {/* QR код */}
                        {selectedTable.qrCodeUrl && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    QR код
                                </label>
                                <div className="bg-gray-50 rounded-lg p-4 flex justify-center">
                                    <Image
                                        src={selectedTable.qrCodeUrl}
                                        alt={`QR код для столика ${selectedTable.number}`}
                                        width={200}
                                        height={200}
                                        className="rounded-lg"
                                    />
                                </div>
                                <button
                                    onClick={() => downloadQRCode(selectedTable)}
                                    className="w-full mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
                                >
                                    <Download size={18} />
                                    Завантажити QR код
                                </button>
                            </div>
                        )}

                        {/* Бронювання */}
                        {getTableReservations(selectedTable.id).length > 0 && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Бронювання
                                </label>
                                <div className="space-y-2">
                                    {getTableReservations(selectedTable.id).map(reservation => (
                                        <div key={reservation.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-900">
                                                        {new Date(reservation.reservedAt).toLocaleString('uk-UA')}
                                                    </p>
                                                    {reservation.customerName && (
                                                        <p className="text-sm text-gray-600">Клієнт: {reservation.customerName}</p>
                                                    )}
                                                    {reservation.customerPhone && (
                                                        <p className="text-sm text-gray-600">Телефон: {reservation.customerPhone}</p>
                                                    )}
                                                    {reservation.notes && (
                                                        <p className="text-sm text-gray-600 mt-1">Примітка: {reservation.notes}</p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => cancelReservation(reservation.id)}
                                                    className="ml-2 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm transition"
                                                >
                                                    Скасувати
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Активні замовлення */}
                        {getTableOrders(selectedTable.number).length > 0 && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Активні замовлення
                                </label>
                                <div className="space-y-2">
                                    {getTableOrders(selectedTable.number).map(order => (
                                        <div key={order.id} className="p-3 bg-gray-50 rounded-lg">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold text-gray-900">Замовлення #{order.id}</p>
                                                    <p className="text-sm text-gray-600">Статус: {order.status}</p>
                                                    <p className="text-sm text-gray-600">Сума: {order.totalPrice} грн</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => setIsTableSettingsOpen(false)}
                            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                        >
                            Закрити
                        </button>
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
                                <h1 className="m-0 text-sm font-semibold tracking-wider text-gray-900 uppercase">Breadcrumb</h1>
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

                    {/* Вкладки */}
                    <div className="mb-6 border-b border-gray-200">
                        <div className="flex gap-4">
                            <button
                                onClick={() => setActiveTab('qr')}
                                className={`px-4 py-2 font-medium transition ${
                                    activeTab === 'qr'
                                        ? 'text-indigo-600 border-b-2 border-indigo-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <QrCode size={18} />
                                    QR коди
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('map')}
                                className={`px-4 py-2 font-medium transition ${
                                    activeTab === 'map'
                                        ? 'text-indigo-600 border-b-2 border-indigo-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Map size={18} />
                                    Карта столиків
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`px-4 py-2 font-medium transition ${
                                    activeTab === 'orders'
                                        ? 'text-indigo-600 border-b-2 border-indigo-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Activity size={18} />
                                    Активні замовлення
                                </div>
                            </button>
                        </div>
                    </div>

                    {error && !isModalOpen && !isEditModalOpen && !isTableSettingsOpen && (
                        <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Вкладка QR коди */}
                    {activeTab === 'qr' && (
                        <>
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
                                                <div>
                                                    <h3 className="text-xl font-bold">Столик {table.number}</h3>
                                                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded border ${getStatusColor(table.status || 'FREE')}`}>
                                                        {getStatusLabel(table.status || 'FREE')}
                                                    </span>
                                                </div>
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
                        </>
                    )}

                    {/* Вкладка Карта столиків */}
                    {activeTab === 'map' && (
                        <div className="py-6">
                            {isLoading ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500">Завантаження карти столиків...</p>
                                </div>
                            ) : tables.length === 0 ? (
                                <div className="text-center py-12">
                                    <Map size={64} className="mx-auto text-gray-400 mb-4" />
                                    <p className="text-gray-500 text-lg mb-4">Столиків ще немає</p>
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
                                    >
                                        Додати перший столик
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">Інтерактивна карта столиків</h3>
                                            <p className="text-sm text-gray-600 mt-1">Клікніть на столик для перегляду деталей та налаштувань</p>
                                        </div>
                                        <div className="flex gap-4 flex-wrap">
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded bg-green-100 border-2 border-green-400"></div>
                                                <span className="text-sm text-gray-700">Вільний</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded bg-red-100 border-2 border-red-400"></div>
                                                <span className="text-sm text-gray-700">Зайнятий</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded bg-blue-100 border-2 border-blue-400"></div>
                                                <span className="text-sm text-gray-700">Заброньований</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded bg-yellow-100 border-2 border-yellow-400"></div>
                                                <span className="text-sm text-gray-700">Активні замовлення</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-300 min-h-[500px]">
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                            {tables.map((table) => {
                                                const orders = getTableOrders(table.number);
                                                const hasActiveOrders = orders.length > 0;
                                                
                                                return (
                                                    <div
                                                        key={table.id}
                                                        onClick={() => handleTableClick(table)}
                                                        className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all transform hover:scale-105 hover:shadow-xl ${
                                                            hasActiveOrders
                                                                ? 'bg-yellow-50 border-yellow-400 shadow-md'
                                                                : table.status === 'OCCUPIED'
                                                                ? 'bg-red-50 border-red-400'
                                                                : table.status === 'RESERVED'
                                                                ? 'bg-blue-50 border-blue-400'
                                                                : 'bg-green-50 border-green-400'
                                                        }`}
                                                    >
                                                        {/* Індикатор активних замовлень */}
                                                        {hasActiveOrders && (
                                                            <div className="absolute -top-2 -right-2 bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg">
                                                                {orders.length}
                                                            </div>
                                                        )}
                                                        
                                                        {/* Номер столика */}
                                                        <div className="text-center">
                                                            <div className={`font-bold text-xl mb-1 ${
                                                                hasActiveOrders
                                                                    ? 'text-yellow-800'
                                                                    : table.status === 'OCCUPIED'
                                                                    ? 'text-red-800'
                                                                    : table.status === 'RESERVED'
                                                                    ? 'text-blue-800'
                                                                    : 'text-green-800'
                                                            }`}>
                                                                {table.number}
                                                            </div>
                                                            
                                                            {/* Статус */}
                                                            <div className={`text-xs font-medium px-2 py-1 rounded-full mt-2 inline-block ${
                                                                table.status === 'OCCUPIED'
                                                                    ? 'bg-red-200 text-red-800'
                                                                    : table.status === 'RESERVED'
                                                                    ? 'bg-blue-200 text-blue-800'
                                                                    : 'bg-green-200 text-green-800'
                                                            }`}>
                                                                {getStatusLabel(table.status || 'FREE')}
                                                            </div>
                                                            
                                                            {/* Інформація про замовлення */}
                                                            {hasActiveOrders && (
                                                                <div className="mt-2 text-xs text-yellow-800 font-semibold">
                                                                    {orders.length} {orders.length === 1 ? 'замовлення' : 'замовлень'}
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Іконка для індикації клікабельності */}
                                                        <div className="absolute bottom-2 right-2 opacity-50">
                                                            <Map size={16} className={
                                                                hasActiveOrders
                                                                    ? 'text-yellow-600'
                                                                    : table.status === 'OCCUPIED'
                                                                    ? 'text-red-600'
                                                                    : table.status === 'RESERVED'
                                                                    ? 'text-blue-600'
                                                                    : 'text-green-600'
                                                            } />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        
                                        {tables.length === 0 && (
                                            <div className="text-center py-20">
                                                <Map size={64} className="mx-auto text-gray-400 mb-4" />
                                                <p className="text-gray-500 text-lg">Додайте столики для відображення на карті</p>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-sm text-blue-800">
                                            <strong>💡 Підказка:</strong> Клікніть на будь-який столик, щоб відкрити налаштування, переглянути QR код та активні замовлення.
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Вкладка Активні замовлення */}
                    {activeTab === 'orders' && (
                        <div>
                            {activeOrders.length === 0 ? (
                                <div className="text-center py-12">
                                    <Activity size={64} className="mx-auto text-gray-400 mb-4" />
                                    <p className="text-gray-500 text-lg">Активних замовлень немає</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {tables.map((table) => {
                                        const orders = getTableOrders(table.number);
                                        if (orders.length === 0) return null;
                                        return (
                                            <div key={table.id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="text-xl font-bold">Столик {table.number}</h3>
                                                    <span className={`px-3 py-1 text-sm font-medium rounded border ${getStatusColor(table.status || 'FREE')}`}>
                                                        {getStatusLabel(table.status || 'FREE')}
                                                    </span>
                                                </div>
                                                <div className="space-y-3">
                                                    {orders.map(order => (
                                                        <div key={order.id} className="p-4 bg-gray-50 rounded-lg">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div>
                                                                    <p className="font-semibold text-gray-900">Замовлення #{order.id}</p>
                                                                    <p className="text-sm text-gray-600">Статус: {order.status}</p>
                                                                    <p className="text-sm text-gray-600">Сума: {order.totalPrice} грн</p>
                                                                    <p className="text-sm text-gray-600">Час: {new Date(order.createdAt).toLocaleTimeString()}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
