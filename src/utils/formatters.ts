import type { Token } from '../types/index';

const isValidNumber = (value: number | null | undefined): value is number => {
  return typeof value === 'number' && Number.isFinite(value);
};

export const formatPrice = (price: number | null | undefined): string => {
  if (!isValidNumber(price)) {
    return 'N/A';
  }

  if (price >= 1) {
    return `$${price.toFixed(2)}`;
  }
  return `$${price.toFixed(6)}`;
};

export const formatChange = (change: number | null | undefined): string => {
  if (!isValidNumber(change)) {
    return 'N/A';
  }

  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
};

export const formatMarketCap = (cap: number | null | undefined): string => {
  if (!isValidNumber(cap)) {
    return 'N/A';
  }

  if (cap >= 1e9) {
    return `$${(cap / 1e9).toFixed(2)}B`;
  }
  if (cap >= 1e6) {
    return `$${(cap / 1e6).toFixed(2)}M`;
  }
  return `$${cap.toFixed(0)}`;
};

export const filterTokens = (
  tokens: Token[],
  search: string,
  sortBy: string,
  sortOrder: string
) => {
  let filtered = tokens;

  // Фильтр по названию/символу
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (t) => t.name.toLowerCase().includes(q) || t.symbol.toLowerCase().includes(q)
    );
  }

  // Сортировка
  filtered.sort((a, b) => {
    let aVal = 0;
    let bVal = 0;

    if (sortBy === 'price') {
      aVal = isValidNumber(a.current_price) ? a.current_price : 0;
      bVal = isValidNumber(b.current_price) ? b.current_price : 0;
    } else if (sortBy === 'change24h') {
      aVal = isValidNumber(a.price_change_percentage_24h) ? a.price_change_percentage_24h : 0;
      bVal = isValidNumber(b.price_change_percentage_24h) ? b.price_change_percentage_24h : 0;
    } else {
      aVal = a.market_cap_rank || Infinity;
      bVal = b.market_cap_rank || Infinity;
    }

    return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
  });

  return filtered;
};
