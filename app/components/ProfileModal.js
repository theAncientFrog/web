// app/components/ProfileModal.js
'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { ThemeSwitcher } from './ThemeSwitcher';
import { LocaleSwitcher } from './LocaleSwitcher';
import { X, ArrowLeft, Loader2, Trophy, Settings, User, Mail, Save } from 'lucide-react';
import Image from 'next/image';

export default function ProfileModal({ isOpen, onClose }) {
    const {data: session, update} = useSession();

    // --- СТАНИ ---
    const [view, setView] = useState('main');
    const [achievements, setAchievements] = useState([]); // Для списку в "My Items"
    const [isLoading, setIsLoading] = useState(false); // Для списку в "My Items"
    const [error, setError] = useState(null); // Для списку в "My Items"

    // 💡 1. ОНОВЛЕНО: Зберігаємо також список найновіших ачівок
    const [summaryData, setSummaryData] = useState({
        achievementsCount: 0,
        visitedCount: 0,
        totalOrdersCount: 0
    });
    const [newestAchievements, setNewestAchievements] = useState([]); // ⬅️ НОВИЙ СТАН
    const [isSummaryLoading, setIsSummaryLoading] = useState(true);

    // Стани для налаштувань профілю
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [saveSuccess, setSaveSuccess] = useState(false);

    // app/components/ProfileModal.js

    // 💡 2. ОНОВЛЕНО: Ефект тепер завантажує дані окремо (більш надійно)
    useEffect(() => {
        if (isOpen) {
            setView('main'); // Завжди скидаємо на головний екран
            setIsSummaryLoading(true);

            // Скидаємо стани
            setSummaryData({ achievementsCount: 0, visitedCount: 0, totalOrdersCount: 0 });
            setNewestAchievements([]);
            // Ініціалізуємо поля редагування
            setEditName(session?.user?.name || '');
            setEditEmail(session?.user?.email || '');

            const fetchProfileData = async () => {

                // --- Запит 1: Статистика (Візити/К-сть ачівок) ---
                try {
                    const summaryRes = await fetch('/api/profile/summary');
                    if (summaryRes.ok) {
                        const summary = await summaryRes.json();
                        setSummaryData({
                            achievementsCount: summary.achievementsCount,
                            visitedCount: summary.visitedCount,
                            totalOrdersCount: summary.totalOrdersCount || 0
                        });
                    }
                } catch (summaryError) {
                    console.error("Не вдалося завантажити статистику:", summaryError);
                    // Не падаємо, просто залишаємо 0
                }

                // --- Запит 2: Список ачівок (для іконок) ---
                try {
                    const achievementsRes = await fetch('/api/achievements/my');
                    if (achievementsRes.ok) {
                        const achievementsList = await achievementsRes.json();
                        setNewestAchievements(achievementsList); // ⬅️ Зберігаємо список

                        // Також оновлюємо к-сть на випадок, якщо /summary впав
                        setSummaryData(prev => ({
                            ...prev,
                            achievementsCount: achievementsList.length
                        }));
                    }
                } catch (achError) {
                    console.error("Не вдалося завантажити список ачівок:", achError);
                    // Не падаємо, просто залишаємо []
                }

                // Встановлюємо завантаження в false в будь-якому випадку
                setIsSummaryLoading(false);
            };

            fetchProfileData();
        }
    }, [isOpen]);

    // --- Функції для "My Items" (без змін) ---
    const fetchAchievements = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Нам не потрібно знову завантажувати, ми вже маємо список!
            // Але для чистоти, якщо ви хочете "оновити" список при кліку:
            const res = await fetch('/api/achievements/my');
            if (!res.ok) throw new Error('Не вдалося завантажити ачівки');
            const data = await res.json();
            setAchievements(data); // Використовуємо 'achievements', а не 'newestAchievements'
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMyItemsClick = () => {
        setView('achievements');
        fetchAchievements();
    };

    const handleSettingsClick = () => {
        setView('settings');
        setEditName(session?.user?.name || '');
        setEditEmail(session?.user?.email || '');
        setSaveError('');
        setSaveSuccess(false);
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        setSaveError('');
        setSaveSuccess(false);

        try {
            const res = await fetch('/api/profile/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: editName,
                    email: editEmail
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Не вдалося оновити профіль');
            }

            setSaveSuccess(true);
            // Оновлюємо сесію
            await update(); // Оновлюємо сесію через NextAuth
            // Закриваємо модалку через 1.5 секунди після успішного збереження
            setTimeout(() => {
                setView('main');
                setSaveSuccess(false);
            }, 1500);

        } catch (err) {
            setSaveError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    // --- 🎨 3. ОНОВЛЕНО: Компонент Ачівок (додано класи теми) ---
    const AchievementsView = () => (
        // Додано: bg-white dark:bg-gray-800
        <div className="p-6 bg-white dark:bg-gray-800">
            <header className="flex items-center justify-between mb-4">
                {/* Додано: text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 */}
                <button
                    onClick={() => setView('main')}
                    className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    <ArrowLeft size={20}/>
                </button>
                {/* Додано: text-gray-900 dark:text-white */}
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Мої Ачівки</h2>
                <div className="w-8"/>
            </header>
            <div className="h-96 overflow-y-auto pr-2">
                {isLoading && (
                    <div className="flex justify-center items-center h-full">
                        <Loader2 size={32} className="animate-spin text-gray-400"/>
                    </div>
                )}
                {error && <p className="text-red-400 text-center">{error}</p>}
                {!isLoading && !error && achievements.length === 0 && (
                    <p className="text-gray-400 text-center pt-10">
                        У вас поки немає ачівок.
                    </p>
                )}
                {!isLoading && !error && achievements.length > 0 && (
                    <ul className="space-y-3">
                        {achievements.map((ach) => (
                            // Додано: bg-gray-100 dark:bg-gray-900
                            <li key={ach.id}
                                className="flex items-center gap-4 p-3 bg-gray-100 dark:bg-gray-900 rounded-lg">
                                {/* Додано: bg-gray-200 dark:bg-gray-700 */}
                                <div
                                    className="flex-shrink-0 w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                    <Trophy size={20} className="text-yellow-500"/>
                                </div>
                                <div>
                                    {/* Додано: text-gray-900 dark:text-white та text-gray-500 dark:text-gray-400 */}
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{ach.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{ach.description}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );

    // Компонент налаштувань профілю
    const SettingsView = () => (
        <div className="p-6 bg-white dark:bg-gray-800">
            <header className="flex items-center justify-between mb-6">
                <button
                    onClick={() => setView('main')}
                    className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    <ArrowLeft size={20}/>
                </button>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Налаштування профілю</h2>
                <div className="w-8"/>
            </header>

            <div className="space-y-4">
                {/* Аватар */}
                <div className="flex justify-center mb-6">
                    <div className="relative w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        {session?.user?.image ? (
                            <Image
                                src={session.user.image}
                                alt="Profile"
                                width={96}
                                height={96}
                                className="object-cover w-full h-full"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-500 dark:text-gray-400">
                                {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                        )}
                    </div>
                </div>

                {/* Ім'я */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <User size={16} className="inline mr-2" />
                        Ім'я
                    </label>
                    <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Введіть ваше ім'я"
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Mail size={16} className="inline mr-2" />
                        Email
                    </label>
                    <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Введіть ваш email"
                    />
                </div>

                {/* Повідомлення про помилку */}
                {saveError && (
                    <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg text-sm">
                        {saveError}
                    </div>
                )}

                {/* Повідомлення про успіх */}
                {saveSuccess && (
                    <div className="p-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg text-sm">
                        Профіль успішно оновлено!
                    </div>
                )}

                {/* Кнопка збереження */}
                <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <Save size={18} />
                    {isSaving ? 'Збереження...' : 'Зберегти зміни'}
                </button>
            </div>
        </div>
    );

    const MainView = ({summary, isLoading, achievements}) => (
        // Додано: bg-white dark:bg-gray-800
        <div className="p-6 bg-white dark:bg-gray-800">
            <header className="relative flex items-center justify-center pb-4">
                {/* Додано: text-gray-900 dark:text-white */}
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {session?.user?.role === 'OWNER' ? 'Restaurant Owner' : 'Profile'}
                </h2>
                {/* Додано: text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 */}
                <button
                    onClick={onClose}
                    className="absolute top-0 right-0 p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                    <X size={20}/>
                </button>
            </header>

            {/* Аватар та основна інформація */}
            <div className="flex flex-col items-center mb-6">
                <div className="relative w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mb-3">
                    {session?.user?.image ? (
                        <Image
                            src={session.user.image}
                            alt="Profile"
                            width={80}
                            height={80}
                            className="object-cover w-full h-full"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-500 dark:text-gray-400">
                            {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                    )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {session?.user?.name || 'Користувач'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{session?.user?.email}</p>
            </div>

            {/* Статистика (ОНОВЛЕНО) */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                {/* Картка Візитів */}
                <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded-lg text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Відвідано</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {isLoading ? '...' : summary.visitedCount}
                    </p>
                </div>
                {/* Картка Ачівок */}
                <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded-lg text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Ачівки</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {isLoading ? '...' : summary.achievementsCount}
                    </p>
                </div>
                {/* Картка Замовлень */}
                <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded-lg text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Замовлень</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {isLoading ? '...' : summary.totalOrdersCount}
                    </p>
                </div>
            </div>

            <div className="flex gap-2 mb-4">
                <button
                    onClick={handleMyItemsClick}
                    className="flex-1 bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                    Мої ачівки
                </button>
                <button
                    onClick={handleSettingsClick}
                    className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                >
                    <Settings size={18} />
                    Налаштування
                </button>
            </div>

            {/* 🏆 5. ОНОВЛЕНО: Секція ачівок тепер показує іконки */}
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Achievements</h3>

            {isLoading ? (
                <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg text-center text-gray-500 text-sm mb-4">
                    Завантаження...
                </div>
            ) : achievements && achievements.length > 0 ? (
                // Показуємо іконки, якщо ачівки є
                <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg flex justify-center space-x-3">
                    {/* Беремо перші 4 найновіші ачівки */}
                    {achievements.slice(0, 4).map((ach) => (
                        <div
                            key={ach.id}
                            className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center"
                            title={ach.name} // ⬅️ Назва з'явиться при наведенні
                        >
                            <Trophy size={24} className="text-yellow-500"/>
                        </div>
                    ))}
                </div>
            ) : (
                // Текст, якщо ачівок немає
                <div
                    className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg text-center text-gray-500 dark:text-gray-400 text-sm mb-4">
                    You have no achievements yet. Make your first order!
                </div>
            )}

            {/* Перемикачі (без змін) */}
            <ThemeSwitcher/>
            <div className="h-2"/>
            <LocaleSwitcher/>

            {/* Додано: text-gray-500 dark:text-gray-400 ... */}
            <button
                onClick={() => signOut({callbackUrl: '/'})}
                className="w-full mt-4 text-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white py-2"
            >
                Log Out
            </button>
        </div>
    );
// --- ГОЛОВНИЙ РЕНДЕР (ОНОВЛЕНО) ---
    return (
        <div className={`
      fixed inset-0 z-50 p-4
      ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'} 
      transition-opacity
      flex items-center justify-center
    `}>
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />

            <div className="relative w-full max-w-md mx-3 sm:mx-0">
                {/* 🎨 6. ОНОВЛЕНО: Головна обгортка тепер теж реагує на тему */}
                <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 rounded-2xl shadow-lg overflow-hidden">
                    {view === 'main' ? (
                        <MainView
                            summary={summaryData}
                            isLoading={isSummaryLoading}
                            achievements={newestAchievements} // ⬅️ Передаємо список ачівок
                        />
                    ) : view === 'achievements' ? (
                        <AchievementsView />
                    ) : (
                        <SettingsView />
                    )}
                </div>
            </div>
        </div>
    );
} // ⬅️ ❗️ І найголовніше, додайте цю закриваючу дужку в кінці!