import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Edit, Trash2, Copy, Eye, Star, Search, Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  Button, Card, CardContent, Badge, Modal, ModalFooter
} from '../../../components/ui';
import { emailTemplatesService } from '../../../services';

interface EmailTemplate {
  _id: string;
  name: string;
  slug: string;
  type: 'predesigned' | 'custom';
  category: 'newsletter' | 'transactional' | 'promotional' | 'announcement';
  thumbnail?: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  newsletter: { bg: 'bg-blue-100', text: 'text-blue-700' },
  transactional: { bg: 'bg-green-100', text: 'text-green-700' },
  promotional: { bg: 'bg-purple-100', text: 'text-purple-700' },
  announcement: { bg: 'bg-amber-100', text: 'text-amber-700' },
};

export default function TemplatesPage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Delete modal
  const [deleteModal, setDeleteModal] = useState(false);
  const [deletingTemplate, setDeletingTemplate] = useState<EmailTemplate | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await emailTemplatesService.getAll();
      if (response.success && response.data?.templates) {
        setTemplates(response.data.templates);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTemplate) return;

    setDeleting(true);
    try {
      await emailTemplatesService.delete(deletingTemplate._id);
      toast.success('Template deleted');
      setDeleteModal(false);
      setDeletingTemplate(null);
      fetchTemplates();
    } catch (error) {
      toast.error('Failed to delete template');
    } finally {
      setDeleting(false);
    }
  };

  const handleDuplicate = async (template: EmailTemplate) => {
    try {
      await emailTemplatesService.duplicate(template._id);
      toast.success('Template duplicated');
      fetchTemplates();
    } catch (error) {
      toast.error('Failed to duplicate template');
    }
  };

  const handleSetDefault = async (template: EmailTemplate) => {
    try {
      await emailTemplatesService.setDefault(template._id);
      toast.success('Default template updated');
      fetchTemplates();
    } catch (error) {
      toast.error('Failed to set default');
    }
  };

  const handleToggleActive = async (template: EmailTemplate) => {
    try {
      await emailTemplatesService.update(template._id, { isActive: !template.isActive });
      toast.success(template.isActive ? 'Template deactivated' : 'Template activated');
      fetchTemplates();
    } catch (error) {
      toast.error('Failed to update template');
    }
  };

  // Filter templates
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = !search ||
      template.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !categoryFilter || template.category === categoryFilter;
    const matchesType = !typeFilter || template.type === typeFilter;
    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
          <p className="text-sm text-gray-500 mt-1">Manage newsletter and email templates</p>
        </div>
        <Button onClick={() => navigate('/website/newsletter/templates/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Create Template
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
                placeholder="Search templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Categories</option>
              <option value="newsletter">Newsletter</option>
              <option value="transactional">Transactional</option>
              <option value="promotional">Promotional</option>
              <option value="announcement">Announcement</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Types</option>
              <option value="predesigned">Pre-designed</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <div className="h-48 bg-gray-100 animate-pulse" />
              <CardContent className="p-4">
                <div className="h-4 bg-gray-100 rounded animate-pulse mb-2" />
                <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Filter className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-4">No templates found</p>
            <Button onClick={() => navigate('/website/newsletter/templates/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card
              key={template._id}
              className={`group hover:shadow-lg transition-shadow ${!template.isActive ? 'opacity-60' : ''}`}
            >
              {/* Thumbnail */}
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                {template.thumbnail ? (
                  <img
                    src={template.thumbnail}
                    alt={template.name}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
                    <span className="text-6xl font-bold text-primary-300">
                      {template.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white"
                    onClick={() => navigate(`/website/newsletter/templates/${template._id}/edit`)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white"
                    onClick={() => navigate(`/website/newsletter/templates/${template._id}/preview`)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </Button>
                </div>

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {template.isDefault && (
                    <Badge className="bg-amber-500 text-white">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      Default
                    </Badge>
                  )}
                  {!template.isActive && (
                    <Badge variant="danger">Inactive</Badge>
                  )}
                </div>
              </div>

              {/* Content */}
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[template.category]?.bg || 'bg-gray-100'} ${categoryColors[template.category]?.text || 'text-gray-700'}`}>
                        {template.category}
                      </span>
                      <span className="text-xs text-gray-400">
                        {template.type === 'predesigned' ? 'Pre-designed' : 'Custom'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 mt-4 pt-3 border-t border-gray-100">
                  {!template.isDefault && (
                    <button
                      onClick={() => handleSetDefault(template)}
                      className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Set as default"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDuplicate(template)}
                    className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Duplicate"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleActive(template)}
                    className={`p-2 rounded-lg transition-colors ${
                      template.isActive
                        ? 'text-gray-500 hover:text-amber-600 hover:bg-amber-50'
                        : 'text-amber-600 hover:bg-amber-50'
                    }`}
                    title={template.isActive ? 'Deactivate' : 'Activate'}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { setDeletingTemplate(template); setDeleteModal(true); }}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-auto"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete Template"
        size="sm"
      >
        <p className="text-gray-600">
          Are you sure you want to delete <strong>{deletingTemplate?.name}</strong>?
          This action cannot be undone.
        </p>
        <ModalFooter>
          <Button variant="outline" onClick={() => setDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} isLoading={deleting}>Delete</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
