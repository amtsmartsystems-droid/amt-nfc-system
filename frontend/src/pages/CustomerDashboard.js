import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CustomerDashboard = () => {
    const [card, setCard] = useState(null);
    const [newUrl, setNewUrl] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    // جلب بيانات بطاقة العميل عند فتح الشاشة
    useEffect(() => {
        const fetchCardData = async () => {
            try {
                const token = localStorage.getItem('token');
                // طلب جلب البطاقات الخاصة بهذا المستخدم فقط من السيرفر
                const res = await axios.get('https://amt-nfc-system.onrender.com/api/cards/my-cards', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (res.data && res.data.length > 0) {
                    setCard(res.data[0]); // نأخذ البطاقة الأولى المرتبطة بحسابه
                    setNewUrl(res.data[0].destinationUrl);
                }
                setLoading(false);
            } catch (error) {
                setMessage('❌ فشل في جلب بيانات البطاقة، تأكد من تسجيل الدخول');
                setLoading(false);
            }
        };
        fetchCardData();
    }, []);

    // دالة تحديث الرابط للعميل
    const handleUpdateUrl = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.put(`https://amt-nfc-system.onrender.com/api/cards/${card._id}`, 
                { destinationUrl: newUrl },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage('✅ تم تحديث رابط البطاقة بنجاح! جرب مسحها الآن.');
            setCard({ ...card, destinationUrl: newUrl }); // تحديث الشاشة فوراً
        } catch (error) {
            setMessage('❌ حدث خطأ أثناء التحديث، حاول مجدداً.');
        }
    };

    if (loading) return <h3 style={{marginTop: '50px'}}>جاري تحميل لوحة التحكم... ⏳</h3>;

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2>📱 لوحة تحكم بطاقتك الذكية</h2>
                <p style={{ color: '#7f8c8d' }}>مرحباً بك! هنا يمكنك مراقبة وتعديل عمل بطاقتك الذكية.</p>

                {message && <p style={{ fontWeight: 'bold', color: '#2c3e50', marginTop: '15px' }}>{message}</p>}

                {card ? (
                    <>
                        {/* مربع الإحصائيات الفخم للعداد */}
                        <div style={styles.statsBox}>
                            <span style={styles.statsNumber}>{card.clicksCount}</span>
                            <label style={styles.statsLabel}>إجمالي عدد النقرات / المسحات 🎯</label>
                        </div>

                        <form onSubmit={handleUpdateUrl} style={styles.form}>
                            <label style={styles.label}>الرابط الحالي الذي توجه إليه البطاقة:</label>
                            <input
                                type="url"
                                value={newUrl}
                                onChange={(e) => setNewUrl(e.target.value)}
                                style={styles.input}
                                placeholder="https://..."
                                required
                            />
                            <button type="submit" style={styles.button}>تعديل وتحديث الرابط فوراً 🔄</button>
                        </form>
                    </>
                ) : (
                    <p style={{color: 'orange', fontWeight: 'bold'}}>⚠️ لا توجد بطاقة مرتبطة بحسابك حالياً. قم بتفعيل بطاقتك أولاً.</p>
                )}
            </div>
        </div>
    );
};

// تصميم مخصص ومريح لعين العميل
const styles = {
    container: { display: 'flex', justifyContent: 'center', marginTop: '40px', padding: '20px' },
    card: { padding: '40px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', borderRadius: '15px', width: '480px', backgroundColor: '#ffffff', border: '1px solid #e0e0e0' },
    statsBox: { backgroundColor: '#3498db', padding: '20px', borderRadius: '12px', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '20px 0', boxShadow: '0 4px 10px rgba(52, 152, 219, 0.3)' },
    statsNumber: { fontSize: '42px', fontWeight: 'bold' },
    statsLabel: { fontSize: '14px', marginTop: '5px', fontWeight: '500' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px' },
    label: { fontWeight: 'bold', color: '#2c3e50', textAlign: 'right', fontSize: '14px' },
    input: { padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px', outline: 'none', direction: 'ltr' },
    button: { padding: '14px', borderRadius: '8px', border: 'none', backgroundColor: '#2c3e50', color: 'white', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold', transition: '0.3s' }
};

export default CustomerDashboard;