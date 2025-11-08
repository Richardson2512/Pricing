# 📋 PriceWise Questionnaire Structure

Complete questionnaire system to understand the user and their pricing needs.

## 🎯 Purpose

The questionnaire collects comprehensive information to:
1. **Identify the user** - Experience, location, business type
2. **Understand the offering** - What they're pricing
3. **Analyze costs** - What it costs to deliver
4. **Research competition** - Market positioning
5. **Assess value** - Unique selling points
6. **Parse documents** - Extract structured data from SoW/contracts

## 📝 Multi-Step Questionnaire Flow

### **Step 1: Business Classification** 🏢

**Purpose:** Determine the type of business and offering

**Questions:**

1. **What type of business are you in?**
   - Options:
     - 💻 **Digital** (Software, apps, online services, digital products)
     - 📦 **Physical** (Products, goods, materials, physical services)
   - Database field: `business_type` (digital | physical)
   - Used for: Platform selection for scraping

2. **What are you offering?**
   - Options:
     - 🎁 **Product** (Tangible or digital goods for sale)
     - ⚙️ **Service** (Work, consulting, freelancing, labor)
   - Database field: `offering_type` (product | service)
   - Used for: Scraper platform mapping

**Platform Mapping:**
- `digital + service` → Fiverr, Upwork, Freelancer.com
- `digital + product` → Etsy, AppSumo, ProductHunt, Gumroad
- `physical + product` → IndiaMART, eBay, Amazon
- `physical + service` → Justdial, UrbanClap, Thumbtack

---

### **Step 2: Experience & Market Context** 🌍

**Purpose:** Understand expertise level and target market

**Questions:**

3. **What's your experience level?**
   - Options:
     - 🌱 **Beginner** (0-2 years)
     - 📈 **Intermediate** (2-5 years)
     - 🏆 **Expert** (5+ years)
   - Database field: `experience_level` (beginner | intermediate | expert)
   - Used for: Price multiplier adjustment
   - Impact:
     - Beginner: 0.7-0.9x market rate
     - Intermediate: 1.0-1.2x market rate
     - Expert: 1.3-2.0x market rate

4. **Region / Market**
   - Input: Text field
   - Examples: "India", "USA", "Europe", "Southeast Asia", "Global"
   - Database field: `region` (text)
   - Used for: Regional price adjustments, currency selection
   - Impact: Purchasing power parity adjustments

5. **Niche / Industry** (Optional)
   - Input: Text field
   - Examples: "SaaS", "E-commerce", "Healthcare", "Education", "Fintech"
   - Database field: `niche` (text, nullable)
   - Used for: Refined market data filtering

6. **Pricing Goal**
   - Options:
     - 💰 **Cost Plus** (Cover costs + margin)
     - 📊 **Market Rate** (Match competition)
     - 💎 **Premium** (High-end positioning)
   - Database field: `pricing_goal` (cost_plus | market_rate | premium)
   - Used for: Strategy recommendation
   - Impact:
     - Cost Plus: Focus on cost breakdown + 20-40% margin
     - Market Rate: Focus on median market price
     - Premium: Focus on top 10-25% market price

---

### **Step 3: Product/Service Details** 📝

**Purpose:** Understand what's being priced

**Questions:**

7. **Describe your product/service**
   - Input: Textarea (5 rows)
   - Prompt: "What problem does it solve? What are the key features or deliverables?"
   - Examples:
     - "Custom UI/UX design for mobile apps with 3 screens, interactive prototype, and design system"
     - "Handmade leather wallet with 6 card slots and RFID protection"
     - "SEO optimization service including keyword research, on-page optimization, and monthly reports"
   - Database field: `product_description` (text)
   - Used for: AI context, market comparison
   - Character limit: 500

8. **What does it cost you to deliver?**
   - Input: Textarea (4 rows)
   - Prompt: "Include tools, materials, time, overhead, and any other costs"
   - Examples:
     - "Figma Pro $12/month, 20 hours of work at $25/hr, stock photos $50"
     - "Leather material $15, hardware $8, 3 hours labor at $20/hr, shipping $5"
     - "SEO tools $99/month, 10 hours research at $30/hr, reporting tool $20/month"
   - Database field: `cost_to_deliver` (text)
   - Used for: Cost-plus pricing calculation, margin analysis
   - Character limit: 500

