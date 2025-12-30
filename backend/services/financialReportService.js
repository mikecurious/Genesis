const xlsx = require('xlsx');
const Payment = require('../models/Payment');
const Property = require('../models/Property');
const User = require('../models/User');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const path = require('path');
const fs = require('fs');

class FinancialReportService {
    /**
     * Generate comprehensive financial report for a user
     */
    async generateReport(userId, startDate, endDate) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            const report = {
                user: {
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                period: {
                    start: startDate,
                    end: endDate
                },
                income: await this.calculateIncome(userId, startDate, endDate),
                expenses: await this.calculateExpenses(userId, startDate, endDate),
                properties: await this.getPropertyPerformance(userId, startDate, endDate),
                cashflow: null,
                summary: null
            };

            // Calculate cashflow
            report.cashflow = {
                totalIncome: report.income.total,
                totalExpenses: report.expenses.total,
                netCashflow: report.income.total - report.expenses.total,
                cashflowTrend: this.calculateTrend(report.income.total, report.expenses.total)
            };

            // Generate summary
            report.summary = await this.generateSummary(report);

            return report;
        } catch (error) {
            console.error('Error generating financial report:', error);
            throw error;
        }
    }

    /**
     * Calculate total income for the period
     */
    async calculateIncome(userId, startDate, endDate) {
        try {
            // Get all completed payments for the user
            const payments = await Payment.find({
                user: userId,
                status: 'completed',
                createdAt: { $gte: startDate, $lte: endDate }
            });

            const incomeByType = {
                subscription: 0,
                property: 0,
                service: 0,
                tenant_payment: 0,
                other: 0
            };

            let total = 0;

            payments.forEach(payment => {
                const amount = payment.amount || 0;
                const type = payment.paymentType || 'other';

                incomeByType[type] = (incomeByType[type] || 0) + amount;
                total += amount;
            });

            return {
                total,
                byType: incomeByType,
                transactions: payments.length,
                details: payments.map(p => ({
                    date: p.createdAt,
                    type: p.paymentType,
                    amount: p.amount,
                    description: p.plan || p.metadata?.description || 'N/A',
                    reference: p.mpesaReceiptNumber || p.transactionId || 'N/A'
                }))
            };
        } catch (error) {
            console.error('Error calculating income:', error);
            return { total: 0, byType: {}, transactions: 0, details: [] };
        }
    }

    /**
     * Calculate total expenses for the period
     */
    async calculateExpenses(userId, startDate, endDate) {
        try {
            // For landlords, maintenance requests are expenses
            const maintenanceRequests = await MaintenanceRequest.find({
                landlord: userId,
                status: 'Resolved',
                submittedDate: { $gte: startDate, $lte: endDate }
            });

            // Estimate maintenance costs (in a real system, you'd have actual cost data)
            const maintenanceCosts = maintenanceRequests.map(req => {
                let estimatedCost = 0;
                switch (req.priority) {
                    case 'Urgent':
                        estimatedCost = 15000;
                        break;
                    case 'High':
                        estimatedCost = 10000;
                        break;
                    case 'Medium':
                        estimatedCost = 5000;
                        break;
                    case 'Low':
                        estimatedCost = 2000;
                        break;
                }
                return {
                    date: req.submittedDate,
                    type: 'maintenance',
                    amount: estimatedCost,
                    description: req.description,
                    priority: req.priority
                };
            });

            const totalMaintenance = maintenanceCosts.reduce((sum, item) => sum + item.amount, 0);

            return {
                total: totalMaintenance,
                byType: {
                    maintenance: totalMaintenance
                },
                transactions: maintenanceCosts.length,
                details: maintenanceCosts
            };
        } catch (error) {
            console.error('Error calculating expenses:', error);
            return { total: 0, byType: {}, transactions: 0, details: [] };
        }
    }

    /**
     * Get property performance metrics
     */
    async getPropertyPerformance(userId, startDate, endDate) {
        try {
            const properties = await Property.find({
                createdBy: userId
            });

            const performance = [];

            for (const property of properties) {
                // Get views and leads for this property
                const leads = await require('../models/Lead').countDocuments({
                    property: property._id,
                    createdAt: { $gte: startDate, $lte: endDate }
                });

                performance.push({
                    title: property.title,
                    location: property.location,
                    status: property.status,
                    views: property.views || 0,
                    leads: leads,
                    price: property.price,
                    currency: property.currency,
                    conversionRate: property.views > 0 ? ((leads / property.views) * 100).toFixed(2) : 0
                });
            }

            return performance;
        } catch (error) {
            console.error('Error getting property performance:', error);
            return [];
        }
    }

    /**
     * Calculate trend
     */
    calculateTrend(income, expenses) {
        if (income > expenses) {
            const percentage = ((income - expenses) / expenses * 100).toFixed(2);
            return `Positive (+${percentage}%)`;
        } else if (income < expenses) {
            const percentage = ((expenses - income) / income * 100).toFixed(2);
            return `Negative (-${percentage}%)`;
        } else {
            return 'Neutral (0%)';
        }
    }

    /**
     * Generate summary insights
     */
    async generateSummary(report) {
        const insights = [];

        // Cashflow insight
        if (report.cashflow.netCashflow > 0) {
            insights.push(`✅ Positive cashflow of ${report.cashflow.netCashflow.toLocaleString()} KSh`);
        } else if (report.cashflow.netCashflow < 0) {
            insights.push(`⚠️ Negative cashflow of ${Math.abs(report.cashflow.netCashflow).toLocaleString()} KSh`);
        } else {
            insights.push(`ℹ️ Break-even cashflow`);
        }

        // Income insight
        if (report.income.total > 0) {
            const avgTransaction = report.income.total / (report.income.transactions || 1);
            insights.push(`💰 ${report.income.transactions} income transactions, average ${avgTransaction.toLocaleString()} KSh`);
        }

        // Property performance
        const totalLeads = report.properties.reduce((sum, p) => sum + p.leads, 0);
        if (totalLeads > 0) {
            insights.push(`📊 Generated ${totalLeads} leads across ${report.properties.length} properties`);
        }

        // Top performing property
        if (report.properties.length > 0) {
            const topProperty = report.properties.reduce((max, p) => p.leads > max.leads ? p : max);
            if (topProperty.leads > 0) {
                insights.push(`🏆 Top performer: "${topProperty.title}" with ${topProperty.leads} leads`);
            }
        }

        return {
            insights,
            recommendation: this.generateRecommendation(report)
        };
    }

    /**
     * Generate AI-like recommendations
     */
    generateRecommendation(report) {
        if (report.cashflow.netCashflow < 0) {
            return 'Consider reviewing expenses, particularly maintenance costs. Look for opportunities to reduce overhead or increase rental income.';
        } else if (report.properties.length > 0) {
            const avgConversion = report.properties.reduce((sum, p) => sum + parseFloat(p.conversionRate), 0) / report.properties.length;
            if (avgConversion < 5) {
                return 'Lead conversion rate is below optimal. Consider improving property descriptions, adding more photos, or adjusting pricing strategy.';
            }
        }

        return 'Financial performance is healthy. Continue monitoring key metrics and consider expanding your property portfolio.';
    }

    /**
     * Export report to Excel
     */
    async exportToExcel(report) {
        try {
            const workbook = xlsx.utils.book_new();

            // Summary Sheet
            const summaryData = [
                ['Financial Report'],
                [''],
                ['User:', report.user.name],
                ['Email:', report.user.email],
                ['Role:', report.user.role],
                ['Period:', `${new Date(report.period.start).toLocaleDateString()} - ${new Date(report.period.end).toLocaleDateString()}`],
                [''],
                ['CASHFLOW SUMMARY'],
                ['Total Income:', report.cashflow.totalIncome],
                ['Total Expenses:', report.cashflow.totalExpenses],
                ['Net Cashflow:', report.cashflow.netCashflow],
                ['Trend:', report.cashflow.cashflowTrend],
                [''],
                ['INSIGHTS']
            ];

            report.summary.insights.forEach(insight => {
                summaryData.push([insight]);
            });

            summaryData.push(['']);
            summaryData.push(['RECOMMENDATION']);
            summaryData.push([report.summary.recommendation]);

            const summarySheet = xlsx.utils.aoa_to_sheet(summaryData);
            xlsx.utils.book_append_sheet(workbook, summarySheet, 'Summary');

            // Income Details Sheet
            const incomeData = [
                ['Date', 'Type', 'Amount', 'Description', 'Reference']
            ];

            report.income.details.forEach(item => {
                incomeData.push([
                    new Date(item.date).toLocaleDateString(),
                    item.type,
                    item.amount,
                    item.description,
                    item.reference
                ]);
            });

            const incomeSheet = xlsx.utils.aoa_to_sheet(incomeData);
            xlsx.utils.book_append_sheet(workbook, incomeSheet, 'Income');

            // Expenses Details Sheet
            const expensesData = [
                ['Date', 'Type', 'Amount', 'Description', 'Priority']
            ];

            report.expenses.details.forEach(item => {
                expensesData.push([
                    new Date(item.date).toLocaleDateString(),
                    item.type,
                    item.amount,
                    item.description,
                    item.priority || 'N/A'
                ]);
            });

            const expensesSheet = xlsx.utils.aoa_to_sheet(expensesData);
            xlsx.utils.book_append_sheet(workbook, expensesSheet, 'Expenses');

            // Property Performance Sheet
            const propertyData = [
                ['Title', 'Location', 'Status', 'Views', 'Leads', 'Price', 'Currency', 'Conversion Rate']
            ];

            report.properties.forEach(prop => {
                propertyData.push([
                    prop.title,
                    prop.location,
                    prop.status,
                    prop.views,
                    prop.leads,
                    prop.price,
                    prop.currency,
                    prop.conversionRate + '%'
                ]);
            });

            const propertySheet = xlsx.utils.aoa_to_sheet(propertyData);
            xlsx.utils.book_append_sheet(workbook, propertySheet, 'Properties');

            // Generate file
            const fileName = `financial_report_${Date.now()}.xlsx`;
            const filePath = path.join(__dirname, '../reports', fileName);

            // Ensure reports directory exists
            const reportsDir = path.join(__dirname, '../reports');
            if (!fs.existsSync(reportsDir)) {
                fs.mkdirSync(reportsDir, { recursive: true });
            }

            xlsx.writeFile(workbook, filePath);

            return {
                fileName,
                filePath,
                success: true
            };
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            throw error;
        }
    }

    /**
     * Generate monthly report for a user
     */
    async generateMonthlyReport(userId) {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        return await this.generateReport(userId, startDate, endDate);
    }

    /**
     * Generate quarterly report for a user
     */
    async generateQuarterlyReport(userId) {
        const now = new Date();
        const quarter = Math.floor(now.getMonth() / 3);
        const startDate = new Date(now.getFullYear(), quarter * 3, 1);
        const endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0, 23, 59, 59);

        return await this.generateReport(userId, startDate, endDate);
    }

    /**
     * Generate custom date range report
     */
    async generateCustomReport(userId, startDate, endDate) {
        return await this.generateReport(userId, new Date(startDate), new Date(endDate));
    }
}

module.exports = new FinancialReportService();
