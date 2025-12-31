const mongoose = require('mongoose');

const FinancialReportSchema = new mongoose.Schema({
    landlord: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    period: {
        month: {
            type: Number,
            required: true,
            min: 1,
            max: 12,
        },
        year: {
            type: Number,
            required: true,
        },
    },
    // Income Breakdown
    income: {
        rentCollected: {
            type: Number,
            default: 0,
        },
        deposits: {
            type: Number,
            default: 0,
        },
        lateFees: {
            type: Number,
            default: 0,
        },
        other: {
            type: Number,
            default: 0,
        },
        total: {
            type: Number,
            default: 0,
        },
    },
    // Expense Breakdown
    expenses: {
        maintenance: {
            type: Number,
            default: 0,
        },
        utilities: {
            type: Number,
            default: 0,
        },
        propertyTax: {
            type: Number,
            default: 0,
        },
        insurance: {
            type: Number,
            default: 0,
        },
        management: {
            type: Number,
            default: 0,
        },
        marketing: {
            type: Number,
            default: 0,
        },
        other: {
            type: Number,
            default: 0,
        },
        total: {
            type: Number,
            default: 0,
        },
    },
    // Financial Metrics
    metrics: {
        netIncome: Number, // income.total - expenses.total
        occupancyRate: Number, // percentage
        collectionRate: Number, // percentage of rent collected vs expected
        averageRentPerUnit: Number,
        profitMargin: Number, // percentage
    },
    // Rent Collection Details
    rentCollection: {
        totalExpected: Number,
        totalCollected: Number,
        outstanding: Number,
        overdueAmount: Number,
        onTimePayments: Number,
        latePayments: Number,
        missedPayments: Number,
    },
    // Property Breakdown
    propertyBreakdown: [{
        property: {
            type: mongoose.Schema.ObjectId,
            ref: 'Property',
        },
        income: Number,
        expenses: Number,
        netIncome: Number,
        occupancyRate: Number,
    }],
    // AI Insights & Forecasting
    aiInsights: {
        cashflowForecast: {
            nextMonth: {
                expectedIncome: Number,
                expectedExpenses: Number,
                projectedNetIncome: Number,
            },
            nextQuarter: {
                expectedIncome: Number,
                expectedExpenses: Number,
                projectedNetIncome: Number,
            },
        },
        riskAssessment: {
            defaultRisk: {
                score: Number, // 0-100
                level: {
                    type: String,
                    enum: ['Low', 'Medium', 'High', 'Critical'],
                },
                tenantsAtRisk: Number,
                potentialLoss: Number,
            },
            recommendations: [String],
        },
        trends: {
            incomeGrowth: Number, // percentage
            expenseGrowth: Number, // percentage
            profitGrowth: Number, // percentage
        },
        analyzedAt: Date,
    },
    generatedAt: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['Draft', 'Final', 'Sent'],
        default: 'Draft',
    },
});

// Indexes for performance
FinancialReportSchema.index({ landlord: 1, 'period.year': -1, 'period.month': -1 });
FinancialReportSchema.index({ landlord: 1, generatedAt: -1 });

// Pre-save hook to calculate totals
FinancialReportSchema.pre('save', function(next) {
    // Calculate income total
    this.income.total =
        (this.income.rentCollected || 0) +
        (this.income.deposits || 0) +
        (this.income.lateFees || 0) +
        (this.income.other || 0);

    // Calculate expense total
    this.expenses.total =
        (this.expenses.maintenance || 0) +
        (this.expenses.utilities || 0) +
        (this.expenses.propertyTax || 0) +
        (this.expenses.insurance || 0) +
        (this.expenses.management || 0) +
        (this.expenses.marketing || 0) +
        (this.expenses.other || 0);

    // Calculate net income
    this.metrics = this.metrics || {};
    this.metrics.netIncome = this.income.total - this.expenses.total;

    // Calculate profit margin
    if (this.income.total > 0) {
        this.metrics.profitMargin = ((this.metrics.netIncome / this.income.total) * 100).toFixed(2);
    } else {
        this.metrics.profitMargin = 0;
    }

    next();
});

module.exports = mongoose.model('FinancialReport', FinancialReportSchema);
