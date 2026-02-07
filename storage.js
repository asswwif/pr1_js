const STORAGE_KEY = 'favorite_events';

export function getFavorites() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } 
    catch (error) {
        console.error("Помилка LocalStorage:", error);
        return []; 
    }
}

export function toggleFavorite(id) {
    let favorites = getFavorites();
    const index = favorites.indexOf(id);

    if (index === -1) {
        favorites.push(id);
    } 
    else {
        favorites.splice(index, 1);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));

    return index === -1; // Повертає true, якщо додано, і false, якщо видалено
}