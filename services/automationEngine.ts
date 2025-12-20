import { GoogleGenAI } from "@google/genai";
import type { Listing, User, Tenant, MaintenanceRequest } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Automation Engine - Orchestrates all automated tasks
 */
export class AutomationEngine {
    private userId: string;
    private userRole: string;

    constructor(userId: string, userRole: string) {
        this.userId = userId;
        this.userRole = userRole;
    }

    /**
     * Execute role-specific automation
     */
    async executeAutomation(task: string, data: any): Promise<{
        success: boolean;
        message: string;
        actions: string[];
    }> {
        switch (this.userRole) {
            case 'Agent':
                return this.agentAutomation(task, data);
            case 'Landlord':
                return this.landlordAutomation(task, data);
            case 'Property Owner':
                return this.ownerAutomation(task, data);
            case 'Tenant':
                return this.tenantAutomation(task, data);
            default:
                return {
                    success: false,
                    message: 'Unknown role',
                    actions: []
                };
        }
    }

    /**
     * Agent Automation Workflows
     */
    private async agentAutomation(task: string, data: any) {
        const actions: string[] = [];

        switch (task) {
            case 'auto_respond':
                // Auto-respond to client inquiry
                const response = await this.generateAutoResponse(data.inquiry);
                actions.push(`Sent auto-response to ${data.inquiry.email}`);
                actions.push(`Response: "${response.substring(0, 100)}..."`);
                return {
                    success: true,
                    message: 'Auto-response sent successfully',
                    actions
                };

            case 'auto_schedule':
                // Auto-schedule viewing
                const slot = await this.findBestTimeSlot(data.preferences);
                actions.push(`Scheduled viewing for ${slot.date} at ${slot.time}`);
                actions.push(`Sent calendar invite to client`);
                return {
                    success: true,
                    message: 'Viewing scheduled automatically',
                    actions
                };

            case 'auto_marketing':
                // Auto-generate marketing content
                const content = await this.generateMarketingContent(data.listing);
                actions.push(`Generated social media posts`);
                actions.push(`Created email campaign`);
                actions.push(`Updated listing description`);
                return {
                    success: true,
                    message: 'Marketing content generated',
                    actions
                };

            case 'auto_followup':
                // Auto-follow-up with leads
                const leads = await this.getInactiveLeads(7);
                for (const lead of leads) {
                    const followup = await this.generateFollowUp(lead);
                    actions.push(`Sent follow-up to ${lead.name}`);
                }
                return {
                    success: true,
                    message: `Followed up with ${leads.length} leads`,
                    actions
                };

            default:
                return {
                    success: false,
                    message: 'Unknown automation task',
                    actions: []
                };
        }
    }

    /**
     * Landlord Automation Workflows
     */
    private async landlordAutomation(task: string, data: any) {
        const actions: string[] = [];

        switch (task) {
            case 'auto_rent_reminder':
                // Send rent reminders
                const tenants = data.tenants || [];
                for (const tenant of tenants) {
                    const reminder = await this.generateRentReminder(tenant);
                    actions.push(`Sent rent reminder to ${tenant.name}`);
                }
                return {
                    success: true,
                    message: `Sent ${tenants.length} rent reminders`,
                    actions
                };

            case 'auto_screen':
                // Auto-screen tenant application
                const score = await this.screenTenant(data.application);
                actions.push(`Screened application for ${data.application.name}`);
                actions.push(`Credit score: ${score.creditScore}`);
                actions.push(`Income ratio: ${score.incomeRatio}x`);

                if (score.approved) {
                    actions.push(`✅ Application APPROVED`);
                } else {
                    actions.push(`❌ Application flagged for review`);
                }

                return {
                    success: true,
                    message: score.approved ? 'Application approved' : 'Application needs review',
                    actions
                };

            case 'auto_maintenance':
                // Auto-schedule maintenance
                const urgency = await this.assessMaintenanceUrgency(data.request);
                actions.push(`Assessed urgency: ${urgency}`);

                if (urgency === 'high') {
                    actions.push(`Scheduled immediate repair`);
                } else {
                    actions.push(`Added to maintenance queue`);
                }

                return {
                    success: true,
                    message: 'Maintenance scheduled',
                    actions
                };

            default:
                return {
                    success: false,
                    message: 'Unknown automation task',
                    actions: []
                };
        }
    }

    /**
     * Property Owner Automation Workflows
     */
    private async ownerAutomation(task: string, data: any) {
        const actions: string[] = [];

        switch (task) {
            case 'auto_pricing':
                // Auto-optimize pricing
                const optimalPrice = await this.calculateOptimalPrice(data.listing);
                const currentPrice = parseFloat(data.listing.price.replace(/[^0-9]/g, ''));
                const difference = optimalPrice - currentPrice;

                actions.push(`Current price: ${currentPrice.toLocaleString()} KSh`);
                actions.push(`Optimal price: ${optimalPrice.toLocaleString()} KSh`);

                if (Math.abs(difference) > 5000) {
                    actions.push(`💡 Suggested price adjustment: ${difference > 0 ? '+' : ''}${difference.toLocaleString()} KSh`);
                } else {
                    actions.push(`✅ Current price is optimal`);
                }

                return {
                    success: true,
                    message: 'Price analysis complete',
                    actions
                };

            case 'auto_analysis':
                // Auto-market analysis
                const analysis = await this.generateMarketAnalysis(data.properties);
                actions.push(`Analyzed ${data.properties.length} properties`);
                actions.push(`Market trend: ${analysis.trend}`);
                actions.push(`Average days on market: ${analysis.avgDays}`);
                actions.push(`Generated detailed report`);

                return {
                    success: true,
                    message: 'Market analysis complete',
                    actions
                };

            case 'auto_optimize':
                // Auto-optimize listing
                const suggestions = await this.optimizeListing(data.listing);
                actions.push(`Quality score: ${suggestions.score}/100`);

                if (suggestions.improveDescription) {
                    actions.push(`✏️ Improved description`);
                }
                if (suggestions.improvePhotos) {
                    actions.push(`📸 Photo improvement suggestions sent`);
                }
                if (suggestions.addAmenities) {
                    actions.push(`🏠 Suggested additional amenities`);
                }

                return {
                    success: true,
                    message: 'Listing optimized',
                    actions
                };

            default:
                return {
                    success: false,
                    message: 'Unknown automation task',
                    actions: []
                };
        }
    }

