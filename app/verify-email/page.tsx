import { Suspense } from 'react';
import VerifyEmailForm from './verify-form';

// Цей компонент тепер є Server Component за замовчуванням
export default function VerifyEmailPage() {
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
                
                {/* Suspense тепер працюватиме коректно, бо він у Server Component */}
                <Suspense fallback={
                    <div className="space-y-6">
                        <div className="animate-pulse">
                            <div className="h-10 bg-gray-200 rounded-md mb-4"></div>
                            <div className="h-10 bg-gray-200 rounded-md mb-4"></div>
                            <div className="h-10 bg-gray-200 rounded-md"></div>
                        </div>
                    </div>
                }>
                    <VerifyEmailForm />
                </Suspense>
            </div>
        </div>
    );
}