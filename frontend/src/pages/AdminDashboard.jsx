import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Upload, Settings, LogOut, 
  Bell, Moon, Search, Filter, Download, Plus,
  MoreVertical, RefreshCw, Grid, List,
  Users, Globe, FileText, Tag
} from 'lucide-react';
import api from '../api/axios.js';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { LeadFormModal } from '../components/LeadFormModal.jsx';
import { LeadViewModal } from '../components/LeadViewModal.jsx';
import { DropdownMenu, DropdownMenuItem } from '../components/ui/Dropdown.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import { Eye, Edit, Trash2 } from 'lucide-react';

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

export default function AdminDashboard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingLead, setViewingLead] = useState(null);
  const [selectedFields, setSelectedFields] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { showToast, ToastComponent } = useToast();

  // Load selectedFields from localStorage on mount
  useEffect(() => {
    const storedFields = localStorage.getItem('selectedFields');
    if (storedFields) {
      try {
        setSelectedFields(JSON.parse(storedFields));
      } catch (err) {
        console.error('Failed to parse selectedFields:', err);
      }
    }
  }, []);

  const username = localStorage.getItem('role') === 'admin' ? 'Admin User' : 'User';
  const currentDate = new Date().toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  async function load() {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/admin/users');
      setItems(data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreateLead(formData) {
    setSubmitting(true);
    setError('');
    try {
      await api.post('/admin/leads', formData);
      setShowAddModal(false);
      showToast('Lead created successfully!', 'success');
      await load(); // Reload leads
    } catch (err) {
      const errorMessage = err?.response?.data?.message || 'Failed to create lead';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  function handleViewLead(lead) {
    setViewingLead(lead);
  }

  async function handleEditLead(lead) {
    // TODO: Implement edit functionality
    showToast('Edit functionality coming soon', 'success');
  }

  async function handleDeleteLead(lead) {
    if (!window.confirm('Are you sure you want to delete this lead? This action cannot be undone.')) return;
    try {
      await api.delete(`/admin/users/${lead._id}`);
      showToast('Lead deleted successfully!', 'success');
      setViewingLead(null);
      await load();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to delete lead', 'error');
    }
  }

  function logout() {
    localStorage.clear();
    navigate('/login');
  }

  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.organization?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'website') return matchesSearch && item.source === 'website';
    if (activeTab === 'manual') return matchesSearch && item.source === 'manual';
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredItems.length / rowsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const stats = {
    totalLeads: items.length,
    websiteLeads: items.filter(i => i.source === 'website').length,
    manualLeads: items.filter(i => i.source === 'manual').length,
    todayLeads: items.filter(i => {
      const today = new Date();
      const itemDate = new Date(i.createdAt || i.time);
      return itemDate.toDateString() === today.toDateString();
    }).length
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-teal-600">Upfinzo</h2>
          <p className="text-xs text-gray-500 mt-1">FINTECH PRIVATE LIMITED</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg">
            <Upload size={20} />
            <span>Import Leads</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg">
            <Settings size={20} />
            <span>Settings</span>
          </button>
        </nav>

        <div className="p-4 border-t">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard - UzOLeads</h1>
            <p className="text-sm text-gray-500 mt-1">{currentDate}</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
              <Bell size={20} />
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
              <Moon size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">{username}</p>
                <p className="text-xs text-gray-500">Admin</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-300"></div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-auto">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Users className="text-teal-600" size={24} />
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-1">Total Leads</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalLeads.toLocaleString()}</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Globe className="text-green-600" size={24} />
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-1">Total Website Leads</p>
              <p className="text-3xl font-bold text-gray-800">{stats.websiteLeads.toLocaleString()}</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <FileText className="text-orange-600" size={24} />
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-1">Total Manual Leads</p>
              <p className="text-3xl font-bold text-gray-800">{stats.manualLeads.toLocaleString()}</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Tag className="text-red-600" size={24} />
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-1">Today's Leads</p>
              <p className="text-3xl font-bold text-gray-800">{stats.todayLeads.toLocaleString()}</p>
            </div>
          </div>

          {/* Leads Table Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    Last Refreshed: {new Date().toLocaleString('en-GB')}
                  </span>
                  <button className="p-1 text-gray-500 hover:text-gray-700">
                    <RefreshCw size={16} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-500 hover:bg-gray-100 rounded">
                    <Grid size={18} />
                  </button>
                  <button className="p-2 text-gray-500 hover:bg-gray-100 rounded">
                    <List size={18} />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-4 mb-4 border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`pb-3 px-1 font-medium text-sm ${
                    activeTab === 'all'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveTab('website')}
                  className={`pb-3 px-1 font-medium text-sm ${
                    activeTab === 'website'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Website Leads
                </button>
                <button
                  onClick={() => setActiveTab('manual')}
                  className={`pb-3 px-1 font-medium text-sm ${
                    activeTab === 'manual'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Manual Upload Leads
                </button>
              </div>

              {/* Actions Bar */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 max-w-md relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    type="text"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter size={16} />
                    Filter
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download size={16} />
                    Export
                  </Button>
                  <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
                    <Plus size={16} />
                    Add
                  </Button>
                </div>
              </div>
            </div>

            {/* Table */}
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={selectedFields.length + 3} className="px-6 py-8 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : paginatedItems.length === 0 ? (
                    <tr>
                      <td colSpan={selectedFields.length + 3} className="px-6 py-8 text-center text-gray-500">
                        No leads found
                      </td>
                    </tr>
                  ) : (
                    paginatedItems.map((item) => {
                      const getFieldValue = (field) => {
                        // Map field names to data fields
                        switch(field) {
                          case 'mobileNumber':
                            return item.phone || 'N/A';
                          case 'organisation':
                            return item.organization || 'N/A';
                          default:
                            return item[field] || 'N/A';
                        }
                      };

                      return (
                        <tr key={item._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <input type="checkbox" className="rounded" />
                          </td>
                          {selectedFields.length === 0 ? (
                            <>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded bg-teal-100 flex items-center justify-center">
                                    <Users size={16} className="text-teal-600" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-800">{item.name || 'N/A'}</p>
                                    <p className="text-xs text-gray-500">{item.email || 'N/A'}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">{item.organization || 'N/A'}</td>
                              <td className="px-6 py-4 text-sm text-gray-700">{item.phone || 'N/A'}</td>
                              <td className="px-6 py-4 text-sm text-gray-700">{item.pincode || 'N/A'}</td>
                              <td className="px-6 py-4 text-sm text-gray-700">{item.designation || 'N/A'}</td>
                            </>
                          ) : (
                            selectedFields.map((field) => (
                              <td key={field} className="px-6 py-4 text-sm text-gray-700">
                                {field === 'name' && item.email ? (
                                  <div>
                                    <p className="font-medium text-gray-800">{getFieldValue(field)}</p>
                                    <p className="text-xs text-gray-500">{item.email}</p>
                                  </div>
                                ) : (
                                  getFieldValue(field)
                                )}
                              </td>
                            ))
                          )}
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {item.time ? new Date(item.time).toLocaleString('en-GB') : item.createdAt ? new Date(item.createdAt).toLocaleString('en-GB') : 'N/A'}
                          </td>
                          <td className="px-6 py-4">
                            <DropdownMenu
                              trigger={
                                <button className="p-1 text-gray-500 hover:text-gray-700">
                                  <MoreVertical size={16} />
                                </button>
                              }
                            >
                              <DropdownMenuItem onClick={() => handleViewLead(item)}>
                                <div className="flex items-center gap-2">
                                  <Eye size={16} />
                                  <span>View</span>
                                </div>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditLead(item)}>
                                <div className="flex items-center gap-2">
                                  <Edit size={16} />
                                  <span>Edit</span>
                                </div>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteLead(item)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <div className="flex items-center gap-2">
                                  <Trash2 size={16} />
                                  <span>Delete</span>
                                </div>
                              </DropdownMenuItem>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-gray-200 flex items-center justify-between">
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
                  disabled={currentPage === totalPages}
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
                  onChange={(e) => setCurrentPage(Math.max(1, Math.min(totalPages, Number(e.target.value))))}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <Button variant="outline" className="px-3 py-1 text-sm">Go</Button>
              </div>
              <span className="text-sm text-gray-600">
                Showing {(currentPage - 1) * rowsPerPage + 1} - {Math.min(currentPage * rowsPerPage, filteredItems.length)} of {filteredItems.length}
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Lead Form Modal */}
      <LeadFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        selectedFields={selectedFields}
        onSubmit={handleCreateLead}
        loading={submitting}
      />

      {/* Lead View Modal - Full Page Style */}
      {viewingLead && (
        <LeadViewModal
          isOpen={!!viewingLead}
          onClose={() => setViewingLead(null)}
          lead={viewingLead}
          selectedFields={selectedFields}
          onEdit={handleEditLead}
          onDelete={handleDeleteLead}
        />
      )}

      {/* Toast Notification */}
      {ToastComponent}
    </div>
  );
}
