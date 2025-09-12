#!/usr/bin/env node

/**
 * 🛡️ Facebook Compliance System
 * =============================
 * Ensures all posts comply with Facebook Community Standards
 * Prevents policy violations and account restrictions
 */

require('dotenv').config({ path: '.env.dealradarus.local' });
const fs = require('fs');
const path = require('path');

class FacebookComplianceSystem {
    constructor() {
        this.policyLimits = {
            // Posting frequency limits (conservative approach)
            maxPostsPerHour: 1,
            maxPostsPerDay: 5,
            maxPostsPerWeek: 25,
            
            // Time spacing requirements
            minTimeBetweenPosts: 60, // minutes
            
            // Content restrictions
            maxConsecutiveSimilarPosts: 2,
            maxHashtagsPerPost: 5,
            maxLinksPerPost: 2,
            
            // Engagement limits
            maxGroupPostsPerDay: 1,
            maxPageTagsPerPost: 3
        };
        
        this.prohibitedContent = {
            // Spam indicators
            spamKeywords: [
                'guarantee', 'get rich quick', 'make money fast',
                'limited time only', 'act now', 'urgent',
                'click here now', 'buy now or never'
            ],
            
            // Misleading claims
            misleadingPhrases: [
                'miracle cure', 'lose weight overnight', 'secret method',
                '100% effective', 'doctors hate this', 'one weird trick'
            ],
            
            // Prohibited content types
            prohibitedCategories: [
                'adult content', 'weapons', 'tobacco', 'drugs',
                'pyramid schemes', 'fake documents', 'gambling'
            ],
            
            // Clickbait indicators
            clickbaitPhrases: [
                'you won\'t believe', 'shocking', 'this will blow your mind',
                'number 7 will shock you', 'what happens next is amazing'
            ]
        };
        
        this.postingHistory = this.loadPostingHistory();
        this.complianceLog = path.join(__dirname, 'logs/facebook-compliance.json');
        
        this.ensureLogDirectory();
    }

    // 🔍 COMPREHENSIVE CONTENT COMPLIANCE CHECK
    async checkContentCompliance(content, dealData = null) {
        const complianceReport = {
            content: content,
            timestamp: new Date().toISOString(),
            checks: {
                spamCheck: this.checkForSpam(content),
                frequencyCheck: await this.checkPostingFrequency(),
                contentQuality: this.checkContentQuality(content),
                linkCompliance: this.checkLinkCompliance(content),
                affiliateCompliance: dealData ? this.checkAffiliateCompliance(dealData) : { passed: true },
                hashtagCompliance: this.checkHashtagCompliance(content)
            },
            overallCompliance: 'pending',
            recommendations: [],
            riskLevel: 'low'
        };

        // Calculate overall compliance
        const checkResults = Object.values(complianceReport.checks);
        const passedChecks = checkResults.filter(check => check.passed).length;
        const totalChecks = checkResults.length;
        const complianceScore = (passedChecks / totalChecks) * 100;

        complianceReport.complianceScore = Math.round(complianceScore);
        complianceReport.overallCompliance = complianceScore >= 90 ? 'approved' : complianceScore >= 70 ? 'warning' : 'rejected';
        complianceReport.riskLevel = complianceScore >= 90 ? 'low' : complianceScore >= 70 ? 'medium' : 'high';

        // Generate recommendations
        complianceReport.recommendations = this.generateRecommendations(complianceReport.checks);

        // Log compliance check
        this.logComplianceCheck(complianceReport);

        return complianceReport;
    }

    // 🚫 SPAM DETECTION
    checkForSpam(content) {
        const spamIndicators = [];
        const contentLower = content.toLowerCase();

        // Check for spam keywords
        this.prohibitedContent.spamKeywords.forEach(keyword => {
            if (contentLower.includes(keyword.toLowerCase())) {
                spamIndicators.push(`Spam keyword detected: "${keyword}"`);
            }
        });

        // Check for excessive capitalization
        const capsWords = content.match(/[A-Z]{3,}/g);
        if (capsWords && capsWords.length > 3) {
            spamIndicators.push('Excessive capitalization detected');
        }

        // Check for excessive emojis
        const emojiCount = (content.match(/[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}]/gu) || []).length;
        if (emojiCount > 10) {
            spamIndicators.push(`Excessive emojis: ${emojiCount} (recommended: ≤10)`);
        }

