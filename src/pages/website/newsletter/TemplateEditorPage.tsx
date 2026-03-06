import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Save, Eye, ArrowLeft, Type, Layout, Code, Image
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  Button, Card, CardContent, CardHeader
} from '../../../components/ui';
import { emailTemplatesService } from '../../../services';

interface HeaderConfig {
  type: 'default' | 'minimal' | 'custom';
  logo?: string;
  logoWidth?: number;
  backgroundColor: string;
  textColor: string;
  customHtml?: string;
}

interface FooterConfig {
  type: 'default' | 'minimal' | 'custom';
  showSocialLinks: boolean;
  socialLinks: {
    twitter?: string;
    youtube?: string;
    telegram?: string;
    instagram?: string;
  };
  showUnsubscribe: boolean;
  showAddress: boolean;
  address?: string;
  customHtml?: string;
  backgroundColor: string;
  textColor: string;
}

interface BodyConfig {
  backgroundColor: string;
  contentBackgroundColor: string;
  textColor: string;
  linkColor: string;
  fontFamily: string;
}

interface TemplateFormData {
  name: string;
  category: 'newsletter' | 'transactional' | 'promotional' | 'announcement';
  header: HeaderConfig;
  footer: FooterConfig;
  body: BodyConfig;
  customHtml: string;
  isActive: boolean;
}

const defaultFormData: TemplateFormData = {
  name: '',
  category: 'newsletter',
  header: {
    type: 'default',
    logo: '',
    logoWidth: 150,
    backgroundColor: '#ffffff',
    textColor: '#1a1a1a',
    customHtml: '',
  },
  footer: {
    type: 'default',
    showSocialLinks: true,
    socialLinks: {},
    showUnsubscribe: true,
    showAddress: true,
    address: '',
    customHtml: '',
    backgroundColor: '#f3f4f6',
    textColor: '#6b7280',
  },
  body: {
    backgroundColor: '#f9fafb',
    contentBackgroundColor: '#ffffff',
    textColor: '#374151',
    linkColor: '#2563eb',
    fontFamily: 'Arial, sans-serif',
  },
  customHtml: '',
  isActive: true,
};

const fontFamilies = [
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: '"Helvetica Neue", Helvetica, sans-serif', label: 'Helvetica' },
  { value: '"Times New Roman", Times, serif', label: 'Times New Roman' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: '"Trebuchet MS", sans-serif', label: 'Trebuchet MS' },
];

