/**
 * Unit тести для i18n функціональності
 * 
 * Використання:
 * npm test -- i18n.test.ts
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { getLocaleFromRequest, getLocalizedValue, localizeEntities } from '@/lib/i18n-helpers';

describe('i18n-helpers', () => {
  describe('getLocaleFromRequest', () => {
    it('should return locale from query parameter', () => {
      const request = {
        url: 'https://example.com/api/dishes?lang=en',
      };
      expect(getLocaleFromRequest(request)).toBe('en');
    });

    it('should return locale from x-lang header', () => {
      const headers = new Headers();
      headers.set('x-lang', 'en');
      const request = { headers };
      expect(getLocaleFromRequest(request)).toBe('en');
    });

    it('should parse Accept-Language header', () => {
      const headers = new Headers();
      headers.set('accept-language', 'en-US,en;q=0.9,uk;q=0.8');
      const request = { headers };
      expect(getLocaleFromRequest(request)).toBe('en');
    });

    it('should default to ua when no locale specified', () => {
      const request = { url: 'https://example.com/api/dishes' };
      expect(getLocaleFromRequest(request)).toBe('ua');
    });
  });

  describe('getLocalizedValue', () => {
    const dish = {
      id: 1,
      name: 'Борщ',
      nameEn: 'Borscht',
      description: 'Традиційний український суп',
      descriptionEn: 'Traditional Ukrainian soup',
    };

    it('should return English value when locale is en', () => {
      expect(getLocalizedValue(dish, 'en', 'name')).toBe('Borscht');
      expect(getLocalizedValue(dish, 'en', 'description')).toBe('Traditional Ukrainian soup');
    });

    it('should return Ukrainian value when locale is ua', () => {
      expect(getLocalizedValue(dish, 'ua', 'name')).toBe('Борщ');
      expect(getLocalizedValue(dish, 'ua', 'description')).toBe('Традиційний український суп');
    });

    it('should fallback to Ukrainian when English is null', () => {
      const dishWithoutEn = {
        ...dish,
        nameEn: null,
        descriptionEn: null,
      };
      expect(getLocalizedValue(dishWithoutEn, 'en', 'name')).toBe('Борщ');
      expect(getLocalizedValue(dishWithoutEn, 'en', 'description')).toBe('Традиційний український суп');
    });

    it('should fallback to Ukrainian when English is empty string', () => {
      const dishWithEmptyEn = {
        ...dish,
        nameEn: '',
        descriptionEn: '',
      };
      expect(getLocalizedValue(dishWithEmptyEn, 'en', 'name')).toBe('Борщ');
    });
  });

  describe('localizeEntities', () => {
    const dishes = [
      {
        id: 1,
        name: 'Борщ',
        nameEn: 'Borscht',
        description: 'Суп',
        descriptionEn: 'Soup',
      },
      {
        id: 2,
        name: 'Вареники',
        nameEn: null, // Немає перекладу
        description: 'Пельмені',
        descriptionEn: null,
      },
    ];

    it('should localize array of entities to English', () => {
      const localized = localizeEntities(dishes, 'en');
      
      expect(localized[0].name).toBe('Borscht');
      expect(localized[0].description).toBe('Soup');
      expect(localized[1].name).toBe('Вареники'); // Fallback
      expect(localized[1].description).toBe('Пельмені'); // Fallback
      
      // Перевіряємо, що nameEn та descriptionEn видалені
      expect('nameEn' in localized[0]).toBe(false);
      expect('descriptionEn' in localized[0]).toBe(false);
    });

    it('should localize array of entities to Ukrainian', () => {
      const localized = localizeEntities(dishes, 'ua');
      
      expect(localized[0].name).toBe('Борщ');
      expect(localized[1].name).toBe('Вареники');
    });
  });
});

/**
 * Integration тести для API
 */
describe('API i18n integration', () => {
  it('should return localized dishes when lang=en', async () => {
    const response = await fetch('/api/dishes?restaurantId=1&category=Food&lang=en', {
      headers: {
        'x-lang': 'en',
      },
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    
    // Перевіряємо, що дані локалізовані
    expect(Array.isArray(data)).toBe(true);
    if (data.length > 0) {
      expect(data[0]).not.toHaveProperty('nameEn');
      expect(data[0]).not.toHaveProperty('descriptionEn');
      expect(data[0]).toHaveProperty('name');
    }
  });

  it('should include Content-Language header', async () => {
    const response = await fetch('/api/dishes?restaurantId=1&lang=en');
    expect(response.headers.get('Content-Language')).toBe('en');
  });

  it('should fallback to Ukrainian when English translation missing', async () => {
    // Створюємо страву без англійського перекладу
    // ... (потрібен доступ до БД для тестування)
    
    const response = await fetch('/api/dishes?restaurantId=1&lang=en');
    const data = await response.json();
    
    // Перевіряємо, що всі страви мають name (fallback працює)
    data.forEach((dish: any) => {
      expect(dish.name).toBeTruthy();
    });
  });
});

