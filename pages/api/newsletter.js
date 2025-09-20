export default function handler(req, res) {
  if (req.method === 'POST') {
    const { email } = req.body;

    // Basic email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    // Simulate subscription process
    console.log(`Subscribing email: ${email}`);
    
    // In a real application, you would add the email to your database or mailing list service here.

    // Simulate a delay
    setTimeout(() => {
      res.status(200).json({ message: `Thank you for subscribing, ${email}!` });
    }, 1000);

  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}