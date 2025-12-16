// app/login/page.js
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';
import { Mail, Lock, User, LogIn, Building2 } from 'lucide-react'; 

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session, status, update } = useSession();
    const isOwnerMode = searchParams.get('role') === 'owner'; 

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
            
            // Перевіряємо, чи є параметр table в URL (з QR коду)
            const tableParam = searchParams.get('table');
            const restaurantParam = searchParams.get('restaurantId');
            
            if (userRole === 'OWNER') {
                router.push('/manage/restaurants'); 
            } else {
                // Якщо логін був через QR код, перекидаємо на меню з параметром table
                if (tableParam && restaurantParam) {
                    router.push(`/menu-secondary/${restaurantParam}?table=${tableParam}`);
                } else {
                    router.push('/homepage');
                }
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
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-10 max-w-md w-full relative border-2" style={isOwnerMode ? { borderColor: '#4f46e5' } : { borderColor: '#10b981' }}>

                {/* loginCloseBtn */}
                <Link href="/" className="absolute top-4 right-4 text-2xl text-gray-400 no-underline font-bold hover:text-gray-600">×</Link>

                {/* Mode Badge */}
                {isOwnerMode ? (
                    <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#eef2ff', color: '#4f46e5' }}>
                        <span>Режим власника</span>
                    </div>
                ) : (
                    <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#d1fae5', color: '#059669' }}>
                        <span>Режим користувача</span>
                    </div>
                )}

                {/* loginTitle */}
                <div className="flex items-center gap-3 mb-6 sm:mb-8">
                    {isOwnerMode ? (
                        <Building2 size={28} style={{ color: '#4f46e5' }} />
                    ) : (
                        <User size={28} style={{ color: '#10b981' }} />
                    )}
                    <h1 className="text-2xl sm:text-3xl font-bold text-left" style={isOwnerMode ? { color: '#4f46e5' } : { color: '#10b981' }}>
                        {isOwnerMode ? 'Вхід як власник' : 'Вхід'}
                    </h1>
                </div>

                <form onSubmit={handleLogin}>

                    {/* inputGroup */}
                    <div className="mb-4 sm:mb-5 text-left">
                        {/* loginInput */}
                        <div className="relative">
                            <input
                                type="email"
                                className={`w-full px-4 py-3 pl-10 bg-white border border-gray-300 rounded-lg text-base text-gray-900 transition focus:outline-none focus:ring-2 focus:border-transparent ${
                                    isOwnerMode ? 'focus:ring-indigo-500' : 'focus:ring-green-500'
                                }`}
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
                                className={`w-full px-4 py-3 pl-10 bg-white border border-gray-300 rounded-lg text-base text-gray-900 transition focus:outline-none focus:ring-2 focus:border-transparent ${
                                    isOwnerMode ? 'focus:ring-indigo-500' : 'focus:ring-green-500'
                                }`}
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
                        <LogIn size={20} />
                        {isOwnerMode ? 'Увійти як власник' : 'Вхід'}
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
                    {!isOwnerMode ? (
                        <Link 
                            href="/login?role=owner" 
                            className="text-sm cursor-pointer transition flex items-center gap-1 font-semibold underline"
                            style={{ color: '#10b981' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = '#059669';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = '#10b981';
                            }}
                        >
                            <Building2 size={14} />
                            Увійти як власник
                        </Link>
                    ) : (
                        <Link 
                            href="/login" 
                            className="text-sm cursor-pointer transition font-semibold underline"
                            style={{ color: '#4f46e5' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = '#4338ca';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = '#4f46e5';
                            }}
                        >
                            Звичайний вхід
                        </Link>
                    )}
                    {/* loginLink (для реєстрації) */}
                    <Link 
                        href={isOwnerMode ? "/signup?role=owner" : "/signup"} 
                        className="text-sm cursor-pointer transition flex items-center gap-1 font-semibold underline"
                        style={isOwnerMode ? { color: '#4f46e5' } : { color: '#10b981' }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = isOwnerMode ? '#4338ca' : '#059669';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = isOwnerMode ? '#4f46e5' : '#10b981';
                        }}
                    >
                        {isOwnerMode ? 'Зареєструватися як власник' : 'Ще не зареєстрований?'}
                    </Link>
                </div>
            </div>
        </main>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <main className="w-full min-h-screen flex flex-col justify-center items-center p-4 bg-gray-100">
                <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-10 max-w-md w-full">
                    <div className="p-8 text-center text-gray-500">Завантаження...</div>
                </div>
            </main>
        }>
            <LoginForm />
        </Suspense>
    );
}