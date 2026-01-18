"""
MyGF AI Agent Controller - Maximum Behavior Control
====================================================
This module provides complete control over the AI agent's behavior,
including intent classification, flow management, tool calling, and response generation.
"""

import re
import json
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime


# ============================================================================
# ENUMS & CONSTANTS
# ============================================================================

class Intent(Enum):
    """User intent classification"""
    GREETING = "greeting"
    PROPERTY_SEARCH = "property_search"
    PROPERTY_DETAILS = "property_details"
    SURVEYOR_REQUEST = "surveyor_request"
    TENANT_MANAGEMENT = "tenant_management"
    GENERAL_INQUIRY = "general_inquiry"
    DEAL_CLOSURE = "deal_closure"
    UNKNOWN = "unknown"


class ConversationPhase(Enum):
    """Current phase in the conversation flow"""
    GREETING = "greeting"
    INTENT_DETECTION = "intent_detection"
    INFO_GATHERING = "info_gathering"
    SEARCH_EXECUTION = "search_execution"
    RESULTS_PRESENTATION = "results_presentation"
    PROPERTY_DETAILS = "property_details"
    OBJECTION_HANDLING = "objection_handling"
    DEAL_CLOSURE = "deal_closure"
    COMPLETED = "completed"


class BuyingSignal(Enum):
    """Detected buying signals from user"""
    VIEWING_REQUEST = "viewing_request"
    PRICE_NEGOTIATION = "price_negotiation"
    TIMELINE_DISCUSSION = "timeline_discussion"
    PAPERWORK_INQUIRY = "paperwork_inquiry"
    COMPARISON = "comparison"
    COMMITMENT_LANGUAGE = "commitment_language"


# ============================================================================
# DATA STRUCTURES
# ============================================================================

@dataclass
class UserContext:
    """Stores user information and preferences"""
    user_id: str
    location: Optional[str] = None
    budget_min: Optional[int] = None
    budget_max: Optional[int] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    property_type: Optional[str] = None
    price_type: Optional[str] = None  # 'sale' or 'rental'
    timeline: Optional[str] = None
    decision_maker: bool = True
    additional_preferences: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ConversationState:
    """Tracks conversation state and history"""
    conversation_id: str
    user_context: UserContext
    current_phase: ConversationPhase = ConversationPhase.GREETING
    current_intent: Intent = Intent.UNKNOWN
    message_history: List[Dict[str, str]] = field(default_factory=list)
    detected_signals: List[BuyingSignal] = field(default_factory=list)
    properties_shown: List[str] = field(default_factory=list)
    last_search_results: List[Dict] = field(default_factory=list)
    pending_actions: List[str] = field(default_factory=list)
    qualification_score: int = 0  # 0-100, measures lead quality
    engagement_score: int = 0  # 0-100, measures conversation quality


@dataclass
class AgentResponse:
    """Structure for agent responses"""
    message: str
    tool_calls: List[Dict[str, Any]] = field(default_factory=list)
    next_phase: Optional[ConversationPhase] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


# ============================================================================
# INTENT CLASSIFICATION ENGINE
# ============================================================================

