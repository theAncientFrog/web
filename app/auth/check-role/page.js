'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function CheckRolePage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'authenticated') {
            if (session?.user?.role === 'OWNER') {
                router.replace('/manage/restaurants');
            } else {
                router.replace('/homepage');
            }
        } else if (status === 'unauthenticated') {
            router.replace('/login');
        }
    }, [status, session, router]);

    return (
        <main className="w-full min-h-screen flex flex-col bg-white justify-start">
            <div className="p-8 text-center text-gray-600">
                Перевірка ролі...
            </div>
        </main>
    );
}