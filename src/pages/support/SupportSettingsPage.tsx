import { useState, useEffect } from 'react';
import {
  Clock, MessageSquare, Users, Bell, Save, Plus, Trash2, Edit, Bot, Upload, FileText, RefreshCw, CheckCircle, AlertCircle, XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  Button, Card, CardContent, CardHeader, Modal, ModalFooter, Badge
} from '../../components/ui';
import { supportService } from '../../services';

interface BusinessHours {
  day: string;
  enabled: boolean;
  start: string;
  end: string;
}

interface CannedResponse {
  id: string;
  title: string;
  content: string;
  category: string;
}

interface AIDocument {
  _id: string;
  title: string;
  description?: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number;
  category: string;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  processingError?: string;
  isActive: boolean;
  priority: number;
  totalTokens?: number;
  usageCount?: number;
  createdAt: string;
}

interface AISettings {
  enabled: boolean;
  model: string;
  defaultMode: 'human' | 'ai' | 'hybrid';
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
}

interface SupportSettings {
  businessHours: BusinessHours[];
  autoReply: {
    enabled: boolean;
    message: string;
    afterHoursMessage: string;
  };
  chatWidget: {
    enabled: boolean;
    position: 'bottom-right' | 'bottom-left';
    primaryColor: string;
    greeting: string;
    offlineMessage: string;
  };
  notifications: {
    emailOnNewTicket: boolean;
    emailOnNewMessage: boolean;
    emailOnChatRequest: boolean;
  };
  cannedResponses: CannedResponse[];
  aiChat: AISettings;
}

const defaultBusinessHours: BusinessHours[] = [
  { day: 'Monday', enabled: true, start: '09:00', end: '18:00' },
  { day: 'Tuesday', enabled: true, start: '09:00', end: '18:00' },
  { day: 'Wednesday', enabled: true, start: '09:00', end: '18:00' },
  { day: 'Thursday', enabled: true, start: '09:00', end: '18:00' },
  { day: 'Friday', enabled: true, start: '09:00', end: '18:00' },
  { day: 'Saturday', enabled: false, start: '10:00', end: '14:00' },
  { day: 'Sunday', enabled: false, start: '10:00', end: '14:00' },
];

const defaultSettings: SupportSettings = {
  businessHours: defaultBusinessHours,
  autoReply: {
    enabled: true,
    message: 'Thank you for contacting us! We have received your message and will respond within 24 hours.',
    afterHoursMessage: 'We are currently outside of business hours. We will respond to your inquiry as soon as we return.',
  },
  chatWidget: {
    enabled: true,
    position: 'bottom-right',
    primaryColor: '#3B82F6',
    greeting: 'Hi! How can we help you today?',
    offlineMessage: 'We are currently offline. Please leave a message and we will get back to you.',
  },
  notifications: {
    emailOnNewTicket: true,
    emailOnNewMessage: true,
    emailOnChatRequest: true,
  },
  cannedResponses: [
    { id: '1', title: 'Greeting', content: 'Hello! Thank you for reaching out. How can I assist you today?', category: 'General' },
    { id: '2', title: 'Closing', content: 'Is there anything else I can help you with? Feel free to reach out if you have more questions!', category: 'General' },
    { id: '3', title: 'Password Reset', content: 'To reset your password, please click on "Forgot Password" on the login page and follow the instructions sent to your email.', category: 'Account' },
  ],
  aiChat: {
    enabled: true,
    model: 'gemini-1.5-flash',
    defaultMode: 'hybrid',
    systemPrompt: 'You are a helpful AI assistant for AmEDU, an educational platform for UPSC preparation.',
    temperature: 0.7,
    maxTokens: 1024,
  },
};

