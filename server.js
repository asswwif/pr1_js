import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { URL } from 'node:url';
import { CONFIG } from './config.js';

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost`);

    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

    res.setHeader('Content-Type', 'application/json');

    if (url.pathname === '/api/events' && req.method === 'GET') {
        try {
            const data = await readFile(CONFIG.DATA_PATH, 'utf-8');
            res.statusCode = 200;
            res.end(data);
        } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Не вдалося прочитати файл' }));
        }
    } else {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Маршрут не знайдено' }));
    }
});

server.listen(CONFIG.PORT, CONFIG.HOST, () => {
    console.log(`Сервер запущено: http://${CONFIG.HOST}:${CONFIG.PORT}/api/events`);
});