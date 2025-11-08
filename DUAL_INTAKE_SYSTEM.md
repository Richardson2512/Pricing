# Dual-Intake Pricing Intelligence System

## Overview

The PriceWise platform now features a **dual-intake pricing intelligence system** that allows users to get pricing recommendations through two distinct methods:

1. **Manual Questionnaire** - Structured form-based input
2. **Document Upload & Parsing** - Automated extraction from business documents

This system leverages DeepSeek V3 AI for intelligent document parsing and pricing analysis, combined with real-time market data scraping.

---

## System Architecture

### Core Flow

```
User Entry Point
    ↓
┌─────────────────────────────────┐
│  PricingIntakeSelector Component │
│  "Manual vs Document Upload"     │
└─────────────────────────────────┘
         ↓                ↓
    [Manual]         [Document]
         ↓                ↓
┌──────────────┐   ┌──────────────────┐
│ Questionnaire│   │ Document Upload  │
│ (5 Steps)    │   │ (Drag & Drop)    │
└──────────────┘   └──────────────────┘
         ↓                ↓
         └────────┬───────┘
                  ↓
         ┌────────────────────┐
         │ Backend Processing │
         │ 1. Parse/Structure │
         │ 2. Detect Category │
         │ 3. Scrape Markets  │
         │ 4. Clean Data      │
         │ 5. AI Analysis     │
         │ 6. Store Results   │
         └────────────────────┘
                  ↓
         ┌────────────────────┐
         │ Pricing Analysis   │
         │ Result Display     │
         └────────────────────┘
```

---

## Route A: Manual Questionnaire

### User Experience
1. User clicks "Fill Out Questionnaire"
2. 5-step multi-step form with progress bar
3. Questions cover:
   - Business & offering type
   - Experience, region, niche, pricing goal
   - Product description & costs
   - Competitor pricing & value proposition
   - Optional document upload (for freelancers)

### Technical Implementation

**Frontend:**
- `PricingIntakeSelector.tsx` - Entry point
- `MultiStepQuestionnaire.tsx` - 5-step form with validation
- `Dashboard.tsx` - Orchestrates flow

**Backend:**
- `POST /api/consultations` - Manual consultation endpoint
- Structured data validation with Zod
- Direct market data scraping
- DeepSeek V3 pricing analysis

**Data Flow:**
```typescript
User Input → Validation → Market Scraping → AI Analysis → Database → Result
```

---

## Route B: Document Upload & Parsing

### User Experience
1. User clicks "Upload Documents"
2. Drag & drop or browse files
3. Supports: PDF, DOCX, DOC, TXT, CSV
4. Real-time file validation (type & size)
5. Automatic processing with progress feedback

### Supported Document Types
- **Statement of Work (SoW)**
- **Contracts**
- **Quotations**
- **Purchase Orders**
- **Project Proposals**
- **RFPs (Request for Proposals)**
- **Invoices**
- **Book Orders**

### Technical Implementation

**Frontend:**
- `DocumentUploadFlow.tsx` - Upload interface with drag & drop
- File validation (10MB max, supported types)
- Upload to Supabase Storage
- Loading states and error handling

**Backend:**
- `POST /api/consultations/document` - Document-based endpoint
- File extraction libraries:
  - `pdf-parse` for PDFs
  - `mammoth` for DOCX/DOC
  - Native Buffer for TXT/CSV

**Processing Pipeline:**

#### Step 1: File Upload & Text Extraction
```typescript
Files → Supabase Storage → Download → Extract Text → Combine
```

#### Step 2: DeepSeek V3 Document Parsing
```typescript
interface ParsedDocument {
  offering_type: 'product' | 'service';
  domain: 'digital' | 'physical';
  deliverables: string[];
  materials: string[];
  quantity: string;
  timeline: string;
  complexity: 'low' | 'medium' | 'high';
  hints_of_budget: string;
  region: string;
  tools: string[];
  dependencies: string[];
  category: string;
  keywords: string[];
}
```

**AI Prompt:**
```
You are a pricing data extraction model.
Parse the document and extract:
- Type of work (product/service)
- Domain (digital/physical)
- Deliverables or items
- Tools, materials, or equipment
- Quantity or scope
- Timeline or deadlines
- Budget hints
- Complexity indicators
- Region

Output structured JSON.
```

#### Step 3: Category Detection & Source Mapping

**Logic:**
```typescript
function detectScrapingSources(parsedDoc: ParsedDocument): string[] {
  // Digital Services → Fiverr, Upwork, Freelancer
  // Digital Products → ProductHunt, AppSumo
  // Physical Products → Etsy, IndiaMART
  // Physical Services → IndiaMART
  
  // Specific categories:
  // - UI/UX Design → Fiverr, Upwork, Freelancer
  // - Web Development → Upwork, Freelancer, Fiverr
  // - SaaS/Software → ProductHunt, AppSumo
  // - Handmade/Crafts → Etsy
  // - Manufacturing/B2B → IndiaMART
}
```

