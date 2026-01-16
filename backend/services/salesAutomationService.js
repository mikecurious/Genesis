const Lead = require('../models/Lead');
const Property = require('../models/Property');
const User = require('../models/User');
const Viewing = require('../models/Viewing');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const emailService = require('./emailService');
const viewingSchedulerService = require('./viewingSchedulerService');

class SalesAutomationService {
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }

    /**
     * Progress lead through sales funnel automatically
     */
    async progressLeadThroughFunnel(leadId) {
        try {
            const lead = await Lead.findById(leadId).populate('property');
            if (!lead) {
                throw new Error('Lead not found');
            }

            const currentStage = lead.salesFunnelStage;
            let nextAction = null;

            switch (currentStage) {
                case 'new':
                    // Send initial contact
                    nextAction = await this.sendInitialContact(lead);
                    lead.salesFunnelStage = 'contacted';
                    break;

                case 'contacted':
                    // Qualify the lead
                    nextAction = await this.qualifyLead(lead);
                    if (lead.score >= 60) {
                        lead.salesFunnelStage = 'qualified';
                    }
                    break;

                case 'qualified':
                    // Schedule viewing if high intent
                    if (lead.buyingIntent === 'high' || lead.buyingIntent === 'very-high') {
                        nextAction = await this.autoScheduleViewing(lead);
                    }
                    break;

                case 'viewed':
                    // Check if ready to negotiate
                    nextAction = await this.initiateNegotiation(lead);
                    break;

                case 'negotiating':
                    // Continue negotiation
                    nextAction = await this.continueNegotiation(lead);
                    break;

                default:
                    nextAction = { message: 'No automatic action for current stage' };
            }

            // Track AI action
            lead.aiEngagement.totalInteractions += 1;
            lead.aiEngagement.lastAIAction = {
                action: nextAction.action,
                timestamp: new Date(),
                reasoning: nextAction.reasoning
            };
            lead.aiEngagement.aiActions.push({
                action: nextAction.action,
                timestamp: new Date(),
                success: nextAction.success,
                reasoning: nextAction.reasoning,
                outcome: nextAction.outcome
            });

            // Add stage history
            if (currentStage !== lead.salesFunnelStage) {
                lead.stageHistory.push({
                    stage: lead.salesFunnelStage,
                    changedAt: new Date(),
                    changedBy: 'ai',
                    notes: nextAction.outcome
                });
            }

            await lead.save();
            return { lead, action: nextAction };

        } catch (error) {
            console.error('Error progressing lead through funnel:', error);
            throw error;
        }
    }

    /**
     * Send initial contact to new lead
     */
    async sendInitialContact(lead) {
        try {
            const property = lead.property;

            await emailService.sendEmail({
                to: lead.client.email,
                subject: `Thank you for your interest in ${property.title}`,
                html: this.generateInitialContactEmail(lead, property)
            });

            return {
                action: 'sent_initial_contact',
                success: true,
                reasoning: 'New lead requires initial contact',
                outcome: 'Initial contact email sent successfully'
            };

        } catch (error) {
            return {
                action: 'sent_initial_contact',
                success: false,
                reasoning: 'New lead requires initial contact',
                outcome: `Failed: ${error.message}`
            };
        }
    }

    /**
     * Qualify lead using AI
     */
    async qualifyLead(lead) {
        try {
            // Lead qualification happens through scoring
            // If score is high enough, they're qualified
            const isQualified = lead.score >= 60;

            if (isQualified) {
                return {
                    action: 'qualified_lead',
                    success: true,
                    reasoning: `Lead score ${lead.score}/100 meets qualification threshold`,
                    outcome: 'Lead qualified for viewing'
                };
            } else {
                // Schedule follow-up
                const nextFollowUp = new Date();
                nextFollowUp.setDate(nextFollowUp.getDate() + 3);
                lead.nextFollowUpDate = nextFollowUp;

                return {
                    action: 'scheduled_follow_up',
                    success: true,
                    reasoning: `Lead score ${lead.score}/100 below threshold, needs nurturing`,
                    outcome: `Follow-up scheduled for ${nextFollowUp.toDateString()}`
                };
            }

        } catch (error) {
            return {
                action: 'qualified_lead',
                success: false,
                reasoning: 'Attempted to qualify lead',
                outcome: `Failed: ${error.message}`
            };
        }
    }

    /**
     * Auto-schedule viewing for qualified high-intent leads
     */
    async autoScheduleViewing(lead) {
        try {
            // Find optimal viewing slot
            const slots = await viewingSchedulerService.findOptimalViewingSlots(
                lead._id,
                lead.property._id
            );

            if (!slots.recommendedSlot) {
                return {
                    action: 'schedule_viewing',
                    success: false,
                    reasoning: 'High intent lead ready for viewing',
                    outcome: 'No available viewing slots found'
                };
            }

            // Schedule the viewing
            await viewingSchedulerService.scheduleViewing(
                lead._id,
                lead.property._id,
                slots.recommendedSlot.datetime,
                {
                    isAIGenerated: true,
                    aiReasoning: slots.recommendedSlot.aiReasoning,
                    duration: 30
                }
            );

            return {
                action: 'scheduled_viewing',
                success: true,
                reasoning: slots.recommendedSlot.aiReasoning,
                outcome: `Viewing scheduled for ${slots.recommendedSlot.datetime.toLocaleString()}`
            };

        } catch (error) {
            return {
                action: 'schedule_viewing',
                success: false,
                reasoning: 'High intent lead ready for viewing',
                outcome: `Failed: ${error.message}`
            };
        }
    }

    /**
     * Initiate negotiation after viewing
     */
    async initiateNegotiation(lead) {
        try {
            // Check if lead has viewed the property
            const viewings = await Viewing.find({
                lead: lead._id,
                status: 'completed',
                'outcome.interested': true
            });

            if (viewings.length === 0) {
                return {
                    action: 'check_viewing_interest',
                    success: true,
                    reasoning: 'Waiting for viewing completion',
                    outcome: 'No completed viewings with interest yet'
                };
            }

            // Enable negotiation
            lead.negotiation.isActive = true;
            lead.negotiation.aiNegotiationEnabled = true;
            lead.negotiation.negotiationRules = {
                minAcceptablePrice: lead.property.price * 0.90, // 10% max discount default
                maxDiscountPercent: 10,
                autoAcceptThreshold: lead.property.price * 0.95, // Auto-accept if offer >= 95%
                requireApprovalBelow: lead.property.price * 0.90 // Manual approval needed below 90%
            };
            lead.salesFunnelStage = 'negotiating';

            // Send negotiation invitation
            await emailService.sendEmail({
                to: lead.client.email,
                subject: `Ready to make an offer on ${lead.property.title}?`,
                html: this.generateNegotiationInvitationEmail(lead)
            });

            return {
                action: 'initiated_negotiation',
                success: true,
                reasoning: 'Lead showed interest after viewing',
                outcome: 'Negotiation mode enabled, invitation sent'
            };

        } catch (error) {
            return {
                action: 'initiate_negotiation',
                success: false,
                reasoning: 'Attempted to initiate negotiation',
                outcome: `Failed: ${error.message}`
            };
        }
    }

    /**
     * Handle incoming offer from lead
     */
    async handleOffer(leadId, offerAmount, message = '') {
        try {
            const lead = await Lead.findById(leadId).populate('property createdBy');
            if (!lead) {
                throw new Error('Lead not found');
            }

            const property = lead.property;
            const listPrice = property.price;

            // Record the offer
            const offer = {
                amount: offerAmount,
                offeredBy: 'lead',
                offeredAt: new Date(),
                reasoning: message,
                status: 'pending'
            };

            if (!lead.negotiation.initialOffer) {
                lead.negotiation.initialOffer = offerAmount;
            }
            lead.negotiation.currentOffer = offerAmount;
            lead.negotiation.counterOffers.push(offer);

            // AI evaluates the offer
            const decision = await this.evaluateOffer(lead, offerAmount);

            // Update offer status based on decision
            lead.negotiation.counterOffers[lead.negotiation.counterOffers.length - 1].status =
                decision.action;

            if (decision.action === 'accepted') {
                // Deal won!
                lead.salesFunnelStage = 'won';
                lead.dealClosure = {
                    outcome: 'won',
                    finalPrice: offerAmount,
                    closedAt: new Date(),
                    closedBy: 'ai',
                    revenue: offerAmount,
                    commission: offerAmount * 0.03 // 3% commission example
                };
                lead.negotiation.discountApplied = listPrice - offerAmount;
                lead.negotiation.discountPercentage = ((listPrice - offerAmount) / listPrice) * 100;

                // Notify owner
                await this.notifyDealClosed(lead, offerAmount);

            } else if (decision.action === 'countered') {
                // AI makes counter-offer
                lead.negotiation.counterOffers.push({
                    amount: decision.counterOffer,
                    offeredBy: 'ai',
                    offeredAt: new Date(),
                    reasoning: decision.reasoning,
                    status: 'pending'
                });
                lead.negotiation.currentOffer = decision.counterOffer;

                // Notify lead of counter-offer
                await emailService.sendEmail({
                    to: lead.client.email,
                    subject: `Counter Offer - ${property.title}`,
                    html: this.generateCounterOfferEmail(lead, decision.counterOffer, decision.reasoning)
                });

            } else if (decision.action === 'rejected') {
                // Offer too low
                await emailService.sendEmail({
                    to: lead.client.email,
                    subject: `Regarding Your Offer - ${property.title}`,
                    html: this.generateOfferRejectionEmail(lead, decision.reasoning)
                });
            }

            // Track AI action
            lead.aiEngagement.totalInteractions += 1;
            lead.aiEngagement.lastAIAction = {
                action: `evaluated_offer_${decision.action}`,
                timestamp: new Date(),
                reasoning: decision.reasoning
            };
            lead.aiEngagement.aiActions.push({
                action: `evaluated_offer_${decision.action}`,
                timestamp: new Date(),
                success: true,
                reasoning: decision.reasoning,
                outcome: `Offer ${decision.action}: ${decision.reasoning}`
            });

            await lead.save();
            return decision;

        } catch (error) {
            console.error('Error handling offer:', error);
            throw error;
        }
    }

    /**
     * AI evaluates offer and decides: accept, counter, or reject
     */
    async evaluateOffer(lead, offerAmount) {
        try {
            const property = lead.property;
            const listPrice = property.price;
            const rules = lead.negotiation.negotiationRules;

            // Auto-accept if above threshold
            if (offerAmount >= rules.autoAcceptThreshold) {
                return {
                    action: 'accepted',
                    reasoning: `Offer of ${property.currency} ${offerAmount.toLocaleString()} is ${((offerAmount/listPrice)*100).toFixed(1)}% of list price, meeting auto-accept threshold`,
                    finalPrice: offerAmount
                };
            }

            // Auto-reject if below minimum
            if (offerAmount < rules.minAcceptablePrice) {
                return {
                    action: 'rejected',
                    reasoning: `Offer of ${property.currency} ${offerAmount.toLocaleString()} is below minimum acceptable price of ${property.currency} ${rules.minAcceptablePrice.toLocaleString()}`
                };
            }

            // Use AI to determine counter-offer strategy
            const aiDecision = await this.getAINegotiationStrategy(lead, offerAmount);

            return aiDecision;

        } catch (error) {
            console.error('Error evaluating offer:', error);
            // Fallback: require manual approval
            return {
                action: 'rejected',
                reasoning: 'Error in evaluation, manual review required'
            };
        }
    }

    /**
     * Get AI negotiation strategy using Gemini
     */
    async getAINegotiationStrategy(lead, offerAmount) {
        try {
            const property = lead.property;
            const listPrice = property.price;
            const rules = lead.negotiation.negotiationRules;
            const offerPercentage = ((offerAmount / listPrice) * 100).toFixed(1);

            const prompt = `
You are an expert real estate negotiator. A buyer has made an offer on a property.

Property Details:
- List Price: ${property.currency} ${listPrice.toLocaleString()}
- Type: ${property.propertyType || 'N/A'}
- Location: ${property.location}

Buyer Offer:
- Amount: ${property.currency} ${offerAmount.toLocaleString()} (${offerPercentage}% of list price)

Lead Information:
- Lead Score: ${lead.score}/100
- Buying Intent: ${lead.buyingIntent}
- Time as Lead: ${Math.floor((Date.now() - new Date(lead.createdAt)) / (1000 * 60 * 60 * 24))} days

Negotiation Rules:
- Minimum Acceptable: ${property.currency} ${rules.minAcceptablePrice.toLocaleString()} (${rules.maxDiscountPercent}% discount max)
- Auto-Accept Threshold: ${property.currency} ${rules.autoAcceptThreshold.toLocaleString()}

Previous Offers: ${lead.negotiation.counterOffers.length} offer(s) exchanged

Your goal is to close the deal at the best possible price while not losing the buyer.

Decide:
1. ACCEPT the offer (if it's fair and unlikely to get better)
2. COUNTER with a specific amount (if there's room to negotiate higher)
3. REJECT (only if offer is insulting or buyer seems unserious)

Return ONLY a JSON object:
{
    "action": "accepted" | "countered" | "rejected",
    "counterOffer": number (only if action is "countered"),
    "reasoning": "brief explanation of strategy (1-2 sentences)"
}
`;

            const result = await this.model.generateContent(prompt);
            const response = result.response.text();

            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                // Fallback: make moderate counter-offer
                return {
                    action: 'countered',
                    counterOffer: Math.floor((offerAmount + listPrice) / 2),
                    reasoning: 'Counter-offer at midpoint between offer and list price'
                };
            }

            const aiDecision = JSON.parse(jsonMatch[0]);
            return aiDecision;

        } catch (error) {
            console.error('Error getting AI negotiation strategy:', error);
            // Fallback
            return {
                action: 'countered',
                counterOffer: Math.floor((offerAmount + lead.property.price) / 2),
                reasoning: 'System fallback: counter at midpoint'
            };
        }
    }

    /**
     * Continue negotiation process
     */
    async continueNegotiation(lead) {
        try {
            const lastOffer = lead.negotiation.counterOffers[lead.negotiation.counterOffers.length - 1];

            if (!lastOffer) {
                return {
                    action: 'check_negotiation_status',
                    success: true,
                    reasoning: 'No active offers to process',
                    outcome: 'Waiting for buyer offer'
                };
            }

            // If last offer was from AI and pending, send reminder
            if (lastOffer.offeredBy === 'ai' && lastOffer.status === 'pending') {
                const daysSinceOffer = Math.floor((Date.now() - new Date(lastOffer.offeredAt)) / (1000 * 60 * 60 * 24));

                if (daysSinceOffer >= 2) {
                    // Send reminder
                    await emailService.sendEmail({
                        to: lead.client.email,
                        subject: `Still interested in ${lead.property.title}?`,
                        html: this.generateNegotiationReminderEmail(lead)
                    });

                    return {
                        action: 'sent_negotiation_reminder',
                        success: true,
                        reasoning: `${daysSinceOffer} days since last counter-offer`,
                        outcome: 'Reminder sent to buyer'
                    };
                }
            }

            return {
                action: 'monitor_negotiation',
                success: true,
                reasoning: 'Active negotiation in progress',
                outcome: 'Waiting for buyer response'
            };

        } catch (error) {
            return {
                action: 'continue_negotiation',
                success: false,
                reasoning: 'Attempted to continue negotiation',
                outcome: `Failed: ${error.message}`
            };
        }
    }

    /**
     * Persistent lead pursuit - engage unresponsive leads
     */
    async pursueLeadsAutomatically() {
        try {
            // Find leads that need follow-up
            const now = new Date();
            const leadsToFollowUp = await Lead.find({
                autoFollowUpEnabled: true,
                nextFollowUpDate: { $lte: now },
                salesFunnelStage: { $nin: ['won', 'lost', 'disqualified'] }
            }).populate('property');

            let actionsPerformed = 0;

            for (const lead of leadsToFollowUp) {
                try {
                    await this.sendFollowUp(lead);

                    // Schedule next follow-up based on stage
                    const nextFollowUp = new Date();
                    if (lead.salesFunnelStage === 'new' || lead.salesFunnelStage === 'contacted') {
                        nextFollowUp.setDate(nextFollowUp.getDate() + 3); // 3 days
                    } else if (lead.salesFunnelStage === 'qualified') {
                        nextFollowUp.setDate(nextFollowUp.getDate() + 7); // 1 week
                    } else {
                        nextFollowUp.setDate(nextFollowUp.getDate() + 14); // 2 weeks
                    }

                    lead.nextFollowUpDate = nextFollowUp;
                    lead.lastFollowUpDate = new Date();
                    lead.followUpCount += 1;

                    // Disqualify if too many follow-ups without response
                    if (lead.followUpCount >= 5 && lead.salesFunnelStage === 'contacted') {
                        lead.salesFunnelStage = 'disqualified';
                        lead.dealClosure = {
                            outcome: 'disqualified',
                            closedAt: new Date(),
                            closedBy: 'ai',
                            reasonDisqualified: 'unresponsive'
                        };
                    }

                    await lead.save();
                    actionsPerformed++;

                } catch (error) {
                    console.error(`Error pursuing lead ${lead._id}:`, error);
                }
            }

            console.log(`✅ Pursued ${actionsPerformed} leads automatically`);
            return { success: true, actionsPerformed };

        } catch (error) {
            console.error('Error in persistent lead pursuit:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send follow-up email
     */
    async sendFollowUp(lead) {
        const property = lead.property;

        await emailService.sendEmail({
            to: lead.client.email,
            subject: `Still interested in ${property.title}?`,
            html: this.generateFollowUpEmail(lead, property)
        });

        // Track AI action
        lead.aiEngagement.totalInteractions += 1;
        lead.aiEngagement.lastAIAction = {
            action: 'sent_follow_up',
            timestamp: new Date(),
            reasoning: 'Scheduled follow-up date reached'
        };
        lead.aiEngagement.aiActions.push({
            action: 'sent_follow_up',
            timestamp: new Date(),
            success: true,
            reasoning: 'Scheduled follow-up date reached',
            outcome: 'Follow-up email sent'
        });
    }

    /**
     * Notify property owner of deal closure
     */
    async notifyDealClosed(lead, finalPrice) {
        try {
            const owner = await User.findById(lead.property.createdBy);

            await emailService.sendEmail({
                to: owner.email,
                subject: `🎉 Deal Closed - ${lead.property.title}`,
                html: this.generateDealClosedEmail(lead, finalPrice)
            });

        } catch (error) {
            console.error('Error notifying deal closed:', error);
        }
    }

    /**
     * Get sales pipeline overview
     */
    async getSalesPipeline(userId, filters = {}) {
        try {
            const query = { createdBy: userId };

            if (filters.stage) {
                query.salesFunnelStage = filters.stage;
            }
            if (filters.buyingIntent) {
                query.buyingIntent = filters.buyingIntent;
            }

            const leads = await Lead.find(query)
                .populate('property')
                .populate('viewings')
                .sort({ score: -1, createdAt: -1 });

            // Group by stage
            const pipeline = {
                new: [],
                contacted: [],
                qualified: [],
                viewing_scheduled: [],
                viewed: [],
                negotiating: [],
                offer_made: [],
                won: [],
                lost: [],
                disqualified: []
            };

            leads.forEach(lead => {
                pipeline[lead.salesFunnelStage]?.push(lead);
            });

            // Calculate metrics
            const metrics = {
                totalLeads: leads.length,
                activeLeads: leads.filter(l => !['won', 'lost', 'disqualified'].includes(l.salesFunnelStage)).length,
                wonDeals: pipeline.won.length,
                totalRevenue: pipeline.won.reduce((sum, l) => sum + (l.dealClosure?.revenue || 0), 0),
                conversionRate: leads.length > 0 ? ((pipeline.won.length / leads.length) * 100).toFixed(1) : 0,
                averageDealValue: pipeline.won.length > 0 ?
                    (pipeline.won.reduce((sum, l) => sum + (l.dealClosure?.revenue || 0), 0) / pipeline.won.length) : 0
            };

            return { pipeline, metrics, leads };

        } catch (error) {
            console.error('Error getting sales pipeline:', error);
            throw error;
        }
    }

    // Email template generators
    generateInitialContactEmail(lead, property) {
        return `
            <h2>Thank You for Your Interest!</h2>
            <p>Dear ${lead.client.name},</p>
            <p>Thank you for expressing interest in <strong>${property.title}</strong>.</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <h3>${property.title}</h3>
                <p><strong>Location:</strong> ${property.location}</p>
                <p><strong>Price:</strong> ${property.currency} ${property.price.toLocaleString()}</p>
                ${property.bedrooms ? `<p><strong>Bedrooms:</strong> ${property.bedrooms}</p>` : ''}
            </div>
            <p>Our AI assistant will help you through the process. Would you like to schedule a viewing?</p>
            <p>Best regards,<br>My Genesis Fortune Team</p>
        `;
    }

    generateNegotiationInvitationEmail(lead) {
        return `
            <h2>Ready to Make an Offer?</h2>
            <p>Dear ${lead.client.name},</p>
            <p>We noticed you're interested in ${lead.property.title} after your viewing.</p>
            <p>The listing price is <strong>${lead.property.currency} ${lead.property.price.toLocaleString()}</strong>.</p>
            <p>If you'd like to make an offer, simply reply to this email or contact us directly.</p>
            <p>Our AI negotiation assistant is ready to work with you to find a fair price!</p>
            <p>Best regards,<br>My Genesis Fortune Team</p>
        `;
    }

    generateCounterOfferEmail(lead, counterAmount, reasoning) {
        return `
            <h2>Counter Offer</h2>
            <p>Dear ${lead.client.name},</p>
            <p>Thank you for your offer on ${lead.property.title}.</p>
            <p>We'd like to propose a counter offer of <strong>${lead.property.currency} ${counterAmount.toLocaleString()}</strong>.</p>
            <p><em>${reasoning}</em></p>
            <p>Let us know if this works for you!</p>
            <p>Best regards,<br>My Genesis Fortune Team</p>
        `;
    }

    generateOfferRejectionEmail(lead, reasoning) {
        return `
            <h2>Regarding Your Offer</h2>
            <p>Dear ${lead.client.name},</p>
            <p>Thank you for your offer on ${lead.property.title}.</p>
            <p>${reasoning}</p>
            <p>We'd be happy to discuss other options that might work better.</p>
            <p>Best regards,<br>My Genesis Fortune Team</p>
        `;
    }

    generateNegotiationReminderEmail(lead) {
        return `
            <h2>Following Up on Your Offer</h2>
            <p>Dear ${lead.client.name},</p>
            <p>We wanted to follow up on the counter offer for ${lead.property.title}.</p>
            <p>The property is still available. Are you still interested?</p>
            <p>Best regards,<br>My Genesis Fortune Team</p>
        `;
    }

    generateFollowUpEmail(lead, property) {
        return `
            <h2>Still Interested?</h2>
            <p>Dear ${lead.client.name},</p>
            <p>We wanted to check in about ${property.title}.</p>
            <p>The property is still available at ${property.currency} ${property.price.toLocaleString()}.</p>
            <p>Would you like to schedule a viewing or get more information?</p>
            <p>Best regards,<br>My Genesis Fortune Team</p>
        `;
    }

    generateDealClosedEmail(lead, finalPrice) {
        return `
            <h2>🎉 Congratulations! Deal Closed</h2>
            <p>Great news! Your property <strong>${lead.property.title}</strong> has been sold!</p>
            <p><strong>Final Price:</strong> ${lead.property.currency} ${finalPrice.toLocaleString()}</p>
            <p><strong>Buyer:</strong> ${lead.client.name}</p>
            <p>Our team will be in touch with next steps.</p>
            <p>Best regards,<br>My Genesis Fortune Team</p>
        `;
    }
}

module.exports = new SalesAutomationService();
