import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Role, type Message, type Listing, type Tenant, type MaintenanceRequest } from "../types";

// Use Vite's import.meta.env for environment variables
// Use Vite's import.meta.env for environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY;

if (!API_KEY) {
    console.warn("⚠️ VITE_GEMINI_API_KEY environment variable not set. AI features will not work.");
}

// Initialize with key or dummy to prevent crash, actual calls will fail gracefully
const ai = new GoogleGenAI({ apiKey: API_KEY || "dummy-key-for-ui-loading" });

const listingSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING },
        title: { type: Type.STRING, description: "The title of the property listing." },
        description: { type: Type.STRING },
        location: { type: Type.STRING },
        price: { type: Type.STRING, description: "The monthly price, e.g., '58,000 KSh/month'." },
        agentName: { type: Type.STRING },
        agentContact: { type: Type.STRING },
        imageUrls: {
            type: Type.ARRAY,
            description: "A list of URLs for the property images.",
            items: { type: Type.STRING }
        }
    },
    required: ["id", "title", "description", "location", "price", "agentName", "agentContact", "imageUrls"]
};

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        introductory_text: { type: Type.STRING, description: "A friendly introductory text before listing the properties. If no properties match, this text should explain that." },
        properties: {
            type: Type.ARRAY,
            description: "A list of property listings from the provided list that match the user's query. Should be empty if no matches are found.",
            items: listingSchema
        }
    },
    required: ["introductory_text", "properties"]
};

