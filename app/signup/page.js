'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Building2, User } from 'lucide-react';

export default function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();
    const isOwnerMode = searchParams.get('role') === 'owner';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Додаємо role якщо це режим власника
                body: JSON.stringify({ 
                    name, 
                    email, 
                    password,
                    role: isOwnerMode ? 'OWNER' : 'CUSTOMER'
                }),
            });

            const data = await res.json(); // Читаємо відповідь у будь-якому випадку

            if (!res.ok) {
                throw new Error(data.message || 'Failed to sign up'); // Використовуємо 'message' з API
            }

            // 3. УСПІХ: Перекидаємо на сторінку верифікації з email
            router.push(`/verify-email?email=${email}`);

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <main className="w-full min-h-screen flex flex-col justify-center items-center p-4 bg-gray-100">
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-10 max-w-md w-full relative border-2" style={isOwnerMode ? { borderColor: '#4f46e5' } : { borderColor: '#10b981' }}>
                <Link href="/" className="absolute top-4 right-4 text-2xl text-gray-400 no-underline font-bold hover:text-gray-600">×</Link>
                
                {/* Mode Badge */}
                {isOwnerMode ? (
                    <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#eef2ff', color: '#4f46e5' }}>
                        <span>Реєстрація власника</span>
                    </div>
                ) : (
                    <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#d1fae5', color: '#059669' }}>
                        <span>Реєстрація користувача</span>
                    </div>
                )}

                {/* Title */}
                <div className="flex items-center gap-3 mb-6 sm:mb-8">
                    {isOwnerMode ? (
                        <Building2 size={28} style={{ color: '#4f46e5' }} />
                    ) : (
                        <User size={28} style={{ color: '#10b981' }} />
                    )}
                    <h1 className="text-2xl sm:text-3xl font-bold text-left" style={isOwnerMode ? { color: '#4f46e5' } : { color: '#10b981' }}>
                        {isOwnerMode ? 'Реєстрація власника' : 'Реєстрація'}
                    </h1>
                </div>

                {/* Info Banner */}
                {isOwnerMode ? (
                    <div className="mb-6 p-4 rounded-lg border" style={{ 
                        background: 'linear-gradient(to right, #eef2ff, #e0e7ff)', 
                        borderColor: '#c7d2fe' 
                    }}>
                        <div className="flex items-start gap-3">
                            <Building2 size={20} style={{ color: '#4f46e5', marginTop: '2px' }} className="flex-shrink-0" />
                            <div className="text-sm" style={{ color: '#4338ca' }}>
                                <p className="font-semibold mb-1">Реєстрація як власник закладу</p>
                                <p style={{ color: '#6366f1' }}>Після реєстрації ви зможете створювати та керувати своїми закладами харчування.</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="mb-6 p-4 rounded-lg border" style={{ 
                        background: 'linear-gradient(to right, #d1fae5, #a7f3d0)', 
                        borderColor: '#6ee7b7' 
                    }}>
                        <div className="flex items-start gap-3">
                            <User size={20} style={{ color: '#10b981', marginTop: '2px' }} className="flex-shrink-0" />
                            <div className="text-sm" style={{ color: '#059669' }}>
                                <p className="font-semibold mb-1">Реєстрація як користувач</p>
                                <p style={{ color: '#047857' }}>Після реєстрації ви зможете замовляти їжу та отримувати бонуси в наших закладах.</p>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    {/* 4. ДОДАНО БЛОК ДЛЯ 'NAME' */}
                    <div className="mb-5 text-left">
                        <label htmlFor="name" className="block font-medium mb-2 text-sm text-gray-700">
                            Ім'я
                        </label>
                        <input
                            type="text"
                            id="name"
                            className={`w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-base text-gray-900 transition focus:outline-none focus:ring-2 focus:border-transparent ${
                                isOwnerMode ? 'focus:ring-indigo-500' : 'focus:ring-green-500'
                            }`}
                            placeholder="Введіть ваше ім'я"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-5 text-left">
                        <label htmlFor="email" className="block font-medium mb-2 text-sm text-gray-700">
                            E-mail
                        </label>
                        <input
                            type="email"
                            id="email"
                            className={`w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-base text-gray-900 transition focus:outline-none focus:ring-2 focus:border-transparent ${
                                isOwnerMode ? 'focus:ring-indigo-500' : 'focus:ring-green-500'
                            }`}
                            placeholder="Введіть e-mail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-5 text-left">
                        <label htmlFor="password" className="block font-medium mb-2 text-sm text-gray-700">
                            Пароль
                        </label>
                        <input
                            type="password"
                            id="password"
                            className={`w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-base text-gray-900 transition focus:outline-none focus:ring-2 focus:border-transparent ${
                                isOwnerMode ? 'focus:ring-indigo-500' : 'focus:ring-green-500'
                            }`}
                            placeholder="Введіть пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <p className="text-red-700 bg-red-100 border border-red-200 rounded-lg p-3 text-center text-sm mt-4">{error}</p>}

                    <button 
                        type="submit" 
                        className="w-full p-3 sm:p-4 border-none rounded-lg text-white text-base sm:text-lg font-bold cursor-pointer mt-4 transition flex items-center justify-center gap-2 shadow-lg hover:opacity-90"
                        style={isOwnerMode ? { 
                            backgroundColor: '#4f46e5',
                            boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3), 0 4px 6px -2px rgba(79, 70, 229, 0.2)'
                        } : {
                            backgroundColor: '#10b981',
                            boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3), 0 4px 6px -2px rgba(16, 185, 129, 0.2)'
                        }}
                    >
                        {isOwnerMode ? 'Зареєструватися як власник' : 'Зареєструватись'}
                    </button>
                </form>

                <div className="flex justify-between mt-6 flex-wrap gap-2">
                    <Link 
                        href={isOwnerMode ? "/login?role=owner" : "/login"} 
                        className="text-sm cursor-pointer transition font-semibold underline"
                        style={isOwnerMode ? { color: '#4f46e5' } : { color: '#10b981' }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = isOwnerMode ? '#4338ca' : '#059669';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = isOwnerMode ? '#4f46e5' : '#10b981';
                        }}
                    >
                        Вже зареєстрований?
                    </Link>
                    {!isOwnerMode && (
                        <Link 
                            href="/signup?role=owner" 
                            className="font-semibold text-sm cursor-pointer transition flex items-center gap-1 underline"
                            style={{ color: '#10b981' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = '#059669';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = '#10b981';
                            }}
                        >
                            Реєстрація як власник
                        </Link>
                    )}
                </div>
            </div>
        </main>
    );
}
