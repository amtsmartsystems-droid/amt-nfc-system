const mongoose = require('mongoose');

/**
 * UserSchema — Multi-Tenant
 * ─────────────────────────
 * role: 'Super_Admin' → full access to all cards
 * role: 'Restaurant_Owner' → access only to their own tenantId
 * tenantId → matches shortCode of their Card document
 */
const userSchema = new mongoose.Schema({
    name: {
        type:     String,
        required: true,
        trim:     true,
    },
    email: {
        type:     String,
        required: true,
        unique:   true,
        lowercase: true,
        trim:     true,
    },
    password: {
        type:     String,   // bcrypt hash
        required: true,
    },
    role: {
        type:    String,
        enum:    ['Super_Admin', 'Restaurant_Owner'],
        default: 'Restaurant_Owner',
    },
    // tenantId = shortCode of the card this owner manages
    tenantId: {
        type:    String,
        default: null,
        index:   true,
    },
    isActive: {
        type:    Boolean,
        default: true,
    },
}, { timestamps: true });

// Prevent duplicate model warning in serverless
module.exports = mongoose.models.User || mongoose.model('User', userSchema);