'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, QrCode, Smartphone, Scan, Eye, Shield, RefreshCw, DollarSign } from 'lucide-react';

export default function QRCodePage() {
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
            <QrCode className="text-green-600" size={40} />
            <h1 className="text-4xl font-bold text-gray-900">QR-код меню</h1>
          </div>
          <p className="text-xl text-gray-600">Простий та зручний спосіб перегляду меню</p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-12">
          
          {/* How It Works Section */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Як це працює?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-green-50 rounded-xl border border-green-100">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
                  <Scan className="text-white" size={32} />
                </div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Крок 1: Скануйте</h3>
                <p className="text-gray-700 text-sm">
                  Відскануйте QR-код на столі за допомогою камери вашого смартфона
                </p>
              </div>
              <div className="text-center p-6 bg-green-50 rounded-xl border border-green-100">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
                  <Smartphone className="text-white" size={32} />
                </div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Крок 2: Переглядайте</h3>
                <p className="text-gray-700 text-sm">
                  Меню автоматично відкриється на вашому пристрої з усіма стравами та цінами
                </p>
              </div>
              <div className="text-center p-6 bg-green-50 rounded-xl border border-green-100">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
                  <Eye className="text-white" size={32} />
                </div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Крок 3: Оберіть</h3>
                <p className="text-gray-700 text-sm">
                  Переглядайте детальні описи, фото та обирайте страви, які вам до вподоби
                </p>
              </div>
            </div>
          </section>

          {/* Benefits for Guests */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Переваги для гостей</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <Shield className="text-green-600 flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Безконтактний досвід</h3>
                  <p className="text-gray-700">
                    Не потрібно торкатися паперових меню. Особливо важливо для підвищення гігієни 
                    та безпеки в умовах пандемії.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <Smartphone className="text-green-600 flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Зручність</h3>
                  <p className="text-gray-700">
                    Меню завжди під рукою на вашому телефоні. Можна переглядати в будь-який час, 
                    збільшувати фото та читати детальні описи.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <RefreshCw className="text-green-600 flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Актуальна інформація</h3>
                  <p className="text-gray-700">
                    Завжди бачите актуальні ціни, доступні страви та спеціальні пропозиції. 
                    Немає несподіванок з "стоп-листами".
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Benefits for Restaurants */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Переваги для закладів</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-green-50 rounded-xl border border-green-100">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="text-green-600" size={24} />
                  <h3 className="font-semibold text-lg text-gray-900">Підвищена гігієна</h3>
                </div>
                <p className="text-gray-700">
                  Безконтактний досвід означає менше точок дотику та вищу гігієну для ваших гостей.
                </p>
              </div>
              <div className="p-6 bg-green-50 rounded-xl border border-green-100">
                <div className="flex items-center gap-3 mb-3">
                  <RefreshCw className="text-green-600" size={24} />
                  <h3 className="font-semibold text-lg text-gray-900">Миттєве оновлення</h3>
                </div>
                <p className="text-gray-700">
                  Змінюйте ціни, додавайте нові страви, створюйте спеціальні пропозиції або 
                  "стоп-листи" — зміни відображаються одразу для всіх гостей.
                </p>
              </div>
              <div className="p-6 bg-green-50 rounded-xl border border-green-100">
                <div className="flex items-center gap-3 mb-3">
                  <DollarSign className="text-green-600" size={24} />
                  <h3 className="font-semibold text-lg text-gray-900">Економія коштів</h3>
                </div>
                <p className="text-gray-700">
                  Значно зменште витрати на друк та ламінування паперових меню. 
                  Один раз налаштуйте систему — і економте щодня.
                </p>
              </div>
              <div className="p-6 bg-green-50 rounded-xl border border-green-100">
                <div className="flex items-center gap-3 mb-3">
                  <QrCode className="text-green-600" size={24} />
                  <h3 className="font-semibold text-lg text-gray-900">Брендинг</h3>
                </div>
                <p className="text-gray-700">
                  Створюйте стильні QR-коди з вашим логотипом та фірмовим дизайном, 
                  які стануть частиною вашого бренду.
                </p>
              </div>
            </div>
          </section>

          {/* QR Code Design */}
          <section className="pt-6 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Дизайн QR-коду</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Ми розуміємо, що QR-код — це не просто технічний елемент, а частина вашого 
              брендингу. Тому ми пропонуємо повну кастомізацію дизайну QR-коду:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Додавання вашого логотипу в центр QR-коду</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Вибір кольорів відповідно до вашого фірмового стилю</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Різні стилі та форми QR-коду</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Додавання тексту та інструкцій навколо коду</span>
              </li>
            </ul>
          </section>

        </div>
      </div>
    </main>
  );
}

