import { Schema } from 'mongoose';
import { getTenantConnection, getTenantModel } from '../config/tenantManager.js';

// Factory for a simple demo collection per tenant
function createUserSchema() {
  return new Schema(
    {
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      role: { type: String, enum: ['user', 'manager', 'admin'], default: 'user' }
    },
    { timestamps: true }
  );
}

// Factory for Lead schema based on selected fields
function createLeadSchema(selectedFields = []) {
  const schemaFields = {
    time: { type: Date, default: Date.now },
    source: { type: String, enum: ['website', 'manual'], default: 'manual' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  };

  // Add selected fields dynamically
  selectedFields.forEach(field => {
    switch(field) {
      case 'name':
        schemaFields.name = { type: String };
        break;
      case 'organisation':
        schemaFields.organization = { type: String };
        break;
      case 'email':
        schemaFields.email = { type: String };
        break;
      case 'inquiryType':
        schemaFields.inquiryType = { type: String };
        break;
      case 'designation':
        schemaFields.designation = { type: String };
        break;
      case 'mobileNumber':
        schemaFields.phone = { type: String };
        break;
      case 'comments':
        schemaFields.comments = { type: String };
        break;
      case 'address':
        schemaFields.address = { type: String };
        break;
      case 'pincode':
        schemaFields.pincode = { type: String };
        break;
      case 'purpose':
        schemaFields.purpose = { type: String };
        break;
      case 'type':
        schemaFields.type = { type: String };
        break;
    }
  });

  return new Schema(schemaFields, { timestamps: true });
}

export async function getTenantModels(dbName, selectedFields = []) {
  const connection = await getTenantConnection(dbName);
  const User = getTenantModel(connection, 'User', createUserSchema);
  
  // Create dynamic Lead model based on selectedFields
  // Always use 'Lead' as model name for consistency
  let Lead = connection.models.Lead;
  
  if (!Lead) {
    // Create new Lead model
    Lead = getTenantModel(connection, 'Lead', () => createLeadSchema(selectedFields));
  }
  
  return { connection, User, Lead };
}
