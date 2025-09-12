#!/usr/bin/env node

/**
 * 📧 Email Service Tester
 * =======================
 * Tests Zoho SMTP connectivity and email sending capability
 */

require('dotenv').config({ path: '.env.dealradarus.local' });
const nodemailer = require('nodemailer');

console.log('📧 Testing Email Service');
console.log('========================\n');

async function testEmailService() {
    console.log('🔧 Creating SMTP transporter...');
    
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    console.log(`📍 Host: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);
    console.log(`👤 User: ${process.env.SMTP_USER}`);
    console.log('🔐 Pass: [REDACTED]\n');

    try {
        console.log('🔍 Verifying SMTP connection...');
        await transporter.verify();
        console.log('✅ SMTP connection verified successfully');

        // Test sending a simple email
        console.log('\n📨 Testing email send capability...');
        const testEmail = {
            from: process.env.FROM_EMAIL,
            to: process.env.SMTP_USER, // Send to self for testing
            subject: '🧪 DealRadarUS Email Test - ' + new Date().toISOString(),
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">🔧 Email Service Test</h2>
                    <p>This is a test email from the DealRadarUS system to verify email functionality.</p>
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3>System Information:</h3>
                        <ul>
                            <li>🕐 Sent at: ${new Date().toLocaleString()}</li>
                            <li>📧 From: ${process.env.FROM_EMAIL}</li>
                            <li>🏢 SMTP: ${process.env.SMTP_HOST}</li>
                            <li>🔧 Test: Production email service verification</li>
                        </ul>
                    </div>
                    <p><strong>✅ If you receive this email, the email service is working correctly!</strong></p>
                    <hr>
                    <small style="color: #666;">
                        DealRadarUS Email Service Test<br>
                        Generated: ${new Date().toISOString()}
                    </small>
                </div>
            `,
            text: `
                DealRadarUS Email Service Test
                
                This is a test email to verify email functionality.
                
                Sent at: ${new Date().toLocaleString()}
                From: ${process.env.FROM_EMAIL}
                SMTP: ${process.env.SMTP_HOST}
                
                If you receive this email, the service is working correctly!
            `
        };

        console.log(`   📤 Sending test email to: ${testEmail.to}`);
        const result = await transporter.sendMail(testEmail);
        
        console.log('✅ Test email sent successfully!');
        console.log(`   📧 Message ID: ${result.messageId}`);
        console.log(`   📨 Response: ${result.response}`);
        
        if (result.accepted && result.accepted.length > 0) {
            console.log(`   ✅ Accepted by: ${result.accepted.join(', ')}`);
        }
        
        if (result.rejected && result.rejected.length > 0) {
            console.log(`   ❌ Rejected by: ${result.rejected.join(', ')}`);
        }

        console.log('\n💡 Check the email inbox to confirm delivery');

    } catch (error) {
        console.log('❌ Email service test failed:');
        console.log(`   Error: ${error.message}`);
        
        if (error.code === 'EAUTH') {
            console.log('   🔐 Authentication failed - check username/password');
        } else if (error.code === 'ENOTFOUND') {
            console.log('   🌐 SMTP server not found - check hostname');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('   🚫 Connection refused - check port and firewall');
        } else if (error.responseCode === 535) {
            console.log('   🔑 Invalid credentials - verify app password');
        }
        
        console.log('\n🔧 Troubleshooting:');
        console.log('   1. Verify Zoho app password is correct');
        console.log('   2. Check if 2FA backup codes are needed');
        console.log('   3. Confirm SMTP settings match Zoho requirements');
    }
}

// Run the test
testEmailService().catch(console.error);