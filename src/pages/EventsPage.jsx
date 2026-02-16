import { fetchEvents } from '../utils/api.js';
import { getFavorites, toggleFavorite } from '../utils/storage.js';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function EventsPage() {
    const navigate = useNavigate();
    const [state, setState] = useState({
        allEvents: [],
        searchQuery: "",
        currentPage: 1,
        rowsPerPage: 8
    });

    useEffect(() => {
        fetchEvents().then(data => {
            if (data) {
                setState(prev => ({ ...prev, allEvents: data }));
            }
        });
    }, []);

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
                        onClick={() => {
                            toggleFavorite(event.id);
                            setState(prev => ({ ...prev }));
                        }}
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

    function renderPagination(totalItems) {
        const pageCount = Math.ceil(totalItems / state.rowsPerPage);
        if (pageCount <= 1) return null;

        return (
            <nav className="pagination-container">
                <button
                    disabled={state.currentPage === 1}
                    onClick={() => {
                        setState(prev => ({ ...prev, currentPage: prev.currentPage - 1 }));
                        window.scrollTo(0, 0);
                    }}
                >
                    &larr;
                </button>

                {[...Array(pageCount)].map((_, i) => (
                    <button
                        key={i + 1}
                        className={state.currentPage === i + 1 ? 'active' : ''}
                        onClick={() => {
                            setState(prev => ({ ...prev, currentPage: i + 1 }));
                            window.scrollTo(0, 0);
                        }}
                    >
                        {i + 1}
                    </button>
                ))}

                <button
                    disabled={state.currentPage === pageCount}
                    onClick={() => {
                        setState(prev => ({ ...prev, currentPage: prev.currentPage + 1 }));
                        window.scrollTo(0, 0);
                    }}
                >
                    &rarr;
                </button>
            </nav>
        );
    }

    const favorites = getFavorites();
    const filtered = state.allEvents.filter(e =>
        e.title.toLowerCase().includes(state.searchQuery.toLowerCase())
    );

    const start = (state.currentPage - 1) * state.rowsPerPage;
    const paginated = filtered.slice(start, start + state.rowsPerPage);

    return (
        <div className="container">
            <header className="main-header">
                <h1>Events</h1>
                <div className="search-wrapper">
                    <input
                        type="text"
                        id="search-input"
                        placeholder="Пошук курсів..."
                        value={state.searchQuery}
                        onChange={(e) => {
                            setState(prev => ({
                                ...prev,
                                searchQuery: e.target.value,
                                currentPage: 1
                            }));
                        }}
                    />
                </div>
            </header>

            <div id="events-container">
                {paginated.map(event => createEventCard(event, favorites.includes(event.id)))}
            </div>

            {renderPagination(filtered.length)}
        </div>
    );
}