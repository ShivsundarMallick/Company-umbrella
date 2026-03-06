import { useState, useEffect } from 'react';
import { Mail, MailOpen, Trash2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  Button, Badge, Card, CardContent,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Modal, ModalFooter
} from '../../../components/ui';
import { contactsService } from '../../../services';
import { format } from 'date-fns';

interface Contact {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status?: string;
  createdAt: string;
}

export default function UnreadContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; contact: Contact | null }>({
    open: false,
    contact: null,
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await contactsService.getAll({ limit: 50 });
      if (response.success && response.data) {
        const data = Array.isArray(response.data) ? response.data : [];
        // Filter for new/unread contacts (status is 'new' or undefined)
        setContacts(data.filter((c: Contact) => !c.status || c.status === 'new'));
      }
    } catch (error) {
      console.error('Failed to fetch unread contacts:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (contact: Contact) => {
    try {
      await contactsService.updateStatus(contact._id, 'read');
      toast.success('Marked as read');
      fetchContacts();
      if (selectedContact?._id === contact._id) {
        setSelectedContact(null);
      }
    } catch {
      toast.error('Failed to update message');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.contact) return;
    try {
      await contactsService.delete(deleteModal.contact._id);
      toast.success('Message deleted');
      setDeleteModal({ open: false, contact: null });
      fetchContacts();
    } catch {
      toast.error('Failed to delete message');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Unread Messages</h1>
        <p className="text-gray-600">View and respond to unread contact messages</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              {loading ? (
                <div className="text-center py-12">Loading...</div>
              ) : contacts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>From</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contacts.map((contact) => (
                      <TableRow
                        key={contact._id}
                        className={`cursor-pointer ${selectedContact?._id === contact._id ? 'bg-primary-50' : ''}`}
                        onClick={() => setSelectedContact(contact)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Mail className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{contact.name}</p>
                              <p className="text-sm text-gray-500">{contact.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-gray-900 font-medium">{contact.subject}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="w-3 h-3" />
                            {format(new Date(contact.createdAt), 'MMM d, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(contact);
                              }}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              title="Mark as Read"
                            >
                              <MailOpen className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteModal({ open: true, contact });
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No unread messages
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              {selectedContact ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Message Details</h3>
                    <Badge variant="warning">Unread</Badge>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">From</p>
                      <p className="font-medium">{selectedContact.name}</p>
                      <p className="text-sm text-gray-600">{selectedContact.email}</p>
                      {selectedContact.phone && (
                        <p className="text-sm text-gray-600">{selectedContact.phone}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Subject</p>
                      <p className="font-medium">{selectedContact.subject}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Message</p>
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedContact.message}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Received</p>
                      <p className="text-gray-700">
                        {format(new Date(selectedContact.createdAt), 'MMMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <Button
                      className="w-full"
                      onClick={() => handleMarkAsRead(selectedContact)}
                    >
                      <MailOpen className="w-4 h-4 mr-2" />
                      Mark as Read
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Select a message to view details
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, contact: null })}
        title="Delete Message"
      >
        <p className="text-gray-600">Are you sure you want to delete this message? This action cannot be undone.</p>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setDeleteModal({ open: false, contact: null })}>
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
