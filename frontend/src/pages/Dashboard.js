import React, { useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
    const [count, setCount] = useState(1); // عدد البطاقات الافتراضي
    const [message, setMessage] = useState('');
    const [cards, setCards] = useState([]); // لحفظ البطاقات التي ستظهر على الشاشة

    // الدالة المسؤولة عن توليد البطاقات
    const handleGenerate = async (e) => {
        e.preventDefault();
        try {
            // جلب المفتاح السري الخاص بك كأدمن من المتصفح
            const token = localStorage.getItem('token');
            
            // إرسال الطلب للخادم
            const res = await axios.post('https://amt-nfc-system.onrender.com/api/cards/generate',
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setMessage(res.data.message); // رسالة النجاح
            setCards(res.data.cards); // وضع البطاقات في القائمة لعرضها
        } catch (error) {
            setMessage('❌ حدث خطأ أثناء توليد البطاقات، تأكد من اتصال الخادم');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2>⚙️ لوحة تحكم الإدارة (مصنع البطاقات)</h2>
                <p style={{ color: '#7f8c8d' }}>أهلاً بك يا مدير النظام! حدد العدد واضغط توليد.</p>

                <form onSubmit={handleGenerate} style={styles.form}>
                    <label style={styles.label}>كم بطاقة تريد توليدها الآن؟</label>
                    <input
                        type="number"
                        min="1"
                        max="100"
                        value={count}
                        onChange={(e) => setCount(e.target.value)}
                        style={styles.input}
                        required
                    />
                    <button type="submit" style={styles.button}>توليد البطاقات 🚀</button>
                </form>

                {/* عرض رسالة النجاح */}
                {message && <h3 style={{ color: '#27ae60', marginTop: '20px' }}>{message}</h3>}

                {/* عرض الروابط التي سيتم برمجتها داخل شرائح الـ NFC */}
                {cards.length > 0 && (
                    <div style={styles.listContainer}>
                        <h4 style={{textAlign: 'right'}}>الروابط الجاهزة للبرمجة (NFC):</h4>
                        <ul style={styles.list}>
                            {cards.map((card, index) => (
                                <li key={index} style={styles.listItem}>
                                    https://amt-nfc-system-q1zi.vercel.app/activate/${card.shortCode}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

// تصميم أنيق للوحة التحكم
const styles = {
    container: { display: 'flex', justifyContent: 'center', marginTop: '40px' },
    card: { padding: '40px', boxShadow: '0 8px 16px rgba(0,0,0,0.1)', borderRadius: '15px', width: '500px', backgroundColor: '#ffffff', border: '1px solid #eee' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' },
    label: { fontWeight: 'bold', color: '#2c3e50', textAlign: 'right' },
    input: { padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '18px', outline: 'none', textAlign: 'center' },
    button: { padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#e67e22', color: 'white', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold' },
    listContainer: { marginTop: '25px', padding: '15px', backgroundColor: '#f4f6f7', borderRadius: '10px' },
    list: { listStyleType: 'none', padding: 0, margin: 0 },
    listItem: { padding: '10px', borderBottom: '1px solid #ddd', direction: 'ltr', textAlign: 'left', fontWeight: 'bold', color: '#34495e', fontFamily: 'monospace' }
};

export default Dashboard;