        // Check for clickbait
        this.prohibitedContent.clickbaitPhrases.forEach(phrase => {
            if (contentLower.includes(phrase.toLowerCase())) {
                spamIndicators.push(`Clickbait phrase detected: "${phrase}"`);
            }
        });

        return {
            passed: spamIndicators.length === 0,
            score: Math.max(0, 100 - (spamIndicators.length * 25)),
            issues: spamIndicators,
            recommendation: spamIndicators.length > 0 ? 'Remove spam indicators and use more natural language' : 'Content passes spam checks'
        };
    }

    // ⏰ POSTING FREQUENCY CHECK
    async checkPostingFrequency() {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const recentPosts = {
            lastHour: this.getPostsInTimeRange(oneHourAgo, now),
            lastDay: this.getPostsInTimeRange(oneDayAgo, now),
            lastWeek: this.getPostsInTimeRange(oneWeekAgo, now)
        };

        const violations = [];
        let canPost = true;

        // Check hourly limit
        if (recentPosts.lastHour.length >= this.policyLimits.maxPostsPerHour) {
            violations.push(`Hourly limit exceeded: ${recentPosts.lastHour.length}/${this.policyLimits.maxPostsPerHour}`);
            canPost = false;
        }

        // Check daily limit
        if (recentPosts.lastDay.length >= this.policyLimits.maxPostsPerDay) {
            violations.push(`Daily limit exceeded: ${recentPosts.lastDay.length}/${this.policyLimits.maxPostsPerDay}`);
            canPost = false;
        }

        // Check weekly limit
        if (recentPosts.lastWeek.length >= this.policyLimits.maxPostsPerWeek) {
            violations.push(`Weekly limit exceeded: ${recentPosts.lastWeek.length}/${this.policyLimits.maxPostsPerWeek}`);
            canPost = false;
        }

        // Check minimum time between posts
        if (recentPosts.lastHour.length > 0) {
            const lastPost = new Date(recentPosts.lastHour[0].timestamp);
            const timeSinceLastPost = (now - lastPost) / (1000 * 60); // minutes
            
            if (timeSinceLastPost < this.policyLimits.minTimeBetweenPosts) {
                violations.push(`Posting too frequently: ${Math.round(timeSinceLastPost)} minutes since last post (minimum: ${this.policyLimits.minTimeBetweenPosts})`);
                canPost = false;
            }
        }

        return {
            passed: canPost,
            canPost: canPost,
            violations: violations,
            stats: {
                postsLastHour: recentPosts.lastHour.length,
                postsLastDay: recentPosts.lastDay.length,
                postsLastWeek: recentPosts.lastWeek.length
            },
            nextAllowedPost: canPost ? now : this.calculateNextAllowedPostTime(recentPosts),
            recommendation: canPost ? 'Posting frequency is within limits' : 'Wait before posting to avoid spam detection'
        };
    }

    // 📝 CONTENT QUALITY CHECK
    checkContentQuality(content) {
        const qualityIssues = [];
        let qualityScore = 100;

        // Check minimum content length
        if (content.length < 50) {
            qualityIssues.push('Content too short (minimum 50 characters recommended)');
            qualityScore -= 20;
        }

        // Check for repetitive content
        const words = content.toLowerCase().split(/\s+/);
        const uniqueWords = new Set(words);
        const repetitionRatio = uniqueWords.size / words.length;
        
        if (repetitionRatio < 0.5) {
            qualityIssues.push('Content appears repetitive');
            qualityScore -= 15;
        }

        // Check for value-added content
        const valueKeywords = ['tip', 'advice', 'review', 'experience', 'recommend', 'compare', 'analysis'];
        const hasValue = valueKeywords.some(keyword => content.toLowerCase().includes(keyword));
        
        if (!hasValue && content.length < 200) {
            qualityIssues.push('Consider adding more value (tips, personal experience, or detailed analysis)');
            qualityScore -= 10;
        }

        // Check for engagement elements
        const engagementElements = ['?', 'what do you think', 'comment', 'share', 'tag a friend'];
        const hasEngagement = engagementElements.some(element => content.toLowerCase().includes(element));
        
        if (!hasEngagement) {
            qualityIssues.push('Consider adding engagement elements (questions, calls-to-action)');
            qualityScore -= 10;
        }

        return {
            passed: qualityIssues.length <= 1,
            score: Math.max(0, qualityScore),
            issues: qualityIssues,
            recommendation: qualityIssues.length === 0 ? 'Content quality is good' : 'Improve content quality to increase engagement and avoid restrictions'
        };
    }

    // 🔗 LINK COMPLIANCE CHECK
    checkLinkCompliance(content) {
        const links = content.match(/https?:\/\/[^\s]+/g) || [];
        const issues = [];

        // Check link count
        if (links.length > this.policyLimits.maxLinksPerPost) {
            issues.push(`Too many links: ${links.length} (maximum: ${this.policyLimits.maxLinksPerPost})`);
        }

        // Check for suspicious domains
        const suspiciousDomains = ['bit.ly', 'tinyurl.com', 'short.link'];
        links.forEach(link => {
            suspiciousDomains.forEach(domain => {
                if (link.includes(domain)) {
                    issues.push(`Suspicious short link detected: ${domain}`);
                }
            });
        });

        // Check for proper UTM parameters (good practice)
        const hasUTM = links.some(link => link.includes('utm_'));
        
        return {
            passed: issues.length === 0,
            linkCount: links.length,
            issues: issues,
            hasUTMTracking: hasUTM,
            recommendation: issues.length === 0 ? 
                (hasUTM ? 'Link compliance excellent with UTM tracking' : 'Consider adding UTM parameters for better tracking') :
                'Fix link compliance issues'
        };
    }

    // 💰 AFFILIATE MARKETING COMPLIANCE
    checkAffiliateCompliance(dealData) {
        const issues = [];
        let compliant = true;

        // Check for proper disclosure
        const hasDisclosure = dealData.content && (
            dealData.content.toLowerCase().includes('affiliate') ||
            dealData.content.toLowerCase().includes('commission') ||
            dealData.content.toLowerCase().includes('#ad') ||
            dealData.content.toLowerCase().includes('sponsored')
        );

        if (!hasDisclosure && dealData.affiliateUrl) {
            issues.push('Missing affiliate disclosure (recommended: include "#ad" or "affiliate link")');
            compliant = false;
        }

        // Check for prohibited products
        const productCategory = dealData.category?.toLowerCase() || '';
        this.prohibitedContent.prohibitedCategories.forEach(category => {
            if (productCategory.includes(category)) {
                issues.push(`Prohibited product category: ${category}`);
                compliant = false;
            }
        });

        return {
            passed: compliant,
            hasDisclosure: hasDisclosure,
            issues: issues,
            recommendation: compliant ? 'Affiliate compliance good' : 'Add proper disclosures and check product categories'
        };
    }

    // #️⃣ HASHTAG COMPLIANCE CHECK
    checkHashtagCompliance(content) {
        const hashtags = content.match(/#[\w]+/g) || [];
        const issues = [];

        if (hashtags.length > this.policyLimits.maxHashtagsPerPost) {
            issues.push(`Too many hashtags: ${hashtags.length} (maximum: ${this.policyLimits.maxHashtagsPerPost})`);
        }

        // Check for spammy hashtag patterns
        const spammyPatterns = ['#followforfollow', '#like4like', '#spam', '#bot'];
        hashtags.forEach(hashtag => {
            spammyPatterns.forEach(pattern => {
                if (hashtag.toLowerCase() === pattern) {
                    issues.push(`Spammy hashtag detected: ${hashtag}`);
                }
            });
        });

        return {
            passed: issues.length === 0,
            hashtagCount: hashtags.length,
            hashtags: hashtags,
            issues: issues,
            recommendation: issues.length === 0 ? 'Hashtag usage is compliant' : 'Reduce hashtag count and avoid spammy tags'
        };
    }

    // 💡 GENERATE RECOMMENDATIONS
    generateRecommendations(checks) {
        const recommendations = [];

        Object.entries(checks).forEach(([checkName, result]) => {
            if (!result.passed && result.recommendation) {
                recommendations.push({
                    area: checkName,
                    severity: result.score < 50 ? 'high' : result.score < 80 ? 'medium' : 'low',
                    message: result.recommendation,
                    issues: result.issues || []
                });
            }
        });

        // Add general recommendations
        if (recommendations.length === 0) {
            recommendations.push({
                area: 'general',
                severity: 'info',
                message: 'Content is fully compliant with Facebook policies',
                issues: []
            });
        }

        return recommendations;
    }

    // 🛡️ SAFE POSTING WITH COMPLIANCE
    async safePostToFacebook(content, dealData = null) {
        console.log('🛡️ Running Facebook compliance check...');
        
        // Run compliance check
        const complianceReport = await this.checkContentCompliance(content, dealData);
        
        if (complianceReport.overallCompliance === 'rejected') {
            console.log('❌ Post rejected due to compliance issues');
            console.log('Issues:', complianceReport.recommendations);
            return {
                success: false,
                reason: 'compliance_violation',
                complianceReport: complianceReport
            };
        }

        if (complianceReport.overallCompliance === 'warning') {
            console.log('⚠️ Post has compliance warnings but will proceed');
            console.log('Warnings:', complianceReport.recommendations);
        }

        // Check if we can post based on frequency
        if (!complianceReport.checks.frequencyCheck.canPost) {
            const nextAllowed = complianceReport.checks.frequencyCheck.nextAllowedPost;
            console.log(`⏰ Cannot post yet. Next allowed post time: ${nextAllowed.toLocaleString()}`);
            return {
                success: false,
                reason: 'frequency_limit',
                nextAllowedPost: nextAllowed,
                complianceReport: complianceReport
            };
        }

        // Proceed with posting (this would integrate with your existing Facebook posting logic)
        try {
            // Record the post in history
            this.recordPost(content, dealData);
            
            console.log('✅ Post passed compliance checks');
            return {
                success: true,
                complianceReport: complianceReport
            };
            
        } catch (error) {
            console.log('❌ Facebook posting failed:', error.message);
            return {
                success: false,
                reason: 'posting_error',
                error: error.message,
                complianceReport: complianceReport
            };
        }
    }

    // 📊 UTILITY FUNCTIONS
    getPostsInTimeRange(startTime, endTime) {
        return this.postingHistory.filter(post => {
            const postTime = new Date(post.timestamp);
            return postTime >= startTime && postTime <= endTime;
        });
    }

    calculateNextAllowedPostTime(recentPosts) {
        const now = new Date();
        
        // Find the most restrictive limit
        let nextAllowed = now;
        
        if (recentPosts.lastHour.length > 0) {
            const lastPost = new Date(recentPosts.lastHour[0].timestamp);
            const nextByTime = new Date(lastPost.getTime() + this.policyLimits.minTimeBetweenPosts * 60 * 1000);
            if (nextByTime > nextAllowed) nextAllowed = nextByTime;
        }
        
        return nextAllowed;
    }

    recordPost(content, dealData) {
        const post = {
            timestamp: new Date().toISOString(),
            content: content.substring(0, 100) + '...', // Store preview only
            dealId: dealData?.id || null,
            platform: 'facebook'
        };
        
        this.postingHistory.push(post);
        
        // Keep only last 100 posts to prevent file from growing too large
        if (this.postingHistory.length > 100) {
            this.postingHistory = this.postingHistory.slice(-100);
        }
        
        this.savePostingHistory();
    }

    logComplianceCheck(report) {
        try {
            const logEntry = {
                timestamp: report.timestamp,
                complianceScore: report.complianceScore,
                overallCompliance: report.overallCompliance,
                riskLevel: report.riskLevel,
                issueCount: report.recommendations.length
            };
            
            let logs = [];
            if (fs.existsSync(this.complianceLog)) {
                logs = JSON.parse(fs.readFileSync(this.complianceLog, 'utf-8'));
            }
            
            logs.push(logEntry);
            
            // Keep only last 1000 entries
            if (logs.length > 1000) {
                logs = logs.slice(-1000);
            }
            
            fs.writeFileSync(this.complianceLog, JSON.stringify(logs, null, 2));
        } catch (error) {
            console.log('Warning: Could not log compliance check:', error.message);
        }
    }

    loadPostingHistory() {
        const historyFile = path.join(__dirname, 'logs/posting-history.json');
        try {
            if (fs.existsSync(historyFile)) {
                return JSON.parse(fs.readFileSync(historyFile, 'utf-8'));
            }
        } catch (error) {
            console.log('Warning: Could not load posting history:', error.message);
        }
        return [];
    }

    savePostingHistory() {
        const historyFile = path.join(__dirname, 'logs/posting-history.json');
        try {
            fs.writeFileSync(historyFile, JSON.stringify(this.postingHistory, null, 2));
        } catch (error) {
            console.log('Warning: Could not save posting history:', error.message);
        }
    }

    ensureLogDirectory() {
        const logDir = path.dirname(this.complianceLog);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
    }

    // 📈 COMPLIANCE STATISTICS
    getComplianceStats() {
        try {
            if (!fs.existsSync(this.complianceLog)) return null;
            
            const logs = JSON.parse(fs.readFileSync(this.complianceLog, 'utf-8'));
            const recentLogs = logs.slice(-30); // Last 30 checks
            
            return {
                totalChecks: logs.length,
                recentChecks: recentLogs.length,
                averageComplianceScore: Math.round(recentLogs.reduce((sum, log) => sum + log.complianceScore, 0) / recentLogs.length),
                complianceDistribution: {
                    approved: recentLogs.filter(log => log.overallCompliance === 'approved').length,
                    warning: recentLogs.filter(log => log.overallCompliance === 'warning').length,
                    rejected: recentLogs.filter(log => log.overallCompliance === 'rejected').length
                },
                riskDistribution: {
                    low: recentLogs.filter(log => log.riskLevel === 'low').length,
                    medium: recentLogs.filter(log => log.riskLevel === 'medium').length,
                    high: recentLogs.filter(log => log.riskLevel === 'high').length
                }
            };
        } catch (error) {
            console.log('Warning: Could not generate compliance stats:', error.message);
            return null;
        }
    }
}

