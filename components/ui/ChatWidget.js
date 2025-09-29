import React, { useState, useEffect } from 'react';
import styles from './ChatWidget.module.css';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Show widget after page load
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    // Simulate unread messages for demo
    const unreadTimer = setTimeout(() => {
      setUnreadCount(1);
    }, 10000);

    return () => {
      clearTimeout(timer);
      clearTimeout(unreadTimer);
    };
  }, []);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      setUnreadCount(0);
    }
  };

  const handleStartChat = () => {
    // Here you would integrate with your chat service
    // For now, we'll just show a simple alert
    alert('Chat feature coming soon! For immediate support, please email us at support@dealradarus.com');
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Chat Widget Button */}
      <div className={`${styles.chatWidget} ${isOpen ? styles.open : ''}`}>
        <button
          onClick={toggleChat}
          className={styles.chatButton}
          aria-label="Open chat support"
          aria-expanded={isOpen}
        >
          {unreadCount > 0 && (
            <span className={styles.unreadBadge} aria-label={`${unreadCount} unread messages`}>
              {unreadCount}
            </span>
          )}

          {isOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18.3 5.71c-.39-.39-1.02-.39-1.41 0L12 10.59 7.11 5.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L10.59 12 5.7 16.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l4.89 4.88c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 2.98.97 4.29L1 23l6.71-1.97C9.02 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.22 0-2.4-.24-3.5-.68L7 20l.68-1.5C7.24 17.4 7 16.22 7 15c0-2.76 2.24-5 5-5s5 2.24 5 5-2.24 5-5 5z"/>
              <circle cx="9" cy="15" r="1"/>
              <circle cx="12" cy="15" r="1"/>
              <circle cx="15" cy="15" r="1"/>
            </svg>
          )}
        </button>

        {/* Chat Panel */}
        {isOpen && (
          <div className={styles.chatPanel}>
            <div className={styles.chatHeader}>
              <div className={styles.headerContent}>
                <div className={styles.avatar}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <div className={styles.headerText}>
                  <h3>DealRadarUS Support</h3>
                  <span className={styles.status}>
                    <span className={styles.statusDot}></span>
                    Online
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.chatBody}>
              <div className={styles.welcomeMessage}>
                <div className={styles.messageAvatar}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <div className={styles.messageContent}>
                  <p>👋 Hi! Welcome to DealRadarUS!</p>
                  <p>Need help finding the best deals? I'm here to assist you!</p>
                </div>
              </div>

              <div className={styles.quickActions}>
                <h4>How can we help you?</h4>
                <div className={styles.actionButtons}>
                  <button onClick={handleStartChat} className={styles.actionButton}>
                    🔍 Find Deals
                  </button>
                  <button onClick={handleStartChat} className={styles.actionButton}>
                    📱 Technical Support
                  </button>
                  <button onClick={handleStartChat} className={styles.actionButton}>
                    💳 Account Issues
                  </button>
                  <button onClick={handleStartChat} className={styles.actionButton}>
                    📧 Contact Sales
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.chatFooter}>
              <p className={styles.footerText}>
                Typically replies in a few minutes
              </p>
              <button onClick={handleStartChat} className={styles.startChatButton}>
                Start Conversation
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Backdrop */}
      {isOpen && <div className={styles.backdrop} onClick={toggleChat}></div>}
    </>
  );
};

export default ChatWidget;