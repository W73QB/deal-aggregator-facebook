import React, { useState } from 'react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Simulate API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="page-header">
        <div className="container">
          <h1>📞 Contact Us</h1>
          <p>Get in touch with the DealRadarUS team. We're here to help!</p>
        </div>
      </div>

      <div className="container">
        <div className="contact-layout">
          <div className="contact-info">
            <h2>Get In Touch</h2>
            <p>
              Have a question about a deal? Want to suggest a product for review? 
              Or maybe you're interested in partnering with us? We'd love to hear from you!
            </p>

            <div className="contact-methods">
              <div className="contact-method">
                <h3>📧 Email Us</h3>
                <p>For general inquiries and support</p>
                <a href="mailto:hello@dealradarus.com">hello@dealradarus.com</a>
              </div>

              <div className="contact-method">
                <h3>🤝 Partnership Inquiries</h3>
                <p>For brand partnerships and collaborations</p>
                <a href="mailto:partnerships@dealradarus.com">partnerships@dealradarus.com</a>
              </div>

              <div className="contact-method">
                <h3>🔗 Social Media</h3>
                <p>Follow us for real-time deal updates</p>
                <div className="social-links">
                  <a href="#" aria-label="Twitter">🐦 Twitter</a>
                  <a href="#" aria-label="Facebook">📘 Facebook</a>
                  <a href="#" aria-label="Instagram">📸 Instagram</a>
                </div>
              </div>

              <div className="contact-method">
                <h3>⏰ Response Time</h3>
                <p>We typically respond within 24 hours during business days (Monday-Friday, 9AM-5PM PST)</p>
              </div>
            </div>
          </div>

          <div className="contact-form-section">
            <form className="contact-form" onSubmit={handleSubmit}>
              <h2>Send us a Message</h2>
              
              {submitStatus === 'success' && (
                <div className="success-message">
                  ✅ Thank you for your message! We'll get back to you within 24 hours.
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="error-message">
                  ❌ Something went wrong. Please try again or email us directly.
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your full name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                >
                  <option value="">Please select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="deal-suggestion">Deal Suggestion</option>
                  <option value="product-review">Product Review Request</option>
                  <option value="partnership">Partnership Inquiry</option>
                  <option value="technical-issue">Technical Issue</option>
                  <option value="feedback">Feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Tell us how we can help you..."
                  rows="6"
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? '📤 Sending...' : '📨 Send Message'}
              </button>
            </form>
          </div>
        </div>

        <section className="faq-section">
          <h2>🤔 Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3>How do you find these deals?</h3>
              <p>We use a combination of automated deal-finding tools and manual curation by our team to discover the best deals from hundreds of retailers.</p>
            </div>
            
            <div className="faq-item">
              <h3>Are the deals always current?</h3>
              <p>We update our deals regularly throughout the day, but prices can change quickly. We recommend clicking through to verify the current price before purchasing.</p>
            </div>
            
            <div className="faq-item">
              <h3>Do you make money from affiliate links?</h3>
              <p>Yes, we may earn a commission when you purchase through our links, but this never affects our deal selection or recommendations. We only feature deals we believe offer genuine value.</p>
            </div>
            
            <div className="faq-item">
              <h3>Can I submit a deal I found?</h3>
              <p>Absolutely! We love getting deal tips from our community. Use the contact form above with "Deal Suggestion" as the subject.</p>
            </div>
          </div>
        </section>

        <section className="newsletter-signup">
          <h2>📬 Stay Updated</h2>
          <p>Get the latest deals delivered to your inbox!</p>
          <form className="newsletter-form">
            <input 
              type="email" 
              placeholder="Enter your email address"
              aria-label="Email address for newsletter"
            />
            <button type="submit">Subscribe</button>
          </form>
          <small>Join 25,000+ subscribers • No spam, unsubscribe anytime</small>
        </section>
      </div>
    </div>
  );
};

export default ContactPage;