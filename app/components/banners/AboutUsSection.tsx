// components/AboutUsSection.tsx
'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

const AboutUsSection: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <section id="about-us" className="mb-12">
      <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-xl flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
        
        <div className="w-full lg:w-1/2">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">{t('banners.about_us.title')}</h2>
          
          <p className="text-lg text-gray-600 leading-relaxed">
            {t('banners.about_us.description')}
          </p>
        </div>
        
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-end mt-6 lg:mt-0">
          <img 
            src="/images/about-us-illustration.png" 
            alt={t('banners.about_us.image_alt')} 
            className="max-w-xs object-contain"
          />
        </div>
      </div>
    </section>
  );
};

export default AboutUsSection;