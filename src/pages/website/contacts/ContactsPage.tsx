import { useState, useEffect } from 'react';
import { Mail, MessageSquare, Download, Users } from 'lucide-react';
import {
  Button, Badge, Card, CardContent, Select,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Modal, ModalFooter
} from '../../../components/ui';
import { contactsService } from '../../../services';
import type { Contact, Newsletter } from '../../../types';
import { format } from 'date-fns';

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'new', label: 'New' },
  { value: 'read', label: 'Read' },
  { value: 'replied', label: 'Replied' },
  { value: 'closed', label: 'Closed' },
];

const statusVariants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  new: 'danger',
  read: 'info',
  replied: 'success',
  closed: 'default',
};

export default function ContactsPage() {
  const [activeTab, setActiveTab] = useState<'contacts' | 'newsletter'>('contacts');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [subscribers, setSubscribers] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [viewModal, setViewModal] = useState<{ open: boolean; contact: Contact | null }>({
    open: false,
    contact: null,
  });
  const [response, setResponse] = useState('');

  useEffect(() => {
    if (activeTab === 'contacts') {
      fetchContacts();
    } else {
      fetchSubscribers();
    }
  }, [activeTab, statusFilter]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await contactsService.getAll({ status: statusFilter });
      if (res.success && res.data) {
        setContacts(Array.isArray(res.data) ? res.data : []);
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const res = await contactsService.getSubscribers({});
      if (res.success && res.data) {
        setSubscribers(Array.isArray(res.data) ? res.data : []);
      }
    } catch (error) {
      console.error('Failed to fetch subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!viewModal.contact) return;
    try {
      await contactsService.updateStatus(viewModal.contact._id, status, response);
      setViewModal({ open: false, contact: null });
      setResponse('');
      fetchContacts();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleExportSubscribers = async () => {
    try {
      await contactsService.exportSubscribers();
      // Export triggered - browser will handle download
    } catch (error) {
      console.error('Failed to export:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts & Newsletter</h1>
          <p className="text-sm text-gray-500 mt-1">Manage contact submissions and newsletter subscribers</p>
        </div>
        {activeTab === 'newsletter' && (
          <Button variant="outline" onClick={handleExportSubscribers}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('contacts')}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'contacts'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Contact Messages
        </button>
        <button
          onClick={() => setActiveTab('newsletter')}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'newsletter'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users className="w-4 h-4" />
          Newsletter Subscribers
        </button>
      </div>

      {/* Contacts Tab */}
      {activeTab === 'contacts' && (
        <>
          <Card>
            <CardContent className="p-4">
              <div className="w-48">
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={statusOptions}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>From</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">Loading...</TableCell>
                  </TableRow>
                ) : contacts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No contacts found
                    </TableCell>
                  </TableRow>
                ) : (
                  contacts.map((contact) => (
                    <TableRow key={contact._id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{contact.name}</p>
                          <p className="text-xs text-gray-500">{contact.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="line-clamp-1">{contact.subject}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariants[contact.status] || 'default'}>
                          {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {contact.createdAt ? format(new Date(contact.createdAt), 'MMM d, yyyy') : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setViewModal({ open: true, contact });
                              setResponse(contact.response || '');
                            }}
                            className="p-1.5 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </>
      )}

      {/* Newsletter Tab */}
      {activeTab === 'newsletter' && (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Subscribed On</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : subscribers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                    No subscribers found
                  </TableCell>
                </TableRow>
              ) : (
                subscribers.map((sub) => (
                  <TableRow key={sub._id}>
                    <TableCell>
                      <p className="font-medium text-gray-900">{sub.email}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={sub.isSubscribed ? 'success' : 'default'}>
                        {sub.isSubscribed ? 'Active' : 'Unsubscribed'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {sub.subscribedAt ? format(new Date(sub.subscribedAt), 'MMM d, yyyy') : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* View Contact Modal */}
      <Modal
        isOpen={viewModal.open}
        onClose={() => setViewModal({ open: false, contact: null })}
        title="Contact Message"
        size="lg"
      >
        {viewModal.contact && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">From</p>
                <p className="font-medium">{viewModal.contact.name}</p>
                <p className="text-sm text-gray-600">{viewModal.contact.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">
                  {format(new Date(viewModal.contact.createdAt), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500">Subject</p>
              <p className="font-medium">{viewModal.contact.subject}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Message</p>
              <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                {viewModal.contact.message}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Response</label>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Write your response..."
              />
            </div>
          </div>
        )}
        <ModalFooter>
          <Button variant="outline" onClick={() => handleUpdateStatus('read')}>
            Mark as Read
          </Button>
          <Button onClick={() => handleUpdateStatus('replied')}>
            Send & Mark Replied
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
