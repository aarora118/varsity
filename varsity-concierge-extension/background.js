// Varsity Tutors Learning Concierge - background.js

// === CONFIGURATION ===
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
const LLAMA_API_ENDPOINT = 'YOUR_LLAMA_API_ENDPOINT';
const LLAMA_API_KEY = 'YOUR_LLAMA_API_KEY';

const MASTER_PROMPT = `You are the 'Varsity Tutors Learning Concierge,' a friendly, professional, and highly helpful AI assistant. You have two primary jobs: 1) Act as a diagnostic expert to guide users through a quiz to understand their needs. 2) Act as a knowledgeable Program Director who can answer questions about Varsity Tutors.

**YOUR RULES ARE NON-NEGOTIABLE:**
1.  **NEVER HALLUCINATE.** If you do not know the answer, or if the information is not in the provided context, you MUST respond with: "That's a great question. To give you the most accurate information, I can connect you with one of our human Program Directors."
2.  **STAY ON TOPIC.** Only answer questions directly related to Varsity Tutors' services. Politely decline to answer any other questions.
3.  **USE THE PROVIDED CONTEXT.** For factual questions, you MUST base your answer only on the context provided.
4.  **BE CONVERSATIONAL BUT EFFICIENT.** Guide the user toward completing their learning plan.`;

