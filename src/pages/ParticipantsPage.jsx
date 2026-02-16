import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { fetchEvents } from './src/utils/api.js';

export default function ParticipantsPage() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const data = await fetchEvents();
                
                if (data && data.length > 0) {
                    const foundEvent = data.find(e => e.id === parseInt(eventId));
                    setEvent(foundEvent);
                }

                setParticipants([
                    { id: 1, fullName: 'John Doe', email: 'john.doe@mail.com' },
                    { id: 2, fullName: 'Jane Smith', email: 'jane.smith@mail.com' },
                    { id: 3, fullName: 'Bob Johnson', email: 'bob.j@mail.com' }
                ]);
            } catch (err) {
                console.error('Помилка:', err);
            } finally {
                setLoading(false);
            }
        }
        
        loadData();
    }, [eventId]);

    if (loading) {
        return (
            <div className="container">
                <div style={{ padding: '50px', textAlign: 'center' }}>
                    <h2>Завантаження...</h2>
                </div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="container">
                <div style={{ padding: '50px', textAlign: 'center' }}>
                    <h2>Подію не знайдено</h2>
                    <button onClick={() => navigate('/')} className="back-btn">
                        ← Повернутися на головну
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="participants-header">
                <button onClick={() => navigate('/')} className="back-btn">← Назад</button>
                <h1>"{event.title}" participants</h1>
            </div>

            <div className="participants-grid">
                {participants.length === 0 ? (
                    <p className="no-participants">Поки що немає зареєстрованих учасників</p>
                ) : (
                    participants.map(participant => (
                        <div key={participant.id} className="participant-card">
                            <h3>{participant.fullName}</h3>
                            <p>{participant.email}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}