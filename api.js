export async function fetchEvents() {
    try {
        const response = await fetch('./events.json');
        if (!response.ok) throw new Error(`Status: ${response.status}`);
        return await response.json();
    } 
    catch (error) {
        console.error("Помилка завантаження даних:", error.message);
        return null;
    }
}