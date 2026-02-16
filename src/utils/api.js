export async function fetchEvents() {
    try {
        const response = await fetch('/events.json');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Помилка:", error);
        return [
            { id: 1, title: "React Workshop", body: "...", date: "2024-03-15", organizer: "Tech Academy" }
        ];
    }
}