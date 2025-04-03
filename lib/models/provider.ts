import mongoose, { Schema, Document, Model } from "mongoose";

// Define the provider interface
interface IProvider extends Document {
  userId: mongoose.Types.ObjectId; // Add userId field
  name: string;
  organization: string;
  aadhaar: string;
  contact: string;
  address: string;
  gstNumber: string;
  aadhaarFile?: string;
  panCardFile?: string;
  theatreLicenseFile?: string;
  gstFile?: string;
}

interface IProviderModel extends Model<IProvider> {
  verifyAadhaar(aadhaar: string): Promise<IProvider>;
}

// Define the provider schema
const ProviderSchema = new Schema<IProvider, IProviderModel>({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    unique: true,
    default: () => new mongoose.Types.ObjectId(), // Auto-generate
  },
  name: { type: String, required: true },
  organization: { type: String, required: true },
  aadhaar: { 
    type: String, 
    required: true, 
    unique: true,
    index: true,
    validate: {
      validator: (v: string) => /^\d{12}$/.test(v),
      message: 'Aadhaar must be 12 digits'
    }
  },
  contact: { 
    type: String, 
    required: true,
    validate: {
      validator: (v: string) => /^[6-9]\d{9}$/.test(v),
      message: 'Invalid Indian phone number'
    }
  },
  address: { type: String, required: true },
  gstNumber: { 
    type: String, 
    required: true,
    validate: {
      validator: (v: string) => /^[0-9A-Za-z]{15}$/.test(v),
      message: 'Invalid GST number'
    }
  },
  aadhaarFile: { type: String },
  panCardFile: { type: String }, 
  theatreLicenseFile: { type: String },
  gstFile: { type: String },
});

// Add pre-save validation for uniqueness
ProviderSchema.pre('save', async function(next) {
  if (this.isModified('aadhaar')) {
    const existing = await Provider.findOne({ aadhaar: this.aadhaar });
    if (existing) next(new Error('Aadhaar already registered'));
  }
  next();
});

// Static method to verify Aadhaar
ProviderSchema.statics.verifyAadhaar = async function(aadhaar: string) {
  const provider = await this.findOne({ aadhaar });
  if (!provider) throw new Error("Aadhaar not found");
  return provider;
};

const Provider = mongoose.models.Provider || 
                mongoose.model<IProvider, IProviderModel>("Provider", ProviderSchema);

export default Provider;
