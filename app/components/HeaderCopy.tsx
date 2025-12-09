import React from 'react';
import Link from 'next/link'; 
import LoginButton from './LoginButtom';
// Типи для цього хедера
interface BreadcrumbHeaderProps {
  breadcrumpText: string;
  description: string;
  forceLightTheme?: boolean;
}

const BreadcrumbHeader: React.FC<BreadcrumbHeaderProps> = ({ 
  breadcrumpText = "Breadcrumb", 
  description = "Смак починається з меню",
  forceLightTheme = false
}) => {
  return (
    // Знімаємо sticky та тінь, оскільки на макеті вони не виражені
    <header className={`bg-white ${forceLightTheme ? '' : 'dark:bg-gray-800'} border-b border-gray-100 ${forceLightTheme ? '' : 'dark:border-gray-700'}`}> 
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 flex justify-between items-center">
        
        {/* Ліва частина: Breadcrumb та Опис */}
        {/* Link веде на корінь або ту ж сторінку */}
        <Link href="/homepage" passHref legacyBehavior> 
            <div className="flex flex-col cursor-pointer hover:opacity-90 transition-opacity min-w-0 flex-1">
                
                {/* Заголовок Breadcrumb (зелений) */}
                <h1 className={`text-lg sm:text-xl md:text-2xl font-bold text-green-600 ${forceLightTheme ? '' : 'dark:text-green-400'} truncate`}>
                    {breadcrumpText}
                </h1>
                
                {/* Опис */}
                <p className={`text-xs sm:text-sm text-gray-500 ${forceLightTheme ? '' : 'dark:text-gray-400'} line-clamp-1`}>
                    {description}
                </p>
            </div>
        </Link>

        {/* Права частина: Іконка Користувача (як на макеті) */}
        <div className="flex items-center space-x-4">
          
          {/* Іконка Користувача */}

          <LoginButton>
          </LoginButton>

        </div>
      </div>
    </header>
  );
};

export default BreadcrumbHeader;