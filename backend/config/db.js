// استدعاء مكتبة mongoose للتعامل مع MongoDB
const mongoose = require('mongoose');

// التخزين المؤقت لاتصال قاعدة البيانات في بيئة Serverless
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

// دالة للاتصال بقاعدة البيانات
const connectDB = async () => {
    if (cached.conn) {
        console.log('Using cached MongoDB connection');
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(process.env.MONGO_URI, opts).then((mongoose) => {
            console.log(`MongoDB Connected: ${mongoose.connection.host}`);
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        cached.promise = null;
        console.error(`Error connecting to MongoDB: ${error.message}`);
        throw new Error(`Error connecting to MongoDB: ${error.message}`);
    }

    return cached.conn;
};

module.exports = connectDB;