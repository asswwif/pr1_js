const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function fetchEvents(page = 1, limit = 10, sort = 'date', order = 'asc', search = '') {
    try {
        const params = new URLSearchParams({ page, limit, sort, order });
        if (search) params.set('search', search);

        const response = await fetch(`${API_URL}/events?${params}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        if (Array.isArray(data)) return { items: data, total: data.length, totalPages: 1 };
        return data;
    } catch (error) {
        console.error('Помилка завантаження подій:', error);
        return { items: [], total: 0, totalPages: 1 };
    }
}

export async function fetchEvent(id) {
    try {
        const response = await fetch(`${API_URL}/events/${id}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Помилка завантаження події:', error);
        return null;
    }
}

export async function registerToEvent(data) {
    try {
        const response = await fetch(`${API_URL}/participants`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                fullName: data.fullName,
                email: data.email,
                eventId: data.eventId
            })
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Помилка при реєстрації');
        }
        return await response.json();
    } catch (error) {
        console.error('Збереження учасника не вдалося:', error);
        throw error;
    }
}

export async function fetchParticipants(eventId) {
    try {
        const response = await fetch(`${API_URL}/participants/${eventId}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return data.map(p => ({ ...p, id: String(p._id || p.id) }));
    } catch (error) {
        console.error('Помилка отримання учасників:', error);
        return [];
    }
}

export async function login(email, password) {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
    });
    if (!response.ok) throw new Error('Помилка входу');
    return await response.json();
}

export async function logout() {
    await fetch(`${API_URL}/logout`, { method: 'POST', credentials: 'include' });
}

export async function importExternalUsers() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        if (!response.ok) throw new Error('Помилка імпорту');
        const users = await response.json();
        return users.map(user => ({
            id: `ext-${user.id}`,
            fullName: user.name,
            email: user.email,
            eventId: 1,
            registrationDate: new Date().toISOString().split('T')[0]
        }));
    } catch (error) {
        console.error('Помилка зовнішнього API:', error);
        throw error;
    }
}
