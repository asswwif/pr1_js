import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';

import EventsPage from './pages/EventsPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ParticipantsPage from './pages/ParticipantsPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import './styles/style.css'; 

function App() {
    return (
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <header className="main-header">
                <div className="header-container">
                    <nav className="nav-menu">
                        <NavLink 
                            to="/" 
                            end 
                            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                        >
                            ПОДІЇ
                        </NavLink>
                        <NavLink 
                            to="/analytics" 
                            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                        >
                            АНАЛІТИКА
                        </NavLink>
                    </nav>
                </div>
            </header>

            <main className="container">
                <Routes>
                    <Route path="/" element={<EventsPage />} />
                    <Route path="/register/:eventId" element={<RegisterPage />} />
                    <Route path="/participants/:eventId" element={<ParticipantsPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                </Routes>
            </main>
        </BrowserRouter>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Provider store={store}>
            <App />
        </Provider>
    </React.StrictMode>
);