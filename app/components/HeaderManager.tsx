import React from 'react';
import Link from 'next/link';

// Оскільки в Manager Mode немає динамічних пропсів (назви ресторану тощо),
// інтерфейс пропсів тут може бути відсутній або бути простим.
// Ми залишаємо його без пропсів для максимальної простоти.

// SVG Іконка Користувача (як у вашому прикладі)
const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg 
    className="w-6 h-6" 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14c4.418 0 8 1.79 8 4v2H4v-2c0-2.21 3.582-4 8-4z"></path>
  </svg>
);

const HeaderManager: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 lg:px-6 py-6 flex justify-between items-center">
        
        {/* ЛІВА ЧАСТИНА: Breadcrumb */}
        {/* Посилаємося на головний дашборд менеджера */}
        <Link href="/manager/dashboard" passHref legacyBehavior> 
            <div className="cursor-pointer hover:opacity-80 transition-opacity">
                <h1 className="text-lg font-bold text-gray-900 tracking-wider">
                    Breadcrumb
                </h1>
            </div>
        </Link>

        {/* ПРАВА ЧАСТИНА: Іконка Користувача */}
        <div className="flex items-center space-x-4">
          
          {/* Іконка Користувача (Профіль менеджера) */}
          <Link href="/manager/profile" passHref legacyBehavior>
            <button 
              className="text-gray-600 hover:text-gray-800 transition-colors p-1 rounded-full hover:bg-gray-100"
              aria-label="Профіль менеджера"
            >
              <UserIcon />
            </button>
          </Link>

        </div>
      </div>
    </header>
  );
};

export default HeaderManager;