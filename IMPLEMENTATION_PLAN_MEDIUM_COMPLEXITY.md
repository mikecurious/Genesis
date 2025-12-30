# Implementation Plan - Medium Complexity Features

**Project**: Genesis Real Estate Platform
**Phase**: Advanced AI Features
**Date**: December 30, 2025
**Estimated Duration**: 4-6 weeks

---

## 🎯 Features Overview

This plan covers 4 medium-complexity features that will significantly enhance the AI capabilities of the Genesis platform:

1. **AI Manager** - Autonomous decision-making and workflow coordination
2. **Maintenance AI Analysis** - Cost estimation and technician matching
3. **Enhanced Auto Follow-Up System** - Advanced email/WhatsApp automation
4. **Role Detection with Confidence Scores** - Intelligent user profiling

---

# Feature 1: AI Manager (Core Intelligence Layer)

## 📋 Overview

The AI Manager acts as the "brain" of the platform, continuously monitoring properties, tenants, payments, and maintenance requests, then autonomously triggering appropriate workflows.

## 🎯 Objectives

- Monitor all platform activities in real-time
- Make autonomous decisions based on predefined rules and AI
- Coordinate all other AI modules
- Generate actionable insights
- Execute workflows without human intervention

## 🏗️ Architecture

### Component Structure

```
AI Manager
├── Monitoring Engine
│   ├── Property Monitor
│   ├── Tenant Monitor
│   ├── Payment Monitor
│   └── Maintenance Monitor
├── Decision Engine
│   ├── Rule-Based System
│   ├── ML-Based Predictions
│   └── Priority Queue
├── Action Engine
│   ├── Workflow Executor
│   ├── Notification Dispatcher
│   └── Task Scheduler
└── Analytics Engine
    ├── Performance Tracker
    ├── Insight Generator
    └── Report Builder
```

## 📊 Database Schema Changes

### New Collection: AIManagerEvents

```javascript
const AIManagerEventSchema = new mongoose.Schema({
    eventType: {
        type: String,
        enum: [
            'property_status_change',
            'rent_overdue',
            'maintenance_urgent',
            'lead_high_priority',
            'payment_received',
            'tenant_risk_detected',
            'vacancy_detected'
        ],
        required: true
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    entityType: {
        type: String,
        enum: ['property', 'tenant', 'payment', 'maintenance', 'lead', 'user'],
        required: true
    },
    entityId: {
        type: mongoose.Schema.ObjectId,
        required: true
    },
    triggeredBy: {
        type: String,
        enum: ['system', 'user', 'ai'],
        default: 'ai'
    },
    context: {
        type: mongoose.Schema.Types.Mixed, // Flexible context data
    },
    decision: {
        action: String,
        confidence: Number, // 0-1
        reasoning: String,
        alternativeActions: [String]
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'failed', 'cancelled'],
        default: 'pending'
    },
    executedAt: Date,
    completedAt: Date,
    result: {
        success: Boolean,
        message: String,
        data: mongoose.Schema.Types.Mixed
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

AIManagerEventSchema.index({ eventType: 1, status: 1 });
AIManagerEventSchema.index({ severity: 1, createdAt: -1 });
AIManagerEventSchema.index({ entityType: 1, entityId: 1 });
AIManagerEventSchema.index({ status: 1, createdAt: -1 });
```

### Update User Model

```javascript
// Add to User model
aiManagerSettings: {
    enabled: { type: Boolean, default: false },
    automationLevel: {
        type: String,
        enum: ['conservative', 'balanced', 'aggressive'],
        default: 'balanced'
    },
    approvalRequired: {
        rentReminders: { type: Boolean, default: false },
        maintenanceActions: { type: Boolean, default: true },
        leadFollowUps: { type: Boolean, default: false },
        paymentEscalations: { type: Boolean, default: true }
    },
    notificationPreferences: {
        eventTypes: [String], // Which events to be notified about
        channels: {
            email: { type: Boolean, default: true },
            push: { type: Boolean, default: true },
            sms: { type: Boolean, default: false }
        }
    }
}
```

## 🔧 Implementation Steps

### Step 1: Create AI Manager Service (Week 1)

