import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createContactRequest } from '../services/contactService';

const useContact = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { currentUser } = useAuth();

  const sendContactRequest = async (propertyId, agentId, message) => {
    if (!currentUser) {
      setError('You must be logged in to send a contact request');
      return false;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await createContactRequest({
        propertyId,
        agentId,
        message: message || undefined
      });
      
      setSuccess(true);
      return true;
    } catch (err) {
      setError(err.message || 'Failed to send contact request');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setError(null);
    setSuccess(false);
  };

  return {
    sendContactRequest,
    loading,
    error,
    success,
    resetState
  };
};

export default useContact;
