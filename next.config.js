/** @type {import('next').NextConfig} */
const nextConfig = {
    // Ігноруємо помилки ESLint під час білда
    eslint: {
        ignoreDuringBuilds: true,
    },
    // Ігноруємо помилки TypeScript під час білда
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        // Дозволяємо небезпечні зображення (для Supabase та інших зовнішніх доменів)
        dangerouslyAllowSVG: true,
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
        // Вимикаємо оптимізацію зображень для зовнішніх доменів (Supabase)
        // Зображення з Supabase вже використовують unoptimized={true} в компонентах
        unoptimized: false, // false для оптимізації, але unoptimized={true} в компонентах має пріоритет
        remotePatterns: [
            // Supabase Storage - додайте конкретний домен вашого Supabase проекту
            // Формат: { protocol: 'https', hostname: 'your-project-id.supabase.co' }
            // Увага: Next.js не підтримує wildcard в hostname
            // Але з unoptimized={true} в компонентах зображення мають працювати навіть без додавання домену тут
            // Якщо потрібно оптимізувати зображення, додайте ваш конкретний домен Supabase нижче:
            // Приклад: { protocol: 'https', hostname: 'abcdefghijklmnop.supabase.co' }
            // NextAuth/Google Photos
            { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
            // Власні домени та CDN
            { protocol: 'https', hostname: 'production.api.restaron.kitg.com.ua' },
            { protocol: 'https', hostname: 'cdn-media.choiceqr.com' },
            { protocol: 'https', hostname: 'www.lvivconvention.com.ua' },
            { protocol: 'https', hostname: 'lviv.travel' },
            { protocol: 'https', hostname: 'posteat.ua' },
            
            // Instagram / Meta CDN
            { protocol: 'https', hostname: 'instagram.fiev13-1.fna.fbcdn.net' },
            
            // Загальні домени
            { protocol: 'https', hostname: 'encrypted-tbn0.gstatic.com' },
            { protocol: 'https', hostname: 'rud.ua' },
            { protocol: 'https', hostname: 'tasty1.siteo.xyz' },
            { protocol: 'https', hostname: 'static.espreso.tv' },
            { protocol: 'https', hostname: 'images.gastronom.ru' },
            { protocol: 'https', hostname: 'static.tildacdn.com' },
            { protocol: 'https', hostname: 'klopotenko.com' },
            { protocol: 'https', hostname: 'images.unian.net' },
            { protocol: 'https', hostname: 'myastoriya.com.ua' },
            { protocol: 'https', hostname: 'www.herbalife.com' },
            { protocol: 'https', hostname: 'yapiko.com.ua' },
            { protocol: 'https', hostname: 'smachno.ua' },
            { protocol: 'https', hostname: 'schedryk.vn.ua' },
            { protocol: 'https', hostname: 'www.novavizia.com' },
            { protocol: 'https', hostname: 'la-torta.ua' },
            { protocol: 'https', hostname: 'lasunka.com' },
            { protocol: 'https', hostname: 'images.prom.ua' },
            { protocol: 'https', hostname: 'westcupgroup.com' },
            { protocol: 'https', hostname: 'delonghi-shop.by' },
            { protocol: 'https', hostname: 'i.pinimg.com' },
            { protocol: 'https', hostname: 'shuba.life' },
            { protocol: 'https', hostname: 'www.cocacolaep.com' },
            { protocol: 'https', hostname: 'simplewine.ru' },
            { protocol: 'https', hostname: 's13emagst.akamaized.net' },
            { protocol: 'https', hostname: 'cdn.vkusnoo.com.ua' },
            { protocol: 'https', hostname: 'eeu.alaskaseafood.org' },
            { protocol: 'https', hostname: 'myasnuyray.com.ua' },
            { protocol: 'https', hostname: 'bdaily.ru' },
            { protocol: 'https', hostname: 'static.apostrophe.ua' },
            { protocol: 'https', hostname: 'fayni-recepty.com.ua' },
            { protocol: 'https', hostname: 'ekava.com.ua' },
            { protocol: 'https', hostname: 'res.cloudinary.com' },
            { protocol: 'https', hostname: 'assets.tmecosys.com' },
            { protocol: 'https', hostname: 'en.opusonewinery.com' },
            { protocol: 'https', hostname: 'www.allrecipes.com' },
            { protocol: 'https', hostname: 'spirits-navigator.com' },
            { protocol: 'https', hostname: 'brand-assets.edrington.com' },
            { protocol: 'https', hostname: 'henrysliquorhouse.com' },
            { protocol: 'https', hostname: 'karelian-fish.ru' },
            { protocol: 'https', hostname: 'static.shaketopay.com.ua' },
            { protocol: 'https', hostname: 'bbq24.com.ua' },
            { protocol: 'https', hostname: 'gastropubfather.com' },
            { protocol: 'https', hostname: 'assets.dots.live' },
        ],
    },
};

module.exports = nextConfig;