# MyGF AI Agent System - Complete Documentation

## 📚 Overview

This AI agent system provides **maximum control** over your real estate AI assistant's behavior through three key components:

1. **AGENT_GOAL.md** - High-level goals, success metrics, and behavioral objectives
2. **AGENT_INSTRUCTIONS.md** - Detailed operational instructions and conversation protocols
3. **mygf_agent_controller.py** - Python implementation for complete behavior control

## 🎯 Quick Start

### 1. Basic Usage

```python
from mygf_agent_controller import MyGFAgentController

# Initialize the controller
controller = MyGFAgentController()

# Start a new conversation
response = controller.start_conversation(
    user_id="user123",
    conversation_id="conv_001"
)
print(response.message)  # "Hello! 🏡 Welcome to MyGF..."

# Process user messages
response = controller.process_message(
    conversation_id="conv_001",
    user_message="I'm looking for a 3 bedroom apartment in Westlands"
)
print(response.message)

# Handle tool calls
if response.tool_calls:
    tool_name = response.tool_calls[0]['tool']
    params = response.tool_calls[0]['parameters']

    # Execute your backend tool
    results = execute_backend_tool(tool_name, params)

    # Continue conversation with results
    response = controller.process_message(
        conversation_id="conv_001",
        user_message="[tool_results]",
        tool_results=results
    )
```

### 2. Integration with Your Backend

```python
# In your aiChat controller
from mygf_agent_controller import MyGFAgentController

agent_controller = MyGFAgentController()

@router.post('/chat')
async def chat(request):
    user_id = request.user_id
    message = request.message
    conversation_id = request.conversation_id or generate_id()

    # Process message
    response = agent_controller.process_message(
        conversation_id=conversation_id,
        user_message=message
    )

    # Execute tool calls if needed
    for tool_call in response.tool_calls:
        if tool_call['tool'] == 'search_properties':
            results = await aiChatService.searchProperties(
                tool_call['parameters']
            )

            # Get final response with results
            response = agent_controller.process_message(
                conversation_id=conversation_id,
                user_message="[tool_results]",
                tool_results={'properties': results}
            )

    return {
        'message': response.message,
        'conversation_id': conversation_id,
        'phase': response.next_phase.value if response.next_phase else None
    }
```

## 🔧 Advanced Control Features

### 1. Custom Intent Classification

```python
from mygf_agent_controller import IntentClassifier

# Add custom intent patterns
IntentClassifier.INTENT_PATTERNS[Intent.CUSTOM] = [
    r'\b(my custom pattern)\b'
]

# Classify messages
intent = IntentClassifier.classify_intent("user message")
entities = IntentClassifier.extract_entities("3 bedroom apartment in Westlands")
```

### 2. Behavior Modification

```python
from mygf_agent_controller import ResponseGenerator

# Customize greetings
ResponseGenerator.GREETINGS = [
    "Your custom greeting here! 🏡",
    "Another greeting option! ✨"
]

# Customize info gathering questions
ResponseGenerator.INFO_GATHERING_QUESTIONS['location'] = "Where do you want to live? 🌍"
```

### 3. Lead Qualification Scoring

```python
# Get conversation state
state = controller.get_conversation_state("conv_001")

# Check qualification score (0-100)
if state.qualification_score >= 70:
    print("Hot lead! Move to closing")
elif state.qualification_score >= 40:
    print("Warm lead - continue nurturing")
else:
    print("Cold lead - need more engagement")

# Check buying signals
if BuyingSignal.VIEWING_REQUEST in state.detected_signals:
    print("User wants to view property - high intent!")
```

### 4. Flow Control Override

```python
from mygf_agent_controller import ConversationPhase

# Manually set conversation phase
state = controller.get_conversation_state("conv_001")
state.current_phase = ConversationPhase.DEAL_CLOSURE

# Force next action
state.pending_actions.append("book_viewing")
```

### 5. Conversation Analytics

```python
# Export full conversation for analysis
export = controller.export_conversation("conv_001")

print(f"Qualification Score: {export['qualification_score']}")
print(f"Message Count: {export['message_count']}")
print(f"Detected Signals: {export['detected_signals']}")
print(f"Properties Shown: {export['properties_shown']}")

# Access full message history
for msg in export['message_history']:
    print(f"{msg['role']}: {msg['content']}")
```

## 🎨 Customization Guide

### Adding New Intents

```python
# 1. Add to Intent enum
class Intent(Enum):
    # ... existing intents
    MY_NEW_INTENT = "my_new_intent"

# 2. Add detection patterns
IntentClassifier.INTENT_PATTERNS[Intent.MY_NEW_INTENT] = [
    r'\b(pattern1|pattern2)\b',
    r'another pattern'
]

# 3. Handle in flow controller
def determine_next_phase(current_phase, intent, state):
    if intent == Intent.MY_NEW_INTENT:
        return ConversationPhase.CUSTOM_PHASE
    # ... existing logic
```

