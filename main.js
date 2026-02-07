import { fetchEvents } from './api.js';
import { getFavorites, toggleFavorite } from './storage.js';

let state = {
    allEvents: [],
    searchQuery: "",
    currentPage: 1,
    rowsPerPage: 8 // Заповнюємо сторінку повністю
};

// Компонент EventCard (отримуєProps)
function createEventCard(event, isFav) {
    const card = document.createElement('div');
    card.className = 'event-card';
    
    // Передаємо Props: назву, опис, дату та організатора
    card.innerHTML = `
        <div class="card-top">
            <h3>${event.title}</h3>
            <p class="desc">${event.body}</p>
            <div class="event-meta">
                <span>📅 ${event.date}</span> | <span>🎨 ${event.organizer}</span>
            </div>
        </div>
        <div class="card-actions">
            <span class="action-btn">Register</span>
            <button class="btn-fav ${isFav ? 'active' : ''}" title="Додати в цікаві">
                ${isFav ? '♥' : '♡'}
            </button>
            <span class="action-btn">View</span>
        </div>
    `;

    const btn = card.querySelector('.btn-fav');
    btn.onclick = () => {
        toggleFavorite(event.id); // Використовуємо ваш storage.js з try...catch
        render(); // Викликаємо перерендер
    };

    return card;
}

function renderPagination(totalItems) {
    const nav = document.getElementById('pagination-nav');
    if (!nav) return;
    nav.innerHTML = '';
    
    const pageCount = Math.ceil(totalItems / state.rowsPerPage);
    if (pageCount <= 1) return;

    // Кнопка Назад
    const prev = document.createElement('button');
    prev.innerHTML = '&larr;';
    prev.disabled = state.currentPage === 1;
    prev.onclick = () => { state.currentPage--; render(); window.scrollTo(0,0); };
    nav.appendChild(prev);

    // Номери
    for (let i = 1; i <= pageCount; i++) {
        const btn = document.createElement('button');
        btn.innerText = i;
        if (i === state.currentPage) btn.className = 'active';
        btn.onclick = () => { state.currentPage = i; render(); window.scrollTo(0,0); };
        nav.appendChild(btn);
    }

    // Кнопка Вперед
    const next = document.createElement('button');
    next.innerHTML = '&rarr;';
    next.disabled = state.currentPage === pageCount;
    next.onclick = () => { state.currentPage++; render(); window.scrollTo(0,0); };
    nav.appendChild(next);
}

function render() {
    const container = document.getElementById('events-container');
    const favorites = getFavorites();
    container.innerHTML = '';

    const filtered = state.allEvents.filter(e => 
        e.title.toLowerCase().includes(state.searchQuery.toLowerCase())
    );

    const start = (state.currentPage - 1) * state.rowsPerPage;
    const paginated = filtered.slice(start, start + state.rowsPerPage);

    paginated.forEach(event => {
        container.appendChild(createEventCard(event, favorites.includes(event.id)));
    });

    renderPagination(filtered.length);
}

document.getElementById('search-input')?.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    state.currentPage = 1;
    render();
});

async function init() {
    const data = await fetchEvents();
    if (data) {
        state.allEvents = data;
        render();
    }
}

init();