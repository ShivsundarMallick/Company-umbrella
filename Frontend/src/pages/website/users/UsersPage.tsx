import { useState, useEffect } from 'react';
import { Search, Edit, Trash2, ShieldCheck, ShieldOff } from 'lucide-react';
import {
  Button, Badge, Card, CardContent, Select,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Modal, ModalFooter
} from '../../../components/ui';
import { companiesService } from '../../../services';
import type { User } from '../../../types';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const tierOptions = [
  { value: 'Tier 1', label: 'Tier 1' },
  { value: 'Tier 2', label: 'Tier 2' },
  { value: 'Tier 3', label: 'Tier 3' },
];

const roleVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  'Tier 1': 'default',
  'Tier 2': 'secondary',
  'Tier 3': 'outline',
  admin: 'destructive',
  superadmin: 'destructive',
};

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const navigate = useNavigate();

  const [tierModal, setTierModal] = useState<{ open: boolean; user: User | null; newTier: string }>({
    open: false,
    user: null,
    newTier: '',
  });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; user: User | null }>({
    open: false,
    user: null,
  });

  useEffect(() => {
    fetchUsers();
  }, [search, tierFilter]);

  const fetchUsers = async () => {
    try {
      const response = await companiesService.getAll({ search, tier: tierFilter });
      const apiCompanies = Array.isArray(response.data) ? response.data : [];
      
      const mapped = apiCompanies.map((c: any) => ({
        _id: c._id,
        name: c.companyData?.companyName || 'Unknown',
        email: c.companyData?.officialCompanyEmail || 'No email',
        role: c.tier,
        isActive: c.status === 'active' || c.status === 'registered',
        createdAt: c.createdAt
      }));

      setUsers(mapped);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await companiesService.toggleStatus(user._id);
      fetchUsers();
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const handleUpdateTier = async () => {
    if (!tierModal.user) return;
    try {
      await companiesService.updateRole(tierModal.user._id, tierModal.newTier);
      setTierModal({ open: false, user: null, newTier: '' });
      fetchUsers();
    } catch (error) {
      console.error('Failed to update tier:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.user) return;
    try {
      await companiesService.delete(deleteModal.user._id);
      setDeleteModal({ open: false, user: null });
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  // Get assignable tiers based on current user's role
  const getAssignableTiers = () => {
    return tierOptions;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
        <p className="text-sm text-gray-500 mt-1">Manage companies accounts and permissions</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="w-48">
              <Select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                options={[{ value: '', label: 'All Tiers' }, ...tierOptions]}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">Loading...</TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow
                  key={user._id}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => navigate(`/website/users/${user._id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-700 font-medium">
                          {user.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={roleVariants[user.role] || 'default'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? 'default' : 'destructive'}>
                      {user.isActive ? 'Active' : 'Banned'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy') : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`p-1.5 rounded ${user.isActive
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-green-600 hover:bg-green-50'
                          }`}
                        title={user.isActive ? 'Ban User' : 'Activate User'}
                      >
                        {user.isActive ? <ShieldOff className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() =>
                          setTierModal({ open: true, user, newTier: user.role })
                        }
                        className="p-1.5 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded"
                        title="Change Tier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteModal({ open: true, user })}
                        className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Tier Modal */}
      <Modal
        isOpen={tierModal.open}
        onClose={() => setTierModal({ open: false, user: null, newTier: '' })}
        title="Change Company Tier"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Changing tier for <strong>{tierModal.user?.name}</strong>
          </p>
          <Select
            label="New Tier"
            value={tierModal.newTier}
            onChange={(e) => setTierModal((prev: any) => ({ ...prev, newTier: e.target.value }))}
            options={getAssignableTiers()}
          />
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setTierModal({ open: false, user: null, newTier: '' })}>
            Cancel
          </Button>
          <Button onClick={handleUpdateTier}>
            Update Tier
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, user: null })}
        title="Delete User"
        size="sm"
      >
        <p className="text-gray-600">
          Are you sure you want to delete <strong>{deleteModal.user?.name}</strong>? This action cannot be undone.
        </p>
        <ModalFooter>
          <Button variant="outline" onClick={() => setDeleteModal({ open: false, user: null })}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
