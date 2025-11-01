import { useState, useEffect } from 'react';
import { ArrowLeft, User, Database, CheckCircle, XCircle, X, MoreVertical, Edit, Trash2, Search, Download, Upload, RefreshCw, Filter } from 'lucide-react';
import { Button } from './ui/Button.jsx';
import { Input } from './ui/Input.jsx';
import { DropdownMenu, DropdownMenuItem } from './ui/Dropdown.jsx';
import { useToast } from './ui/Toast.jsx';
import api from '../api/axios.js';

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

export function AdminViewModal({ isOpen, onClose, admin, onEdit, onDelete }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [showImportModal, setShowImportModal] = useState(false);
  const { showToast, ToastComponent } = useToast();

  if (!isOpen || !admin) return null;

  // Fetch leads/users for this admin
  useEffect(() => {
    if (isOpen && admin?._id) {
      loadLeads();
    }
  }, [isOpen, admin?._id]);

  async function loadLeads() {
    if (!admin?._id) return;
    
    setLoading(true);
    try {
      const { data } = await api.get(`/superadmin/admins/${admin._id}/users`);
      console.log('Loaded leads:', data);
      setLeads(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load leads:', err);
      setLeads([]);
      if (err?.response?.status === 404) {
        // Admin not found or no users endpoint - show empty state silently
        console.log('No leads found for this admin');
      } else {
        showToast(err?.response?.data?.message || 'Failed to load leads', 'error');
      }
    } finally {
      setLoading(false);
    }
  }

  const filteredLeads = leads.filter(lead => {
    const search = searchTerm.toLowerCase();
    return (
      lead.name?.toLowerCase().includes(search) ||
      lead.email?.toLowerCase().includes(search) ||
      lead.organization?.toLowerCase().includes(search) ||
      lead.phone?.toLowerCase().includes(search)
    );
  });

  function handleExport() {
    if (filteredLeads.length === 0) {
      showToast('No data to export', 'error');
      return;
    }

    // Get headers based on selected fields or default
    const headers = admin.selectedFields && admin.selectedFields.length > 0
      ? admin.selectedFields.map(f => FIELD_LABELS[f] || f)
      : ['Name', 'Email', 'Organization', 'Phone', 'Pincode', 'Designation'];

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...filteredLeads.map(item => {
        const row = admin.selectedFields && admin.selectedFields.length > 0
          ? admin.selectedFields.map(field => {
              let value = item[field] || '';
              if (field === 'mobileNumber') value = item.phone || '';
              if (field === 'organisation') value = item.organization || '';
              // Escape quotes and wrap in quotes if contains comma
              return `"${String(value).replace(/"/g, '""')}"`;
            })
          : [
              `"${(item.name || '').replace(/"/g, '""')}"`,
              `"${(item.email || '').replace(/"/g, '""')}"`,
              `"${(item.organization || '').replace(/"/g, '""')}"`,
              `"${(item.phone || '').replace(/"/g, '""')}"`,
              `"${(item.pincode || '').replace(/"/g, '""')}"`,
              `"${(item.designation || '').replace(/"/g, '""')}"`,
            ];
        return row.join(',');
      }),
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${admin.username || 'admin'}_leads_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Data exported successfully!', 'success');
  }

  function handleImportClick() {
    setShowImportModal(true);
  }

  function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      showToast('Please upload a CSV file', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        
        const csvData = lines.slice(1).map(line => {
          const values = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];
          const row = {};
          headers.forEach((header, index) => {
            let value = values[index]?.replace(/^"|"$/g, '') || '';
            // Map header to field name
            const fieldKey = Object.keys(FIELD_LABELS).find(
              key => FIELD_LABELS[key] === header
            ) || header.toLowerCase();
            row[fieldKey] = value;
          });
          return row;
        });

        // Send to backend
        await api.post(`/superadmin/admins/${admin._id}/users/import`, { data: csvData });
        showToast('CSV imported successfully!', 'success');
        setShowImportModal(false);
        await loadLeads();
      } catch (err) {
        showToast(err?.response?.data?.message || 'Failed to import CSV', 'error');
      }
    };
    reader.readAsText(file);
  }

  const totalPages = Math.ceil(filteredLeads.length / rowsPerPage);
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const getFieldValue = (lead, field) => {
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
              <h1 className="text-2xl font-bold text-gray-800">Admin Details - {admin.username || 'N/A'}</h1>
              <p className="text-sm text-gray-500 mt-1">
                Created: {admin.createdAt ? new Date(admin.createdAt).toLocaleString('en-GB') : 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {onEdit && (
              <Button onClick={() => onEdit(admin)} className="flex items-center gap-2">
                Edit
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Content Area - Dashboard Style */}
      <main className="p-6">
        {/* Admin Information Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Admin Information</h2>
              <DropdownMenu
                trigger={
                  <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreVertical size={16} />
                  </button>
                }
              >
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(admin)}>
                    <div className="flex items-center gap-2">
                      <Edit size={16} />
                      <span>Edit</span>
                    </div>
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem 
                    onClick={() => onDelete(admin._id)}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Company Information */}
              {admin.company && admin.company.name && (
                <>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Company Name</p>
                    <p className="text-base font-semibold text-gray-800">{admin.company.name}</p>
                  </div>
                {admin.company.logo && (
                  <div>
                      <p className="text-sm text-gray-500 mb-1">Company Logo</p>
                    <img
                      src={admin.company.logo}
                      alt={admin.company.name || 'Company Logo'}
                        className="h-16 w-16 object-contain border rounded-lg bg-white p-2"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                </>
              )}

              {/* Admin Credentials */}
              <div>
                <p className="text-sm text-gray-500 mb-1">Username</p>
                <p className="text-base font-semibold text-gray-800">{admin.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <p className="text-base text-gray-700">{admin.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                  admin.isActive !== false
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {admin.isActive !== false ? (
                    <>
                      <CheckCircle size={14} />
                      Active
                    </>
                  ) : (
                    <>
                      <XCircle size={14} />
                      Inactive
                    </>
                  )}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Database Name</p>
                <p className="text-base font-mono text-gray-700">{admin.dbName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Created At</p>
                <p className="text-base text-gray-700">
                  {admin.createdAt ? new Date(admin.createdAt).toLocaleString('en-GB') : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Last Updated</p>
                <p className="text-base text-gray-700">
                  {admin.updatedAt ? new Date(admin.updatedAt).toLocaleString('en-GB') : 'N/A'}
                </p>
              </div>
              {admin.company && admin.company.details && (
                <div className="md:col-span-3">
                  <p className="text-sm text-gray-500 mb-1">Company Details</p>
                  <p className="text-base text-gray-700 whitespace-pre-wrap">{admin.company.details}</p>
            </div>
              )}
          </div>

          {/* Selected Fields Section */}
          {admin.selectedFields && admin.selectedFields.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Database size={20} className="text-gray-600" />
                <h3 className="text-lg font-bold text-gray-800">Selected Form Fields</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {admin.selectedFields.map((field) => (
                  <span
                    key={field}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {FIELD_LABELS[field] || field}
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-3">
                Total Selected Fields: <strong>{admin.selectedFields.length}</strong>
              </p>
            </div>
          )}

          {/* No Fields Selected Message */}
          {(!admin.selectedFields || admin.selectedFields.length === 0) && (
              <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> No fields have been selected for this admin. The default fields will be used.
              </p>
            </div>
              </div>
            )}
          </div>
        </div>

        {/* Leads/Users Table View */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-gray-800">Leads/Users Data</h2>
                <span className="text-sm text-gray-500">
                  Total: {filteredLeads.length} {filteredLeads.length === 1 ? 'lead' : 'leads'}
                </span>
                {loading && (
                  <span className="text-sm text-blue-500">Loading...</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={loadLeads}
                  className="flex items-center gap-2"
                >
                  <RefreshCw size={16} />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Search and Actions Bar */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 max-w-md relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="text"
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Filter size={16} />
                  Filter
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExport}
                  className="flex items-center gap-2"
                >
                  <Download size={16} />
                  Export
                </Button>
                <Button
                  onClick={handleImportClick}
                  className="flex items-center gap-2"
                >
                  <Upload size={16} />
                  Import CSV
                </Button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    <input type="checkbox" className="rounded" />
                  </th>
                  {admin.selectedFields && admin.selectedFields.length > 0 ? (
                    admin.selectedFields.map((field) => (
                      <th key={field} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {FIELD_LABELS[field] || field}
                      </th>
                    ))
                  ) : (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name and Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organization</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pincode</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Designation</th>
                    </>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={(admin.selectedFields?.length || 5) + 3} className="px-6 py-8 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : paginatedLeads.length === 0 ? (
                  <tr>
                    <td colSpan={(admin.selectedFields?.length || 5) + 3} className="px-6 py-8 text-center text-gray-500">
                      No leads found
                    </td>
                  </tr>
                ) : (
                  paginatedLeads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input type="checkbox" className="rounded" />
                      </td>
                      {admin.selectedFields && admin.selectedFields.length > 0 ? (
                        admin.selectedFields.map((field) => (
                          <td key={field} className="px-6 py-4 text-sm text-gray-700">
                            {field === 'name' && lead.email ? (
                              <div>
                                <p className="font-medium text-gray-800">{getFieldValue(lead, field)}</p>
                                <p className="text-xs text-gray-500">{lead.email}</p>
                              </div>
                            ) : (
                              getFieldValue(lead, field)
                            )}
                          </td>
                        ))
                      ) : (
                        <>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded bg-teal-100 flex items-center justify-center">
                                <User size={16} className="text-teal-600" />
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
                      )}
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {lead.time ? new Date(lead.time).toLocaleString('en-GB') : lead.createdAt ? new Date(lead.createdAt).toLocaleString('en-GB') : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <button className="p-1 text-gray-500 hover:text-gray-700">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-gray-200 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Rows per Page</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value={8}>8</option>
                <option value={16}>16</option>
                <option value={32}>32</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm"
              >
                Prev
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    onClick={() => setCurrentPage(page)}
                    className="px-3 py-1 text-sm min-w-[32px]"
                  >
                    {page}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 py-1 text-sm"
              >
                Next
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Go to Page</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={currentPage}
                onChange={(e) => setCurrentPage(Math.max(1, Math.min(totalPages || 1, Number(e.target.value))))}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
            <span className="text-sm text-gray-600">
              Showing {(currentPage - 1) * rowsPerPage + 1} - {Math.min(currentPage * rowsPerPage, filteredLeads.length)} of {filteredLeads.length}
            </span>
          </div>
        </div>
      </main>

      {/* Import CSV Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Import CSV Data</h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Upload a CSV file to import leads/users for this admin.
              </p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto mb-4 text-gray-400" size={32} />
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button variant="outline" className="flex items-center gap-2 mx-auto">
                    <Upload size={16} />
                    Choose CSV File
                  </Button>
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  Accepted format: CSV files only
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowImportModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {ToastComponent}
    </div>
  );
}