**File**: `backend/services/aiManagerService.js`

```javascript
class AIManagerService {
    constructor() {
        this.monitors = [];
        this.decisionQueue = [];
        this.isRunning = false;
    }

    // Core monitoring loop
    async startMonitoring() {
        // Run every 5 minutes
        this.monitoringJob = cron.schedule('*/5 * * * *', async () => {
            await this.runMonitoringCycle();
        });
    }

    async runMonitoringCycle() {
        // 1. Check all monitoring targets
        // 2. Detect events
        // 3. Analyze and decide
        // 4. Execute actions
        // 5. Log results
    }

    // Event detection methods
    async detectPropertyEvents() { /* ... */ }
    async detectTenantEvents() { /* ... */ }
    async detectPaymentEvents() { /* ... */ }
    async detectMaintenanceEvents() { /* ... */ }

    // Decision making
    async analyzeEvent(event) { /* ... */ }
    async makeDecision(event, analysis) { /* ... */ }

    // Action execution
    async executeAction(decision) { /* ... */ }
}
```

**Key Methods**:
- `detectOverdueRent()` - Find tenants with overdue rent
- `detectUrgentMaintenance()` - High priority maintenance requests
- `detectHighValueLeads()` - Leads with score > 80
- `detectVacancies()` - Newly available properties
- `analyzeRisk()` - Tenant risk assessment
- `prioritizeActions()` - Priority queue management

### Step 2: Implement Decision Rules Engine (Week 1-2)

**File**: `backend/services/decisionRulesEngine.js`

```javascript
class DecisionRulesEngine {
    constructor() {
        this.rules = this.loadRules();
    }

    loadRules() {
        return {
            rent_overdue: [
                {
                    condition: (daysOverdue) => daysOverdue >= 30,
                    action: 'escalate_to_legal',
                    confidence: 0.95
                },
                {
                    condition: (daysOverdue) => daysOverdue >= 14,
                    action: 'send_final_notice',
                    confidence: 0.90
                },
                {
                    condition: (daysOverdue) => daysOverdue >= 7,
                    action: 'send_warning',
                    confidence: 0.85
                }
            ],
            maintenance_urgent: [
                {
                    condition: (priority, age) => priority === 'Urgent' && age > 24,
                    action: 'assign_emergency_technician',
                    confidence: 0.92
                }
            ],
            lead_high_priority: [
                {
                    condition: (score, lastContact) => score > 80 && lastContact > 2,
                    action: 'immediate_followup',
                    confidence: 0.88
                }
            ]
        };
    }

    evaluate(eventType, context) {
        const rules = this.rules[eventType] || [];

        for (const rule of rules) {
            if (rule.condition(context)) {
                return {
                    action: rule.action,
                    confidence: rule.confidence,
                    rule: rule
                };
            }
        }

        return null;
    }
}
```

### Step 3: Create Workflow Executor (Week 2)

**File**: `backend/services/workflowExecutor.js`

Execute autonomous actions based on AI Manager decisions.

### Step 4: Build Dashboard & Analytics (Week 2-3)

**File**: `backend/controllers/aiManager.js`

API endpoints:
- `GET /api/ai-manager/dashboard` - Real-time dashboard
- `GET /api/ai-manager/events` - Event history
- `POST /api/ai-manager/settings` - Update settings
- `GET /api/ai-manager/analytics` - Performance metrics

### Step 5: Testing & Refinement (Week 3)

## 🧪 Testing Strategy

1. **Unit Tests**: Test each monitoring function
2. **Integration Tests**: Test full monitoring cycle
3. **Load Tests**: Handle 1000+ events per cycle
4. **Edge Cases**: Network failures, database errors

## 📈 Success Metrics

- Event detection accuracy: > 95%
- Decision confidence: > 85% average
- Action success rate: > 90%
- Response time: < 5 minutes for critical events
- False positive rate: < 5%

---

# Feature 2: Maintenance AI Analysis

## 📋 Overview

AI-powered system to analyze maintenance requests, estimate costs, and match optimal technicians.

## 🎯 Objectives

- Automatically classify maintenance urgency
- Estimate repair costs using historical data
- Match best technician based on expertise and availability
- Predict maintenance needs before they occur