export default function SupportSettingsPage() {
  const [settings, setSettings] = useState<SupportSettings>(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'hours' | 'auto-reply' | 'widget' | 'notifications' | 'canned' | 'ai-chat'>('hours');

  // Canned response modal
  const [cannedModal, setCannedModal] = useState(false);
  const [editingCanned, setEditingCanned] = useState<CannedResponse | null>(null);
  const [cannedForm, setCannedForm] = useState({ title: '', content: '', category: '' });

  // AI Chat state
  const [aiDocuments, setAiDocuments] = useState<AIDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [aiStatus, setAiStatus] = useState<{ enabled: boolean; model: string; provider: string } | null>(null);
  const [documentModal, setDocumentModal] = useState(false);
  const [documentForm, setDocumentForm] = useState({
    title: '',
    description: '',
    fileUrl: '',
    fileName: '',
    fileType: 'pdf' as string,
    category: 'general' as string,
    priority: 0,
  });

  useEffect(() => {
    // Load settings from localStorage or API
    const saved = localStorage.getItem('supportSettings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse settings:', e);
      }
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save to localStorage (in production, save to backend)
      localStorage.setItem('supportSettings', JSON.stringify(settings));
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateBusinessHours = (index: number, field: keyof BusinessHours, value: any) => {
    const updated = [...settings.businessHours];
    updated[index] = { ...updated[index], [field]: value };
    setSettings({ ...settings, businessHours: updated });
  };

  const openCannedModal = (canned?: CannedResponse) => {
    if (canned) {
      setEditingCanned(canned);
      setCannedForm({ title: canned.title, content: canned.content, category: canned.category });
    } else {
      setEditingCanned(null);
      setCannedForm({ title: '', content: '', category: '' });
    }
    setCannedModal(true);
  };

  const saveCannedResponse = () => {
    if (!cannedForm.title.trim() || !cannedForm.content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    if (editingCanned) {
      const updated = settings.cannedResponses.map(c =>
        c.id === editingCanned.id ? { ...c, ...cannedForm } : c
      );
      setSettings({ ...settings, cannedResponses: updated });
    } else {
      const newCanned: CannedResponse = {
        id: Date.now().toString(),
        ...cannedForm,
      };
      setSettings({ ...settings, cannedResponses: [...settings.cannedResponses, newCanned] });
    }

    setCannedModal(false);
    toast.success(editingCanned ? 'Response updated' : 'Response added');
  };

  const deleteCannedResponse = (id: string) => {
    setSettings({
      ...settings,
      cannedResponses: settings.cannedResponses.filter(c => c.id !== id),
    });
    toast.success('Response deleted');
  };

  // AI Chat functions
  const fetchAIDocuments = async () => {
    setLoadingDocs(true);
    try {
      const response = await supportService.getAIDocuments();
      if (response.success && response.data) {
        setAiDocuments(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch AI documents:', error);
    } finally {
      setLoadingDocs(false);
    }
  };

  const fetchAIStatus = async () => {
    try {
      const response = await supportService.getAIStatus();
      if (response.success && response.data) {
        setAiStatus(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch AI status:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'ai-chat') {
      fetchAIDocuments();
      fetchAIStatus();
    }
  }, [activeTab]);

  const openDocumentModal = () => {
    setDocumentForm({
      title: '',
      description: '',
      fileUrl: '',
      fileName: '',
      fileType: 'pdf',
      category: 'general',
      priority: 0,
    });
    setDocumentModal(true);
  };

  const saveDocument = async () => {
    if (!documentForm.title.trim() || !documentForm.fileUrl.trim()) {
      toast.error('Title and file URL are required');
      return;
    }

    try {
      await supportService.createAIDocument({
        ...documentForm,
        fileName: documentForm.fileName || documentForm.title,
      });
      toast.success('Document added and processing started');
      setDocumentModal(false);
      fetchAIDocuments();
    } catch (error) {
      console.error('Failed to create document:', error);
      toast.error('Failed to add document');
    }
  };

  const toggleDocumentActive = async (doc: AIDocument) => {
    try {
      await supportService.updateAIDocument(doc._id, { isActive: !doc.isActive });
      toast.success(doc.isActive ? 'Document disabled' : 'Document enabled');
      fetchAIDocuments();
    } catch (error) {
      toast.error('Failed to update document');
    }
  };

  const deleteDocument = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await supportService.deleteAIDocument(id);
      toast.success('Document deleted');
      fetchAIDocuments();
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const reprocessDocument = async (id: string) => {
    try {
      await supportService.reprocessAIDocument(id);
      toast.success('Reprocessing started');
      fetchAIDocuments();
    } catch (error) {
      toast.error('Failed to reprocess document');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing': return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const tabs = [
    { id: 'hours', label: 'Business Hours', icon: Clock },
    { id: 'auto-reply', label: 'Auto-Reply', icon: MessageSquare },
    { id: 'widget', label: 'Chat Widget', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'canned', label: 'Canned Responses', icon: MessageSquare },
    { id: 'ai-chat', label: 'AI Chat', icon: Bot },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Configure support system preferences</p>
        </div>
        <Button onClick={handleSave} isLoading={saving}>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Business Hours */}
      {activeTab === 'hours' && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Business Hours</h2>
            <p className="text-sm text-gray-500">Set when your support team is available</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {settings.businessHours.map((hours, index) => (
              <div key={hours.day} className="flex items-center gap-4">
                <label className="flex items-center gap-2 w-32">
                  <input
                    type="checkbox"
                    checked={hours.enabled}
                    onChange={(e) => updateBusinessHours(index, 'enabled', e.target.checked)}
                    className="rounded text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium">{hours.day}</span>
                </label>
                <input
                  type="time"
                  value={hours.start}
                  onChange={(e) => updateBusinessHours(index, 'start', e.target.value)}
                  disabled={!hours.enabled}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="time"
                  value={hours.end}
                  onChange={(e) => updateBusinessHours(index, 'end', e.target.value)}
                  disabled={!hours.enabled}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Auto-Reply */}
      {activeTab === 'auto-reply' && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Auto-Reply Settings</h2>
            <p className="text-sm text-gray-500">Configure automatic responses</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.autoReply.enabled}
                onChange={(e) => setSettings({
                  ...settings,
                  autoReply: { ...settings.autoReply, enabled: e.target.checked }
                })}
                className="rounded text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm font-medium">Enable auto-reply</span>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Auto-Reply Message
              </label>
              <textarea
                value={settings.autoReply.message}
                onChange={(e) => setSettings({
                  ...settings,
                  autoReply: { ...settings.autoReply, message: e.target.value }
                })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter auto-reply message..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                After Hours Message
              </label>
              <textarea
                value={settings.autoReply.afterHoursMessage}
                onChange={(e) => setSettings({
                  ...settings,
                  autoReply: { ...settings.autoReply, afterHoursMessage: e.target.value }
                })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter after-hours message..."
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chat Widget */}
      {activeTab === 'widget' && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Chat Widget Settings</h2>
            <p className="text-sm text-gray-500">Customize the support chat widget</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.chatWidget.enabled}
                onChange={(e) => setSettings({
                  ...settings,
                  chatWidget: { ...settings.chatWidget, enabled: e.target.checked }
                })}
                className="rounded text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm font-medium">Enable chat widget</span>
            </label>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <select
                  value={settings.chatWidget.position}
                  onChange={(e) => setSettings({
                    ...settings,
                    chatWidget: { ...settings.chatWidget, position: e.target.value as any }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.chatWidget.primaryColor}
                    onChange={(e) => setSettings({
                      ...settings,
                      chatWidget: { ...settings.chatWidget, primaryColor: e.target.value }
                    })}
                    className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.chatWidget.primaryColor}
                    onChange={(e) => setSettings({
                      ...settings,
                      chatWidget: { ...settings.chatWidget, primaryColor: e.target.value }
                    })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Greeting Message</label>
              <input
                type="text"
                value={settings.chatWidget.greeting}
                onChange={(e) => setSettings({
                  ...settings,
                  chatWidget: { ...settings.chatWidget, greeting: e.target.value }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Offline Message</label>
              <textarea
                value={settings.chatWidget.offlineMessage}
                onChange={(e) => setSettings({
                  ...settings,
                  chatWidget: { ...settings.chatWidget, offlineMessage: e.target.value }
                })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notifications */}
      {activeTab === 'notifications' && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Notification Settings</h2>
            <p className="text-sm text-gray-500">Configure email notifications for support events</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.emailOnNewTicket}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, emailOnNewTicket: e.target.checked }
                })}
                className="rounded text-primary-600 focus:ring-primary-500"
              />
              <div>
                <span className="text-sm font-medium">New Ticket</span>
                <p className="text-xs text-gray-500">Receive email when a new support ticket is created</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.emailOnNewMessage}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, emailOnNewMessage: e.target.checked }
                })}
                className="rounded text-primary-600 focus:ring-primary-500"
              />
              <div>
                <span className="text-sm font-medium">New Contact Message</span>
                <p className="text-xs text-gray-500">Receive email when a new contact form message arrives</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.emailOnChatRequest}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, emailOnChatRequest: e.target.checked }
                })}
                className="rounded text-primary-600 focus:ring-primary-500"
              />
              <div>
                <span className="text-sm font-medium">Chat Request</span>
                <p className="text-xs text-gray-500">Receive email when a visitor starts a chat session</p>
              </div>
            </label>
          </CardContent>
        </Card>
      )}

      {/* Canned Responses */}
      {activeTab === 'canned' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Canned Responses</h2>
                <p className="text-sm text-gray-500">Pre-written responses for quick replies</p>
              </div>
              <Button onClick={() => openCannedModal()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Response
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {settings.cannedResponses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No canned responses yet</p>
                <Button onClick={() => openCannedModal()} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Response
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {settings.cannedResponses.map((canned) => (
                  <div key={canned.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">{canned.title}</p>
                          {canned.category && (
                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{canned.category}</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{canned.content}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => openCannedModal(canned)}
                          className="p-1.5 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteCannedResponse(canned.id)}
                          className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* AI Chat Settings */}
      {activeTab === 'ai-chat' && (
        <div className="space-y-6">
          {/* AI Status Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">AI Chat Configuration</h2>
                  <p className="text-sm text-gray-500">Configure AI-powered chat assistant</p>
                </div>
                {aiStatus && (
                  <Badge variant={aiStatus.enabled ? 'success' : 'warning'}>
                    {aiStatus.enabled ? 'Connected' : 'Not Configured'}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Enable AI Chat Toggle */}
              <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.aiChat.enabled}
                  onChange={(e) => setSettings({
                    ...settings,
                    aiChat: { ...settings.aiChat, enabled: e.target.checked }
                  })}
                  className="rounded text-primary-600 focus:ring-primary-500 w-5 h-5"
                />
                <div>
                  <span className="text-sm font-medium">Enable AI Chat</span>
                  <p className="text-xs text-gray-500">Allow visitors to chat with AI assistant</p>
                </div>
              </label>

              {/* Model Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">AI Model</label>
                  <select
                    value={settings.aiChat.model}
                    onChange={(e) => setSettings({
                      ...settings,
                      aiChat: { ...settings.aiChat, model: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fast)</option>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro (Advanced)</option>
                    <option value="gemini-1.0-pro">Gemini 1.0 Pro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default Chat Mode</label>
                  <select
                    value={settings.aiChat.defaultMode}
                    onChange={(e) => setSettings({
                      ...settings,
                      aiChat: { ...settings.aiChat, defaultMode: e.target.value as any }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="ai">AI Only</option>
                    <option value="human">Human Only</option>
                    <option value="hybrid">Hybrid (AI + Human)</option>
                  </select>
                </div>
              </div>

              {/* Temperature & Max Tokens */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Temperature: {settings.aiChat.temperature}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.aiChat.temperature}
                    onChange={(e) => setSettings({
                      ...settings,
                      aiChat: { ...settings.aiChat, temperature: parseFloat(e.target.value) }
                    })}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">Lower = more focused, Higher = more creative</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Response Tokens</label>
                  <input
                    type="number"
                    value={settings.aiChat.maxTokens}
                    onChange={(e) => setSettings({
                      ...settings,
                      aiChat: { ...settings.aiChat, maxTokens: parseInt(e.target.value) || 1024 }
                    })}
                    min={256}
                    max={4096}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* System Prompt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">System Prompt</label>
                <textarea
                  value={settings.aiChat.systemPrompt}
                  onChange={(e) => setSettings({
                    ...settings,
                    aiChat: { ...settings.aiChat, systemPrompt: e.target.value }
                  })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Instructions for how the AI should behave..."
                />
                <p className="text-xs text-gray-500 mt-1">This prompt guides the AI's behavior and personality</p>
              </div>
            </CardContent>
          </Card>

          {/* Reference Documents */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Reference Documents</h2>
                  <p className="text-sm text-gray-500">Upload documents for AI to use as knowledge base</p>
                </div>
                <Button onClick={openDocumentModal}>
                  <Upload className="w-4 h-4 mr-2" />
                  Add Document
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingDocs ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 mx-auto mb-4 text-gray-300 animate-spin" />
                  <p className="text-gray-500">Loading documents...</p>
                </div>
              ) : aiDocuments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No documents uploaded yet</p>
                  <p className="text-sm mt-1">Upload PDFs, text files, or other documents to give the AI context</p>
                  <Button onClick={openDocumentModal} className="mt-4">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload First Document
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {aiDocuments.map((doc) => (
                    <div key={doc._id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">{doc.title}</p>
                              {getStatusIcon(doc.processingStatus)}
                            </div>
                            <p className="text-sm text-gray-500">{doc.category} • {doc.fileType.toUpperCase()}</p>
                            {doc.totalTokens && (
                              <p className="text-xs text-gray-400">{doc.totalTokens.toLocaleString()} tokens</p>
                            )}
                            {doc.processingError && (
                              <p className="text-xs text-red-500 mt-1">{doc.processingError}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleDocumentActive(doc)}
                            className={`p-1.5 rounded ${doc.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                            title={doc.isActive ? 'Disable' : 'Enable'}
                          >
                            {doc.isActive ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          </button>
                          {doc.processingStatus === 'failed' && (
                            <button
                              onClick={() => reprocessDocument(doc._id)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                              title="Reprocess"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteDocument(doc._id)}
                            className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Document Modal */}
      <Modal
        isOpen={documentModal}
        onClose={() => setDocumentModal(false)}
        title="Add Reference Document"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={documentForm.title}
              onChange={(e) => setDocumentForm({ ...documentForm, title: e.target.value })}
              placeholder="e.g., Review Catalog, FAQ Document"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={documentForm.description}
              onChange={(e) => setDocumentForm({ ...documentForm, description: e.target.value })}
              placeholder="Brief description of the document content"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">File URL *</label>
            <input
              type="url"
              value={documentForm.fileUrl}
              onChange={(e) => setDocumentForm({ ...documentForm, fileUrl: e.target.value })}
              placeholder="https://example.com/document.pdf"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">Enter URL to a PDF, TXT, or MD file</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">File Type</label>
              <select
                value={documentForm.fileType}
                onChange={(e) => setDocumentForm({ ...documentForm, fileType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="pdf">PDF</option>
                <option value="txt">Text File</option>
                <option value="md">Markdown</option>
                <option value="html">HTML</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={documentForm.category}
                onChange={(e) => setDocumentForm({ ...documentForm, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="general">General</option>
                <option value="Reviews">Reviews</option>
                <option value="resources">Resources</option>
                <option value="policies">Policies</option>
                <option value="faq">FAQ</option>
                <option value="support">Support</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <input
              type="number"
              value={documentForm.priority}
              onChange={(e) => setDocumentForm({ ...documentForm, priority: parseInt(e.target.value) || 0 })}
              min={0}
              max={100}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">Higher priority documents are used first when context is limited</p>
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setDocumentModal(false)}>Cancel</Button>
          <Button onClick={saveDocument}>
            <Upload className="w-4 h-4 mr-2" />
            Add Document
          </Button>
        </ModalFooter>
      </Modal>

      {/* Canned Response Modal */}
      <Modal
        isOpen={cannedModal}
        onClose={() => setCannedModal(false)}
        title={editingCanned ? 'Edit Canned Response' : 'Add Canned Response'}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={cannedForm.title}
              onChange={(e) => setCannedForm({ ...cannedForm, title: e.target.value })}
              placeholder="e.g., Greeting, Closing, Password Reset"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input
              type="text"
              value={cannedForm.category}
              onChange={(e) => setCannedForm({ ...cannedForm, category: e.target.value })}
              placeholder="e.g., General, Account, Technical"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Response Content *</label>
            <textarea
              value={cannedForm.content}
              onChange={(e) => setCannedForm({ ...cannedForm, content: e.target.value })}
              rows={5}
              placeholder="Enter the canned response text..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setCannedModal(false)}>Cancel</Button>
          <Button onClick={saveCannedResponse}>
            {editingCanned ? 'Update' : 'Add'} Response
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
