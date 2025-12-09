// components/HowItWorksBanner.tsx
'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';

const HowItWorksBanner: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <section id="system" className="mb-12">
      <div className="bg-gradient-to-r from-[#288A1F] to-[#27C167] rounded-3xl p-8 lg:p-12 text-white flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0 shadow-xl">
        
        <div className="max-w-md text-center lg:text-left flex-1">
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 leading-tight">
            {t('banners.how_it_works.title')}
          </h2>
          <Link href="/system">
            <button className="bg-white text-green-600 font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition-colors shadow-lg">
              {t('banners.how_it_works.button')}
            </button>
          </Link>
        </div>
        
        <div className="w-full max-w-xs lg:ml-8 flex justify-center mb-12">
          <img 
            src="/images/how_works.png" 
            alt={t('banners.how_it_works.image_alt')} 
            className="max-h-200  object-contain translate-y-6"
            style={{ transform: 'translateY(24px)' }} 
          />
        </div>
      </div>
    </section>
  );
};

export default HowItWorksBanner;