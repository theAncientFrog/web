// app/manage/restaurants/[restaurantId]/categories/[categoryId]/items/page.js
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import AddItemModal from '@/components/AddItemModal';
import EditItemModal from '@/components/EditItemModal';
import { ChevronLeft, Plus, Settings, Trash2, User } from 'lucide-react';

export default function ManageItemsPage() {
    const [items, setItems] = useState([]);
    const [categoryName, setCategoryName] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState(null);
    const { data: session, status } = useSession();
    const params = useParams();
    const router = useRouter();
    const restaurantId = params.restaurantId;
    const categoryId = params.categoryId;

    useEffect(() => {
        if (status === 'authenticated' && restaurantId && categoryId) {
            const apiUrl = `/api/manage/restaurants/${restaurantId}/categories/${categoryId}/items`;
            fetch(apiUrl)
                .then((res) => {
                    if (!res.ok) {
                        if (res.status === 404 || res.status === 401) {
                            // Якщо категорія/ресторан не знайдені або доступ заборонено
                            router.push(`/manage/restaurants/${restaurantId}/categories`);
                        }
                        throw new Error('Failed to fetch items');
                    }
                    return res.json();
                })
                .then(setItems)
                .catch(console.error);
        }
    }, [status, restaurantId, categoryId, router]);

    const handleItemAdded = (newItem) => {
        setItems((prev) => [...prev, newItem]);
    };

    const openEditModal = (item) => {
        setItemToEdit(item);
        setIsEditModalOpen(true);
    };

    const handleItemUpdated = (updatedItem) => {
        setItems((prev) =>
            prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
        );
        setItemToEdit(null);
    };

    const handleDeleteItem = async (itemId) => {
        console.log(`Attempting to delete item: restaurantId=${restaurantId}, categoryId=${categoryId}, itemId=${itemId}`);
        
        if (!confirm('Ви впевнені, що хочете видалити цей товар?')) {
            return;
        }

        const apiUrl = `/api/manage/restaurants/${restaurantId}/categories/${categoryId}/items/${itemId}`;
        try {
            const res = await fetch(apiUrl, { method: 'DELETE' });
            if (!res.ok) {
                let errorData = { error: 'Failed to delete item' };
                try {
                    errorData = await res.json();
                } catch (jsonError) {
                    errorData.error = `Server responded with status ${res.status}`;
                }
                throw new Error(errorData.error);
            }
            setItems((prev) => prev.filter((item) => item.id !== itemId));
        } catch (error) {
            console.error('Delete item error:', error);
            alert(`Помилка видалення: ${error.message}`);
        }
    };


    if (status === 'loading') {
        // pageContainer + menuPageContainer + loadingText
        return (
            <main className="w-full min-h-screen flex flex-col bg-white justify-start">
                <div className="p-8 text-center text-gray-500">Завантаження...</div>
            </main>
        );
    }
    if (status === 'unauthenticated') {
        // pageContainer + menuPageContainer + loadingText
        return (
            <main className="w-full min-h-screen flex flex-col bg-white justify-start">
                <div className="p-8 text-center text-gray-500">Доступ заборонено.</div>
            </main>
        );
    }

    return (
        <>
            <AddItemModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onItemAdded={handleItemAdded}
                restaurantId={restaurantId}
                categoryId={categoryId}
            />
            <EditItemModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onItemUpdated={handleItemUpdated}
                itemToEdit={itemToEdit}
                restaurantId={restaurantId}
                categoryId={categoryId}
            />

            <main className="w-full min-h-screen flex flex-col bg-white justify-start">
                {/* manageContentWrapper */}
                <div className="max-w-6xl mx-auto w-full px-4 sm:px-8 py-6 sm:py-8">
                    
                    {/* manageHeader */}
                    <header className="flex justify-between items-center mb-8 pb-6 border-b border-gray-200 flex-wrap gap-4">
                        <div className="manageHeaderTitle">
                            <h1 className="m-0 text-sm font-semibold tracking-wider text-gray-900 uppercase">Breadcrumb</h1>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                           {/* profileIcon */}
                           {session?.user?.image ? (
                                <img src={session.user.image} alt="profile" className="w-6 h-6 rounded-full object-cover" />
                            ) : (
                                <User size={22} strokeWidth={2.5} className="text-gray-500"/>
                            )}
                        </div>
                    </header>

                    {/* manageSection */}
                    <section className="mb-8 sm:mb-12">
                        <div className="flex justify-between items-start mb-6 gap-4 flex-wrap">
                            <div>
                                {/* manageBackButton */}
                                <Link href={`/manage/restaurants/${restaurantId}/categories`} className="inline-flex items-center text-gray-600 no-underline text-sm mb-1 hover:underline">
                                    <ChevronLeft size={16} className="mr-1" />
                                    Manage Categories
                                </Link>
                                
                                <h2><strong className="text-2xl sm:text-3xl font-bold">Manage Items</strong> in {categoryName || `Category #${categoryId}`}</h2>
                                <p className="m-0 text-gray-500 text-base">Add, edit, or delete items in this category</p>
                            </div>
                            {/* manageAddButton */}
                            <button
                                className="bg-indigo-600 text-white border-none rounded-lg px-5 py-3 text-sm sm:text-base font-medium cursor-pointer whitespace-nowrap transition hover:bg-indigo-700 flex items-center gap-2"
                                onClick={() => setIsAddModalOpen(true)}
                            >
                                <Plus size={18} strokeWidth={3} />
                                Add Item
                            </button>
                        </div>

                        {/* manageItemList */}
                        <div className="flex flex-col gap-4">
                            {Array.isArray(items) && items.length > 0 ? (
                                items.map((item) => (
                                    // manageItemCard
                                    <div key={item.id} className="bg-white rounded-lg shadow-md flex items-center p-4 gap-4">
                                        {/* manageItemImage */}
                                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                            <Image
                                                src={item.imageUrl || '/images/placeholder.jpg'}
                                                alt={item.name}
                                                layout="fill"
                                                objectFit="cover"
                                            />
                                        </div>
                                        {/* manageItemInfo */}
                                        <div className="flex-grow text-left overflow-hidden">
                                            <h3 className="m-0 mb-0.5 text-base sm:text-lg font-semibold truncate">{item.name}</h3>
                                            <p className="m-0 mb-1 text-gray-500 text-sm truncate">{item.description || 'No description'}</p>
                                            <div className="flex flex-col gap-1 text-sm">
                                                {/* manageItemPrice */}
                                                <span className="font-semibold text-gray-800">{item.price.toFixed(2)} грн</span>
                                                {/* manageItemCalories and Allergens */}
                                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                                    {item.calories != null && <span>{item.calories} cal</span>}
                                                    {item.allergens && <span>• {item.allergens}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        {/* manageItemActions */}
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            {/* actionIcon */}
                                            <button className="text-gray-500 transition hover:text-indigo-600" onClick={() => openEditModal(item)}>
                                                <Settings size={20} />
                                            </button>
                                            <button className="text-gray-500 transition hover:text-red-500" onClick={() => handleDeleteItem(item.id)}>
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                // noDataText
                                <p className="text-gray-500 text-center p-8">No items added yet for this category.</p>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}