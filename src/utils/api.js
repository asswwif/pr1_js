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
    console.log('Sending POST request with data:', data);
    
    const allParticipants = JSON.parse(localStorage.getItem('participants') || '[]');
    const newParticipant = { ...data, id: Date.now() };
    allParticipants.push(newParticipant);
    localStorage.setItem('participants', JSON.stringify(allParticipants));
    
    return { success: true };
}

export async function fetchParticipants(eventId) {
    const allParticipants = JSON.parse(localStorage.getItem('participants') || '[]');
    return allParticipants.filter(p => p.eventId === parseInt(eventId));
}