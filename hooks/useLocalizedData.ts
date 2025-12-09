/**
 * React Hook для завантаження та кешування локалізованих даних
 * 
 * Використання:
 * const { data, isLoading, error } = useLocalizedData('/api/dishes?restaurantId=1');
 */

'use client';

import { useState, useEffect } from 'react';
import { useLocale } from './useLocale';

interface UseLocalizedDataOptions {
  revalidate?: number; // Час в секундах для revalidation
  fallbackData?: any;
}

export function useLocalizedData<T = any>(
  url: string,
  options: UseLocalizedDataOptions = {}
) {
  const { locale, getFetchHeaders } = useLocale();
  const [data, setData] = useState<T | null>(options.fallbackData || null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Додаємо локаль до URL або заголовків
        const urlWithLang = url.includes('?') 
          ? `${url}&lang=${locale}`
          : `${url}?lang=${locale}`;

        const response = await fetch(urlWithLang, {
          headers: {
            ...getFetchHeaders(),
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (!isCancelled) {
          setData(result);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup
    return () => {
      isCancelled = true;
    };
  }, [url, locale, getFetchHeaders]);

  return { data, isLoading, error };
}

