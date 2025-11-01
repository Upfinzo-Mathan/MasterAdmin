import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/Card.jsx';
import { Progress } from './ui/Progress.jsx';
import { Stepper } from './ui/Stepper.jsx';
import { Input } from './ui/Input.jsx';
import { Textarea } from './ui/Textarea.jsx';
import { Label } from './ui/Label.jsx';
import { Checkbox } from './ui/Checkbox.jsx';
import { Button } from './ui/Button.jsx';
import { X } from 'lucide-react';

const FIELD_OPTIONS = [
  { id: 'name', label: 'Name' },
  { id: 'organisation', label: 'Organisation' },
  { id: 'email', label: 'Email' },
  { id: 'inquiryType', label: 'Inquiry Type' },
  { id: 'designation', label: 'Designation' },
  { id: 'mobileNumber', label: 'Mobile Number' },
  { id: 'comments', label: 'Comments' },
  { id: 'address', label: 'Address' },
  { id: 'pincode', label: 'Pincode' },
  { id: 'purpose', label: 'Purpose' },
  { id: 'type', label: 'Type' },
];

const STEPS = [
  { id: 1, label: 'Company Profile' },
  { id: 2, label: 'Field Selection' },
  { id: 3, label: 'Admin Credentials' },
];

export function AdminCreationWizard({ onClose, onSubmit, loading }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Company Profile
    companyName: '',
    companyLogo: '',
    companyDetails: '',
    // Step 2: Selected Fields
    selectedFields: [],
    // Step 3: Admin Credentials
    username: '',
    password: '',
    email: '',
  });

  const progress = (currentStep / STEPS.length) * 100;

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All progress will be lost.')) {
      onClose();
    }
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.companyName.trim()) {
          alert('Please enter a company name');
          return false;
        }
        return true;
      case 2:
        if (formData.selectedFields.length === 0) {
          alert('Please select at least one field');
          return false;
        }
        return true;
      case 3:
        if (!formData.username.trim()) {
          alert('Please enter a username');
          return false;
        }
        if (!formData.password || formData.password.length < 8) {
          alert('Password must be at least 8 characters');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    const submissionData = {
      company: {
        name: formData.companyName,
        logo: formData.companyLogo,
        details: formData.companyDetails,
      },
      selectedFields: formData.selectedFields,
      credentials: {
        username: formData.username,
        password: formData.password,
        email: formData.email,
      },
    };

    console.log('Admin Creation Data:', submissionData);
    await onSubmit(submissionData);
  };

  const toggleField = (fieldId) => {
    setFormData((prev) => ({
      ...prev,
      selectedFields: prev.selectedFields.includes(fieldId)
        ? prev.selectedFields.filter((id) => id !== fieldId)
        : [...prev.selectedFields, fieldId],
    }));
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="relative">
          <button
            onClick={handleCancel}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
          <CardTitle>Admin Creation Wizard</CardTitle>
          <CardDescription>
            Follow the steps below to create a new admin account
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Progress Bar */}
          <div className="mb-8">
            <Progress value={progress} className="mb-4" />
            <Stepper steps={STEPS} currentStep={currentStep} />
          </div>

          {/* Step Content */}
          <div className="min-h-[400px]">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="companyName">
                    Company Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="companyName"
                    type="text"
                    placeholder="Enter company name"
                    value={formData.companyName}
                    onChange={(e) => updateField('companyName', e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="companyLogo">Company Logo (Image URL)</Label>
                  <Input
                    id="companyLogo"
                    type="url"
                    placeholder="https://example.com/logo.png"
                    value={formData.companyLogo}
                    onChange={(e) => updateField('companyLogo', e.target.value)}
                    className="mt-2"
                  />
                  {formData.companyLogo && (
                    <div className="mt-2">
                      <img
                        src={formData.companyLogo}
                        alt="Company Logo"
                        className="h-20 w-20 object-contain border rounded"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="companyDetails">Basic Company Details</Label>
                  <Textarea
                    id="companyDetails"
                    placeholder="Enter company details..."
                    value={formData.companyDetails}
                    onChange={(e) => updateField('companyDetails', e.target.value)}
                    className="mt-2"
                    rows={4}
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <Label>Select which input fields should be shown in the form</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {FIELD_OPTIONS.map((field) => (
                    <Checkbox
                      key={field.id}
                      label={field.label}
                      checked={formData.selectedFields.includes(field.id)}
                      onChange={() => toggleField(field.id)}
                    />
                  ))}
                </div>
                {formData.selectedFields.length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Selected Fields ({formData.selectedFields.length}):</strong>{' '}
                      {formData.selectedFields
                        .map(
                          (id) => FIELD_OPTIONS.find((f) => f.id === id)?.label
                        )
                        .join(', ')}
                    </p>
                  </div>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="username">
                    Username <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    value={formData.username}
                    onChange={(e) => updateField('username', e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="password">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Min. 8 characters"
                    value={formData.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    className="mt-2"
                    minLength={8}
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <div>
            {currentStep > 1 && (
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            {currentStep < STEPS.length ? (
              <Button onClick={handleNext}>Next</Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? 'Creating...' : 'Submit'}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

