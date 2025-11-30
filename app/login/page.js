// app/login/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';
import { Mail, Lock, User, LogIn } from 'lucide-react'; 

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const { data: session, status, update } = useSession(); 

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        const result = await signIn('credentials', {
            redirect: false,
            email: email,
            password: password,
        });

        if (result.error) {
            setError(result.error);
        } else if (result.ok) {

            const updatedSession = await update();
            const userRole = updatedSession?.user?.role || session?.user?.role;
            
            if (userRole === 'OWNER') {
                router.push('/manage/restaurants'); 
            } else {
                router.push('/homepage');
            }
        }
    };


    const handleGoogleSignIn = () => {

        signIn('google', { callbackUrl: '/auth/check-role' });
    };


    if (status === 'loading') {

        return (
            <main className="w-full min-h-screen flex flex-col justify-center items-center bg-gray-100">
                <div className="p-8 text-center text-gray-500">Завантаження сесії...</div>
            </main>
        );
    }
    

    if (status === 'authenticated') {

        if (session?.user?.role === 'OWNER') {
             router.replace('/manage/restaurants');
        } else {
             router.replace('/homepage');
        }
        return null;
    }


    return (

        <main className="w-full min-h-screen flex flex-col justify-center items-center p-4 bg-gray-100">

            {/* loginContentWrapper */}
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-10 max-w-md w-full relative">

                {/* loginCloseBtn */}
                <Link href="/" className="absolute top-4 right-4 text-2xl text-gray-400 no-underline font-bold hover:text-gray-600">×</Link>

                {/* loginTitle */}
                <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-900 text-left">Вхід</h1>

                <form onSubmit={handleLogin}>

                    {/* inputGroup */}
                    <div className="mb-4 sm:mb-5 text-left">
                        {/* loginInput */}
                        <div className="relative">
                            <input
                                type="email"
                                className="w-full px-4 py-3 pl-10 bg-white border border-gray-300 rounded-lg text-base text-gray-900 transition focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Введіть e-mail"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>
                    {/* inputGroup */}
                    <div className="mb-4 sm:mb-5 text-left">
                        <div className="relative">
                            <input
                                type="password"
                                className="w-full px-4 py-3 pl-10 bg-white border border-gray-300 rounded-lg text-base text-gray-900 transition focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Пароль"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>

                    {/* loginError */}
                    {error && <p className="text-red-700 bg-red-100 border border-red-200 rounded-lg p-3 text-center text-sm mt-4">{error}</p>}

                    {/* loginSubmitBtn */}
                    <button type="submit" className="w-full p-3 sm:p-4 border-none rounded-lg bg-green-500 text-white text-base sm:text-lg font-bold cursor-pointer mt-4 transition hover:bg-green-600 flex items-center justify-center gap-2">
                        <LogIn size={20} /> Вхід
                    </button>
                </form>

                {/* googleBtn */}
                <button
                    className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg bg-white text-gray-700 text-sm sm:text-base font-medium cursor-pointer mt-4 flex items-center justify-center gap-2 transition hover:bg-gray-50"
                    onClick={handleGoogleSignIn}
                >
                    <span className="font-bold text-lg text-red-600">G</span> Продовжити через Google
                </button>

                {/* loginLinks */}
                <div className="flex justify-between mt-6 sm:mt-8 flex-wrap gap-2">
                    {/* loginLink (для власника) */}
                    <Link href="/login?role=owner" className="text-gray-600 underline text-sm cursor-pointer transition hover:text-black">
                        Увійти як власник
                    </Link>
                    {/* loginLink (для реєстрації) */}
                    <Link href="/signup" className="text-gray-600 underline text-sm cursor-pointer transition hover:text-black">
                        Ще не зареєстрований?
                    </Link>
                </div>
            </div>
        </main>
    );
}