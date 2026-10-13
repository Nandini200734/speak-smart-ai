import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini client setup
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const MODEL_NAME = 'gemini-3.8-flash';

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  const apiKeyConfigured = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  res.json({
    status: 'ok',
    apiKeyConfigured,
    model: MODEL_NAME,
    timestamp: new Date().toISOString(),
  });
});

// Endpoint 1: AI Speaking Coach response & feedback
app.post('/api/coach/chat', async (req: Request, res: Response) => {
  try {
    const {
      topic = 'College Life & Friends',
      userLevel = 'Intermediate',
      nativeLanguage = 'English',
      history = [],
      userResponse = '',
      mode = 'speaking_coach',
    } = req.body;

    const ai = getGeminiClient();

    // If Gemini API is available, generate authentic response
    if (ai) {
      const systemInstruction = `You are "SpeakSmart AI", an elite, deeply encouraging, empathetic personal English communication coach for college students and beginners.
Your student has proficiency level: "${userLevel}".
Their native language is: "${nativeLanguage}".
Current topic/context: "${topic}".
Current mode: "${mode}".

Core goals:
1. Ask ONE clear, engaging, conversational question at a time that invites personal storytelling, opinion, or explanation.
2. If the user provided an answer ("userResponse"), analyze it thoroughly:
   - Provide the EXACT original text.
   - Provide a "corrected" version that fixes grammatical errors, wrong prepositions, incorrect tenses, or unnatural phrasing without altering their intended meaning.
   - Provide a "naturalAlternative" showing how a fluent native English speaker or polished college peer would say it idiomatically.
   - Provide 1 to 3 concise, friendly "explanations" highlighting the key grammar rules or word-choice tips.
   - Provide a short "praise" sentence pointing out what they did well (e.g. good vocabulary attempt, clear idea).
   - Provide estimated skill ratings from 1 to 10 for: clarity, fluency, grammar, vocabulary, structure.
   - If their native language is known and this is a common translation pitfall (e.g. Mother Tongue Influence / direct translation like "I am having doubt" or "discuss about"), mention a brief nativeLanguageHint.
3. Keep the next question friendly, relevant, and curious.
4. Output MUST be valid JSON adhering strictly to the required schema.`;

      const prompt = `Conversation history:
${JSON.stringify(history, null, 2)}

User's latest response:
"${userResponse || '(User is starting the conversation. Generate the first opening question on this topic.)'}"

Respond in JSON with this exact format:
{
  "nextCoachQuestion": "string (the follow-up or opening question to the student)",
  "feedback": ${
    userResponse
      ? `{
    "original": "${userResponse.replace(/"/g, '\\"')}",
    "corrected": "string",
    "naturalAlternative": "string",
    "explanations": [
      {
        "point": "string (e.g. Subject-verb agreement)",
        "why": "string (short explanation in simple English)",
        "example": "string (e.g. Say 'She works' instead of 'She work')"
      }
    ],
    "praise": "string",
    "nativeLanguageHint": "string (optional insight if relevant)",
    "recurringPattern": "string (optional category like 'Verb Tense' or 'Preposition')",
    "estimatedMetrics": {
      "clarity": 8,
      "fluency": 7,
      "grammar": 8,
      "vocabulary": 7,
      "structure": 8
    }
  }`
      : 'null'
  }
}`;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const responseText = response.text || '{}';
      const parsed = JSON.parse(responseText);
      return res.json({ success: true, data: parsed });
    }

    // High-quality local fallback if no API key is provided
    const fallbackQuestion = userResponse
      ? `That's an interesting point! How did your teammates or professors react to that, and what did you learn from the experience?`
      : `Welcome to our practice session! To kick things off on "${topic}", could you tell me a little bit about what you enjoy most about it?`;

    return res.json({
      success: true,
      data: {
        nextCoachQuestion: fallbackQuestion,
        feedback: userResponse
          ? {
              original: userResponse,
              corrected: userResponse.replace(/\bi am having a doubt\b/gi, 'I have a question'),
              naturalAlternative: `To be honest, ${userResponse.toLowerCase().trim()}`,
              explanations: [
                {
                  point: 'Clarity and Structure',
                  why: 'State your main point first, then give one supporting example to make your speech impactful.',
                  example: 'Start with: "In my experience..." or "One reason is..."',
                },
              ],
              praise: 'Great job speaking up and expressing your thoughts clearly!',
              estimatedMetrics: {
                clarity: 8,
                fluency: 7,
                grammar: 8,
                vocabulary: 7,
                structure: 7,
              },
            }
          : null,
      },
    });
  } catch (error: any) {
    console.error('Error in /api/coach/chat:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to process speaking coach request',
    });
  }
});

