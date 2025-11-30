/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            // NextAuth/Google Photos
            { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
            // Власні домени та CDN
            { protocol: 'https', hostname: 'production.api.restaron.kitg.com.ua' },
            { protocol: 'https', hostname: 'cdn-media.choiceqr.com' },
            { protocol: 'https', hostname: 'cdn-ua.bodo.gift' },
            { protocol: 'https', hostname: 'www.lvivconvention.com.ua' },
            { protocol: 'https', hostname: 'lviv.travel' },
            { protocol: 'https', hostname: 'posteat.ua' },
            
            // Instagram / Meta CDN (використовується для багатьох фото)
            { protocol: 'https', hostname: 'instagram.fiev13-1.fna.fbcdn.net' },
            // Instagram / Meta CDN (загальний)
            { protocol: 'https', hostname: 'scontent-iev1-1.cdninstagram.com' }, 
            
            // Загальні домени (які ви вже мали)
            { protocol: 'https', hostname: 'encrypted-tbn0.gstatic.com' }, // Google CDN для мініатюр

            // Домени для фото страв
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
            { protocol: 'https', hostname: 'www.allrecipes.com' },
            { protocol: 'https', hostname: 'assets.tmecosys.com' },
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