## 🏗️ Architecture

```
Maintenance AI
├── Analysis Engine
│   ├── Urgency Classifier
│   ├── Cost Estimator
│   └── Category Detector
├── Technician Matcher
│   ├── Skill Matcher
│   ├── Availability Checker
│   └── Performance Scorer
└── Predictive Engine
    ├── Pattern Analyzer
    └── Preventive Suggester
```

## 📊 Database Schema Changes

### New Collection: Technicians

```javascript
const TechnicianSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: String,
    phone: {
        type: String,
        required: true
    },
    specializations: [{
        type: String,
        enum: [
            'plumbing',
            'electrical',
            'hvac',
            'carpentry',
            'painting',
            'roofing',
            'appliance_repair',
            'general_maintenance',
            'landscaping',
            'pest_control'
        ]
    }],
    availability: {
        type: String,
        enum: ['available', 'busy', 'off-duty'],
        default: 'available'
    },
    location: {
        address: String,
        city: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    rating: {
        type: Number,
        default: 5.0,
        min: 0,
        max: 5
    },
    completedJobs: {
        type: Number,
        default: 0
    },
    averageResponseTime: {
        type: Number, // in hours
        default: 24
    },
    pricing: {
        hourlyRate: Number,
        callOutFee: Number,
        currency: {
            type: String,
            default: 'KSh'
        }
    },
    certifications: [String],
    yearsOfExperience: {
        type: Number,
        default: 0
    },
    workHistory: [{
        maintenanceRequest: {
            type: mongoose.Schema.ObjectId,
            ref: 'MaintenanceRequest'
        },
        completedAt: Date,
        rating: Number,
        cost: Number,
        duration: Number // in hours
    }],
    isVerified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

TechnicianSchema.index({ specializations: 1, availability: 1 });
TechnicianSchema.index({ rating: -1, completedJobs: -1 });
TechnicianSchema.index({ 'location.city': 1 });
```

### Update MaintenanceRequest Model

```javascript
// Add to MaintenanceRequest model
aiAnalysis: {
    category: {
        type: String,
        enum: [
            'plumbing',
            'electrical',
            'hvac',
            'structural',
            'appliance',
            'cosmetic',
            'other'
        ]
    },
    urgencyScore: {
        type: Number,
        min: 0,
        max: 100
    },
    estimatedCost: {
        min: Number,
        max: Number,
        confidence: Number
    },
    estimatedDuration: {
        hours: Number,
        confidence: Number
    },
    recommendedTechnicians: [{
        technician: {
            type: mongoose.Schema.ObjectId,
            ref: 'Technician'
        },
        matchScore: Number,
        reason: String
    }],
    keywords: [String],
    analyzedAt: Date
},
assignedTechnician: {
    type: mongoose.Schema.ObjectId,
    ref: 'Technician'
},
assignedAt: Date,
actualCost: Number,
actualDuration: Number,
technicianRating: {
    type: Number,
    min: 1,
    max: 5
}
```

## 🔧 Implementation Steps

### Step 1: Create Maintenance AI Service (Week 1)

**File**: `backend/services/maintenanceAIService.js`

