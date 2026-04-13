import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getEvents } from '../redux/eventsSlice';
import { getFavorites, toggleFavorite } from '../utils/storage.js';

export default function EventsPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { items: allEvents, status, error, total, totalPages } = useSelector((state) => state.events);

    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [favorites, setFavorites] = useState(getFavorites());

    useEffect(() => {
        dispatch(getEvents({ page: currentPage, search: searchQuery }));
    }, [currentPage, searchQuery, dispatch]);

    const handleSearch = (val) => {
        setSearchQuery(val);
        setCurrentPage(1);
    };

    const handleFavorite = (id) => {
        toggleFavorite(id);
        setFavorites(getFavorites());
    };

    function createEventCard(event, isFav) {
        const eventId = event._id || event.id;
        return (
            <div key={eventId} className="event-card">
                <div className="card-top">
                    <h3>{event.title}</h3>
                    <p className="desc">{event.body || event.description}</p>
                    <div className="event-meta">
                        <span>{event.date ? new Date(event.date).toLocaleDateString('uk-UA') : ''}</span>
                        {event.organizer && <> | <span>{event.organizer}</span></>}
                        {event.creator?.email && <> | <span>{event.creator.email}</span></>}
                    </div>
                </div>
                <div className="card-actions">
                    <span className="action-btn" onClick={() => navigate(`/register/${eventId}`)}>
                        Register
                    </span>
                    <button
                        className={`btn-fav ${isFav ? 'active' : ''}`}
                        onClick={() => handleFavorite(eventId)}
                    >
                        {isFav ? '♥' : '♡'}
                    </button>
                    <span className="action-btn" onClick={() => navigate(`/participants/${eventId}`)}>
                        View
                    </span>
                </div>
            </div>
        );
    }

    const pageCount = totalPages || 1;

    if (status === 'loading') return <div className="container"><h2>Завантаження...</h2></div>;
    if (status === 'failed') return <div className="container"><h2>Помилка: {error}</h2></div>;

    return (
        <div className="container">
            <header className="main-header">
                <h1>Events</h1>
                <div className="search-wrapper">
                    <input
                        type="text"
                        placeholder="Пошук..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>
            </header>

            <div id="events-container">
                {allEvents.length > 0 ? (
                    allEvents.map(event => createEventCard(event, favorites.includes(event._id || event.id)))
                ) : (
                    <p className="no-participants">Нічого не знайдено</p>
                )}
            </div>

            {pageCount > 1 && (
                <nav className="pagination-container">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => { setCurrentPage(p => p - 1); window.scrollTo(0, 0); }}
                    >
                        &larr;
                    </button>

                    {[...Array(pageCount)].map((_, i) => (
                        <button
                            key={i + 1}
                            className={currentPage === i + 1 ? 'active' : ''}
                            onClick={() => { setCurrentPage(i + 1); window.scrollTo(0, 0); }}
                        >
                            {i + 1}
                        </button>
                    ))}

                    <button
                        disabled={currentPage === pageCount}
                        onClick={() => { setCurrentPage(p => p + 1); window.scrollTo(0, 0); }}
                    >
                        &rarr;
                    </button>
                </nav>
            )}

            {total > 0 && (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '10px' }}>
                    Всього подій: {total}
                </p>
            )}
        </div>
    );
}
