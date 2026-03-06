import { useState } from 'react';
import { Shield, Edit, Trash2, Plus, Check, X, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  Button, Badge, Card, CardContent, CardHeader,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Modal, ModalFooter
} from '../../../components/ui';

interface Permission {
  id: string;
  name: string;
  description: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isSystem: boolean;
}

const defaultPermissions: Permission[] = [
  { id: 'conformation.read', name: 'View conformation', description: 'Can view all conformation' },
  { id: 'conformation.write', name: 'Manage conformation', description: 'Can create, edit, delete conformation' },
  { id: 'Reviews.read', name: 'View Reviews', description: 'Can view all Reviews' },
  { id: 'Reviews.write', name: 'Manage Reviews', description: 'Can create, edit, delete Reviews' },
  { id: 'resources.read', name: 'View Resources', description: 'Can view all resources' },
  { id: 'resources.write', name: 'Manage Resources', description: 'Can create, edit, delete resources' },
  { id: 'users.read', name: 'View Users', description: 'Can view all users' },
  { id: 'users.write', name: 'Manage Users', description: 'Can create, edit, delete users' },
  { id: 'settings.read', name: 'View Settings', description: 'Can view settings' },
  { id: 'settings.write', name: 'Manage Settings', description: 'Can modify settings' },
  { id: 'analytics.read', name: 'View Analytics', description: 'Can view analytics data' },
  { id: 'payments.read', name: 'View Payments', description: 'Can view payment data' },
  { id: 'payments.write', name: 'Manage Payments', description: 'Can process refunds, manage subscriptions' },
];

const defaultRoles: Role[] = [
  {
    id: '1',
    name: 'Super Admin',
    description: 'Full access to all features',
    permissions: defaultPermissions.map(p => p.id),
    userCount: 1,
    isSystem: true,
  },
  {
    id: '2',
    name: 'Admin',
    description: 'Can manage content and users',
    permissions: ['conformation.read', 'conformation.write', 'Reviews.read', 'Reviews.write', 'resources.read', 'resources.write', 'users.read', 'analytics.read'],
    userCount: 3,
    isSystem: true,
  },
  {
    id: '3',
    name: 'Editor',
    description: 'Can manage content only',
    permissions: ['conformation.read', 'conformation.write', 'Reviews.read', 'Reviews.write', 'resources.read', 'resources.write'],
    userCount: 5,
    isSystem: false,
  },
  {
    id: '4',
    name: 'Viewer',
    description: 'Read-only access',
    permissions: ['conformation.read', 'Reviews.read', 'resources.read', 'users.read', 'analytics.read'],
    userCount: 2,
    isSystem: false,
  },
];

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>(defaultRoles);
  const [editModal, setEditModal] = useState<{ open: boolean; role: Role | null }>({
    open: false,
    role: null,
  });
  // TODO: Implement edit role modal
  void editModal;
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; role: Role | null }>({
    open: false,
    role: null,
  });

  const handleDelete = () => {
    if (!deleteModal.role) return;
    setRoles(roles.filter(r => r.id !== deleteModal.role!.id));
    toast.success('Role deleted');
    setDeleteModal({ open: false, role: null });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
          <p className="text-gray-600">Manage user roles and their permissions</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Role
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {roles.map((role) => (
          <Card key={role.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${role.isSystem ? 'bg-purple-100' : 'bg-blue-100'
                  }`}>
                  <Shield className={`w-5 h-5 ${role.isSystem ? 'text-purple-600' : 'text-blue-600'}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{role.name}</h3>
                  <p className="text-sm text-gray-500">{role.description}</p>
                </div>
              </div>
              {role.isSystem && (
                <Badge variant="default">System</Badge>
              )}
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{role.userCount} users with this role</span>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Permissions:</p>
                  <div className="flex flex-wrap gap-2">
                    {role.permissions.slice(0, 5).map((permId) => {
                      const perm = defaultPermissions.find(p => p.id === permId);
                      return perm ? (
                        <Badge key={permId} variant="success" className="text-xs">
                          {perm.name}
                        </Badge>
                      ) : null;
                    })}
                    {role.permissions.length > 5 && (
                      <Badge variant="default" className="text-xs">
                        +{role.permissions.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditModal({ open: true, role })}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteModal({ open: true, role })}
                    disabled={role.isSystem}
                    className={role.isSystem ? 'opacity-50 cursor-not-allowed' : 'text-red-600 hover:text-red-700'}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">All Permissions</h2>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Permission</TableHead>
                <TableHead>Description</TableHead>
                {roles.map(role => (
                  <TableHead key={role.id} className="text-center">{role.name}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {defaultPermissions.map((permission) => (
                <TableRow key={permission.id}>
                  <TableCell className="font-medium">{permission.name}</TableCell>
                  <TableCell className="text-gray-500 text-sm">{permission.description}</TableCell>
                  {roles.map(role => (
                    <TableCell key={role.id} className="text-center">
                      {role.permissions.includes(permission.id) ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 mx-auto" />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, role: null })}
        title="Delete Role"
      >
        <p className="text-gray-600">
          Are you sure you want to delete the "{deleteModal.role?.name}" role?
          Users with this role will need to be reassigned.
        </p>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setDeleteModal({ open: false, role: null })}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