```javascript
class MaintenanceAIService {
    // Analyze maintenance request
    async analyzeRequest(maintenanceRequest) {
        const analysis = {
            category: await this.detectCategory(maintenanceRequest),
            urgencyScore: await this.calculateUrgencyScore(maintenanceRequest),
            estimatedCost: await this.estimateCost(maintenanceRequest),
            estimatedDuration: await this.estimateDuration(maintenanceRequest),
            keywords: this.extractKeywords(maintenanceRequest.description)
        };

        return analysis;
    }

    // Category detection using keywords
    detectCategory(request) {
        const keywords = {
            plumbing: ['leak', 'pipe', 'drain', 'water', 'faucet', 'toilet', 'sink'],
            electrical: ['light', 'switch', 'outlet', 'wiring', 'power', 'breaker'],
            hvac: ['heating', 'cooling', 'ac', 'air conditioner', 'furnace', 'ventilation'],
            structural: ['wall', 'ceiling', 'floor', 'foundation', 'crack', 'damage'],
            appliance: ['refrigerator', 'stove', 'oven', 'dishwasher', 'washer', 'dryer']
        };

        const description = request.description.toLowerCase();
        let bestMatch = 'other';
        let maxScore = 0;

        for (const [category, words] of Object.entries(keywords)) {
            const score = words.filter(word => description.includes(word)).length;
            if (score > maxScore) {
                maxScore = score;
                bestMatch = category;
            }
        }

        return bestMatch;
    }

    // Urgency scoring
    async calculateUrgencyScore(request) {
        let score = 0;

        // Base priority score
        const priorityScores = {
            'Urgent': 90,
            'High': 70,
            'Medium': 50,
            'Low': 30
        };
        score += priorityScores[request.priority] || 50;

        // Age factor (older = more urgent)
        const ageInDays = (Date.now() - request.submittedDate) / (1000 * 60 * 60 * 24);
        score += Math.min(ageInDays * 2, 20);

        // Keyword urgency boost
        const urgentKeywords = ['emergency', 'flooding', 'fire', 'gas', 'broken', 'urgent'];
        const hasUrgentKeyword = urgentKeywords.some(kw =>
            request.description.toLowerCase().includes(kw)
        );
        if (hasUrgentKeyword) score += 15;

        return Math.min(Math.round(score), 100);
    }

    // Cost estimation using historical data
    async estimateCost(request) {
        const category = await this.detectCategory(request);

        // Get historical data for this category
        const historicalRequests = await MaintenanceRequest.find({
            'aiAnalysis.category': category,
            actualCost: { $exists: true, $gt: 0 }
        }).limit(50);

        if (historicalRequests.length < 5) {
            // Use default estimates
            return this.getDefaultCostEstimate(category, request.priority);
        }

        // Calculate statistics
        const costs = historicalRequests.map(r => r.actualCost);
        const mean = costs.reduce((a, b) => a + b, 0) / costs.length;
        const stdDev = Math.sqrt(
            costs.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / costs.length
        );

        return {
            min: Math.round(mean - stdDev),
            max: Math.round(mean + stdDev),
            confidence: Math.min(historicalRequests.length / 50, 1)
        };
    }

    getDefaultCostEstimate(category, priority) {
        const defaults = {
            plumbing: { low: 2000, high: 8000 },
            electrical: { low: 1500, high: 6000 },
            hvac: { low: 3000, high: 12000 },
            structural: { low: 5000, high: 25000 },
            appliance: { low: 2000, high: 10000 },
            cosmetic: { low: 1000, high: 5000 },
            other: { low: 2000, high: 8000 }
        };

        const multipliers = {
            'Urgent': 1.5,
            'High': 1.2,
            'Medium': 1.0,
            'Low': 0.8
        };

        const base = defaults[category] || defaults.other;
        const multiplier = multipliers[priority] || 1.0;

        return {
            min: Math.round(base.low * multiplier),
            max: Math.round(base.high * multiplier),
            confidence: 0.5
        };
    }

    // Find best matching technicians
    async findMatchingTechnicians(request, analysis, limit = 5) {
        const Technician = require('../models/Technician');

        // Find technicians with matching specialization
        const technicians = await Technician.find({
            specializations: analysis.category,
            availability: 'available',
            isVerified: true
        }).sort({ rating: -1, completedJobs: -1 });

        // Score each technician
        const scoredTechnicians = technicians.map(tech => {
            let matchScore = 0;

            // Rating score (0-40 points)
            matchScore += (tech.rating / 5) * 40;

            // Experience score (0-30 points)
            matchScore += Math.min(tech.completedJobs / 100 * 30, 30);

            // Response time score (0-20 points)
            matchScore += Math.max(20 - tech.averageResponseTime, 0);

            // Specialization depth (0-10 points)
            if (tech.specializations.includes(analysis.category)) {
                matchScore += 10;
            }

            return {
                technician: tech._id,
                matchScore: Math.round(matchScore),
                reason: this.generateMatchReason(tech, matchScore)
            };
        });

        return scoredTechnicians
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, limit);
    }

    generateMatchReason(tech, score) {
        const reasons = [];

        if (tech.rating >= 4.5) reasons.push('highly rated');
        if (tech.completedJobs > 50) reasons.push('experienced');
        if (tech.averageResponseTime < 12) reasons.push('fast response');
        if (tech.yearsOfExperience > 5) reasons.push(`${tech.yearsOfExperience} years experience`);

        return reasons.join(', ') || 'qualified technician';
    }
}
```

