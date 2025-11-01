import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/Card.jsx';
import { Input } from './ui/Input.jsx';
import { Textarea } from './ui/Textarea.jsx';
import { Label } from './ui/Label.jsx';
import { Button } from './ui/Button.jsx';

const FIELD_LABELS = {
  name: 'Name',
  organisation: 'Organisation',
  email: 'Email',
  inquiryType: 'Inquiry Type',
  designation: 'Designation',
  mobileNumber: 'Mobile Number',
  comments: 'Comments',
  address: 'Address',
  pincode: 'Pincode',
  purpose: 'Purpose',
  type: 'Type',
};

export function LeadFormModal({ isOpen, onClose, selectedFields, onSubmit, loading }) {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      // Initialize form data based on selected fields
      const initialData = {};
      selectedFields.forEach(field => {
        initialData[field] = '';
      });
      setFormData(initialData);
      setErrors({});
    }
  }, [isOpen, selectedFields]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    selectedFields.forEach(field => {
      // Basic validation - you can customize this
      if (field === 'email' && formData[field]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData[field])) {
          newErrors[field] = 'Please enter a valid email address';
        }
      }
      if (field === 'mobileNumber' && formData[field]) {
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(formData[field].replace(/\D/g, ''))) {
          newErrors[field] = 'Please enter a valid mobile number';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Map field names to backend format
    const submitData = {
      ...formData,
      source: 'manual',
      time: new Date(),
    };

    // Map frontend field names to backend schema names
    if (submitData.organisation) {
      submitData.organization = submitData.organisation;
      delete submitData.organisation;
    }
    if (submitData.mobileNumber) {
      submitData.phone = submitData.mobileNumber;
      delete submitData.mobileNumber;
    }

    onSubmit(submitData);
  };

  if (!isOpen) return null;

  const getFieldType = (field) => {
    if (field === 'email') return 'email';
    if (field === 'mobileNumber') return 'tel';
    if (field === 'pincode') return 'text';
    if (field === 'comments') return 'textarea';
    return 'text';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="relative">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
          <CardTitle>Add New Lead</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {selectedFields.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No fields selected. Please contact SuperAdmin to configure fields.
              </p>
            ) : (
              selectedFields.map((field) => {
                const fieldLabel = FIELD_LABELS[field] || field;
                const fieldType = getFieldType(field);
                const isRequired = ['name', 'email'].includes(field);

                return (
                  <div key={field}>
                    <Label htmlFor={field}>
                      {fieldLabel}
                      {isRequired && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {fieldType === 'textarea' ? (
                      <Textarea
                        id={field}
                        placeholder={`Enter ${fieldLabel.toLowerCase()}`}
                        value={formData[field] || ''}
                        onChange={(e) => handleChange(field, e.target.value)}
                        className="mt-2"
                        rows={3}
                      />
                    ) : (
                      <Input
                        id={field}
                        type={fieldType}
                        placeholder={`Enter ${fieldLabel.toLowerCase()}`}
                        value={formData[field] || ''}
                        onChange={(e) => handleChange(field, e.target.value)}
                        className="mt-2"
                        required={isRequired}
                      />
                    )}
                    {errors[field] && (
                      <p className="text-red-500 text-xs mt-1">{errors[field]}</p>
                    )}
                  </div>
                );
              })
            )}
          </form>
        </CardContent>

        <CardFooter className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          {selectedFields.length > 0 && (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

