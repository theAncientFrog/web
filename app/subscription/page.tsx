'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Check, Star, Zap, Building2 } from 'lucide-react';

export default function SubscriptionPage() {
  const router = useRouter();
  const plans = [
    {
      name: 'Базовий',
      price: '299',
      period: 'місяць',
      description: 'Ідеально для невеликих кафе та стартапів',
      features: [
        'До 50 страв',
        '1 мова',
        'Базовий дизайн',
        'QR-коди',
        'Email підтримка',
      ],
      popular: false,
    },
    {
      name: 'Стандарт',
      price: '599',
      period: 'місяць',
      description: 'Для середніх закладів з активною діяльністю',
      features: [
        'До 200 страв',
        '3 мови',
        'Повна кастомізація',
        'Необмежені QR-коди',
        'Аналітика',
        'Пріоритетна підтримка',
      ],
      popular: true,
    },
    {
      name: 'Преміум',
      price: '1199',
      period: 'місяць',
      description: 'Для мереж ресторанів та великих закладів',
      features: [
        'Необмежена кількість страв',
        'Всі мови',
        'Повна кастомізація',
        'Необмежені QR-коди',
        'Розширена аналітика',
        'API інтеграції',
        'Персональний менеджер',
        '24/7 підтримка',
      ],
      popular: false,
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <button 
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>Назад</span>
          </button>
          <div className="flex items-center justify-center gap-3 mb-2">
            <CreditCard className="text-green-600" size={40} />
            <h1 className="text-4xl font-bold text-gray-900">Тарифи та підписка</h1>
          </div>
          <p className="text-xl text-gray-600">Виберіть план, який підходить саме вам</p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl shadow-lg p-8 border-2 ${
                plan.popular
                  ? 'border-green-500 transform scale-105'
                  : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <Star size={14} />
                    Популярний
                  </span>
                </div>
              )}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">₴/{plan.period}</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3 rounded-lg font-semibold transition ${
                  plan.popular
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                Обрати план
              </button>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">
          {/* Trial Period */}
          <section className="p-6 bg-green-50 rounded-xl border border-green-100">
            <div className="flex items-center gap-3 mb-3">
              <Zap className="text-green-600" size={28} />
              <h2 className="text-2xl font-bold text-gray-900">Безкоштовний пробний період</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Спробуйте наш сервіс безкоштовно протягом 14 днів! Вам не потрібно вказувати 
              дані картки — просто зареєструйтеся та почніть користуватися всіма функціями. 
              Якщо вам сподобається, ви зможете обрати тарифний план після закінчення пробного періоду.
            </p>
          </section>

          {/* Annual Discount */}
          <section className="p-6 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-center gap-3 mb-3">
              <Building2 className="text-blue-600" size={28} />
              <h2 className="text-2xl font-bold text-gray-900">Знижка при річній оплаті</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              Обираючи річну оплату, ви отримуєте знижку до 20% від місячного тарифу. 
              Це не тільки економія коштів, але й зручність — не потрібно думати про оплату 
              щомісяця.
            </p>
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-1">-15%</div>
                <div className="text-sm text-gray-600">Базовий план</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-1">-18%</div>
                <div className="text-sm text-gray-600">Стандарт план</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-1">-20%</div>
                <div className="text-sm text-gray-600">Преміум план</div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Часті запитання</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Чи можу я змінити план пізніше?</h3>
                <p className="text-gray-700 text-sm">
                  Так, ви можете оновити або знизити свій план у будь-який момент. 
                  Зміни набудуть чинності з наступного розрахункового періоду.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Що станеться після закінчення пробного періоду?</h3>
                <p className="text-gray-700 text-sm">
                  Після закінчення 14 днів вам буде запропоновано обрати тарифний план. 
                  Якщо ви не оберете план, доступ до системи буде обмежений.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Які способи оплати доступні?</h3>
                <p className="text-gray-700 text-sm">
                  Ми приймаємо оплату банківськими картками Visa та Mastercard, 
                  а також через банківський переказ для річної оплати.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

