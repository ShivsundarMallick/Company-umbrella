import { useState, useEffect } from 'react';
import { Shield, Edit, Trash2, UserPlus, Search, MoreVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  Button, Badge, Card, CardContent,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Modal, ModalFooter
} from '../../../components/ui';
import { usersService } from '../../../services';
import { format } from 'date-fns';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; admin: User | null }>({
    open: false,
    admin: null,
  });

  useEffect(() => {
    fetchAdmins();
  }, [search]);

  const fetchAdmins = async () => {
    try {
      const response = await usersService.getAll({ search, limit: 50 });
      if (response.success && response.data) {
        const data = Array.isArray(response.data) ? response.data : [];
        setAdmins(data.filter((u: User) => u.role === 'admin' || u.role === 'superadmin'));
      }
    } catch (error) {
      console.error('Failed to fetch admins:', error);
      toast.error('Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (admin: User) => {
    try {
      await usersService.toggleStatus(admin._id);
      toast.success(`Admin ${admin.isActive ? 'deactivated' : 'activated'}`);
      fetchAdmins();
    } catch {
      toast.error('Failed to update admin');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.admin) return;
    try {
      await usersService.delete(deleteModal.admin._id);
      toast.success('Admin removed');
      setDeleteModal({ open: false, admin: null });
      fetchAdmins();
    } catch {
      toast.error('Failed to remove admin');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'superadmin':
        return <Badge variant="danger">Super Admin</Badge>;
      case 'admin':
        return <Badge variant="info">Admin</Badge>;
      default:
        return <Badge variant="default">{role}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Administrators</h1>
          <p className="text-gray-600">Manage admin users and their access</p>
        </div>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Add Admin
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search admins..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : admins.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admin</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          {admin.avatar ? (
                            <img src={admin.avatar} alt={admin.name} className="w-10 h-10 rounded-full" />
                          ) : (
                            <Shield className="w-5 h-5 text-purple-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{admin.name}</p>
                          <p className="text-sm text-gray-500">{admin.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(admin.role)}</TableCell>
                    <TableCell>
                      <Badge variant={admin.isActive ? 'success' : 'warning'}>
                        {admin.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-500">
                        {admin.lastLogin
                          ? format(new Date(admin.lastLogin), 'MMM d, yyyy')
                          : 'Never'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(admin)}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteModal({ open: true, admin })}
                          disabled={admin.role === 'superadmin'}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No administrators found
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, admin: null })}
        title="Remove Admin"
      >
        <p className="text-gray-600">
          Are you sure you want to remove admin privileges from {deleteModal.admin?.name}?
          They will no longer be able to access the admin panel.
        </p>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setDeleteModal({ open: false, admin: null })}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
            Remove
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
