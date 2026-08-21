import { NextResponse } from 'next/server';
import connectDB from '../../../../backend/config/db';
import SystemSettings from '../../../../backend/models/SystemSettings';
import { getUser } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req) {
    try {
        await connectDB();
        
        // Find or create settings if they don't exist
        let settings = await SystemSettings.findOne({ singleton: 'amyt_system_settings' });
        
        if (!settings) {
            settings = await SystemSettings.create({ singleton: 'amyt_system_settings' });
        }
        
        let cats = settings.categories || [];
        
        const VIP_COOL_THEMES = [
            { id: 'marouf_coffee', label: 'VIP', icon: 'Star' },
            { id: 'rustic_cafe', label: 'cool', icon: 'Sparkles' }
        ];

        const COOL_VIP_THEMES = [
            { id: 'rustic_cafe', label: 'cool', icon: 'Sparkles' },
            { id: 'marouf_coffee', label: 'VIP', icon: 'Star' }
        ];

        const defaultCategories = [
            { id: 'restaurant', name: 'منيو مطعم', themes: VIP_COOL_THEMES },
            { id: 'business_card', name: 'بطاقة أعمال', themes: VIP_COOL_THEMES },
            { id: 'online_business', name: 'online business', themes: VIP_COOL_THEMES },
            { id: 'medical_card', name: 'بطاقة طبيب', themes: COOL_VIP_THEMES },
            { id: 'school_card', name: 'بطاقة مدارس AMT', themes: VIP_COOL_THEMES }
        ];

        // Enforce themes on existing categories
        cats.forEach(c => {
            if (c.id === 'medical_card') {
                c.themes = COOL_VIP_THEMES;
            } else {
                c.themes = VIP_COOL_THEMES;
            }
        });

        // Ensure all default categories exist, checking by ID or exact Name
        defaultCategories.forEach(dc => {
            const exists = cats.find(c => c.id === dc.id || c.name.trim().toLowerCase() === dc.name.trim().toLowerCase());
            if (!exists) {
                cats.push(dc);
            }
        });

        // Optional cleanup: if there are duplicate names, keep the first one
        const uniqueCats = [];
        const seenNames = new Set();
        cats.forEach(c => {
            const nameLower = c.name.trim().toLowerCase();
            if (!seenNames.has(nameLower)) {
                seenNames.add(nameLower);
                uniqueCats.push(c);
            }
        });
        cats = uniqueCats;

        // Always save to ensure structure is correct during this update
        await SystemSettings.findOneAndUpdate(
            { singleton: 'amyt_system_settings' },
            { $set: { categories: cats } }
        ).exec();

        return NextResponse.json({ success: true, categories: cats });
    } catch (error) {
        console.error('[GET /api/admin/settings]', error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        // Authenticate as Super_Admin
        const user = getUser(req);
        if (!user || user.role !== 'Super_Admin') {
            return NextResponse.json({ error: 'Unauthorized. Super_Admin only.' }, { status: 403 });
        }

        const body = await req.json();
        const { categories } = body;

        if (!categories || !Array.isArray(categories)) {
            return NextResponse.json({ error: 'Invalid payload. "categories" array is required.' }, { status: 400 });
        }

        await connectDB();
        
        const updatedSettings = await SystemSettings.findOneAndUpdate(
            { singleton: 'amyt_system_settings' },
            { $set: { categories } },
            { new: true, upsert: true }
        );

        return NextResponse.json({ success: true, categories: updatedSettings.categories });

    } catch (error) {
        console.error('[PUT /api/admin/settings]', error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