class IntentClassifier:
    """Classifies user intent from messages"""

    # Intent detection patterns
    INTENT_PATTERNS = {
        Intent.GREETING: [
            r'\b(hi|hello|hey|greetings|good morning|good afternoon)\b',
            r'^(hi|hello)[\s\!\?]*$'
        ],
        Intent.PROPERTY_SEARCH: [
            r'\b(looking for|need|want|search|find)\b.*\b(property|house|apartment|land|home)\b',
            r'\b(buy|rent|purchase|lease)\b',
            r'\b(\d+)\s*(bed|bedroom|br)\b',
            r'\b(under|below|max|maximum)\b.*\b(\d+k?)\b'
        ],
        Intent.PROPERTY_DETAILS: [
            r'\b(tell me (about|more)|details|information|info)\b.*\b(property|this|that)\b',
            r'\bproperty\s+id\b',
            r'\b(show me|what about|how about)\b.*\b(this|that|the)\b'
        ],
        Intent.SURVEYOR_REQUEST: [
            r'\b(surveyor|valuer|valuation|inspection|inspect|assess|apprais)\b',
            r'\b(property\s+assessment|land\s+survey)\b'
        ],
        Intent.TENANT_MANAGEMENT: [
            r'\b(tenant|rent reminder|maintenance request|landlord)\b',
            r'\b(send.*(tenant|reminder)|draft.*response)\b'
        ],
        Intent.DEAL_CLOSURE: [
            r'\b(viewing|view|visit|see the property)\b',
            r'\b(book|schedule|arrange|set up)\b.*\b(viewing|appointment|visit)\b',
            r'\b(offer|deposit|paperwork|contract|lease agreement)\b',
            r'\b(negotiat|price|discount|best price)\b',
            r'\bwhen can (i|we)\b'
        ],
        Intent.GENERAL_INQUIRY: [
            r'\b(how does|what is|can you|do you|tell me about)\b',
            r'\b(process|work|explain)\b'
        ]
    }

    # Buying signal patterns
    BUYING_SIGNALS = {
        BuyingSignal.VIEWING_REQUEST: [
            r'\b(can i see|want to see|schedule viewing|book viewing)\b',
            r'\bwhen (can|could) (i|we) (see|view|visit)\b'
        ],
        BuyingSignal.PRICE_NEGOTIATION: [
            r'\b(negotiat|best price|discount|lower|flexible)\b.*\bprice\b',
            r'\b(is the price|what about the price)\b'
        ],
        BuyingSignal.TIMELINE_DISCUSSION: [
            r'\b(move in|moving|available|when)\b',
            r'\b(next month|this month|soon|immediately)\b'
        ],
        BuyingSignal.PAPERWORK_INQUIRY: [
            r'\b(paperwork|document|contract|agreement|lease|offer)\b',
            r'\b(what do i need|what documents)\b'
        ],
        BuyingSignal.COMPARISON: [
            r'\b(compare|versus|vs|or|between)\b.*\b(property|properties)\b',
            r'\b(this one|that one|which one)\b'
        ]
    }

    @staticmethod
    def classify_intent(message: str) -> Intent:
        """Classify user message into primary intent"""
        message_lower = message.lower()

        # Check each intent pattern
        for intent, patterns in IntentClassifier.INTENT_PATTERNS.items():
            for pattern in patterns:
                if re.search(pattern, message_lower):
                    return intent

        return Intent.UNKNOWN

    @staticmethod
    def detect_buying_signals(message: str) -> List[BuyingSignal]:
        """Detect buying signals in user message"""
        message_lower = message.lower()
        signals = []

        for signal, patterns in IntentClassifier.BUYING_SIGNALS.items():
            for pattern in patterns:
                if re.search(pattern, message_lower):
                    signals.append(signal)
                    break  # Only add each signal once

        return signals

    @staticmethod
    def extract_entities(message: str) -> Dict[str, Any]:
        """Extract entities like location, budget, bedrooms from message"""
        entities = {}
        message_lower = message.lower()

        # Extract bedrooms
        bedroom_match = re.search(r'(\d+)\s*(?:bed|bedroom|br)', message_lower)
        if bedroom_match:
            entities['bedrooms'] = int(bedroom_match.group(1))

        # Extract bathrooms
        bathroom_match = re.search(r'(\d+)\s*(?:bath|bathroom)', message_lower)
        if bathroom_match:
            entities['bathrooms'] = int(bathroom_match.group(1))

        # Extract budget (handle k/K for thousands)
        budget_patterns = [
            r'(?:under|below|max|maximum|up to)\s*(?:ksh|kes|sh)?\s*([\d,]+)\s*k?',
            r'(?:ksh|kes|sh)?\s*([\d,]+)\s*k?\s*(?:to|-)\s*(?:ksh|kes|sh)?\s*([\d,]+)\s*k?'
        ]

        for pattern in budget_patterns:
            match = re.search(pattern, message_lower)
            if match:
                if len(match.groups()) == 2:  # Range
                    min_val = int(match.group(1).replace(',', ''))
                    max_val = int(match.group(2).replace(',', ''))
                    # Check if 'k' suffix exists
                    if 'k' in message_lower[match.start():match.end()]:
                        min_val *= 1000
                        max_val *= 1000
                    entities['budget_min'] = min_val
                    entities['budget_max'] = max_val
                else:  # Single value (max)
                    max_val = int(match.group(1).replace(',', ''))
                    if 'k' in message_lower[match.start():match.end()]:
                        max_val *= 1000
                    entities['budget_max'] = max_val
                break

        # Extract location (simple - look for common Nairobi areas)
        locations = [
            'westlands', 'kilimani', 'kileleshwa', 'lavington', 'parklands',
            'karen', 'runda', 'spring valley', 'kitisuru', 'muthaiga',
            'upperhill', 'kilimani', 'nairobi cbd', 'cbd'
        ]
        for loc in locations:
            if loc in message_lower:
                entities['location'] = loc.title()
                break

        # Extract property type
        property_types = {
            'apartment': ['apartment', 'flat'],
            'house': ['house', 'home', 'bungalow'],
            'villa': ['villa'],
            'land': ['land', 'plot'],
            'commercial': ['commercial', 'office', 'shop']
        }
        for ptype, keywords in property_types.items():
            if any(kw in message_lower for kw in keywords):
                entities['property_type'] = ptype
                break

        # Detect price type (sale vs rental)
        if any(kw in message_lower for kw in ['rent', 'rental', 'lease', 'monthly']):
            entities['price_type'] = 'rental'
        elif any(kw in message_lower for kw in ['buy', 'purchase', 'sale', 'invest']):
            entities['price_type'] = 'sale'

        return entities


