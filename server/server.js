import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import session from "express-session";
import bcrypt from "bcryptjs";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { createServer } from "http";
import { Server as SocketServer } from "socket.io";
import { Event, Participant, User } from "./models.js";

const app = express();
const httpServer = createServer(app);

const DB_URL = process.env.DB_URL;
const PORT = process.env.PORT || 3000;

const allowedOrigins = ["http://localhost:5173", /\.vercel\.app$/];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      const isAllowed = allowedOrigins.some((allowed) => {
        return allowed instanceof RegExp
          ? allowed.test(origin)
          : allowed === origin;
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

const io = new SocketServer(httpServer, {
  cors: {
    origin: (origin, callback) => {
      const allowedOrigins = ["http://localhost:5173", /\.vercel\.app$/];
      if (!origin) return callback(null, true);
      const isAllowed = allowedOrigins.some((o) =>
        o instanceof RegExp ? o.test(origin) : o === origin
      );
      callback(isAllowed ? null : new Error("Not allowed"), isAllowed);
    },
    credentials: true,
    methods: ["GET", "POST"],
  },
});

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 3600000,
      sameSite: "none",
      secure: true,
    },
  })
);

app.post("/register", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashed,
      role: role || "Organizer",
    });
    await user.save();
    res.status(201).json({ message: "Користувача створено успішно" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await bcrypt.compare(password, user.password))) {
    req.session.user = { id: user._id, email: user.email, role: user.role };
    return res.json({ message: "Вхід виконано успішно", role: user.role });
  }
  res.status(401).json({ message: "Помилка при вході" });
});

app.post("/logout", (req, res) => {
  req.session.destroy();
  res.json({ message: "Вихід виконано" });
});

