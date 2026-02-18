export async function fetchEvents() {
    try {
        const response = await fetch('/events.json');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Помилка завантаження подій:", error);
        return [];
    }
}

export async function registerToEvent(data) {
    console.log('Збереження учасника:', data);
    
    const allParticipants = JSON.parse(localStorage.getItem('participants') || '[]');
    const newParticipant = { 
        ...data, 
        id: Date.now(),
        registrationDate: new Date().toISOString().split('T')[0]
    };
    
    allParticipants.push(newParticipant);
    localStorage.setItem('participants', JSON.stringify(allParticipants));
    
    return { success: true };
}

export async function fetchParticipants(eventId) {
    const allParticipants = JSON.parse(localStorage.getItem('participants') || '[]');
    return allParticipants.filter(p => p.eventId === parseInt(eventId));
}

export async function importExternalUsers() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        if (!response.ok) throw new Error('Помилка імпорту з зовнішнього API');
        const users = await response.json();
        
        console.log("Дані успішно отримано з зовнішнього API:", users);

        return users.map(user => ({
            id: Date.now() + Math.random(), 
            fullName: user.name,
            email: user.email,
            registrationDate: new Date().toISOString().split('T')[0],
            eventId: 1 
        }));
    } catch (error) {
        console.error("Помилка зовнішнього API:", error);
        throw error;
    }
}