# ============================================================================
# CONVERSATION FLOW CONTROLLER
# ============================================================================

class ConversationFlowController:
    """Controls conversation flow and phase transitions"""

    # Required information for property search
    REQUIRED_INFO = ['location', 'budget_max', 'property_type']
    NICE_TO_HAVE = ['bedrooms', 'bathrooms', 'price_type']

    @staticmethod
    def get_missing_info(context: UserContext) -> List[str]:
        """Get list of missing required information"""
        missing = []

        if not context.location:
            missing.append('location')
        if not context.budget_max:
            missing.append('budget_max')
        if not context.property_type:
            missing.append('property_type')

        return missing

    @staticmethod
    def calculate_qualification_score(state: ConversationState) -> int:
        """Calculate lead qualification score (0-100)"""
        score = 0
        context = state.user_context

        # Has budget defined (30 points)
        if context.budget_max:
            score += 30

        # Has location preference (20 points)
        if context.location:
            score += 20

        # Has specific requirements (20 points)
        if context.bedrooms or context.bathrooms or context.property_type:
            score += 20

        # Has timeline (15 points)
        if context.timeline:
            score += 15

        # Is decision maker (15 points)
        if context.decision_maker:
            score += 15

        # Detected buying signals (bonus)
        score += min(len(state.detected_signals) * 5, 20)

        return min(score, 100)

    @staticmethod
    def should_close_deal(state: ConversationState) -> bool:
        """Determine if agent should attempt deal closure"""
        # High qualification score
        if state.qualification_score >= 70:
            return True

        # Multiple buying signals detected
        if len(state.detected_signals) >= 2:
            return True

        # Specific high-intent signals
        high_intent_signals = [
            BuyingSignal.VIEWING_REQUEST,
            BuyingSignal.PAPERWORK_INQUIRY
        ]
        if any(signal in state.detected_signals for signal in high_intent_signals):
            return True

        return False

    @staticmethod
    def determine_next_phase(
        current_phase: ConversationPhase,
        intent: Intent,
        state: ConversationState
    ) -> ConversationPhase:
        """Determine the next conversation phase"""

        # Greeting phase
        if current_phase == ConversationPhase.GREETING:
            return ConversationPhase.INTENT_DETECTION

        # Intent detection phase
        if current_phase == ConversationPhase.INTENT_DETECTION:
            if intent == Intent.PROPERTY_SEARCH:
                missing = ConversationFlowController.get_missing_info(state.user_context)
                if missing:
                    return ConversationPhase.INFO_GATHERING
                else:
                    return ConversationPhase.SEARCH_EXECUTION
            elif intent == Intent.PROPERTY_DETAILS:
                return ConversationPhase.PROPERTY_DETAILS
            elif intent in [Intent.SURVEYOR_REQUEST, Intent.TENANT_MANAGEMENT]:
                return ConversationPhase.SEARCH_EXECUTION  # Execute relevant tool
            elif intent == Intent.DEAL_CLOSURE:
                return ConversationPhase.DEAL_CLOSURE
            else:
                return ConversationPhase.INTENT_DETECTION  # Stay in detection

        # Info gathering phase
        if current_phase == ConversationPhase.INFO_GATHERING:
            missing = ConversationFlowController.get_missing_info(state.user_context)
            if not missing:
                return ConversationPhase.SEARCH_EXECUTION
            else:
                return ConversationPhase.INFO_GATHERING  # Continue gathering

        # Search execution -> Results presentation
        if current_phase == ConversationPhase.SEARCH_EXECUTION:
            return ConversationPhase.RESULTS_PRESENTATION

        # Results presentation
        if current_phase == ConversationPhase.RESULTS_PRESENTATION:
            if ConversationFlowController.should_close_deal(state):
                return ConversationPhase.DEAL_CLOSURE
            else:
                return ConversationPhase.RESULTS_PRESENTATION  # Continue engagement

        # Property details
        if current_phase == ConversationPhase.PROPERTY_DETAILS:
            if ConversationFlowController.should_close_deal(state):
                return ConversationPhase.DEAL_CLOSURE
            elif state.detected_signals:
                return ConversationPhase.OBJECTION_HANDLING
            else:
                return ConversationPhase.PROPERTY_DETAILS

        # Default: stay in current phase
        return current_phase


