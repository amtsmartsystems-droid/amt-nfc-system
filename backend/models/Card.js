const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
    shortCode: {
        type:     String,
        required: true,
        unique:   true,
    },
    destinationUrl: {
        type:    String,
        default: '',
    },
    owner: {
        type:    mongoose.Schema.Types.ObjectId,
        ref:     'User',
        default: null,
    },
    isActivated: {
        type:    Boolean,
        default: false,
    },
    clicksCount: {
        type:    Number,
        default: 0,
    },
    isLocked: {
        type:    Boolean,
        default: false,
    },

    // ── SaaS Theme Fields ──────────────────────────────────────────
    cardType: {
        type:    String,
        enum:    ['restaurant', 'business_card'],
        default: 'restaurant',
    },
    themeName: {
        type:    String,
        default: 'RestaurantTheme',
    },
    businessName: {
        type:    String,
        default: '',
    },
    primaryColor: {
        type:    String,
        default: '#000000',
    },
    background: {
        type:    String,
        default: '#ffffff',
    },
    siteData: {
        type:    Object,
        default: {},
    },
    links: {
        type: [{
            id:     Number,
            title:  String,
            titleAr:String,
            url:    String,
            clicks: { type: Number, default: 0 },
        }],
        default: [],
    },
    events: {
        type: [{
            id:      Number,
            title:   String,
            titleEn: String,
            desc:    String,
            descEn:  String,
        }],
        default: [],
    },
    wifi: {
        type: {
            ssid:     { type: String, default: '' },
            password: { type: String, default: '' },
        },
        default: { ssid: '', password: '' },
    },
    telegramConfig: {
        type: {
            botToken:  { type: String, default: '' },
            chatId:    { type: String, default: '' },
            isEnabled: { type: Boolean, default: false },
        },
        default: { botToken: '', chatId: '', isEnabled: false },
    },

    // ── Subscription Gate ──────────────────────────────────────────
    /**
     * 'active'    → Normal, owner can edit
     * 'suspended' → Subscription expired, editing blocked
     */
    subscriptionStatus: {
        type:    String,
        enum:    ['active', 'suspended'],
        default: 'active',
    },
    /**
     * Fine-grained toggle — Super_Admin can disable editing
     * without fully suspending (e.g., for content violations)
     */
    allowEditing: {
        type:    Boolean,
        default: true,
    },

}, { timestamps: true });

module.exports = mongoose.models.Card || mongoose.model('Card', cardSchema);