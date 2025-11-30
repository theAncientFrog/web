// app/components/EditCategoryModal.js
'use client';

import { useState, useEffect } from 'react';
import { 
    Utensils, Coffee, Wine, Package, IceCream, Pizza, 
    Apple, Fish, Beef, Salad, Cookie, Cake, Milk, 
    Soup, Cherry 
} from 'lucide-react';

// Список доступних іконок для категорій
const CATEGORY_ICONS = [
    { name: 'Utensils', component: Utensils, label: 'Столові прибори' },
    { name: 'Coffee', component: Coffee, label: 'Кава' },
    { name: 'Wine', component: Wine, label: 'Вино' },
    { name: 'Package', component: Package, label: 'Упаковка' },
    { name: 'IceCream', component: IceCream, label: 'Морозиво' },
    { name: 'Pizza', component: Pizza, label: 'Піца' },
    { name: 'Apple', component: Apple, label: 'Яблуко' },
    { name: 'Fish', component: Fish, label: 'Риба' },
    { name: 'Beef', component: Beef, label: 'М\'ясо' },
    { name: 'Salad', component: Salad, label: 'Салат' },
    { name: 'Cookie', component: Cookie, label: 'Печиво' },
    { name: 'Cake', component: Cake, label: 'Торт' },
    { name: 'Milk', component: Milk, label: 'Молоко' },
    { name: 'Soup', component: Soup, label: 'Суп' },
    { name: 'Cherry', component: Cherry, label: 'Вишня' },
];

export default function EditCategoryModal({ isOpen, onClose, onCategoryUpdated, restaurantId, category }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedIcon, setSelectedIcon] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Оновлюємо форму при зміні категорії
    useEffect(() => {
        if (category) {
            setName(category.name || '');
            setDescription(category.description || '');
            setSelectedIcon(category.iconName || null);
        }
    }, [category]);

    const handleClose = () => {
        setName('');
        setDescription('');
        setSelectedIcon(null);
        setError('');
        setIsLoading(false);
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!category || !category.id) {
            setError('Категорія не вибрана');
            setIsLoading(false);
            return;
        }

        const apiUrl = `/api/manage/restaurants/${restaurantId}/categories/${category.id}`;

        try {
            const res = await fetch(apiUrl, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name, 
                    description,
                    iconName: selectedIcon || null
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to update category');
            }

            onCategoryUpdated(data);
            handleClose();

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen || !category) {
        return null;
    }

    return (
        // profileOverlay
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50" onClick={handleClose}>
            {/* profileModal */}
            <div className="bg-white rounded-xl w-full max-w-md shadow-2xl relative flex flex-col overflow-hidden max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                {/* profileCloseButton */}
                <button className="absolute top-2 right-3 text-2xl text-gray-400 cursor-pointer z-10 hover:text-gray-600" onClick={handleClose}>×</button>
                
                {/* profileModalContent (адаптований) */}
                <div className="p-6 overflow-y-auto">
                    {/* modalTitle */}
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">Редагувати категорію</h2>

                    <form onSubmit={handleSubmit}>
                        {/* inputGroup */}
                        <div className="mb-5 text-left">
                            {/* label */}
                            <label htmlFor="catName" className="block font-medium mb-2 text-sm text-gray-700">Назва категорії</label>
                            {/* loginInput */}
                            <input
                                id="catName"
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="e.g., Coffee, Main Dishes"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        {/* inputGroup */}
                        <div className="mb-5 text-left">
                            <label htmlFor="catDesc" className="block font-medium mb-2 text-sm text-gray-700">Опис (optional)</label>
                            {/* loginInput + textarea */}
                            <textarea
                                id="catDesc"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base transition focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[80px]"
                                placeholder="Опишіть категорію..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows="3"
                            />
                        </div>

                        {/* Вибір іконки - тільки для батьківських категорій */}
                        {(!category.parentId) && (
                            <div className="mb-5 text-left">
                                <label className="block font-medium mb-3 text-sm text-gray-700">Іконка категорії (optional)</label>
                            <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-lg bg-gray-50 scrollbar-hide">
                                {CATEGORY_ICONS.map((icon) => {
                                    const IconComponent = icon.component;
                                    const isSelected = selectedIcon === icon.name;
                                    return (
                                        <button
                                            key={icon.name}
                                            type="button"
                                            onClick={() => setSelectedIcon(isSelected ? null : icon.name)}
                                            className={`p-2 sm:p-3 rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                                                isSelected
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                            title={icon.label}
                                        >
                                            <IconComponent 
                                                size={20} 
                                                className={`sm:w-6 sm:h-6 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} 
                                            />
                                            <span className="text-[9px] sm:text-[10px] text-gray-500 truncate w-full text-center leading-tight">
                                                {icon.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                                {selectedIcon && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        Вибрано: {CATEGORY_ICONS.find(icon => icon.name === selectedIcon)?.label}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* loginError */}
                        {error && <p className="text-red-700 bg-red-100 border border-red-300 rounded-lg p-3 text-sm text-center mt-4">{error}</p>}

                        {/* modalActions */}
                        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-200">
                            {/* modalButton secondary */}
                            <button
                                type="button"
                                className="px-4 py-2 rounded-lg font-medium text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-60 disabled:cursor-not-allowed"
                                onClick={handleClose}
                                disabled={isLoading}
                            >
                                Скасувати
                            </button>
                            {/* modalButton primary */}
                            <button
                                type="submit"
                                className="px-4 py-2 rounded-lg font-medium text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Збереження...' : 'Зберегти'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