# ============================================================================
# RESPONSE GENERATOR
# ============================================================================

class ResponseGenerator:
    """Generates agent responses based on phase and context"""

    GREETINGS = [
        "Hello! 🏡 Welcome to MyGF - your AI property matchmaker! ✨ I'm here to help you find your perfect property. What brings you here today?",
        "Hi there! 🏡 I'm MyGF AI, and I'm excited to help you find your dream property! ✨ What are you looking for?",
        "Welcome! 🎉 I'm your personal real estate guide. Whether you're buying, renting, or just exploring, I'm here to help! What can I do for you today?"
    ]

    INFO_GATHERING_QUESTIONS = {
        'location': "Where would you love to live? 📍",
        'budget_max': "What's your budget range? This helps me show you the best matches! 💰",
        'property_type': "Are you looking for an apartment, house, villa, or something else? 🏠",
        'bedrooms': "How many bedrooms do you need? 🛏️",
        'price_type': "Are you looking to buy or rent? 🤔"
    }

    @staticmethod
    def generate_greeting() -> str:
        """Generate a warm greeting"""
        import random
        return random.choice(ResponseGenerator.GREETINGS)

    @staticmethod
    def generate_info_gathering_question(missing_field: str) -> str:
        """Generate question to gather missing information"""
        return ResponseGenerator.INFO_GATHERING_QUESTIONS.get(
            missing_field,
            f"Could you tell me more about your {missing_field}?"
        )

    @staticmethod
    def generate_property_presentation(properties: List[Dict], user_needs: UserContext) -> str:
        """Generate compelling property presentation"""
        if not properties:
            return (
                "I couldn't find exact matches right now 😔 But don't worry! "
                "Let's try adjusting your criteria - would you like to broaden the location "
                "or adjust the budget range? I can also notify you when new properties that "
                "match your needs become available! 🔔"
            )

        count = len(properties)
        intro = f"Great news! I found {count} amazing properties that match your needs! 🎉\n\n"

        presentations = []
        for i, prop in enumerate(properties[:5], 1):  # Max 5 properties
            pres = f"🏡 **{prop.get('title', 'Property')}** - {prop.get('price', 'N/A')}\n"
            pres += f"📍 {prop.get('location', 'N/A')} • {prop.get('bedrooms', '?')}BR • {prop.get('propertyType', 'Property')}\n\n"
            pres += f"{prop.get('description', '')[:100]}...\n"

            # Add personalized note based on user needs
            if user_needs.bedrooms and prop.get('bedrooms') == user_needs.bedrooms:
                pres += f"\n💡 Perfect match - exactly {user_needs.bedrooms} bedrooms as you wanted!\n"

            presentations.append(pres)

        result = intro + "\n---\n".join(presentations)
        result += "\n\n💬 Which one catches your eye? I can show you more details!"

        return result

    @staticmethod
    def generate_deal_closer(property_details: Optional[Dict] = None) -> str:
        """Generate deal closing message"""
        if property_details:
            return (
                f"This property ticks all your boxes! 🔥 Properties like this in "
                f"{property_details.get('location', 'this area')} get booked quickly. "
                f"\n\n📅 Would you like to schedule a viewing? I have slots available "
                f"Tuesday and Thursday this week. Which works better for you?"
            )
        else:
            return (
                "I can tell you're interested! 🎯 Let's make this happen. "
                "When would you like to view the property? I can arrange it for as soon as tomorrow!"
            )

    @staticmethod
    def generate_objection_response(objection_type: str) -> str:
        """Generate response to common objections"""
        responses = {
            'price': (
                "I understand your concern about the price. Let me break down why this is "
                "actually great value: the location appreciates at 12% annually, it includes "
                "premium amenities, and similar properties are renting 15% higher. "
                "Would you like to see comparable properties in the area?"
            ),
            'thinking': (
                "I completely understand - this is a big decision! Can I ask what specifically "
                "you're considering? That way I can provide more information to help you decide. "
                "Is it the location, price, or something else?"
            ),
            'more_options': (
                "Of course! Let me show you 2 more options that are similar. However, "
                "the first property we looked at really stands out because [specific reason]. "
                "Let me show you the alternatives..."
            )
        }
        return responses.get(objection_type, "I hear you. What would help you make a decision?")