#### Step 4: Market Data Scraping
```typescript
// Scrape from detected sources
const sources = detectScrapingSources(parsedDoc);
// e.g., ['fiverr', 'upwork', 'freelancer']

const marketData = await scrapeMarketData({
  businessType: parsedDoc.domain,
  offeringType: parsedDoc.offering_type,
  region: parsedDoc.region,
  niche: parsedDoc.category,
  sources: sources,
});
```

#### Step 5: Data Cleaning & Enrichment
```typescript
const cleanedData = cleanMarketData(rawMarketData);
const enrichedData = enrichMarketData(cleanedData);
```

#### Step 6: AI Pricing Analysis
```typescript
const recommendation = await generatePricingRecommendation({
  ...parsedDoc,
  marketData: enrichedData,
});

// Returns:
{
  price_low: 850,
  price_mid: 1200,
  price_high: 1800,
  currency: "INR",
  reasoning: {
    cost_breakdown: "...",
    market_comparison: "...",
    tool_costs: "...",
    labor_hours: "...",
    complexity_factor: "...",
    competitor_benchmark: [...]
  }
}
```

#### Step 7: Database Storage
```typescript
// Store consultation
await supabase.from('consultations').insert({
  user_id,
  business_type: `${domain}_${offering_type}`,
  target_market: `${region} - ${category}`,
  product_description: deliverables.join(', '),
  pricing_recommendation: JSON.stringify(recommendation),
});

// Store parsed document metadata
await supabase.from('uploaded_documents').insert({
  user_id,
  file_path,
  parsed_deliverables,
  parsed_timeline,
  parsed_tools,
  parsed_complexity,
  parsing_status: 'completed',
});
```

---

## Database Schema

### Tables Used

**`consultations`**
- Stores pricing analysis results
- Links to user and questionnaire responses
- Contains AI-generated recommendations

**`uploaded_documents`**
- Stores document metadata
- Parsed data (deliverables, tools, complexity)
- File paths in Supabase Storage
- Parsing status tracking

**`questionnaire_responses`**
- Stores manual questionnaire answers
- Links to consultations
- Structured user input

**`market_listings`**
- Scraped market data
- Competitor pricing information
- Used for benchmarking

**`profiles`**
- User credits
- Purchase history
- Analysis statistics

---

## API Endpoints

### Manual Consultation
```
POST /api/consultations
Authorization: Bearer <token>

Body:
{
  "businessType": "digital",
  "offeringType": "service",
  "experienceLevel": "intermediate",
  "region": "India",
  "niche": "UI/UX Design",
  "pricingGoal": "market_rate",
  "productDescription": "...",
  "costToDeliver": "...",
  "competitorPricing": "...",
  "valueProposition": "..."
}

Response:
{
  "consultation": { ... }
}
```

### Document-Based Consultation
```
POST /api/consultations/document
Authorization: Bearer <token>

Body:
{
  "filePaths": [
    "user-id/timestamp_file1.pdf",
    "user-id/timestamp_file2.docx"
  ]
}

Response:
{
  "consultation": { ... },
  "parsedData": {
    "offering_type": "service",
    "domain": "digital",
    "deliverables": [...],
    "category": "UI/UX Design",
    ...
  }
}
```

---

## Key Features

### ✅ Implemented

1. **Dual Entry Point**
   - Clean UI for method selection
   - Clear benefits for each option
   - Supported document types displayed

2. **Document Upload**
   - Drag & drop interface
   - Multiple file support
   - File type & size validation
   - Real-time upload status

3. **AI Document Parsing**
   - DeepSeek V3 integration
   - Comprehensive field extraction
   - Intelligent categorization
   - Budget hint detection

4. **Category Detection**
   - Automatic source mapping
   - Platform-specific routing
   - Domain & offering type inference

5. **Market Data Integration**
   - Dynamic source selection
   - Real-time scraping
   - Data cleaning & enrichment

6. **Unified Analysis**
   - Same AI engine for both routes
   - Consistent output format
   - Detailed reasoning

7. **Database Persistence**
   - Document metadata storage
   - Consultation history
   - Parsed data tracking

### 🔄 Pending Enhancements

1. **OCR Support**
   - Image-based PDF parsing
   - Tesseract/PaddleOCR integration

2. **Embeddings Matching**
   - Semantic similarity search
   - Better market data matching

3. **Reusable Profiles**
   - Save parsed SoW profiles
   - Compare pricing over time

4. **Confidence Scoring**
   - Analysis quality metrics
   - Reliability indicators

5. **Enhanced Supabase Schema**
   - Additional fields for parsed data
   - Better indexing for queries

---

## Usage Examples

### Example 1: Freelancer with SoW

**Input:** Upload Statement of Work PDF

