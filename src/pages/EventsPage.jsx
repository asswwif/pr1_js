import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getEvents } from '../redux/eventsSlice';
import { getFavorites, toggleFavorite } from '../utils/storage.js';

export default function EventsPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const { items: allEvents, status, error } = useSelector((state) => state.events);
    
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 8;

    useEffect(() => {
        if (status === 'idle') {
            dispatch(getEvents());
        }
    }, [status, dispatch]);

    const handleFavorite = (id) => {
        toggleFavorite(id);
        setSearchQuery(prev => prev + " "); 
        setTimeout(() => setSearchQuery(prev => prev.trim()), 10);
    };

    function createEventCard(event, isFav) {
        return (
            <div key={event.id} className="event-card">
                <div className="card-top">
                    <h3>{event.title}</h3>
                    <p className="desc">{event.body}</p>
                    <div className="event-meta">
                        <span>{event.date}</span> | <span>{event.organizer}</span>
                    </div>
                </div>
                <div className="card-actions">
                    <span 
                        className="action-btn" 
                        onClick={() => navigate(`/register/${event.id}`)}
                    >
                        Register
                    </span>
                    <button 
                        className={`btn-fav ${isFav ? 'active' : ''}`}
                        onClick={() => handleFavorite(event.id)}
                    >
                        {isFav ? '♥' : '♡'}
                    </button>
                    <span 
                        className="action-btn"
                        onClick={() => navigate(`/participants/${event.id}`)}
                    >
                        View
                    </span>
                </div>
            </div>
        );
    }

    const favorites = getFavorites();
    const filtered = allEvents.filter(e =>
        e.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const start = (currentPage - 1) * rowsPerPage;
    const paginated = filtered.slice(start, start + rowsPerPage);
    const pageCount = Math.ceil(filtered.length / rowsPerPage);

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
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            </header>

            <div id="events-container">
                {paginated.length > 0 ? (
                    paginated.map(event => createEventCard(event, favorites.includes(event.id)))
                ) : (
                    <p className="no-participants">Нічого не знайдено</p>
                )}
            </div>

            {pageCount > 1 && (
                <nav className="pagination-container">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => {
                            setCurrentPage(prev => prev - 1);
                            window.scrollTo(0, 0);
                        }}
                    >
                        &larr;
                    </button>

                    {[...Array(pageCount)].map((_, i) => (
                        <button
                            key={i + 1}
                            className={currentPage === i + 1 ? 'active' : ''}
                            onClick={() => {
                                setCurrentPage(i + 1);
                                window.scrollTo(0, 0);
                            }}
                        >
                            {i + 1}
                        </button>
                    ))}

                    <button
                        disabled={currentPage === pageCount}
                        onClick={() => {
                            setCurrentPage(prev => prev + 1);
                            window.scrollTo(0, 0);
                        }}
                    >
                        &rarr;
                    </button>
                </nav>
            )}
        </div>
    );
}