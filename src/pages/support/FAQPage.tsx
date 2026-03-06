import { useState, useEffect } from 'react';
import {
  Search, Plus, Edit, Trash2, Eye, EyeOff,
  HelpCircle, ThumbsUp, ThumbsDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  Button, Card, CardContent, CardHeader, Badge, Modal, ModalFooter
} from '../../components/ui';
import { faqService } from '../../services';

interface FAQ {
  _id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  displayOrder: number;
  isActive: boolean;
  views: number;
  helpful: number;
  notHelpful: number;
  createdAt: string;
}

interface Stats {
  total: number;
  active: number;
  byCategory: Record<string, number>;
}

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Form
  const [formModal, setFormModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: '',
    tags: '',
    isActive: true,
  });

  // Delete
  const [deleteModal, setDeleteModal] = useState(false);
  const [deletingFaq, setDeletingFaq] = useState<FAQ | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchFAQs();
    fetchStats();
  }, [search, categoryFilter]);

  const fetchFAQs = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { limit: 100 };
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;

      const response = await faqService.getAll(params);
      if (response.success && response.data) {
        setFaqs(response.data.faqs || []);
      }
    } catch (error) {
      console.error('Failed to fetch FAQs:', error);
      toast.error('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await faqService.getStats();
      if (response.success && response.data?.stats) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const openCreateModal = () => {
    setEditingFaq(null);
    setFormData({
      question: '',
      answer: '',
      category: '',
      tags: '',
      isActive: true,
    });
    setFormModal(true);
  };

  const openEditModal = (faq: FAQ) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      tags: faq.tags.join(', '),
      isActive: faq.isActive,
    });
    setFormModal(true);
  };

  const handleSave = async () => {
    if (!formData.question.trim() || !formData.answer.trim() || !formData.category.trim()) {
      toast.error('Question, answer, and category are required');
      return;
    }

    setSaving(true);
    try {
      const data = {
        question: formData.question,
        answer: formData.answer,
        category: formData.category,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        isActive: formData.isActive,
      };

      if (editingFaq) {
        await faqService.update(editingFaq._id, data);
        toast.success('FAQ updated');
      } else {
        await faqService.create(data);
        toast.success('FAQ created');
      }

      setFormModal(false);
      fetchFAQs();
      fetchStats();
    } catch (error) {
      console.error('Failed to save FAQ:', error);
      toast.error('Failed to save FAQ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingFaq) return;

    setDeleting(true);
    try {
      await faqService.delete(deletingFaq._id);
      toast.success('FAQ deleted');
      setDeleteModal(false);
      setDeletingFaq(null);
      fetchFAQs();
      fetchStats();
    } catch (error) {
      console.error('Failed to delete FAQ:', error);
      toast.error('Failed to delete FAQ');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (faq: FAQ) => {
    try {
      await faqService.update(faq._id, { isActive: !faq.isActive });
      toast.success(faq.isActive ? 'FAQ hidden' : 'FAQ visible');
      fetchFAQs();
      fetchStats();
    } catch (error) {
      console.error('Failed to toggle FAQ:', error);
      toast.error('Failed to update FAQ');
    }
  };

  // Group FAQs by category
  const groupedFaqs = faqs.reduce((acc, faq) => {
    if (!acc[faq.category]) acc[faq.category] = [];
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<string, FAQ[]>);

  const categories = Object.keys(groupedFaqs).sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">FAQ Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage frequently asked questions</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          Add FAQ
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Total FAQs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              <p className="text-xs text-gray-500">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{Object.keys(stats.byCategory || {}).length}</p>
              <p className="text-xs text-gray-500">Categories</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.total - stats.active}</p>
              <p className="text-xs text-gray-500">Hidden</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search FAQs..."
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
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* FAQ List by Category */}
      {loading ? (
        <Card>
          <CardContent className="p-8 text-center">Loading...</CardContent>
        </Card>
      ) : faqs.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            <HelpCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No FAQs found</p>
            <Button onClick={openCreateModal} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Create First FAQ
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {categories.map((category) => (
            <Card key={category}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">{category}</h2>
                  <Badge variant="info">{groupedFaqs[category].length} FAQs</Badge>
                </div>
              </CardHeader>
              <CardContent className="divide-y">
                {groupedFaqs[category].map((faq) => (
                  <div key={faq._id} className={`py-4 ${!faq.isActive ? 'opacity-50' : ''}`}>
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-primary-600 flex-shrink-0" />
                          <p className="font-medium text-gray-900">{faq.question}</p>
                          {!faq.isActive && <Badge variant="warning">Hidden</Badge>}
                        </div>
                        <p className="text-sm text-gray-600 mt-2 ml-6 line-clamp-2">{faq.answer}</p>
                        <div className="flex items-center gap-4 mt-2 ml-6">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Eye className="w-3 h-3" /> {faq.views}
                          </span>
                          <span className="text-xs text-green-600 flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3" /> {faq.helpful}
                          </span>
                          <span className="text-xs text-red-600 flex items-center gap-1">
                            <ThumbsDown className="w-3 h-3" /> {faq.notHelpful}
                          </span>
                          {faq.tags.length > 0 && (
                            <div className="flex gap-1">
                              {faq.tags.map((tag, i) => (
                                <span key={i} className="text-xs bg-gray-100 px-2 py-0.5 rounded">{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(faq)}
                          className={`p-1.5 rounded hover:bg-gray-100 ${faq.isActive ? 'text-gray-600' : 'text-amber-600'}`}
                          title={faq.isActive ? 'Hide' : 'Show'}
                        >
                          {faq.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => openEditModal(faq)}
                          className="p-1.5 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setDeletingFaq(faq); setDeleteModal(true); }}
                          className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={formModal}
        onClose={() => setFormModal(false)}
        title={editingFaq ? 'Edit FAQ' : 'Create FAQ'}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Question *</label>
            <input
              type="text"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              placeholder="Enter the question..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Answer *</label>
            <textarea
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              rows={5}
              placeholder="Enter the answer..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., General, Payments, Accounts"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                list="categories"
              />
              <datalist id="categories">
                {categories.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="tag1, tag2, tag3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Active (visible to users)</span>
            </label>
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setFormModal(false)}>Cancel</Button>
          <Button onClick={handleSave} isLoading={saving}>
            {editingFaq ? 'Update' : 'Create'} FAQ
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete FAQ"
        size="sm"
      >
        <p className="text-gray-600">
          Are you sure you want to delete this FAQ? This action cannot be undone.
        </p>
        <div className="bg-gray-50 rounded-lg p-3 mt-4">
          <p className="text-sm font-medium">{deletingFaq?.question}</p>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} isLoading={deleting}>Delete</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
