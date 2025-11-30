'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
    const [name, setName] = useState(''); // <-- 1. ДОДАНО СТАН ДЛЯ ІМЕНІ
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // 2. ДОДАНО 'name' В ТІЛО ЗАПИТУ
                body: JSON.stringify({ name, email, password }),
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
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-10 max-w-md w-full relative">
                <Link href="/" className="absolute top-4 right-4 text-2xl text-gray-400 no-underline font-bold hover:text-gray-600">×</Link>
                <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-900 text-left">Реєстрація</h1>

                <form onSubmit={handleSubmit}>

                    {/* 4. ДОДАНО БЛОК ДЛЯ 'NAME' */}
                    <div className="mb-5 text-left">
                        <label htmlFor="name" className="block font-medium mb-2 text-sm text-gray-700">
                            Ім'я
                        </label>
                        <input
                            type="text"
                            id="name"
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-base text-gray-900 transition focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-base text-gray-900 transition focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-base text-gray-900 transition focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Введіть пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <p className="text-red-700 bg-red-100 border border-red-200 rounded-lg p-3 text-center text-sm mt-4">{error}</p>}

                    <button type="submit" className="w-full p-3 sm:p-4 border-none rounded-lg bg-green-500 text-white text-base sm:text-lg font-bold cursor-pointer mt-4 transition hover:bg-green-600">
                        Зареєструватись
                    </button>
                </form>

                <div className="flex justify-between mt-6 flex-wrap gap-2">
                    <Link href="/login" className="text-gray-600 underline text-sm cursor-pointer transition hover:text-black">
                        Вже зареєстрований?
                    </Link>
                </div>
            </div>
        </main>
    );
}
