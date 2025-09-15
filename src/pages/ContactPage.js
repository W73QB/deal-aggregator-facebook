import React, { useState, useEffect } from 'react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState({ message: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ message: 'Sending...', type: 'loading' });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus({ message: 'Thank you! Your message has been sent successfully.', type: 'success' });
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        throw new Error(result.message || 'An unknown error occurred.');
      }
    } catch (error) {
      setStatus({ message: `Failed to send message: ${error.message}`, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-content">
      <div className="container" style={{padding: '4rem 1rem'}}>
        <div className="text-content" style={{maxWidth: '800px', margin: 'auto', textAlign: 'center'}}>
            <h1 style={{fontSize: '2.5rem', marginBottom: '1rem'}}>Contact Us</h1>
            <p style={{fontSize: '1.2rem', color: '#555', marginBottom: '2rem'}}>We'd love to hear from you!</p>
            
            <div style={{textAlign: 'left', background: '#f9f9f9', padding: '2rem', borderRadius: '8px'}}>
                <h2>Get in Touch</h2>
                <p>For partnership inquiries, feedback, or to report an issue with a deal, please email us directly or use the form below.</p>
                <p><strong>Email:</strong> <a href="mailto:deals@dealradarus.com">deals@dealradarus.com</a></p>
                <hr style={{margin: '2rem 0'}} />
                <form id="contact-form" onSubmit={handleSubmit} noValidate>
                    <div style={{marginBottom: '1rem'}}>
                        <label htmlFor="name" style={{display: 'block', marginBottom: '0.5rem'}}>Name *</label>
                        <input type="text" id="name" name="name" required value={formData.name} onChange={handleChange} style={{width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px'}} />
                    </div>
                    <div style={{marginBottom: '1rem'}}>
                        <label htmlFor="email" style={{display: 'block', marginBottom: '0.5rem'}}>Email *</label>
                        <input type="email" id="email" name="email" required value={formData.email} onChange={handleChange} style={{width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px'}} />
                    </div>
                    <div style={{marginBottom: '1rem'}}>
                        <label htmlFor="subject" style={{display: 'block', marginBottom: '0.5rem'}}>Subject</label>
                        <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} style={{width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px'}} />
                    </div>
                    <div style={{marginBottom: '1rem'}}>
                        <label htmlFor="message" style={{display: 'block', marginBottom: '0.5rem'}}>Message *</label>
                        <textarea id="message" name="message" rows="5" required value={formData.message} onChange={handleChange} style={{width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', resize: 'vertical'}}></textarea>
                    </div>
                    <button type="submit" className="cta-button primary" disabled={isSubmitting}>{isSubmitting ? 'Sending...' : 'Send Message'}</button>
                    {status.message && <div className={`form-status ${status.type}`} style={{marginTop: '1rem'}}>{status.message}</div>}
                </form>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
