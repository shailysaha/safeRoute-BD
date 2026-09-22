import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
import "./AIAssistant.css";

function AIAssistant() {
const navigate = useNavigate();

const [messages, setMessages] = useState([
{
id: 1,
sender: "ai",
text: "Hello! 👋 I'm SafeRoute AI. I can help you understand routes, incidents, emergency services, and SafeRoute BD features.",
},
]);

const [input, setInput] = useState("");

const quickActions = [
{
icon: "🗺️",
title: "Find a safer route",
text: "Help me find a safer route.",
},
{
icon: "⚠️",
title: "Nearby incidents",
text: "Explain nearby incidents.",
},
{
icon: "🚨",
title: "Emergency help",
text: "I need emergency help.",
},
{
icon: "🏥",
title: "Emergency services",
text: "Find nearby emergency services.",
},
];

const getAIResponse = (question) => {
const q = question.toLowerCase();

if (q.includes("emergency") || q.includes("sos")) {
return "If you are in an emergency, open the Emergency section and use your SOS button. You can also check nearby hospitals and police stations.";
}

if (
q.includes("route") ||
q.includes("journey") ||
q.includes("safer")
) {
return "You can use Plan Journey to select your starting location and destination. SafeRoute BD can then display the route and available safety information.";
}

if (
q.includes("incident") ||
q.includes("danger") ||
q.includes("risk")
) {
return "Incident information can help you understand potentially risky areas. Check the Map or Explore Route section for reported incidents and their severity.";
}

if (
q.includes("hospital") ||
q.includes("police") ||
q.includes("service")
) {
return "Open Emergency Assistance to view nearby hospitals and police stations around your current GPS location.";
}

if (q.includes("report")) {
return "You can report a dangerous location from the Map or Reports section. Community verification helps improve the reliability of incident information.";
}

return "I can help with SafeRoute BD routes, incidents, emergency services, reports, and general navigation. Try asking me about a safer route or nearby incidents.";
};

const sendMessage = (customText = null) => {
const text = (customText ?? input).trim();

if (!text) return;

const userMessage = {
id: Date.now(),
sender: "user",
text,
};

setMessages((prev) => [...prev, userMessage]);
setInput("");

setTimeout(() => {
const aiMessage = {
id: Date.now() + 1,
sender: "ai",
text: getAIResponse(text),
};

setMessages((prev) => [...prev, aiMessage]);
}, 500);
};

const handleKeyDown = (event) => {
if (event.key === "Enter" && !event.shiftKey) {
event.preventDefault();
sendMessage();
}
};

const handleQuickAction = (action) => {
if (action.title === "Emergency help") {
navigate("/emergency");
return;
}

if (action.title === "Find a safer route") {
navigate("/plan-journey");
return;
}

if (action.title === "Nearby incidents") {
navigate("/map");
return;
}

sendMessage(action.text);
};

return (
<DashboardLayout>
<div className="ai-page">
<div className="ai-container">

{/* Header */}
<header className="ai-header">
<div className="ai-header-icon">
🤖
</div>

<div>
<h1>SafeRoute AI</h1>
<p>
Your intelligent safety assistant
</p>
</div>

<div className="ai-status">
<span></span>
Online
</div>
</header>

{/* Main content */}
<div className="ai-content">

{/* Left information panel */}
<aside className="ai-info-panel">

<div className="ai-welcome">
<div className="ai-big-icon">🛡️</div>

<h2>How can I help?</h2>

<p>
Ask SafeRoute AI about routes, incidents,
emergency services, or how to use the platform.
</p>
</div>

<div className="quick-title">
Quick Actions
</div>

<div className="quick-actions">
{quickActions.map((action) => (
<button
key={action.title}
className="quick-action"
onClick={() => handleQuickAction(action)}
>
<span className="quick-icon">
{action.icon}
</span>

<span>
<strong>{action.title}</strong>
<small>{action.text}</small>
</span>

<span className="quick-arrow">
→
</span>
</button>
))}
</div>

<div className="ai-safety-note">
<span>🔒</span>
<div>
<strong>Safety first</strong>
<p>
For immediate danger, use the Emergency
section instead of relying on AI.
</p>
</div>
</div>

</aside>

{/* Chat panel */}
<main className="ai-chat">

<div className="chat-header">
<div className="chat-avatar">
🤖
</div>

<div>
<strong>SafeRoute Assistant</strong>
<span>
Ask anything about SafeRoute BD
</span>
</div>
</div>

{/* Messages */}
<div className="messages">

{messages.map((message) => (
<div
key={message.id}
className={`message-row ${message.sender}`}
>
{message.sender === "ai" && (
<div className="message-avatar">
🤖
</div>
)}

<div className="message-bubble">
{message.text}
</div>
</div>
))}

</div>

{/* Suggestions */}
<div className="chat-suggestions">
<button
onClick={() =>
sendMessage("How can I find a safer route?")
}
>
🗺️ Safer route
</button>

<button
onClick={() =>
sendMessage("What are nearby incidents?")
}
>
⚠️ Incidents
</button>

<button
onClick={() =>
sendMessage("Where can I find emergency services?")
}
>
🏥 Emergency services
</button>
</div>

{/* Input */}
<div className="chat-input-area">
<textarea
value={input}
onChange={(e) => setInput(e.target.value)}
onKeyDown={handleKeyDown}
placeholder="Ask SafeRoute AI something..."
rows="1"
/>

<button
className="send-button"
onClick={() => sendMessage()}
disabled={!input.trim()}
aria-label="Send message"
>
➤
</button>
</div>

<p className="ai-disclaimer">
SafeRoute AI provides general guidance. For
emergencies, use the Emergency feature.
</p>

</main>
</div>
</div>
</div>
</DashboardLayout>
);
}

export default AIAssistant;