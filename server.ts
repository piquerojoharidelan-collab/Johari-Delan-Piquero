import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '2mb' }));

// Helper to check for safety signals
function isDistressContent(text: string): boolean {
  const distressRegex = /(kill myself|suicide|suicidal|end my life|want to die|hurt myself|self-harm|cutting myself|no reason to live|hanging myself)/i;
  return distressRegex.test(text);
}

const SUPPORTIVE_RESPONSE = `I care very much about your well-being. It sounds like you are going through a difficult time, and you do not have to carry this alone. Please consider connecting with a trusted person, family member, or healthcare professional who can listen and support you right now.`;

// Endpoint: AI Chat with Gemini & contextual history
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, conversationHistory = [], role = 'general_assistant', userContext = {} } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Safety priority check
    if (isDistressContent(message)) {
      return res.json({
        reply: SUPPORTIVE_RESPONSE,
      });
    }

    // System instruction tailored to role & user data
    const profileSummary = userContext.profile
      ? `User Profile: Name: ${userContext.profile.name || 'Friend'}, Age: ${userContext.profile.age || 'Not specified'}, Goal: ${userContext.profile.primaryGoal || 'Balanced lifestyle'}, Fitness Level: ${userContext.profile.activityLevel || 'Moderate'}, Preferred Activities: ${(userContext.profile.preferredActivities || []).join(', ') || 'General'}.`
      : 'User Profile: Not yet completed onboarding.';

    const statsSummary = userContext.stats
      ? `User Recorded Activity History: Total Exercise Sessions: ${userContext.stats.totalExerciseSessions || 0}, Total Exercise Minutes: ${userContext.stats.totalExerciseMinutes || 0}, Total Breathwork Sessions: ${userContext.stats.totalBreathworkSessions || 0}, Total Breathwork Minutes: ${userContext.stats.totalBreathworkMinutes || 0}, Recent Workouts: ${JSON.stringify(userContext.stats.recentExercises || [])}, Recent Breathwork: ${JSON.stringify(userContext.stats.recentBreathwork || [])}.`
      : 'User Recorded Activity History: No recorded sessions yet.';

    const systemPrompt = `You are CareNova, a compassionate, professional, and knowledgeable AI Physical and Mental Wellness Assistant.
Role mode: ${role}.
${profileSummary}
${statsSummary}

CRITICAL SAFETY & MEDICAL BOUNDARIES:
- You are a wellness and lifestyle coach, NOT a doctor, psychologist, or licensed healthcare provider.
- Never diagnose medical, psychological, or psychiatric conditions.
- Never prescribe medication or suggest modifying prescribed medications.
- Never encourage extreme dieting, dangerous fasting, or pushing through sharp/acute physical pain.
- Clearly emphasize that BMI is a general screening indicator, not a diagnostic health metric.
- For severe, chronic, or concerning symptoms, gently direct the user to consult a licensed medical or mental health professional.

BEHAVIOR AND TONE:
- Be warm, encouraging, nonjudgmental, practical, and science-grounded.
- When asked about the user's exercise history, minutes, or breathwork, use the exact recorded activity numbers provided above! If the user has 0 sessions or no records yet, state clearly and kindly that they have not recorded any sessions yet and invite them to try one.
- When recommending workouts or breathing, provide clear, structured steps, estimated durations, and safety advice (e.g., proper form, breathing rhythm).
- Keep responses concise, well-formatted with markdown lists or bold key points, avoiding overly lengthy walls of text.`;

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      try {
        const ai = new GoogleGenAI({ apiKey });

        // Build history contents
        const contents: any[] = [];
        for (const item of conversationHistory.slice(-6)) {
          contents.push({
            role: item.role === 'user' ? 'user' : 'model',
            parts: [{ text: item.text }],
          });
        }
        contents.push({
          role: 'user',
          parts: [{ text: message }],
        });

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.7,
          },
        });

        const reply = response.text || 'I am here with you. How can I assist your wellness journey today?';
        return res.json({ reply, source: 'gemini' });
      } catch (err: any) {
        console.warn('Gemini API call warning:', err?.message || err);
        // Fall back smoothly to context-aware local intelligence
      }
    }

    // Context-aware fallback if Gemini API key is missing or errored
    let fallbackReply = '';
    const lower = message.toLowerCase();

    if (lower.includes('how many minutes') || lower.includes('how much time') || lower.includes('exercise') || lower.includes('workout')) {
      const mins = userContext.stats?.totalExerciseMinutes || 0;
      const count = userContext.stats?.totalExerciseSessions || 0;
      if (count === 0) {
        fallbackReply = `According to your saved records, you haven't recorded any exercise sessions yet! Whenever you're ready, you can start a workout in the **Exercise Tracker** or choose a routine from our **Activity Library**.`;
      } else {
        fallbackReply = `Based on your saved activity records, you have completed **${count} exercise session${count === 1 ? '' : 's'}** totaling **${mins} minute${mins === 1 ? '' : 's'}** of physical movement. Great effort investing in your physical health!`;
      }
    } else if (lower.includes('breath') || lower.includes('breathwork') || lower.includes('meditat')) {
      const bCount = userContext.stats?.totalBreathworkSessions || 0;
      const bMins = userContext.stats?.totalBreathworkMinutes || 0;
      if (bCount === 0) {
        fallbackReply = `You currently have 0 saved breathwork sessions. Taking even a 1-minute Box Breathing break can noticeably soothe your nervous system. Head over to the **Breathwork** tab to try a calming session!`;
      } else {
        fallbackReply = `You have completed **${bCount} breathwork session${bCount === 1 ? '' : 's'}** for a total of **${bMins} minute${bMins === 1 ? '' : 's'}** of mindful breathing. Consistent breathing practice helps regulate your autonomic nervous system.`;
      }
    } else if (lower.includes('stress') || lower.includes('anxious') || lower.includes('overwhelm') || lower.includes('calm')) {
      fallbackReply = `I hear you, and it's completely normal to feel stressed or overwhelmed at times. Here is a quick 3-step reset you can do right now:
1. **Unclench & Drop**: Drop your shoulders away from your ears, relax your jaw, and let your hands rest openly.
2. **Slow Exhale**: Take a normal breath in through your nose for 4 seconds, then exhale slowly through your mouth for 6 seconds.
3. **5-4-3-2-1 Grounding**: Name 3 things you can see around you right now and 2 things you can physically feel.

Would you like to start a guided 3-minute Box Breathing session together in the Breathwork tab?`;
    } else if (lower.includes('plan') || lower.includes('schedule') || lower.includes('routine')) {
      fallbackReply = `Here is an achievable daily wellness routine tailored for balanced energy:
- **Morning (7:30 AM)**: 5-minute gentle mobility stretch & glass of water.
- **Mid-Day (12:30 PM)**: 15-minute brisk outdoor walk or desk posture reset.
- **Afternoon (3:30 PM)**: 3-minute Box Breathing break to reset focus.
- **Evening (9:00 PM)**: 4-7-8 relaxation breathing and screen-free wind-down.

You can also set these up as interactive reminders in the **Reminders** planner!`;
    } else {
      fallbackReply = `Hello ${userContext.profile?.name || 'there'}! I'm CareNova, your physical and mental wellness assistant. I'm here to support your healthy habits, guide your workouts, offer calming breathwork, and track your wellness progress. What would you like to focus on today?`;
    }

    return res.json({ reply: fallbackReply, source: 'context-fallback' });
  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    return res.status(500).json({ error: 'Internal server error processing chat' });
  }
});

// Endpoint: Health status
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    timestamp: new Date().toISOString(),
  });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CareNova server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
