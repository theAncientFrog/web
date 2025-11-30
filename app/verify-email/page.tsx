"use client"; // Ця сторінка інтерактивна

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function VerifyEmailPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Отримуємо email з URL (напр. /verify-email?email=test@test.com)
    const [email, setEmail] = useState(searchParams.get('email') || '');
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

            // Успіх
            setMessage(data.message);
            // Перенаправляємо на сторінку логіну через 3 секунди
            setTimeout(() => {
                router.push('/login');
            }, 3000);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
                <h2 className="mb-6 text-center text-3xl font-bold text-gray-900">
                    Верифікація пошти
                </h2>
                <p className="mb-6 text-center text-sm text-gray-600">
                    Ми надіслали 6-значний код на вашу пошту.
                    Будь ласка, введіть його нижче.
                </p>
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
            </div>
        </div>
    );
}
