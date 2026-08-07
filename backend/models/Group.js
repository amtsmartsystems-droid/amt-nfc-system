const mongoose = require('mongoose');

/**
 * Group (Partner Room)
 * ────────────────────
 * Each Group represents a "room" assigned to a partner.
 * The partner can access and edit only the cards in assignedCards[].
 */
const groupSchema = new mongoose.Schema({
    name: {
        type:     String,
        required: true,
        trim:     true,
    },
    // PIN for partner login (bcrypt hash stored here)
    partnerPin: {
        type:     String,
        required: true,
    },
    // Optional: plain-text PIN hint shown in superadmin UI (store length only in prod)
    pinLength: {
        type:    Number,
        default: 4,
    },
    // Cards assigned to this group (shortCodes)
    assignedCards: {
        type:    [String],
        default: [],
    },
    // Subgroups/Folders to organize cards
    subgroups: {
        type: [{
            id: { type: String, required: true },
            name: { type: String, required: true },
            cards: { type: [String], default: [] }
        }],
        default: []
    },
    // Optional description / notes for the superadmin
    notes: {
        type:    String,
        default: '',
    },
    isActive: {
        type:    Boolean,
        default: true,
    },
    // Which superadmin created this group
    createdBy: {
        type:    String,
        default: 'admin',
    },
}, { timestamps: true });

delete mongoose.models.Group;
module.exports = mongoose.model('Group', groupSchema);
