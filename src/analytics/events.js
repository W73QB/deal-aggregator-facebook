/**
 * GA4 Event Definitions and Schema
 * Standardized event tracking with proper naming conventions
 */

import { pushEvent } from './dataLayer.js';

/**
 * Deal Events
 */

// Track when a deal is viewed
export function trackDealView(dealData) {
  pushEvent('deal_view', {
    deal_id: dealData.id,
    deal_title: dealData.title?.substring(0, 100), // Limit title length
    category: dealData.category || 'unknown',
    price: dealData.price ? parseFloat(dealData.price) : null,
    original_price: dealData.originalPrice ? parseFloat(dealData.originalPrice) : null,
    discount_pct: dealData.discountPercent ? parseFloat(dealData.discountPercent) : null,
    source: dealData.source || 'direct',
    deal_status: dealData.status || 'active',
    currency: dealData.currency || 'USD'
  });
}

// Track deal click/interaction
export function trackDealClick(dealData, clickType = 'general') {
  pushEvent('deal_click', {
    deal_id: dealData.id,
    deal_title: dealData.title?.substring(0, 100),
    category: dealData.category || 'unknown',
    click_type: clickType, // 'cta', 'image', 'title', 'general'
    price: dealData.price ? parseFloat(dealData.price) : null,
    discount_pct: dealData.discountPercent ? parseFloat(dealData.discountPercent) : null,
    source: dealData.source || 'direct'
  });
}

// Track deal search
export function trackDealSearch(searchQuery, resultsCount = null, filters = {}) {
  pushEvent('deal_search', {
    search_term: searchQuery?.substring(0, 100),
    search_results_count: resultsCount,
    search_filters: Object.keys(filters).join(','),
    search_category: filters.category || null,
    search_price_min: filters.priceMin ? parseFloat(filters.priceMin) : null,
    search_price_max: filters.priceMax ? parseFloat(filters.priceMax) : null
  });
}

/**
 * Review Events
 */

// Track review creation
export function trackReviewCreate(reviewData) {
  pushEvent('review_create', {
    deal_id: reviewData.dealId,
    review_id: reviewData.id,
    rating: reviewData.rating ? parseInt(reviewData.rating) : null,
    review_length: reviewData.content ? reviewData.content.length : 0,
    has_title: !!reviewData.title,
    review_type: 'user_generated'
  });
}

// Track review voting (helpful/unhelpful)
export function trackReviewVote(reviewData, voteType) {
  pushEvent('review_vote', {
    deal_id: reviewData.dealId,
    review_id: reviewData.id,
    vote_type: voteType, // 'helpful', 'unhelpful'
    review_rating: reviewData.rating ? parseInt(reviewData.rating) : null,
    review_author_role: reviewData.user?.role || 'user'
  });
}

// Track review edit
export function trackReviewEdit(reviewData) {
  pushEvent('review_edit', {
    deal_id: reviewData.dealId,
    review_id: reviewData.id,
    rating: reviewData.rating ? parseInt(reviewData.rating) : null,
    review_length: reviewData.content ? reviewData.content.length : 0
  });
}

// Track review delete
export function trackReviewDelete(reviewData, reason = null) {
  pushEvent('review_delete', {
    deal_id: reviewData.dealId,
    review_id: reviewData.id,
    delete_reason: reason, // 'user_request', 'moderation', 'violation'
    review_rating: reviewData.rating ? parseInt(reviewData.rating) : null
  });
}

/**
 * Comment Events
 */

// Track comment creation
export function trackCommentCreate(commentData) {
  pushEvent('comment_create', {
    deal_id: commentData.dealId,
    comment_id: commentData.id,
    parent_comment_id: commentData.parentId || null,
    comment_length: commentData.content ? commentData.content.length : 0,
    comment_depth: commentData.depth || 0,
    is_reply: !!commentData.parentId
  });
}

// Track comment edit
export function trackCommentEdit(commentData) {
  pushEvent('comment_edit', {
    deal_id: commentData.dealId,
    comment_id: commentData.id,
    comment_length: commentData.content ? commentData.content.length : 0
  });
}

// Track comment delete
export function trackCommentDelete(commentData, reason = null) {
  pushEvent('comment_delete', {
    deal_id: commentData.dealId,
    comment_id: commentData.id,
    delete_reason: reason,
    had_replies: commentData.replyCount > 0
  });
}

/**
 * Alert Events
 */

// Track alert creation
export function trackAlertCreate(alertData) {
  pushEvent('alert_create', {
    alert_id: alertData.id,
    alert_type: alertData.type, // 'instant', 'daily', 'weekly'
    keywords: alertData.keywords?.join(',').substring(0, 100),
    price_min: alertData.priceMin ? parseFloat(alertData.priceMin) : null,
    price_max: alertData.priceMax ? parseFloat(alertData.priceMax) : null,
    category: alertData.category || null,
    notification_method: alertData.notificationMethod // 'email', 'push'
  });
}

