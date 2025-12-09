// app/components/CartModal.js
'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext'; 
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import { X, Trash2, Minus, Plus } from 'lucide-react';
import OrderNotificationModal from './OrderNotificationModal';

export default function CartModal({ isOpen, onClose, restaurantId, tableNumber }) {
    const { t, i18n } = useTranslation();
    const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    
    // Визначаємо поточну мову для локалізації назв страв
    const currentLang = i18n?.language || 'ua';
    const isEnglish = currentLang.startsWith('en');
    
    // Функція для отримання локалізованої назви страви
    const getLocalizedItemName = (item) => {
        if (isEnglish && item.nameEn) {
            return item.nameEn;
        }
        return item.name || 'Без назви';
    }; 
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [notification, setNotification] = useState({
        isOpen: false,
        type: 'success',
        title: '',
        message: '',
        orderId: null,
        orderDetails: null,
    });

    if (!isOpen) {
        return null;
    }

    // --- ▼ ЛОГІКА ОФОРМЛЕННЯ ЗАМОВЛЕННЯ ▼ ---
    const handlePlaceOrder = async () => {
        setIsLoading(true);
        setError('');
        
        const itemsForApi = cartItems.map(item => ({
            dishId: item.id,
            quantity: item.quantity
        }));

        if (!restaurantId) {
            setError('Помилка: не вдалося визначити ресторан. Оновіть сторінку.');
            setIsLoading(false);
            return;
        }

        // Перевірка, чи є номер столика (обов'язково для замовлення)
        if (!tableNumber || tableNumber.trim() === '') {
            setError('Для оформлення замовлення необхідно відсканувати QR код столика');
            setIsLoading(false);
            return;
        }

        // Діагностика: логування tableNumber перед відправкою
        console.log('[CartModal] Відправка замовлення з tableNumber:', tableNumber);

        try {
            const res = await fetch('/api/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                
                body: JSON.stringify({ 
                    cart: itemsForApi,
                    restaurantId: restaurantId,
                    tableNumber: tableNumber && tableNumber.trim() !== '' ? tableNumber.trim() : null
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to place order');
            }

            // Зберігаємо деталі замовлення перед очищенням кошика
            const orderDetails = {
                items: cartItems.map(item => ({
                    name: getLocalizedItemName(item),
                    quantity: item.quantity,
                    price: item.price,
                })),
                totalPrice: cartTotal,
                tableNumber: tableNumber,
            };
            
            // Очищаємо кошик та закриваємо модалку одразу
            clearCart();
            onClose();
            
            // Показуємо повідомлення про успіх після закриття кошика
            setTimeout(() => {
                setNotification({
                    isOpen: true,
                    type: 'success',
                    title: 'Замовлення успішно оформлено!',
                    message: 'Ваше замовлення прийнято в обробку. Очікуйте підтвердження від кухні.',
                    orderId: data.order?.id || null,
                    orderDetails: orderDetails,
                });
            }, 100);

        } catch (err) {
            console.error('Order error:', err);
            // Покращена обробка помилок
            if (err instanceof Error) {
                setError(`Помилка замовлення: ${err.message}`);
            } else {
                setError('Сталася невідома помилка при замовленні');
            }
        } finally {
            setIsLoading(false);
        }
    };
    // --- ▲ КІНЕЦЬ ЛОГІКИ ▲ ---


    return (
        <>
            {/* Модалка сповіщень */}
            <OrderNotificationModal
                isOpen={notification.isOpen}
                onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
                type={notification.type}
                title={notification.title}
                message={notification.message}
                orderId={notification.orderId}
                orderDetails={notification.orderDetails}
                autoCloseDelay={6000}
            />
            
            {/* profileOverlay */}
            <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-3 sm:p-4 z-50" onClick={onClose}>
            {/* profileModal + cartModal (max-w-lg) */}
            <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg shadow-2xl relative flex flex-col max-h-[95vh] sm:max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {/* profileCloseButton */}
                <button className="absolute top-2 right-3 sm:top-3 sm:right-4 text-2xl text-gray-400 dark:text-gray-500 cursor-pointer z-10 hover:text-gray-600 dark:hover:text-gray-300" onClick={onClose}>
                    <X size={20} className="sm:w-6 sm:h-6" />
                </button>
                
                {/* modalTitle */}
                <div className="p-4 sm:p-6 pb-0">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                        {t('common.cart')}
                    </h2>
                    {tableNumber && tableNumber.trim() !== '' && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {t('menu.table_number')} {tableNumber}
                        </p>
                    )}
                </div>

                {/* cartModalContent */}
                <div className="p-4 sm:p-6 overflow-y-auto flex-grow">
                    {/* cartItemsList */}
                    {cartItems.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">{t('common.cart_empty')}</p>
                    ) : (
                        <div className="max-h-[40vh] overflow-y-auto pr-2">
                            {cartItems.map((item) => (
                                // cartItem
                                <div key={item.id} className="flex items-center gap-2 sm:gap-4 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                                    {/* cartItemImage */}
                                    <div className="flex-shrink-0">
                                        <Image
                                            src={item.imageUrl || '/images/placeholder.jpg'}
                                            alt={getLocalizedItemName(item)}
                                            width={50}
                                            height={50}
                                            className="rounded-lg object-cover w-12 h-12 sm:w-[50px] sm:h-[50px]"
                                        />
                                    </div>
                                    {/* cartItemDetails */}
                                    <div className="flex-grow text-left overflow-hidden min-w-0">
                                        <span className="block font-medium mb-1 text-xs sm:text-sm truncate text-gray-900 dark:text-white">{getLocalizedItemName(item)}</span>
                                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{item.price} {t('menu.currency')}</span>
                                    </div>
                                    {/* cartItemQuantity */}
                                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                                        <button 
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="bg-gray-100 dark:bg-gray-700 rounded-full w-6 h-6 sm:w-7 sm:h-7 text-lg leading-7 cursor-pointer text-gray-600 dark:text-gray-300 flex items-center justify-center transition hover:bg-gray-200 dark:hover:bg-gray-600"
                                        >
                                            <Minus size={14} className="sm:w-4 sm:h-4"/>
                                        </button>
                                        <span className="font-medium min-w-[16px] sm:min-w-[20px] text-center text-xs sm:text-sm text-gray-900 dark:text-white">{item.quantity}</span>
                                        <button 
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="bg-gray-100 dark:bg-gray-700 rounded-full w-6 h-6 sm:w-7 sm:h-7 text-lg leading-7 cursor-pointer text-gray-600 dark:text-gray-300 flex items-center justify-center transition hover:bg-gray-200 dark:hover:bg-gray-600"
                                        >
                                            <Plus size={14} className="sm:w-4 sm:h-4"/>
                                        </button>
                                    </div>
                                    {/* cartItemRemove */}
                                    <button 
                                        className="bg-none border-none text-lg text-gray-400 dark:text-gray-500 cursor-pointer px-1 sm:px-2 flex-shrink-0 transition hover:text-red-500 dark:hover:text-red-400" 
                                        onClick={() => removeFromCart(item.id)}
                                    >
                                        <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div> 

                {/* loginError (з адаптованими margin) */}
                {error && (
                    <div className="px-6 pb-4">
                        <p className="text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg p-3 text-sm text-center">
                            {error}
                        </p>
                    </div>
                )}

                {/* cartFooter */}
                {cartItems.length > 0 && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 sm:pt-6 p-4 sm:p-6 flex-shrink-0">
                        {/* cartTotal */}
                        <div className="flex justify-between text-base sm:text-lg font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white">
                            <span>{t('common.total')}:</span>
                            <span>{cartTotal.toFixed(2)} {t('menu.currency')}</span>
                        </div>
                        {/* Кнопка "Замовити" (зелена) */}
                        <button
                            className="w-full px-4 py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
                            onClick={handlePlaceOrder}
                            disabled={isLoading}
                        >
                            {isLoading ? t('common.processing') : t('common.order')}
                        </button>
                    </div>
                )}
            </div>
        </div>
        </>
    );
}