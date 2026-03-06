import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, Users, Save, TestTube } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  Button, Card, CardContent, CardHeader, Badge, Modal, ModalFooter
} from '../../../components/ui';
import { emailCampaignsService } from '../../../services';

interface RecipientSettings {
  type: 'all' | 'preferences' | 'selected';
  preferences?: {
    currentAffairs?: boolean;
    Reviews?: boolean;
    resources?: boolean;
    offers?: boolean;
  };
  selectedEmails?: string[];
}

export default function ComposeNewsletterPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [recipientCount, setRecipientCount] = useState<number | null>(null);

  const [subject, setSubject] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [content, setContent] = useState('');
  const [template, setTemplate] = useState<'default' | 'announcement' | 'update' | 'promotional'>('default');
  const [recipients, setRecipients] = useState<RecipientSettings>({ type: 'all' });

  const [testEmailModal, setTestEmailModal] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);

  const [confirmSendModal, setConfirmSendModal] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      fetchCampaign(id);
    }
  }, [id, isEditing]);

  useEffect(() => {
    fetchRecipientCount();
  }, [recipients]);

  const fetchCampaign = async (campaignId: string) => {
    setLoading(true);
    try {
      const response = await emailCampaignsService.getById(campaignId);
      if (response.success && response.data?.campaign) {
        const campaign = response.data.campaign;
        setSubject(campaign.subject);
        setPreviewText(campaign.previewText || '');
        setContent(campaign.content);
        setTemplate(campaign.template || 'default');
        setRecipients(campaign.recipients || { type: 'all' });
      }
    } catch (error) {
      console.error('Failed to fetch campaign:', error);
      toast.error('Failed to load campaign');
      navigate('/website/newsletter/campaigns');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipientCount = async () => {
    try {
      const response = await emailCampaignsService.previewRecipients(recipients);
      if (response.success && response.data) {
        setRecipientCount(response.data.count);
      }
    } catch (error) {
      console.error('Failed to get recipient count:', error);
    }
  };

  const handleSave = async () => {
    if (!subject.trim() || !content.trim()) {
      toast.error('Subject and content are required');
      return;
    }

    setSaving(true);
    try {
      const data = {
        subject,
        previewText,
        content,
        template,
        recipients,
      };

      if (isEditing && id) {
        await emailCampaignsService.update(id, data);
        toast.success('Campaign updated');
      } else {
        const response = await emailCampaignsService.create(data);
        if (response.success && response.data?.campaign) {
          toast.success('Campaign saved as draft');
          navigate(`/website/newsletter/compose/${response.data.campaign._id}`);
        }
      }
    } catch (error) {
      console.error('Failed to save campaign:', error);
      toast.error('Failed to save campaign');
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async () => {
    if (!testEmail.trim()) {
      toast.error('Please enter a test email');
      return;
    }

    // Save first if needed
    if (!id) {
      toast.error('Please save the campaign first');
      return;
    }

    setSendingTest(true);
    try {
      await emailCampaignsService.sendTest(id, testEmail);
      toast.success(`Test email sent to ${testEmail}`);
      setTestEmailModal(false);
      setTestEmail('');
    } catch (error) {
      console.error('Failed to send test email:', error);
      toast.error('Failed to send test email');
    } finally {
      setSendingTest(false);
    }
  };

  const handleSend = async () => {
    if (!id) {
      toast.error('Please save the campaign first');
      return;
    }

    setSending(true);
    try {
      const response = await emailCampaignsService.send(id);
      if (response.success) {
        toast.success(`Campaign sent to ${response.data?.sent || 0} subscribers`);
        navigate('/website/newsletter/campaigns');
      }
    } catch (error: any) {
      console.error('Failed to send campaign:', error);
      toast.error(error.message || 'Failed to send campaign');
    } finally {
      setSending(false);
      setConfirmSendModal(false);
    }
  };

  const handlePreferenceToggle = (pref: keyof NonNullable<RecipientSettings['preferences']>) => {
    setRecipients(prev => ({
      ...prev,
      type: 'preferences',
      preferences: {
        ...prev.preferences,
        [pref]: !prev.preferences?.[pref],
      },
    }));
  };

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
          <button
            onClick={() => navigate('/website/newsletter/campaigns')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Campaign' : 'Compose Newsletter'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Create and send emails to your subscribers
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => handleSave()} isLoading={saving}>
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          {id && (
            <Button variant="outline" onClick={() => setTestEmailModal(true)}>
              <TestTube className="w-4 h-4 mr-2" />
              Send Test
            </Button>
          )}
          <Button onClick={() => setConfirmSendModal(true)} disabled={!subject || !content}>
            <Send className="w-4 h-4 mr-2" />
            Send Campaign
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Email Content</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject Line *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter email subject..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">{subject.length}/200 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preview Text
                </label>
                <input
                  type="text"
                  value={previewText}
                  onChange={(e) => setPreviewText(e.target.value)}
                  placeholder="Brief preview shown in inbox..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">Shown in email inbox preview</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Content * (HTML supported)
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="<h2>Hello!</h2>&#10;<p>Your newsletter content here...</p>"
                  rows={15}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use HTML tags for formatting. Basic styles are included automatically.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recipients */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Recipients</h2>
                <Badge variant="info">
                  <Users className="w-3 h-3 mr-1" />
                  {recipientCount !== null ? recipientCount.toLocaleString() : '...'} subscribers
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Send To
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="recipientType"
                      checked={recipients.type === 'all'}
                      onChange={() => setRecipients({ type: 'all' })}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm">All Active Subscribers</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="recipientType"
                      checked={recipients.type === 'preferences'}
                      onChange={() => setRecipients({ type: 'preferences', preferences: {} })}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm">By Preferences</span>
                  </label>
                </div>
              </div>

              {recipients.type === 'preferences' && (
                <div className="pl-6 space-y-2 border-l-2 border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Select subscriber preferences:</p>
                  {['currentAffairs', 'Reviews', 'resources', 'offers'].map((pref) => (
                    <label key={pref} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={recipients.preferences?.[pref as keyof NonNullable<RecipientSettings['preferences']>] || false}
                        onChange={() => handlePreferenceToggle(pref as keyof NonNullable<RecipientSettings['preferences']>)}
                        className="text-primary-600 focus:ring-primary-500 rounded"
                      />
                      <span className="text-sm capitalize">{pref.replace(/([A-Z])/g, ' $1').trim()}</span>
                    </label>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Template */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Template</h2>
            </CardHeader>
            <CardContent>
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value as typeof template)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="default">Default</option>
                <option value="announcement">Announcement</option>
                <option value="update">Update</option>
                <option value="promotional">Promotional</option>
              </select>
              <p className="text-xs text-gray-500 mt-2">
                Templates apply pre-designed header/footer styling
              </p>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Tips</h2>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-2">
              <p>• Keep subject lines under 50 characters for better open rates</p>
              <p>• Use a clear call-to-action</p>
              <p>• Always send a test email first</p>
              <p>• Unsubscribe link is added automatically</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Test Email Modal */}
      <Modal
        isOpen={testEmailModal}
        onClose={() => setTestEmailModal(false)}
        title="Send Test Email"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Send a test email to preview how your campaign will look.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test Email Address
            </label>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setTestEmailModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleSendTest} isLoading={sendingTest}>
            <Send className="w-4 h-4 mr-2" />
            Send Test
          </Button>
        </ModalFooter>
      </Modal>

      {/* Confirm Send Modal */}
      <Modal
        isOpen={confirmSendModal}
        onClose={() => setConfirmSendModal(false)}
        title="Send Campaign"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to send this campaign?
          </p>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-900">{subject}</p>
            <p className="text-sm text-gray-500 mt-1">
              Will be sent to <strong>{recipientCount?.toLocaleString()}</strong> subscribers
            </p>
          </div>
          <p className="text-sm text-amber-600">
            This action cannot be undone. Make sure you've sent a test email first.
          </p>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setConfirmSendModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} isLoading={sending}>
            <Send className="w-4 h-4 mr-2" />
            Send Now
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
