export const MOCK_USER = {
  id: 'u1',
  name: 'Кофейня "Зёрна & Турки"',
  email: 'admin@zerna-turki.kz',
  avatar: 'https://i.pravatar.cc/150?u=zerna',
  businessType: 'Кофейня',
  balance: 45000,
  rating: 4.8,
  reviewsCount: 124,
  integrations: {
    kaspi: false,
    whatsapp: false
  }
};

export const MOCK_STATS = [
  { id: 'revenue', label: 'Выручка за месяц', value: '1 245 000 ₸', numericValue: 1245000, change: '+12%', trend: 'up' },
  { id: 'new_clients', label: 'Новые клиенты', value: '342', numericValue: 342, change: '+5%', trend: 'up' },
  { id: 'active_promos', label: 'Активные акции', value: '3', numericValue: 3, change: '0%', trend: 'neutral' },
  { id: 'rating', label: 'Оценка', value: '4.8', numericValue: 4.8, change: '+0.1', trend: 'up' }
];

export const MOCK_PROMOTIONS = [
  {
    id: 'p1',
    title: 'Скидка 20% на кофе с собой',
    type: 'discount',
    status: 'active',
    views: 1240,
    conversions: 85,
    budget: 5000,
    spent: 3200,
    endDate: '2026-08-15',
    qrData: 'promo_p1_20off'
  },
  {
    id: 'p2',
    title: 'Каждый 6-й кофе бесплатно',
    type: 'stamp',
    status: 'active',
    views: 3500,
    conversions: 420,
    budget: 0,
    spent: 0,
    endDate: '2026-12-31',
    qrData: 'promo_p2_stamp'
  }
];

export const MOCK_CUSTOMERS = [
  { id: 'c1', name: 'Айгерим С.', phone: '+7 701 123 4567', visits: 12, totalSpent: 24000, lastVisit: '2026-07-28', status: 'regular', stamps: 3 },
  { id: 'c2', name: 'Тимур Б.', phone: '+7 777 987 6543', visits: 5, totalSpent: 9500, lastVisit: '2026-06-15', status: 'sleeping', stamps: 1 },
  { id: 'c3', name: 'Елена В.', phone: '+7 705 555 1234', visits: 28, totalSpent: 56000, lastVisit: '2026-07-29', status: 'regular', stamps: 5 },
  { id: 'c4', name: 'Димаш К.', phone: '+7 702 111 2233', visits: 1, totalSpent: 2500, lastVisit: '2026-07-29', status: 'new', stamps: 0 },
  { id: 'c5', name: 'Алина М.', phone: '+7 747 333 4455', visits: 0, totalSpent: 0, lastVisit: null, status: 'new', stamps: 0 }
];

export const MOCK_TOOLS = [
  { id: 't1', name: 'Email-рассылка', category: 'Маркетинг', active: true, icon: 'Mail' },
  { id: 't2', name: 'Программа лояльности', category: 'Удержание', active: true, icon: 'Gift' },
  { id: 't3', name: 'Интеграция Kaspi', category: 'Оплата', active: false, icon: 'CreditCard' },
  { id: 't4', name: 'AI Аналитика', category: 'Аналитика', active: true, icon: 'Brain' },
];

export const MOCK_REVENUE_DATA = [
  { name: 'Пн', value: 45000, promoRevenue: 15000, newClients: 12, returnClients: 35 },
  { name: 'Вт', value: 52000, promoRevenue: 18000, newClients: 15, returnClients: 40 },
  { name: 'Ср', value: 38000, promoRevenue: 12000, newClients: 8, returnClients: 30 },
  { name: 'Чт', value: 65000, promoRevenue: 25000, newClients: 22, returnClients: 50 },
  { name: 'Пт', value: 89000, promoRevenue: 40000, newClients: 45, returnClients: 65 },
  { name: 'Сб', value: 112000, promoRevenue: 60000, newClients: 60, returnClients: 80 },
  { name: 'Вс', value: 95000, promoRevenue: 45000, newClients: 40, returnClients: 70 },
];

export const PROMO_TEMPLATES = [
  { id: 'tpl_discount', title: 'Скидка на чек', type: 'discount', defaultBudget: 5000, desc: 'Дайте клиенту скидку % или фикс. сумму при покупке.' },
  { id: 'tpl_stamp', title: 'Штамп-карта 5+1', type: 'stamp', defaultBudget: 0, desc: 'Каждая 6-я покупка в подарок. Увеличивает LTV.' },
  { id: 'tpl_happy_hours', title: 'Счастливые часы', type: 'time_discount', defaultBudget: 2000, desc: 'Скидка в определенные часы для заполнения "мертвых" зон.' },
  { id: 'tpl_winback', title: 'Возврат клиента', type: 'winback', defaultBudget: 10000, desc: 'Автоматическая SMS/WhatsApp рассылка тем, кто давно не был.' }
];
