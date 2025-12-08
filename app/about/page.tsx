'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Target, Zap, Leaf, Users } from 'lucide-react';

export default function AboutPage() {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Про нас</h1>
          <p className="text-xl text-gray-600">Наша місія та цінності</p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">
          
          {/* Mission Section */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Target className="text-green-600" size={32} />
              <h2 className="text-3xl font-bold text-gray-900">Наша місія</h2>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed">
              Breadcrumb — це інноваційний сервіс, створений для модернізації ресторанного бізнесу. 
              Ми прагнемо зробити взаємодію між закладами харчування та їх гостями максимально зручною, 
              швидкою та екологічною.
            </p>
          </section>

          {/* Story Section */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Наша історія</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Ідея Breadcrumb народилася з бажання вирішити реальні проблеми ресторанного бізнесу: 
              постійні витрати на друк паперових меню, складність оновлення цін та спеціальних пропозицій, 
              а також необхідність забезпечити безконтактний досвід для гостей.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Ми розробили комплексне цифрове рішення, яке дозволяє закладам легко створювати, 
              оновлювати та керувати своїми меню, економлячи час і кошти, водночас покращуючи 
              досвід гостей.
            </p>
          </section>

          {/* Advantages Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Zap className="text-green-600" size={28} />
              <h2 className="text-2xl font-bold text-gray-900">Наші переваги</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-green-50 rounded-xl border border-green-100">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Швидкість</h3>
                <p className="text-gray-700">
                  Миттєве оновлення меню без необхідності перевидання. Зміни відображаються 
                  одразу для всіх гостей.
                </p>
              </div>
              <div className="p-6 bg-green-50 rounded-xl border border-green-100">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Екологічність</h3>
                <p className="text-gray-700">
                  Відмовтеся від паперових меню та зробіть свій внесок у захист навколишнього 
                  середовища. Цифрові меню — це майбутнє.
                </p>
              </div>
              <div className="p-6 bg-green-50 rounded-xl border border-green-100">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Економія</h3>
                <p className="text-gray-700">
                  Значно зменште витрати на друк та ламінування меню. Один раз налаштуйте 
                  систему — і економте щодня.
                </p>
              </div>
              <div className="p-6 bg-green-50 rounded-xl border border-green-100">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Гнучкість</h3>
                <p className="text-gray-700">
                  Легко додавайте нові страви, змінюйте ціни, створюйте спеціальні пропозиції 
                  та "стоп-листи" в реальному часі.
                </p>
              </div>
            </div>
          </section>

          {/* Values Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Users className="text-green-600" size={28} />
              <h2 className="text-2xl font-bold text-gray-900">Наші цінності</h2>
            </div>
            <ul className="space-y-4 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold text-xl">•</span>
                <span><strong className="text-gray-900">Інновації:</strong> Ми постійно розвиваємося та впроваджуємо нові технології для покращення сервісу.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold text-xl">•</span>
                <span><strong className="text-gray-900">Простота:</strong> Наші рішення інтуїтивно зрозумілі та легкі у використанні.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold text-xl">•</span>
                <span><strong className="text-gray-900">Надійність:</strong> Ми гарантуємо стабільну роботу системи та швидку підтримку.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold text-xl">•</span>
                <span><strong className="text-gray-900">Партнерство:</strong> Ми працюємо разом з нашими клієнтами для досягнення їхніх цілей.</span>
              </li>
            </ul>
          </section>

          {/* Team Section */}
          <section className="pt-6 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Наша команда</h2>
            <p className="text-gray-700 leading-relaxed">
              За Breadcrumb стоїть команда досвідчених розробників, дизайнерів та фахівців 
              з ресторанного бізнесу, які об'єдналися з метою створення найкращого цифрового 
              рішення для закладів харчування. Ми розуміємо потреби бізнесу та прагнемо 
              забезпечити найвищу якість сервісу.
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}

