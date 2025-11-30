"use client"; // <--- 1. Додано, щоб ми могли використовувати хуки (useState)

import React, { useState } from 'react'; // <--- 2. Імпортовано useState
import RecentlyVisited from '@/app/components/RecentlyVisited';
import EstablishmentsSection from '@/app/components/EstablishmentsSection';
import Header from '@/app/components/Header';
import HowItWorksBanner from '@/app/components/banners/HowItWorksBanner';
import ProfileModal from '@/app/components/ProfileModal'; // <--- 3. Імпортовано модальне вікно профілю
import Footer from '@/app/components/Footer';

const Homepage: React.FC = () => { // <-- Я перейменував з DashboardPage, бо це homepage

    // 4. Додаємо стан, щоб знати, відкрите модальне вікно чи ні
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    // 5. Це функція, яку ми передамо в Header
    const handleProfileClick = () => {
        setIsProfileModalOpen(true);
    };

    return (
        // Ваш скріншот показує 'flex-col min-h-screen bg-gray-50', але не показує 'div'
        // Я припускаю, що це батьківський div
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
            <Header
                breadcrumpText="Breadcrump"
                description="Смак починається з мене"
                onProfileClick={handleProfileClick} // <--- 6. Передаємо проп, якого вимагав Header
            />

            <main className="container mx-auto px-4 py-8 max-w-7xl">
                <RecentlyVisited />
                <EstablishmentsSection />
                <HowItWorksBanner />
            </main>

            <Footer />

            {/* 7. ВИПРАВЛЕННЯ:
        Помилка TS2741 означає, що <ProfileModal> ОБОВ'ЯЗКОВО
        очікує prop 'isOpen'.
        Ми передаємо 'isOpen={isProfileModalOpen}'
        і прибираємо 'isProfileModalOpen &&',
        оскільки компонент модалки тепер сам керує своєю видимістю.
      */}
            <ProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
            />
        </div>
    );
};

export default Homepage;

