import React, { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const ActivateCard = () => {
    const { shortCode } = useParams(); // سحب الكود القصير من الرابط
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [destinationUrl, setDestinationUrl] = useState('');
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const handleActivate = async (e) => {
        e.preventDefault();
        try {
            // 1. تسجيل حساب جديد للعميل في النظام
            const authRes = await axios.post('https://amt-nfc-system.onrender.com', {
                name,
                email,
                password,
                role: 'customer' // رتبته عميل وليس أدمن
            });
            
            const token = authRes.data.token;

            // 2. تفعيل البطاقة وربطها بحسابه والرابط الذي أدخله
            await axios.post('https://amt-nfc-system.onrender.com/api/cards/activate', 
                { shortCode, destinationUrl },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setIsSuccess(true);
            setMessage('🎉 مبروك! تم تفعيل بطاقتك الذكية بنجاح. أي شخص يمسحها الآن سيذهب لرابطك مباشرة.');
        } catch (error) {
            setMessage('❌ حدث خطأ! ربما هذا الإيميل مستخدم مسبقاً، أو البطاقة مفعلة بالفعل.');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2>مرحباً بك في نظام AMT للبطاقات الذكية 💳</h2>
                {isSuccess ? (
                    <h3 style={{ color: '#27ae60', lineHeight: '1.6' }}>{message}</h3>
                ) : (
                    <>
                        <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>
                            بطاقتك (<strong>{shortCode}</strong>) جديدة كلياً! قم بإنشاء حسابك لإدارتها ووضع الرابط الخاص بك.
                        </p>
                        
                        {message && <p style={{ color: 'red', fontWeight: 'bold' }}>{message}</p>}

                        <form onSubmit={handleActivate} style={styles.form}>
                            <input type="text" placeholder="اسمك الكريم / اسم النشاط" value={name} onChange={(e) => setName(e.target.value)} style={styles.input} required />
                            <input type="email" placeholder="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} required />
                            <input type="password" placeholder="كلمة مرور سرية لحسابك" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} required />
                            <hr style={{width: '100%', border: '0.5px solid #eee'}}/>
                            <label style={styles.label}>إلى أين تريد أن تذهب البطاقة عند مسحها؟</label>
                            <input type="url" placeholder="مثال: https://instagram.com/yourpage" value={destinationUrl} onChange={(e) => setDestinationUrl(e.target.value)} style={styles.input} required />
                            
                            <button type="submit" style={styles.button}>تفعيل البطاقة الآن 🚀</button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'flex', justifyContent: 'center', marginTop: '40px', padding: '20px' },
    card: { padding: '40px', boxShadow: '0 8px 20px rgba(0,0,0,0.1)', borderRadius: '15px', width: '500px', backgroundColor: '#ffffff', border: '1px solid #e0e0e0' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    label: { fontWeight: 'bold', color: '#2c3e50', textAlign: 'right', fontSize: '14px' },
    input: { padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px', outline: 'none' },
    button: { padding: '14px', borderRadius: '8px', border: 'none', backgroundColor: '#27ae60', color: 'white', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }
};

export default ActivateCard;