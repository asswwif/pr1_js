import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    body: String,
    date: { type: Date, required: true },
    organizer: String
});

eventSchema.index({ date: 1, title: 1 });

const participantSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' }, 
    registrationDate: { type: Date, default: Date.now }
});

export const Event = mongoose.model('Event', eventSchema);
export const Participant = mongoose.model('Participant', participantSchema);