# ============================================================================
# MAIN AGENT CONTROLLER
# ============================================================================

class MyGFAgentController:
    """Main controller for MyGF AI agent behavior"""

    def __init__(self):
        self.intent_classifier = IntentClassifier()
        self.flow_controller = ConversationFlowController()
        self.response_generator = ResponseGenerator()
        self.active_conversations: Dict[str, ConversationState] = {}

    def start_conversation(self, user_id: str, conversation_id: str) -> AgentResponse:
        """Initialize a new conversation"""
        user_context = UserContext(user_id=user_id)
        state = ConversationState(
            conversation_id=conversation_id,
            user_context=user_context,
            current_phase=ConversationPhase.GREETING
        )

        self.active_conversations[conversation_id] = state

        greeting = self.response_generator.generate_greeting()

        return AgentResponse(
            message=greeting,
            next_phase=ConversationPhase.INTENT_DETECTION,
            metadata={'conversation_started': True}
        )

    def process_message(
        self,
        conversation_id: str,
        user_message: str,
        tool_results: Optional[Dict[str, Any]] = None
    ) -> AgentResponse:
        """Process user message and generate appropriate response"""

        # Get conversation state
        state = self.active_conversations.get(conversation_id)
        if not state:
            return self.start_conversation(
                user_id=conversation_id,
                conversation_id=conversation_id
            )

        # Add message to history
        state.message_history.append({
            'role': 'user',
            'content': user_message,
            'timestamp': datetime.now().isoformat()
        })

        # Classify intent
        intent = self.intent_classifier.classify_intent(user_message)
        state.current_intent = intent

        # Detect buying signals
        signals = self.intent_classifier.detect_buying_signals(user_message)
        state.detected_signals.extend(signals)

        # Extract and update entities
        entities = self.intent_classifier.extract_entities(user_message)
        for key, value in entities.items():
            setattr(state.user_context, key, value)

        # Update qualification score
        state.qualification_score = self.flow_controller.calculate_qualification_score(state)

        # Generate response based on current phase
        response = self._generate_phase_response(state, intent, tool_results)

        # Determine next phase
        next_phase = self.flow_controller.determine_next_phase(
            state.current_phase,
            intent,
            state
        )

        state.current_phase = next_phase
        response.next_phase = next_phase

        # Add response to history
        state.message_history.append({
            'role': 'assistant',
            'content': response.message,
            'timestamp': datetime.now().isoformat(),
            'tool_calls': response.tool_calls
        })

        return response

    def _generate_phase_response(
        self,
        state: ConversationState,
        intent: Intent,
        tool_results: Optional[Dict] = None
    ) -> AgentResponse:
        """Generate response based on current conversation phase"""

        phase = state.current_phase

        # Greeting phase
        if phase == ConversationPhase.GREETING:
            return AgentResponse(
                message=self.response_generator.generate_greeting()
            )

        # Intent detection phase
        if phase == ConversationPhase.INTENT_DETECTION:
            if intent == Intent.UNKNOWN:
                return AgentResponse(
                    message="I'm here to help! Are you looking to buy or rent a property? Or do you need help with something else? 🤔"
                )

        # Info gathering phase
        if phase == ConversationPhase.INFO_GATHERING:
            missing = self.flow_controller.get_missing_info(state.user_context)
            if missing:
                question = self.response_generator.generate_info_gathering_question(missing[0])
                return AgentResponse(message=question)

        # Search execution phase
        if phase == ConversationPhase.SEARCH_EXECUTION:
            # Prepare tool call
            if intent == Intent.PROPERTY_SEARCH:
                tool_call = {
                    'tool': 'search_properties',
                    'parameters': {
                        'query': state.message_history[-1]['content'],
                        'location': state.user_context.location,
                        'price_min': state.user_context.budget_min,
                        'price_max': state.user_context.budget_max,
                        'bedrooms': state.user_context.bedrooms,
                        'bathrooms': state.user_context.bathrooms,
                        'property_type': state.user_context.property_type,
                        'price_type': state.user_context.price_type or 'rental'
                    }
                }

                return AgentResponse(
                    message="Let me search for the perfect properties for you... 🔍",
                    tool_calls=[tool_call]
                )

        # Results presentation phase
        if phase == ConversationPhase.RESULTS_PRESENTATION:
            if tool_results and 'properties' in tool_results:
                properties = tool_results['properties']
                state.last_search_results = properties
                message = self.response_generator.generate_property_presentation(
                    properties,
                    state.user_context
                )
                return AgentResponse(message=message)

        # Deal closure phase
        if phase == ConversationPhase.DEAL_CLOSURE:
            if state.last_search_results:
                property_details = state.last_search_results[0] if state.last_search_results else None
                message = self.response_generator.generate_deal_closer(property_details)
                return AgentResponse(message=message)

        # Default response
        return AgentResponse(
            message="I'm here to help! What would you like to know? 😊"
        )

    def get_conversation_state(self, conversation_id: str) -> Optional[ConversationState]:
        """Get current conversation state"""
        return self.active_conversations.get(conversation_id)

    def export_conversation(self, conversation_id: str) -> Dict:
        """Export conversation for analysis"""
        state = self.active_conversations.get(conversation_id)
        if not state:
            return {}

        return {
            'conversation_id': state.conversation_id,
            'user_id': state.user_context.user_id,
            'current_phase': state.current_phase.value,
            'qualification_score': state.qualification_score,
            'detected_signals': [s.value for s in state.detected_signals],
            'message_count': len(state.message_history),
            'properties_shown': len(state.properties_shown),
            'message_history': state.message_history
        }


