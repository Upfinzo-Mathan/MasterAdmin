import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Upload, Settings, LogOut, 
  Bell, Moon, Plus, Trash2, Search, RefreshCw,
  MoreVertical, Eye, Edit, Ban, CheckCircle
} from 'lucide-react';
import api from '../api/axios.js';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { AdminCreationWizard } from '../components/AdminCreationWizard.jsx';
import { AdminViewModal } from '../components/AdminViewModal.jsx';
import { DropdownMenu, DropdownMenuItem } from '../components/ui/Dropdown.jsx';
import { useToast } from '../components/ui/Toast.jsx';

export default function SuperAdminDashboard() {
  const [admins, setAdmins] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [viewingAdmin, setViewingAdmin] = useState(null);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const navigate = useNavigate();
  const { showToast, ToastComponent } = useToast();

  const username = localStorage.getItem('role') === 'superadmin' ? 'SuperAdmin' : 'Admin';
  const currentDate = new Date().toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  async function loadAdmins() {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/superadmin/admins');
      setAdmins(data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load admins');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdmins();
  }, []);

  async function handleCreateAdmin(formData) {
    setCreatingAdmin(true);
    setError('');
    try {
      await api.post('/superadmin/create-admin', {
        username: formData.credentials.username,
        password: formData.credentials.password,
        email: formData.credentials.email,
        company: formData.company,
        selectedFields: formData.selectedFields,
      });
      setShowModal(false);
      showToast('Admin created successfully!', 'success');
      await loadAdmins();
    } catch (err) {
      const errorMessage = err?.response?.data?.message || 'Failed to create admin';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setCreatingAdmin(false);
    }
  }

  async function onView(admin) {
    try {
      const { data } = await api.get(`/superadmin/admins/${admin._id}`);
      setViewingAdmin(data);
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to load admin details', 'error');
    }
  }

  async function onToggleStatus(admin) {
    try {
      await api.patch(`/superadmin/admins/${admin._id}/toggle-status`);
      showToast(`Admin ${admin.isActive ? 'deactivated' : 'activated'} successfully!`, 'success');
      await loadAdmins();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to update status', 'error');
    }
  }

  async function onEdit(admin) {
    // TODO: Implement edit functionality
    setEditingAdmin(admin);
    showToast('Edit functionality coming soon', 'success');
  }

  async function onDelete(id) {
    if (!window.confirm('Are you sure you want to delete this admin? This action cannot be undone.')) return;
    try {
      await api.delete(`/superadmin/admins/${id}`);
      showToast('Admin deleted successfully!', 'success');
      setViewingAdmin(null);
      await loadAdmins();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Delete failed', 'error');
    }
  }

  function logout() {
    localStorage.clear();
    navigate('/login');
  }

  const filteredAdmins = admins.filter(admin =>
    admin.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.dbName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <h1 className="text-2xl font-bold text-gray-800">SuperAdmin Dashboard - UzOLeads</h1>
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
                <p className="text-xs text-gray-500">SuperAdmin</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-300"></div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-auto">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Total Admins</p>
              <p className="text-3xl font-bold text-gray-800">{admins.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Active Admins</p>
              <p className="text-3xl font-bold text-gray-800">
                {admins.filter(a => a.isActive !== false).length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Total Databases</p>
              <p className="text-3xl font-bold text-gray-800">{admins.length}</p>
            </div>
          </div>

          {/* Admins Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Admin Management</h2>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      type="text"
                      placeholder="Search admins..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
                    <Plus size={16} />
                    Create Admin
                  </Button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Database Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : filteredAdmins.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No admins found
                      </td>
                    </tr>
                  ) : (
                    filteredAdmins.map((admin) => (
                      <tr key={admin._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-800">{admin.username}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{admin.email || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 font-mono">{admin.dbName}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            admin.isActive !== false 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {admin.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <DropdownMenu
                            trigger={
                              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                                <MoreVertical size={16} />
                              </button>
                            }
                          >
                            {localStorage.getItem('role') === 'superadmin' && (
                              <DropdownMenuItem onClick={() => onView(admin)}>
                                <div className="flex items-center gap-2">
                                  <Eye size={16} />
                                  <span>View</span>
                                </div>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => onEdit(admin)}>
                              <div className="flex items-center gap-2">
                                <Edit size={16} />
                                <span>Edit</span>
                              </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => onToggleStatus(admin)}
                              className={admin.isActive !== false ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50' : 'text-green-600 hover:text-green-700 hover:bg-green-50'}
                            >
                              <div className="flex items-center gap-2">
                                {admin.isActive !== false ? (
                                  <>
                                    <Ban size={16} />
                                    <span>Inactive</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle size={16} />
                                    <span>Active</span>
                                  </>
                                )}
                              </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => onDelete(admin._id)}
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Admin Creation Wizard */}
      {showModal && (
        <AdminCreationWizard
          onClose={() => setShowModal(false)}
          onSubmit={handleCreateAdmin}
          loading={creatingAdmin}
        />
      )}

      {/* Admin View Modal */}
      {viewingAdmin && (
        <AdminViewModal
          isOpen={!!viewingAdmin}
          onClose={() => setViewingAdmin(null)}
          admin={viewingAdmin}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}

      {/* Toast Notification */}
      {ToastComponent}
    </div>
  );
}
