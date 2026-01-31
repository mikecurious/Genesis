const mongoose = require('mongoose');

/**
 * Usage Tracking Model
 *
 * Tracks feature usage for subscription plan limits.
 * Automatically resets monthly for monthly quotas.
 */

const usageTrackingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // Month and year for tracking (format: "2026-01")
    period: {
        type: String,
        required: true,
        index: true
    },

    // AI Search usage
    aiSearches: {
        count: {
            type: Number,
            default: 0
        },
        lastUsed: Date,
        history: [{
            timestamp: {
                type: Date,
                default: Date.now
            },
            query: String,
            success: Boolean
        }]
    },

    // Agent connection usage (lead creation, contact clicks)
    agentConnections: {
        count: {
            type: Number,
            default: 0
        },
        lastUsed: Date,
        history: [{
            timestamp: {
                type: Date,
                default: Date.now
            },
            leadId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Lead'
            },
            propertyId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Property'
            },
            type: {
                type: String,
                enum: ['connect_now', 'email_inquiry', 'whatsapp_message', 'phone_call', 'viewing_request']
            },
            success: Boolean
        }]
    },

    // Other feature usage (for future expansion)
    otherFeatures: {
        // Lead scoring operations
        leadScoring: {
            type: Number,
            default: 0
        },
        // Maintenance AI analyses
        maintenanceAnalyses: {
            type: Number,
            default: 0
        },
        // Financial reports generated
        financialReports: {
            type: Number,
            default: 0
        },
        // AI voice interactions
        aiVoiceInteractions: {
            type: Number,
            default: 0
        }
    },

    // Metadata
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound index for efficient queries
usageTrackingSchema.index({ userId: 1, period: 1 }, { unique: true });

// Method to get current period string (YYYY-MM format)
usageTrackingSchema.statics.getCurrentPeriod = function() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
};

// Method to find or create usage tracking for user in current period
usageTrackingSchema.statics.findOrCreateForUser = async function(userId) {
    const period = this.getCurrentPeriod();

    let usage = await this.findOne({ userId, period });

    if (!usage) {
        usage = await this.create({
            userId,
            period,
            aiSearches: { count: 0, history: [] },
            agentConnections: { count: 0, history: [] },
            otherFeatures: {
                leadScoring: 0,
                maintenanceAnalyses: 0,
                financialReports: 0,
                aiVoiceInteractions: 0
            }
        });
    }

    return usage;
};

// Method to increment AI search count
usageTrackingSchema.methods.incrementAISearch = async function(query, success = true) {
    this.aiSearches.count += 1;
    this.aiSearches.lastUsed = new Date();
    this.aiSearches.history.push({
        timestamp: new Date(),
        query: query?.substring(0, 200), // Limit query length for storage
        success
    });

    // Keep only last 50 entries to avoid document size issues
    if (this.aiSearches.history.length > 50) {
        this.aiSearches.history = this.aiSearches.history.slice(-50);
    }

    return this.save();
};

// Method to increment agent connection count
usageTrackingSchema.methods.incrementAgentConnection = async function(data) {
    this.agentConnections.count += 1;
    this.agentConnections.lastUsed = new Date();
    this.agentConnections.history.push({
        timestamp: new Date(),
        leadId: data.leadId,
        propertyId: data.propertyId,
        type: data.type || 'connect_now',
        success: data.success !== false
    });

    // Keep only last 100 entries
    if (this.agentConnections.history.length > 100) {
        this.agentConnections.history = this.agentConnections.history.slice(-100);
    }

    return this.save();
};

// Method to get usage summary
usageTrackingSchema.methods.getSummary = function() {
    return {
        period: this.period,
        aiSearches: {
            count: this.aiSearches.count,
            lastUsed: this.aiSearches.lastUsed
        },
        agentConnections: {
            count: this.agentConnections.count,
            lastUsed: this.agentConnections.lastUsed
        },
        otherFeatures: this.otherFeatures
    };
};

const UsageTracking = mongoose.model('UsageTracking', usageTrackingSchema);

module.exports = UsageTracking;
