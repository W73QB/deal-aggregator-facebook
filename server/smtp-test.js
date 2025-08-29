/**
 * SMTP Test Script - DealRadarUS
 * Tests Zoho SMTP configuration with detailed logging
 */

const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.dealradarus.local' });

async function testSMTPConnection() {
  console.log('📧 DealRadarUS SMTP Test');
  console.log('========================\n');

  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  // Load SMTP configuration
  const smtpConfig = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  };

  const fromEmail = process.env.FROM_EMAIL;

  console.log('🔧 SMTP Configuration:');
  console.log('======================');
  console.log(`Host: ${smtpConfig.host}`);
  console.log(`Port: ${smtpConfig.port}`);
  console.log(`User: ${smtpConfig.auth.user}`);
  console.log(`From: ${fromEmail}`);
  console.log(`Secure: ${smtpConfig.secure}`);
  console.log('');

  let testResults = {
    timestamp: timestamp,
    smtp_config: {
      host: smtpConfig.host,
      port: smtpConfig.port,
      user: smtpConfig.auth.user,
      from_email: fromEmail,
      secure: smtpConfig.secure
    },
    connection_test: {},
    email_send_test: {},
    overall_status: 'PENDING'
  };

  try {
    // Create transporter
    console.log('🔄 Creating SMTP transporter...');
    const transporter = nodemailer.createTransport(smtpConfig);

    // Test connection
    console.log('🔍 Testing SMTP connection...');
    const connectionStartTime = Date.now();
    
    await transporter.verify();
    const connectionEndTime = Date.now();
    const connectionTime = connectionEndTime - connectionStartTime;

    console.log(`✅ SMTP connection successful (${connectionTime}ms)`);
    
    testResults.connection_test = {
      status: 'SUCCESS',
      response_time_ms: connectionTime,
      timestamp: new Date().toISOString()
    };

    // Send test email
    console.log('\n📤 Sending test email...');
    const emailStartTime = Date.now();

    const mailOptions = {
      from: fromEmail,
      to: 'deals@dealradarus.com',
      subject: '[SMTP TEST] DealRadarUS',
      text: 'SMTP configuration check successful',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">🎉 SMTP Test Successful</h2>
          <p>This email confirms that the SMTP configuration for <strong>DealRadarUS</strong> is working correctly.</p>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">📋 Test Details:</h3>
            <ul>
              <li><strong>Timestamp:</strong> ${timestamp}</li>
              <li><strong>SMTP Host:</strong> ${smtpConfig.host}</li>
              <li><strong>From Email:</strong> ${fromEmail}</li>
              <li><strong>Test Status:</strong> ✅ SUCCESS</li>
            </ul>
          </div>
          
          <p style="color: #7f8c8d; font-size: 12px;">
            This is an automated test email from DealRadarUS email standardization system.
          </p>
        </div>
      `
    };

    const emailResult = await transporter.sendMail(mailOptions);
    const emailEndTime = Date.now();
    const emailTime = emailEndTime - emailStartTime;

    console.log(`✅ Email sent successfully (${emailTime}ms)`);
    console.log(`📨 Message ID: ${emailResult.messageId}`);
    console.log(`🔗 Preview URL: ${nodemailer.getTestMessageUrl(emailResult) || 'N/A'}`);

    testResults.email_send_test = {
      status: 'SUCCESS',
      message_id: emailResult.messageId,
      response_time_ms: emailTime,
      recipient: 'deals@dealradarus.com',
      subject: '[SMTP TEST] DealRadarUS',
      preview_url: nodemailer.getTestMessageUrl(emailResult) || null,
      timestamp: new Date().toISOString()
    };

    testResults.overall_status = 'SUCCESS';

  } catch (error) {
    console.error('❌ SMTP test failed:', error.message);
    
    const errorDetails = {
      status: 'FAILED',
      error_message: error.message,
      error_code: error.code || 'UNKNOWN',
      error_command: error.command || 'UNKNOWN',
      timestamp: new Date().toISOString()
    };

    if (!testResults.connection_test.status) {
      testResults.connection_test = errorDetails;
    } else {
      testResults.email_send_test = errorDetails;
    }

    testResults.overall_status = 'FAILED';
  }

  const totalTime = Date.now() - startTime;
  testResults.total_test_time_ms = totalTime;

  console.log('\n📊 Test Summary:');
  console.log('================');
  console.log(`Overall Status: ${testResults.overall_status}`);
  console.log(`Total Time: ${totalTime}ms`);
  console.log(`Connection: ${testResults.connection_test.status || 'NOT_TESTED'}`);
  console.log(`Email Send: ${testResults.email_send_test.status || 'NOT_TESTED'}`);

  return testResults;
}

// Execute SMTP test
if (require.main === module) {
  testSMTPConnection()
    .then(results => {
      console.log('\n🎉 SMTP test completed!');
      console.log('\n📋 Full Results:');
      console.log(JSON.stringify(results, null, 2));
    })
    .catch(error => {
      console.error('\n💥 SMTP test failed:', error.message);
      process.exit(1);
    });
}

module.exports = { testSMTPConnection };