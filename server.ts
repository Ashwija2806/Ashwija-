import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

interface CatalogSummaryItem {
  id: string;
  brand: string;
  name: string;
  gender: string;
  category: string;
  price: number;
  colors: string[];
  tags: string[];
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.post('/api/stylist', async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.status(503).json({
        error: 'GEMINI_API_KEY is not configured in environment secrets.',
      });
      return;
    }

    const { prompt, history, catalog } = req.body as {
      prompt?: string;
      history?: { role: 'user' | 'assistant'; text: string }[];
      catalog?: CatalogSummaryItem[];
    };

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      res.status(400).json({ error: 'Please describe an occasion, outfit vibe, or style.' });
      return;
    }

    const safeCatalog = Array.isArray(catalog) ? catalog.slice(0, 80) : [];
    const catalogContext = safeCatalog
      .map(
        (item) =>
          `${item.id} | ${item.brand} ${item.name} | ${item.gender} > ${item.category} | INR ${item.price} | Colors: ${item.colors.join(', ')} | Tags: ${item.tags.join(', ')}`
      )
      .join('\n');

    const conversationContext = Array.isArray(history)
      ? history
          .slice(-6)
          .map((m) => `${m.role === 'user' ? 'Shopper' : 'Stylist'}: ${m.text}`)
          .join('\n')
      : '';

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `${conversationContext ? `Recent conversation:\n${conversationContext}\n\n` : ''}Shopper request: "${prompt.trim()}"

Available Stylo Catalog:
${catalogContext}`,
        config: {
          systemInstruction:
            'You are Stylo AI Stylist, an editorial high-street fashion and lifestyle advisor. Recommend 2 to 4 cohesive items strictly from the provided Stylo Catalog IDs that fit the shopper occasion, weather, gender preference, or budget. Explain briefly why the pieces pair well together, and include one practical styling tip. Never invent product IDs outside the provided list.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              advice: {
                type: Type.STRING,
                description: 'Warm, concise 2-3 sentence outfit recommendation tailored to the shopper request.',
              },
              stylingTip: {
                type: Type.STRING,
                description: 'One short actionable styling or accessory pairing tip.',
              },
              recommendedIds: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '2 to 4 exact product IDs from the provided Stylo Catalog.',
              },
            },
            required: ['advice', 'stylingTip', 'recommendedIds'],
          },
        },
      });

      const rawText = (response.text ?? '').trim();
      const parsed = JSON.parse(rawText) as {
        advice: string;
        stylingTip: string;
        recommendedIds: string[];
      };

      const validIdSet = new Set(safeCatalog.map((c) => c.id));
      const filteredIds = (parsed.recommendedIds || []).filter((id) => validIdSet.has(id)).slice(0, 4);

      res.json({
        advice: parsed.advice || 'Here are curated pieces from our latest Stylo collection for your look.',
        stylingTip: parsed.stylingTip || 'Balance relaxed silhouettes with crisp footwear.',
        recommendedIds: filteredIds,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to reach AI Stylist service.';
      console.error('AI Stylist error:', message);
      res.status(502).json({
        error: 'The AI Stylist had trouble generating recommendations. Please try again in a moment.',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Stylo server listening on http://localhost:${PORT}`);
  });
}

startServer();
