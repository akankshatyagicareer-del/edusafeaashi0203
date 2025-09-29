// src/pages/ParentDashboard/EmergencyContacts.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { api } from "../../utils/api";
import { Phone, Mail, MapPin, Shield, Users, Building } from 'lucide-react';
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorDisplay from "../../components/ErrorDisplay";

const EmergencyContacts = () => {
  const [contacts, setContacts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user?._id) {
      fetchEmergencyContacts();
    }
  }, [user]);

  const fetchEmergencyContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/parents/${user._id}/emergency-contacts`);
      setContacts(response.data);
    } catch (err) {
      console.error('Error fetching emergency contacts:', err);
      setError(err.response?.data?.message || "Failed to load emergency contacts");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading emergency contacts..." />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <ErrorDisplay error={error} onRetry={fetchEmergencyContacts} />
      </div>
    );
  }

  // Government emergency contacts (static data)
  const governmentContacts = [
    {
      name: "Police Emergency",
      phone: "100",
      type: "emergency",
      description: "Local police station emergency line"
    },
    {
      name: "Ambulance / Medical Emergency",
      phone: "108",
      type: "emergency",
      description: "Medical emergency and ambulance service"
    },
    {
      name: "Fire Department",
      phone: "101",
      type: "emergency",
      description: "Fire emergency services"
    },
    {
      name: "Women's Helpline",
      phone: "1091",
      type: "support",
      description: "Women's safety and support"
    },
    {
      name: "Child Helpline",
      phone: "1098",
      type: "support",
      description: "Child protection and support"
    },
    {
      name: "Disaster Management",
      phone: "1070",
      type: "emergency",
      description: "Natural disaster emergency"
    }
  ];

  const ContactCard = ({ contact, icon: Icon, bgColor, borderColor }) => (
    <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${borderColor} hover:shadow-lg transition-shadow`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">{contact.name}</h3>
          <p className="text-sm text-gray-600">{contact.role || contact.description}</p>
        </div>
        <div className={`p-3 rounded-full ${bgColor}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      
      <div className="space-y-2">
        {contact.phone && contact.phone !== "Not provided" ? (
          <div className="flex items-center text-gray-700">
            <Phone className="h-4 w-4 mr-2 text-blue-600" />
            <a href={`tel:${contact.phone}`} className="hover:text-blue-600">
              {contact.phone}
            </a>
          </div>
        ) : (
          <div className="flex items-center text-gray-500">
            <Phone className="h-4 w-4 mr-2" />
            <span className="text-sm">Phone not available</span>
          </div>
        )}
        
        {contact.email && (
          <div className="flex items-center text-gray-700">
            <Mail className="h-4 w-4 mr-2 text-green-600" />
            <a href={`mailto:${contact.email}`} className="hover:text-green-600">
              {contact.email}
            </a>
          </div>
        )}
        
        {contact.address && (
          <div className="flex items-center text-gray-700">
            <MapPin className="h-4 w-4 mr-2 text-red-600" />
            <span>{contact.address}</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800">Emergency Contacts</h2>
        <p className="text-gray-600">Important contacts for emergencies and support</p>
      </div>

      {/* School Contacts Section */}
      <section>
        <div className="flex items-center mb-6">
          <Building className="h-6 w-6 text-blue-600 mr-2" />
          <h3 className="text-xl font-bold text-gray-800">School Contacts</h3>
        </div>
        
        {contacts?.schoolInfo ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* School Information */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <div className="flex items-center mb-4">
                <Building className="h-5 w-5 text-blue-600 mr-2" />
                <h4 className="font-bold text-blue-800">School Information</h4>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-blue-900">{contacts.schoolInfo.name}</p>
                {contacts.schoolInfo.contactEmail && (
                  <p className="text-sm text-blue-700">
                    <Mail className="h-3 w-3 inline mr-1" />
                    {contacts.schoolInfo.contactEmail}
                  </p>
                )}
                {contacts.schoolInfo.contactPhone && (
                  <p className="text-sm text-blue-700">
                    <Phone className="h-3 w-3 inline mr-1" />
                    {contacts.schoolInfo.contactPhone}
                  </p>
                )}
                {contacts.schoolInfo.address && (
                  <p className="text-sm text-blue-700">
                    <MapPin className="h-3 w-3 inline mr-1" />
                    {contacts.schoolInfo.address}
                  </p>
                )}
              </div>
            </div>

            {/* Teacher Contact */}
            {contacts.teacher && (
              <ContactCard
                contact={{
                  name: contacts.teacher.firstName + ' ' + contacts.teacher.lastName,
                  role: "Class Teacher",
                  phone: contacts.teacher.phone,
                  email: contacts.teacher.email
                }}
                icon={Users}
                bgColor="bg-green-500"
                borderColor="border-l-green-500"
              />
            )}

            {/* Director Contact */}
            {contacts.director && (
              <ContactCard
                contact={{
                  name: contacts.director.firstName + ' ' + contacts.director.lastName,
                  role: "School Director",
                  phone: contacts.director.phone,
                  email: contacts.director.email
                }}
                icon={Shield}
                bgColor="bg-purple-500"
                borderColor="border-l-purple-500"
              />
            )}
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <Users className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
            <h4 className="text-lg font-semibold text-yellow-800 mb-2">School Information Not Available</h4>
            <p className="text-yellow-700">School contact details will be provided by the administration.</p>
          </div>
        )}
      </section>

      {/* Government Emergency Contacts */}
      <section>
        <div className="flex items-center mb-6">
          <Shield className="h-6 w-6 text-red-600 mr-2" />
          <h3 className="text-xl font-bold text-gray-800">Government Emergency Contacts</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {governmentContacts.map((contact, index) => (
            <ContactCard
              key={index}
              contact={contact}
              icon={Shield}
              bgColor={contact.type === 'emergency' ? 'bg-red-500' : 'bg-orange-500'}
              borderColor={contact.type === 'emergency' ? 'border-l-red-500' : 'border-l-orange-500'}
            />
          ))}
        </div>
      </section>

      {/* Tenant Emergency Contacts */}
      {contacts?.emergencyContacts && contacts.emergencyContacts.length > 0 && (
        <section>
          <div className="flex items-center mb-6">
            <Users className="h-6 w-6 text-purple-600 mr-2" />
            <h3 className="text-xl font-bold text-gray-800">School Emergency Contacts</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contacts.emergencyContacts.map((contact, index) => (
              <ContactCard
                key={index}
                contact={{
                  name: contact.name,
                  role: contact.role,
                  phone: contact.phone,
                  description: `School ${contact.role}`
                }}
                icon={Users}
                bgColor="bg-purple-500"
                borderColor="border-l-purple-500"
              />
            ))}
          </div>
        </section>
      )}

      {/* Important Notes */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-bold text-blue-800 mb-3">Important Safety Notes</h4>
        <ul className="text-blue-700 space-y-2 text-sm">
          <li>• Save these numbers in your phone for quick access during emergencies</li>
          <li>• Teach your child how to contact these numbers in case of emergency</li>
          <li>• Always verify the identity of school staff before sharing sensitive information</li>
          <li>• Report any safety concerns immediately to school authorities</li>
          <li>• Keep your contact information updated with the school administration</li>
        </ul>
      </div>
    </div>
  );
};

export default EmergencyContacts;