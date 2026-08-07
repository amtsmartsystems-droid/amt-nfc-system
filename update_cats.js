const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const SystemSettingsSchema = new mongoose.Schema({
    singleton: { type: String, default: 'amyt_system_settings', unique: true },
    categories: { type: Array, default: [] }
});

const SystemSettings = mongoose.models.SystemSettings || mongoose.model('SystemSettings', SystemSettingsSchema);

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const settings = await SystemSettings.findOne({ singleton: 'amyt_system_settings' });
        
        let cats = settings?.categories || [];
        
        // Add Doctor category if not exists
        if (!cats.find(c => c.id === 'medical_card')) {
            cats.push({
                id: 'medical_card',
                name: 'بطاقة طبيب',
                themes: [
                    { id: 'doctor', label: 'عيادة طبيب', icon: 'Stethoscope' }
                ]
            });
            console.log('Adding medical_card category...');
            await SystemSettings.findOneAndUpdate(
                { singleton: 'amyt_system_settings' },
                { $set: { categories: cats } },
                { new: true, upsert: true }
            );
            console.log('Successfully updated settings in DB.');
        } else {
            console.log('Category medical_card already exists.');
        }
    } catch(err) {
        console.error(err);
    }
    process.exit(0);
}

run();
