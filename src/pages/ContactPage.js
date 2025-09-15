import React from 'react';

const ContactPage = () => {
  // Form submission logic is temporarily disabled to ensure site stability.
  // A backend API endpoint needs to be configured and debugged separately.
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Contact form is temporarily disabled. Please email us directly at deals@dealradarus.com');
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
                <form id="contact-form" onSubmit={handleSubmit}>
                    <div style={{marginBottom: '1rem'}}>
                        <label htmlFor="name" style={{display: 'block', marginBottom: '0.5rem'}}>Name *</label>
                        <input type="text" id="name" name="name" required style={{width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px'}} />
                    </div>
                    <div style={{marginBottom: '1rem'}}>
                        <label htmlFor="email" style={{display: 'block', marginBottom: '0.5rem'}}>Email *</label>
                        <input type="email" id="email" name="email" required style={{width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px'}} />
                    </div>
                    <div style={{marginBottom: '1rem'}}>
                        <label htmlFor="subject" style={{display: 'block', marginBottom: '0.5rem'}}>Subject</label>
                        <input type="text" id="subject" name="subject" style={{width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px'}} />
                    </div>
                    <div style={{marginBottom: '1rem'}}>
                        <label htmlFor="message" style={{display: 'block', marginBottom: '0.5rem'}}>Message *</label>
                        <textarea id="message" name="message" rows="5" required style={{width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', resize: 'vertical'}}></textarea>
                    </div>
                    <button type="submit" className="cta-button primary">Send Message</button>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;