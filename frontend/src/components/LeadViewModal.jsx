import { X, ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card.jsx';
import { Button } from './ui/Button.jsx';
import { DropdownMenu, DropdownMenuItem } from './ui/Dropdown.jsx';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';

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

export function LeadViewModal({ isOpen, onClose, lead, selectedFields, onEdit, onDelete }) {
  if (!isOpen || !lead) return null;

  const getFieldValue = (field) => {
    switch(field) {
      case 'mobileNumber':
        return lead.phone || 'N/A';
      case 'organisation':
        return lead.organization || 'N/A';
      default:
        return lead[field] || 'N/A';
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto">
      {/* Header */}
      <header className="bg-white shadow-sm p-6 border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Lead Details - {lead.name || 'N/A'}</h1>
              <p className="text-sm text-gray-500 mt-1">
                Created: {lead.createdAt ? new Date(lead.createdAt).toLocaleString('en-GB') : 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {onEdit && (
              <Button onClick={() => onEdit(lead)} className="flex items-center gap-2">
                Edit
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Content Area - Dashboard Style */}
      <main className="p-6">
        {/* Lead Information Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Lead Information</h2>
              <DropdownMenu
                trigger={
                  <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreVertical size={16} />
                  </button>
                }
              >
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(lead)}>
                    <div className="flex items-center gap-2">
                      <Edit size={16} />
                      <span>Edit</span>
                    </div>
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem 
                    onClick={() => onDelete(lead)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <div className="flex items-center gap-2">
                      <Trash2 size={16} />
                      <span>Delete</span>
                    </div>
                  </DropdownMenuItem>
                )}
              </DropdownMenu>
            </div>
          </div>

          <div className="p-6">
            {selectedFields.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Name</p>
                  <p className="text-base font-semibold text-gray-800">{lead.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="text-base text-gray-700">{lead.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Organization</p>
                  <p className="text-base text-gray-700">{lead.organization || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Phone</p>
                  <p className="text-base text-gray-700">{lead.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Pincode</p>
                  <p className="text-base text-gray-700">{lead.pincode || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Designation</p>
                  <p className="text-base text-gray-700">{lead.designation || 'N/A'}</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedFields.map((field) => (
                  <div key={field}>
                    <p className="text-sm text-gray-500 mb-1">{FIELD_LABELS[field] || field}</p>
                    <p className="text-base text-gray-700 break-words">
                      {field === 'comments' || field === 'address' ? (
                        <span className="whitespace-pre-wrap">{getFieldValue(field)}</span>
                      ) : (
                        getFieldValue(field)
                      )}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Table View - Same as Dashboard */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Lead Data Table View</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    <input type="checkbox" className="rounded" />
                  </th>
                  {selectedFields.length === 0 ? (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name and Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organization</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pincode</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Designation</th>
                    </>
                  ) : (
                    selectedFields.map((field) => (
                      <th key={field} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {FIELD_LABELS[field] || field}
                      </th>
                    ))
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input type="checkbox" className="rounded" />
                  </td>
                  {selectedFields.length === 0 ? (
                    <>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded bg-teal-100 flex items-center justify-center">
                            <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{lead.name || 'N/A'}</p>
                            <p className="text-xs text-gray-500">{lead.email || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{lead.organization || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{lead.phone || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{lead.pincode || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{lead.designation || 'N/A'}</td>
                    </>
                  ) : (
                    selectedFields.map((field) => (
                      <td key={field} className="px-6 py-4 text-sm text-gray-700">
                        {field === 'name' && lead.email ? (
                          <div>
                            <p className="font-medium text-gray-800">{getFieldValue(field)}</p>
                            <p className="text-xs text-gray-500">{lead.email}</p>
                          </div>
                        ) : (
                          <span className="whitespace-pre-wrap">{getFieldValue(field)}</span>
                        )}
                      </td>
                    ))
                  )}
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {lead.time ? new Date(lead.time).toLocaleString('en-GB') : lead.createdAt ? new Date(lead.createdAt).toLocaleString('en-GB') : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      lead.source === 'website' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {lead.source === 'website' ? 'Website' : 'Manual'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-1 text-gray-500 hover:text-gray-700">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}