**Document Content:**
```
Project: E-commerce Website Redesign
Deliverables:
- 5 page designs (Home, Product, Cart, Checkout, Profile)
- Mobile responsive
- Figma prototypes
- 2 revision rounds

Timeline: 3 weeks
Tools: Figma, Adobe XD
Client Region: USA
```

**Parsed Output:**
```json
{
  "offering_type": "service",
  "domain": "digital",
  "deliverables": [
    "5 page designs",
    "Mobile responsive",
    "Figma prototypes",
    "2 revision rounds"
  ],
  "timeline": "3 weeks",
  "tools": ["Figma", "Adobe XD"],
  "complexity": "medium",
  "region": "USA",
  "category": "UI/UX Design"
}
```

**Scraping Sources:** Fiverr, Upwork, Freelancer

**Pricing Result:**
```
Low: $1,200
Average: $1,800
High: $2,500

Reasoning:
- 5 pages × $300-400/page (market rate for intermediate designers)
- Mobile responsiveness adds 20% complexity
- 2 revisions included (standard practice)
- USA client typically pays 30% more than global average
- Figma proficiency is standard, no premium
```

### Example 2: Manufacturer with Purchase Order

**Input:** Upload Purchase Order CSV

**Document Content:**
```
Item: Steel Bolts M8
Quantity: 10,000 units
Material: Stainless Steel 304
Delivery: 2 months
Region: India
```

**Parsed Output:**
```json
{
  "offering_type": "product",
  "domain": "physical",
  "materials": ["Stainless Steel 304"],
  "quantity": "10,000 units",
  "timeline": "2 months",
  "complexity": "low",
  "region": "India",
  "category": "Manufacturing - Industrial Hardware"
}
```

**Scraping Sources:** IndiaMART

**Pricing Result:**
```
Low: ₹8/unit
Average: ₹12/unit
High: ₹18/unit

Reasoning:
- Bulk order (10,000 units) qualifies for wholesale pricing
- SS304 material cost: ₹5/unit
- Manufacturing & overhead: ₹3/unit
- Market rate on IndiaMART: ₹10-15/unit
- 2-month delivery is standard, no rush premium
```

---

## Error Handling

### Document Parsing Failures
- **Invalid file type:** User-friendly error message
- **Text extraction failed:** Fallback to manual questionnaire
- **Ambiguous data:** Request more details or manual input
- **No offering type detected:** Prompt user to clarify

### API Error Responses
```json
{
  "error": "Could not determine offering type and domain from documents. Please provide more detailed documents or use manual questionnaire."
}
```

---

## Performance Considerations

### File Processing
- **Max file size:** 10MB per file
- **Concurrent uploads:** Up to 5 files
- **Text extraction:** ~2-5 seconds per file
- **AI parsing:** ~5-10 seconds per document

### Market Scraping
- **Sources per request:** 1-3 platforms
- **Scraping time:** ~10-30 seconds
- **Data cleaning:** ~2-5 seconds

### Total Processing Time
- **Manual route:** 15-45 seconds
- **Document route:** 30-60 seconds

---

## Security & Privacy

### File Storage
- Files stored in Supabase Storage with RLS
- User-specific folders (`user_id/filename`)
- Automatic cleanup after processing (optional)

### Data Protection
- Parsed data encrypted at rest
- No sharing of business documents
- GDPR-compliant data handling

### Authentication
- JWT-based auth for all API calls
- Credit verification before processing
- Rate limiting on endpoints

---

## Future Enhancements

### Phase 2 (Planned)
1. **Multi-language support** - Parse documents in multiple languages
2. **Batch processing** - Process multiple projects at once
3. **Template library** - Pre-built templates for common document types
4. **API webhooks** - Real-time notifications for processing completion
5. **Advanced analytics** - Pricing trends over time
6. **Collaborative pricing** - Team-based pricing decisions

### Phase 3 (Roadmap)
1. **Machine learning models** - Custom pricing models per industry
2. **Integration marketplace** - Connect with CRM, ERP systems
3. **White-label solution** - Embed pricing engine in other platforms
4. **Mobile app** - iOS/Android native apps

---

## Conclusion

The dual-intake pricing intelligence system provides maximum flexibility for users while maintaining accuracy and speed. Whether users prefer structured questionnaires or want to leverage existing business documents, PriceWise delivers comprehensive, AI-powered pricing recommendations backed by real market data.

**Key Benefits:**
- ⚡ **Fast:** Get pricing in under 60 seconds
- 🎯 **Accurate:** AI + market data = reliable recommendations
- 🔄 **Flexible:** Choose your input method
- 📊 **Comprehensive:** Detailed reasoning and breakdowns
- 🔒 **Secure:** Enterprise-grade data protection

---

**Status:** ✅ Core system implemented and functional
**Next Steps:** User testing, schema enhancements, OCR support

