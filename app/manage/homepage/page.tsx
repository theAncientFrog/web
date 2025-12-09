'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function ManageHomepage() {
    const router = useRouter();
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'loading') return;
        
        if (status === 'authenticated' && session?.user?.role === 'OWNER') {
            // Перенаправляємо на сторінку управління ресторанами
            router.replace('/manage/restaurants');
        } else {
            // Якщо не власник, перенаправляємо на головну
            router.replace('/');
        }
    }, [status, session, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-gray-500 dark:text-gray-400">Завантаження...</div>
        </div>
    );
}

