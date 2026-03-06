import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Star, StarOff } from 'lucide-react';
import {
  Button, Badge, Card, CardContent,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Modal, ModalFooter
} from '../../../components/ui';
import { conformationService } from '../../../services';
import type { conformation } from '../../../types';
import { format } from 'date-fns';

export default function ConformationListPage() {
  const [conformationData, setconformationData] = useState<conformation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; item: conformation | null }>({
    open: false,
    item: null,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchconformation();
  }, [search]);

  const fetchconformation = async () => {
    try {
      const response = await conformationService.getAll({ search, limit: 50, type: 'post' });
      if (response.success && response.data) {
        setconformationData(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Failed to fetch conformation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (item: conformation) => {
    try {
      await conformationService.togglePublish(item._id);
      fetchconformation();
    } catch (error) {
      console.error('Failed to toggle publish:', error);
    }
  };

  const handleToggleFeatured = async (item: conformation) => {
    try {
      await conformationService.toggleFeatured(item._id);
      fetchconformation();
    } catch (error) {
      console.error('Failed to toggle featured:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.item) return;
    try {
      await conformationService.delete(deleteModal.item._id);
      setDeleteModal({ open: false, item: null });
      fetchconformation();
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">conformation</h1>
          <p className="text-sm text-gray-500 mt-1">Manage blog conformation and articles</p>
        </div>
        <Button onClick={() => navigate('/website/conformation/new')}>
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conformation..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : conformationData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No conformation found
                </TableCell>
              </TableRow>
            ) : (
              conformationData.map((item) => (
                <TableRow key={item._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {item.thumbnail && (
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-10 h-10 rounded object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium text-gray-900 line-clamp-1">{item.title}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{item.slug}</p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant={item.isPublished ? 'success' : 'warning'}>
                        {item.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                      {item.isFeatured && (
                        <Badge variant="info">Featured</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{item.views?.toLocaleString() || 0}</TableCell>
                  <TableCell>
                    {item.createdAt ? format(new Date(item.createdAt), 'MMM d, yyyy') : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleTogglePublish(item)}
                        className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                        title={item.isPublished ? 'Unpublish' : 'Publish'}
                      >
                        {item.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleToggleFeatured(item)}
                        className="p-1.5 text-gray-600 hover:text-yellow-600 hover:bg-gray-100 rounded"
                        title={item.isFeatured ? 'Remove from featured' : 'Mark as featured'}
                      >
                        {item.isFeatured ? <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" /> : <StarOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => navigate(`/website/conformation/${item._id}/edit`)}
                        className="p-1.5 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteModal({ open: true, item })}
                        className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded"
                        title="Delete"
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

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, item: null })}
        title="Delete Post"
        size="sm"
      >
        <p className="text-gray-600">
          Are you sure you want to delete "{deleteModal.item?.title}"? This action cannot be undone.
        </p>
        <ModalFooter>
          <Button variant="outline" onClick={() => setDeleteModal({ open: false, item: null })}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}