# ============================================================================
# USAGE EXAMPLE
# ============================================================================

if __name__ == "__main__":
    # Initialize controller
    controller = MyGFAgentController()

    # Start conversation
    response = controller.start_conversation(
        user_id="user123",
        conversation_id="conv_001"
    )
    print(f"Agent: {response.message}\n")

    # Simulate user interaction
    user_messages = [
        "I'm looking for a 3 bedroom apartment",
        "In Westlands, under 150k",
        "Yes, for rent"
    ]

    for msg in user_messages:
        print(f"User: {msg}")
        response = controller.process_message("conv_001", msg)
        print(f"Agent: {response.message}")

        # If tool calls are required
        if response.tool_calls:
            print(f"  [Tool Call: {response.tool_calls[0]['tool']}]")

            # Simulate tool execution (in real scenario, call actual backend)
            mock_results = {
                'properties': [
                    {
                        'id': 'prop1',
                        'title': 'Modern 3BR Apartment',
                        'location': 'Westlands',
                        'price': '120,000 KSh',
                        'bedrooms': 3,
                        'propertyType': 'apartment',
                        'description': 'Beautiful modern apartment with stunning views'
                    }
                ]
            }

            # Process with tool results
            response = controller.process_message(
                "conv_001",
                "[tool_results]",
                tool_results=mock_results
            )
            print(f"Agent: {response.message}")

        print()

    # Export conversation
    export = controller.export_conversation("conv_001")
    print(f"\nConversation Stats:")
    print(f"Qualification Score: {export['qualification_score']}/100")
    print(f"Detected Signals: {export['detected_signals']}")
    print(f"Current Phase: {export['current_phase']}")
