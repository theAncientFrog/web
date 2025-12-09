"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function VerifyEmailForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Отримуємо email з URL
    const [email, setEmail] = useState('');
    
    // Використовуємо useEffect, щоб уникнути помилок гідратації при зчитуванні params
    useEffect(() => {
        const emailParam = searchParams.get('email');
        if (emailParam) {
            setEmail(emailParam);
        }
    }, [searchParams]);

    const [code, setCode] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const res = await fetch('/api/auth/verify-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Щось пішло не так');
            }

            setMessage(data.message);
            setTimeout(() => {
                // Перевіряємо, чи є параметр table в URL (з QR коду)
                const tableParam = searchParams.get('table');
                const restaurantParam = searchParams.get('restaurantId');
                
                if (tableParam && restaurantParam) {
                    // Якщо реєстрація була через QR код, перекидаємо на меню з параметром table
                    router.push(`/menu-secondary/${restaurantParam}?table=${tableParam}`);
                } else {
                    // Інакше перекидаємо на логін
                    router.push('/login');
                }
            }, 3000);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                </label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full rounded-md bg-white border-gray-300 shadow-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="your@email.com"
                />
            </div>

            <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                    Код верифікації
                </label>
                <input
                    id="code"
                    name="code"
                    type="text"
                    maxLength={6}
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="mt-1 block w-full rounded-md bg-white border-gray-300 shadow-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="123456"
                />
            </div>

            {message && (
                <p className="text-center font-medium text-green-600">{message}</p>
            )}
            {error && (
                <p className="text-center font-medium text-red-600">{error}</p>
            )}

            <div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                >
                    {isLoading ? 'Перевірка...' : 'Верифікувати'}
                </button>
            </div>
        </form>
    );
}