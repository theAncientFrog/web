// app/components/EditItemModal.js
'use client';

import { useState, useEffect } from 'react';

export default function EditItemModal({ isOpen, onClose, onItemUpdated, itemToEdit, restaurantId, categoryId }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [calories, setCalories] = useState('');
    const [allergens, setAllergens] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Заповнюємо форму даними товару, коли модалка відкривається
    useEffect(() => {
        if (itemToEdit) {
            setName(itemToEdit.name || '');
            setDescription(itemToEdit.description || '');
            setPrice(itemToEdit.price?.toString() || '');
            setCalories(itemToEdit.calories?.toString() || '');
            setAllergens(itemToEdit.allergens || '');
            setImageUrl(itemToEdit.imageUrl || '');
        }
    }, [itemToEdit]);

    const handleClose = () => {
        setError('');
        setIsLoading(false);
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const apiUrl = `/api/manage/restaurants/${restaurantId}/categories/${categoryId}/items/${itemToEdit.id}`;

        const parsedPrice = parseFloat(price);
        const parsedCalories = calories ? parseInt(calories) : null;
        if (isNaN(parsedPrice) || (calories && isNaN(parsedCalories))) {
            setError('Price and Calories must be numbers.');
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch(apiUrl, {
                method: 'PUT', // Використовуємо метод PUT
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    description,
                    price: parsedPrice,
                    calories: parsedCalories,
                    allergens: allergens.trim() || null,
                    imageUrl
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to update item');
            }

            onItemUpdated(data);
            handleClose();

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen || !itemToEdit) {
        return null;
    }

    return (
        // profileOverlay
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50" onClick={handleClose}>
            {/* profileModal */}
            <div className="bg-white rounded-xl w-full max-w-md shadow-2xl relative flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {/* profileCloseButton */}
                <button className="absolute top-2 right-3 text-2xl text-gray-400 cursor-pointer z-10 hover:text-gray-600" onClick={handleClose}>×</button>
                
                {/* profileModalContent (адаптований) */}
                <div className="p-6 overflow-y-auto">
                    {/* modalTitle */}
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">Edit Item</h2>

                    <form onSubmit={handleSubmit}>
                        {/* inputGroup */}
                        <div className="mb-5 text-left">
                            <label htmlFor="editItemName" className="block font-medium mb-2 text-sm text-gray-700">Item Name</label>
                            <input id="editItemName" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter item name" value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>
                        <div className="mb-5 text-left">
                            <label htmlFor="editItemDesc" className="block font-medium mb-2 text-sm text-gray-700">Description (optional)</label>
                            <textarea id="editItemDesc" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base transition focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[80px]" placeholder="Describe the item..." value={description} onChange={(e) => setDescription(e.target.value)} rows="2" />
                        </div>
                        
                        {/* Рядок з ціною та калоріями */}
                        <div className="flex gap-4">
                            <div className="mb-5 text-left flex-1">
                                <label htmlFor="editItemPrice" className="block font-medium mb-2 text-sm text-gray-700">Price (грн)</label>
                                <input id="editItemPrice" type="number" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., 150.50" value={price} onChange={(e) => setPrice(e.target.value)} required />
                            </div>
                            <div className="mb-5 text-left flex-1">
                                <label htmlFor="editItemCal" className="block font-medium mb-2 text-sm text-gray-700">Calories (optional)</label>
                                <input id="editItemCal" type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., 350" value={calories} onChange={(e) => setCalories(e.target.value)} />
                            </div>
                        </div>

                        <div className="mb-5 text-left">
                            <label htmlFor="editItemAllergens" className="block font-medium mb-2 text-sm text-gray-700">Allergens (optional)</label>
                            <input id="editItemAllergens" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., Горіхи, Молочні продукти, Глютен" value={allergens} onChange={(e) => setAllergens(e.target.value)} />
                            <p className="text-xs text-gray-500 mt-1">Введіть алергени через кому</p>
                        </div>

                        <div className="mb-5 text-left">
                            <label htmlFor="editItemImg" className="block font-medium mb-2 text-sm text-gray-700">Image URL (optional)</label>
                            <input id="editItemImg" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="https://example.com/image.jpg" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                        </div>

                        {/* loginError */}
                        {error && <p className="text-red-700 bg-red-100 border border-red-300 rounded-lg p-3 text-sm text-center mt-4">{error}</p>}

                        {/* modalActions */}
                        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-200">
                            <button type="button" className="px-4 py-2 rounded-lg font-medium text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-60 disabled:cursor-not-allowed" onClick={handleClose} disabled={isLoading}>Скасувати</button>
                            <button type="submit" className="px-4 py-2 rounded-lg font-medium text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed" disabled={isLoading}>{isLoading ? 'Збереження...' : 'Зберегти Зміни'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}