### Step 2: Create Technician Model & Routes (Week 1)

**Files**:
- `backend/models/Technician.js`
- `backend/routes/technicians.js`
- `backend/controllers/technicians.js`

### Step 3: Auto-Assignment Logic (Week 2)

Automatically assign best-matched technician when maintenance request is created.

### Step 4: Integrate with AI Manager (Week 2)

Allow AI Manager to trigger maintenance analysis and technician assignment.

### Step 5: Build Admin Dashboard (Week 2-3)

- View all technicians
- Approve/verify technicians
- Monitor maintenance analytics
- Track technician performance

## 🧪 Testing Strategy

1. **Category Detection**: Test with 100+ real descriptions
2. **Cost Estimation**: Compare with actual costs (accuracy > 70%)
3. **Technician Matching**: Verify best match selected
4. **Performance**: Analyze < 2 seconds per request

## 📈 Success Metrics

- Category detection accuracy: > 85%
- Cost estimation accuracy: ± 30% of actual
- Technician match quality: > 80% satisfaction
- Auto-assignment rate: > 60%

---

# Feature 3: Enhanced Auto Follow-Up System

## 📋 Overview

Comprehensive automated follow-up system with multi-channel support, smart scheduling, and A/B testing.

**Note**: We already implemented basic auto follow-up in lead scoring service. This enhances it significantly.

## 🎯 Objectives

- Multi-channel follow-ups (Email, WhatsApp, SMS, Voice)
- Intelligent scheduling based on user behavior
- A/B testing for message optimization
- Response tracking and analysis
- Escalation paths for non-responsive leads

## 🏗️ Architecture

```
Auto Follow-Up System
├── Scheduler
│   ├── Time Optimizer
│   ├── Channel Selector
│   └── Frequency Manager
├── Message Generator
│   ├── Template Engine
│   ├── Personalization
│   └── A/B Test Manager
├── Delivery Engine
│   ├── Email Sender
│   ├── WhatsApp Sender
│   ├── SMS Sender
│   └── Voice Caller
└── Analytics
    ├── Response Tracker
    ├── Conversion Analyzer
    └── Performance Reporter
```

## 📊 Database Schema Changes

### New Collection: FollowUpCampaigns

```javascript
const FollowUpCampaignSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    targetAudience: {
        leadStatus: [String],
        buyingIntent: [String],
        scoreRange: {
            min: Number,
            max: Number
        },
        lastContactDays: Number
    },
    sequence: [{
        step: Number,
        delayDays: Number,
        channel: {
            type: String,
            enum: ['email', 'whatsapp', 'sms', 'voice']
        },
        messageTemplate: {
            type: mongoose.Schema.ObjectId,
            ref: 'MessageTemplate'
        },
        abTest: {
            enabled: Boolean,
            variantA: String,
            variantB: String,
            splitRatio: Number // 0-1
        }
    }],
    status: {
        type: String,
        enum: ['draft', 'active', 'paused', 'completed'],
        default: 'draft'
    },
    stats: {
        sent: Number,
        delivered: Number,
        opened: Number,
        clicked: Number,
        replied: Number,
        converted: Number
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
```

### New Collection: MessageTemplates

```javascript
const MessageTemplateSchema = new mongoose.Schema({
    name: String,
    type: {
        type: String,
        enum: ['email', 'whatsapp', 'sms', 'voice']
    },
    subject: String, // For email
    body: String,
    variables: [String], // {{name}}, {{property}}, etc.
    category: String,
    language: {
        type: String,
        default: 'en'
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    stats: {
        used: Number,
        opened: Number,
        clicked: Number,
        converted: Number
    }
});
```

### Update Lead Model

