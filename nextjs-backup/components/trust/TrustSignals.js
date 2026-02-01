/**
 * Trust Signals Component
 * Displays credibility indicators and social proof elements
 */

import React from 'react';

const TrustSignals = ({ variant = 'header', showAll = false }) => {
  const trustIndicators = [
    {
      icon: '🛡️',
      title: 'Verified Deals',
      description: 'All deals verified within 24 hours',
      stat: '99.8%',
      metric: 'accuracy rate'
    },
    {
      icon: '⭐',
      title: 'Trusted by Users',
      description: '4.8/5 rating from satisfied customers',
      stat: '4.8',
      metric: 'user rating'
    },
    {
      icon: '👥',
      title: 'Active Community',
      description: 'Join thousands of smart shoppers',
      stat: '25K+',
      metric: 'members'
    },
    {
      icon: '💰',
      title: 'Money Saved',
      description: 'Total savings by our community',
      stat: '$2.3M',
      metric: 'saved'
    },
    {
      icon: '🔒',
      title: 'Secure Platform',
      description: 'SSL encrypted and privacy protected',
      stat: '100%',
      metric: 'secure'
    },
    {
      icon: '🚀',
      title: 'Fast Updates',
      description: 'Real-time price tracking',
      stat: '<5min',
      metric: 'update time'
    }
  ];

  if (variant === 'compact') {
    return (
      <div className="trust-signals compact">
        <div className="trust-compact-list">
          <div className="trust-item">
            <span className="trust-icon">🛡️</span>
            <span className="trust-text">99.8% Verified</span>
          </div>
          <div className="trust-item">
            <span className="trust-icon">⭐</span>
            <span className="trust-text">4.8/5 Rating</span>
          </div>
          <div className="trust-item">
            <span className="trust-icon">👥</span>
            <span className="trust-text">25K+ Users</span>
          </div>
          <div className="trust-item">
            <span className="trust-icon">🔒</span>
            <span className="trust-text">100% Secure</span>
          </div>
        </div>

        <style jsx>{`
          .trust-signals.compact {
            padding: 8px 0;
            border-top: 1px solid #e1e5e9;
            border-bottom: 1px solid #e1e5e9;
            background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
          }

          .trust-compact-list {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 24px;
            flex-wrap: wrap;
          }

          .trust-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
            color: #495057;
            font-weight: 500;
          }

          .trust-icon {
            font-size: 14px;
          }

          @media (max-width: 768px) {
            .trust-compact-list {
              gap: 16px;
            }

            .trust-item {
              font-size: 12px;
            }
          }
        `}</style>
      </div>
    );
  }

  const displayItems = showAll ? trustIndicators : trustIndicators.slice(0, 4);

  return (
    <div className="trust-signals">
      <div className="trust-header">
        <h3>Why Trust DealRadarUS?</h3>
        <p>Join thousands of satisfied customers who save money daily</p>
      </div>

      <div className="trust-grid">
        {displayItems.map((indicator, index) => (
          <div key={index} className="trust-card">
            <div className="trust-card-header">
              <span className="trust-card-icon">{indicator.icon}</span>
              <div className="trust-card-stat">
                <span className="stat-number">{indicator.stat}</span>
                <span className="stat-metric">{indicator.metric}</span>
              </div>
            </div>
            <div className="trust-card-content">
              <h4>{indicator.title}</h4>
              <p>{indicator.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Security Badges */}
      <div className="security-badges">
        <div className="badge ssl-badge">
          <span className="badge-icon">🔒</span>
          <div className="badge-text">
            <span className="badge-title">SSL Secured</span>
            <span className="badge-subtitle">256-bit encryption</span>
          </div>
        </div>
        <div className="badge privacy-badge">
          <span className="badge-icon">🛡️</span>
          <div className="badge-text">
            <span className="badge-title">Privacy Protected</span>
            <span className="badge-subtitle">GDPR compliant</span>
          </div>
        </div>
        <div className="badge verified-badge">
          <span className="badge-icon">✅</span>
          <div className="badge-text">
            <span className="badge-title">Verified Deals</span>
            <span className="badge-subtitle">Updated daily</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .trust-signals {
          background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
          border: 1px solid #e1e5e9;
          border-radius: 12px;
          padding: 32px;
          margin: 40px 0;
        }

        .trust-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .trust-header h3 {
          font-size: 24px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 8px 0;
        }

        .trust-header p {
          font-size: 16px;
          color: #6c757d;
          margin: 0;
        }

        .trust-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }

        .trust-card {
          background: white;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 20px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .trust-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border-color: #1A73E8;
        }

        .trust-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .trust-card-icon {
          font-size: 32px;
          line-height: 1;
        }

        .trust-card-stat {
          text-align: right;
        }

        .stat-number {
          display: block;
          font-size: 24px;
          font-weight: 700;
          color: #1A73E8;
          line-height: 1;
        }

        .stat-metric {
          display: block;
          font-size: 12px;
          color: #6c757d;
          text-transform: uppercase;
          font-weight: 500;
          margin-top: 2px;
        }

        .trust-card-content h4 {
          font-size: 16px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 8px 0;
        }

        .trust-card-content p {
          font-size: 14px;
          color: #6c757d;
          margin: 0;
          line-height: 1.5;
        }

        .security-badges {
          display: flex;
          justify-content: center;
          gap: 24px;
          flex-wrap: wrap;
          padding-top: 24px;
          border-top: 1px solid #e9ecef;
        }

        .badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: white;
          border: 1px solid #e9ecef;
          border-radius: 6px;
          font-size: 12px;
        }

        .badge-icon {
          font-size: 16px;
        }

        .badge-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .badge-title {
          font-weight: 600;
          color: #1a1a1a;
        }

        .badge-subtitle {
          color: #6c757d;
          font-size: 11px;
        }

        @media (max-width: 768px) {
          .trust-signals {
            padding: 24px 20px;
            margin: 32px 0;
          }

          .trust-header h3 {
            font-size: 20px;
          }

          .trust-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .trust-card {
            padding: 16px;
          }

          .security-badges {
            flex-direction: column;
            align-items: center;
            gap: 12px;
          }
        }

        @media (max-width: 480px) {
          .trust-card-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .trust-card-stat {
            text-align: left;
          }
        }
      `}</style>
    </div>
  );
};

export default TrustSignals;