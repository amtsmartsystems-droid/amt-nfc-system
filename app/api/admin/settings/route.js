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

        return NextResponse.json({ success: true, categories: settings.categories });
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
