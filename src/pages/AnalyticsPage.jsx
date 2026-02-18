import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectAllParticipants, importUsersThunk } from '../redux/participantsSlice';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer
} from 'recharts';

export default function AnalyticsPage() {
    const dispatch = useDispatch();
    const participants = useSelector(selectAllParticipants);

    const aggregateData = () => {
        const counts = participants.reduce((acc, p) => {
            const date = p.registrationDate || new Date().toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});

        return Object.keys(counts)
            .map(date => ({ date, count: counts[date] }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    };

    const chartData = aggregateData();

    const maxRegistrations = chartData.length > 0 ? Math.max(...chartData.map(d => d.count)) : 0;

    return (
        <div className="container analytics-container">
            <header className="analytics-header">
                <div>
                    <h1 className="page-title">Аналітика</h1>
                    <p className="page-subtitle">Моніторинг активності реєстрацій</p>
                </div>
                <button 
                    className="action-btn import-btn" 
                    onClick={() => dispatch(importUsersThunk())}
                >
                    Завантажити зовнішні дані
                </button>
            </header>

            <div className="stats-grid">
                <div className="stat-card primary">
                    <h3 className="stat-label">Всього учасників</h3>
                    <p className="stat-value">{participants.length}</p>
                </div>
                <div className="stat-card secondary">
                    <h3 className="stat-label">Активних днів</h3>
                    <p className="stat-value">{chartData.length}</p>
                </div>
                <div className="stat-card accent">
                    <h3 className="stat-label">Рекорд за день</h3>
                    <p className="stat-value">{maxRegistrations}</p>
                </div>
            </div>

            <div className="chart-section">
                <h3 className="chart-title">Динаміка реєстрацій</h3>
                <div className="chart-wrapper">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart 
                                data={chartData} 
                                margin={{ top: 25, right: 30, left: 10, bottom: 10 }}
                            >
                                <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#e0e0e0" />
                                <XAxis 
                                    dataKey="date" 
                                    tick={{ fontSize: 12, fill: '#777' }} 
                                    tickMargin={15} 
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis 
                                    width={40} 
                                    allowDecimals={false} 
                                    tick={{ fontSize: 12, fill: '#777' }} 
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip 
                                    cursor={{ stroke: 'var(--accent-blue)', strokeWidth: 1, strokeDasharray: '3 3' }}
                                    contentStyle={{ 
                                        borderRadius: '8px', 
                                        border: 'none', 
                                        boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                                        padding: '10px 15px'
                                    }}
                                    labelStyle={{ fontWeight: 'bold', color: '#333', marginBottom: '5px' }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="count" 
                                    name="Кількість"
                                    stroke="var(--accent-blue)" 
                                    strokeWidth={3} 
                                    dot={{ r: 5, fill: 'var(--accent-blue)', stroke: '#fff', strokeWidth: 2 }}
                                    activeDot={{ r: 8, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="empty-state">
                            <p>Дані відсутні. Імпортуйте учасників або додайте їх вручну.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}