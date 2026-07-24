const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
    // Only one document should exist for system settings, so we can use a fixed ID or just findOne()
    singleton: {
        type: String,
        default: 'amyt_system_settings',
        unique: true
    },
    categories: {
        type: [{
            id: { type: String, required: true },
            name: { type: String, required: true },
            themes: [{
                id: { type: String, required: true },
                label: { type: String, required: true },
                icon: { type: String, default: 'Layout' }
            }]
        }],
        default: [
            {
                id: 'restaurant',
                name: 'منيو مطعم',
                themes: [
                    { id: 'restaurant', label: 'مطعم فاخر', icon: 'Utensils' },
                    { id: 'cafe', label: 'مقهى منيمل', icon: 'Coffee' },
                    { id: 'cafe1', label: 'مقهى حديث', icon: 'Bean' },
                    { id: 'gastro', label: 'مطعم فاخر', icon: 'UtensilsCrossed' },
                    { id: 'marouf_coffee', label: 'بن معروف ✓', icon: 'Coffee' },
                    { id: 'rustic_cafe', label: 'عشق البوهيمي', icon: 'Tent' }
                ]
            },
            {
                id: 'business_card',
                name: 'بطاقة أعمال',
                themes: [
                    { id: 'business_card', label: 'بطاقة رقمية', icon: 'IdCard' }
                ]
            }
        ]
    }
}, { timestamps: true });

module.exports = mongoose.models.SystemSettings || mongoose.model('SystemSettings', systemSettingsSchema);