```javascript
// Add to Lead model
followUp: {
    campaigns: [{
        campaign: {
            type: mongoose.Schema.ObjectId,
            ref: 'FollowUpCampaign'
        },
        enrolledAt: Date,
        currentStep: Number,
        nextScheduledAt: Date,
        completed: Boolean
    }],
    history: [{
        channel: String,
        template: String,
        sentAt: Date,
        deliveredAt: Date,
        openedAt: Date,
        clickedAt: Date,
        repliedAt: Date,
        response: String
    }],
    preferences: {
        preferredChannel: String,
        preferredTime: String, // Morning, Afternoon, Evening
        doNotContact: Boolean,
        unsubscribed: Boolean
    }
}
```

## 🔧 Implementation Steps

### Step 1: Create Enhanced Follow-Up Service (Week 1)

**File**: `backend/services/enhancedFollowUpService.js`

### Step 2: Implement WhatsApp Integration (Week 1)

Use Twilio API for WhatsApp Business API.

### Step 3: Build Campaign Manager (Week 2)

Admin interface to create and manage follow-up campaigns.

### Step 4: Implement A/B Testing (Week 2)

Test different message variants and optimize.

### Step 5: Analytics Dashboard (Week 2-3)

Track campaign performance and conversion rates.

## 📈 Success Metrics

- Email open rate: > 25%
- WhatsApp read rate: > 60%
- Response rate: > 15%
- Conversion rate: > 5%
- Unsubscribe rate: < 2%

---

# Feature 4: Role Detection with Confidence Scores

## 📋 Overview

Intelligent system that automatically detects user roles based on behavior patterns, with confidence scores for hybrid roles.

## 🎯 Objectives

- Automatically identify user's primary role
- Detect hybrid roles (e.g., Landlord + Agent)
- Assign confidence scores to each role
- Dynamically activate role-specific features
- Learn and improve from user behavior

## 🏗️ Architecture

```
Role Detection System
├── Behavior Analyzer
│   ├── Activity Tracker
│   ├── Pattern Detector
│   └── Feature Usage Monitor
├── ML Model (Optional)
│   ├── Training Pipeline
│   ├── Prediction Engine
│   └── Confidence Calculator
├── Rule-Based Engine
│   ├── Heuristic Rules
│   ├── Threshold Checker
│   └── Role Assigner
└── Profile Manager
    ├── Role Suggester
    ├── Feature Activator
    └── Permission Manager
```

## 📊 Database Schema Changes

### Update User Model

```javascript
// Add to User model
roleDetection: {
    detectedRoles: [{
        role: {
            type: String,
            enum: ['Agent', 'Property Seller', 'Landlord', 'Tenant', 'Surveyor', 'Investor']
        },
        confidence: {
            type: Number,
            min: 0,
            max: 1
        },
        indicators: [String], // What led to this detection
        detectedAt: Date,
        lastUpdated: Date
    }],
    primaryRole: {
        type: String,
        enum: ['Agent', 'Property Seller', 'Landlord', 'Tenant', 'Surveyor', 'Investor']
    },
    secondaryRoles: [String],
    isHybrid: {
        type: Boolean,
        default: false
    },
    behaviorProfile: {
        propertiesListed: Number,
        propertiesManaged: Number,
        leadsGenerated: Number,
        surveysRequested: Number,
        tenantsManaged: Number,
        paymentsReceived: Number,
        loginFrequency: String, // daily, weekly, monthly
        primaryFeatures: [String],
        lastAnalyzed: Date
    }
}
```

### New Collection: UserActivities

```javascript
const UserActivitySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    activityType: {
        type: String,
        enum: [
            'property_listed',
            'property_viewed',
            'lead_created',
            'payment_received',
            'maintenance_requested',
            'tenant_added',
            'survey_requested',
            'report_generated',
            'feature_accessed'
        ]
    },
    metadata: mongoose.Schema.Types.Mixed,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

UserActivitySchema.index({ user: 1, timestamp: -1 });
UserActivitySchema.index({ activityType: 1, timestamp: -1 });
```

## 🔧 Implementation Steps

### Step 1: Activity Tracking Middleware (Week 1)

**File**: `backend/middleware/activityTracker.js`

