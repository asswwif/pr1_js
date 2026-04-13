import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    title: String,
    body: String,
    date: Date,
    location: String,
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } 
});

eventSchema.index({ date: 1, title: 1 });

const participantSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' }, 
    registrationDate: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true }, 
    password: { type: String, required: true },
    role: { type: String, enum: ['Admin', 'Organizer'], default: 'Organizer' }
});

export const User = mongoose.model('User', userSchema);
export const Event = mongoose.model('Event', eventSchema);
export const Participant = mongoose.model('Participant', participantSchema);