---

### **Step 4: Market & Competition** 📊

**Purpose:** Understand competitive landscape and differentiation

**Questions:**

9. **How do competitors price similar offerings?**
   - Input: Textarea (4 rows)
   - Prompt: "Share what you've seen on Fiverr, Upwork, Etsy, or other platforms"
   - Examples:
     - "I see similar designs ranging from $500-$2000 on Fiverr, with most sellers around $800-$1200"
     - "Leather wallets on Etsy range from $30-$150, average is about $60-$80"
     - "SEO services on Upwork are $50-$200/hour, packages are $500-$3000/month"
   - Database field: `competitor_pricing` (text)
   - Used for: Validation against scraped data, competitive positioning
   - Character limit: 500

10. **What unique value do you provide?**
    - Input: Textarea (4 rows)
    - Prompt: "Why would customers choose you over competitors?"
    - Examples:
      - "10+ years experience, unlimited revisions, 24-hour turnaround, specialized in healthcare apps"
      - "Handcrafted with premium Italian leather, lifetime warranty, custom monogramming included"
      - "White-label reports, dedicated account manager, guaranteed first-page rankings or money back"
    - Database field: `value_proposition` (text)
    - Used for: Premium pricing justification, differentiation analysis
    - Character limit: 500

---

### **Step 5: Document Upload** 📄 (Conditional)

**Shown only if:** `business_type === 'digital' AND offering_type === 'service'`

**Purpose:** Extract structured data from contracts/SoW for freelancers

**Questions:**

11. **Upload Documents** (Optional)
    - Input: File upload (drag-and-drop)
    - Accepted formats: PDF, DOC, DOCX, TXT
    - Max size: 10MB per file
    - Multiple files allowed
    - Storage: Supabase Storage bucket `documents/{user_id}/{filename}`
    - Database table: `uploaded_documents`

**Extracted Data (via DeepSeek):**
- **Deliverables** - List of specific outputs
  - Example: ["5 UI screens", "Interactive prototype", "Design system", "Source files"]
- **Timeline** - Project duration
  - Example: "2 weeks", "14 days", "1 month"
- **Tools** - Required software/resources
  - Example: ["Figma", "Adobe XD", "Notion", "Slack"]
- **Complexity** - Assessed difficulty
  - Options: low | medium | high
- **Dependencies** - Prerequisites or blockers
  - Example: ["Client provides brand guidelines", "Access to staging server", "API documentation"]

---

## 🗃️ Additional Context Questions (Optional - Future Enhancement)

### **Advanced Questions** (Can be added later)

12. **Target Customer**
    - Who is your ideal customer?
    - Examples: "Small businesses", "Enterprise", "Consumers", "Developers"
    - Database field: `target_customer` (text, nullable)

13. **Monthly Volume**
    - How many units/projects per month?
    - Input: Number
    - Database field: `monthly_volume` (integer, nullable)
    - Used for: Volume pricing recommendations

14. **Current Price** (if applicable)
    - What do you currently charge?
    - Input: Number
    - Database field: `current_price` (numeric, nullable)
    - Used for: Comparison and adjustment recommendations

---

## 📊 Data Storage Structure

### **questionnaire_responses table**

```sql
{
  "id": "uuid",
  "user_id": "uuid",
  
  -- Step 1
  "business_type": "digital",
  "offering_type": "service",
  
  -- Step 2
  "experience_level": "intermediate",
  "region": "India",
  "niche": "UI/UX Design",
  "pricing_goal": "market_rate",
  
  -- Step 3
  "product_description": "Custom mobile app UI...",
  "cost_to_deliver": "Figma $12/mo, 20hrs...",
  
  -- Step 4
  "competitor_pricing": "Fiverr: $500-2000...",
  "value_proposition": "10+ years exp...",
  
  -- Optional
  "target_customer": "Startups",
  "monthly_volume": 5,
  "current_price": 1500,
  
  "created_at": "2025-11-08T10:30:00Z"
}
```

