'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Settings, Edit, Globe, BarChart, Palette, Image, Tag } from 'lucide-react';

export default function SystemPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>Назад</span>
          </button>
          <div className="flex items-center gap-3 mb-2">
            <Settings className="text-green-600" size={40} />
            <h1 className="text-4xl font-bold text-gray-900">Система</h1>
          </div>
          <p className="text-xl text-gray-600">Потужні інструменти для керування меню</p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-12">
          
          {/* Editor Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Edit className="text-green-600" size={32} />
              <h2 className="text-3xl font-bold text-gray-900">Редактор меню</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-6">
              Наш інтуїтивно зрозумілий редактор дозволяє легко створювати та керувати меню 
              без необхідності технічних знань. Всі зміни відображаються миттєво для ваших гостей.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-green-50 rounded-xl border border-green-100">
                <div className="flex items-center gap-3 mb-3">
                  <Image className="text-green-600" size={24} />
                  <h3 className="font-semibold text-lg text-gray-900">Фото та описи</h3>
                </div>
                <p className="text-gray-700 text-sm">
                  Легко додавайте високоякісні фото страв, детальні описи інгредієнтів та 
                  інформацію про калорійність. Зробіть ваше меню привабливим та інформативним.
                </p>
              </div>
              <div className="p-6 bg-green-50 rounded-xl border border-green-100">
                <div className="flex items-center gap-3 mb-3">
                  <Tag className="text-green-600" size={24} />
                  <h3 className="font-semibold text-lg text-gray-900">Маркування алергенів</h3>
                </div>
                <p className="text-gray-700 text-sm">
                  Відмічайте алергени та особливі дієтичні обмеження для кожної страви. 
                  Гості зможуть легко знайти підходящі для них опції.
                </p>
              </div>
              <div className="p-6 bg-green-50 rounded-xl border border-green-100">
                <div className="flex items-center gap-3 mb-3">
                  <Edit className="text-green-600" size={24} />
                  <h3 className="font-semibold text-lg text-gray-900">Категорії та підкатегорії</h3>
                </div>
                <p className="text-gray-700 text-sm">
                  Організуйте меню за допомогою ієрархічної структури категорій. 
                  Створюйте головні розділи та підкатегорії для зручної навігації.
                </p>
              </div>
              <div className="p-6 bg-green-50 rounded-xl border border-green-100">
                <div className="flex items-center gap-3 mb-3">
                  <Settings className="text-green-600" size={24} />
                  <h3 className="font-semibold text-lg text-gray-900">Швидке редагування</h3>
                </div>
                <p className="text-gray-700 text-sm">
                  Змінюйте ціни, додавайте або приховуйте страви одним кліком. 
                  Всі зміни зберігаються автоматично та відображаються миттєво.
                </p>
              </div>
            </div>
          </section>

          {/* Multilanguage Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Globe className="text-green-600" size={32} />
              <h2 className="text-2xl font-bold text-gray-900">Багатомовність</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              Розширте свою цільову аудиторію завдяки підтримці багатьох мов. 
              Ваше меню може бути доступним для міжнародних гостей та туристів.
            </p>
            <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
              <h3 className="font-semibold text-lg text-gray-900 mb-3">Підтримувані мови</h3>
              <div className="flex flex-wrap gap-2">
                {['Українська', 'Англійська', 'Польська', 'Німецька', 'Французька', 'Іспанська'].map((lang) => (
                  <span key={lang} className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 border border-blue-200">
                    {lang}
                  </span>
                ))}
              </div>
              <p className="text-gray-600 text-sm mt-4">
                Легко додавайте переклади для всіх страв та категорій. Гості автоматично 
                бачать меню своєю мовою залежно від налаштувань їхнього пристрою.
              </p>
            </div>
          </section>

          {/* Analytics Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <BarChart className="text-green-600" size={32} />
              <h2 className="text-2xl font-bold text-gray-900">Аналітика</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-6">
              Отримуйте детальну статистику про популярність ваших страв та поведінку гостей. 
              Ці дані допоможуть вам оптимізувати меню та покращити бізнес-показники.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Популярність страв</h3>
                <p className="text-gray-600 text-sm">
                  Дізнайтеся, які страви переглядаються найчастіше та які найбільш популярні серед гостей.
                </p>
              </div>
              <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Час перегляду</h3>
                <p className="text-gray-600 text-sm">
                  Аналізуйте, скільки часу гості проводять у меню та на яких розділах вони затримуються.
                </p>
              </div>
              <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Тренди</h3>
                <p className="text-gray-600 text-sm">
                  Відстежуйте зміни у попиті на різні категорії страв та адаптуйте меню відповідно.
                </p>
              </div>
            </div>
          </section>

          {/* Customization Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Palette className="text-green-600" size={32} />
              <h2 className="text-2xl font-bold text-gray-900">Налаштування дизайну</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-6">
              Створіть унікальний вигляд меню, який відповідає вашому фірмовому стилю. 
              Повна кастомізація дозволяє зробити меню продовженням вашого бренду.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border border-green-100">
                <h3 className="font-semibold text-lg text-gray-900 mb-3">Кольори та шрифти</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">•</span>
                    <span>Вибір кольорової палітри відповідно до вашого бренду</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">•</span>
                    <span>Вибір шрифтів та розмірів тексту</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">•</span>
                    <span>Налаштування стилю кнопок та елементів</span>
                  </li>
                </ul>
              </div>
              <div className="p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border border-green-100">
                <h3 className="font-semibold text-lg text-gray-900 mb-3">Брендинг</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">•</span>
                    <span>Додавання логотипу та банерів</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">•</span>
                    <span>Кастомні фони та зображення</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">•</span>
                    <span>Налаштування структури та макету</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}

