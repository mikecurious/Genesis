const { GoogleGenerativeAI } = require('@google/generative-ai');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const Technician = require('../models/Technician');
const Notification = require('../models/Notification');

class MaintenanceAIService {
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
        this.visionModel = this.genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
    }

    /**
     * Analyze maintenance request with AI
     */
    async analyzeMaintenanceRequest(maintenanceRequest) {
        try {
            const { description, images } = maintenanceRequest;

            // Analyze images if provided
            let imageAnalysis = null;
            if (images && images.length > 0) {
                imageAnalysis = await this.analyzeImages(images);
            }

            // Create comprehensive analysis prompt
            const prompt = `
You are an expert maintenance and facilities manager. Analyze the following maintenance request and provide detailed insights.

Maintenance Description: ${description}
${imageAnalysis ? `Image Analysis: ${imageAnalysis}` : ''}

Please provide a JSON response with the following structure:
{
    "category": "one of: Plumbing, Electrical, HVAC, Structural, Appliance, Pest Control, Painting, Flooring, Other",
    "urgencyScore": "number from 0-100 (0=can wait months, 50=needs attention soon, 100=emergency)",
    "estimatedCost": {
        "min": "minimum cost in KSh",
        "max": "maximum cost in KSh"
    },
    "timeEstimate": {
        "value": "number",
        "unit": "hours, days, or weeks"
    },
    "recommendedAction": "detailed recommendation for addressing this issue",
    "reasoning": "brief explanation of the urgency score and cost estimate"
}

Be realistic with cost estimates based on typical Kenyan market rates for repairs and services.
`;

            const result = await this.model.generateContent(prompt);
            const response = result.response.text();

            // Parse JSON response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Failed to parse AI response');
            }

            const analysis = JSON.parse(jsonMatch[0]);

            // Update maintenance request with AI analysis
            maintenanceRequest.aiAnalysis = {
                category: analysis.category,
                urgencyScore: analysis.urgencyScore,
                estimatedCost: {
                    min: analysis.estimatedCost.min,
                    max: analysis.estimatedCost.max,
                    currency: 'KSh'
                },
                timeEstimate: {
                    value: analysis.timeEstimate.value,
                    unit: analysis.timeEstimate.unit
                },
                recommendedAction: analysis.recommendedAction,
                analyzedAt: new Date()
            };

            // Auto-set priority based on urgency score
            if (analysis.urgencyScore >= 80) {
                maintenanceRequest.priority = 'Urgent';
            } else if (analysis.urgencyScore >= 60) {
                maintenanceRequest.priority = 'High';
            } else if (analysis.urgencyScore >= 40) {
                maintenanceRequest.priority = 'Medium';
            } else {
                maintenanceRequest.priority = 'Low';
            }

            await maintenanceRequest.save();

            // Find and recommend suitable technicians
            const recommendedTechnicians = await this.findSuitableTechnicians(analysis.category);

            // Notify landlord
            await this.notifyLandlord(maintenanceRequest, analysis, recommendedTechnicians);

            return {
                success: true,
                analysis,
                recommendedTechnicians,
                reasoning: analysis.reasoning
            };

        } catch (error) {
            console.error('Error in AI maintenance analysis:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Analyze images using Gemini Vision
     */
    async analyzeImages(images) {
        try {
            // For now, we'll analyze the first image
            // In production, you'd analyze all images and combine insights
            const image = images[0];

            if (!image.url) {
                return null;
            }

            const prompt = `
Analyze this maintenance issue image and describe:
1. What is the problem you see?
2. How severe does it appear?
3. What type of work is needed?

Be concise and specific.
`;

            // Note: For actual implementation, you'd need to fetch the image
            // and convert it to the format required by Gemini Vision API
            // This is a simplified version

            const result = await this.visionModel.generateContent([
                prompt,
                // In production, add actual image data here
                // For now, we'll use text-based analysis
            ]);

            const response = result.response.text();

            // Store AI description in the image object
            image.aiDescription = response;

            return response;

        } catch (error) {
            console.error('Error analyzing images:', error);
            return null;
        }
    }

    /**
     * Find suitable technicians based on category
     */
    async findSuitableTechnicians(category, limit = 5) {
        try {
            const technicians = await Technician.find({
                specialty: category,
                availability: { $in: ['Available', 'Busy'] },
                verified: true
            })
            .sort({ rating: -1, completedJobs: -1 })
            .limit(limit)
            .select('name email phone specialty rating hourlyRate availability completedJobs');

            return technicians;

        } catch (error) {
            console.error('Error finding technicians:', error);
            return [];
        }
    }

    /**
     * Notify landlord about maintenance request with AI insights
     */
    async notifyLandlord(maintenanceRequest, analysis, technicians) {
        try {
            await maintenanceRequest.populate(['tenant', 'property', 'landlord']);

            const message = `
🔧 New Maintenance Request (AI-Analyzed)

Property: ${maintenanceRequest.property?.title || 'N/A'}
Tenant: ${maintenanceRequest.tenant?.name || 'N/A'}

Category: ${analysis.category}
Urgency Score: ${analysis.urgencyScore}/100
Priority: ${maintenanceRequest.priority}

Estimated Cost: KSh ${analysis.estimatedCost.min.toLocaleString()} - ${analysis.estimatedCost.max.toLocaleString()}
Estimated Time: ${analysis.timeEstimate.value} ${analysis.timeEstimate.unit}

AI Recommendation: ${analysis.recommendedAction}

${technicians.length > 0 ? `\nRecommended Technicians (${technicians.length}):` : ''}
${technicians.slice(0, 3).map(t => `- ${t.name} (${t.specialty.join(', ')}) - Rating: ${t.rating}/5 - KSh ${t.hourlyRate}/hr`).join('\n')}
            `.trim();

            // Create notification
            await Notification.create({
                user: maintenanceRequest.landlord?._id,
                title: `🔧 Maintenance Request - ${analysis.category}`,
                message: message,
                type: 'maintenance',
                priority: maintenanceRequest.priority === 'Urgent' || maintenanceRequest.priority === 'High' ? 'high' : 'normal',
                metadata: {
                    maintenanceRequestId: maintenanceRequest._id,
                    category: analysis.category,
                    urgencyScore: analysis.urgencyScore,
                    estimatedCost: analysis.estimatedCost
                }
            });

        } catch (error) {
            console.error('Error notifying landlord:', error);
        }
    }

    /**
     * Estimate cost based on category and description
     */
    getCostRange(category) {
        // Typical cost ranges in KSh based on category
        const costRanges = {
            'Plumbing': { min: 2000, max: 15000 },
            'Electrical': { min: 1500, max: 12000 },
            'HVAC': { min: 3000, max: 25000 },
            'Structural': { min: 10000, max: 100000 },
            'Appliance': { min: 1000, max: 20000 },
            'Pest Control': { min: 2000, max: 8000 },
            'Painting': { min: 3000, max: 30000 },
            'Flooring': { min: 5000, max: 50000 },
            'Other': { min: 1000, max: 10000 }
        };

        return costRanges[category] || costRanges['Other'];
    }
}

module.exports = new MaintenanceAIService();
