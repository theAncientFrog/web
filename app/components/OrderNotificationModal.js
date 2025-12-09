'use client';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, X, Clock, Package } from 'lucide-react';

export default function OrderNotificationModal({ 
    isOpen, 
    onClose, 
    type = 'success', // 'success', 'new-order', 'status-update'
    title,
    message,
    orderId,
    orderDetails,
    autoCloseDelay = 5000
}) {
    const { t, i18n } = useTranslation();
    const currentLang = i18n?.language || 'ua';
    const isEnglish = currentLang.startsWith('en');
    
    // Функція для отримання локалізованої назви страви
    const getLocalizedItemName = (item) => {
        if (isEnglish && item.nameEn) {
            return item.nameEn;
        }
        return item.name || 'Без назви';
    };
    
    useEffect(() => {
        if (isOpen && autoCloseDelay > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, autoCloseDelay);
            return () => clearTimeout(timer);
        }
    }, [isOpen, autoCloseDelay, onClose]);

    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-12 h-12 text-green-500" />;
            case 'new-order':
                return <Package className="w-12 h-12 text-blue-500" />;
            case 'status-update':
                return <Clock className="w-12 h-12 text-yellow-500" />;
            default:
                return <CheckCircle className="w-12 h-12 text-green-500" />;
        }
    };

    const getBgColor = () => {
        switch (type) {
            case 'success':
                return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
            case 'new-order':
                return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
            case 'status-update':
                return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
            default:
                return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
            <div 
                className={`
                    ${getBgColor()}
                    border-2 rounded-2xl shadow-2xl max-w-md w-full p-6
                    transform transition-all duration-300 ease-out
                    scale-100 opacity-100 translate-y-0
                    pointer-events-auto
                    animate-in fade-in zoom-in slide-in-from-bottom-4
                `}
            >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                        {getIcon()}
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {title || t('common.notification')}
                            </h3>
                            {orderId && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {t('common.order')} №{orderId}
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                        aria-label="Закрити"
                    >
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Message */}
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {message}
                </p>

                {/* Order Details */}
                {orderDetails && (orderDetails.items || orderDetails.totalPrice || orderDetails.tableNumber) && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-700">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                            {t('common.order_details')}:
                        </h4>
                        <div className="space-y-2">
                            {orderDetails.items && Array.isArray(orderDetails.items) && orderDetails.items.length > 0 && (
                                <div>
                                    {orderDetails.items.slice(0, 3).map((item, index) => (
                                        <div key={index} className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">
                                                {item.quantity}x {getLocalizedItemName(item)}
                                            </span>
                                            <span className="text-gray-900 dark:text-white font-medium">
                                                {item.price ? (item.price * item.quantity).toFixed(2) : '0.00'} {t('menu.currency')}
                                            </span>
                                        </div>
                                    ))}
                                    {orderDetails.items.length > 3 && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            +{orderDetails.items.length - 3} {t('common.more_items')}
                                        </p>
                                    )}
                                </div>
                            )}
                            {orderDetails.totalPrice && (
                                <div className={`pt-2 ${orderDetails.items && orderDetails.items.length > 0 ? 'border-t border-gray-200 dark:border-gray-700' : ''} flex justify-between items-center`}>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {t('common.total')}:
                                    </span>
                                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                        {typeof orderDetails.totalPrice === 'number' ? orderDetails.totalPrice.toFixed(2) : orderDetails.totalPrice} {t('menu.currency')}
                                    </span>
                                </div>
                            )}
                            {orderDetails.tableNumber && (
                                <div className="pt-2 text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">{t('menu.table_number')}: </span>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {orderDetails.tableNumber}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Action Button */}
                <button
                    onClick={onClose}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-lg font-semibold transition-colors duration-200"
                >
                    {t('common.understood')}
                </button>
            </div>
        </div>
    );
}

