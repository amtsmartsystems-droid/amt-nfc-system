import { NextResponse } from 'next/server';
import connectDB from '../../../../backend/config/db';
import User from '../../../../backend/models/User';
import bcrypt from 'bcryptjs';
import { isSuperAdmin } from '../../../../lib/auth';

export async function POST(req) {
    if (!isSuperAdmin(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        await connectDB();
        const { name, email, password, tenantId } = await req.json();

        if (!name || !email || !password || !tenantId) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: 'Restaurant_Owner',
            tenantId
        });

        await newUser.save();
        return NextResponse.json({ success: true, message: 'Account created successfully' });

    } catch (error) {
        console.error('Register Error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
