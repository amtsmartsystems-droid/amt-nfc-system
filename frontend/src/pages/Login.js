import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    // متغيرات لحفظ ما يكتبه المستخدم في المربعات
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate(); // أداة للتنقل بين الصفحات

    // الدالة التي تعمل عند الضغط على زر "دخول"
const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/auth/login', {
                email,
                password
            });
            
            localStorage.setItem('token', res.data.token);
            
            // الفحص الذكي لرتبة المستخدم لتوجيهه للمكان الصحيح
            if (res.data.role === 'admin') {
                navigate('/dashboard'); // توجيه الأدمن لمصنع البطاقات
            } else {
                navigate('/customer-dashboard'); // توجيه العميل للوحته الخاصة بالعداد
            }
        } catch (err) {
            setError('فشل تسجيل الدخول: الإيميل أو كلمة المرور غير صحيحة');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2>تسجيل الدخول للإدارة 🔐</h2>
                {/* إظهار رسالة الخطأ إن وجدت */}
                {error && <p style={{color: 'red', fontWeight: 'bold'}}>{error}</p>}
                
                <form onSubmit={handleLogin} style={styles.form}>
                    <input
                        type="email"
                        placeholder="البريد الإلكتروني"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={styles.input}
                        required
                    />
                    <input
                        type="password"
                        placeholder="كلمة المرور"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={styles.input}
                        required
                    />
                    <button type="submit" style={styles.button}>دخول</button>
                </form>
            </div>
        </div>
    );
};

// تصميم أنيق وخفيف للشاشة
const styles = {
    container: { display: 'flex', justifyContent: 'center', marginTop: '40px' },
    card: { padding: '40px', boxShadow: '0 8px 16px rgba(0,0,0,0.1)', borderRadius: '15px', width: '350px', backgroundColor: '#ffffff', border: '1px solid #eee' },
    form: { display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' },
    input: { padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px', outline: 'none' },
    button: { padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#2c3e50', color: 'white', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold' }
};

export default Login;