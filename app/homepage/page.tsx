"use client";

import React, { useState } from 'react';
import RecentlyVisited from '@/app/components/RecentlyVisited';
import EstablishmentsSection from '@/app/components/EstablishmentsSection';
import Header from '@/app/components/Header';
import HowItWorksBanner from '@/app/components/banners/HowItWorksBanner';
import ProfileModal from '@/app/components/ProfileModal';
import Footer from '@/app/components/Footer';

const Homepage: React.FC = () => {
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    const handleProfileClick = () => {
        setIsProfileModalOpen(true);
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
            <Header
                breadcrumpText="Breadcrumb"
                description="Смак починається з мене"
                onProfileClick={handleProfileClick}
            />

            <main className="container mx-auto px-4 py-8 max-w-7xl">
                <RecentlyVisited />
                <EstablishmentsSection />
                <HowItWorksBanner />
            </main>

            <Footer />

            <ProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
            />
        </div>
    );
};

export default Homepage;

