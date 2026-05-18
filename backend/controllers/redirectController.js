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
            return res.redirect(`res.redirect(`https://amt-nfc-system-q1zi.vercel.app/activate/${shortCode}`);/activate/${shortCode}`);
        }

        // إذا كانت مفعلة: نزيد النقرات ونوجهه لرابطه النهائي
        card.clicksCount += 1;
        await card.save();

        return res.redirect(card.destinationUrl);

    } catch (error) {
        res.status(500).send('حدث خطأ في الخادم أثناء التوجيه');
    }
};