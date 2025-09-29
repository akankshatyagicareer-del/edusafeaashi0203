import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { api } from '../../utils/api';
import { Phone, AlertTriangle, Mail, MapPin, User, Shield } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorDisplay from '../../components/ErrorDisplay';

const EmergencyContacts = () => {
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      fetchEmergencyContacts();
    }
  }, [user]);

  const fetchEmergencyContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/students/${user._id}/emergency-contacts`);
      setEmergencyContacts(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load emergency contacts');
    } finally {
      setLoading(false);
    }
  };

  const sendEmergencyAlert = async () => {
    const message = prompt('Enter emergency message for teachers and director:');
    if (message) {
      try {
        setError(null);
        await api.post('/alerts', {
          message,
          targetRoles: ['teacher', 'director'],
          emergencyLevel: 'high',
          sender: user._id
        });
        alert('🚨 Emergency alert sent successfully! Help is on the way.');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to send emergency alert');
      }
    }
  };

  const callContact = (phoneNumber) => {
    if (phoneNumber) {
      window.open(`tel:${phoneNumber}`, '_blank');
    }
  };

  const emailContact = (email) => {
    if (email) {
      window.open(`mailto:${email}`, '_blank');
    }
  };

  const getContactIcon = (role) => {
    switch (role.toLowerCase()) {
      case 'teacher':
        return <User className="h-5 w-5" />;
      case 'director':
        return <Shield className="h-5 w-5" />;
      case 'security':
        return <Shield className="h-5 w-5" />;
      case 'medical':
        return <Shield className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading emergency contacts..." />;
  }

  const priorityContacts = emergencyContacts.filter(contact => 
    ['security', 'medical', 'director'].includes(contact.role?.toLowerCase())
  );
  const otherContacts = emergencyContacts.filter(contact => 
    !['security', 'medical', 'director'].includes(contact.role?.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Emergency Contacts</h2>
          <p className="text-gray-600">Important contacts for emergency situations</p>
        </div>
        <button
          onClick={sendEmergencyAlert}
          className="btn btn-danger flex items-center"
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          Emergency Alert
        </button>
      </div>

      {error && <ErrorDisplay error={error} onRetry={fetchEmergencyContacts} />}

      {/* Emergency Alert Banner */}
      <div className="card bg-red-50 border-red-200">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-800 mb-2">Emergency Procedures</h3>
            <ul className="text-red-700 text-sm space-y-1">
              <li>• <strong>Stay calm</strong> and assess the situation</li>
              <li>• <strong>Call for help</strong> using the emergency alert button or contact numbers below</li>
              <li>• <strong>Follow instructions</strong> from teachers and emergency personnel</li>
              <li>• <strong>Move to safe areas</strong> as practiced in drills</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Priority Contacts */}
      {priorityContacts.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-6">Priority Emergency Contacts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {priorityContacts.map((contact, index) => (
              <div key={index} className="border-2 border-red-200 rounded-lg p-4 text-center bg-red-50">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  {getContactIcon(contact.role)}
                </div>
                <h4 className="font-semibold text-lg mb-1">{contact.name}</h4>
                <p className="text-red-700 text-sm mb-3 capitalize">{contact.role}</p>
                
                {contact.phone && (
                  <button
                    onClick={() => callContact(contact.phone)}
                    className="btn btn-danger w-full mb-2 flex items-center justify-center"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call {contact.phone}
                  </button>
                )}
                
                {contact.email && (
                  <button
                    onClick={() => emailContact(contact.email)}
                    className="btn btn-outline w-full text-sm flex items-center justify-center"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </button>
                )}
                
                {contact.location && (
                  <div className="flex items-center justify-center text-sm text-gray-600 mt-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {contact.location}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other Contacts */}
      {otherContacts.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-6">Other Contacts ({otherContacts.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherContacts.map((contact, index) => (
              <div key={index} className="border rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  {getContactIcon(contact.role)}
                </div>
                <h4 className="font-semibold mb-1">{contact.name}</h4>
                <p className="text-gray-600 text-sm mb-3 capitalize">{contact.role}</p>
                
                <div className="space-y-2">
                  {contact.phone && (
                    <button
                      onClick={() => callContact(contact.phone)}
                      className="btn btn-outline w-full text-sm flex items-center justify-center"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </button>
                  )}
                  
                  {contact.email && (
                    <button
                      onClick={() => emailContact(contact.email)}
                      className="btn btn-outline w-full text-sm flex items-center justify-center"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Contacts Message */}
      {emergencyContacts.length === 0 && (
        <div className="card text-center py-12">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No emergency contacts available</p>
          <p className="text-sm text-gray-400 mt-1">Contact your school administrator to set up emergency contacts</p>
        </div>
      )}

      {/* Emergency Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Important Numbers</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
              <span className="font-medium">Police</span>
              <button onClick={() => callContact('911')} className="btn btn-outline text-sm">
                <Phone className="h-4 w-4 mr-1" />
                911
              </button>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
              <span className="font-medium">Fire Department</span>
              <button onClick={() => callContact('911')} className="btn btn-outline text-sm">
                <Phone className="h-4 w-4 mr-1" />
                911
              </button>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
              <span className="font-medium">Ambulance</span>
              <button onClick={() => callContact('911')} className="btn btn-outline text-sm">
                <Phone className="h-4 w-4 mr-1" />
                911
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">School Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Your Name:</span>
              <span className="font-medium">{user?.firstName} {user?.lastName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Grade/Class:</span>
              <span className="font-medium">{user?.grade || 'Not specified'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Emergency Status:</span>
              <span className="font-medium text-green-600">All contacts updated</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyContacts;