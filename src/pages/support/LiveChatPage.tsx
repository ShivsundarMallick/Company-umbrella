import { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageSquare, User, Mail, Globe, UserPlus, Send
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  Button, Card, CardContent, CardHeader, Badge
} from '../../components/ui';
import { chatService } from '../../services';

interface ChatSession {
  _id: string;
  sessionId: string;
  visitorName: string;
  visitorEmail?: string;
  user?: { _id: string; name: string; email: string };
  agent?: { _id: string; name: string };
  status: 'waiting' | 'active' | 'ended';
  currentPage?: string;
  startedAt: string;
  endedAt?: string;
  rating?: number;
  messageCount: number;
}

interface Stats {
  active: number;
  waiting: number;
  today: number;
  total: number;
  avgRating: number;
}

interface ChatMsg {
  _id: string;
  sessionId: string;
  senderId: string;
  senderType: 'visitor' | 'agent' | 'system';
  senderName: string;
  content: string;
  createdAt: string;
}

export default function LiveChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageTimeRef = useRef<string>('');

  useEffect(() => {
    fetchSessions();
    fetchStats();
    // Poll for updates every 10 seconds
    const interval = setInterval(() => {
      fetchSessions();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await chatService.getActiveSessions();
      if (response.success && response.data?.sessions) {
        setSessions(response.data.sessions);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await chatService.getStats();
      if (response.success && response.data?.stats) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  // Poll for messages in selected session
  const fetchMessages = useCallback(async () => {
    if (!selectedSession) return;
    try {
      const after = lastMessageTimeRef.current || undefined;
      const response = await chatService.getMessages(selectedSession.sessionId, after);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msgs = (response as any)?.data?.messages || [];
      if (msgs.length > 0) {
        setChatMessages(prev => {
          const existingIds = new Set(prev.map((m: ChatMsg) => m._id));
          const newMsgs = msgs.filter((m: ChatMsg) => !existingIds.has(m._id));
          return newMsgs.length > 0 ? [...prev, ...newMsgs] : prev;
        });
        lastMessageTimeRef.current = msgs[msgs.length - 1].createdAt;
      }
    } catch {
      // Silently fail polling
    }
  }, [selectedSession]);

  useEffect(() => {
    if (!selectedSession) {
      setChatMessages([]);
      lastMessageTimeRef.current = '';
      return;
    }
    // Initial fetch
    fetchMessages();
    // Poll every 3 seconds
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedSession, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedSession || sendingMessage) return;
    setSendingMessage(true);
    try {
      await chatService.sendMessage(selectedSession.sessionId, messageInput.trim());
      setMessageInput('');
      // Immediately fetch to show our message
      await fetchMessages();
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      await chatService.updateStatus(!isOnline);
      setIsOnline(!isOnline);
      toast.success(isOnline ? 'You are now offline' : 'You are now online');
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleJoinChat = async (session: ChatSession) => {
    try {
      await chatService.assignAgent(session.sessionId);
      toast.success('You joined the chat');
      fetchSessions();
      setSelectedSession(session);
    } catch (error) {
      console.error('Failed to join chat:', error);
      toast.error('Failed to join chat');
    }
  };

  const handleEndChat = async (session: ChatSession) => {
    try {
      await chatService.endSessionAsAgent(session.sessionId);
      toast.success('Chat ended');
      fetchSessions();
      if (selectedSession?.sessionId === session.sessionId) {
        setSelectedSession(null);
      }
    } catch (error) {
      console.error('Failed to end chat:', error);
      toast.error('Failed to end chat');
    }
  };

  const handleConvertToTicket = async (session: ChatSession) => {
    try {
      const response = await chatService.convertToTicket(session.sessionId);
      if (response.success) {
        toast.success('Chat converted to ticket');
        fetchSessions();
      }
    } catch (error) {
      console.error('Failed to convert:', error);
      toast.error('Failed to convert to ticket');
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'warning' | 'success' | 'info'; label: string }> = {
      waiting: { variant: 'warning', label: 'Waiting' },
      active: { variant: 'success', label: 'Active' },
      ended: { variant: 'info', label: 'Ended' },
    };
    const { variant, label } = config[status] || { variant: 'info', label: status };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const waitingSessions = sessions.filter(s => s.status === 'waiting');
  const activeSessions = sessions.filter(s => s.status === 'active');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Chat</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time customer support chat</p>
        </div>
        <Button
          variant={isOnline ? 'danger' : 'primary'}
          onClick={handleToggleStatus}
        >
          <div className={`w-2 h-2 rounded-full mr-2 ${isOnline ? 'bg-white' : 'bg-green-400'}`} />
          {isOnline ? 'Go Offline' : 'Go Online'}
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <Card className={waitingSessions.length > 0 ? 'border-amber-200 bg-amber-50 animate-pulse' : ''}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-amber-600">{stats.waiting}</p>
              <p className="text-xs text-gray-500">Waiting</p>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              <p className="text-xs text-gray-500">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.today}</p>
              <p className="text-xs text-gray-500">Today</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">
                {stats.avgRating ? stats.avgRating.toFixed(1) : '-'}/5
              </p>
              <p className="text-xs text-gray-500">Rating</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <h2 className="text-lg font-semibold">Chat Sessions</h2>
          </CardHeader>
          <CardContent className="p-0 divide-y max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : sessions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No active chat sessions</p>
              </div>
            ) : (
              <>
                {/* Waiting Sessions */}
                {waitingSessions.length > 0 && (
                  <div className="bg-amber-50">
                    <p className="text-xs font-semibold text-amber-800 px-4 py-2">
                      Waiting ({waitingSessions.length})
                    </p>
                    {waitingSessions.map((session) => (
                      <div
                        key={session._id}
                        className="p-4 hover:bg-amber-100 cursor-pointer border-b border-amber-100"
                        onClick={() => setSelectedSession(session)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-amber-700" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{session.visitorName}</p>
                              <p className="text-xs text-gray-500">
                                Started {format(new Date(session.startedAt), 'h:mm a')}
                              </p>
                            </div>
                          </div>
                          <Button size="sm" onClick={(e) => { e.stopPropagation(); handleJoinChat(session); }}>
                            <UserPlus className="w-4 h-4 mr-1" />
                            Join
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Active Sessions */}
                {activeSessions.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 px-4 py-2 bg-gray-50">
                      Active ({activeSessions.length})
                    </p>
                    {activeSessions.map((session) => (
                      <div
                        key={session._id}
                        className={`p-4 hover:bg-gray-50 cursor-pointer ${selectedSession?.sessionId === session.sessionId ? 'bg-primary-50 border-l-4 border-primary-500' : ''}`}
                        onClick={() => setSelectedSession(session)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{session.visitorName}</p>
                              <p className="text-xs text-gray-500">
                                with {session.agent?.name || 'Unassigned'}
                              </p>
                            </div>
                          </div>
                          {getStatusBadge(session.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Chat Window */}
        <Card className="lg:col-span-2">
          {selectedSession ? (
            <>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-semibold">{selectedSession.visitorName}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {selectedSession.visitorEmail && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {selectedSession.visitorEmail}
                          </span>
                        )}
                        {selectedSession.currentPage && (
                          <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {selectedSession.currentPage}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedSession.status === 'active' && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => handleConvertToTicket(selectedSession)}>
                          Convert to Ticket
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleEndChat(selectedSession)}>
                          End Chat
                        </Button>
                      </>
                    )}
                    {selectedSession.status === 'waiting' && (
                      <Button size="sm" onClick={() => handleJoinChat(selectedSession)}>
                        <UserPlus className="w-4 h-4 mr-1" />
                        Join Chat
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-[400px] flex flex-col">
                {/* Chat Messages */}
                <div className="flex-1 bg-gray-50 rounded-lg p-4 overflow-y-auto mb-4">
                  {chatMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">
                          {selectedSession.status === 'waiting'
                            ? 'Join the chat to start messaging'
                            : 'No messages yet'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {chatMessages.map((msg) => (
                        <div
                          key={msg._id}
                          className={`flex ${msg.senderType === 'agent' ? 'justify-end' : msg.senderType === 'system' ? 'justify-center' : 'justify-start'}`}
                        >
                          {msg.senderType === 'system' ? (
                            <div className="text-xs text-gray-400 italic py-1">
                              {msg.content}
                            </div>
                          ) : (
                            <div
                              className={`max-w-[70%] rounded-lg px-3 py-2 ${
                                msg.senderType === 'agent'
                                  ? 'bg-primary-500 text-white'
                                  : 'bg-white border border-gray-200'
                              }`}
                            >
                              <p className={`text-xs font-medium mb-1 ${msg.senderType === 'agent' ? 'text-primary-100' : 'text-gray-500'}`}>
                                {msg.senderName}
                              </p>
                              <p className="text-sm">{msg.content}</p>
                              <p className={`text-[10px] mt-1 ${msg.senderType === 'agent' ? 'text-primary-200' : 'text-gray-400'}`}>
                                {format(new Date(msg.createdAt), 'h:mm a')}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Message Input */}
                {selectedSession.status === 'active' && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      disabled={sendingMessage}
                    />
                    <Button onClick={handleSendMessage} disabled={sendingMessage || !messageInput.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </>
          ) : (
            <CardContent className="h-[500px] flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Select a chat to view</p>
                <p className="text-sm">Click on a chat session from the list</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Info Notice */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Live Chat Support</p>
              <p className="text-sm text-gray-600 mt-1">
                Chat messages are stored in the database and synced via polling between the website support
                widget and this admin interface. If Firebase Realtime Database is configured, messages will
                also be pushed there for real-time delivery.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
