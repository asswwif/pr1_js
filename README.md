Додаток для реєстрації на події та візуалізації статистики.

## Стек технологій

**Бекенд:** Node.js, Express, MongoDB (Mongoose), Apollo Server (GraphQL), Socket.io, bcryptjs, express-session  
**Фронтенд:** React, Redux Toolkit, React Router, Recharts, Zod, socket.io-client

---

## Швидкий старт

### 1. Клонувати репозиторій

```bash
git clone <your-repo-url>
cd event-management
```

### 2. Встановити залежності

```bash
# Бекенд
cd server
npm install

# Фронтенд
cd ..
npm install
```

### 3. Налаштувати змінні оточення

Створіть файл `server/.env`:

```env
DB_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/events-db
PORT=3000
SESSION_SECRET_KEY=your-very-secret-key-change-this
CLIENT_URL=http://localhost:5173
```

Створіть файл `.env` у корені проекту (фронтенд):

```env
VITE_API_URL=http://localhost:3000
```

### 4. Заповнити базу тестовими даними

```bash
cd server
node seed.js
```

### 5. Запустити

```bash
# Бекенд (з папки server/)
node server.js

# Фронтенд (з кореня проекту)
npm run dev
```

Відкрийте: http://localhost:5173


### MongoDB Atlas

1. Зареєструйтесь на [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Створіть безкоштовний кластер M0
3. Database Access → додайте користувача з паролем
4. Network Access → додайте `0.0.0.0/0` (або IP Render)
5. Connect → скопіюйте рядок підключення у `DB_URL`

