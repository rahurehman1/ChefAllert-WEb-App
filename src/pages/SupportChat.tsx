import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, CheckCircle, MessageCircle, Send } from 'lucide-react';
import { Avatar } from '../components/Avatar';

export function SupportChat() {
  const navigate = useNavigate();
  const { requestId } = useParams<{ requestId: string }>();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [thread, setThread] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const meId = useMemo(() => {
    const anyUser: any = user;
    return (anyUser?.id ?? anyUser?._id ?? '').toString();
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!requestId) {
      navigate('/');
      return;
    }
    loadThread();
  }, [user, requestId]);

  const loadThread = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const threadRes = await api.get(`/api/support/threads/by-request/${requestId}`);
      setThread(threadRes.data.thread);

      const msgRes = await api.get(`/api/support/threads/${threadRes.data.thread._id}/messages`);
      setMessages(msgRes.data.messages || []);
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Failed to load support chat');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !thread?._id) return;

    try {
      setSending(true);
      setError('');
      const res = await api.post(`/api/support/threads/${thread._id}/messages`, { message: message.trim() });
      if (res.data?.success) {
        setMessages(prev => [...prev, res.data.message]);
        setMessage('');
      }
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 pt-24 pb-10 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 pt-24 pb-10">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="p-6 border-b border-gray-200/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-gray-900">Subscription Support Chat</h1>
                <p className="text-xs text-gray-600">Request ID: {requestId}</p>
                {thread?.request_id?.plan_code && (
                  <div className="mt-1">
                    <span className="text-xs font-semibold text-orange-600">
                      {thread.request_id.plan_code === 'pro_monthly' ? 'Monthly - Rs 1,500' : thread.request_id.plan_code === 'pro_yearly' ? 'Yearly - Rs 10,000' : ''}
                    </span>
                    {thread?.request_id?.admin_payment_method && (
                      <span className="text-xs font-semibold text-gray-500 ml-2">
                        ({thread.request_id.admin_payment_method === 'easypaisa'
                          ? 'EasyPaisa'
                          : thread.request_id.admin_payment_method === 'jazzcash'
                          ? 'JazzCash'
                          : thread.request_id.admin_payment_method === 'bank'
                          ? 'Bank'
                          : thread.request_id.admin_payment_method === 'other'
                          ? 'Other'
                          : thread.request_id.admin_payment_method})
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-xl bg-white/70 border border-gray-200 text-gray-700 font-semibold hover:shadow transition"
            >
              Back
            </button>
          </div>

          {error && (
            <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-red-800">Error</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="m-6 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-green-800">Success</p>
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            </div>
          )}

          <div className="p-6 space-y-4 max-h-[60vh] overflow-auto">
            {messages.length === 0 ? (
              <div className="text-center py-10 text-gray-600">
                No messages yet. Start the conversation.
              </div>
            ) : (
              messages.map((m) => {
                const senderId = (m.sender_id?._id || m.sender_id?.id || m.sender_id || '').toString();
                const isMine = senderId === meId;
                const sender = m.sender_id || {};
                return (
                  <div key={m._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] flex gap-3 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                      <Avatar
                        src={sender.profile_picture_url}
                        alt={sender.full_name}
                        role={sender.role}
                        size="sm"
                        className="shadow border border-white"
                      />
                      <div className={`px-4 py-3 rounded-2xl shadow ${
                        isMine
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                          : 'bg-white text-gray-800 border border-gray-200'
                      }`}>
                        <p className={`text-xs font-bold mb-1 ${isMine ? 'text-white/90' : 'text-gray-700'}`}>
                          {sender.full_name || (isMine ? 'You' : 'Support')}
                        </p>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.message}</p>
                        <p className={`text-[10px] mt-2 ${isMine ? 'text-white/80' : 'text-gray-400'}`}>
                          {m.createdAt ? new Date(m.createdAt).toLocaleString() : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-6 border-t border-gray-200/50">
            <form onSubmit={handleSend} className="flex gap-3">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write a message..."
                className="flex-1 px-4 py-3 bg-white/70 border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <button
                type="submit"
                disabled={sending || !message.trim()}
                className="px-5 py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {sending ? 'Sending...' : (
                  <span className="inline-flex items-center gap-2"><Send className="w-4 h-4" />Send</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
