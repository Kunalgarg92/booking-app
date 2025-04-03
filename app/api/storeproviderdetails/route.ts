import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import Provider from '@/lib/models/provider';
import mongoose from 'mongoose';

// Database connection
const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(process.env.MONGODB_URI!);
};

export const config = {
  api: {
    bodyParser: false,
  },
};

const cleanupLegacyData = async () => {
  // Ensure connection exists
  if (!mongoose.connection.db) {
    throw new Error('Database connection not established');
  }
  
  // Use optional chaining and null coalescing
  const collection = mongoose.connection.db.collection('providers');
  await collection.updateMany(
    { userId: { $exists: false } },
    { $set: { userId: new mongoose.Types.ObjectId() } }
  );
};

export async function POST(request: Request) {
  try {
    await connectDB();
    await cleanupLegacyData();
    const userId = new mongoose.Types.ObjectId();
    // Get form data using native Next.js parsing
    const formData = await request.formData();
    const entries = Object.fromEntries(formData.entries());

    // Process files first
    const files = Array.from(formData.getAll('file')).filter(f => f instanceof File);
    const uploadDir = path.join(process.cwd(), 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    // Save files and get paths
    const filePaths = await Promise.all(
      files.map(async (file) => {
        const buffer = await (file as File).arrayBuffer();
        const filename = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;
        const filepath = path.join(uploadDir, filename);
        await fs.writeFile(filepath, Buffer.from(buffer));
        return filepath;
      })
    );

    const requiredFields = ['name', 'organization', 'aadhaar', 'contact', 'address', 'gstNumber'];
    const missingFields = requiredFields.filter(field => !entries[field]);
    if (missingFields.length) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const provider = new Provider({
      // Add this line to explicitly generate user ID
      userId: new mongoose.Types.ObjectId(),
      name: entries.name.toString(),
      organization: entries.organization.toString(),
      aadhaar: entries.aadhaar.toString(),
      contact: entries.contact.toString(),
      address: entries.address.toString(),
      gstNumber: entries.gstNumber.toString(),
      aadhaarFile: filePaths[0],
      panCardFile: filePaths[1],
      theatreLicenseFile: filePaths[2],
      gstFile: filePaths[3],
    });

    const savedProvider = await provider.save();

    return NextResponse.json(
      { 
        message: 'Provider created successfully', 
        data: {
          id: savedProvider._id,
          aadhaar: savedProvider.aadhaar,
          organization: savedProvider.organization
        }
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error:', error);
    
    if (error.code === 11000) {
      const conflictField = Object.keys(error.keyPattern)[0];
      const errorMessage = conflictField === 'aadhaar' 
        ? 'Aadhaar number already exists' 
        : conflictField === 'userId'
        ? 'System error: User ID conflict' 
        : 'Duplicate entry detected';
      return NextResponse.json(
        { error: errorMessage },
        { status: 409 }
      );
    }
    
    

    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
