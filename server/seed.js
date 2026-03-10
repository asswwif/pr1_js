import 'dotenv/config';
import mongoose from 'mongoose';
import { Event, Participant } from './models.js';

const DB_URL = process.env.DB_URL;
const PORT = process.env.PORT || 3000;

const eventsData = [
     { "id": 1, "title": "Основи акварелі", "body": "Творчий інтенсив для тих, хто хоче опанувати прозорість фарб з нуля.", "date": "2026-03-15", "organizer": "ArtStudio UA" },
  { "id": 2, "title": "Скетчинг маркерами", "body": "Швидкий малюнок міських локацій. Вчимося передавати атмосферу за 15 хвилин.", "date": "2026-03-20", "organizer": "Creative Hub" },
  { "id": 3, "title": "Малюнок вугіллям", "body": "Робота з тінню та об'ємом. Класичні техніки графіки для початківців.", "date": "2026-03-22", "organizer": "Академія Мистецтв" },
  { "id": 4, "title": "Олійний живопис", "body": "Створення першої картини на полотні. Всі матеріали включені у вартість.", "date": "2026-04-01", "organizer": "ArtStudio UA" },
  { "id": 5, "title": "Академічний рисунок", "body": "Побудова геометричних фігур та розуміння перспективи для новачків.", "date": "2026-04-05", "organizer": "ProArt School" },
  { "id": 6, "title": "Fashion-ілюстрація", "body": "Малювання стилізованих фігур аквареллю та лінерами.", "date": "2026-04-10", "organizer": "Style Design" },
  { "id": 7, "title": "Петриківський розпис", "body": "Традиційний український орнамент. Вчимося малювати пальцями.", "date": "2026-04-15", "organizer": "Етно-Арт" },
  { "id": 8, "title": "Портрет олівцем", "body": "Анатомія обличчя: як передати схожість та емоції людини на папері.", "date": "2026-04-20", "organizer": "ArtStudio UA" },
  { "id": 9, "title": "Пейзаж пастеллю", "body": "М'які переходи кольорів та створення ефекту живого неба пастеллю.", "date": "2026-04-25", "organizer": "Creative Hub" },
  { "id": 10, "title": "Комікси та Манга", "body": "Створення персонажів та розкадровка власної історії для початківців.", "date": "2026-05-01", "organizer": "Geek Art Shop" },
  { "id": 11, "title": "Акриловий інтенсив", "body": "Сучасні техніки роботи з акрилом: текстурні пасти та мастихін.", "date": "2026-05-05", "organizer": "ArtStudio UA" },
  { "id": 12, "title": "Теорія колористики", "body": "Основи кольорового кола для художників. Як змішувати фарби.", "date": "2026-05-10", "organizer": "ProArt School" },
  { "id": 13, "title": "Цифровий живопис", "body": "Вступ до малювання на планшеті. Робота з шарами та світлом.", "date": "2026-05-15", "organizer": "Digital Academy" },
  { "id": 14, "title": "Малювання тушшю", "body": "Графіка в стилі інктобер. Створення глибокого контрасту пером.", "date": "2026-05-20", "organizer": "Graphic Line" },
  { "id": 15, "title": "Анатомія для художників", "body": "Вивчення м'язів та кісток для правильного відображення тіла.", "date": "2026-05-25", "organizer": "Академія Мистецтв" },
  { "id": 16, "title": "Арт-терапія", "body": "Малювання як спосіб розслаблення. Психологічне розвантаження.", "date": "2026-06-01", "organizer": "Zen Studio" }
];

async function seed() {
    try {
        console.log("Підключення до бази...");
        await mongoose.connect(DB_URL);
        
        await Event.deleteMany({}); 
        await Participant.deleteMany({});

        const createdEvents = await Event.insertMany(eventsData);
        console.log(`Додано подій: ${createdEvents.length}`);

        const firstEventId = createdEvents[0]._id;

        const participantsData = [
            { fullName: "Маргарита Єрофєєва", email: "margo@gmail.com", eventId: firstEventId },
            { fullName: "Антонов Антон", email: "antonov@gmail.com", eventId: firstEventId }
        ];

        await Participant.insertMany(participantsData);
        console.log("Учасників успішно додано до бази!");

        process.exit();
    } catch (err) {
        console.error("Помилка при наповненні:", err);
        process.exit(1);
    }
}

seed();