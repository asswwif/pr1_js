import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import EventsPage from './pages/EventsPage.jsx';
import RegisterPage from '../RegisterPage.jsx';
import ParticipantsPage from '../ParticipantsPage.jsx';
import './style.css';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<EventsPage />} />
                <Route path="/register/:eventId" element={<RegisterPage />} />
                <Route path="/participants/:eventId" element={<ParticipantsPage />} />
            </Routes>
        </BrowserRouter>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);