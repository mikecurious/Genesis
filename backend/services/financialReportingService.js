const FinancialReport = require('../models/FinancialReport');
const User = require('../models/User');
const Property = require('../models/Property');
const Payment = require('../models/Payment');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const ExcelJS = require('exceljs');

class FinancialReportingService {
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }

    /**
     * Generate comprehensive financial report for a landlord
     */
    async generateReport(landlordId, month, year) {
        try {
            // Get or create report
            let report = await FinancialReport.findOne({
                landlord: landlordId,
                'period.month': month,
                'period.year': year,
            });

            if (!report) {
                report = new FinancialReport({
                    landlord: landlordId,
                    period: { month, year },
                });
            }

            // Calculate date range
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59);

            // Get landlord's properties
            const properties = await Property.find({ createdBy: landlordId });
            const propertyIds = properties.map(p => p._id);

            // Get all tenants for this landlord
            const tenants = await User.find({
                landlordId: landlordId,
                role: 'Tenant'
            });

            // Calculate income
            const incomeData = await this.calculateIncome(landlordId, startDate, endDate);
            report.income = incomeData.income;
            report.rentCollection = incomeData.rentCollection;

            // Calculate expenses
            const expenseData = await this.calculateExpenses(landlordId, propertyIds, startDate, endDate);
            report.expenses = expenseData;

            // Calculate metrics
            report.metrics = await this.calculateMetrics(landlordId, properties, tenants, report);

            // Calculate property breakdown
            report.propertyBreakdown = await this.calculatePropertyBreakdown(properties, startDate, endDate);

            // Generate AI insights
            const aiInsights = await this.generateAIInsights(report, properties, tenants);
            report.aiInsights = aiInsights;

            await report.save();

            return await FinancialReport.findById(report._id)
                .populate('landlord', 'name email')
                .populate('propertyBreakdown.property', 'title location');

        } catch (error) {
            console.error('Error generating financial report:', error);
            throw error;
        }
    }

    /**
     * Calculate income for the period
     */
    async calculateIncome(landlordId, startDate, endDate) {
        try {
            // Get payments in this period
            const payments = await Payment.find({
                landlord: landlordId,
                paymentDate: { $gte: startDate, $lte: endDate },
                status: 'Completed'
            });

            const income = {
                rentCollected: 0,
                deposits: 0,
                lateFees: 0,
                other: 0,
            };

            payments.forEach(payment => {
                switch (payment.type) {
                    case 'rent':
                        income.rentCollected += payment.amount;
                        break;
                    case 'deposit':
                        income.deposits += payment.amount;
                        break;
                    case 'late_fee':
                        income.lateFees += payment.amount;
                        break;
                    default:
                        income.other += payment.amount;
                }
            });

            // Calculate rent collection metrics
            const tenants = await User.find({
                landlordId: landlordId,
                role: 'Tenant'
            });

            const totalExpected = tenants.reduce((sum, tenant) => sum + (tenant.rentAmount || 0), 0);
            const totalCollected = income.rentCollected;

            const rentCollection = {
                totalExpected,
                totalCollected,
                outstanding: totalExpected - totalCollected,
                overdueAmount: 0, // Calculate from overdue tenants
                onTimePayments: 0,
                latePayments: 0,
                missedPayments: 0,
            };

            // Count payment statuses
            tenants.forEach(tenant => {
                if (tenant.rentStatus === 'Paid') {
                    rentCollection.onTimePayments++;
                } else if (tenant.rentStatus === 'Overdue') {
                    rentCollection.missedPayments++;
                    rentCollection.overdueAmount += tenant.rentAmount || 0;
                } else {
                    rentCollection.latePayments++;
                }
            });

            return { income, rentCollection };

        } catch (error) {
            console.error('Error calculating income:', error);
            return {
                income: { rentCollected: 0, deposits: 0, lateFees: 0, other: 0 },
                rentCollection: {
                    totalExpected: 0,
                    totalCollected: 0,
                    outstanding: 0,
                    overdueAmount: 0,
                    onTimePayments: 0,
                    latePayments: 0,
                    missedPayments: 0,
                }
            };
        }
    }

    /**
     * Calculate expenses for the period
     */
    async calculateExpenses(landlordId, propertyIds, startDate, endDate) {
        try {
            // Get maintenance expenses
            const maintenanceRequests = await MaintenanceRequest.find({
                landlord: landlordId,
                status: 'Resolved',
                completedAt: { $gte: startDate, $lte: endDate }
            });

            const maintenanceCost = maintenanceRequests.reduce((sum, req) => sum + (req.actualCost || 0), 0);

            // For demo purposes, using sample data for other expenses
            // In production, you'd have expense tracking models
            const expenses = {
                maintenance: maintenanceCost,
                utilities: 0,
                propertyTax: 0,
                insurance: 0,
                management: 0,
                marketing: 0,
                other: 0,
            };

            return expenses;

        } catch (error) {
            console.error('Error calculating expenses:', error);
            return {
                maintenance: 0,
                utilities: 0,
                propertyTax: 0,
                insurance: 0,
                management: 0,
                marketing: 0,
                other: 0,
            };
        }
    }

    /**
     * Calculate financial metrics
     */
    async calculateMetrics(landlordId, properties, tenants, report) {
        try {
            // Calculate occupancy rate
            const totalUnits = properties.reduce((sum, prop) => sum + (prop.units || 1), 0);
            const occupiedUnits = tenants.filter(t => t.accountStatus === 'active').length;
            const occupancyRate = totalUnits > 0 ? ((occupiedUnits / totalUnits) * 100).toFixed(2) : 0;

            // Calculate collection rate
            const collectionRate = report.rentCollection.totalExpected > 0
                ? ((report.rentCollection.totalCollected / report.rentCollection.totalExpected) * 100).toFixed(2)
                : 0;

            // Calculate average rent per unit
            const averageRentPerUnit = occupiedUnits > 0
                ? (report.rentCollection.totalCollected / occupiedUnits).toFixed(2)
                : 0;

            return {
                occupancyRate: parseFloat(occupancyRate),
                collectionRate: parseFloat(collectionRate),
                averageRentPerUnit: parseFloat(averageRentPerUnit),
            };

        } catch (error) {
            console.error('Error calculating metrics:', error);
            return {
                occupancyRate: 0,
                collectionRate: 0,
                averageRentPerUnit: 0,
            };
        }
    }

    /**
     * Calculate breakdown by property
     */
    async calculatePropertyBreakdown(properties, startDate, endDate) {
        const breakdown = [];

        for (const property of properties) {
            const propertyData = {
                property: property._id,
                income: 0,
                expenses: 0,
                netIncome: 0,
                occupancyRate: 0,
            };

            // Get property income
            const payments = await Payment.find({
                property: property._id,
                paymentDate: { $gte: startDate, $lte: endDate },
                status: 'Completed'
            });

            propertyData.income = payments.reduce((sum, p) => sum + p.amount, 0);

            // Get property expenses
            const maintenance = await MaintenanceRequest.find({
                property: property._id,
                status: 'Resolved',
                completedAt: { $gte: startDate, $lte: endDate }
            });

            propertyData.expenses = maintenance.reduce((sum, m) => sum + (m.actualCost || 0), 0);
            propertyData.netIncome = propertyData.income - propertyData.expenses;

            // Calculate occupancy for this property
            const totalUnits = property.units || 1;
            const tenants = await User.find({
                propertyId: property._id,
                role: 'Tenant',
                accountStatus: 'active'
            });

            propertyData.occupancyRate = ((tenants.length / totalUnits) * 100).toFixed(2);

            breakdown.push(propertyData);
        }

        return breakdown;
    }

    /**
     * Generate AI insights and forecasting
     */
    async generateAIInsights(report, properties, tenants) {
        try {
            const prompt = `
You are a financial analyst for real estate property management. Analyze the following financial data and provide insights.

Financial Summary:
- Total Income: KSh ${report.income.total.toLocaleString()}
- Total Expenses: KSh ${report.expenses.total.toLocaleString()}
- Net Income: KSh ${report.metrics.netIncome.toLocaleString()}
- Occupancy Rate: ${report.metrics.occupancyRate}%
- Collection Rate: ${report.metrics.collectionRate}%

Rent Collection:
- Expected: KSh ${report.rentCollection.totalExpected.toLocaleString()}
- Collected: KSh ${report.rentCollection.totalCollected.toLocaleString()}
- Outstanding: KSh ${report.rentCollection.outstanding.toLocaleString()}
- Overdue: KSh ${report.rentCollection.overdueAmount.toLocaleString()}
- On-time payments: ${report.rentCollection.onTimePayments}
- Late payments: ${report.rentCollection.latePayments}
- Missed payments: ${report.rentCollection.missedPayments}

Provide a JSON response with:
{
    "cashflowForecast": {
        "nextMonth": {
            "expectedIncome": number (estimate),
            "expectedExpenses": number (estimate),
            "projectedNetIncome": number (calculated)
        },
        "nextQuarter": {
            "expectedIncome": number (estimate),
            "expectedExpenses": number (estimate),
            "projectedNetIncome": number (calculated)
        }
    },
    "riskAssessment": {
        "defaultRisk": {
            "score": number (0-100),
            "level": "Low|Medium|High|Critical",
            "tenantsAtRisk": number (estimate based on missed/late payments),
            "potentialLoss": number (estimated monthly loss)
        },
        "recommendations": [
            "actionable recommendation 1",
            "actionable recommendation 2",
            "actionable recommendation 3"
        ]
    },
    "trends": {
        "incomeGrowth": number (estimated % growth),
        "expenseGrowth": number (estimated % growth),
        "profitGrowth": number (estimated % growth)
    }
}
`;

            const result = await this.model.generateContent(prompt);
            const response = result.response.text();

            // Parse JSON response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Failed to parse AI response');
            }

            const insights = JSON.parse(jsonMatch[0]);
            insights.analyzedAt = new Date();

            return insights;

        } catch (error) {
            console.error('Error generating AI insights:', error);
            return {
                cashflowForecast: {
                    nextMonth: {
                        expectedIncome: report.income.total,
                        expectedExpenses: report.expenses.total,
                        projectedNetIncome: report.metrics.netIncome
                    },
                    nextQuarter: {
                        expectedIncome: report.income.total * 3,
                        expectedExpenses: report.expenses.total * 3,
                        projectedNetIncome: report.metrics.netIncome * 3
                    }
                },
                riskAssessment: {
                    defaultRisk: {
                        score: 30,
                        level: 'Low',
                        tenantsAtRisk: report.rentCollection.missedPayments,
                        potentialLoss: report.rentCollection.overdueAmount
                    },
                    recommendations: [
                        'Follow up with late-paying tenants',
                        'Consider implementing automatic payment reminders'
                    ]
                },
                trends: {
                    incomeGrowth: 0,
                    expenseGrowth: 0,
                    profitGrowth: 0
                },
                analyzedAt: new Date()
            };
        }
    }

    /**
     * Export report to Excel
     */
    async exportToExcel(reportId) {
        try {
            const report = await FinancialReport.findById(reportId)
                .populate('landlord', 'name email')
                .populate('propertyBreakdown.property', 'title location');

            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'Genesis Property Management';
            workbook.created = new Date();

            // Summary Sheet
            const summarySheet = workbook.addWorksheet('Summary');
            summarySheet.columns = [
                { header: 'Metric', key: 'metric', width: 30 },
                { header: 'Value', key: 'value', width: 20 }
            ];

            summarySheet.addRows([
                { metric: 'Report Period', value: `${report.period.month}/${report.period.year}` },
                { metric: 'Generated Date', value: report.generatedAt.toLocaleDateString() },
                { metric: '', value: '' },
                { metric: 'INCOME', value: '' },
                { metric: 'Rent Collected', value: `KSh ${report.income.rentCollected.toLocaleString()}` },
                { metric: 'Deposits', value: `KSh ${report.income.deposits.toLocaleString()}` },
                { metric: 'Late Fees', value: `KSh ${report.income.lateFees.toLocaleString()}` },
                { metric: 'Other Income', value: `KSh ${report.income.other.toLocaleString()}` },
                { metric: 'Total Income', value: `KSh ${report.income.total.toLocaleString()}` },
                { metric: '', value: '' },
                { metric: 'EXPENSES', value: '' },
                { metric: 'Maintenance', value: `KSh ${report.expenses.maintenance.toLocaleString()}` },
                { metric: 'Utilities', value: `KSh ${report.expenses.utilities.toLocaleString()}` },
                { metric: 'Property Tax', value: `KSh ${report.expenses.propertyTax.toLocaleString()}` },
                { metric: 'Insurance', value: `KSh ${report.expenses.insurance.toLocaleString()}` },
                { metric: 'Management', value: `KSh ${report.expenses.management.toLocaleString()}` },
                { metric: 'Marketing', value: `KSh ${report.expenses.marketing.toLocaleString()}` },
                { metric: 'Other Expenses', value: `KSh ${report.expenses.other.toLocaleString()}` },
                { metric: 'Total Expenses', value: `KSh ${report.expenses.total.toLocaleString()}` },
                { metric: '', value: '' },
                { metric: 'NET INCOME', value: `KSh ${report.metrics.netIncome.toLocaleString()}` },
                { metric: 'Profit Margin', value: `${report.metrics.profitMargin}%` },
                { metric: '', value: '' },
                { metric: 'METRICS', value: '' },
                { metric: 'Occupancy Rate', value: `${report.metrics.occupancyRate}%` },
                { metric: 'Collection Rate', value: `${report.metrics.collectionRate}%` },
                { metric: 'Average Rent/Unit', value: `KSh ${report.metrics.averageRentPerUnit.toLocaleString()}` },
            ]);

            // Property Breakdown Sheet
            if (report.propertyBreakdown && report.propertyBreakdown.length > 0) {
                const propertySheet = workbook.addWorksheet('Property Breakdown');
                propertySheet.columns = [
                    { header: 'Property', key: 'property', width: 30 },
                    { header: 'Income (KSh)', key: 'income', width: 15 },
                    { header: 'Expenses (KSh)', key: 'expenses', width: 15 },
                    { header: 'Net Income (KSh)', key: 'netIncome', width: 15 },
                    { header: 'Occupancy (%)', key: 'occupancyRate', width: 15 }
                ];

                report.propertyBreakdown.forEach(prop => {
                    propertySheet.addRow({
                        property: prop.property?.title || 'Unknown',
                        income: prop.income,
                        expenses: prop.expenses,
                        netIncome: prop.netIncome,
                        occupancyRate: prop.occupancyRate
                    });
                });
            }

            return workbook;

        } catch (error) {
            console.error('Error exporting to Excel:', error);
            throw error;
        }
    }
}

module.exports = new FinancialReportingService();