// Endpoint 2: Role-Play simulation & feedback
app.post('/api/roleplay/step', async (req: Request, res: Response) => {
  try {
    const {
      scenarioId,
      scenarioTitle,
      characterName,
      characterRole,
      difficulty = 'Intermediate',
      userMessage = '',
      history = [],
      isFinalTurn = false,
      userProfile = {},
    } = req.body;

    const ai = getGeminiClient();

    if (ai) {
      const systemInstruction = `You are roleplaying as "${characterName}" (${characterRole}) in a realistic college communication training simulation.
Scenario: "${scenarioTitle}".
Difficulty: "${difficulty}".
Is Final Turn: ${isFinalTurn ? 'YES (wrap up the dialogue and generate a full feedback report)' : 'NO (stay in character)'}.

Guidelines:
1. Stay strictly in character. Speak naturally like a real professor, campus senior, recruiter, or teammate.
2. React realistically to the student's tone, politeness, clarity, and vocabulary.
3. If isFinalTurn is false:
   - Provide "characterReply" (1 to 3 conversational sentences in character).
   - Provide "coachTip" (a private whisper from the AI Coach giving advice for the next turn, e.g. "Try using a polite transition like 'Could you elaborate on...'").
4. If isFinalTurn is true:
   - Provide a final closing remark from the character.
   - Provide a detailed "finalEvaluation" object with summary, overallScore (0-100), strengths (list of strings), improvements (list of strings), suggestedPhrases (useful phrases for this specific situation), and metrics.
5. Output MUST be valid JSON adhering strictly to the schema.`;

      const prompt = `Dialogue history:
${JSON.stringify(history, null, 2)}

User's response:
"${userMessage || '(Starting the scenario. Greet the student and initiate the interaction in character.)'}"

Respond in JSON with this structure:
{
  "characterReply": "string",
  "coachTip": "string (advice for how to respond next)",
  "finalEvaluation": ${
    isFinalTurn
      ? `{
    "summary": "string",
    "overallScore": 85,
    "strengths": ["string", "string"],
    "improvements": ["string", "string"],
    "suggestedPhrases": ["string", "string", "string"],
    "metrics": {
      "confidence": 8,
      "relevance": 9,
      "professionalTone": 8,
      "clarity": 8
    }
  }`
      : 'null'
  }
}`;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ success: true, data: parsed });
    }

    // Fallback if no API key
    return res.json({
      success: true,
      data: {
        characterReply: isFinalTurn
          ? `Thank you for sharing your thoughts with me today. It was a productive conversation, and I appreciate your clarity.`
          : `That makes sense. Can you explain how you plan to implement this solution and what challenges you anticipate?`,
        coachTip: `Make sure to maintain steady eye contact and use structured phrases like "First...", "Furthermore...", and "In summary...".`,
        finalEvaluation: isFinalTurn
          ? {
              summary: 'Good interaction with clear intent and respectful communication.',
              overallScore: 82,
              strengths: [
                'Polite greeting and clear problem statement',
                'Engaged actively with the scenario requirements',
              ],
              improvements: [
                'Use more professional transitions instead of repeated "and then"',
                'State your key objective within the first sentence',
              ],
              suggestedPhrases: [
                'I would appreciate your guidance regarding...',
                'Could you suggest the best approach for...',
                'Thank you for your valuable feedback.',
              ],
              metrics: {
                confidence: 8,
                relevance: 9,
                professionalTone: 8,
                clarity: 8,
              },
            }
          : null,
      },
    });
  } catch (error: any) {
    console.error('Error in /api/roleplay/step:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to process role-play step',
    });
  }
});

