// app/components/OrderDetailsModal.tsx
'use client';

import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Тип для деталей, які ми показуємо
type ItemDetail = {
    name: string;
    quantity: number;
    price: number;
};

interface DetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: number;
    items: ItemDetail[]; // ⬅️ Очікуємо масив
    total: number;
}

export default function OrderDetailsModal({ isOpen, onClose, orderId, items, total }: DetailsModalProps) {
    const { t } = useTranslation();
    
    if (!isOpen) {
        return null;
    }

    return (
        // ЗОВНІШНІЙ DIV НЕ МАЄ ФОНУ (bg-black/60 видалено), z-index 51
        <div className="fixed inset-0 flex justify-center items-center p-4 z-[51]" onClick={onClose}>
            {/* profileModal + max-w-sm */}
            <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <button className="absolute top-3 right-4 text-2xl text-gray-400 cursor-pointer z-10 hover:text-gray-600" onClick={onClose}>
                    <X size={24} />
                </button>
                
                <h2 className="text-xl font-bold text-gray-900 p-6 pb-0">
                    {t('common.order_details')} #{orderId}
                </h2>

                <div className="p-6 overflow-y-auto flex-grow space-y-3">
                    <ul className="space-y-3">
                        {/* ВИПРАВЛЕННЯ: Optional Chaining */}
                        {items?.map((item, index) => (
                            <li key={index} className="flex justify-between items-start text-sm border-b border-gray-100 pb-2">
                                <span className="font-medium text-gray-800 break-words pr-2">{item.name} (x{item.quantity})</span>
                                <span className="font-semibold text-indigo-600 flex-shrink-0">{(item.price * item.quantity).toFixed(2)} {t('menu.currency')}</span>
                            </li>
                        ))}
                        {/* Повідомлення про відсутність деталей */}
                        {(!items || items.length === 0) && (
                            <li className="text-center text-gray-500 py-4 text-sm">{t('common.order_details_unavailable')}</li>
                        )}
                    </ul>
                </div>

                <div className="p-6 pt-0 flex-shrink-0">
                    <div className="flex justify-between font-extrabold text-lg mb-4 border-t border-gray-200 pt-3">
                        <span>{t('common.total')}:</span>
                        <span className="text-2xl text-indigo-600">{total.toFixed(2)} {t('menu.currency')}</span>
                    </div>
                    {/* Кнопка закриття */}
                    <button onClick={onClose} className="w-full bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-bold hover:bg-gray-300 transition">
                        {t('common.close')}
                    </button>
                </div>
            </div>
        </div>
    );
}