// Track alert trigger
export function trackAlertTrigger(alertData, dealCount) {
  pushEvent('alert_trigger', {
    alert_id: alertData.id,
    alert_type: alertData.type,
    deals_found: dealCount,
    trigger_time: new Date().toISOString()
  });
}

// Track alert delete
export function trackAlertDelete(alertData, reason = 'user_request') {
  pushEvent('alert_delete', {
    alert_id: alertData.id,
    alert_type: alertData.type,
    delete_reason: reason,
    alert_age_days: alertData.createdAt ? 
      Math.floor((Date.now() - new Date(alertData.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : null
  });
}

/**
 * Authentication Events
 */

// Track user login
export function trackAuthLogin(method = 'email', success = true) {
  pushEvent('auth_login', {
    login_method: method, // 'email', 'google', 'facebook'
    login_success: success,
    login_timestamp: new Date().toISOString()
  });
}

// Track user signup
export function trackAuthSignup(method = 'email', success = true) {
  pushEvent('auth_signup', {
    signup_method: method,
    signup_success: success,
    signup_timestamp: new Date().toISOString()
  });
}

// Track user logout
export function trackAuthLogout() {
  pushEvent('auth_logout', {
    logout_timestamp: new Date().toISOString()
  });
}

/**
 * Content Moderation Events
 */

// Track content report
export function trackContentReport(reportData) {
  pushEvent('content_report', {
    content_type: reportData.contentType, // 'review', 'comment'
    content_id: reportData.contentId,
    report_reason: reportData.reason,
    reporter_role: reportData.reporterRole || 'user'
  });
}

// Track moderation action
export function trackModerationAction(reportData, action) {
  pushEvent('moderation_action', {
    report_id: reportData.id,
    content_type: reportData.contentType,
    content_id: reportData.contentId,
    action_taken: action, // 'dismiss', 'remove_content', 'warn_user', 'ban_user'
    moderator_role: 'admin'
  });
}

/**
 * User Engagement Events
 */

// Track filter usage
export function trackFilterUse(filterType, filterValue) {
  pushEvent('filter_use', {
    filter_type: filterType, // 'category', 'price', 'rating', 'date'
    filter_value: filterValue?.toString().substring(0, 100)
  });
}

// Track search usage
export function trackSearch(query, source = 'header') {
  pushEvent('search', {
    search_term: query?.substring(0, 100),
    search_source: source // 'header', 'filters', 'suggestions'
  });
}

// Track pagination
export function trackPagination(page, section) {
  pushEvent('pagination', {
    page_number: parseInt(page),
    section: section // 'deals', 'reviews', 'comments'
  });
}

// Track time on page
export function trackTimeOnPage(timeSeconds, pagePath = null) {
  pushEvent('time_on_page', {
    page_path: pagePath || window.location.pathname,
    time_seconds: Math.round(timeSeconds),
    time_minutes: Math.round(timeSeconds / 60)
  });
}

/**
 * Error Tracking Events
 */

// Track JavaScript errors
export function trackError(error, context = 'general') {
  pushEvent('error_occurred', {
    error_message: error.message?.substring(0, 200),
    error_stack: error.stack?.substring(0, 500),
    error_context: context,
    error_timestamp: new Date().toISOString(),
    page_url: window.location.href
  });
}

// Track API errors
export function trackApiError(endpoint, statusCode, errorMessage) {
  pushEvent('api_error', {
    api_endpoint: endpoint,
    status_code: statusCode,
    error_message: errorMessage?.substring(0, 200),
    error_timestamp: new Date().toISOString()
  });
}

/**
 * Business Events
 */

// Track conversion events (user performs desired action)
export function trackConversion(conversionType, value = null) {
  pushEvent('conversion', {
    conversion_type: conversionType, // 'signup', 'first_review', 'first_comment', 'alert_created'
    conversion_value: value,
    conversion_timestamp: new Date().toISOString()
  });
}

// Track user retention events
export function trackRetention(daysSinceSignup, actionsToday) {
  pushEvent('user_retention', {
    days_since_signup: daysSinceSignup,
    actions_today: actionsToday,
    retention_cohort: daysSinceSignup <= 1 ? 'day_1' : 
                     daysSinceSignup <= 7 ? 'week_1' : 
                     daysSinceSignup <= 30 ? 'month_1' : 'long_term'
  });
}

/**
 * M3.6 Notification Events
 */

// Track notification sent
export function trackNotificationSent(channel, template, userId = null) {
  pushEvent('notif_sent', {
    channel, // 'email', 'webhook', 'in_app'
    template, // 'deal-immediate', 'deal-digest', 'generic-error'
    user_id_hash: userId ? hashUserId(userId) : null,
    timestamp: new Date().toISOString()
  });
}

// Track notification opened
export function trackNotificationOpen(channel, template, method = 'direct') {
  pushEvent('notif_open', {
    channel, // 'email', 'webhook', 'in_app'
    template, // 'deal-immediate', 'deal-digest', 'generic-error'
    open_method: method, // 'direct', 'badge_click', 'deep_link'
    timestamp: new Date().toISOString()
  });
}

// Track notification clicked
export function trackNotificationClick(channel, template, targetUrl = null) {
  pushEvent('notif_click', {
    channel, // 'email', 'webhook', 'in_app'
    template, // 'deal-immediate', 'deal-digest', 'generic-error'
    has_target_url: !!targetUrl,
    target_domain: targetUrl ? new URL(targetUrl).hostname : null,
    timestamp: new Date().toISOString()
  });
}

// Track notification delivery failure
export function trackNotificationFail(channel, template, errorType = 'unknown', attempts = 1) {
  pushEvent('notif_fail', {
    channel, // 'email', 'webhook', 'in_app'
    template, // 'deal-immediate', 'deal-digest', 'generic-error'
    error_type: errorType, // 'smtp_error', 'webhook_timeout', 'rate_limited'
    attempts,
    timestamp: new Date().toISOString()
  });
}

// Track digest sent
export function trackDigestSent(frequency, dealCount, categories, userId = null) {
  pushEvent('digest_sent', {
    frequency, // 'daily', 'weekly'
    deal_count: dealCount,
    category_count: categories,
    user_id_hash: userId ? hashUserId(userId) : null,
    timestamp: new Date().toISOString()
  });
}

// Track notification preferences update
export function trackNotificationPrefsUpdate(changes) {
  pushEvent('notif_prefs_update', {
    email_enabled: changes.email_enabled,
    webhook_enabled: changes.webhook_enabled,
    digest_frequency: changes.digest_frequency,
    quiet_hours_enabled: !!(changes.quiet_hours_start && changes.quiet_hours_end),
    timestamp: new Date().toISOString()
  });
}

/**
 * M3.6 Advanced Notification Analytics
 */

// Track notification center interactions
export function trackNotificationCenterAction(action, context = {}) {
  pushEvent('notif_center_action', {
    action, // 'open', 'close', 'scroll', 'filter', 'search', 'load_more'
    notification_count: context.notificationCount || 0,
    unread_count: context.unreadCount || 0,
    filtered_status: context.filteredStatus || null,
    timestamp: new Date().toISOString()
  });
}

// Track in-app notification interactions
export function trackInAppNotificationInteraction(action, notificationData) {
  pushEvent('notif_interaction', {
    action, // 'view', 'click', 'dismiss', 'mark_read', 'mark_unread'
    notification_id: notificationData.id,
    template: notificationData.template,
    age_minutes: notificationData.created_at ? 
      Math.floor((Date.now() - new Date(notificationData.created_at).getTime()) / (1000 * 60)) : null,
    was_read: !!notificationData.opened_at,
    priority: notificationData.priority || 'normal',
    timestamp: new Date().toISOString()
  });
}

// Track notification delivery performance
export function trackNotificationDeliveryMetrics(metrics) {
  pushEvent('notif_delivery_metrics', {
    channel: metrics.channel, // 'email', 'webhook', 'in_app'
    template: metrics.template,
    delivery_time_ms: metrics.deliveryTimeMs,
    retry_count: metrics.retryCount || 0,
    final_status: metrics.status, // 'sent', 'failed', 'pending'
    error_type: metrics.errorType || null,
    timestamp: new Date().toISOString()
  });
}

// Track digest performance
export function trackDigestMetrics(digestData) {
  pushEvent('digest_metrics', {
    frequency: digestData.frequency, // 'daily', 'weekly'
    total_deals: digestData.totalDeals,
    categories_count: digestData.categoriesCount,
    generation_time_ms: digestData.generationTimeMs,
    template_size_kb: digestData.templateSizeKb,
    recipient_count: digestData.recipientCount,
    timestamp: new Date().toISOString()
  });
}

// Track user notification preferences patterns
export function trackNotificationPreferencePattern(pattern, data = {}) {
  pushEvent('notif_preference_pattern', {
    pattern, // 'quiet_hours_set', 'digest_frequency_changed', 'channel_disabled', 'bulk_unsubscribe'
    previous_value: data.previousValue || null,
    new_value: data.newValue || null,
    user_tenure_days: data.userTenureDays || null,
    notification_volume_last_week: data.recentNotificationVolume || null,
    timestamp: new Date().toISOString()
  });
}

// Track notification system performance from user perspective
export function trackNotificationSystemPerformance(performanceData) {
  pushEvent('notif_system_performance', {
    load_time_ms: performanceData.loadTimeMs,
    api_response_time_ms: performanceData.apiResponseTimeMs,
    notification_count: performanceData.notificationCount,
    error_count: performanceData.errorCount,
    cache_hit_rate: performanceData.cacheHitRate || null,
    connection_quality: performanceData.connectionQuality || 'unknown', // 'fast', 'slow', 'offline'
    timestamp: new Date().toISOString()
  });
}

// Helper function to hash user ID for privacy
function hashUserId(userId) {
  // Simple hash for privacy - in production, use proper hashing
  return btoa(userId).substring(0, 8);
}