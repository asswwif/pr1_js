import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function SupportChat({ eventId }) {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [author, setAuthor] = useState('Гість');
    const [isOpen, setIsOpen] = useState(false);
    const [connected, setConnected] = useState(false);
    const socketRef = useRef(null);
    const bottomRef = useRef(null);

    useEffect(() => {
        const socket = io(API_URL, { withCredentials: true });
        socketRef.current = socket;

        socket.on('connect', () => {
            setConnected(true);
            socket.emit('join-event', eventId || 'global');
        });

        socket.on('disconnect', () => setConnected(false));

        socket.on('chat-message', (msg) => {
            setMessages(prev => [...prev, msg]);
        });

        socket.on('new-participant', (data) => {
            setMessages(prev => [...prev, {
                message: `${data.fullName} щойно зареєструвався!`,
                author: 'Система',
                time: data.registrationDate
            }]);
        });

        return () => socket.disconnect();
    }, [eventId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const send = () => {
        const trimmed = text.trim();
        if (!trimmed || !socketRef.current) return;

        socketRef.current.emit('chat-message', {
            eventId: eventId || 'global',
            message: trimmed,
            author: author || 'Гість'
        });
        setText('');
    };

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
    };

    return (
        <div className="chat-widget">
            <button className="chat-toggle" onClick={() => setIsOpen(o => !o)}>
                {isOpen ? '✕' : '💬'}
                {!isOpen && messages.length > 0 && (
                    <span className="chat-badge">{messages.length}</span>
                )}
            </button>

            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <span>Чат підтримки</span>
                        <span className={`chat-status ${connected ? 'online' : 'offline'}`}>
                            {connected ? 'онлайн' : 'офлайн'}
                        </span>
                    </div>

                    <div className="chat-author-row">
                        <input
                            className="chat-author-input"
                            placeholder="Ваше ім'я"
                            value={author}
                            onChange={e => setAuthor(e.target.value)}
                            maxLength={30}
                        />
                    </div>

                    <div className="chat-messages">
                        {messages.length === 0 && (
                            <p className="chat-empty">Поки що немає повідомлень</p>
                        )}
                        {messages.map((msg, i) => (
                            <div key={i} className={`chat-msg ${msg.author === 'Система' ? 'system' : ''}`}>
                                <span className="chat-msg-author">{msg.author}</span>
                                <span className="chat-msg-text">{msg.message}</span>
                                <span className="chat-msg-time">
                                    {new Date(msg.time).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        ))}
                        <div ref={bottomRef} />
                    </div>

                    <div className="chat-input-row">
                        <textarea
                            className="chat-input"
                            placeholder="Напишіть повідомлення..."
                            value={text}
                            onChange={e => setText(e.target.value)}
                            onKeyDown={handleKey}
                            rows={2}
                        />
                        <button className="chat-send" onClick={send} disabled={!text.trim()}>
                            →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
