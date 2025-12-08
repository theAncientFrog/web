'use client';

import { X, Eye, Filter, Info } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function MenuSettingsModal({ isOpen, onClose }) {
  const [showCalories, setShowCalories] = useState(true);
  const [showAllergens, setShowAllergens] = useState(true);

  useEffect(() => {
    // Завантажуємо налаштування з localStorage
    const savedShowCalories = localStorage.getItem('menu_showCalories');
    const savedShowAllergens = localStorage.getItem('menu_showAllergens');
    
    if (savedShowCalories !== null) setShowCalories(savedShowCalories === 'true');
    if (savedShowAllergens !== null) setShowAllergens(savedShowAllergens === 'true');
  }, []);

  useEffect(() => {
    // Зберігаємо налаштування в localStorage
    localStorage.setItem('menu_showCalories', showCalories.toString());
    localStorage.setItem('menu_showAllergens', showAllergens.toString());
    
    // Відправляємо подію для оновлення всіх компонентів MenuItem
    window.dispatchEvent(new Event('menuSettingsChanged'));
  }, [showCalories, showAllergens]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Налаштування меню</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
          >
            <X size={24} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Show Calories */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Eye className="text-gray-700 dark:text-gray-300" size={20} />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Показувати калорії</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Відображати інформацію про калорійність страв
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCalories(!showCalories)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showCalories ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showCalories ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Show Allergens */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Filter className="text-gray-700 dark:text-gray-300" size={20} />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Показувати алергени</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Відображати маркування алергенів у стравах
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAllergens(!showAllergens)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showAllergens ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showAllergens ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Info Section */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Info className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">Про налаштування</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Ваші налаштування зберігаються автоматично та застосовуються до всіх меню, 
                  які ви переглядаєте.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
}

