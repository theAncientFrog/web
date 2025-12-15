// app/components/AddItemModal.js
'use client';

import { useState } from 'react';

export default function AddItemModal({ isOpen, onClose, onItemAdded, restaurantId, categoryId }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [calories, setCalories] = useState('');
    const [allergens, setAllergens] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleClose = () => {
        setName(''); setDescription(''); setPrice(''); setCalories(''); setAllergens(''); setImageUrl('');
        setError('');
        setIsLoading(false);
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const apiUrl = `/api/manage/restaurants/${restaurantId}/categories/${categoryId}/items`;

        const parsedPrice = parseFloat(price);
        const parsedCalories = calories ? parseInt(calories) : null;
        if (isNaN(parsedPrice) || (calories && isNaN(parsedCalories))) {
            setError('Price and Calories must be numbers.');
            setIsLoading(false);
            return;
        }


        try {
            const res = await fetch(apiUrl, {
                method: 'POST',
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
                throw new Error(data.error || 'Failed to add item');
            }

            onItemAdded(data);
            handleClose();

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
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
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">Add Item</h2>

                    <form onSubmit={handleSubmit}>
                        {/* inputGroup */}
                        <div className="mb-5 text-left">
                            <label htmlFor="itemName" className="block font-medium mb-2 text-sm text-gray-700">Item Name</label>
                            <input id="itemName" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter item name" value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>
                        <div className="mb-5 text-left">
                            <label htmlFor="itemDesc" className="block font-medium mb-2 text-sm text-gray-700">Description (optional)</label>
                            <textarea id="itemDesc" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base transition focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[80px]" placeholder="Describe the item..." value={description} onChange={(e) => setDescription(e.target.value)} rows="2" />
                        </div>
                        
                        {/* Рядок з ціною та калоріями */}
                        <div className="flex gap-4">
                            <div className="mb-5 text-left flex-1">
                                <label htmlFor="itemPrice" className="block font-medium mb-2 text-sm text-gray-700">Price (грн)</label>
                                <input id="itemPrice" type="number" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., 150.50" value={price} onChange={(e) => setPrice(e.target.value)} required />
                            </div>
                            <div className="mb-5 text-left flex-1">
                                <label htmlFor="itemCal" className="block font-medium mb-2 text-sm text-gray-700">Calories (optional)</label>
                                <input id="itemCal" type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., 350" value={calories} onChange={(e) => setCalories(e.target.value)} />
                            </div>
                        </div>

                        <div className="mb-5 text-left">
                            <label htmlFor="itemAllergens" className="block font-medium mb-2 text-sm text-gray-700">Allergens (optional)</label>
                            <input id="itemAllergens" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., Горіхи, Молочні продукти, Глютен" value={allergens} onChange={(e) => setAllergens(e.target.value)} />
                            <p className="text-xs text-gray-500 mt-1">Введіть алергени через кому</p>
                        </div>

                        <div className="mb-5 text-left">
                            <label htmlFor="itemImg" className="block font-medium mb-2 text-sm text-gray-700">Image URL (optional)</label>
                            <input id="itemImg" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="https://example.com/image.jpg" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                        </div>

                        {/* loginError */}
                        {error && <p className="text-red-700 bg-red-100 border border-red-300 rounded-lg p-3 text-sm text-center mt-4">{error}</p>}

                        {/* modalActions */}
                        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-200">
                            <button type="button" className="px-4 py-2 rounded-lg font-medium text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-60 disabled:cursor-not-allowed" onClick={handleClose} disabled={isLoading}>Скасувати</button>
                            <button type="submit" className="px-4 py-2 rounded-lg font-medium text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed" disabled={isLoading}>{isLoading ? 'Збереження...' : 'Зберегти'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}