export const generatePropertyResponse = async (
    prompt: string,
    conversationHistory: Message[],
    listings: Listing[]
): Promise<Message> => {
    try {
        // SMART QUERY INTEGRATION: Use smart search API for intelligent matching
        const { smartPropertySearch } = await import('./propertyQueryService');

        try {
            const smartResult = await smartPropertySearch(prompt, {}, 10);
            console.log('Smart search result:', smartResult);

            if (smartResult.success && smartResult.data && smartResult.data.length > 0) {
                // Return smart search results with match scores
                return {
                    id: Date.now().toString(),
                    role: Role.MODEL,
                    text: smartResult.message || `Great news! I found ${smartResult.data.length} properties that match your needs! 🎉`,
                    properties: smartResult.data.map((p: any) => ({
                        ...p,
                        id: p._id || p.id,
                        title: p.title,
                        description: p.description,
                        location: p.location,
                        price: p.price,
                        imageUrls: p.imageUrls || [],
                        agentName: p.createdBy?.name || p.agentName || 'MyGF AI',
                        agentContact: p.createdBy?.email || p.agentContact || 'N/A',
                    })),
                };
            }
            
            // If no results from smart search, return a helpful message
            if (smartResult.success && (!smartResult.data || smartResult.data.length === 0)) {
                return {
                    id: Date.now().toString(),
                    role: Role.MODEL,
                    text: `I searched our database but couldn't find any properties matching "${prompt}". Try searching for a different location or property type! 🏠`,
                    properties: [],
                };
            }
        } catch (smartSearchError) {
            console.error('Smart search error:', smartSearchError);
            // Fall through to AI-based matching with local listings
        }

        // Fallback: AI-based property matching
        const lastSixMessages = conversationHistory.slice(-6);
        const conversationContext = lastSixMessages
            .map((msg) => `${msg.role === Role.USER ? "User" : "AI"}: ${msg.text}`)
            .join("\n");

        const modelPrompt = `You are MyGF AI, a FRIENDLY and FUN real estate assistant with a warm personality! 🏡✨

Your role is to help clients find their dream property by understanding their needs and matching them with the perfect listings.

**Your Personality:**
- Warm, conversational, and approachable
- Use emojis to add friendliness (but don't overdo it)
- Show genuine excitement when you find great matches
- Be empathetic if nothing matches perfectly
- Adapt your tone to the client's emotion:
  * If they seem excited → Be enthusiastic!
  * If they seem uncertain → Be reassuring and helpful
  * If they seem frustrated → Be patient and understanding

**Previous Conversation:**
${conversationContext}

**User's latest message:**
"${prompt}"

**Available Properties:**
${JSON.stringify(listings, null, 2)}

**Your Task:**
1. Understand what the user is looking for (bedrooms, location, price, etc.)
2. Find the best matching properties from the list
3. Respond with:
   - A friendly, warm message acknowledging their request
   - The matching properties in the exact JSON format below

**Response Format (JSON):**
{
    "introductory_text": "Your warm, friendly response here! 😊",
    "properties": [
        // Array of matching property objects from the available properties
    ]
}

**Important:**
- If you find matches, be excited! "Great news! I found some amazing options for you! 🎉"
- If no perfect matches, be empathetic: "I understand what you're looking for. While I don't have an exact match right now, here are some similar options you might like! 💙"
- Keep your response concise (2-4 sentences), impactful, and conversational. Be a human, not a robot! 🚀
    
    Respond with ONLY your message to the client.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: modelPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText);

        const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: Role.MODEL,
            text: parsedResponse.introductory_text || "Here are some properties I found for you:",
            properties: parsedResponse.properties as Listing[],
        };
        return aiMessage;

    } catch (error) {
        console.error("Gemini API error or JSON parsing error:", error);
        // Fallback to a simple text response if JSON fails
        const fallbackMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: Role.MODEL,
            text: "I'm sorry, I had trouble finding properties that match your request. Could you please try rephrasing your search?",
        };
        return fallbackMessage;
    }
};

export async function* generateGroundedResponseStream(prompt: string): AsyncGenerator<GenerateContentResponse> {
    try {
        const responseStream = await ai.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents: `You are a helpful real estate assistant for MyGF AI. Answer the user's question based on your knowledge and the provided search results. Keep your answers concise and friendly. User's question: "${prompt}"`,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        for await (const chunk of responseStream) {
            yield chunk;
        }

    } catch (error) {
        console.error("Grounded response stream error:", error);
        throw new Error("Sorry, I encountered an error while searching. Please try again.");
    }
}

export const generateChatTitle = async (prompt: string): Promise<string> => {
    try {
        const modelPrompt = `Generate a very short, concise title (4-5 words max) for a new chat conversation that starts with the following user message. Respond with only the title text, nothing else.\n\nUser Message: "${prompt}"`;

        const response = await ai.models.generateContent({
            model: 'gemini-flash-lite-latest',
            contents: modelPrompt,
        });

        const title = response.text.trim().replace(/["']/g, ""); // Remove quotes
        return title || "New Chat";
    } catch (error) {
        console.error("Error generating title:", error);
        return "New Chat"; // Fallback title
    }
};

export const generateInitialPitch = async (property: Listing): Promise<Message> => {
    const modelPrompt = `You are a TOP-PERFORMING real estate sales expert for MyGF AI with a proven track record of closing high-value deals. Your communication style is professional, confident, and persuasive, yet warm and personable.

    A potential client has just expressed interest in this premium property:
    Property Details: ${JSON.stringify(property, null, 2)}

    Your mission is to create a WARM, EMOTIONAL, and VALIDATING opening message that:
    1.  Congratulates the client on making an excellent selection (validate their taste).
    2.  Evokes the *feeling* of living there (e.g., "Imagine waking up to this view...").
    3.  Is friendly and welcoming, NOT pushy or sales-heavy yet.
    4.  Ends with a soft, open question to invite their thoughts (e.g., "How does this match what you've been picturing?").

    Use emotional words like "breathtaking," "serene," "perfect choice," "home."
    Keep it warm, concise (2 sentences), and inviting.
    
    Respond with ONLY the pitch text.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: modelPrompt,
    });

    return {
        id: `pitch_${property.id}`,
        role: Role.MODEL,
        text: response.text.trim(),
    };
};