### Adding New Buying Signals

```python
# 1. Add to BuyingSignal enum
class BuyingSignal(Enum):
    # ... existing signals
    URGENT_NEED = "urgent_need"

# 2. Add detection patterns
IntentClassifier.BUYING_SIGNALS[BuyingSignal.URGENT_NEED] = [
    r'\b(urgent|asap|immediately|right now)\b'
]

# 3. Handle in closing logic
def should_close_deal(state):
    if BuyingSignal.URGENT_NEED in state.detected_signals:
        return True  # Aggressive closing
    # ... existing logic
```

### Custom Response Templates

```python
class ResponseGenerator:
    # Add custom response templates
    CUSTOM_RESPONSES = {
        'urgent_closing': (
            "I understand this is urgent! 🚀 Let me fast-track this for you. "
            "I can arrange a viewing within the next 2 hours. "
            "What's your phone number so the agent can call you directly?"
        ),
        'investor_pitch': (
            "As an investment, this property offers 12% annual ROI based on "
            "current market rates. The area is appreciating at 8% yearly, "
            "and rental demand is consistently high. 📈"
        )
    }

    @staticmethod
    def generate_custom_response(response_type, **kwargs):
        template = ResponseGenerator.CUSTOM_RESPONSES.get(response_type)
        return template.format(**kwargs) if template else ""
```

## 🔌 Integration Examples

### Example 1: Express.js Backend

```javascript
// backend/controllers/aiChatController.js
const { PythonShell } = require('python-shell');

async function processAIChat(req, res) {
    const { message, conversationId } = req.body;

    // Call Python agent
    const options = {
        mode: 'json',
        pythonPath: 'python3',
        scriptPath: './agent',
        args: [conversationId, message]
    };

    PythonShell.run('agent_wrapper.py', options, (err, results) => {
        if (err) throw err;

        const response = results[0];

        // Handle tool calls
        if (response.tool_calls) {
            // Execute backend tools
            const toolResults = await executeTools(response.tool_calls);
            // Continue conversation...
        }

        res.json(response);
    });
}
```

### Example 2: WebSocket Real-time Chat

```python
import asyncio
from mygf_agent_controller import MyGFAgentController

controller = MyGFAgentController()

async def handle_websocket(websocket, path):
    conversation_id = generate_id()

    # Send greeting
    response = controller.start_conversation(
        user_id=websocket.user_id,
        conversation_id=conversation_id
    )
    await websocket.send(json.dumps({'message': response.message}))

    # Handle messages
    async for message in websocket:
        data = json.loads(message)

        response = controller.process_message(
            conversation_id=conversation_id,
            user_message=data['message']
        )

        await websocket.send(json.dumps({
            'message': response.message,
            'phase': response.next_phase.value if response.next_phase else None
        }))
```

### Example 3: LangChain Integration

```python
from langchain.agents import Tool, AgentExecutor
from langchain.memory import ConversationBufferMemory
from mygf_agent_controller import MyGFAgentController

# Wrap controller as LangChain tool
controller = MyGFAgentController()

def mygf_agent_tool(message: str) -> str:
    """MyGF AI real estate agent"""
    response = controller.process_message(
        conversation_id="langchain_conv",
        user_message=message
    )
    return response.message

tools = [
    Tool(
        name="MyGF-AI-Agent",
        func=mygf_agent_tool,
        description="Real estate AI agent for property search and sales"
    )
]

# Use with LangChain
memory = ConversationBufferMemory()
agent = AgentExecutor.from_agent_and_tools(
    tools=tools,
    memory=memory
)
```

## 📊 Monitoring & Analytics

### Tracking Metrics

```python
from collections import defaultdict
from datetime import datetime

class AgentAnalytics:
    def __init__(self, controller):
        self.controller = controller
        self.metrics = defaultdict(list)

    def track_conversation(self, conversation_id):
        """Track key metrics for a conversation"""
        export = self.controller.export_conversation(conversation_id)

        self.metrics['qualification_scores'].append(export['qualification_score'])
        self.metrics['message_counts'].append(export['message_count'])
        self.metrics['conversion_signals'].append(len(export['detected_signals']))

    def get_analytics(self):
        """Get aggregate analytics"""
        return {
            'avg_qualification_score': sum(self.metrics['qualification_scores']) / len(self.metrics['qualification_scores']),
            'avg_messages_per_conversation': sum(self.metrics['message_counts']) / len(self.metrics['message_counts']),
            'conversion_rate': len([s for s in self.metrics['conversion_signals'] if s >= 2]) / len(self.metrics['conversion_signals'])
        }
```

