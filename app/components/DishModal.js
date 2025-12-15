'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Plus, Send, User, Star } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
import { useCart } from '@/context/CartContext';

export default function DishModal({ isOpen, onClose, dish, restaurantId }) {
    const { t, i18n } = useTranslation();
    const { data: session, status: sessionStatus } = useSession();
    const { addToCart } = useCart();
    
    // Визначаємо поточну мову та вибираємо відповідні назви/описи
    // API вже повертає локалізовані дані (без nameEn, descriptionEn, allergensEn)
    // Тому просто використовуємо name, description, allergens, які вже містять правильну мову
    const dishName = dish?.name || '';
    const dishDescription = dish?.description || null;
    const dishAllergens = dish?.allergens || '';
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [newRating, setNewRating] = useState(0);
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [userAlreadyCommented, setUserAlreadyCommented] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [showCalories, setShowCalories] = useState(true);
    const [showAllergens, setShowAllergens] = useState(true);

    // Завантажуємо налаштування
    useEffect(() => {
        const savedShowCalories = localStorage.getItem('menu_showCalories');
        const savedShowAllergens = localStorage.getItem('menu_showAllergens');
        
        if (savedShowCalories !== null) setShowCalories(savedShowCalories === 'true');
        if (savedShowAllergens !== null) setShowAllergens(savedShowAllergens === 'true');
    }, []);

    // Завантажуємо коментарі при відкритті модального вікна
    useEffect(() => {
        if (isOpen && dish?.id) {
            loadComments();
        }
    }, [isOpen, dish?.id]);

    const loadComments = async () => {
        if (!dish?.id) return;

        setIsLoadingComments(true);
        try {
            const res = await fetch(`/api/comments?dishId=${dish.id}`);
            if (res.ok) {
                const data = await res.json();
                const commentsArray = Array.isArray(data) ? data : [];
                setComments(commentsArray);

                // Перевіряємо, чи користувач вже залишив коментар
                if (session?.user?.id) {
                    const userId = session.user.id;
                    const hasCommented = commentsArray.some(comment => comment.userId === userId);
                    setUserAlreadyCommented(hasCommented);
                }
            }
        } catch (error) {
            console.error('Error loading comments:', error);
        } finally {
            setIsLoadingComments(false);
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();

        console.log('DishModal: Attempting to submit comment');
        console.log('DishModal: Session status:', sessionStatus);
        console.log('DishModal: Session exists:', !!session);
        console.log('DishModal: Session user exists:', !!session?.user);
        console.log('DishModal: Session user ID:', session?.user?.id, 'type:', typeof session?.user?.id);
        console.log('DishModal: Comment text:', newComment.trim());

        if (sessionStatus === 'loading') {
            return; // Чекаємо завантаження сесії
        }

        if (!session || !session.user || !newComment.trim()) {
            if (!session) {
                alert('Будь ласка, увійдіть в систему, щоб залишити коментар.');
            }
            return;
        }

        setIsSubmittingComment(true);
        try {
            const res = await fetch('/api/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    dishId: dish.id,
                    text: newComment.trim(),
                    rating: newRating > 0 ? newRating : undefined,
                }),
            });

            const data = await res.json();
            
            if (res.ok) {
                setNewComment('');
                setNewRating(0);
                loadComments(); // Перезавантажуємо коментарі
            } else {
                console.error('Error submitting comment:', data);
                alert(`Помилка: ${data.error || 'Невідома помилка'}`);
            }
        } catch (error) {
            console.error('Error submitting comment:', error);
            alert('Помилка при відправці коментаря. Спробуйте ще раз.');
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleAddToCart = () => {
        setIsAddingToCart(true);
        addToCart(
            {
                id: dish.id,
                name: dishName,
                price: discountedPrice, // Використовуємо ціну зі знижкою
                originalPrice: originalPrice,
                imageUrl: dish.imageUrl || '/images/placeholder.jpg',
            },
            restaurantId
        );
        setTimeout(() => setIsAddingToCart(false), 300);
    };

    if (!isOpen || !dish) return null;

    const originalPrice = dish.originalPrice || dish.price;
    const discountedPrice = dish.price; // Ціна вже включає знижку
    const discountPercent = dish.discountPercent || 0;
    const hasDiscount = discountPercent > 0;
    const discountSource = dish.discountSource || 'restaurant';
    const hasCalories = dish.calories !== null && dish.calories !== undefined && dish.calories > 0;
    const hasAllergens = dish.allergens && dish.allergens.trim().length > 0;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" 
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{dishName}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
                    >
                        <X size={24} className="text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="overflow-y-auto flex-1 p-6">
                    {/* Зображення */}
                    <div className="relative w-full h-64 mb-6 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                        <Image
                            src={dish.imageUrl || '/images/placeholder.jpg'}
                            alt={dishName}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 672px"
                        />
                    </div>

                    {/* Опис */}
                    {dishDescription && (
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            {dishDescription}
                        </p>
                    )}

                    {/* Калорійність та алергени */}
                    <div className="mb-6 space-y-3">
                        {hasCalories && showCalories && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-medium">{t('menu.calories_label')}:</span>
                                <span>{dish.calories} {t('menu.kcal')}</span>
                            </div>
                        )}
                        
                        {hasAllergens && showAllergens && dishAllergens && (
                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">{t('menu.allergens_label')}:</span>
                                <div className="flex flex-wrap gap-2">
                                    {dishAllergens.split(',').map((allergen, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800"
                                        >
                                            {allergen.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Ціна */}
                    <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                        {hasDiscount ? (
                            <div className="flex items-center gap-3">
                                <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                                    {discountedPrice.toFixed(2)} {t('menu.currency')}
                                </span>
                                <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
                                    {originalPrice.toFixed(2)} {t('menu.currency')}
                                </span>
                                <span className="text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                                    -{discountPercent.toFixed(1)}% {discountSource === 'restaurant' ? 'від закладу' : 'від категорії'}
                                </span>
                            </div>
                        ) : (
                            <span className="text-3xl font-bold text-gray-900 dark:text-white">
                                {originalPrice.toFixed(2)} {t('menu.currency')}
                            </span>
                        )}
                    </div>

                    {/* Коментарі */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Коментарі ({comments.length})
                        </h3>

                        {/* Список коментарів */}
                        <div className="space-y-4 max-h-64 overflow-y-auto">
                            {isLoadingComments ? (
                                <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                                    Завантаження коментарів...
                                </div>
                            ) : comments.length === 0 ? (
                                <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                                    Поки що немає коментарів. Будьте першим!
                                </div>
                            ) : (
                                comments.map((comment) => (
                                    <div 
                                        key={comment.id} 
                                        className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                                {comment.user?.name?.charAt(0) || 'U'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-gray-900 dark:text-white text-sm">
                                                        {comment.user?.name || 'Анонімний користувач'}
                                                    </span>
                                                    {comment.rating && (
                                                        <div className="flex items-center gap-1">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    size={12}
                                                                    className={`${
                                                                        i < comment.rating
                                                                            ? 'text-yellow-400 fill-yellow-400'
                                                                            : 'text-gray-300 dark:text-gray-600'
                                                                    }`}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {new Date(comment.createdAt).toLocaleDateString('uk-UA', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                                    {comment.text}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Інформація про авторизацію */}
                        {sessionStatus === 'loading' ? (
                            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Перевірка авторизації...
                                </p>
                            </div>
                        ) : session ? (
                            userAlreadyCommented ? (
                                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                    <p className="text-sm text-green-700 dark:text-green-300">
                                        Ви вже залишили коментар до цієї страви
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmitComment} className="mt-4">
                                    {/* Рейтинг зірок */}
                                    <div className="mb-3">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Оцініть страву (необов'язково)
                                        </label>
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setNewRating(star)}
                                                    className="p-1 hover:scale-110 transition-transform"
                                                >
                                                    <Star
                                                        size={24}
                                                        className={`${
                                                            star <= newRating
                                                                ? 'text-yellow-400 fill-yellow-400'
                                                                : 'text-gray-300 dark:text-gray-600 hover:text-yellow-400'
                                                        }`}
                                                    />
                                                </button>
                                            ))}
                                            {newRating > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setNewRating(0)}
                                                    className="ml-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                                >
                                                    Очистити
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <textarea
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Напишіть коментар..."
                                            rows={3}
                                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newComment.trim() || isSubmittingComment || sessionStatus === 'loading'}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            <Send size={18} />
                                        </button>
                                    </div>
                                </form>
                            )
                        ) : (
                            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    Увійдіть, щоб залишити коментар
                                </p>
                                {process.env.NODE_ENV === 'development' && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        Session status: {sessionStatus} | User: {session ? 'logged in' : 'not logged in'}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer з кнопкою додавання до кошика */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={handleAddToCart}
                        disabled={isAddingToCart}
                        className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <Plus size={20} />
                        <span>Додати до кошика</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