// Endpoint 3: Public Speaking & GD Speech Evaluation
app.post('/api/speech/evaluate', async (req: Request, res: Response) => {
  try {
    const {
      taskType = 'jam_impromptu',
      topic = 'The impact of AI on student careers',
      durationSeconds = 60,
      transcript = '',
      targetSeconds = 60,
    } = req.body;

    const ai = getGeminiClient();

    // Word count calculation
    const words = transcript.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const minutes = Math.max(0.1, durationSeconds / 60);
    const estimatedWpm = Math.round(wordCount / minutes);

    if (ai) {
      const systemInstruction = `You are an expert speech coach and Group Discussion (GD) evaluator for university students.
The student completed a "${taskType}" challenge.
Topic: "${topic}".
Duration: ${durationSeconds} seconds (Target: ${targetSeconds}s).
Transcribed text: "${transcript}".
Word count: ${wordCount} words (Estimated pacing: ${estimatedWpm} WPM).

Evaluation Instructions:
1. Honest boundary: State clearly that the acoustic qualities (exact tone, volume, vocal acoustics) are not directly measured; this analysis is based on transcribed language, structure, argument flow, vocabulary, and calculated speaking rate (WPM).
2. Evaluate:
   - Organization: Did they use a strong hook/introduction, clear supporting arguments, and a punchy conclusion?
   - Clarity & Relevance: Did they stay on topic?
   - Fluency & Transition: How cohesive was the speech flow?
   - Vocabulary: Range and appropriateness of expressions.
3. Provide constructive, high-yield actionable feedback.
4. Output strictly as JSON according to the schema.`;

      const prompt = `Analyze this student speech:
Task: ${taskType}
Topic: ${topic}
Time spent: ${durationSeconds}s
Transcript:
"""${transcript}"""

Output JSON format:
{
  "pacingFeedback": "string (e.g. Ideal speaking rate for presentations is 130-150 WPM. Your rate was ${estimatedWpm} WPM...)",
  "metrics": {
    "organization": 8,
    "clarity": 8,
    "relevance": 9,
    "fluency": 7,
    "vocabulary": 8
  },
  "overallScore": 82,
  "structureAnalysis": {
    "introduction": "string (feedback on opening)",
    "bodyPoints": "string (feedback on evidence/examples)",
    "conclusion": "string (feedback on closing summary)"
  },
  "strengths": ["string", "string"],
  "actionableTips": ["string", "string", "string"],
  "modelSpeechSnippet": "string (a 2-3 sentence polished snippet illustrating how to deliver this topic persuasively)"
}`;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.6,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({
        success: true,
        data: {
          ...parsed,
          wordCount,
          durationSeconds,
          estimatedWpm,
        },
      });
    }

    // Local fallback
    return res.json({
      success: true,
      data: {
        wordCount,
        durationSeconds,
        estimatedWpm,
        pacingFeedback: `You spoke at approximately ${estimatedWpm} words per minute. A standard presentation pace is between 125 and 150 WPM.`,
        metrics: {
          organization: 7,
          clarity: 8,
          relevance: 8,
          fluency: 7,
          vocabulary: 8,
        },
        overallScore: 78,
        structureAnalysis: {
          introduction: 'Clear initial statement. Consider using a rhetorical question to hook listeners.',
          bodyPoints: 'Good core points. Backing them up with a concrete example makes your argument memorable.',
          conclusion: 'Sum up your central takeaway in one crisp finishing sentence.',
        },
        strengths: [
          'Maintained flow throughout the allotted time',
          'Addressed the central theme directly',
        ],
        actionableTips: [
          'Use transition signposts: "First and foremost", "On the other hand", "To wrap up"',
          'Avoid repeating filler phrases like "basically" or "you know"',
        ],
        modelSpeechSnippet: `When we look at ${topic}, the defining challenge isn't the technology itself, but how we adapt our skills. By focusing on active learning, we can turn uncertainty into our biggest advantage.`,
      },
    });
  } catch (error: any) {
    console.error('Error in /api/speech/evaluate:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to evaluate speech',
    });
  }
});

