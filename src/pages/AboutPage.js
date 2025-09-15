import React from 'react';

const AboutPage = () => {
  return (
    <div className="page-content">
      <div className="container" style={{padding: '4rem 1rem'}}>
        <div className="text-content" style={{maxWidth: '800px', margin: 'auto', textAlign: 'center'}}>
            <h1 style={{fontSize: '2.5rem', marginBottom: '1rem'}}>About DealRadarUS</h1>
            <p style={{fontSize: '1.2rem', color: '#555', marginBottom: '2rem'}}>Your Trusted Source for Tech Deals.</p>
            
            <div style={{textAlign: 'left'}}>
                <h2>Our Mission</h2>
                <p>In a world flooded with endless products and fluctuating prices, finding a genuine deal can be overwhelming. Our mission at DealRadarUS is simple: to scan the digital marketplace with precision and bring you only the best, most valuable deals on refurbished and open-box technology. We believe that everyone deserves access to quality tech without paying premium prices.</p>

                <h2>What We Do</h2>
                <p>Our team, a mix of tech enthusiasts and savvy shoppers, works tirelessly to analyze hundreds of deals every day. We cut through the noise, filtering out the duds and highlighting the gems. From powerful laptops for professionals to smart home devices that simplify your life, we put every deal under the microscope to ensure it offers real value and quality.</p>

                <h2>Our Team</h2>
                <p>DealRadarUS was founded by a small group of friends who were passionate about technology and frustrated with the hunt for good deals. Today, our team has grown to include experienced developers, writers, and deal hunters dedicated to making tech more accessible for everyone. Our diverse backgrounds in technology, e-commerce, and consumer advocacy help us provide comprehensive deal analysis and recommendations.</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
