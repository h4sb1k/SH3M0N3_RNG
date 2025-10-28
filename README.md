# Решение кейса по созданию ГСЧ для проведения открытых, но при этом криптографически стойких лотерей

## 📋 Требования
- Node.js >= 14.0.0
- npm >= 6.0.0

### 1. Установка зависимостей
```bash
npm install

cd client-randiss && npm install && cd ..
```

### 2. Запуск проекта
```bash
npm run dev

npm run client
```

### 3. Открыть в браузере
- **Клиент**: http://localhost:3000
- **Сервер**: http://localhost:3001

### Структура проекта
```
ISSentropy/
├── client-randiss/     # React TypeScript клиент
├── server/            # Node.js Express сервер
├── randiss-lottery/   # Дополнительный проект лотереи
└── README.md          # Основная документация
```


### 🛰️ Источники энтропии
- **ISS Position** - позиция МКС в реальном времени
- **CU Randomness Beacon** - квантовая случайность
- **Random.org** - атмосферные шумы
- **NIST Randomness Beacon** - государственный стандарт
- **Space Weather** - космическая погода
- **Internet Entropy** - гибридные данные
