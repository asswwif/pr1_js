import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchParticipantsThunk, setSearchQuery, selectFilteredParticipants } from '../redux/participantsSlice';

export default function ParticipantsPage() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Отримуємо дані з Redux Store
    const participants = useSelector(selectFilteredParticipants);
    const { status, error, searchQuery } = useSelector(state => state.participants);

    useEffect(() => {
        dispatch(fetchParticipantsThunk(eventId));
    }, [dispatch, eventId]);

    if (status === 'loading') return <div className="container"><h2>Завантаження (Thunk)...</h2></div>;
    if (status === 'failed') return <div className="container"><h2>Помилка: {error}</h2></div>;

    return (
        <div className="container">
            <div className="participants-header">
                <button onClick={() => navigate(-1)} className="back-btn">← Назад</button>
                <h1>Participants</h1>
                
                {/* Динамічна фільтрація */}
                <input 
                    type="text"
                    className="search-input"
                    placeholder="Пошук учасників..."
                    value={searchQuery}
                    onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                    style={{width: '100%', padding: '10px', marginBottom: '20px'}}
                />
            </div>

            <div className="participants-grid">
                {participants.length === 0 ? (
                    <p>Нікого не знайдено.</p>
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