import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

const events = [
  { id: 1, title: "Основи акварелі", date: "2026-03-15", organizer: "ArtStudio UA" },
  { id: 2, title: "Скетчинг маркерами", date: "2026-03-20", organizer: "Creative Hub" },
  { id: 3, title: "Малюнок вугіллям", date: "2026-03-22", organizer: "Академія Мистецтв" },
  { id: 4, title: "Олійний живопис", date: "2026-04-01", organizer: "ArtStudio UA" },
  { id: 5, title: "Академічний рисунок", date: "2026-04-05", organizer: "ProArt School" },
  { id: 6, title: "Fashion-ілюстрація", date: "2026-04-10", organizer: "Style Design" },
  { id: 7, title: "Петриківський розпис", date: "2026-04-15", organizer: "Етно-Арт" },
  { id: 8, title: "Портрет олівцем", date: "2026-04-20", organizer: "ArtStudio UA" }
];

app.use(cors());

app.use((req, res, next) => {
    const now = new Date().toISOString();
    console.log(`[${now}] ${req.method} запит на ${req.url}`);
    next();
});

app.get('/api/events', (req, res) => {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 4;
    const sortField = req.query.sort || 'id'; 
    const order = req.query.order === 'desc' ? -1 : 1;

    if (page < 1) page = 1;
    if (limit < 1) limit = 10;

    let result = [...events].sort((a, b) => {
        if (a[sortField] < b[sortField]) return -1 * order;
        if (a[sortField] > b[sortField]) return 1 * order;
        return 0;
    });

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedItems = result.slice(startIndex, endIndex);

    res.json({
        page,
        limit,
        total: events.length,
        data: paginatedItems
    });
});

app.listen(PORT, () => {
    console.log(`Сервер Express запущено на http://localhost:${PORT}/api/events`);
});