### A/B Testing Response Styles

```python
import random

class ABTestController(MyGFAgentController):
    def __init__(self):
        super().__init__()
        self.variant = None

    def process_message(self, conversation_id, user_message, tool_results=None):
        # Assign variant on first message
        if not self.variant:
            self.variant = random.choice(['A', 'B'])

        # Modify behavior based on variant
        if self.variant == 'A':
            # More casual, emoji-heavy
            self.response_generator.GREETINGS = casual_greetings
        else:
            # More professional, minimal emojis
            self.response_generator.GREETINGS = professional_greetings

        return super().process_message(conversation_id, user_message, tool_results)
```

## 🚀 Production Deployment

### Environment Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
export MYGF_AGENT_MODE=production
export MYGF_LOG_LEVEL=INFO
export MYGF_ENABLE_ANALYTICS=true
```

### Scaling Considerations

```python
# Use Redis for conversation state (multi-instance support)
import redis
import pickle

class RedisBackedController(MyGFAgentController):
    def __init__(self, redis_url):
        super().__init__()
        self.redis = redis.from_url(redis_url)

    def get_conversation_state(self, conversation_id):
        # Load from Redis instead of memory
        data = self.redis.get(f"conv:{conversation_id}")
        return pickle.loads(data) if data else None

    def process_message(self, conversation_id, user_message, tool_results=None):
        # Save state to Redis after processing
        response = super().process_message(conversation_id, user_message, tool_results)

        state = self.active_conversations.get(conversation_id)
        if state:
            self.redis.set(
                f"conv:{conversation_id}",
                pickle.dumps(state),
                ex=86400  # 24 hour expiry
            )

        return response
```

## 🐛 Debugging & Testing

### Debug Mode

```python
import logging

# Enable debug logging
logging.basicConfig(level=logging.DEBUG)

controller = MyGFAgentController()
controller.debug_mode = True

# Process with detailed logs
response = controller.process_message("conv", "I want a house")
# Logs:
# [DEBUG] Intent detected: PROPERTY_SEARCH
# [DEBUG] Entities extracted: {'property_type': 'house'}
# [DEBUG] Missing info: ['location', 'budget_max']
# [DEBUG] Next phase: INFO_GATHERING
```

### Unit Tests

```python
import unittest
from mygf_agent_controller import IntentClassifier, Intent

class TestIntentClassification(unittest.TestCase):
    def test_property_search_intent(self):
        message = "I'm looking for a 3 bedroom apartment"
        intent = IntentClassifier.classify_intent(message)
        self.assertEqual(intent, Intent.PROPERTY_SEARCH)

    def test_entity_extraction(self):
        message = "3 bedroom apartment in Westlands under 150k"
        entities = IntentClassifier.extract_entities(message)

        self.assertEqual(entities['bedrooms'], 3)
        self.assertEqual(entities['location'], 'Westlands')
        self.assertEqual(entities['budget_max'], 150000)

if __name__ == '__main__':
    unittest.main()
```

## 📝 Best Practices

1. **Always validate tool results** before passing to agent
2. **Store conversation state** in persistent storage (Redis/DB)
3. **Log all interactions** for analytics and debugging
4. **Monitor qualification scores** to optimize conversion
5. **A/B test response styles** to find best performance
6. **Set timeouts** for long-running tool calls
7. **Handle errors gracefully** with fallback responses
8. **Use async/await** for scalable production deployment

## 🆘 Support & Troubleshooting

### Common Issues

**Issue**: Agent not detecting intent correctly
```python
# Solution: Add more patterns or adjust thresholds
IntentClassifier.INTENT_PATTERNS[Intent.PROPERTY_SEARCH].append(
    r'your_custom_pattern'
)
```

**Issue**: Tool calls not executing
```python
# Solution: Check tool_calls format
if response.tool_calls:
    print(response.tool_calls)  # Debug output
    # Ensure backend tools match expected names
```

**Issue**: Conversation state lost
```python
# Solution: Implement persistent storage
# See "Scaling Considerations" section above
```

## 📖 Further Reading

- [AGENT_GOAL.md](./AGENT_GOAL.md) - Complete goal definition
- [AGENT_INSTRUCTIONS.md](./AGENT_INSTRUCTIONS.md) - Detailed operational instructions
- [Backend Integration Guide](./docs/BACKEND_INTEGRATION.md) - Connect with your API

## 🎉 You're Ready!

You now have **complete control** over your AI agent's behavior. Customize, extend, and optimize to create the perfect real estate AI assistant!

For questions or support, reach out to the development team.

Happy building! 🏡✨
