import dotenv from 'dotenv';

dotenv.config();

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// Validate API key but don't crash - log warning instead
if (!DEEPSEEK_API_KEY) {
  console.warn('⚠️ DEEPSEEK_API_KEY not configured - document parsing will fail');
  console.warn('   Set DEEPSEEK_API_KEY environment variable to enable document parsing');
}

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
  travel_required?: boolean;
  travel_details?: {
    frequency?: string;
    scope?: string;
    mode?: string;
    purpose?: string;
    client_bears_cost?: boolean;
    origin?: string;
    destination?: string;
  };
}

export async function parseDocument(documentText: string): Promise<ParsedDocument> {
  // Validate API key at function call time
  if (!DEEPSEEK_API_KEY) {
    throw new Error('DeepSeek API key is not configured. Document parsing requires DEEPSEEK_API_KEY environment variable.');
  }
  
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
  "keywords": ["key terms that describe the work"],
  "travel_required": true or false (detect from keywords: onsite, visit, site visit, inspection, travel, client location, field, installation, delivery, physical presence),
  "travel_details": {
    "frequency": "one_time", "daily", "weekly", "monthly", or "per_project" if travel mentioned,
    "scope": "local", "regional", "inter_city", "interstate", or "international" if travel mentioned,
    "mode": "bike", "car", "public_transport", "train", "flight", or "mixed" if specified,
    "purpose": "reason for travel (e.g., installation, inspection, meeting, delivery)",
    "client_bears_cost": true or false if mentioned (keywords: reimbursable, travel allowance, client bears),
    "origin": "service provider location if mentioned",
    "destination": "client/site location if mentioned"
  }
}

Rules:
- Be precise and extract only factual information from the document
- Infer offering_type and domain based on context
- For complexity, consider scope, technical requirements, and deliverables
- Extract any pricing hints even if vague
- Detect travel requirements from keywords like: onsite, visit, inspection, travel, site visit, client location, field work, installation, delivery, physical presence
- If no travel keywords found, set travel_required to false and omit travel_details
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

    const data: any = await response.json();
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

