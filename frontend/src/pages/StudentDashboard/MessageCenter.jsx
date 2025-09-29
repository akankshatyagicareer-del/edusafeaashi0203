import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { api } from "../../utils/api";
import { Send, Mail, MailOpen, User, ArrowLeft, Clock } from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorDisplay from "../../components/ErrorDisplay";

const MessageCenter = () => {
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState("inbox");
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [conversation, setConversation] = useState([]);

  const [newMessage, setNewMessage] = useState({
    receiverId: "",
    subject: "",
    message: ""
  });

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [receivedRes, sentRes, teachersRes] = await Promise.all([
        api.get('/messages?type=received'),
        api.get('/messages?type=sent'),
        api.get('/users?role=teacher')
      ]);

      setReceivedMessages(receivedRes.data || []);
      setSentMessages(sentRes.data || []);
      setTeachers(teachersRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const fetchConversation = async (teacherId) => {
    try {
      const response = await api.get(`/messages/conversation/${teacherId}`);
      setConversation(response.data || []);
    } catch (err) {
      setError("Failed to load conversation");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      await api.post('/messages', newMessage);
      
      setNewMessage({
        receiverId: "",
        subject: "",
        message: ""
      });
      
      // Refresh data to show the new sent message
      await fetchData();
      setActiveView("sent");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send message");
    }
  };

  const markMessageAsRead = async (messageId) => {
    try {
      await api.put(`/messages/${messageId}/read`);
      // Refresh to update read status
      fetchData();
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const viewConversation = async (teacher) => {
    setSelectedTeacher(teacher);
    await fetchConversation(teacher._id);
    setActiveView("conversation");
  };

  const getUnreadCount = () => receivedMessages.filter(m => !m.isRead).length;

  if (loading) {
    return <LoadingSpinner text="Loading messages..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Message Center</h2>
          <p className="text-gray-600">Communicate with your teachers</p>
        </div>
        <button 
          onClick={() => setActiveView("compose")}
          className="btn btn-primary flex items-center"
        >
          <Send className="h-4 w-4 mr-2" />
          New Message
        </button>
      </div>

      {error && <ErrorDisplay error={error} onRetry={fetchData} />}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: "inbox", label: "Inbox", count: getUnreadCount() },
            { id: "sent", label: "Sent", count: sentMessages.length },
            { id: "compose", label: "Compose", count: 0 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeView === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`px-2 py-1 rounded-full text-xs ${
                  tab.id === "inbox" ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Inbox View */}
      {activeView === "inbox" && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">
            Messages from Teachers {getUnreadCount() > 0 && `(${getUnreadCount()} unread)`}
          </h3>
          <div className="space-y-3">
            {receivedMessages.map((message) => (
              <div 
                key={message._id} 
                className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                  !message.isRead ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => {
                  viewConversation(message.sender);
                  if (!message.isRead) markMessageAsRead(message._id);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {!message.isRead && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <h4 className="font-semibold">
                        {message.sender?.firstName} {message.sender?.lastName}
                      </h4>
                      <p className="text-gray-600">{message.subject}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      {new Date(message.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-400 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {message.isRead ? 'Read' : 'Unread'}
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-gray-700 line-clamp-2">{message.message}</p>
              </div>
            ))}
            
            {receivedMessages.length === 0 && (
              <div className="text-center py-8">
                <Mail className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No messages from teachers yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sent Messages View */}
      {activeView === "sent" && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Sent Messages ({sentMessages.length})</h3>
          <div className="space-y-3">
            {sentMessages.map((message) => (
              <div key={message._id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <h4 className="font-semibold">
                        To: {message.receiver?.firstName} {message.receiver?.lastName}
                      </h4>
                      <p className="text-gray-600">{message.subject}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(message.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <p className="mt-2 text-gray-700">{message.message}</p>
              </div>
            ))}
            
            {sentMessages.length === 0 && (
              <div className="text-center py-8">
                <Send className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No sent messages yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Compose Message View */}
      {activeView === "compose" && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Message a Teacher</h3>
          <form onSubmit={handleSendMessage} className="space-y-4">
            <div>
              <label className="form-label">To (Teacher)</label>
              <select
                value={newMessage.receiverId}
                onChange={(e) => setNewMessage({ ...newMessage, receiverId: e.target.value })}
                className="form-input"
                required
              >
                <option value="">Select a teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher._id} value={teacher._id}>
                    {teacher.firstName} {teacher.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Subject</label>
              <input
                type="text"
                value={newMessage.subject}
                onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                className="form-input"
                placeholder="Enter message subject"
                required
              />
            </div>

            <div>
              <label className="form-label">Message</label>
              <textarea
                value={newMessage.message}
                onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })}
                className="form-input"
                rows="6"
                placeholder="Enter your message"
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setActiveView("inbox")}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary flex items-center">
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Conversation View */}
      {activeView === "conversation" && selectedTeacher && (
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <button 
              onClick={() => setActiveView("inbox")}
              className="btn btn-outline"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Inbox
            </button>
            <h3 className="text-lg font-semibold">
              Conversation with {selectedTeacher.firstName} {selectedTeacher.lastName}
            </h3>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {conversation.map((msg) => (
              <div 
                key={msg._id} 
                className={`p-4 rounded-lg ${
                  msg.sender?._id === user._id 
                    ? 'bg-blue-50 ml-8' 
                    : 'bg-gray-50 mr-8'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold">
                    {msg.sender?._id === user._id ? 'You' : `${msg.sender?.firstName} ${msg.sender?.lastName}`}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(msg.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700">{msg.message}</p>
              </div>
            ))}
            
            {conversation.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No messages in this conversation yet</p>
              </div>
            )}
          </div>

          {/* Quick Reply */}
          <form 
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const message = formData.get('quickReply');
              
              if (message.trim()) {
                try {
                  await api.post('/messages', {
                    receiverId: selectedTeacher._id,
                    subject: `Re: Conversation`,
                    message: message.trim()
                  });
                  e.target.reset();
                  // Refresh conversation and data
                  await Promise.all([
                    fetchConversation(selectedTeacher._id),
                    fetchData()
                  ]);
                } catch (err) {
                  setError("Failed to send message");
                }
              }
            }}
            className="mt-4 flex space-x-2"
          >
            <input
              name="quickReply"
              type="text"
              placeholder="Type a quick reply..."
              className="form-input flex-1"
              required
            />
            <button type="submit" className="btn btn-primary">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default MessageCenter;