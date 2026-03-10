const API_URL = 'http://localhost:3000';

export async function fetchEvents(page = 1, limit = 10, sort = 'date', order = 'asc') {
    try {
        const response = await fetch(`${API_URL}/events?page=${page}&limit=${limit}&sort=${sort}&order=${order}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json(); 
    } catch (error) {
        console.error("Помилка завантаження подій:", error);
        return [];
    }
}

export async function registerToEvent(data) {
    try {
        const response = await fetch(`${API_URL}/participants`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fullName: data.fullName,
                email: data.email,
                eventId: data.eventId 
            })
        });
        if (!response.ok) throw new Error('Помилка при реєстрації');
        return await response.json();
    } catch (error) {
        console.error('Збереження учасника не вдалося:', error);
        return { success: false };
    }
}

export async function fetchParticipants(eventId) {
    try {
        const response = await fetch(`${API_URL}/participants/${eventId}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Помилка отримання учасників:", error);
        return [];
    }
}

export async function importExternalUsers() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        if (!response.ok) throw new Error('Помилка імпорту');
        const users = await response.json();
        return users.map(user => ({
            fullName: user.name,
            email: user.email,
            eventId: 1 
        }));
    } catch (error) {
        console.error("Помилка зовнішнього API:", error);
        throw error;
    }
}