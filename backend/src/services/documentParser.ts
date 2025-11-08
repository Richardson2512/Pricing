import dotenv from 'dotenv';

dotenv.config();

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

export interface ParsedDocument {
  offering_type?: 'product' | 'service';
  domain?: 'digital' | 'physical';
  deliverables?: string[];
  materials?: string[];
  quantity?: string;
  timeline?: string;
  complexity?: 'low' | 'medium' | 'high';
  hints_of_budget?: string;
  region?: string;
  tools?: string[];
  dependencies?: string[];
  category?: string;
  keywords?: string[];
}

export async function parseDocument(documentText: string): Promise<ParsedDocument> {
  try {
    const prompt = `You are a pricing data extraction model. Parse the following business document (SoW, contract, quotation, invoice, RFP, purchase order, or project proposal) and extract all relevant information for pricing analysis.

Document Content:
${documentText}

Extract and return ONLY a JSON object with these fields:
{
  "offering_type": "product" or "service",
  "domain": "digital" or "physical",
  "deliverables": ["list of specific deliverables, items, or outputs mentioned"],
  "materials": ["raw materials, components, or physical items mentioned"],
  "quantity": "quantity or scope mentioned (e.g., '100 units', '5 modules', '3 months')",
  "timeline": "estimated timeline, deadline, or duration",
  "complexity": "low", "medium", or "high" based on requirements and scope,
  "hints_of_budget": "any budget, rate, cost, or price hints mentioned",
  "region": "client or buyer region/country if mentioned",
  "tools": ["tools, software, equipment, or technology mentioned"],
  "dependencies": ["dependencies, prerequisites, or requirements mentioned"],
  "category": "inferred category (e.g., 'UI/UX Design', 'Web Development', 'Manufacturing', 'Consulting')",
  "keywords": ["key terms that describe the work"]
}

Rules:
- Be precise and extract only factual information from the document
- Infer offering_type and domain based on context
- For complexity, consider scope, technical requirements, and deliverables
- Extract any pricing hints even if vague
- Return valid JSON only`;


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
        max_tokens: 2000,
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

/**
 * Category Detection - Maps parsed document data to scraping sources
 */
export function detectScrapingSources(parsedDoc: ParsedDocument): string[] {
  const sources: string[] = [];
  const category = parsedDoc.category?.toLowerCase() || '';
  const keywords = parsedDoc.keywords?.map(k => k.toLowerCase()) || [];
  const domain = parsedDoc.domain;
  const offeringType = parsedDoc.offering_type;

  // Digital Services
  if (domain === 'digital' && offeringType === 'service') {
    if (category.includes('design') || category.includes('ui') || category.includes('ux')) {
      sources.push('fiverr', 'upwork', 'freelancer');
    } else if (category.includes('development') || category.includes('web') || category.includes('app')) {
      sources.push('upwork', 'freelancer', 'fiverr');
    } else if (category.includes('marketing') || category.includes('seo') || category.includes('content')) {
      sources.push('fiverr', 'upwork', 'freelancer');
    } else if (category.includes('consulting') || category.includes('strategy')) {
      sources.push('upwork', 'freelancer');
    } else {
      // Generic digital service
      sources.push('fiverr', 'upwork', 'freelancer');
    }
  }

  // Digital Products
  if (domain === 'digital' && offeringType === 'product') {
    if (category.includes('software') || category.includes('saas') || category.includes('app')) {
      sources.push('producthunt', 'appsumo');
    } else if (category.includes('course') || category.includes('ebook') || category.includes('template')) {
      sources.push('etsy', 'appsumo');
    } else {
      sources.push('appsumo', 'producthunt');
    }
  }

  // Physical Products
  if (domain === 'physical' && offeringType === 'product') {
    if (category.includes('handmade') || category.includes('craft') || category.includes('art')) {
      sources.push('etsy');
    } else if (category.includes('industrial') || category.includes('manufacturing') || category.includes('b2b')) {
      sources.push('indiamart');
    } else {
      sources.push('etsy', 'indiamart');
    }
  }

  // Physical Services
  if (domain === 'physical' && offeringType === 'service') {
    sources.push('indiamart');
  }

  // Remove duplicates
  return [...new Set(sources)];
}

