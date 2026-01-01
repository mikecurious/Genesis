const Viewing = require('../models/Viewing');
const Lead = require('../models/Lead');
const Property = require('../models/Property');
const User = require('../models/User');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const emailService = require('./emailService');

class ViewingSchedulerService {
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }

    /**
     * AI determines optimal viewing times based on lead intent and property availability
     */
    async findOptimalViewingSlots(leadId, propertyId, preferredDates = []) {
        try {
            const lead = await Lead.findById(leadId);
            const property = await Property.findById(propertyId).populate('createdBy');

            if (!lead || !property) {
                throw new Error('Lead or property not found');
            }

            // Get existing viewings for the property
            const existingViewings = await Viewing.find({
                property: propertyId,
                scheduledDate: { $gte: new Date() },
                status: { $in: ['scheduled', 'confirmed'] }
            }).sort({ scheduledDate: 1 });

            // Determine available slots
            const availableSlots = this.generateAvailableSlots(existingViewings, preferredDates);

            // Use AI to recommend best time based on lead urgency
            const recommendedSlot = await this.getAIRecommendedSlot(lead, availableSlots);

            return {
                recommendedSlot,
                availableSlots: availableSlots.slice(0, 5), // Top 5 alternatives
                existingViewings: existingViewings.length
            };

        } catch (error) {
            console.error('Error finding optimal viewing slots:', error);
            throw error;
        }
    }

    /**
     * Generate available time slots (avoiding conflicts)
     */
    generateAvailableSlots(existingViewings, preferredDates = []) {
        const slots = [];
        const today = new Date();

        // Generate slots for next 14 days
        for (let dayOffset = 1; dayOffset <= 14; dayOffset++) {
            const date = new Date(today);
            date.setDate(today.getDate() + dayOffset);

            // Skip Sundays (day 0)
            if (date.getDay() === 0) continue;

            // Generate slots: 9 AM - 6 PM, every hour
            for (let hour = 9; hour <= 18; hour++) {
                const slotTime = new Date(date);
                slotTime.setHours(hour, 0, 0, 0);

                // Check if slot conflicts with existing viewing
                const hasConflict = existingViewings.some(viewing => {
                    const viewingStart = new Date(viewing.scheduledDate);
                    const viewingEnd = new Date(viewingStart.getTime() + (viewing.duration * 60000));
                    const slotEnd = new Date(slotTime.getTime() + (30 * 60000)); // 30 min default

                    return (slotTime >= viewingStart && slotTime < viewingEnd) ||
                           (slotEnd > viewingStart && slotEnd <= viewingEnd);
                });

                if (!hasConflict) {
                    slots.push({
                        datetime: slotTime,
                        isPreferred: preferredDates.some(pd => {
                            const prefDate = new Date(pd);
                            return prefDate.toDateString() === slotTime.toDateString();
                        })
                    });
                }
            }
        }

        return slots;
    }

    /**
     * Use AI to recommend best viewing slot
     */
    async getAIRecommendedSlot(lead, availableSlots) {
        try {
            if (availableSlots.length === 0) {
                return null;
            }

            const prompt = `
You are an AI sales assistant scheduling property viewings.

Lead Information:
- Name: ${lead.client.name}
- Buying Intent: ${lead.buyingIntent}
- Lead Score: ${lead.score}/100
- Created: ${lead.createdAt}
- Follow-up Count: ${lead.followUpCount}

Available Time Slots (next 3 days prioritized):
${availableSlots.slice(0, 10).map((slot, i) => `${i + 1}. ${slot.datetime.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
})}${slot.isPreferred ? ' (Preferred)' : ''}`).join('\n')}

Based on the lead's urgency and intent, recommend the best viewing time.

High intent leads should be scheduled ASAP (within 1-2 days).
Medium intent leads can be scheduled 2-4 days out.
Low intent leads can be scheduled further out.

Return ONLY a JSON object:
{
    "recommendedSlotIndex": 0-9,
    "reasoning": "brief explanation why this time is optimal (1 sentence)",
    "urgency": "immediate" | "soon" | "flexible"
}
`;

            const result = await this.model.generateContent(prompt);
            const response = result.response.text();

            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                return availableSlots[0]; // Default to first slot
            }

            const aiRec = JSON.parse(jsonMatch[0]);
            const slotIndex = Math.min(aiRec.recommendedSlotIndex || 0, availableSlots.length - 1);

            return {
                ...availableSlots[slotIndex],
                aiReasoning: aiRec.reasoning,
                urgency: aiRec.urgency
            };

        } catch (error) {
            console.error('Error getting AI slot recommendation:', error);
            return availableSlots[0]; // Fallback to first available
        }
    }

    /**
     * Schedule viewing (AI or manual)
     */
    async scheduleViewing(leadId, propertyId, scheduledDate, options = {}) {
        try {
            const lead = await Lead.findById(leadId);
            const property = await Property.findById(propertyId).populate('createdBy');

            if (!lead || !property) {
                throw new Error('Lead or property not found');
            }

            // Create viewing
            const viewing = await Viewing.create({
                lead: leadId,
                property: propertyId,
                scheduledBy: options.scheduledBy || property.createdBy._id,
                scheduledDate: new Date(scheduledDate),
                duration: options.duration || 30,
                isAIGenerated: options.isAIGenerated || false,
                aiReasoning: options.aiReasoning,
                viewingType: options.viewingType || 'in_person',
                location: property.location,
                attendees: [
                    {
                        name: lead.client.name,
                        email: lead.client.email,
                        phone: lead.client.contact,
                        role: 'lead'
                    },
                    {
                        name: property.createdBy.name,
                        email: property.createdBy.email,
                        phone: property.createdBy.phone,
                        role: 'owner'
                    }
                ]
            });

            // Update lead
            lead.viewings.push(viewing._id);
            lead.salesFunnelStage = 'viewing_scheduled';
            lead.stageHistory.push({
                stage: 'viewing_scheduled',
                changedAt: new Date(),
                changedBy: options.isAIGenerated ? 'ai' : 'manual',
                notes: `Viewing scheduled for ${scheduledDate}`
            });

            if (options.isAIGenerated) {
                lead.aiEngagement.totalInteractions += 1;
                lead.aiEngagement.lastAIAction = {
                    action: 'scheduled_viewing',
                    timestamp: new Date(),
                    reasoning: options.aiReasoning
                };
                lead.aiEngagement.aiActions.push({
                    action: 'scheduled_viewing',
                    timestamp: new Date(),
                    success: true,
                    reasoning: options.aiReasoning,
                    outcome: `Viewing scheduled for ${scheduledDate}`
                });
            }

            await lead.save();

            // Send confirmation emails
            await this.sendViewingInvitations(viewing);

            return viewing;

        } catch (error) {
            console.error('Error scheduling viewing:', error);
            throw error;
        }
    }

    /**
     * Send viewing invitations to all attendees
     */
    async sendViewingInvitations(viewing) {
        try {
            const populatedViewing = await Viewing.findById(viewing._id)
                .populate('lead')
                .populate('property')
                .populate('scheduledBy');

            for (const attendee of viewing.attendees) {
                if (attendee.email) {
                    await emailService.sendEmail({
                        to: attendee.email,
                        subject: `Property Viewing Scheduled - ${populatedViewing.property.title}`,
                        html: this.generateViewingInvitationEmail(populatedViewing, attendee)
                    });
                }
            }

            return { success: true, emailsSent: viewing.attendees.length };

        } catch (error) {
            console.error('Error sending viewing invitations:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Generate viewing invitation email HTML
     */
    generateViewingInvitationEmail(viewing, attendee) {
        const dateStr = new Date(viewing.scheduledDate).toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });

        return `
            <h2>Property Viewing Scheduled</h2>
            <p>Dear ${attendee.name},</p>
            <p>A viewing has been scheduled for:</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <h3>${viewing.property.title}</h3>
                <p><strong>Date & Time:</strong> ${dateStr}</p>
                <p><strong>Location:</strong> ${viewing.location}</p>
                <p><strong>Duration:</strong> ${viewing.duration} minutes</p>
                <p><strong>Type:</strong> ${viewing.viewingType.replace('_', ' ')}</p>
            </div>
            <p><strong>Property Details:</strong></p>
            <ul>
                <li>Price: ${viewing.property.currency} ${viewing.property.price.toLocaleString()}</li>
                <li>Type: ${viewing.property.propertyType || 'N/A'}</li>
                ${viewing.property.bedrooms ? `<li>Bedrooms: ${viewing.property.bedrooms}</li>` : ''}
                ${viewing.property.bathrooms ? `<li>Bathrooms: ${viewing.property.bathrooms}</li>` : ''}
            </ul>
            <p>Please confirm your attendance by clicking the link below:</p>
            <p><a href="${process.env.FRONTEND_URL}/viewings/${viewing._id}/confirm" style="background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Confirm Attendance</a></p>
            <p>If you need to reschedule, please contact us as soon as possible.</p>
            <p>Best regards,<br>Genesis Team</p>
        `;
    }

    /**
     * Confirm viewing attendance
     */
    async confirmViewing(viewingId, role = 'lead') {
        try {
            const viewing = await Viewing.findById(viewingId);
            if (!viewing) {
                throw new Error('Viewing not found');
            }

            if (role === 'lead') {
                viewing.confirmation.leadConfirmed = true;
                viewing.confirmation.leadConfirmedAt = new Date();
            } else if (role === 'agent' || role === 'owner') {
                viewing.confirmation.agentConfirmed = true;
                viewing.confirmation.agentConfirmedAt = new Date();
            }

            // Update status if both confirmed
            if (viewing.confirmation.leadConfirmed && viewing.confirmation.agentConfirmed) {
                viewing.status = 'confirmed';
            }

            await viewing.save();
            return viewing;

        } catch (error) {
            console.error('Error confirming viewing:', error);
            throw error;
        }
    }

    /**
     * Mark viewing as completed and update lead
     */
    async completeViewing(viewingId, outcome) {
        try {
            const viewing = await Viewing.findById(viewingId);
            if (!viewing) {
                throw new Error('Viewing not found');
            }

            viewing.status = 'completed';
            viewing.outcome = outcome;
            await viewing.save();

            // Update lead stage
            const lead = await Lead.findById(viewing.lead);
            if (lead) {
                lead.salesFunnelStage = outcome.readyToNegotiate ? 'negotiating' : 'viewed';
                lead.stageHistory.push({
                    stage: lead.salesFunnelStage,
                    changedAt: new Date(),
                    changedBy: 'system',
                    notes: `Viewing completed. ${outcome.feedback || ''}`
                });
                await lead.save();
            }

            return viewing;

        } catch (error) {
            console.error('Error completing viewing:', error);
            throw error;
        }
    }

    /**
     * Send viewing reminders (called by cron job)
     */
    async sendViewingReminders() {
        try {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);

            const dayAfter = new Date(tomorrow);
            dayAfter.setDate(dayAfter.getDate() + 1);

            // Find viewings scheduled for tomorrow that are confirmed
            const upcomingViewings = await Viewing.find({
                scheduledDate: { $gte: tomorrow, $lt: dayAfter },
                status: { $in: ['scheduled', 'confirmed'] },
                'reminders.type': { $ne: '24h' } // Haven't sent 24h reminder yet
            }).populate('lead').populate('property');

            let remindersSent = 0;

            for (const viewing of upcomingViewings) {
                for (const attendee of viewing.attendees) {
                    if (attendee.email) {
                        await emailService.sendEmail({
                            to: attendee.email,
                            subject: `Reminder: Property Viewing Tomorrow - ${viewing.property.title}`,
                            html: this.generateReminderEmail(viewing, attendee)
                        });

                        viewing.reminders.push({
                            sentAt: new Date(),
                            type: 'email',
                            status: 'sent'
                        });
                        remindersSent++;
                    }
                }
                await viewing.save();
            }

            console.log(`✅ Sent ${remindersSent} viewing reminders`);
            return { success: true, remindersSent };

        } catch (error) {
            console.error('Error sending viewing reminders:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Generate reminder email HTML
     */
    generateReminderEmail(viewing, attendee) {
        const dateStr = new Date(viewing.scheduledDate).toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });

        return `
            <h2>Viewing Reminder</h2>
            <p>Dear ${attendee.name},</p>
            <p>This is a friendly reminder about your upcoming property viewing:</p>
            <div style="background: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
                <h3>${viewing.property.title}</h3>
                <p><strong>📅 Tomorrow: ${dateStr}</strong></p>
                <p><strong>📍 Location:</strong> ${viewing.location}</p>
            </div>
            <p>We look forward to seeing you!</p>
            <p>Best regards,<br>Genesis Team</p>
        `;
    }
}

module.exports = new ViewingSchedulerService();