### **uploaded_documents table**

```sql
{
  "id": "uuid",
  "user_id": "uuid",
  "questionnaire_id": "uuid",
  
  "file_name": "project_sow.pdf",
  "file_path": "documents/user-id/project_sow.pdf",
  "file_size": 245678,
  "file_type": "application/pdf",
  
  -- Parsed by DeepSeek
  "parsed_deliverables": ["5 screens", "Prototype", "Design system"],
  "parsed_timeline": "2 weeks",
  "parsed_tools": ["Figma", "Notion"],
  "parsed_complexity": "medium",
  "parsed_dependencies": ["Brand guidelines", "API docs"],
  
  "parsing_status": "completed",
  "uploaded_at": "2025-11-08T10:30:00Z",
  "parsed_at": "2025-11-08T10:31:00Z"
}
```

---

## 🔄 Complete Data Flow

```
1. USER FILLS QUESTIONNAIRE
   ↓
2. STORE IN questionnaire_responses
   ↓
3. IF FILES UPLOADED:
   - Store in Supabase Storage (documents bucket)
   - Create record in uploaded_documents
   - Trigger DeepSeek parsing
   - Update parsed_* fields
   ↓
4. TRIGGER MARKET SCRAPING
   - Based on business_type + offering_type
   - Store in market_listings
   ↓
5. FETCH MARKET DATA
   - Query market_listings by category
   - Calculate statistics
   ↓
6. GENERATE AI ANALYSIS (DeepSeek V3)
   - Input: questionnaire + parsed docs + market data
   - Output: Comprehensive pricing recommendation
   ↓
7. STORE IN consultations
   - Link to questionnaire_id
   - Store pricing_recommendation
   - Store price_low, price_average, price_high
   ↓
8. DEDUCT CREDIT
   - Call deduct_credit_and_update_stats()
   - Update profile.credits
   - Update profile.total_analyses_completed
   ↓
9. RETURN TO USER
   - Display pricing analysis
   - Show cost breakdown
   - Enable report download
```

---

## 🎨 UI/UX Guidelines

### **Form Validation**

- All required fields must be filled before proceeding
- Email format validation
- Password minimum 6 characters
- File size limit: 10MB
- File type validation: PDF, DOC, DOCX, TXT only

### **Progress Indication**

- Progress bar: "Step X of Y"
- Percentage complete
- Visual feedback on completion

### **Error Handling**

- Clear error messages
- Field-level validation
- Network error recovery
- File upload errors

### **Conditional Logic**

- Step 5 (file upload) only shown for:
  - `business_type === 'digital'`
  - `offering_type === 'service'`
- All other users skip to submission

---

## 🧪 Testing Checklist

- [ ] User can complete all steps
- [ ] Validation works at each step
- [ ] File upload works (drag-and-drop)
- [ ] Data saves to questionnaire_responses
- [ ] Files save to Storage bucket
- [ ] Documents get parsed by DeepSeek
- [ ] Market data gets fetched
- [ ] AI analysis generates properly
- [ ] Credits deduct correctly
- [ ] Results display properly

---

## 📈 Analytics & Insights

### **User Segmentation**

Query users by business type:
```sql
SELECT 
  business_type,
  offering_type,
  COUNT(*) as users,
  AVG(credits) as avg_credits
FROM questionnaire_responses qr
JOIN profiles p ON p.id = qr.user_id
GROUP BY business_type, offering_type;
```

### **Popular Niches**

```sql
SELECT 
  niche,
  COUNT(*) as analyses,
  AVG(price_average) as avg_recommended_price
FROM questionnaire_responses qr
JOIN consultations c ON c.questionnaire_id = qr.id
WHERE niche IS NOT NULL
GROUP BY niche
ORDER BY analyses DESC
LIMIT 10;
```

### **Experience Distribution**

```sql
SELECT 
  experience_level,
  COUNT(*) as users,
  AVG(price_average) as avg_price
FROM questionnaire_responses qr
JOIN consultations c ON c.questionnaire_id = qr.id
GROUP BY experience_level;
```

