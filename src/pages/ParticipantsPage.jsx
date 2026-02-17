import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { fetchEvents, fetchParticipants } from '../utils/api.js';

export default function ParticipantsPage() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const [events, users] = await Promise.all([
                    fetchEvents(),
                    fetchParticipants(eventId)
                ]);
                setEvent(events.find(e => e.id === parseInt(eventId)));
                setParticipants(users);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [eventId]);

    if (loading) return <div className="container">Завантаження...</div>;

    return (
        <div className="container">
            <div className="participants-header">
                <button onClick={() => navigate('/')} className="back-btn">← На головну</button>
                <h1>Учасники: "{event?.title}"</h1>
            </div>
            <div className="participants-grid">
                {participants.length === 0 ? (
                    <p>На цю подію ще ніхто не зареєструвався.</p>
                ) : (
                    participants.map(p => (
                        <div key={p.id} className="participant-card card">
                            <h3>{p.fullName}</h3>
                            <p>{p.email}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}