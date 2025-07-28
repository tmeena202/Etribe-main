import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axiosConfig';

const ContactsContext = createContext();

export const useContacts = () => useContext(ContactsContext);

export const ContactsProvider = ({ children }) => {
  const [contactsData, setContactsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const uid = localStorage.getItem('uid');
      const response = await api.get('/contact', {
        headers: {
          'Client-Service': 'COHAPPRT',
          'Auth-Key': '4F21zrjoAASqz25690Zpqf67UyY',
          'uid': uid,
          'token': token,
          'rurl': 'login.etribes.in',
          'Content-Type': 'application/json',
        },
      });

      let contacts = [];
      if (response.data?.data?.contact && Array.isArray(response.data.data.contact)) {
        contacts = response.data.data.contact;
      } else if (Array.isArray(response.data?.data)) {
        contacts = response.data.data;
      } else if (Array.isArray(response.data)) {
        contacts = response.data;
      } else if (response.data?.data && typeof response.data.data === 'object') {
        contacts = Object.values(response.data.data);
      } else if (response.data?.contacts && Array.isArray(response.data.contacts)) {
        contacts = response.data.contacts;
      } else if (response.data?.contact && Array.isArray(response.data.contact)) {
        contacts = response.data.contact;
      }

      const mappedContacts = contacts.map((contact, index) => ({
        id: contact.id || contact.contact_id || contact.contactId || index + 1,
        dept: contact.department || contact.dept || contact.role || contact.contact_department || 'General',
        name: contact.name || contact.person_name || contact.contact_name || contact.contactName || `Contact ${index + 1}`,
        contact: contact.contact || contact.phone || contact.phone_number || contact.mobile || contact.contact_number || contact.contact_no || '',
        email: contact.email || contact.email_address || contact.contact_email || contact.email_id || '',
        address: contact.address || contact.location || contact.contact_address || contact.address_line || '',
      }));
      setContactsData(mappedContacts);
    } catch (err) {
      setError('Failed to fetch contacts: ' + (err.response?.data?.message || err.message));
      setContactsData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
    // Removed setInterval for auto-refresh
    // Only call fetchContacts after CRUD operations
  }, []);

  const addContact = async (contact) => {
    const token = localStorage.getItem('token');
    const uid = localStorage.getItem('uid');
    try {
      const payload = {
        department: contact.dept,
        name: contact.name,
        contact_no: contact.contact,
        email_id: contact.email,
        address: contact.address,
      };
      const response = await api.post('/contact/add', payload, {
        headers: {
          'Client-Service': 'COHAPPRT',
          'Auth-Key': '4F21zrjoAASqz25690Zpqf67UyY',
          'uid': uid,
          'token': token,
          'rurl': 'login.etribes.in',
          'Content-Type': 'application/json',
        },
      });
      await fetchContacts(); 
      return response.data;
    } catch (err) {
      throw err.response?.data?.message || 'Failed to add contact';
    }
  };

  const editContact = async (contact) => {
    const token = localStorage.getItem('token');
    const uid = localStorage.getItem('uid');
    try {
      const payload = {
        id: contact.id,
        department: contact.dept,
        name: contact.name,
        contact_no: contact.contact,
        email_id: contact.email,
        address: contact.address,
      };
      const response = await api.post('/contact/edit', payload, {
        headers: {
          'Client-Service': 'COHAPPRT',
          'Auth-Key': '4F21zrjoAASqz25690Zpqf67UyY',
          'uid': uid,
          'token': token,
          'rurl': 'login.etribes.in',
          'Content-Type': 'application/json',
        },
      });
      await fetchContacts(); 
      return response.data;
    } catch (err) {
      throw err.response?.data?.message || 'Failed to edit contact';
    }
  };

  const deleteContact = async (contactId) => {
    const token = localStorage.getItem('token');
    const uid = localStorage.getItem('uid');
    try {
      const response = await api.post('/contact/remove', { id: contactId }, {
        headers: {
          'Client-Service': 'COHAPPRT',
          'Auth-Key': '4F21zrjoAASqz25690Zpqf67UyY',
          'uid': uid,
          'token': token,
          'rurl': 'login.etribes.in',
          'Content-Type': 'application/json',
        },
      });
      await fetchContacts(); 
      return response.data;
    } catch (err) {
      throw err.response?.data?.message || 'Failed to delete contact';
    }
  };

  return (
    <ContactsContext.Provider value={{ contactsData, loading, error, addContact, editContact, deleteContact, fetchContacts }}>
      {children}
    </ContactsContext.Provider>
  );
}; 