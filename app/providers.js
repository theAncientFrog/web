'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import './lib/i18n';
import { CartProvider } from '@/context/CartContext';

export default function Providers({ children }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <SessionProvider>
                <CartProvider>
                    {children}
                </CartProvider>
            </SessionProvider>
        </ThemeProvider>
    );
}