---

## 🔐 Security & Privacy

- All questionnaire data is user-specific (RLS enforced)
- Documents stored in private bucket
- Only user can access their own documents
- Service role can parse documents for AI analysis
- No data shared between users
- GDPR compliant (user can delete all data)

---

## 🚀 Future Enhancements

1. **Save & Resume** - Allow users to save progress and return later
2. **Templates** - Pre-fill for common use cases
3. **Bulk Upload** - Upload multiple projects at once
4. **Comparison Mode** - Compare multiple pricing scenarios
5. **Historical Tracking** - Track pricing changes over time
6. **A/B Testing** - Test different price points
7. **Team Collaboration** - Share questionnaires with team
8. **API Access** - Programmatic questionnaire submission

---

## 📚 Example Use Cases

### **Use Case 1: Freelance UI Designer**
```
business_type: digital
offering_type: service
experience_level: intermediate
region: India
niche: Mobile App Design
pricing_goal: market_rate
product_description: "Custom UI/UX design for iOS/Android apps..."
cost_to_deliver: "Figma Pro $12/mo, 25 hours at $20/hr..."
competitor_pricing: "Fiverr: $600-1500, Upwork: $800-2000..."
value_proposition: "7 years experience, unlimited revisions..."
files: [project_sow.pdf]
```

**AI Output:**
- Low: $800 (entry level, competitive)
- Average: $1,200 (market-aligned)
- High: $1,800 (premium, expert positioning)

### **Use Case 2: Etsy Digital Product Seller**
```
business_type: digital
offering_type: product
experience_level: beginner
region: USA
niche: Printable Planners
pricing_goal: cost_plus
product_description: "Digital planner with 50+ pages..."
cost_to_deliver: "Canva Pro $13/mo, 10 hours design..."
competitor_pricing: "Etsy: $5-25, most around $12-15..."
value_proposition: "Unique minimalist design, instant download..."
files: []
```

**AI Output:**
- Low: $8 (competitive entry)
- Average: $12 (market-aligned)
- High: $18 (premium bundle)

### **Use Case 3: Physical Product Manufacturer**
```
business_type: physical
offering_type: product
experience_level: expert
region: India
niche: Leather Goods
pricing_goal: premium
product_description: "Handcrafted leather messenger bag..."
cost_to_deliver: "Leather $25, hardware $10, 5 hours labor..."
competitor_pricing: "IndiaMART: ₹2000-8000, Amazon: ₹3000-12000..."
value_proposition: "Premium Italian leather, lifetime warranty..."
files: []
```

**AI Output:**
- Low: ₹4,500 (competitive)
- Average: ₹6,500 (market-aligned)
- High: ₹9,500 (premium positioning)

---

## 🎯 Key Insights Extracted

From the questionnaire, we derive:

1. **User Profile**
   - Experience multiplier
   - Geographic pricing zone
   - Specialization/niche

2. **Offering Analysis**
   - Complexity assessment
   - Deliverables breakdown
   - Time estimation

3. **Cost Structure**
   - Fixed costs (tools, materials)
   - Variable costs (time, labor)
   - Overhead allocation

4. **Market Position**
   - Competitive landscape
   - Differentiation factors
   - Value drivers

5. **Pricing Strategy**
   - Goal alignment
   - Risk tolerance
   - Growth stage

---

## 💡 Best Practices

### **For Users**
- Be specific in descriptions
- Include all costs (even small ones)
- Research competitors thoroughly
- Upload SoW for accurate analysis
- Be honest about experience level

### **For AI Analysis**
- Use all available data points
- Cross-reference user input with market data
- Validate cost assumptions
- Consider regional differences
- Provide range, not single price
- Explain reasoning clearly

---

## 📊 Success Metrics

Track questionnaire effectiveness:
- Completion rate by step
- Drop-off points
- Average time per step
- File upload rate
- Pricing accuracy (user feedback)
- Repeat usage rate

---

This questionnaire structure ensures we collect all necessary information to provide accurate, AI-powered pricing recommendations! 🎉

