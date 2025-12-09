// middleware.js
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
    // `withAuth` розширює ваш `req` об'єктом `token`
    function middleware(req) {
        // Перевіряємо, чи користувач намагається зайти в /manage
        // і чи має він роль OWNER
        if (
            req.nextUrl.pathname.startsWith('/manage') &&
            req.nextauth.token?.role !== 'OWNER' // Зверніть увагу на ?.role
        ) {
            // Якщо не власник - перенаправляємо на головну
            return NextResponse.redirect(new URL('/', req.url));
        }

        // Якщо це власник або інша сторінка - пропускаємо
        return NextResponse.next();
    },
    {
        callbacks: {
            // Ця функція визначає, чи *взагалі* залогінений користувач
            authorized: ({ token }) => !!token, // !!token перетворює null/undefined на false
        },
        // Якщо користувач не залогінений, перекидаємо на сторінку входу
        pages: {
            signIn: '/login',
        },
    }
);

// Вказуємо, до яких шляхів застосовувати цей middleware
export const config = {
    matcher: [
        '/manage/:path*', // Всі сторінки, що починаються з /manage
        // Прибрано /menu/:path* та /menu-secondary/:path* - меню має бути доступним для всіх
    ],
};