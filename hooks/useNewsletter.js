/**
 * Newsletter Subscription Hook
 * Reusable newsletter form state management
 */

import { useState, useCallback } from 'react';

export const useNewsletter = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setStatus('success');
      setMessage(data.message || 'Successfully subscribed!');
      setEmail('');
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Something went wrong');
    }
  }, [email]);

  const reset = useCallback(() => {
    setEmail('');
    setStatus('idle');
    setMessage('');
  }, []);

  return {
    email,
    setEmail,
    status,
    message,
    handleSubmit,
    reset,
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isError: status === 'error',
  };
};

export default useNewsletter;
