const Card = require('../models/Card');

exports.handleRedirect = async (req, res) => {
    try {
        const { shortCode } = req.params;

        // البحث عن البطاقة في قاعدة البيانات
        const card = await Card.findOne({ shortCode });

        if (!card) {
            return res.status(404).send('البطاقة غير صالحة أو غير موجودة في نظام AMT');
        }

        // إذا كانت غير مفعلة، نوجهه لصفحة التفعيل
        if (!card.isActivated) {
            return res.redirect(`https://amt-nfc-system-q1zi.vercel.app/activate/${shortCode}`);
        }

        // إذا كانت البطاقة مقفلة، نمنع التحويل ونعرض رسالة 'البطاقة غير مفعلة مؤقتاً'
        if (card.isLocked) {
            return res.status(403).send('البطاقة غير مفعلة مؤقتاً');
        }

        // إذا كانت مفعلة: نزيد النقرات ونوجهه إلى الرابط الداخلي الديناميكي
        card.clicksCount += 1;
        await card.save();

        // بدلاً من التوجيه الخارجي لـ PDF، نوجهه للقالب التفاعلي للـ SaaS
        return res.redirect(`/${shortCode}`);

    } catch (error) {
        res.status(500).send('حدث خطأ في الخادم أثناء التوجيه');
    }
};