module.exports = FacebookComplianceSystem;

// CLI usage for testing
if (require.main === module) {
    const compliance = new FacebookComplianceSystem();
    
    const testContent = `🔥 AMAZING MacBook Air Deal! 🔥
    
Get the new MacBook Air M2 for just $899 (was $1299)! 
That's 31% OFF and $400 in savings! 💰

✅ Perfect for students
✅ Lightning fast M2 chip  
✅ All-day battery life

This deal won't last long! What do you think - worth upgrading? 🤔

#MacBook #TechDeals #StudentDeals #Apple #LaptopDeals

Link: https://dealradarus.com/deal/macbook-air-m2?utm_source=facebook&utm_medium=social&utm_campaign=daily_deals

#ad - This post contains affiliate links`;

    const testDeal = {
        id: 'macbook-001',
        title: 'MacBook Air M2',
        category: 'electronics',
        affiliateUrl: 'https://amazon.com/dp/xyz?tag=dealradarus-20'
    };

    console.log('🧪 TESTING FACEBOOK COMPLIANCE SYSTEM');
    console.log('====================================\n');
    
    compliance.checkContentCompliance(testContent, testDeal).then(report => {
        console.log('📊 COMPLIANCE REPORT:');
        console.log(`Overall Compliance: ${report.overallCompliance} (${report.complianceScore}%)`);
        console.log(`Risk Level: ${report.riskLevel}\n`);
        
        console.log('🔍 CHECK RESULTS:');
        Object.entries(report.checks).forEach(([check, result]) => {
            const status = result.passed ? '✅' : '❌';
            console.log(`${status} ${check}: ${result.passed ? 'PASSED' : 'FAILED'}`);
            if (!result.passed && result.issues) {
                result.issues.forEach(issue => console.log(`   - ${issue}`));
            }
        });
        
        if (report.recommendations.length > 0) {
            console.log('\n💡 RECOMMENDATIONS:');
            report.recommendations.forEach(rec => {
                const icon = rec.severity === 'high' ? '🔴' : rec.severity === 'medium' ? '🟡' : '🟢';
                console.log(`${icon} ${rec.area}: ${rec.message}`);
            });
        }
        
        // Test safe posting
        console.log('\n🛡️ TESTING SAFE POSTING:');
        return compliance.safePostToFacebook(testContent, testDeal);
    }).then(result => {
        console.log(`Post Result: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
        if (!result.success) {
            console.log(`Reason: ${result.reason}`);
        }
    }).catch(console.error);
}