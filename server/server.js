import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { Event, Participant, User } from './models.js';

const app = express();
const DB_URL = process.env.DB_URL; 
const PORT = process.env.PORT || 3000; 

app.use(cors());
app.use(express.json());

app.use('/graphql', (req, res, next) => {
    if (req.method === 'GET') req.body = {};
    next();
});

app.use(session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 }
}));

app.post('/register', async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const hashed = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashed, role: role || 'Organizer' });
        await user.save();
        res.status(201).json({ message: 'Користувача створено успішно' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
        req.session.user = { id: user._id, email: user.email, role: user.role };
        return res.json({ message: 'Вхід виконано успішно', role: user.role });
    }
    res.status(401).json({ message: 'Помилка при вході' });
});

app.post('/events', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Авторизуйтесь!' });
    const event = new Event({ ...req.body, creator: req.session.user.id });
    await event.save();
    res.status(201).json(event);
});

app.put('/events/:id', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Авторизуйтесь!' });
    const event = await Event.findById(req.params.id);
    if (event.creator.toString() !== req.session.user.id) return res.status(403).json({ error: 'Не ваш івент' });
    Object.assign(event, req.body);
    await event.save();
    res.json(event);
});

app.delete('/events/:id', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Авторизуйтесь!' });
    await Event.findOneAndDelete({ _id: req.params.id, creator: req.session.user.id });
    res.json({ message: 'Подію видалено' });
});

app.post('/participants', async (req, res) => {
    const part = new Participant(req.body);
    await part.save();
    res.status(201).json(part);
});

const typeDefs = `#graphql
  type User { id: ID, email: String, role: String }
  type Participant { id: ID, fullName: String, email: String }
  type Event { 
    id: ID
    title: String
    body: String
    contactEmail: String
    creator: User
    participants: [Participant] 
  }

  input EventInput { 
    title: String!, 
    body: String, 
    date: String!, 
    contactEmail: String 
  }

  type Query {
    getEvents(limit: Int, skip: Int, filter: String): [Event]
  }

  type Mutation {
    addEvent(input: EventInput!): Event
  }
`;

const resolvers = {
    Query: {
        getEvents: async (_, { limit = 10, skip = 0, filter }) => {
            const s = filter ? { title: { $regex: filter, $options: 'i' } } : {};
            return await Event.find(s).limit(limit).skip(skip).populate('creator');
        }
    },
    Event: {
        participants: async (parent) => await Participant.find({ eventId: parent.id })
    },
    Mutation: {
        addEvent: async (_, { input }, context) => {
            if (!context.user) throw new Error('Авторизуйтесь через REST /login');
            
            if (input.title.length < 3) throw new Error('Назва надто коротка!');
            
            if (input.contactEmail) {
                const emailRegex = /^\S+@\S+\.\S+$/;
                if (!emailRegex.test(input.contactEmail)) {
                    throw new Error('Некоректний формат email!');
                }
            }

            const newEvent = new Event({ ...input, creator: context.user.id });
            return await newEvent.save();
        }
    }
};

async function start() {
    const server = new ApolloServer({ typeDefs, resolvers });
    await server.start();

    app.use('/graphql', expressMiddleware(server, {
        context: async ({ req }) => ({ user: req.session.user })
    }));

    app.get('/', (req, res) => res.send('<h1>Сервер працює.</h1>'));

    console.log("Спроба підключення до:", DB_URL);

    mongoose.connect(DB_URL, { serverSelectionTimeoutMS: 5000 })
        .then(() => {
            console.log('Підключено до MongoDB Atlas!');
            app.listen(PORT, () => {
                console.log(`Server started on http://localhost:${PORT}`);
            });
        })
        .catch(err => {
            console.error('Помилка БД:', err.message);
        });
}

start();