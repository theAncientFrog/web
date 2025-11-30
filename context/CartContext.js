// context/CartContext.js
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    
    // 💡 1. Новий стан для відстеження ID ресторану в кошику
    const [cartRestaurantId, setCartRestaurantId] = useState(null);
    
    // Стан, щоб уникнути помилок гідратації при роботі з localStorage
    const [isCartLoaded, setIsCartLoaded] = useState(false);

    // 💡 Отримуємо сесію для доступу до userId
    const { data: session, status } = useSession();
    const userId = session?.user?.id;

    // 💡 Функція для отримання ключів localStorage з урахуванням userId
    // Використовуємо useMemo, щоб уникнути зайвих перерахунків
    const storageKeys = userId 
        ? {
            items: `cartItems_${userId}`,
            restaurant: `cartRestaurantId_${userId}`
        }
        : {
            items: 'cartItems_guest',
            restaurant: 'cartRestaurantId_guest'
        };

    // 💡 2. Завантаження кошика з localStorage при першому завантаженні або зміні користувача
    useEffect(() => {
        // Чекаємо, поки сесія завантажиться
        if (status === 'loading') return;

        try {
            const itemsFromStorage = localStorage.getItem(storageKeys.items);
            const restaurantIdFromStorage = localStorage.getItem(storageKeys.restaurant);
            
            if (itemsFromStorage) {
                setCartItems(JSON.parse(itemsFromStorage));
            } else {
                setCartItems([]);
            }
            
            if (restaurantIdFromStorage) {
                setCartRestaurantId(restaurantIdFromStorage);
            } else {
                setCartRestaurantId(null);
            }
        } catch (error) {
            console.error("Failed to load cart from localStorage", error);
            // Очищуємо сховище у разі пошкоджених даних
            localStorage.removeItem(storageKeys.items);
            localStorage.removeItem(storageKeys.restaurant);
            setCartItems([]);
            setCartRestaurantId(null);
        }
        setIsCartLoaded(true);
    }, [status, userId]); // Завантажуємо кошик при зміні користувача

    // 💡 3. Збереження кошика в localStorage при будь-яких змінах
    useEffect(() => {
        // Не зберігаємо, поки кошик не завантажено або сесія не завантажена
        if (!isCartLoaded || status === 'loading') return; 
        
        try {
            localStorage.setItem(storageKeys.items, JSON.stringify(cartItems));
            
            if (cartRestaurantId) {
                localStorage.setItem(storageKeys.restaurant, cartRestaurantId);
            } else {
                localStorage.removeItem(storageKeys.restaurant);
            }
        } catch (error) {
            console.error("Failed to save cart to localStorage", error);
        }
    }, [cartItems, cartRestaurantId, isCartLoaded, status, userId, storageKeys]);

    /**
     * 💡 4. ОНОВЛЕНА ФУНКЦІЯ addToCart
     * Тепер приймає 'dish' (об'єкт страви) та 'restaurantId' (ID ресторану)
     */
    const addToCart = (dish, restaurantId) => {
        // Перевіряємо, чи ресторан збігається
        if (cartItems.length > 0 && cartRestaurantId !== restaurantId) {
            alert(
                'Ваш кошик містить страви з іншого ресторану. ' +
                'Будь ласка, очистіть кошик, перш ніж додавати нові страви.'
            );
            return; // ⬅️ Зупиняємо виконання
        }

        // Якщо кошик був порожній, "блокуємо" його під цей ресторан
        if (cartItems.length === 0) {
            setCartRestaurantId(restaurantId);
        }

        // Логіка додавання товару
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === dish.id);
            
            if (existingItem) {
                // Збільшуємо кількість
                return prevItems.map(item =>
                    item.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                // Додаємо новий товар
                return [...prevItems, { ...dish, quantity: 1 }];
            }
        });
    };

    /**
     * 💡 5. ОНОВЛЕНА ФУНКЦІЯ clearCart
     * Тепер також очищує ID ресторану та localStorage для поточного користувача
     */
    const clearCart = () => {
        setCartItems([]);
        setCartRestaurantId(null);
        
        // Очищуємо localStorage для поточного користувача
        try {
            localStorage.removeItem(storageKeys.items);
            localStorage.removeItem(storageKeys.restaurant);
        } catch (error) {
            console.error("Failed to clear cart from localStorage", error);
        }
    };

    // --- Інші функції кошика (оновлені, щоб скидати restaurantId) ---

    const removeFromCart = (dishId) => {
        setCartItems(prevItems => {
            const newItems = prevItems.filter(item => item.id !== dishId);
            // Якщо кошик став порожнім, скидаємо ID ресторану
            if (newItems.length === 0) {
                setCartRestaurantId(null);
            }
            return newItems;
        });
    };

    const updateQuantity = (dishId, quantity) => {
        if (quantity <= 0) {
            // Якщо кількість 0 або менше, видаляємо товар
            removeFromCart(dishId);
            return;
        }

        setCartItems(prevItems => 
            prevItems.map(item =>
                item.id === dishId ? { ...item, quantity: quantity } : item
            )
        );
    };

    // --- Обчислювані значення ---

    const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);
    
    const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                cartRestaurantId, // Можна використовувати для UI
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                cartCount,
                cartTotal,
                cartDetails: cartItems, // (З вашого CartModal)
                isCartLoaded, // Корисно, щоб не показувати 0 в кошику до завантаження
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

// Hook для легкого доступу до контексту
export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};