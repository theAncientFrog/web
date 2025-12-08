'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Handshake, DollarSign, Gift, Users, Headphones, TrendingUp } from 'lucide-react';
import { useState } from 'react';

export default function PartnersProgramPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Тут буде логіка відправки форми
    alert('Дякуємо за заявку! Ми зв\'яжемося з вами найближчим часом.');
    setFormData({ name: '', email: '', company: '', phone: '', message: '' });
  };

  const benefits = [
    {
      icon: DollarSign,
      title: 'Комісійна винагорода',
      description: 'Отримуйте привабливу комісію за кожного залученого клієнта. Чим більше клієнтів ви залучите, тим більше ви заробляєте.',
    },
    {
      icon: Gift,
      title: 'Спеціальні тарифи',
      description: 'Доступ до ексклюзивних тарифів та умов для ваших клієнтів. Це робить вашу пропозицію ще привабливішою.',
    },
    {
      icon: Users,
      title: 'Маркетингова підтримка',
      description: 'Отримуйте готові матеріали для просування: баннери, презентації, кейси та інші маркетингові інструменти.',
    },
    {
      icon: Headphones,
      title: 'Навчальна підтримка',
      description: 'Доступ до навчальних матеріалів, вебінарів та персональних консультацій для кращого розуміння продукту.',
    },
    {
      icon: TrendingUp,
      title: 'Розвиток бізнесу',
      description: 'Розширюйте свій бізнес, пропонуючи додаткові послуги своїм клієнтам та отримуючи нові можливості для росту.',
    },
  ];

  const whoCanPartner = [
    {
      title: 'Веб-студії',
      description: 'Якщо ви розробляєте веб-сайти для ресторанів, додайте QR-меню як додаткову послугу.',
    },
    {
      title: 'HoReCa-консультанти',
      description: 'Допоможіть вашим клієнтам модернізувати їхній бізнес, пропонуючи сучасні цифрові рішення.',
    },
    {
      title: 'Фрілансери',
      description: 'Якщо ви працюєте з ресторанами, станьте партнером та отримуйте додатковий дохід.',
    },
    {
      title: 'Агенції',
      description: 'Маркетингові та рекламні агенції можуть пропонувати QR-меню як частину комплексних рішень.',
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
            <Handshake className="text-green-600" size={40} />
            <h1 className="text-4xl font-bold text-gray-900">Партнерська програма</h1>
          </div>
          <p className="text-xl text-gray-600">Співпрацюйте з нами та отримуйте вигоди</p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-12">
          
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Хто може стати партнером?</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Наша партнерська програма розрахована на професіоналів, які працюють з ресторанним 
              бізнесом та можуть допомогти закладам модернізуватися. Якщо ви надаєте послуги 
              ресторанам, кафе або іншим закладам харчування, ми запрошуємо вас до співпраці.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {whoCanPartner.map((item, index) => (
                <div key={index} className="p-5 bg-green-50 rounded-xl border border-green-100">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-700 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Benefits */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Переваги партнерства</h2>
            <div className="space-y-6">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div key={index} className="flex gap-4 p-6 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                        <Icon className="text-white" size={24} />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">{benefit.title}</h3>
                      <p className="text-gray-700">{benefit.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* How It Works */}
          <section className="pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Як це працює?</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Подайте заявку</h3>
                  <p className="text-gray-700 text-sm">
                    Заповніть форму нижче та розкажіть про себе та ваш досвід роботи з ресторанним бізнесом.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Отримайте доступ</h3>
                  <p className="text-gray-700 text-sm">
                    Після розгляду заявки ми надамо вам доступ до партнерського порталу з усіма необхідними матеріалами.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Залучайте клієнтів</h3>
                  <p className="text-gray-700 text-sm">
                    Використовуйте надані матеріали для просування нашого продукту серед ваших клієнтів.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Отримуйте винагороду</h3>
                  <p className="text-gray-700 text-sm">
                    Отримуйте комісійні виплати за кожного залученого клієнта, який підписався на наш сервіс.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Application Form */}
          <section className="pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Подати заявку на партнерство</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Ваше ім'я *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                  Компанія / Організація
                </label>
                <input
                  type="text"
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Телефон
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Розкажіть про себе та ваш досвід *
                </label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Опишіть ваш досвід роботи з ресторанним бізнесом, тип послуг, які ви надаєте, та чому ви хочете стати нашим партнером..."
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Відправити заявку
              </button>
            </form>
          </section>

        </div>
      </div>
    </main>
  );
}

