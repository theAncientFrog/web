'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plug, CheckCircle, UserPlus, Upload, Settings, QrCode, HelpCircle } from 'lucide-react';

export default function ConnectionPage() {
  const router = useRouter();
  const steps = [
    {
      number: 1,
      title: 'Реєстрація',
      icon: UserPlus,
      description: 'Створіть обліковий запис власника закладу. Це займе лише кілька хвилин.',
      details: [
        'Вкажіть основну інформацію про ваш заклад',
        'Підтвердіть email адресу',
        'Отримайте доступ до панелі керування',
      ],
    },
    {
      number: 2,
      title: 'Налаштування меню',
      icon: Upload,
      description: 'Завантажте ваші страви, фото та описи. Наш інтуїтивний редактор зробить це простим.',
      details: [
        'Додайте категорії та підкатегорії',
        'Завантажте фото страв',
        'Вкажіть ціни та описи',
        'Маркуйте алергени та особливості',
      ],
    },
    {
      number: 3,
      title: 'Оберіть тариф',
      icon: Settings,
      description: 'Виберіть план, який відповідає розміру вашого закладу та потребам.',
      details: [
        'Порівняйте доступні тарифи',
        'Спробуйте безкоштовний пробний період',
        'Оберіть місячну або річну оплату',
      ],
    },
    {
      number: 4,
      title: 'Генеруйте QR-коди',
      icon: QrCode,
      description: 'Створіть унікальні QR-коди для кожного столика або зони вашого закладу.',
      details: [
        'Налаштуйте дизайн QR-коду',
        'Завантажте та роздрукуйте коди',
        'Розмістіть коди на столах',
      ],
    },
  ];

  const faqs = [
    {
      question: 'Скільки часу займає налаштування?',
      answer: 'Базове налаштування займає близько 30-60 хвилин. Ви можете зробити це самостійно або з нашою допомогою.',
    },
    {
      question: 'Чи потрібні технічні знання?',
      answer: 'Ні, наш інтерфейс інтуїтивно зрозумілий. Якщо виникнуть питання, наша служба підтримки завжди готова допомогти.',
    },
    {
      question: 'Чи можу я змінити меню після налаштування?',
      answer: 'Так, ви можете оновлювати меню в будь-який час. Всі зміни відображаються миттєво для ваших гостей.',
    },
    {
      question: 'Як отримати допомогу?',
      answer: 'Ви можете звернутися до нашої служби підтримки через email, телефон або онлайн-чат. Ми працюємо 24/7.',
    },
  ];

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
            <Plug className="text-green-600" size={40} />
            <h1 className="text-4xl font-bold text-gray-900">Підключення</h1>
          </div>
          <p className="text-xl text-gray-600">Простий посібник для початку роботи</p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-12">
          
          {/* Steps */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Крок за кроком</h2>
            <div className="space-y-8">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.number} className="relative">
                    {index < steps.length - 1 && (
                      <div className="absolute left-8 top-16 w-0.5 h-full bg-green-200" />
                    )}
                    <div className="flex gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {step.number}
                        </div>
                      </div>
                      <div className="flex-1 pb-8">
                        <div className="flex items-center gap-3 mb-3">
                          <Icon className="text-green-600" size={24} />
                          <h3 className="text-2xl font-bold text-gray-900">{step.title}</h3>
                        </div>
                        <p className="text-gray-700 mb-4">{step.description}</p>
                        <ul className="space-y-2">
                          {step.details.map((detail, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-gray-600">
                              <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Support Section */}
          <section className="pt-8 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <HelpCircle className="text-green-600" size={32} />
              <h2 className="text-2xl font-bold text-gray-900">Підтримка</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-6">
              Якщо у вас виникли питання або потрібна допомога, наша команда підтримки завжди готова 
              допомогти вам. Ми працюємо 24/7 та відповідаємо на запити протягом кількох годин.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                <p className="text-gray-600 text-sm">support@breadcrumb.com</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <h3 className="font-semibold text-gray-900 mb-2">Телефон</h3>
                <p className="text-gray-600 text-sm">+380 66 161 4886</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <h3 className="font-semibold text-gray-900 mb-2">Онлайн-чат</h3>
                <p className="text-gray-600 text-sm">Доступний 24/7</p>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Часті запитання</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="p-5 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-700 text-sm">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="pt-8 border-t border-gray-200 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Готові почати?</h2>
            <p className="text-gray-700 mb-6">
              Зареєструйтеся зараз та отримайте 14 днів безкоштовного доступу до всіх функцій
            </p>
            <Link
              href="/signup?role=owner"
              className="inline-block px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Почати безкоштовно
            </Link>
          </section>

        </div>
      </div>
    </main>
  );
}