export default function TemplateEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'header' | 'body' | 'footer' | 'html'>('header');
  const [formData, setFormData] = useState<TemplateFormData>(defaultFormData);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (isEditing) {
      fetchTemplate();
    }
  }, [id]);

  const fetchTemplate = async () => {
    try {
      const response = await emailTemplatesService.getById(id!);
      if (response.success && response.data?.template) {
        const t = response.data.template;
        setFormData({
          name: t.name,
          category: t.category,
          header: t.header || defaultFormData.header,
          footer: t.footer || defaultFormData.footer,
          body: t.body || defaultFormData.body,
          customHtml: t.customHtml || '',
          isActive: t.isActive,
        });
      }
    } catch (error) {
      toast.error('Failed to load template');
      navigate('/website/newsletter/templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Template name is required');
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        await emailTemplatesService.update(id!, formData);
        toast.success('Template updated');
      } else {
        await emailTemplatesService.create(formData);
        toast.success('Template created');
        navigate('/website/newsletter/templates');
      }
    } catch (error) {
      toast.error('Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const updateHeader = (updates: Partial<HeaderConfig>) => {
    setFormData({ ...formData, header: { ...formData.header, ...updates } });
  };

  const updateFooter = (updates: Partial<FooterConfig>) => {
    setFormData({ ...formData, footer: { ...formData.footer, ...updates } });
  };

  const updateBody = (updates: Partial<BodyConfig>) => {
    setFormData({ ...formData, body: { ...formData.body, ...updates } });
  };

  const tabs = [
    { id: 'header', label: 'Header', icon: Layout },
    { id: 'body', label: 'Body', icon: Type },
    { id: 'footer', label: 'Footer', icon: Layout },
    { id: 'html', label: 'Custom HTML', icon: Code },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/website/newsletter/templates')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Template' : 'Create Template'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Configure your email template settings
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="w-4 h-4 mr-2" />
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
          <Button onClick={handleSave} isLoading={saving}>
            <Save className="w-4 h-4 mr-2" />
            Save Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Basic Information</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Weekly Newsletter"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="newsletter">Newsletter</option>
                    <option value="transactional">Transactional</option>
                    <option value="promotional">Promotional</option>
                    <option value="announcement">Announcement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.isActive ? 'active' : 'inactive'}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Card>
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            <CardContent className="p-6">
              {/* Header Settings */}
              {activeTab === 'header' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Header Type</label>
                    <select
                      value={formData.header.type}
                      onChange={(e) => updateHeader({ type: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="default">Default (Logo + Brand)</option>
                      <option value="minimal">Minimal (Logo only)</option>
                      <option value="custom">Custom HTML</option>
                    </select>
                  </div>

                  {formData.header.type !== 'custom' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={formData.header.logo || ''}
                            onChange={(e) => updateHeader({ logo: e.target.value })}
                            placeholder="https://example.com/logo.png"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                          <Button variant="outline" className="flex-shrink-0">
                            <Image className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Logo Width (px)
                        </label>
                        <input
                          type="number"
                          value={formData.header.logoWidth || 150}
                          onChange={(e) => updateHeader({ logoWidth: parseInt(e.target.value) })}
                          className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Background Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.header.backgroundColor}
                          onChange={(e) => updateHeader({ backgroundColor: e.target.value })}
                          className="w-10 h-10 rounded border cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.header.backgroundColor}
                          onChange={(e) => updateHeader({ backgroundColor: e.target.value })}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Text Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.header.textColor}
                          onChange={(e) => updateHeader({ textColor: e.target.value })}
                          className="w-10 h-10 rounded border cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.header.textColor}
                          onChange={(e) => updateHeader({ textColor: e.target.value })}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  {formData.header.type === 'custom' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Custom HTML
                      </label>
                      <textarea
                        value={formData.header.customHtml || ''}
                        onChange={(e) => updateHeader({ customHtml: e.target.value })}
                        rows={6}
                        placeholder="<table>...</table>"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Body Settings */}
              {activeTab === 'body' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Font Family</label>
                    <select
                      value={formData.body.fontFamily}
                      onChange={(e) => updateBody({ fontFamily: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {fontFamilies.map((font) => (
                        <option key={font.value} value={font.value}>{font.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Page Background
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.body.backgroundColor}
                          onChange={(e) => updateBody({ backgroundColor: e.target.value })}
                          className="w-10 h-10 rounded border cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.body.backgroundColor}
                          onChange={(e) => updateBody({ backgroundColor: e.target.value })}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Content Background
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.body.contentBackgroundColor}
                          onChange={(e) => updateBody({ contentBackgroundColor: e.target.value })}
                          className="w-10 h-10 rounded border cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.body.contentBackgroundColor}
                          onChange={(e) => updateBody({ contentBackgroundColor: e.target.value })}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Text Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.body.textColor}
                          onChange={(e) => updateBody({ textColor: e.target.value })}
                          className="w-10 h-10 rounded border cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.body.textColor}
                          onChange={(e) => updateBody({ textColor: e.target.value })}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Link Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.body.linkColor}
                          onChange={(e) => updateBody({ linkColor: e.target.value })}
                          className="w-10 h-10 rounded border cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.body.linkColor}
                          onChange={(e) => updateBody({ linkColor: e.target.value })}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer Settings */}
              {activeTab === 'footer' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Footer Type</label>
                    <select
                      value={formData.footer.type}
                      onChange={(e) => updateFooter({ type: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="default">Default (Full)</option>
                      <option value="minimal">Minimal</option>
                      <option value="custom">Custom HTML</option>
                    </select>
                  </div>

                  {formData.footer.type !== 'custom' && (
                    <>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.footer.showSocialLinks}
                            onChange={(e) => updateFooter({ showSocialLinks: e.target.checked })}
                            className="rounded text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700">Show social links</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.footer.showUnsubscribe}
                            onChange={(e) => updateFooter({ showUnsubscribe: e.target.checked })}
                            className="rounded text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700">Show unsubscribe link</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.footer.showAddress}
                            onChange={(e) => updateFooter({ showAddress: e.target.checked })}
                            className="rounded text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700">Show address</span>
                        </label>
                      </div>

                      {formData.footer.showAddress && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                          <textarea
                            value={formData.footer.address || ''}
                            onChange={(e) => updateFooter({ address: e.target.value })}
                            rows={2}
                            placeholder="123 Main St, City, Country"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                      )}
                    </>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Background Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.footer.backgroundColor}
                          onChange={(e) => updateFooter({ backgroundColor: e.target.value })}
                          className="w-10 h-10 rounded border cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.footer.backgroundColor}
                          onChange={(e) => updateFooter({ backgroundColor: e.target.value })}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Text Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.footer.textColor}
                          onChange={(e) => updateFooter({ textColor: e.target.value })}
                          className="w-10 h-10 rounded border cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.footer.textColor}
                          onChange={(e) => updateFooter({ textColor: e.target.value })}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  {formData.footer.type === 'custom' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Custom HTML
                      </label>
                      <textarea
                        value={formData.footer.customHtml || ''}
                        onChange={(e) => updateFooter({ customHtml: e.target.value })}
                        rows={6}
                        placeholder="<table>...</table>"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Custom HTML */}
              {activeTab === 'html' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Override the entire email body with custom HTML. Use <code className="bg-gray-100 px-1 rounded">{'{{content}}'}</code> placeholder
                    where the email content should be inserted.
                  </p>
                  <textarea
                    value={formData.customHtml}
                    onChange={(e) => setFormData({ ...formData, customHtml: e.target.value })}
                    rows={20}
                    placeholder="<!DOCTYPE html>..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="lg:sticky lg:top-6">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">Preview</h2>
              </CardHeader>
              <CardContent className="p-0">
                <div
                  className="border rounded-b-lg overflow-hidden"
                  style={{ backgroundColor: formData.body.backgroundColor }}
                >
                  {/* Header Preview */}
                  <div
                    style={{
                      backgroundColor: formData.header.backgroundColor,
                      color: formData.header.textColor,
                      padding: '20px',
                      textAlign: 'center',
                    }}
                  >
                    {formData.header.logo ? (
                      <img
                        src={formData.header.logo}
                        alt="Logo"
                        style={{ maxWidth: formData.header.logoWidth || 150, height: 'auto' }}
                      />
                    ) : (
                      <div className="text-xl font-bold">AmEDU</div>
                    )}
                  </div>

                  {/* Body Preview */}
                  <div style={{ padding: '20px' }}>
                    <div
                      style={{
                        backgroundColor: formData.body.contentBackgroundColor,
                        color: formData.body.textColor,
                        fontFamily: formData.body.fontFamily,
                        padding: '30px',
                        borderRadius: '8px',
                      }}
                    >
                      <h1 style={{ marginTop: 0, fontSize: '24px' }}>Sample Newsletter</h1>
                      <p>This is a preview of your email template. The actual content will appear here when composing a newsletter.</p>
                      <p>
                        <a href="#" style={{ color: formData.body.linkColor }}>Click here</a> to see how links will appear.
                      </p>
                    </div>
                  </div>

                  {/* Footer Preview */}
                  <div
                    style={{
                      backgroundColor: formData.footer.backgroundColor,
                      color: formData.footer.textColor,
                      padding: '20px',
                      textAlign: 'center',
                      fontSize: '12px',
                    }}
                  >
                    {formData.footer.showSocialLinks && (
                      <div style={{ marginBottom: '10px' }}>
                        Twitter | YouTube | Telegram
                      </div>
                    )}
                    {formData.footer.showAddress && formData.footer.address && (
                      <div style={{ marginBottom: '10px' }}>{formData.footer.address}</div>
                    )}
                    {formData.footer.showUnsubscribe && (
                      <div>
                        <a href="#" style={{ color: formData.footer.textColor }}>Unsubscribe</a>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