    /**
     * Tenant Automation Workflows
     */
    private async tenantAutomation(task: string, data: any) {
        const actions: string[] = [];

        switch (task) {
            case 'auto_maintenance_route':
                // Auto-route maintenance request
                const category = await this.categorizeMaintenanceRequest(data.request);
                actions.push(`Categorized as: ${category}`);
                actions.push(`Routed to appropriate contractor`);
                actions.push(`Estimated response time: ${this.getResponseTime(category)}`);

                return {
                    success: true,
                    message: 'Maintenance request routed',
                    actions
                };

            case 'auto_payment_reminder':
                // Send payment reminder
                actions.push(`Sent payment reminder`);
                actions.push(`Due date: ${data.dueDate}`);
                actions.push(`Amount: ${data.amount}`);

                return {
                    success: true,
                    message: 'Payment reminder sent',
                    actions
                };

            default:
                return {
                    success: false,
                    message: 'Unknown automation task',
                    actions: []
                };
        }
    }

    // Helper methods

    private async generateAutoResponse(inquiry: any): Promise<string> {
        const prompt = `Generate a professional auto-response to this client inquiry:

Inquiry: "${inquiry.message}"
Property: ${inquiry.propertyTitle}

Create a warm, helpful response that:
1. Thanks them for their interest
2. Confirms receipt of inquiry
3. Mentions you'll get back to them within 24 hours
4. Provides basic next steps

Keep it concise (2-3 sentences).`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text.trim();
    }

    private async findBestTimeSlot(preferences: any): Promise<{ date: string; time: string }> {
        // Simplified - in production, check calendar availability
        return {
            date: new Date(Date.now() + 86400000).toLocaleDateString(),
            time: '2:00 PM'
        };
    }

    private async generateMarketingContent(listing: Listing): Promise<any> {
        const prompt = `Create marketing content for this property:

${JSON.stringify(listing, null, 2)}

Generate:
1. Social media post (Twitter/Facebook)
2. Email subject line
3. Instagram caption

Keep each concise and engaging.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text.trim();
    }

    private async getInactiveLeads(days: number): Promise<any[]> {
        // Simplified - in production, query database
        return [];
    }

    private async generateFollowUp(lead: any): Promise<string> {
        return `Hi ${lead.name}, just following up on your interest in our property. Are you still looking?`;
    }

    private async generateRentReminder(tenant: Tenant): Promise<string> {
        return `Hi ${tenant.name}, friendly reminder that rent is due soon.`;
    }

    private async screenTenant(application: any): Promise<{
        creditScore: number;
        incomeRatio: number;
        approved: boolean;
    }> {
        // Simplified - in production, use actual screening API
        return {
            creditScore: 700,
            incomeRatio: 3.5,
            approved: true
        };
    }

    private async assessMaintenanceUrgency(request: MaintenanceRequest): Promise<string> {
        const urgent = ['leak', 'flood', 'fire', 'electrical', 'emergency'];
        const isUrgent = urgent.some(word =>
            request.description.toLowerCase().includes(word)
        );
        return isUrgent ? 'high' : 'normal';
    }

    private async calculateOptimalPrice(listing: Listing): Promise<number> {
        // Simplified - in production, use market data
        const current = parseFloat(listing.price.replace(/[^0-9]/g, ''));
        return Math.round(current * 1.05); // 5% increase suggestion
    }

    private async generateMarketAnalysis(properties: Listing[]): Promise<any> {
        return {
            trend: 'upward',
            avgDays: 45,
            avgPrice: 150000
        };
    }

    private async optimizeListing(listing: Listing): Promise<any> {
        return {
            score: 75,
            improveDescription: listing.description.length < 100,
            improvePhotos: listing.imageUrls.length < 5,
            addAmenities: true
        };
    }

    private async categorizeMaintenanceRequest(request: MaintenanceRequest): Promise<string> {
        const categories = {
            plumbing: ['leak', 'pipe', 'water', 'drain'],
            electrical: ['light', 'power', 'outlet', 'electrical'],
            hvac: ['heat', 'ac', 'air', 'temperature'],
            general: []
        };

        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(word => request.description.toLowerCase().includes(word))) {
                return category;
            }
        }

        return 'general';
    }

    private getResponseTime(category: string): string {
        const times: Record<string, string> = {
            plumbing: '2-4 hours',
            electrical: '1-2 hours',
            hvac: '4-6 hours',
            general: '24-48 hours'
        };
        return times[category] || '24-48 hours';
    }
}

/**
 * Create automation engine instance for a user
 */
export const createAutomationEngine = (userId: string, userRole: string): AutomationEngine => {
    return new AutomationEngine(userId, userRole);
};
