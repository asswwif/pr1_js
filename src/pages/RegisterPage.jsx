import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { z } from 'zod';
import { fetchEvents, registerToEvent } from '../utils/api.js';

const registrationSchema = z.object({
    fullName: z.string().min(2, "ПІБ має містити принаймні 2 символи"),
    email: z.string().email("Некоректний формат email"),
    dateOfBirth: z.string().min(1, "Дата народження обов'язкова").refine((date) => {
        const birthDate = new Date(date);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age >= 18;
    }, "Реєстрація дозволена лише особам від 18 років"),
    source: z.string().min(1, "Будь ласка, оберіть варіант")
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
        fetchEvents().then(data => {
            const found = data.find(e => e.id === parseInt(eventId));
            if (found) setEvent(found);
            setLoading(false);
        });
    }, [eventId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const validatedData = registrationSchema.parse(formData);
            await registerToEvent({ ...validatedData, eventId: parseInt(eventId) });
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

    if (loading) return <div className="container">Завантаження...</div>;

    const sourceOptions = [
        { value: 'social_media', label: 'Соціальні мережі' },
        { value: 'friends', label: 'Від друзів' },
        { value: 'found_myself', label: 'Знайшов(ла) самостійно' }
    ];

    return (
        <div className="container">
            <header className="register-header">
                <button onClick={() => navigate(-1)} className="back-btn">← Назад</button>
                <h1>Реєстрація на захід</h1>
                <p className="event-title">"{event?.title}"</p>
            </header>

            <form className="registration-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>ПІБ</label>
                    <input
                        type="text"
                        name="fullName"
                        placeholder="Введіть ваше ПІБ"
                        value={formData.fullName}
                        onChange={handleChange}
                        className={errors.fullName ? 'error' : ''}
                    />
                    {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                </div>

                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="example@mail.com"
                        value={formData.email}
                        onChange={handleChange}
                        className={errors.email ? 'error' : ''}
                    />
                    {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="form-group">
                    <label>Дата народження</label>
                    <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        className={errors.dateOfBirth ? 'error' : ''}
                    />
                    {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
                </div>

                <div className="form-group">
                    <label>Звідки ви дізналися про захід?</label>
                    <div className="radio-group">
                        {sourceOptions.map(option => (
                            <label key={option.value} className="radio-label">
                                <input
                                    type="radio"
                                    name="source"
                                    value={option.value}
                                    checked={formData.source === option.value}
                                    onChange={handleChange}
                                />
                                {option.label}
                            </label>
                        ))}
                    </div>
                    {errors.source && <span className="error-message">{errors.source}</span>}
                </div>

                <button type="submit" className="submit-btn">Зареєструватися</button>
            </form>
        </div>
    );
}