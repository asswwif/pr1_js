import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { Event, Participant } from './models.js';

const app = express();
const DB_URL = process.env.DB_URL;
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

mongoose.connect(DB_URL)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error(err));

app.get('/events', async (req, res) => {
    try {
        let { page = 1, limit = 10, sort = 'date', order = 'asc' } = req.query;
        page = Math.max(1, parseInt(page));
        limit = Math.max(1, parseInt(limit));
        const sortOrder = order === 'desc' ? -1 : 1;
        const skip = (page - 1) * limit;

        const events = await Event.find()
            .sort({ [sort]: sortOrder })
            .skip(skip)
            .limit(limit);

        const total = await Event.countDocuments();

        res.json({
            data: events,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/events/infinite', async (req, res) => {
    try {
        const { lastId, limit = 10 } = req.query;
        const query = lastId ? { _id: { $gt: lastId } } : {};
        const events = await Event.find(query).limit(parseInt(limit)).sort({ _id: 1 });
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/participants/:eventId', async (req, res) => {
    try {
        const participants = await Participant.find({ eventId: req.params.eventId });
        res.json(participants);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/participants', async (req, res) => {
    try {
        const newParticipant = new Participant(req.body);
        await newParticipant.save();
        res.status(201).json({ success: true, data: newParticipant });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});