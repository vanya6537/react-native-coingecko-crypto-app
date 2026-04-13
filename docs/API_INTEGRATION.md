# API Запросы CoinGecko

## Проверка API интеграции

### 1. Получение списка токенов
**Endpoint**: `GET /coins/markets`

```
Параметры:
- vs_currency: USD
- order: market_cap_desc
- per_page: 50
- page: 1-N (для пагинации)
- sparkline: false

Ответ примеры:
{
  "id": "bitcoin",
  "symbol": "btc",
  "name": "Bitcoin",
  "image": "https://...",
  "current_price": 45000,
  "market_cap_rank": 1,
  "price_change_percentage_24h": 2.5,
  ...
}
```

**Стратегия кэширования**: 5 минут (MMKV)

---

### 2. Детали токена
**Endpoint**: `GET /coins/{id}`

```
Параметры:
- localization: false
- tickers: false
- market_data: true
- community_data: false
- developer_data: false

Ответ примеры:
{
  "id": "bitcoin",
  "symbol": "btc",
  "name": "Bitcoin",
  "description": "...",
  "image": "...",
  "market_cap_rank": 1,
  "ath": 69000,
  "atl": 65,
  "market_cap": { "usd": 900000000000 },
  "total_volume": { "usd": 30000000000 },
  ...
}
```

**Стратегия кэширования**: 10 минут (MMKV)

---

### 3. История цены (7 дней)
**Endpoint**: `GET /coins/{id}/market_chart`

```
Параметры:
- vs_currency: USD
- days: 7
- interval: daily

Ответ примеры:
{
  "prices": [
    [1680000000000, 42000],
    [1680086400000, 43000],
    [1680172800000, 42500],
    ...
  ]
}

Трансформируется в:
[
  { timestamp: 1680000000000, price: 42000 },
  { timestamp: 1680086400000, price: 43000 },
  ...
]
```

**Стратегия кэширования**: 1 час (MMKV)

---

### 4. Поиск токенов
**Endpoint**: `GET /search`

```
Параметры:
- query: "bitcoin" (min 2 символа)

Ответ примеры:
{
  "coins": [
    { "id": "bitcoin", "name": "Bitcoin", "symbol": "btc", ... },
    { "id": "bitcoin-cash", "name": "Bitcoin Cash", "symbol": "bch", ... },
    ...
  ]
}
```

**Стратегия кэширования**: 30 минут (MMKV)

---

## Обработка ошибок & Retry логика

### Ошибки, которые обрабатываются:

1. **429 Too Many Requests (Rate Limit)**
   - Логируется ⚠️ Rate limit hit warning
   - Предлагается использовать Pro API ключ
   - 3 автоматических retry с exponential backoff

2. **Network timeout**
   - Timeout: 10000ms (configurable в .env)
   - Retry после: 1s * 2^attempt

3. **JSON parsing error**
   - Логируется в console
   - Возвращает пустой массив (для search)
   - Выбрасывает Error для списка/деталей

### Retry стратегия:
```
Попытка 1: 0ms
Попытка 2: 1000ms (1s)
Попытка 3: 3000ms (3s)

Итого: макс 4 секунды на запрос
```

---

## API Ключи (Pro план)

### Использование:
1. Создайте `.env.local` на основе `.env.example`
2. Добавьте: `COINGECKO_API_KEY=your_pro_key`
3. Ключ автоматически добавляется в параметр `x_cg_pro_api_key`

### Лимиты:
- **Free Tier**: 10-50 calls/minute
- **Pro Tier**: 500+ calls/minute

---

## Примеры вызовов API (для дебага)

### Тестирование в curl/Postman:

```bash
# Список токенов
curl -s "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5&page=1" | jq

# Детали Bitcoin
curl -s "https://api.coingecko.com/api/v3/coins/bitcoin" | jq '.id, .name, .current_price'

# История цены (7 дней)
curl -s "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=7&interval=daily" | jq '.prices | length'

# Поиск
curl -s "https://api.coingecko.com/api/v3/search?query=bitcoin" | jq '.coins[0]'
```

---

## Мониторинг в Dev режиме

Включите debug логирование:
```
🔧 Config loaded: { COINGECKO_API_URL, API_TIMEOUT, Platform }
📦 Cache hit: tokens_page_1_50          (из MMKV)
⚠️ Rate limit hit, consider upgrading   (429 ошибка)
🗑️ Cache cleared                         (вручную)
```

---

## Статус проверки

✅ API интеграция работает полно  
✅ Retry логика реализована (3 попытки)  
✅ MMKV кэш с TTL реализован  
✅ Request/Response interceptors активны  
✅ Rate limit detection реализована  
✅ .env поддержка для Pro ключей  
✅ Graceful error handling в UI  
