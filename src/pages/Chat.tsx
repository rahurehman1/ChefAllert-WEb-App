import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Send, AlertCircle, ArrowLeft, Clock, Calendar, User, ChefHat, Paperclip, Smile, Sparkles, Zap, MessageCircle, Shield, MapPin, DollarSign } from 'lucide-react';
import api from '../lib/api';

export function Chat() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const formatPkr = (amount: number) => {
    return 'Rs ' + amount.toLocaleString('en-PK');
  };

  const getUserIdString = () => {
    const anyUser: any = user;
    return (anyUser?.id ?? anyUser?._id ?? '').toString();
  };

  const getSenderIdString = (sender: any) => {
    if (!sender) return '';
    if (typeof sender === 'string' || typeof sender === 'number') return sender.toString();
    return (sender._id ?? sender.id ?? '').toString();
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadChat();
    setTimeout(() => setIsVisible(true), 100);
  }, [bookingId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChat = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('🔍 Loading chat for booking:', bookingId);
      console.log('👤 Current user:', {
        id: user?.id,
        role: user?.role,
        name: user?.full_name
      });
      
      // Load booking details
      const bookingResponse = await api.get(`/api/chat/booking/${bookingId}/details`);
      const bookingData = bookingResponse.data;

      console.log('📋 Booking details response:', bookingData);

      if (!bookingData.success) {
        setError(bookingData.message || 'Failed to load chat');
        return;
      }

      const booking = bookingData.booking;
      
      // Log detailed booking structure
      console.log('📊 Complete booking structure:', {
        booking_id: booking?._id,
        client_id: booking?.client_id,
        'client_id._id': booking?.client_id?._id,
        'client_id.id': booking?.client_id?.id,
        chef_id: booking?.chef_id,
        'chef_id._id': booking?.chef_id?._id,
        'chef_id.id': booking?.chef_id?.id,
        raw_client_id: booking?.client_id,
        raw_chef_id: booking?.chef_id
      });

      // Deep inspect the IDs
      if (booking?.client_id) {
        console.log('👤 Client ID analysis:', {
          type: typeof booking.client_id,
          isObject: typeof booking.client_id === 'object',
          keys: Object.keys(booking.client_id || {}),
          value: booking.client_id
        });
      }

      if (booking?.chef_id) {
        console.log('👨‍🍳 Chef ID analysis:', {
          type: typeof booking.chef_id,
          isObject: typeof booking.chef_id === 'object',
          keys: Object.keys(booking.chef_id || {}),
          value: booking.chef_id
        });
      }

      // Set booking data
      setBooking(booking);

      // Load messages
      const messagesResponse = await api.get(`/api/chat/booking/${bookingId}`);
      if (messagesResponse.data.success) {
        setMessages(messagesResponse.data.messages);
      } else {
        setMessages([]);
      }

      console.log('✅ Chat loaded successfully');

    } catch (err: any) {
      console.error('❌ Error loading chat:', err);
      
      let errorMsg = err.response?.data?.message || 'Error loading chat';
      
      if (err.response?.status === 401) {
        errorMsg = 'Please login to view chat';
      } else if (err.response?.status === 403) {
        errorMsg = 'You are not authorized to view this chat. Only the client and chef for this booking can access it.';
      } else if (err.response?.status === 404) {
        errorMsg = 'Chat not found. The booking may have been cancelled or deleted.';
      } else if (err.code === 'ERR_NETWORK') {
        errorMsg = 'Network error. Please check if server is running on http://localhost:5001';
      } else if (err.code === 'ECONNABORTED') {
        errorMsg = 'Request timeout. Server is taking too long to respond.';
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageInput.trim() || !user || !booking) return;

    setSending(true);
    setError('');

    try {
      // Correctly identify receiver
      const isClient = user.role === 'client';
      
      console.log('🎯 Determining receiver for:', {
        userRole: user.role,
        userId: user.id,
        isClient: isClient
      });

      // Extract receiver ID - handle all possible formats
      let receiverId;
      let receiverDetails = {};

      if (isClient) {
        // User is client, receiver is chef
        console.log('👤 Client sending to chef:', booking.chef_id);
        
        // Try all possible ways to get chef ID
        if (booking.chef_id && typeof booking.chef_id === 'object') {
          receiverId = booking.chef_id._id || booking.chef_id.id;
          receiverDetails = { 
            name: booking.chef_id.full_name,
            type: 'object',
            extractedId: receiverId
          };
        } else if (booking.chef_id) {
          receiverId = booking.chef_id;
          receiverDetails = {
            type: typeof booking.chef_id,
            extractedId: receiverId
          };
        } else if (booking.chefId) {
          receiverId = booking.chefId;
          receiverDetails = {
            type: 'chefId field',
            extractedId: receiverId
          };
        }
      } else {
        // User is chef, receiver is client
        console.log('👨‍🍳 Chef sending to client:', booking.client_id);
        
        // Try all possible ways to get client ID
        if (booking.client_id && typeof booking.client_id === 'object') {
          receiverId = booking.client_id._id || booking.client_id.id;
          receiverDetails = {
            name: booking.client_id.full_name,
            type: 'object',
            extractedId: receiverId
          };
        } else if (booking.client_id) {
          receiverId = booking.client_id;
          receiverDetails = {
            type: typeof booking.client_id,
            extractedId: receiverId
          };
        } else if (booking.clientId) {
          receiverId = booking.clientId;
          receiverDetails = {
            type: 'clientId field',
            extractedId: receiverId
          };
        }
      }

      console.log('🎯 Receiver analysis:', {
        receiverId,
        receiverDetails,
        isValid: !!receiverId
      });

      // Validate receiver_id exists
      if (!receiverId) {
        throw new Error(`Receiver ID not found. Booking data: ${JSON.stringify({
          client_id: booking.client_id,
          chef_id: booking.chef_id,
          clientId: booking.clientId,
          chefId: booking.chefId
        })}`);
      }

      // Ensure sender_id is valid
      const senderId = user.id;
      
      if (!senderId) {
        throw new Error('Sender ID not found');
      }

      console.log('📤 Preparing message with IDs:', {
        booking_id: bookingId,
        sender_id: senderId,
        receiver_id: receiverId,
        sender_type: typeof senderId,
        receiver_type: typeof receiverId,
        sender_name: user.full_name,
        sender_role: user.role
      });

      // Clean and validate IDs
      const cleanReceiverId = String(receiverId).trim();
      const cleanSenderId = String(senderId).trim();

      console.log('🧹 Cleaned IDs:', {
        cleanSenderId,
        cleanReceiverId,
        bookingId
      });

      const messageData = {
        booking_id: bookingId,
        sender_id: cleanSenderId,
        receiver_id: cleanReceiverId,
        message: messageInput.trim()
      };

      console.log('📤 Final message payload:', messageData);
      
      // Send message
      const response = await api.post('/api/chat/messages', messageData);
      
      console.log('✅ Message sent successfully:', response.data);
      
      // Add the new message to the local state
      const newMessage = response.data.data || {
        _id: Date.now().toString(),
        booking_id: bookingId,
        sender_id: { 
          _id: senderId, 
          full_name: user.full_name,
          profile_picture_url: user.profile_picture_url 
        },
        receiver_id: receiverId,
        message: messageInput.trim(),
        created_at: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, newMessage]);
      setMessageInput('');
      
      // Simulate typing indicator
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 1000);

    } catch (err: any) {
      console.error('❌ Error sending message:', err);
      
      let errorMessage = 'Failed to send message. Please try again.';
      
      if (err.response?.data) {
        console.error('❌ Server error response:', err.response.data);
        errorMessage = err.response.data.message || JSON.stringify(err.response.data);
        
        // Try to parse the error for more details
        if (err.response.data.message?.includes('Cast to ObjectId')) {
          errorMessage = 'Invalid user ID format. Please refresh the page and try again.';
        }
      }
      
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return 'Just now';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        return date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        });
      } else {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
      }
    } catch (err) {
      return 'Just now';
    }
  };

  const getOtherUser = () => {
    if (!booking || !user) return null;

    if (user.role === 'client') {
      // User is client, other user is chef
      return {
        name: booking.chef_id?.full_name || 'Chef',
        role: 'chef',
        avatar: booking.chef_id?.profile_picture_url,
        id: booking.chef_id?._id || booking.chef_id
      };
    } else if (user.role === 'chef') {
      // User is chef, other user is client
      return {
        name: booking.client_id?.full_name || 'Client',
        role: 'client',
        avatar: booking.client_id?.profile_picture_url,
        id: booking.client_id?._id || booking.client_id
      };
    }
    
    return null;
  };

  const LoadingSkeleton = () => (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center pt-20">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading conversation...</p>
      </div>
    </div>
  );

  const otherUser = getOtherUser();

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center pt-20">
        <div className="text-center bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20 max-w-md mx-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Chat</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/bookings')}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            Back to Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex flex-col pt-20">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-2xl relative z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/bookings')}
              className="p-3 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-2xl transition-all duration-500 transform hover:scale-110 border border-transparent hover:border-orange-200"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Chat
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-orange-500" />
                Stay connected with your booking details
              </p>
            </div>
          </div>

          {/* Enhanced Booking Info */}
          <div className={`bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-6 text-white shadow-2xl transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  {/* Profile Picture */}
                  {otherUser?.avatar ? (
                    <img
                      src={otherUser.avatar}
                      alt={otherUser.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-white/30 shadow"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${otherUser?.name}&background=${otherUser?.role === 'chef' ? 'orange' : 'blue'}&color=white&size=64`;
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center border-2 border-white/30 shadow">
                      {otherUser?.role === 'chef' ? (
                        <ChefHat className="w-8 h-8 text-white" />
                      ) : (
                        <User className="w-8 h-8 text-white" />
                      )}
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-full p-1 shadow-lg">
                    <Shield className="w-3 h-3" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-1">{otherUser?.name}</h3>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold capitalize border border-white/30">
                      {otherUser?.role}
                    </span>
                    <div className="flex items-center gap-1 text-orange-100">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-sm">Verified</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center lg:text-right">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20">
                  <Calendar className="w-5 h-5 mx-auto lg:mx-0 lg:inline mr-2 text-orange-200" />
                  <span className="font-semibold text-sm lg:text-base">
                    {booking?.booking_date ? 
                      new Date(booking.booking_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      }) : 'N/A'}
                  </span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20">
                  <Clock className="w-5 h-5 mx-auto lg:mx-0 lg:inline mr-2 text-orange-200" />
                  <span className="font-semibold text-sm lg:text-base">
                    {booking?.start_time || 'N/A'} - {booking?.end_time || 'N/A'}
                  </span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20">
                  <DollarSign className="w-5 h-5 mx-auto lg:mx-0 lg:inline mr-2 text-orange-200" />
                  <span className="font-semibold text-sm lg:text-base">
                    {formatPkr(booking?.total_amount || 0)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Additional Booking Details */}
            <div className="mt-4 pt-4 border-t border-orange-400/30">
              <div className="flex flex-wrap items-center gap-4 text-orange-100 text-sm">
                {booking?.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{booking.location}</span>
                  </div>
                )}
                {booking?.cuisine_type && (
                  <div className="flex items-center gap-2">
                    <ChefHat className="w-4 h-4" />
                    <span>{booking.cuisine_type} Cuisine</span>
                  </div>
                )}
                {booking?.number_of_dishes && (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>{booking.number_of_dishes} Dishes</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message Display */}
      {error && booking && (
        <div className="max-w-4xl mx-auto px-4 py-2">
          <div className="bg-red-50/80 backdrop-blur-lg border border-red-200 rounded-xl shadow-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
            <button 
              onClick={() => setError('')}
              className="text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Debug Info (remove in production) */}
      {process.env.NODE_ENV === 'development' && booking && (
        <div className="max-w-4xl mx-auto px-4 py-2">
          <details className="bg-gray-50/50 rounded-lg p-3 text-xs">
            <summary className="cursor-pointer font-mono">Debug Info</summary>
            <pre className="mt-2 p-2 bg-gray-900 text-gray-100 rounded overflow-auto max-h-40">
              {JSON.stringify({
                user: { id: user?.id, role: user?.role },
                bookingId,
                otherUser,
                bookingIds: {
                  client_id: booking.client_id,
                  chef_id: booking.chef_id,
                  clientId: booking.clientId,
                  chefId: booking.chefId
                },
                total_amount_pkr: formatPkr(booking?.total_amount || 0)
              }, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* Messages Area */}
      <div 
        ref={chatContainerRef}
        className={`flex-1 max-w-4xl w-full mx-auto px-4 py-6 overflow-y-auto transition-all duration-1000 delay-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-200 to-red-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <MessageCircle className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No messages yet</h3>
              <p className="text-gray-600 mb-6 text-lg">
                Start the conversation about your upcoming booking!
              </p>
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-4 border border-orange-200">
                <p className="text-sm text-gray-700">
                  <strong>Tip:</strong> Discuss menu details, dietary restrictions, or any special requests for your event.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg: any, index) => {
              const currentUserId = getUserIdString();
              const senderId = getSenderIdString(msg.sender_id);
              const isOwnMessage = !!currentUserId && senderId === currentUserId;

              const prevSenderId = index > 0 ? getSenderIdString(messages[index - 1]?.sender_id) : '';
              const showAvatar = index === 0 || 
                prevSenderId !== senderId;
              const showTime = index === messages.length - 1 || 
                new Date(msg.created_at).getTime() - new Date(messages[index + 1]?.created_at).getTime() > 300000;

              return (
                <div
                  key={msg._id || msg.id || index}
                  className={`flex items-end gap-3 transition-all duration-500 transform hover:scale-105 ${
                    isOwnMessage ? 'justify-end' : 'justify-start'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Other User Avatar */}
                  {!isOwnMessage && showAvatar && (
                    <div className="relative">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg border-2 border-white overflow-hidden bg-gradient-to-br from-orange-500 to-red-500">
                        {msg.sender_id?.profile_picture_url ? (
                          <img
                            src={msg.sender_id.profile_picture_url}
                            alt={msg.sender_id?.full_name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${msg.sender_id?.full_name || otherUser?.name}&background=orange&color=white&size=40`;
                            }}
                          />
                        ) : (
                          <span>{msg.sender_id?.full_name?.charAt(0) || otherUser?.name?.charAt(0) || 'U'}</span>
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`max-w-md transition-all duration-500 ${
                      isOwnMessage ? 'order-1' : 'order-2'
                    }`}
                  >
                    <div
                      className={`px-6 py-4 rounded-3xl shadow-2xl backdrop-blur-sm ${
                        isOwnMessage
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-br-xl'
                          : 'bg-white/90 text-gray-900 border border-white/50 rounded-bl-xl'
                      }`}
                    >
                      <p className="break-words leading-relaxed text-lg">{msg.message}</p>
                    </div>
                    
                    {/* Message Time */}
                    {showTime && (
                      <p
                        className={`text-xs mt-2 px-2 font-medium ${
                          isOwnMessage ? 'text-right text-gray-500' : 'text-gray-400'
                        }`}
                      >
                        {formatTime(msg.created_at)}
                      </p>
                    )}
                  </div>

                  {/* Own Message Avatar */}
                  {isOwnMessage && showAvatar && (
                    <div className="relative">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg border-2 border-white overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600">
                        {user?.profile_picture_url ? (
                          <img
                            src={user.profile_picture_url}
                            alt={user.full_name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${user.full_name}&background=blue&color=white&size=40`;
                            }}
                          />
                        ) : (
                          <span>{user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'Y'}</span>
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Enhanced Typing Indicator */}
            {isTyping && (
              <div className="flex items-end gap-3 animate-fade-in">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg bg-gradient-to-br from-orange-500 to-red-500">
                  {otherUser?.name?.charAt(0) || 'U'}
                </div>
                <div className="bg-white/90 border border-white/50 rounded-3xl rounded-bl-xl px-6 py-4 shadow-2xl backdrop-blur-sm">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Enhanced Message Input */}
      <div className={`bg-white/80 backdrop-blur-lg border-t border-white/20 max-w-4xl w-full mx-auto transition-all duration-1000 delay-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        <div className="px-4 py-6">
          <form onSubmit={sendMessage} className="flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type your message... Discuss menu, timing, or special requests"
                className="w-full px-6 py-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 pr-32 text-lg placeholder-gray-400"
                disabled={sending || !booking}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-2">
                <button
                  type="button"
                  className="p-3 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-2xl transition-all duration-300 transform hover:scale-110"
                  disabled={sending || !booking}
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  className="p-3 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-2xl transition-all duration-300 transform hover:scale-110"
                  disabled={sending || !booking}
                >
                  <Smile className="w-5 h-5" />
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={sending || !messageInput.trim() || !booking}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl font-semibold shadow-2xl hover:shadow-3xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-2xl transition-all duration-300 flex items-center gap-3 group"
            >
              {sending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Send</span>
                  <Zap className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </>
              )}
            </button>
          </form>
          
          {/* Quick Actions */}
          {booking && (
            <div className="flex flex-wrap gap-2 mt-4">
              {[
                "What's the menu looking like?",
                "Any dietary restrictions?",
                "Can we discuss timing?",
                "What should I prepare?"
              ].map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setMessageInput(suggestion)}
                  className="px-4 py-2 bg-gradient-to-r from-orange-50 to-red-50 text-orange-700 rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105 border border-orange-200"
                  disabled={sending}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add custom animations */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}