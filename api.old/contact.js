import nodemailer from 'nodemailer';

// Basic input validation
function validateInput(data) {
  if (!data.name || data.name.trim().length < 2) return 'Name is too short.';
  if (!data.email || !/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(data.email)) return 'Please enter a valid email address.';
  if (!data.message || data.message.trim().length < 10) return 'Message must be at least 10 characters long.';
  if (data.message.length > 2000) return 'Message cannot exceed 2000 characters.';
  return null; // All good
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const validationError = validateInput(req.body);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  // Nodemailer transporter setup
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: parseInt(process.env.SMTP_PORT || '587', 10) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const { name, email, subject, message } = req.body;

  const mailOptions = {
    from: `"${name}" <${process.env.FROM_EMAIL}>`,
    to: process.env.SMTP_USER,
    replyTo: email,
    subject: `New Contact Form Submission: ${subject || 'No Subject'}`,
    text: message,
    html: `<b>From:</b> ${name} &lt;${email}&gt;<br/><br/><b>Message:</b><br/><p>${message}</p>`,
  };

  try {
    await transporter.verify();
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: 'Message sent successfully!' });
  } catch (error) {
    console.error('[CONTACT_API_ERROR]', error);
    return res.status(500).json({ message: 'Failed to send message. Please try again later.' });
  }
}