app.get("/events", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;
    const sort = req.query.sort || "date";
    const order = req.query.order === "desc" ? -1 : 1;
    const search = req.query.search || "";

    const filter = search ? { title: { $regex: search, $options: "i" } } : {};

    const [items, total] = await Promise.all([
      Event.find(filter)
        .sort({ [sort]: order })
        .skip(skip)
        .limit(limit)
        .populate("creator", "email"),
      Event.countDocuments(filter),
    ]);

    res.json({
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/events/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "creator",
      "email"
    );
    if (!event) return res.status(404).json({ error: "Подію не знайдено" });
    res.json(event);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/events", async (req, res) => {
  if (!req.session.user)
    return res.status(401).json({ error: "Авторизуйтесь!" });
  try {
    const event = new Event({ ...req.body, creator: req.session.user.id });
    await event.save();
    res.status(201).json(event);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/events/:id", async (req, res) => {
  if (!req.session.user)
    return res.status(401).json({ error: "Авторизуйтесь!" });
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Подію не знайдено" });
    if (event.creator.toString() !== req.session.user.id.toString())
      return res.status(403).json({ error: "Не ваш івент" });
    Object.assign(event, req.body);
    await event.save();
    res.json(event);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/events/:id", async (req, res) => {
  if (!req.session.user)
    return res.status(401).json({ error: "Авторизуйтесь!" });
  try {
    const result = await Event.findOneAndDelete({
      _id: req.params.id,
      creator: req.session.user.id,
    });
    if (!result)
      return res.status(404).json({ error: "Подію не знайдено або не ваша" });
    await Participant.deleteMany({ eventId: req.params.id });
    res.json({ message: "Подію видалено" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/participants/:eventId", async (req, res) => {
  try {
    const participants = await Participant.find({
      eventId: req.params.eventId,
    }).sort({ registrationDate: -1 });
    res.json(participants);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/participants", async (req, res) => {
  try {
    const { fullName, email, eventId } = req.body;

    const existing = await Participant.findOne({ email, eventId });
    if (existing)
      return res
        .status(409)
        .json({ error: "Ви вже зареєстровані на цю подію" });

    const part = new Participant({ fullName, email, eventId });
    await part.save();

    io.to(`event-${eventId}`).emit("new-participant", {
      fullName,
      email,
      registrationDate: part.registrationDate,
    });

    res.status(201).json(part);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const typeDefs = `#graphql
  type User { id: ID, email: String, role: String }

  type Participant { id: ID, fullName: String, email: String, registrationDate: String }

  type Event {
    id: ID
    title: String
    body: String
    date: String
    location: String
    contactEmail: String
    creator: User
    participants: [Participant]
  }

  type EventConnection {
    edges: [EventEdge]
    pageInfo: PageInfo
    totalCount: Int
  }

  type EventEdge {
    node: Event
    cursor: String
  }

  type PageInfo {
    hasNextPage: Boolean
    endCursor: String
  }

  input EventInput {
    title: String!
    body: String
    date: String!
    location: String
    contactEmail: String
  }

  type Query {
    getEvents(limit: Int, skip: Int, filter: String): [Event]
    getEventsPaginated(first: Int, after: String, filter: String): EventConnection
    getEvent(id: ID!): Event
  }

  type Mutation {
    addEvent(input: EventInput!): Event
    updateEvent(id: ID!, input: EventInput!): Event
    deleteEvent(id: ID!): Boolean
  }
`;

const resolvers = {
  Query: {
    getEvents: async (_, { limit = 10, skip = 0, filter }) => {
      const q = filter ? { title: { $regex: filter, $options: "i" } } : {};
      return await Event.find(q).limit(limit).skip(skip).populate("creator");
    },

    getEventsPaginated: async (_, { first = 10, after, filter }) => {
      const q = filter ? { title: { $regex: filter, $options: "i" } } : {};
      if (after) {
        q._id = { $gt: Buffer.from(after, "base64").toString("utf8") };
      }
      const events = await Event.find(q)
        .sort({ _id: 1 })
        .limit(first + 1)
        .populate("creator");

      const hasNextPage = events.length > first;
      const nodes = hasNextPage ? events.slice(0, first) : events;
      const totalCount = await Event.countDocuments(
        filter ? { title: { $regex: filter, $options: "i" } } : {}
      );

      return {
        edges: nodes.map((e) => ({
          node: e,
          cursor: Buffer.from(e._id.toString()).toString("base64"),
        })),
        pageInfo: {
          hasNextPage,
          endCursor:
            nodes.length > 0
              ? Buffer.from(nodes[nodes.length - 1]._id.toString()).toString(
                  "base64"
                )
              : null,
        },
        totalCount,
      };
    },

    getEvent: async (_, { id }) => await Event.findById(id).populate("creator"),
  },

  Event: {
    participants: async (parent) =>
      await Participant.find({ eventId: parent.id }),
  },

  Mutation: {
    addEvent: async (_, { input }, context) => {
      if (!context.user) throw new Error("Авторизуйтесь через REST /login");
      if (input.title.length < 3) throw new Error("Назва надто коротка!");
      if (input.contactEmail) {
        if (!/^\S+@\S+\.\S+$/.test(input.contactEmail))
          throw new Error("Некоректний формат email!");
      }
      const newEvent = new Event({ ...input, creator: context.user.id });
      return await newEvent.save();
    },

    updateEvent: async (_, { id, input }, context) => {
      if (!context.user) throw new Error("Авторизуйтесь!");
      const event = await Event.findById(id);
      if (!event) throw new Error("Подію не знайдено");
      if (event.creator.toString() !== context.user.id.toString())
        throw new Error("Не ваш івент");
      Object.assign(event, input);
      return await event.save();
    },

    deleteEvent: async (_, { id }, context) => {
      if (!context.user) throw new Error("Авторизуйтесь!");
      await Event.findOneAndDelete({ _id: id, creator: context.user.id });
      return true;
    },
  },
};

io.on("connection", (socket) => {
  console.log("Клієнт підключився:", socket.id);

  socket.on("join-event", (eventId) => {
    socket.join(`event-${eventId}`);
    console.log(`Socket ${socket.id} приєднався до event-${eventId}`);
  });

  socket.on("chat-message", ({ eventId, message, author, socketId }) => {
    const payload = { message, author, time: new Date().toISOString() };
    io.to(`event-${eventId}`).emit("chat-message", payload);
  });

  socket.on("disconnect", () => {
    console.log("Клієнт відключився:", socket.id);
  });
});

async function start() {
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();

  app.use("/graphql", (req, res, next) => {
    if (req.method === "GET") req.body = {};
    next();
  });

  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => ({ user: req.session?.user }),
    })
  );

  app.get("/", (_, res) => res.send("<h1>Сервер працює.</h1>"));

  console.log("Підключення до MongoDB:", DB_URL);
  mongoose
    .connect(DB_URL, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
      console.log("Підключено до MongoDB!");
      httpServer.listen(PORT, () => {
        console.log(`Server: http://localhost:${PORT}`);
        console.log(`GraphQL: http://localhost:${PORT}/graphql`);
      });
    })
    .catch((err) => console.error("Помилка БД:", err.message));
}

start();