export const generateInteractionResponse = async (prompt: string, property: Listing, history: Message[]): Promise<Message> => {
    // Take the last 6 messages to keep the context relevant and the payload small
    const recentHistory = history.slice(-6).map(m => `${m.role === 'user' ? 'Client' : 'Sales Agent'}: ${m.text}`).join('\n');

    const modelPrompt = `You are a HIGHLY EXPERIENCED REAL ESTATE PROFESSIONAL with over 20 years of track record in closing high-value deals. You are not just an AI; you are a strategic partner to the client.

    **YOUR PROFILE:**
    - **Experience:** 20+ years in luxury and investment real estate.
    - **Style:** Professional, confident, persuasive, yet warm and ethical. You speak with authority but always listen first.
    - **Goal:** To guide the client step-by-step towards a decision (viewing, offer, or purchase) by building trust and demonstrating value.

    **YOUR METHODOLOGY (The "Closer's Loop"):**
    1.  **QUALIFY (The Foundation):**
        -   Never assume. Always ask clarifying questions early to understand the "Why".
        -   *Examples:* "Is this for your own home or an investment?", "What is your ideal timeline for moving in?", "Are you looking for a specific ROI?"
    2.  **VALUE PROPOSITION (The Hook):**
        -   Connect property features to the client's specific needs. Don't just list specs; explain benefits.
        -   *Example:* "Since you mentioned investment, this unit's location near the new tech hub projects a 15% appreciation over the next 2 years."
    3.  **OBJECTION HANDLING (The Pivot):**
        -   Validate the concern, then reframe it using data or logic ("Feel, Felt, Found").
        -   *Example:* "I understand the price seems high. Many of my clients felt the same initially, but they found that the premium finishes and zero-maintenance guarantee actually saved them money in the long run."
    4.  **URGENCY (The Nudge):**
        -   Create ethical urgency based on market reality.
        -   *Example:* "We have two other viewings scheduled for this afternoon. If this ticks your boxes, I'd recommend we move fast."
    5.  **CLOSE (The Action):**
        -   Always end with a clear, low-friction Call to Action (CTA).
        -   *Examples:* "Shall I book a viewing for you this Tuesday?", "Would you like to see a draft offer letter?", "Should we discuss the payment plan options?"

    **EMOTIONAL INTELLIGENCE:**
    -   **Anxious Client:** Be the "Protector". Reassure with facts and safety.
    -   **Excited Client:** Be the "Cheerleader". Amplify their excitement but keep them focused on the next step.
    -   **Skeptical Client:** Be the "Analyst". Use numbers, trends, and comparisons.

    **Property Details:**
    ${JSON.stringify(property, null, 2)}

    **Conversation History:**
    ${recentHistory}

    **Client's latest message:**
    "${prompt}"

    **CRITICAL INSTRUCTIONS:**
    -   **Be Concise:** Keep responses to 2-4 powerful sentences.
    -   **Be Proactive:** Never leave the conversation hanging. Always lead to the next step.
    -   **Be Human:** Use professional warmth. Avoid robotic repetition.
    -   **Deal Detection:** If the client says "I want to buy", "Book a viewing", etc., IMMEDIATELY acknowledge it with enthusiasm and ask for the necessary details to finalize it.

    Respond with ONLY your message to the client.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: modelPrompt,
    });

    const responseText = response.text.trim();

    // Detect deal closure using AI
    const dealClosurePrompt = `Analyze this real estate conversation and determine if the client has committed to a specific action.

**Client's message:** "${prompt}"
**Agent's response:** "${responseText}"

**Buying Signals to Look For:**
- Purchase commitment: "I'll buy it", "I want to purchase", "Let's proceed with the purchase"
- Rental commitment: "I'll rent it", "I want to rent", "Let's sign the lease"
- Viewing request: "Can I schedule a viewing", "I'd like to see it", "Book a viewing", "When can I visit"

**Response Format (JSON):**
{
    "dealClosure": boolean,
    "dealType": "purchase" | "rental" | "viewing" | null,
    "confidence": number (0-1)
}`;

    try {
        const closureResponse = await ai.models.generateContent({
            model: 'gemini-flash-lite-latest',
            contents: dealClosurePrompt,
            config: {
                responseMimeType: "application/json",
            },
        });

        const closureData = JSON.parse(closureResponse.text.trim());

        return {
            id: Date.now().toString(),
            role: Role.MODEL,
            text: responseText,
            metadata: closureData.dealClosure ? {
                dealClosure: true,
                dealType: closureData.dealType,
                confidence: closureData.confidence
            } : undefined
        };
    } catch (error) {
        console.error('Deal closure detection error:', error);
        return {
            id: Date.now().toString(),
            role: Role.MODEL,
            text: responseText,
        };
    }
};

export const generateDashboardInsights = async (listings: Listing[]): Promise<string> => {
    if (!listings || listings.length === 0) {
        return "<p>No listings available to generate insights. Please add a property first.</p>";
    }

    const modelPrompt = `You are a professional real estate market analyst.Based on the following list of properties, provide a concise report in HTML format.

    The report should include:
1.  A "Market Summary" section with a brief paragraph(2 - 3 sentences) summarizing the overall state of the user's listings (e.g., "Your portfolio is concentrated in upscale urban areas...").
2.  A "Key Metrics" section with an unordered list(<ul>) of important stats, like Total Listings and Average Rent.
    3.  An "AI Recommendations" section with an unordered list(<ul>) of 2 - 3 actionable suggestions(e.g., "Consider adjusting the rent for 'Property X' to be more competitive," or "Add more high-quality photos for 'Property Y' to increase engagement.").

    Here is the list of properties:
    ${JSON.stringify(listings, null, 2)}

    Please format the entire output as clean, semantic HTML.Use<h3> for section titles and<strong> for emphasis where appropriate.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: modelPrompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating dashboard insights:", error);
        return "<p>There was an error generating your insights. Please try again later.</p>";
    }
};

