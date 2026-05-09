import { Router, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { protect, AuthRequest } from '../middleware/authMiddleware.js';
import Candidate from '../models/Candidate.js';

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// ====================================================
// POST /api/ai/summarize
// ====================================================
router.post('/summarize', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  const { candidateId } = req.body;

  try {
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      res.status(404).json({ success: false, message: 'Candidate not found' });
      return;
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Summarize the following election manifesto into 3 high-impact, professional bullet points for a digital voting app. Keep it neutral and focused on core promises.
    
    Candidate: ${candidate.name}
    Party: ${candidate.party}
    Manifesto: ${candidate.manifesto}
    
    Format:
    • Point 1
    • Point 2
    • Point 3`;

    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    res.json({ success: true, summary });
  } catch (error: any) {
    console.error('AI Summarizer Error:', error);
    res.status(500).json({ success: false, message: 'AI Engine is currently unavailable. Please try again later.' });
  }
});

// ====================================================
// POST /api/ai/compare
// ====================================================
router.post('/compare', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  const { candidateIds } = req.body; // Array of 2 IDs

  try {
    if (!candidateIds || candidateIds.length !== 2) {
      res.status(400).json({ success: true, message: 'Select exactly 2 candidates for comparison' });
      return;
    }

    const candidates = await Candidate.find({ _id: { $in: candidateIds } });
    if (candidates.length !== 2) {
      res.status(404).json({ success: false, message: 'Candidates not found' });
      return;
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Compare the following two election candidates for a digital voting app. Provide a neutral, objective comparison focused on their manifestos and experience.
    
    Candidate A: ${candidates[0].name} (${candidates[0].party})
    Manifesto: ${candidates[0].manifesto}
    Experience: ${candidates[0].experience}
    
    Candidate B: ${candidates[1].name} (${candidates[1].party})
    Manifesto: ${candidates[1].manifesto}
    Experience: ${candidates[1].experience}
    
    Provide a JSON response with the following keys:
    "overview": A short neutral summary,
    "candidateA_pros": [list],
    "candidateB_pros": [list],
    "key_differences": [list]`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Attempt to parse JSON from AI response
    let analysis;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { overview: responseText };
    } catch (e) {
      analysis = { overview: responseText };
    }

    res.json({ success: true, analysis });
  } catch (error: any) {
    console.error('AI Comparison Error:', error);
    res.status(500).json({ success: false, message: 'AI Comparison Engine encountered an error.' });
  }
});

export default router;
