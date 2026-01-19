
const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
    property: {
        type: mongoose.Schema.ObjectId,
        ref: 'Property',
        required: true,
    },
    client: {
        name: {
            type: String,
            required: [true, 'Please add client name'],
        },
        address: {
            type: String,
            required: [true, 'Please add client address'],
        },
        contact: {
            type: String,
            required: [true, 'Please add client contact'],
        },
        email: {
            type: String,
            required: [true, 'Please add client email'],
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please add a valid email',
            ],
        },
        whatsappNumber: {
            type: String,
            required: [true, 'Please add client WhatsApp number'],
        },
    },
    dealType: {
        type: String,
        enum: ['purchase', 'rental', 'viewing'],
        required: true,
    },
    status: {
        type: String,
        enum: ['new', 'contacted', 'in-progress', 'closed', 'lost'],
        default: 'new',
    },
    conversationHistory: {
        type: Array,
        default: [],
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    notes: {
        type: String,
    },
    // Lead Scoring Fields
    score: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },
    scoreBreakdown: {
        responseTime: { type: Number, default: 0 },
        engagement: { type: Number, default: 0 },
        budgetMatch: { type: Number, default: 0 },
        urgency: { type: Number, default: 0 },
        contactQuality: { type: Number, default: 0 },
        interactionQuality: { type: Number, default: 0 },  // Based on interaction type and source
        intentSignals: { type: Number, default: 0 }  // Email inquiry = high intent
    },
    buyingIntent: {
        type: String,
        enum: ['low', 'medium', 'high', 'very-high'],
        default: 'medium',
    },
    lastFollowUpDate: {
        type: Date,
    },
    nextFollowUpDate: {
        type: Date,
    },
    followUpCount: {
        type: Number,
        default: 0,
    },
    autoFollowUpEnabled: {
        type: Boolean,
        default: true,
    },
    // Sales Funnel Tracking
    salesFunnelStage: {
        type: String,
        enum: ['new', 'contacted', 'qualified', 'viewing_scheduled', 'viewed', 'negotiating', 'offer_made', 'won', 'lost', 'disqualified'],
        default: 'new'
    },
    stageHistory: [{
        stage: {
            type: String,
            enum: ['new', 'contacted', 'qualified', 'viewing_scheduled', 'viewed', 'negotiating', 'offer_made', 'won', 'lost', 'disqualified']
        },
        changedAt: Date,
        changedBy: {
            type: String,
            enum: ['ai', 'manual', 'system']
        },
        notes: String
    }],
    // Negotiation Tracking
    negotiation: {
        isActive: {
            type: Boolean,
            default: false
        },
        initialOffer: Number,
        currentOffer: Number,
        counterOffers: [{
            amount: Number,
            offeredBy: {
                type: String,
                enum: ['lead', 'owner', 'ai']
            },
            offeredAt: Date,
            reasoning: String,
            status: {
                type: String,
                enum: ['pending', 'accepted', 'rejected', 'countered']
            }
        }],
        discountApplied: Number,
        discountPercentage: Number,
        aiNegotiationEnabled: {
            type: Boolean,
            default: true
        },
        negotiationRules: {
            minAcceptablePrice: Number,
            maxDiscountPercent: {
                type: Number,
                default: 10
            },
            autoAcceptThreshold: Number, // Auto-accept offers above this amount
            requireApprovalBelow: Number // Require manual approval for offers below this
        }
    },
    // Deal Closure
    dealClosure: {
        outcome: {
            type: String,
            enum: ['won', 'lost', 'disqualified', null],
            default: null
        },
        finalPrice: Number,
        closedAt: Date,
        closedBy: {
            type: String,
            enum: ['ai', 'manual', 'system']
        },
        reasonLost: {
            type: String,
            enum: ['price_too_high', 'found_alternative', 'not_interested', 'budget_constraints', 'timing_issues', 'location_mismatch', 'other']
        },
        reasonDisqualified: {
            type: String,
            enum: ['unresponsive', 'not_serious', 'budget_mismatch', 'requirements_mismatch', 'spam', 'duplicate', 'other']
        },
        revenue: Number, // Actual revenue generated from deal
        commission: Number
    },
    // AI Engagement Tracking
    aiEngagement: {
        totalInteractions: {
            type: Number,
            default: 0
        },
        lastAIAction: {
            action: String, // e.g., 'scheduled_viewing', 'sent_follow_up', 'made_offer'
            timestamp: Date,
            reasoning: String
        },
        aiActions: [{
            action: String,
            timestamp: Date,
            success: Boolean,
            reasoning: String,
            outcome: String,
            // Enhanced interaction tracking
            interactionType: {
                type: String,
                enum: ['connect_now', 'email_inquiry', 'chat_message', 'viewing_request', 'phone_call', 'whatsapp_message']
            },
            interactionSource: {
                type: String,
                enum: ['property_explorer', 'chat_interface', 'email', 'direct_call', 'whatsapp']
            },
            metadata: {
                propertyViewed: Boolean,
                conversationLength: Number,
                responseTime: Number,  // milliseconds from inquiry to lead creation
                userAgent: String,
                referrer: String
            }
        }],
        // Aggregated interaction metrics
        interactionMetrics: {
            totalConnectNowClicks: { type: Number, default: 0 },
            totalEmailInquiries: { type: Number, default: 0 },
            totalChatMessages: { type: Number, default: 0 },
            lastInteractionAt: Date,
            firstInteractionAt: Date
        },
        nextScheduledAction: {
            action: String,
            scheduledFor: Date,
            priority: {
                type: String,
                enum: ['low', 'medium', 'high', 'urgent']
            }
        }
    },
    // Viewing History
    viewings: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Viewing'
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    closedAt: {
        type: Date,
    },
});

// Indexes
LeadSchema.index({ createdBy: 1, status: 1, createdAt: -1 });
LeadSchema.index({ property: 1 });
LeadSchema.index({ 'client.email': 1, property: 1 }, { unique: true }); // Prevent duplicate leads
LeadSchema.index({ status: 1, createdAt: -1 }); // Filter by status, sort by date
LeadSchema.index({ property: 1, createdAt: -1 }); // Property's leads, sorted by date
LeadSchema.index({ dealType: 1, status: 1 }); // Filter by deal type and status
LeadSchema.index({ score: -1 }); // Sort by lead score
LeadSchema.index({ buyingIntent: 1, score: -1 }); // Filter by intent, sort by score
LeadSchema.index({ nextFollowUpDate: 1, autoFollowUpEnabled: 1 }); // For follow-up scheduling
LeadSchema.index({ salesFunnelStage: 1, score: -1 }); // Sales pipeline filtering
LeadSchema.index({ 'negotiation.isActive': 1 }); // Active negotiations
LeadSchema.index({ 'dealClosure.outcome': 1, closedAt: -1 }); // Deal outcomes
LeadSchema.index({ 'aiEngagement.nextScheduledAction.scheduledFor': 1 }); // AI action scheduling

module.exports = mongoose.model('Lead', LeadSchema);