// Endpoint 4: Grammar exercise generator & feedback
app.post('/api/grammar/quiz', async (req: Request, res: Response) => {
  try {
    const { category = 'tenses', userLevel = 'Intermediate' } = req.body;
    const ai = getGeminiClient();

    if (ai) {
      const prompt = `Generate an interactive grammar learning module for college students at level "${userLevel}".
Grammar Focus: "${category}".

Provide:
1. "ruleTitle": clear catchy rule name
2. "ruleExplanation": 2-3 sentences explaining the rule simply and eliminating common student confusion
3. "commonPitfall": one common mistake students make (especially Indian or ESL college students)
4. "questions": 3 multiple-choice exercises. Each question must have:
   - "prompt": sentence with a blank (e.g. "By the time the professor arrived, we _____ the presentation.")
   - "options": array of 4 choices
   - "correctIndex": index of correct option (0-3)
   - "explanation": why this option is correct and why others fail

Return strictly valid JSON.`;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.5,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ success: true, data: parsed });
    }

    // Default fallback
    return res.json({
      success: true,
      data: {
        ruleTitle: 'Past Continuous vs Simple Past',
        ruleExplanation:
          'Use the Past Continuous for an ongoing background action, and Simple Past for the action that interrupted it.',
        commonPitfall: 'Saying "I was knowing him for 2 years" instead of "I have known him for 2 years".',
        questions: [
          {
            prompt: 'While the team _____ the code, the server crashed unexpectedly.',
            options: ['was testing', 'were tested', 'tests', 'has tested'],
            correctIndex: 0,
            explanation: '"Was testing" describes the continuous activity taking place when the interruption happened.',
          },
          {
            prompt: 'She _____ to the seminar yesterday before the keynote started.',
            options: ['went', 'was gone', 'has gone', 'is going'],
            correctIndex: 0,
            explanation: 'With a finished past time ("yesterday"), use Simple Past ("went").',
          },
          {
            prompt: 'Neither the team lead nor the developers _____ available right now.',
            options: ['are', 'is', 'was', 'were'],
            correctIndex: 0,
            explanation: 'With "neither... nor", the verb agrees with the closer subject ("developers" -> plural "are").',
          },
        ],
      },
    });
  } catch (error: any) {
    console.error('Error in /api/grammar/quiz:', error);
    res.status(500).json({ success: false, error: error?.message || 'Failed to generate grammar quiz' });
  }
});

// Endpoint 5: Check student's sentence with target vocabulary word
app.post('/api/vocabulary/check-sentence', async (req: Request, res: Response) => {
  try {
    const { word, sentence, definition } = req.body;
    const ai = getGeminiClient();

    if (ai) {
      const prompt = `The student was tasked with writing an original sentence using the vocabulary word "${word}" (Meaning: "${definition}").
Student's sentence: "${sentence}".

Evaluate:
1. Is the word used with the correct meaning and grammatical form (part of speech, preposition, collocation)?
2. Is the sentence natural and clear?
3. Provide:
   - "isCorrect": boolean
   - "feedback": friendly, specific explanation
   - "improvedVersion": a polished sentence preserving their core idea
   - "rating": number (1 to 5 stars)

Return strictly valid JSON.`;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ success: true, data: parsed });
    }

    const hasWord = sentence.toLowerCase().includes(word.toLowerCase());
    return res.json({
      success: true,
      data: {
        isCorrect: hasWord && sentence.length > 15,
        feedback: hasWord
          ? `Well done using "${word}" in your sentence! It communicates your idea effectively.`
          : `Make sure to incorporate the target word "${word}" directly into your sentence.`,
        improvedVersion: sentence,
        rating: hasWord ? 4 : 2,
      },
    });
  } catch (error: any) {
    console.error('Error in /api/vocabulary/check-sentence:', error);
    res.status(500).json({ success: false, error: error?.message || 'Failed to check sentence' });
  }
});

// Setup Vite middleware in dev or static files in prod
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req: Request, res: Response) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SpeakSmart AI server running on port ${PORT} (Prod: ${isProd})`);
  });
}

startServer();