// === SUPABASE CLIENT ===
// (You must add @supabase/supabase-js to your extension build process)
let supabase = null;
if (typeof window === 'undefined') {
  importScripts('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
  supabase = supabase || createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// === STATE MANAGEMENT ===
const userStates = {};

function getSessionId(sender) {
  // Use tabId or fallback to a random session
  return sender.tab ? `tab-${sender.tab.id}` : `session-${Math.random().toString(36).slice(2)}`;
}

// === RAG: Retrieve relevant Varsity Tutors content ===
async function getRelevantContext(query) {
  // Placeholder: In production, use OpenAI or Llama to embed the query, then search Supabase for similar content
  // Here, we just return a dummy context
  return 'Varsity Tutors offers expert tutors in hundreds of subjects, flexible scheduling, and a satisfaction guarantee.';
}

// === Llama API Call ===
async function callLlamaAPI(prompt) {
  // Placeholder: Replace with actual API call
  // Example fetch:
  // const response = await fetch(LLAMA_API_ENDPOINT, { ... });
  // return (await response.json()).result;
  return 'This is a simulated Llama API response.';
}

// === Tutor Search ===
async function findTutors(subject) {
  // Placeholder: Replace with Supabase query
  return [
    {
      name: 'Jane Doe',
      subject: subject,
      bio: 'Expert in high school mathematics with 10+ years of experience.',
      verified_credentials: 'M.Ed. in Mathematics',
      video_intro_url: 'https://example.com/video1.mp4',
      hourly_rate: 75,
      image_url: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
    {
      name: 'John Smith',
      subject: subject,
      bio: 'Specializes in score improvement strategies for the SAT.',
      verified_credentials: 'Certified SAT Coach',
      video_intro_url: 'https://example.com/video2.mp4',
      hourly_rate: 90,
      image_url: 'https://randomuser.me/api/portraits/men/46.jpg',
    },
  ];
}

// === Learning Plan Generation ===
async function generateLearningPlan(subject, goal, painPoints) {
  // Placeholder: Replace with Llama API call and/or Supabase query
  return {
    subject,
    goal,
    roadmap: [
      { week: 1, topic: 'Linear Equations' },
      { week: 2, topic: 'Inequalities' },
      { week: 3, topic: 'Intro to Quadratic Equations' },
      { week: 4, topic: 'Review and Assessment' },
    ],
    success: 'Your tutor will use mock quizzes and session feedback to track progress. You can view all reports in your parent portal.',
    addons: 'Consider adding our 24/7 homework help line for extra support.'
  };
}

// === Format Plan as HTML ===
function formatLearningPlanHTML(plan) {
  return `<div class="learning-plan">
    <h3>Your Personalized ${plan.subject} Plan</h3>
    <p><strong>Primary Goal:</strong> ${plan.goal}</p>
    <h4>Weekly Roadmap:</h4>
    <ul>${plan.roadmap.map(w => `<li><strong>Week ${w.week}:</strong> ${w.topic}</li>`).join('')}</ul>
    <h4>How We Measure Success:</h4>
    <p>${plan.success}</p>
    <h4>Optional Add-ons:</h4>
    <p>${plan.addons}</p>
  </div>`;
}

// === Format Tutor Profiles as HTML ===
function formatTutorProfilesHTML(tutors) {
  return tutors.map(tutor => `
    <div class="tutor-profile">
      <img src="${tutor.image_url}" alt="${tutor.name}" />
      <div class="tutor-info">
        <div class="tutor-name">${tutor.name}</div>
        <div class="tutor-bio">${tutor.bio}</div>
        <div class="tutor-credentials">${tutor.verified_credentials || ''}</div>
      </div>
      <div class="tutor-actions">
        <button data-value="Book ${tutor.name}">Book a Free Intro</button>
      </div>
    </div>
  `).join('');
}

// === Format Pricing Component as HTML ===
function formatPricingHTML(baseRate = 75) {
  return `<div class="pricing-component">
    <label for="hours-slider"><strong>Choose weekly hours:</strong></label>
    <input type="range" id="hours-slider" min="1" max="5" value="2" data-rate="${baseRate}">
    <span id="hours-value">2</span> hrs/week
    <div>
      <strong>Price: $<span id="price-value">${baseRate * 2}</span>/week</strong>
    </div>
  </div>`;
}

// === Conversation State Machine ===
function getInitialState() {
  return {
    phase: 'greeting',
    userType: null,
    subject: null,
    goal: null,
    painPoints: null,
    plan: null,
    tutors: null
  };
}

function getQuizPrompt(state) {
  switch (state.phase) {
    case 'greeting':
      return {
        html: `Hi there! I'm the Varsity Tutors Learning Concierge. I can help you build a personalized learning plan and find the perfect tutor in just a few minutes. To start, are you a parent, or a student?<br><br><button data-value="parent">I'm a Parent</button> <button data-value="student">I'm a Student</button>`
      };
    case 'awaiting_subject':
      return { html: 'What subject are you looking for help with?' };
    case 'awaiting_goal':
      return { html: 'Understood. And what\'s the primary goal? Is it to catch up and improve a grade, prepare for a specific test like an exam or the SAT, or to get ahead in the subject?' };
    case 'awaiting_pain':
      return { html: `That\'s very helpful. Are there any specific topics within <strong>${state.subject}</strong> that are particularly challenging?` };
    case 'generating_plan':
      return { html: `Perfect. I'm now creating a custom plan that addresses those specific goals. Please give me just a moment...` };
    default:
      return { html: '' };
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const sessionId = getSessionId(sender);
  if (!userStates[sessionId]) userStates[sessionId] = getInitialState();
  const state = userStates[sessionId];

  switch (message.type) {
    case 'requestGreeting': {
      state.phase = 'greeting';
      chrome.tabs.sendMessage(sender.tab.id, { type: 'botMessage', html: getQuizPrompt(state).html });
      break;
    }
    case 'userMessage': {
      const text = message.text.trim();
      if (state.phase === 'greeting') {
        if (/parent/i.test(text)) {
          state.userType = 'parent';
        } else if (/student/i.test(text)) {
          state.userType = 'student';
        } else {
          chrome.tabs.sendMessage(sender.tab.id, { type: 'botMessage', html: getQuizPrompt(state).html });
          break;
        }
        state.phase = 'awaiting_subject';
        chrome.tabs.sendMessage(sender.tab.id, { type: 'botMessage', html: getQuizPrompt(state).html });
      } else if (state.phase === 'awaiting_subject') {
        state.subject = text;
        state.phase = 'awaiting_goal';
        chrome.tabs.sendMessage(sender.tab.id, { type: 'botMessage', html: getQuizPrompt(state).html });
      } else if (state.phase === 'awaiting_goal') {
        state.goal = text;
        state.phase = 'awaiting_pain';
        chrome.tabs.sendMessage(sender.tab.id, { type: 'botMessage', html: getQuizPrompt(state).html });
      } else if (state.phase === 'awaiting_pain') {
        state.painPoints = text;
        state.phase = 'generating_plan';
        chrome.tabs.sendMessage(sender.tab.id, { type: 'botMessage', html: getQuizPrompt(state).html });
        // Generate plan and tutors
        (async () => {
          state.plan = await generateLearningPlan(state.subject, state.goal, state.painPoints);
          state.tutors = await findTutors(state.subject);

          const planHTML = formatLearningPlanHTML(state.plan);
          const tutorsIntroHTML = `<div><strong>Based on this plan, I've found a couple of highly-qualified tutors...</strong></div>`;
          const tutorsHTML = formatTutorProfilesHTML(state.tutors);
          const pricingHTML = formatPricingHTML(state.tutors[0]?.hourly_rate || 75);
          const closingHTML = `<div>Would you like to select a tutor and check out, or book a free intro call?</div>`;

          const finalHTML = planHTML + tutorsIntroHTML + tutorsHTML + pricingHTML + closingHTML;

          chrome.tabs.sendMessage(sender.tab.id, { type: 'botMessage', html: finalHTML });
          state.phase = 'plan_generated'; // Update state after plan is sent
        })();
      } else {
        // RAG for factual questions
        (async () => {
          const context = await getRelevantContext(text);
          const prompt = `${MASTER_PROMPT}\nBased on the following context from the Varsity Tutors website, please answer the user's question. Context: ${context}. User's Question: ${text}`;
          const answer = await callLlamaAPI(prompt);
          chrome.tabs.sendMessage(sender.tab.id, { type: 'botMessage', html: answer });
        })();
      }
      break;
    }
    default:
      break;
  }
}); 