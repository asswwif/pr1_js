import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { z } from 'zod';
import { fetchEvents } from './src/utils/api.js';

const registrationSchema = z.object({
    fullName: z.string().min(1, "Поле обов'язкове"),
    email: z.string().email("Некоректний email"),
    dateOfBirth: z.string().min(1, "Поле обов'язкове").refine((date) => {
        const birthDate = new Date(date);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            return age - 1 >= 18;
        }
        return age >= 18;
    }, "Вам має бути принаймні 18 років"),
    source: z.enum(['social_media', 'friends', 'found_myself'], {
        errorMap: () => ({ message: "Оберіть один з варіантів" })
    })
});

export default function RegisterPage() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        dateOfBirth: '',
        source: ''
    });

    useEffect(() => {
        async function loadEvent() {
            try {
                const data = await fetchEvents();
                
                if (!data || data.length === 0) {
                    alert('Помилка: дані не завантажилися');
                    setLoading(false);
                    return;
                }
                
                const foundEvent = data.find(e => e.id === parseInt(eventId));
                
                if (foundEvent) {
                    setEvent(foundEvent);
                } else {
                    alert(`Подію з ID ${eventId} не знайдено`);
                }
            } catch (err) {
                alert('Помилка завантаження: ' + err.message);
            } finally {
                setLoading(false);
            }
        }
        
        loadEvent();
    }, [eventId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const validatedData = registrationSchema.parse(formData);
            
            const requestData = {
                ...validatedData,
                eventId: parseInt(eventId)
            };
            
            console.log('POST request to server:', requestData);
            
            alert('Реєстрація успішна!');
            navigate(`/participants/${eventId}`);
            
        } catch (error) {
            if (error instanceof z.ZodError) {
                const fieldErrors = {};
                error.errors.forEach(err => {
                    fieldErrors[err.path[0]] = err.message;
                });
                setErrors(fieldErrors);
            }
        }
    };

    if (loading) {
        return (
            <div className="container">
                <div style={{ padding: '50px', textAlign: 'center' }}>
                    <h2>Завантаження...</h2>
                </div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="container">
                <div style={{ padding: '50px', textAlign: 'center' }}>
                    <h2>Подію не знайдено</h2>
                    <p>ID події: {eventId}</p>
                    <button onClick={() => navigate('/')} className="back-btn" style={{ 
                        marginTop: '20px',
                        padding: '10px 20px',
                        background: '#0066cc',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}>
                        ← Повернутися на головну
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="register-header">
                <button onClick={() => navigate('/')} className="back-btn">← Назад</button>
                <h1>Event registration</h1>
                <h2>{event.title}</h2>
            </div>

            <form className="registration-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="fullName">Full name</label>
                    <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className={errors.fullName ? 'error' : ''}
                    />
                    {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={errors.email ? 'error' : ''}
                    />
                    {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="dateOfBirth">Date of birth</label>
                    <input
                        type="date"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        className={errors.dateOfBirth ? 'error' : ''}
                    />
                    {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
                </div>

                <div className="form-group">
                    <label>Where did you hear about this event?</label>
                    <div className="radio-group">
                        <label>
                            <input
                                type="radio"
                                name="source"
                                value="social_media"
                                checked={formData.source === 'social_media'}
                                onChange={handleChange}
                            />
                            Social media
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="source"
                                value="friends"
                                checked={formData.source === 'friends'}
                                onChange={handleChange}
                            />
                            Friends
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="source"
                                value="found_myself"
                                checked={formData.source === 'found_myself'}
                                onChange={handleChange}
                            />
                            Found myself
                        </label>
                    </div>
                    {errors.source && <span className="error-message">{errors.source}</span>}
                </div>

                <button type="submit" className="submit-btn">Зареєструватися</button>
            </form>
        </div>
    );
}