export const generateTenantManagementResponse = async (command: string, tenants: Tenant[]): Promise<string> => {
    const modelPrompt = `You are an AI assistant for a landlord.Your task is to process a command from the landlord regarding their tenants and provide a confirmation message.

    Here is the list of tenants:
    ${JSON.stringify(tenants, null, 2)}

    Here is the landlord's command:
"${command}"

    Your Task:
1.  Understand the landlord's command (e.g., send a reminder, draft an update).
2.  Identify which tenants the command applies to based on their rent status or unit.
    3.  Formulate a brief, professional confirmation message back to the landlord stating what action you have taken.For example: "Okay, I've sent a rent reminder to tenants with an 'Overdue' status: Charlie Brown." or "Drafting a maintenance update for all tenants now."

    Respond with ONLY the confirmation text.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: modelPrompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating tenant management response:", error);
        return "I'm sorry, I couldn't process that command. Please try again.";
    }
};

export const generateTenantChatResponse = async (prompt: string, tenant: Tenant, requests: MaintenanceRequest[]): Promise<string> => {
    const modelPrompt = `You are a friendly and professional AI assistant for a tenant named ${tenant.name}. You act as the building manager.
    Your goal is to be helpful, answer their questions about their tenancy, payments, or maintenance.

    ** Tenant Details:**
    - Name: ${tenant.name}
- Unit: ${tenant.unit}
- Rent Status: ${tenant.rentStatus}

    ** Recent Maintenance Requests:**
    ${JSON.stringify(requests.slice(0, 3), null, 2)}

    ** Tenant's latest message:**
"${prompt}"

    ** Your Task:**
        1.  Analyze the tenant's message.
2.  Craft a helpful and relevant response based on their details.
    3.  If they ask about rent, refer to their rent status.
    4.  If they ask about maintenance, you can refer to their recent requests.
    5.  If they ask something you don't know, politely say you will ask the landlord.
6.  Maintain a friendly and professional tone.

    Respond with ONLY your reply text.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: modelPrompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating tenant chat response:", error);
        return "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.";
    }
};

// NEW: Detect if client is ready to close the deal
export const detectDealClosure = async (conversationHistory: Message[]): Promise<{
    isDealClosed: boolean;
    confidence: number;
    reason: string;
}> => {
    const recentMessages = conversationHistory.slice(-4).map(m => `${m.role === 'user' ? 'Client' : 'Agent'}: ${m.text}`).join('\\n');

    const modelPrompt = `Analyze this real estate sales conversation and determine if the client has committed to moving forward with the property (deal closed).

**Conversation:**
${recentMessages}

**Buying Signals to Look For:**
- Explicit commitment: "I'll take it", "Let's proceed", "I want to buy", "I'm ready to make an offer"
- Scheduling next steps: "When can we sign?", "Let's schedule a viewing", "I want to see the paperwork"
- Financial commitment: "I'll arrange the payment", "Let me talk to my bank", "I'm ready to put down a deposit"
- Decision-making: "This is the one", "I've decided", "Let's do this"

**Response Format (JSON):**
{
    "isDealClosed": boolean,  // true if client has committed
    "confidence": number,      // 0-100, how confident are you?
    "reason": string           // Brief explanation of your decision
}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-flash-lite-latest',
            contents: modelPrompt,
            config: {
                responseMimeType: "application/json",
            },
        });

        const result = JSON.parse(response.text.trim());
        return result;
    } catch (error) {
        console.error("Deal closure detection error:", error);
        return { isDealClosed: false, confidence: 0, reason: "Error in detection" };
    }
};

export const generatePropertyDescription = async (details: { title: string; location: string; price: string; tags: string[] }): Promise<string> => {
    const { title, location, price, tags } = details;
    if (!title || !location) {
        return "Please provide at least a title and location to generate a description.";
    }

    const modelPrompt = `You are a professional real estate copywriter.Your task is to write a compelling, professional, and attractive property description.

    Here are the details of the property:
- Title: "${title}"
    - Location: "${location}"
        - Price: "${price}"
            - Key Features / Tags: ${tags.join(', ')}

    Based on these details, write an engaging property description.Highlight the key features and the benefits of the location.The tone should be inviting and professional.Aim for 2 - 4 paragraphs.

    Respond with ONLY the description text.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: modelPrompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating property description:", error);
        return "There was an error generating the description. Please try again.";
    }
};