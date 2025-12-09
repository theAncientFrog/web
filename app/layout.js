'use client';

import './globals.css';
import Providers from './providers';
import { useTranslation } from 'react-i18next';
import './lib/i18n';


export default function RootLayout({ children }) {
    const { i18n } = useTranslation();

    return (
        <html lang={i18n.language} suppressHydrationWarning={true}>
        <body className="bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-200 antialiased">
        <Providers>
            {children}
        </Providers>
        </body>
        </html>
    );
}