```javascript
const UserActivity = require('../models/UserActivity');

const trackActivity = (activityType) => {
    return async (req, res, next) => {
        try {
            if (req.user) {
                await UserActivity.create({
                    user: req.user._id,
                    activityType,
                    metadata: {
                        path: req.path,
                        method: req.method,
                        body: req.body
                    }
                });
            }
        } catch (error) {
            console.error('Activity tracking error:', error);
        }
        next();
    };
};

module.exports = { trackActivity };
```

### Step 2: Role Detection Service (Week 1-2)

**File**: `backend/services/roleDetectionService.js`

```javascript
class RoleDetectionService {
    constructor() {
        this.roleIndicators = {
            'Agent': {
                patterns: [
                    { type: 'property_listed', weight: 0.3 },
                    { type: 'lead_created', weight: 0.4 },
                    { type: 'multiple_properties', weight: 0.3 }
                ],
                threshold: 0.6
            },
            'Landlord': {
                patterns: [
                    { type: 'tenant_added', weight: 0.4 },
                    { type: 'payment_received', weight: 0.3 },
                    { type: 'maintenance_requested', weight: 0.3 }
                ],
                threshold: 0.6
            },
            'Property Seller': {
                patterns: [
                    { type: 'property_listed', weight: 0.5 },
                    { type: 'single_property', weight: 0.3 },
                    { type: 'lead_interested', weight: 0.2 }
                ],
                threshold: 0.5
            },
            'Surveyor': {
                patterns: [
                    { type: 'survey_completed', weight: 0.6 },
                    { type: 'survey_profile_updated', weight: 0.4 }
                ],
                threshold: 0.7
            }
        };
    }

    async analyzeUser(userId) {
        const user = await User.findById(userId);
        const activities = await UserActivity.find({ user: userId })
            .sort({ timestamp: -1 })
            .limit(100);

        const behaviorProfile = this.buildBehaviorProfile(user, activities);
        const roleScores = this.calculateRoleScores(behaviorProfile);
        const detectedRoles = this.identifyRoles(roleScores);

        return {
            behaviorProfile,
            detectedRoles,
            primaryRole: detectedRoles[0]?.role,
            isHybrid: detectedRoles.length > 1
        };
    }

    buildBehaviorProfile(user, activities) {
        return {
            propertiesListed: activities.filter(a => a.activityType === 'property_listed').length,
            leadsGenerated: activities.filter(a => a.activityType === 'lead_created').length,
            tenantsManaged: activities.filter(a => a.activityType === 'tenant_added').length,
            // ... more metrics
        };
    }

    calculateRoleScores(profile) {
        const scores = {};

        for (const [role, config] of Object.entries(this.roleIndicators)) {
            let score = 0;
            const indicators = [];

            for (const pattern of config.patterns) {
                const value = this.evaluatePattern(pattern, profile);
                if (value > 0) {
                    score += value * pattern.weight;
                    indicators.push(pattern.type);
                }
            }

            scores[role] = {
                confidence: Math.min(score, 1),
                indicators
            };
        }

        return scores;
    }

    evaluatePattern(pattern, profile) {
        // Custom logic for each pattern type
        switch (pattern.type) {
            case 'property_listed':
                return Math.min(profile.propertiesListed / 5, 1);
            case 'lead_created':
                return Math.min(profile.leadsGenerated / 10, 1);
            // ... more patterns
            default:
                return 0;
        }
    }

    identifyRoles(scores) {
        const detectedRoles = [];

        for (const [role, data] of Object.entries(scores)) {
            const threshold = this.roleIndicators[role].threshold;

            if (data.confidence >= threshold) {
                detectedRoles.push({
                    role,
                    confidence: data.confidence,
                    indicators: data.indicators,
                    detectedAt: new Date()
                });
            }
        }

        return detectedRoles.sort((a, b) => b.confidence - a.confidence);
    }

    async updateUserRole(userId) {
        const analysis = await this.analyzeUser(userId);

        await User.findByIdAndUpdate(userId, {
            'roleDetection.detectedRoles': analysis.detectedRoles,
            'roleDetection.primaryRole': analysis.primaryRole,
            'roleDetection.isHybrid': analysis.isHybrid,
            'roleDetection.behaviorProfile': analysis.behaviorProfile,
            'roleDetection.behaviorProfile.lastAnalyzed': new Date()
        });

        return analysis;
    }
}
```

