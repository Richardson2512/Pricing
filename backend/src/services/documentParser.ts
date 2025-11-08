import dotenv from 'dotenv';

dotenv.config();

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

export interface ParsedDocument {
  deliverables?: string[];
  timeline?: string;
  tools?: string[];
  complexity?: string;
  dependencies?: string[];
}

export async function parseDocument(documentText: string): Promise<ParsedDocument> {
  try {
    const prompt = `Analyze the following Statement of Work (SoW) or contract document and extract key information:

${documentText}

Extract and return ONLY a JSON object with these fields:
{
  "deliverables": ["list of specific deliverables mentioned"],
  "timeline": "estimated timeline or deadline",
  "tools": ["tools, software, or resources mentioned"],
  "complexity": "low/medium/high based on requirements",
  "dependencies": ["any dependencies or prerequisites mentioned"]
}

Be concise and extract only factual information from the document.`;

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a document analysis expert. Extract structured information from contracts and SoWs. Return ONLY valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      console.error('DeepSeek API error for document parsing');
      return {};
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Try to parse JSON from response
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Failed to parse JSON from DeepSeek response');
    }

    return {};
  } catch (error) {
    console.error('Error parsing document:', error);
    return {};
  }
}