### Step 3: Cron Job for Periodic Analysis (Week 2)

Run role detection weekly for all users.

### Step 4: API Endpoints (Week 2)

- `GET /api/role-detection/analyze/:userId` - Analyze specific user
- `GET /api/role-detection/suggestions` - Get role suggestions
- `POST /api/role-detection/confirm` - User confirms suggested role
- `GET /api/role-detection/stats` - Role distribution analytics

### Step 5: Feature Activation Logic (Week 2-3)

Automatically enable/disable features based on detected roles.

### Step 6: (Optional) ML Model Training (Week 3-4)

Train ML model using historical data for better predictions.

## 🧪 Testing Strategy

1. **Pattern Recognition**: Test with known user profiles
2. **Accuracy**: Validate against manually labeled users (> 80%)
3. **Hybrid Detection**: Test users with multiple roles
4. **Edge Cases**: New users, inactive users

## 📈 Success Metrics

- Detection accuracy: > 80%
- Confidence scores: Average > 0.7
- Hybrid role detection: > 90% accuracy
- User confirmation rate: > 70%

---

# 📅 Overall Implementation Timeline

## Week 1-2: Foundation
- ✅ Set up AI Manager architecture
- ✅ Create database schemas
- ✅ Implement monitoring loops
- ✅ Build decision rules engine

## Week 3-4: Maintenance AI & Follow-Up
- ✅ Create Technician model
- ✅ Implement maintenance AI analysis
- ✅ Enhance follow-up system
- ✅ WhatsApp integration

## Week 5-6: Role Detection & Integration
- ✅ Implement activity tracking
- ✅ Build role detection service
- ✅ Integrate all systems with AI Manager
- ✅ Testing and refinement

---

# 🎯 Priority Recommendations

Based on business value and complexity:

**Phase 1 (Highest Priority)**:
1. Maintenance AI Analysis (2 weeks)
   - Immediate value for landlords
   - Clear ROI

**Phase 2 (High Priority)**:
2. Enhanced Auto Follow-Up (2 weeks)
   - Increases conversion rates
   - Competitive advantage

**Phase 3 (Medium Priority)**:
3. Role Detection (2 weeks)
   - Improves UX
   - Enables personalization

**Phase 4 (Strategic)**:
4. AI Manager (2 weeks)
   - Ties everything together
   - Long-term platform differentiator

---

# 💰 Resource Requirements

## Team
- 1 Senior Backend Developer
- 1 ML Engineer (optional, for advanced features)
- 1 Frontend Developer (for dashboards)
- 1 QA Engineer

## Infrastructure
- Additional database storage: ~10GB/month
- Cron job processing: Minimal overhead
- Twilio/WhatsApp API credits: $100-500/month
- Optional: ML model hosting (AWS SageMaker/GCP AI Platform)

## Third-Party Services
- Twilio (WhatsApp/SMS): Pay-as-you-go
- Email service (already configured)
- Optional: Gemini API for advanced analysis

---

# 📊 Success Criteria

## Maintenance AI
- 85% category detection accuracy
- Cost estimates within ±30%
- 70% technician auto-assignment rate
- 4.5+ technician match satisfaction

## Auto Follow-Up
- 25% email open rate
- 15% response rate
- 5% conversion increase
- <2% unsubscribe rate

## Role Detection
- 80% detection accuracy
- 0.7+ average confidence
- 70% user confirmation rate
- 90% hybrid role accuracy

## AI Manager
- 95% event detection accuracy
- 90% action success rate
- <5 min response time
- <5% false positive rate

---

# 🚀 Getting Started

## Immediate Next Steps

1. **Week 1**: Choose which feature to implement first
2. **Set up development environment**: Create feature branches
3. **Database migrations**: Create new collections
4. **Testing infrastructure**: Set up test data

## Recommended Order

1. **Maintenance AI** (immediate value, clear use case)
2. **Auto Follow-Up** (builds on existing lead scoring)
3. **Role Detection** (improves overall platform intelligence)
4. **AI Manager** (orchestrates all features)

---

**Document Version**: 1.0
**Last Updated**: December 30, 2025
**Status**: Ready for Review & Approval
