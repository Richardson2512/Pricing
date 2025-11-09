# Complete User Flow & Backend Workflow

**Every single detail from user click to final result**

---

## 👤 **USER FLOW:**

### **1. First Visit (Not Logged In):**
```
User → https://www.howmuchshouldiprice.com
↓
Landing Page loads
- Header shows "Get Started" button
- Hero section, features, pricing info
- Footer with links
↓
User clicks "Get Started"
↓
Redirects to /signup
```

### **2. Sign Up:**
```
User enters:
- First name
- Last name  
- Email
- Password
- Confirm password
↓
Frontend → Supabase Auth (signUp)
↓
Supabase creates user account
↓
Frontend creates profile in profiles table:
- id (user UUID)
- email
- first_name, last_name
- credits: 3 (free credits)
- created_at, updated_at
↓
Session stored in localStorage (key: 'howmuchshouldiprice-auth')
- access_token (expires 1 hour)
- refresh_token (expires 24 hours)
↓
User redirected to /dashboard
```

### **3. Dashboard View:**
```
Dashboard loads
↓
Header shows:
- Logo
- "HowMuchShouldIPrice" title
- "Welcome, [FirstName]!"
- Credits badge (shows current credits)
- "Buy Credits" button
- "Logout" button
↓
Main content:
- Big button: "Check Your Product Pricing"
- Pricing history (if any previous consultations)
- Footer
```

### **4. User Clicks "Check Your Product Pricing":**
```
Dashboard → Intake Selector view
↓
Two options shown:
1. "Fill Out Questionnaire" (manual)
2. "Upload Document" (AI parsing)
↓
User clicks "Fill Out Questionnaire"
↓
Dashboard → Questionnaire view
- Logo button at top left (returns to dashboard)
- "Back to selection" button
- Progress bar (0-100%)
```

### **5. Questionnaire Flow:**

**Stage 1: Business Context (8 questions)**
```
Q1.0: Preferred Currency (USD, EUR, INR, GBP, CAD, etc.)
  - Dropdown selection
  - Used for all price calculations

Q1.1: Product, Service, or Both?
  - Three buttons with icons
  - Determines questionnaire path

Q1.2: Physical, Digital, or Hybrid?
  - Shown based on Q1.1 answer
  - Further refines category
  - Routes to specific Stage 2 questions

Q1.3: Business Entity (Individual, Freelancer, Agency, Company)
  - Four buttons
  - Affects pricing strategy

Q1.4: Location & Target Market
  - Text input for location
  - Dropdown for target market (Local, Regional, National, Global)
  - Used for market analysis and currency

Q1.5: Pricing Goal (Market rate, Cost-based, Premium)
  - Three buttons
  - Determines pricing strategy

Q1.6: Competitors (optional links)
  - Textarea for competitor URLs or names
  - Optional field
  - Used for competitive analysis

Q1.7: Review Summary
  - Shows all Stage 1 answers
  - User can go back to edit
  - Confirms before proceeding

After Q1.7 → System determines category:
- digital_product
- digital_service
- physical_product
- physical_service

BACKGROUND ANALYSIS TRIGGERS HERE:
Frontend → Backend: POST /api/consultations/pre-analyze
{
  businessType, offeringType, region, niche
}
↓
Backend starts scraping in background (non-blocking, 10s timeout)
User continues questionnaire while scraping happens
Visual indicator shows "Background analysis in progress..."
```

**Stage 2: Category-Specific Questions**

**If Digital Product (11 questions):**
```
Q2.1: Product Category (Software, App, Plugin, Template, Course, etc.)
  - Dropdown with 10+ options

Q2.2: What does your product do? (Detailed description)
  - Textarea (6 rows)
  - Captures features and functionality
  - Used for market comparison

Q2.3: Sales Platforms (AppSumo, Gumroad, Shopify, ProductHunt, etc.)
  - Text input
  - Multiple platforms allowed

Q2.4: Development Time
  - Number input + unit selector (weeks/months)
  - Used for cost calculation

Q2.5: Sales Model (One-time, Subscription, License)
  - Three buttons
  - Determines pricing structure

Q2.6: Updates & Support
  - Yes/No buttons
  - Affects ongoing costs

Q2.7: Recurring Costs
  - Textarea
  - AWS, APIs, tools, etc.
  - Used for minimum pricing

Q2.8: Positioning (Budget, Mid-tier, Premium)
  - Three buttons
  - Affects price range

Q2.9: Niche Audience
  - Text input
  - Target customer segment
  - Used for market filtering

Q2.10: Comparable Products
  - Textarea
  - URLs or product names
  - Used for competitive analysis

Q2.11: Main Features (for tiered pricing)
  - Textarea (8 rows)
  - List all features
  - AI organizes into pricing tiers
  - Tip box explains usage
```

**If Digital Service (12 questions):**
```
Q2.1: Service Category
  - 8 buttons: Design, Development, Writing, Marketing, 
    Consulting, Video/Audio, Data/Analytics, Other
  - Determines scraping sources

Q2.2: What does your service do?
  - Textarea (6 rows)
  - Detailed service description
  - Example provided

Q2.3: Charge Model (Project ⭐, Hourly, Retainer 💰)
  - Three buttons with badges
  - "Most Popular" badge on Per Project (70% of freelancers)
  - "Best Income" badge on Retainer
  - Details under each option
  - Blue recommendation box below
  - Explains when to use each model

Q2.4: Project Complexity (Basic, Medium, Advanced)
  - Three buttons
  - Affects pricing multiplier

Q2.5: Tools/Software Used
  - Textarea
  - Figma, Adobe, VS Code, AWS, etc.
  - Used for cost calculation

Q2.6: Revisions Allowed
  - Text input
  - "2 rounds", "3 revisions", "Unlimited", etc.

Q2.7: Project Timeline
  - Text input
  - "2 weeks", "1-2 months", etc.

Q2.8: Client Management (Self or Agency)
  - Two buttons
  - Affects overhead calculation

Q2.9: Subcontractors/Collaboration
  - Two buttons: Yes/No
  - Affects cost structure

Q2.10: Client Region/Target
  - Text input
  - "US startups", "European SMBs", etc.
  - Used for market filtering

Q2.11: Niche Specialization
  - Text input
  - "SaaS UI design", "Fintech apps", etc.
  - Premium pricing indicator

Q2.12: SoW/Contracts Experience
  - Two buttons: Yes/No
  - Indicates professionalism level
```

**If Physical Product (12 questions):**
```
Q2.1: Product Type
  - 12 buttons: Apparel, Food & Beverage, Electronics, 
    Home Decor, Auto Parts, Handmade Craft, Jewelry, 
    Beauty Products, Furniture, Sports Equipment, Toys, Other

Q2.2: Production Type (Mass-produced, Custom-made, Limited Edition)
  - Three buttons
  - Affects pricing strategy

Q2.3: Production Volume per Month
  - Text input
  - "10 units", "100-200 units", "1000+", etc.

Q2.4: Raw Materials/Components
  - Textarea
  - List all materials used

Q2.5: Material Sourcing
  - Text input
  - "Local suppliers", "China", "Alibaba", etc.

Q2.6: Production Time per Unit
  - Text input
  - "2 hours", "1 day", "1 week", etc.

Q2.7: Packaging/Shipping
  - Two buttons: I handle it / Through partners
  - Affects logistics costs

Q2.8: Target Demographic
  - Text input
  - Age, gender, profession, location

Q2.9: Brand Presence
  - Two buttons: Yes/No
  - Affects pricing power

Q2.10: Sales Channels
  - Multi-select buttons (11 options)
  - IndiaMART, Etsy, Amazon, Shopify, eBay,
    Own Website, Offline Retail, B2B Supply,
    Social Media, Wholesale, Other
  - Can select multiple

Q2.11: Certifications/Compliance
  - Textarea
  - ISO, BIS, Organic, Food Safety, etc.

Q2.12: After-Sales Service
  - Two buttons: Yes/No
  - Warranty, installation, support
```

**If Physical Service (10 questions):**
```
Q2.1: Service Type
  - Text input
  - Construction, Photography, Repair, etc.

Q2.2: Operating Region/Coverage Radius
  - Text input
  - "Within 50km", "City-wide", etc.

Q2.3: Pricing Model (Hourly, Project ⭐, Outcome 💎)
  - Three buttons with badges
  - "Most Popular" on Per Project (65% of providers)
  - "Premium" on Per Outcome
  - Details under each option
  - Blue recommendation box below
  - Explains when to use each model

Q2.4: Staff Count
  - Text input
  - "Just me", "2-3 people", etc.

Q2.5: Materials/Tools
  - Two buttons: I bring everything / Client provides
  - Affects cost structure

Q2.6: Turnaround Time per Job
  - Text input
  - "Same day", "2-3 days", "1 week", etc.

Q2.7: Travel/Logistics Costs
  - Two buttons: Yes/No
  - Triggers travel cost calculation

Q2.8: Equipment/Depreciation
  - Textarea
  - Camera equipment, vehicle, tools, consumables

Q2.9: Certification/License
  - Two buttons: Yes/No
  - Professional credentials

Q2.10: Local Competitor Pricing
  - Textarea
  - "$80-120/hour", "$2000-5000 per event", etc.
```

**Stage 3: Experience & Positioning (6 questions - Universal)**
```
Q3.1: Years in Field
  - 5 buttons: Just Starting (<1), 1-3, 3-5, 5-10, 10+
  - Affects pricing confidence

Q3.2: Skill Level
  - 3 buttons: Beginner, Intermediate, Expert
  - Affects recommended rates

Q3.3: Business Stage
  - 4 buttons: Idea, Launch, Growth, Mature
  - Affects pricing strategy

Q3.4: Current Pricing Method (Optional)
  - Textarea
  - "(Optional)" label shown
  - Can skip this question
  - "Cost + 30%", "Match competitors", etc.

Q3.5: Portfolio/Testimonials
  - Two buttons: Yes/No
  - If Yes → Optional URL input
  - Affects credibility

Q3.6: Biggest Challenge
  - Textarea
  - Competition, cost, perception, etc.
  - Used for tailored advice
```

**Stage 4: Output Preferences (3 questions)**
```
Q4.1: Pricing Priority
  - 3 buttons: Affordable, Profit-optimized, Competitive
  - Determines recommendation focus

Q4.2: Output Detail Level
  - 2 buttons: Detailed, Summarized
  - Affects response length

Q4.3: Comparison Preference
  - 2 buttons: Yes/No
  - Include benchmark comparisons
```

**Progress Bar:** Shows 0-100% throughout (capped at 100%)

### **6. User Clicks "Get Pricing Recommendation":**

**Frontend shows loading state:**
- Spinner animation
- "Analyzing your business..."
- "Gathering market data..."
- "Generating recommendation..."

---

## ⚙️ **BACKEND WORKFLOW (The Magic):**

### **Step 1: Request Received**
```
Frontend → Backend: POST /api/consultations
URL: https://pricewise-backend-production.up.railway.app/api/consultations
Headers: {
  Content-Type: application/json,
  Authorization: Bearer <access_token>
}
Body: {
  businessType: "digital",
  offeringType: "service",
  experienceLevel: "intermediate",
  region: "Global",
  niche: "ui design",
  pricingGoal: "market_rate",
  productDescription: "I design custom WordPress websites...",
  costToDeliver: "Cursor $20, Netlify $9, Railway $5",
  competitorPricing: "Hootsuite",
  valueProposition: "Content research under 60 seconds",
  preferredCurrency: "USD",
  businessEntity: "freelancer",
  targetMarket: "global",
  yearsInField: "1-3",
  businessStage: "launch",
  pricingPriority: "profit",
  outputDetail: "detailed",
  wantsComparison: true,
  usePreAnalyzedData: false,
  preAnalyzedMarketData: null
}
```

### **Step 2: Authentication**
```
Backend middleware (auth.ts):
↓
Extract Bearer token from Authorization header
↓
Call Supabase: supabase.auth.getUser(token)
↓
If token invalid or expired:
  → Return 401 Unauthorized
  → Frontend redirects to /signin
  
If token valid:
  → Attach user object to request
  → Continue to next middleware
```

### **Step 3: Validation**
```
Zod schema validates request body:
↓
consultationSchema.parse(req.body)
↓
Checks:
- businessType: must be 'digital' or 'physical'
- offeringType: must be 'product' or 'service'
- experienceLevel: must be 'beginner', 'intermediate', or 'expert'
- region: must be non-empty string
- pricingGoal: must be 'cost_plus', 'market_rate', or 'premium'
- All other fields validated for type and format

If validation fails:
  → Return 400 Bad Request
  → Body: { error: "Validation failed: [details]" }
  → Frontend shows error message
  
If validation passes:
  → Continue to processing
```

### **Step 4: Check Credits**
```
Backend queries Supabase:
↓
SELECT credits FROM profiles WHERE id = user_id
↓
If credits < 1:
  → Return 403 Forbidden
  → Body: { error: "Insufficient credits" }
  → Frontend shows "Please buy more credits"
  
If credits >= 1:
  → Continue to market data scraping
```

### **Step 5: Market Data Scraping**

**Option A: Use Pre-Analyzed Data (if available)**
```
If usePreAnalyzedData = true AND preAnalyzedMarketData exists:
  → Use cached data from background analysis
  → Skip scraping
  → Faster response (data already scraped during questionnaire)
  → Continue to Step 6
```

**Option B: Real-Time Scraping**
```
Backend calls marketScraper.scrapeMarketData({
  businessType: "digital",
  offeringType: "service",
  region: "Global",
  query: "ui design",
  niche: "ui design"
})

SCRAPER WORKFLOW - 3 TIER FALLBACK:

┌─────────────────────────────────────────────────┐
│ TIER 1: Try Render Scraper Service              │
├─────────────────────────────────────────────────┤
│ If SCRAPER_SERVICE_URL is set:                  │
│                                                  │
│ POST https://pricing-s1on.onrender.com/scrape   │
│ Headers: { Content-Type: application/json }     │
│ Body: {                                          │
│   business_type: "digital",                      │
│   offering_type: "service",                      │
│   query: "ui design",                            │
│   region: "global",                              │
│   use_cache: true,                               │
│   max_age_hours: 24                              │
│ }                                                │
│ Timeout: 30 seconds (AbortController)           │
│                                                  │
│ If success (200 OK):                             │
│   → Parse response.data                          │
│   → Return 25-50 real listings                   │
│   → From Fiverr, Upwork, Freelancer.com          │
│                                                  │
│ If timeout or error:                             │
│   → Log warning                                  │
│   → Continue to Tier 2                           │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ TIER 2: Check Supabase Cache                    │
├─────────────────────────────────────────────────┤
│ Query Supabase market_listings table:           │
│                                                  │
│ SELECT * FROM market_listings                   │
│ WHERE category ILIKE '%ui design%'              │
│   AND scraped_at > (NOW() - INTERVAL '7 days')  │
│ ORDER BY scraped_at DESC                         │
│ LIMIT 50                                         │
│                                                  │
│ If found (data.length > 0):                      │
│   → Map to MarketListing format                  │
│   → Return cached data                           │
│   → Log: "Found X cached listings"              │
│                                                  │
│ If not found:                                    │
│   → Continue to Tier 3                           │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ TIER 3: Generate Mock Data                      │
├─────────────────────────────────────────────────┤
│ generateMockData(config)                         │
│                                                  │
│ Creates 20 realistic fake listings:              │
│ - Prices: $500-$5000 range                       │
│ - Ratings: 4.0-5.0                               │
│ - Reviews: 10-500                                │
│ - Delivery: 3-14 days                            │
│ - Sources: Fiverr, Upwork, etc.                  │
│                                                  │
│ Log: "No market data available, using mock"     │
│ Return mock data                                 │
└─────────────────────────────────────────────────┘

Result: marketData array (25-50 listings)
```

### **Step 6: Data Cleaning**
```
Backend calls cleanMarketData(rawData):
↓
Operations:
1. Filter: Remove listings with price <= 0
2. Normalize: Round prices to integers
3. Normalize: Round ratings to 1 decimal place
4. Sort: Order by price (low to high)
↓
Return cleaned data
```

### **Step 7: Data Enrichment**
```
Backend calls enrichMarketData(cleanedData):
↓
For each listing:
  Calculate quality score:
  - Formula: (rating/5) * min(reviews/100, 1)
  - Range: 0.0 to 1.0
  - Higher = better quality
  
  Add qualityScore to listing
↓
Return enriched data
```

### **Step 8: Calculate Market Statistics**
```
Backend calculates stats from market data:
↓
- Minimum price: $500
- Maximum price: $5000
- Average price: $2250
- Median price: $2000
- Top 10% price: $4500
↓
These stats are passed to DeepSeek for context
```

### **Step 9: DeepSeek AI Analysis**
```
Backend calls generatePricingRecommendation({
  businessType: "digital",
  offeringType: "service",
  experienceLevel: "intermediate",
  region: "Global",
  niche: "ui design",
  pricingGoal: "market_rate",
  productDescription: "...",
  costToDeliver: "...",
  competitorPricing: "Hootsuite",
  valueProposition: "...",
  targetMarket: "global",
  marketData: [25 enriched listings]
})

DEEPSEEK PROCESS:

1. Validate API Key:
   If !DEEPSEEK_API_KEY:
     → Throw error: "DeepSeek API key not configured"
     → Frontend shows error message
   
2. Build Comprehensive Prompt (300+ lines):
   
   BUSINESS CONTEXT:
   - Type: digital service
   - Experience: intermediate (1-3 years)
   - Region: Global
   - Niche: ui design
   - Goal: market_rate
   
   PRODUCT/SERVICE DETAILS:
   - Description: [full description]
   - Cost structure: Cursor $20, Netlify $9, Railway $5
   - Value proposition: Content research under 60 seconds
   
   MARKET DATA ANALYSIS:
   - 25 listings analyzed
   - Price range: $500 - $5000
   - Average: $2250
   - Median: $2000
   - Top 10%: $4500
   - Sources: Fiverr (40%), Upwork (35%), Freelancer (25%)
   
   COMPETITOR ANALYSIS:
   - Hootsuite pricing model
   - Feature comparison
   - Market positioning
   
   SPECIFIC INSTRUCTIONS:
   - MUST provide specific dollar amounts
   - For SaaS: Tiered pricing (Free, Starter $X, Pro $Y, Business $Z)
   - For Services: Hourly ($X/hr), Project ($Y), Retainer ($Z/mo)
   - For Products: Unit price, Wholesale, Bulk pricing
   - MUST explain WHY each price point
   - MUST include cost breakdown
   - MUST provide competitive analysis
   - MUST give implementation steps
   - NO generic advice - SPECIFIC NUMBERS ONLY

3. Call DeepSeek API:
   
   Create AbortController (2-minute timeout)
   ↓
   POST https://api.deepseek.com/v1/chat/completions
   Headers: {
     Content-Type: application/json,
     Authorization: Bearer <DEEPSEEK_API_KEY>
   }
   Body: {
     model: "deepseek-chat",
     messages: [
       {
         role: "system",
         content: "You are an expert pricing consultant..."
       },
       {
         role: "user",
         content: [comprehensive prompt]
       }
     ],
     temperature: 0.7,
     max_tokens: 2000
   }
   Signal: controller.signal (for timeout)
   ↓
   Wait for response (up to 2 minutes)
   ↓
   Clear timeout
   
4. Handle Response:
   
   If response.ok (200):
     → Parse JSON
     → Extract data.choices[0].message.content
     → Return recommendation text
   
   If response.status 4xx/5xx:
     → Log error
     → Throw error with status
   
   If timeout (AbortError):
     → Log: "DeepSeek API timeout after 2 minutes"
     → Throw: "AI pricing analysis timeout. Please try again."
   
   If other error:
     → Log error
     → Use fallback recommendation (generic template)

5. Return Recommendation:
   
   Returns detailed text with:
   - Pricing strategy explanation
   - Specific price points with reasoning
   - Tiered pricing (if SaaS)
   - Cost breakdown
   - Competitive analysis
   - Market positioning advice
   - Implementation steps
   - Next steps
```

### **Step 10: Deduct Credit**
```
Backend updates Supabase:
↓
UPDATE profiles 
SET credits = credits - 1,
    updated_at = NOW()
WHERE id = user_id
↓
New balance: 3 → 2 credits
↓
Log: "Credit deducted for user [id]"
```

### **Step 11: Store Consultation**
```
Backend inserts into consultations table:
↓
INSERT INTO consultations (
  id,                    -- UUID (auto-generated)
  user_id,               -- User UUID
  business_type,         -- "digital"
  target_market,         -- "Global"
  product_description,   -- Full description
  cost_to_deliver,       -- Cost structure
  competitor_pricing,    -- "Hootsuite"
  value_proposition,     -- Unique value
  pricing_recommendation,-- DeepSeek response (full text)
  created_at             -- NOW()
) VALUES (...)
RETURNING *
↓
Returns consultation object with:
- id: "consultation-uuid-123"
- All input data
- pricing_recommendation: [full DeepSeek response]
- created_at: "2025-11-09T..."
```

### **Step 12: Response to Frontend**
```
Backend → Frontend: 200 OK
Body: {
  consultation: {
    id: "consultation-uuid-123",
    user_id: "user-uuid-456",
    business_type: "digital",
    target_market: "Global",
    product_description: "...",
    cost_to_deliver: "...",
    competitor_pricing: "Hootsuite",
    value_proposition: "...",
    pricing_recommendation: "[Full DeepSeek response with specific prices]",
    created_at: "2025-11-09T04:30:00Z"
  }
}

Response time: 5-30 seconds (depending on scraping + AI)
```

### **Step 13: Display Results**
```
Frontend receives response
↓
Dashboard view changes to "result"
↓
PricingAnalysisResult component renders:
- White card with shadow
- Markdown-formatted recommendation
- Sections:
  * Pricing Strategy
  * Recommended Price Range (specific numbers)
  * Tiered Pricing (if SaaS)
  * Cost Breakdown
  * Market Analysis
  * Competitive Positioning
  * Implementation Steps
  * Next Steps
- "Back to Dashboard" button
- Footer
↓
User reads recommendation
↓
User clicks "Back to Dashboard"
↓
Consultation saved in history
```

---

## 💳 **PAYMENT FLOW (Buy Credits):**

### **User Clicks "Buy Credits":**
```
1. Modal opens (CreditPurchase component)
   ↓
   Shows:
   - Current balance: X credits
   - 3 packages:
     * 5 credits - $10
     * 10 credits - $15 (⭐ POPULAR)
     * 20 credits - $25
   - Each shows: Credits, Price, Price per credit
   - "Secure Payment • Instant Delivery • Credits Never Expire"

2. User clicks "Purchase" on 10 credits package
   ↓
   Frontend shows loading spinner
   ↓
   Frontend → Backend: POST /api/payments/create-checkout
   URL: https://pricewise-backend-production.up.railway.app/api/payments/create-checkout
   Body: {
     credits: 10,
     userId: "user-uuid-456"
   }

3. Backend validates package:
   ↓
   Check if credits is 5, 10, or 20
   If invalid → 400 Bad Request
   ↓
   Get Dodo product ID:
   - 5 credits → pdt_jAHaYI6bUNkXVdTd4tqJ6
   - 10 credits → pdt_c4yyDCsXQsI6GXhJwtfW6
   - 20 credits → pdt_ViYh83fJgoA70GKJ76JXe

4. Backend fetches user profile:
   ↓
   SELECT email, first_name FROM profiles WHERE id = userId
   ↓
   If not found → 404 Not Found
   ↓
   Extract: email = "user@example.com"

5. Backend → Dodo Payments SDK:
   ↓
   dodoClient.checkoutSessions.create({
     product_cart: [
       {
         product_id: "pdt_c4yyDCsXQsI6GXhJwtfW6",
         quantity: 1
       }
     ],
     feature_flags: {
       allow_discount_code: true  // Users can enter promo codes
     },
     return_url: "https://howmuchshouldiprice.com/dashboard?payment=success&credits=10",
     customer: {
       email: "user@example.com",
       name: "User"
     },
     metadata: {
       userId: "user-uuid-456",
       credits: "10",
       packageType: "professional"
     }
   })
   ↓
   Retry logic (3 attempts with exponential backoff):
   - Attempt 1: Immediate
   - Attempt 2: Wait 2 seconds
   - Attempt 3: Wait 4 seconds
   - Skip retry on 4xx errors
   ↓
   Dodo returns:
   {
     session_id: "cks_Gi6KGJ2zFJo9rq9Ukifwa",
     checkout_url: "https://checkout.dodopayments.com/session/cks_..."
   }

6. Backend → Frontend: 200 OK
   Body: {
     checkoutUrl: "https://checkout.dodopayments.com/session/cks_...",
     sessionId: "cks_Gi6KGJ2zFJo9rq9Ukifwa"
   }

7. Frontend receives checkoutUrl:
   ↓
   window.location.href = checkoutUrl
   ↓
   User redirected to Dodo Payments hosted checkout page
   ↓
   URL changes to: https://checkout.dodopayments.com/...

8. User on Dodo Payments page:
   ↓
   Sees:
   - Product: 10 Credits - $15.00
   - Discount code input (if enabled)
   - Card details form:
     * Card number
     * Expiry date
     * CVC
     * Cardholder name
   - Billing address:
     * Street
     * City
     * State
     * Country
     * ZIP code
   - "Pay $15.00" button
   ↓
   User enters card: 4242 4242 4242 4242 (test card)
   User enters expiry: 12/25
   User enters CVC: 123
   User fills billing address
   ↓
   User clicks "Pay $15.00"

9. Dodo Payments processes payment:
   ↓
   Validates card with payment processor
   ↓
   Charges $15.00
   ↓
   Payment succeeds

10. Dodo → Backend: Webhook POST /api/payments/webhook
    ↓
    URL: https://pricewise-backend-production.up.railway.app/api/payments/webhook
    Headers: {
      webhook-id: "evt_abc123",
      webhook-signature: "v1,signature_here",
      webhook-timestamp: "1699564800"
    }
    Body: {
      type: "payment.succeeded",
      data: {
        payload_type: "Payment",
        payment_id: "pay_2IjeQm4hqU6RA4Z4kwDee",
        status: "succeeded",
        total_amount: 1500,  // cents
        currency: "USD",
        customer: {
          email: "user@example.com"
        },
        metadata: {
          userId: "user-uuid-456",
          credits: "10",
          packageType: "professional"
        },
        checkout_session_id: "cks_...",
        product_cart: [...]
      },
      timestamp: "2025-11-09T..."
    }

11. Backend webhook handler:
    ↓
    Get raw body as string (for signature verification)
    ↓
    Verify webhook signature:
    - Use Standard Webhooks library
    - webhookVerifier.verify(rawBody, headers)
    - If invalid → 401 Unauthorized (reject webhook)
    - If valid → Continue
    ↓
    Check for duplicate webhook (idempotency):
    - Query webhook_events table
    - WHERE webhook_id = "evt_abc123"
    - If found → Return 200 (already processed)
    - If not found → Continue
    ↓
    Store webhook event:
    - INSERT INTO webhook_events (
        webhook_id, event_type, payload, processed_at
      )
    ↓
    Process payment:
    - Extract userId from metadata: "user-uuid-456"
    - Extract credits from metadata: "10"
    - Parse as integer: 10
    ↓
    Fetch user profile:
    - SELECT credits, email FROM profiles WHERE id = userId
    - Current credits: 2
    ↓
    Calculate new balance:
    - newCredits = 2 + 10 = 12
    ↓
    Update profile:
    - UPDATE profiles 
      SET credits = 12, updated_at = NOW()
      WHERE id = userId
    ↓
    Record purchase:
    - INSERT INTO credit_purchases (
        user_id, credits_purchased, amount_paid,
        payment_id, purchase_date
      ) VALUES (
        "user-uuid-456", 10, 15.00,
        "pay_2IjeQm4hqU6RA4Z4kwDee", NOW()
      )
    ↓
    Log success:
    - "✅ SUCCESS: Added 10 credits to user user-uuid-456"
    - "   Email: user@example.com"
    - "   Old balance: 2 credits"
    - "   New balance: 12 credits"
    - "   Payment ID: pay_2IjeQm4hqU6RA4Z4kwDee"
    - "   Amount paid: $15 USD"
    ↓
    Return 200 OK to Dodo (acknowledge webhook)

12. Dodo → Frontend: Redirect to return_url
    ↓
    URL: https://howmuchshouldiprice.com/dashboard?payment=success&credits=10
    ↓
    Frontend detects ?payment=success in URL

13. Frontend Payment Status Polling:
    ↓
    useEffect detects payment=success
    ↓
    Set paymentStatus to "checking"
    ↓
    Show blue banner: "Processing Payment..."
    ↓
    Start polling interval (every 2 seconds):
      - Call refreshProfile()
      - Fetch updated profile from Supabase
      - Check if credits increased
      - If increased:
        * Clear interval
        * Set paymentStatus to "success"
        * Show green banner: "Payment Successful!"
        * Clean URL params
      - If not increased yet:
        * Continue polling
    ↓
    Timeout after 30 seconds:
      - Stop polling
      - If still not updated, show warning
    ↓
    Credits appear in header: 2 → 12 ✅

14. User sees:
    - Green success banner
    - Updated credit balance
    - Can continue using app
```

---

## 🔄 **SESSION MANAGEMENT:**

### **Login Session:**
```
User logs in
↓
Supabase Auth creates session:
- access_token (JWT, expires 1 hour)
- refresh_token (expires 24 hours)
- expires_at (timestamp)
- user object
↓
Stored in localStorage:
Key: 'howmuchshouldiprice-auth'
Value: { access_token, refresh_token, expires_at, user }
↓
AuthContext sets:
- user state
- profile state (from profiles table)
↓
Header button changes: "Get Started" → "Dashboard"
```

### **Page Refresh:**
```
User refreshes page
↓
App loads
↓
AuthContext useEffect runs:
- Check localStorage for 'howmuchshouldiprice-auth'
- If found:
  * Parse session data
  * Call supabase.auth.getSession()
  * Validate token with Supabase
  * If valid → Set user and profile
  * If invalid → Clear session, log out
- If not found:
  * User not logged in
  * Show "Get Started" button
```

### **Token Refresh (Automatic):**
```
After 1 hour (access token expires):
↓
Supabase SDK detects expired token
↓
Automatically uses refresh_token
↓
POST to Supabase Auth API
↓
Gets new access_token
↓
Updates localStorage
↓
User stays logged in (seamless)
↓
Continues until refresh_token expires (24 hours)
```

### **After 24 Hours:**
```
Refresh token expires
↓
Supabase can't refresh session
↓
User automatically logged out
↓
localStorage cleared
↓
Header shows "Get Started" again
↓
User must log in again
```

---

## 🔐 **SECURITY FLOW:**

### **Every API Request:**
```
1. CORS Preflight (OPTIONS request):
   - Browser sends OPTIONS request
   - Backend checks origin
   - Returns CORS headers
   - Browser allows actual request

2. Rate Limiting:
   - Check IP address
   - Count requests in 15-min window
   - If > 100 → 429 Too Many Requests

3. Authentication (protected routes):
   - Extract Bearer token from Authorization header
   - Validate with Supabase: getUser(token)
   - If invalid → 401 Unauthorized
   - If valid → Attach user to request

4. Input Validation:
   - Zod schema validation
   - Type checking
   - Required field checking
   - Enum validation
   - If invalid → 400 Bad Request with details

5. Business Logic Validation:
   - Check credits >= 1
   - Check user exists
   - Check data consistency
   - If invalid → 403 Forbidden or 404 Not Found

6. Process Request:
   - Execute business logic
   - Call external APIs (with timeouts)
   - Update database
   - Return response

7. Error Handling:
   - Try-catch blocks
   - Timeout detection (AbortError)
   - API key validation
   - User-friendly error messages
   - Detailed logging (server-side only)
   - Development mode: Show stack traces
   - Production mode: Hide sensitive details
```

---

## 🕷️ **SCRAPER SERVICE WORKFLOW (When Called):**

### **Backend Calls Scraper:**
```
POST https://pricing-s1on.onrender.com/scrape
Body: {
  business_type: "digital",
  offering_type: "service",
  query: "ui design",
  region: "global",
  use_cache: true,
  max_age_hours: 24
}

PYTHON FASTAPI SERVER:

1. Request received by FastAPI

2. Validate inputs:
   - business_type in ['digital', 'physical']
   - offering_type in ['product', 'service']
   - If invalid → 400 Bad Request

3. Check cache first (if use_cache=true):
   ↓
   Query Supabase:
   SELECT * FROM market_listings
   WHERE category ILIKE '%ui design%'
     AND scraped_at > (NOW() - INTERVAL '24 hours')
   ORDER BY scraped_at DESC
   LIMIT 50
   ↓
   If found >= 10 listings:
     → Return cached data (fast response)
     → Skip scraping
   ↓
   If not enough cached data:
     → Continue to scraping

4. Trigger Scrapy Spiders:
   ↓
   For digital service + "ui design":
   - Run fiverr_spider.py
   - Run upwork_spider.py
   - Run freelancer_spider.py
   ↓
   Each spider (parallel execution):
   
   FIVERR SPIDER:
   ├─ Initialize Playwright browser (headless Chrome)
   ├─ Navigate to: https://www.fiverr.com/search/gigs?query=ui+design
   ├─ Wait for page load (JavaScript rendering)
   ├─ Extract listings (CSS selectors):
   │  - Title: .gig-card-layout__title
   │  - Price: .price-wrapper
   │  - Rating: .rating-score
   │  - Reviews: .rating-count
   │  - Seller: .seller-name
   │  - Delivery: .delivery-time
   ├─ Parse each listing:
   │  {
   │    source: "Fiverr",
   │    title: "Professional UI/UX Design",
   │    price: 1200.0,
   │    currency: "USD",
   │    rating: 4.9,
   │    reviews: 234,
   │    delivery_time: 7,
   │    seller_name: "design_pro",
   │    seller_level: "Level 2",
   │    category: "ui design",
   │    url: "https://fiverr.com/...",
   │    scraped_at: NOW()
   │  }
   ├─ Collect 20-30 listings
   └─ Return to pipeline
   
   UPWORK SPIDER: (similar process)
   FREELANCER SPIDER: (similar process)

5. Data Cleaning Pipeline:
   ↓
   For each listing:
   - Normalize price to USD (if different currency)
   - Remove HTML tags from title
   - Validate data structure
   - Remove duplicates
   - Filter out invalid entries (price <= 0)
   ↓
   Clean data ready for storage

6. Store in Supabase:
   ↓
   Bulk INSERT INTO market_listings:
   - 25-50 listings total
   - From Fiverr, Upwork, Freelancer
   - All normalized and cleaned
   ↓
   Log: "Stored 47 listings in Supabase"

7. Return to Backend:
   ↓
   Response: 200 OK
   Body: {
     status: "success",
     message: "Found 47 market listings",
     count: 47,
     data: [array of 47 listings]
   }
   ↓
   Backend receives real market data
   ↓
   Continues to DeepSeek analysis with real data
```

---

## 🔄 **KEEP-ALIVE WORKFLOW:**

### **GitHub Actions (Every 10 Minutes):**
```
Cron trigger: */10 * * * *
↓
GitHub Actions runner starts
↓
Execute workflow:
  1. Get RENDER_SCRAPER_URL from secrets
     → "https://pricing-s1on.onrender.com"
  
  2. Ping health endpoint:
     curl https://pricing-s1on.onrender.com/health
     Timeout: 30 seconds
  
  3. Check response:
     If HTTP 200:
       → Log: "✅ Ping successful"
       → Exit 0 (success)
     
     If timeout or error:
       → Log: "❌ Ping failed"
       → Exit 1 (failure)
       → GitHub sends notification
  
  4. Wait 10 minutes
  
  5. Repeat
↓
Result: Render service never sleeps
```

---

## 🏥 **HEALTH CHECK WORKFLOW:**

### **Railway Health Checks:**
```
Every 30 seconds:
↓
Railway → GET https://pricewise-backend.../health
Timeout: 300 seconds (5 minutes)
↓
If response 200 OK:
  → Container marked healthy
  → Continue running
  
If timeout or error:
  → Container marked unhealthy
  → Railway sends SIGTERM
  → Container restarts
```

### **Backend Health Endpoint:**
```
GET /health
↓
Return immediately (no database calls):
{
  status: "ok",
  timestamp: "2025-11-09T...",
  cors: [array of allowed origins],
  environment: "production",
  version: "1.0.0",
  uptime: 12345  // seconds since start
}
↓
Response time: < 10ms
```

---

## 💓 **HEARTBEAT WORKFLOW:**

### **Backend Heartbeat (Every 30 Seconds):**
```
Server starts
↓
setInterval(() => {
  console.log(`💓 Server heartbeat - ${new Date().toISOString()}`);
}, 30000);
↓
Logs to Railway:
💓 Server heartbeat - 2025-11-09T04:30:00Z
💓 Server heartbeat - 2025-11-09T04:30:30Z
💓 Server heartbeat - 2025-11-09T04:31:00Z
...
↓
Proves container is alive and not idle
```

---

## 🛑 **ERROR HANDLING WORKFLOW:**

### **Frontend Error Boundary:**
```
React component throws error
↓
ErrorBoundary catches it
↓
componentDidCatch(error, errorInfo)
↓
Log to console: error + stack trace
↓
Show error UI:
- Red alert icon
- "Oops! Something went wrong"
- Error message
- Technical details (dev mode only)
- "Reload Page" button
- "Go Home" button
- Support email link
↓
User clicks "Reload Page"
↓
window.location.reload()
↓
App reloads, error cleared
```

### **Backend Error Handling:**
```
Error occurs in route handler
↓
Catch block executes
↓
Determine error type:
- AbortError → "Request timeout"
- API key error → "Service configuration error"
- Validation error → "Invalid request data"
- Other → "Failed to process request"
↓
Log error:
- Error message
- Stack trace
- User ID
- Request data
↓
Return to frontend:
- Status: 500 (or appropriate code)
- Body: {
    error: "User-friendly message",
    details: "Technical details (dev mode only)"
  }
↓
Frontend shows error message to user
```

---

## 📊 **COMPLETE END-TO-END TIMING:**

```
User Action → Result

Sign Up:
- Frontend validation: < 100ms
- Supabase Auth: 200-500ms
- Profile creation: 100-200ms
- Total: ~1 second

Dashboard Load:
- Auth check: 50-100ms
- Profile fetch: 100-200ms
- Consultations fetch: 100-300ms
- Total: ~500ms

Questionnaire:
- Each question: Instant (client-side)
- Background analysis: 10-30s (non-blocking)
- Total: User's pace

Pricing Recommendation:
- Market scraping: 5-30s (or instant if cached)
- Data cleaning: < 1s
- DeepSeek AI: 10-60s
- Database operations: < 1s
- Total: 15-90 seconds

Buy Credits:
- Checkout creation: 1-3s
- Redirect: Instant
- Payment on Dodo: User's pace
- Webhook processing: < 1s
- Credit update: < 500ms
- Frontend polling: 2-10s
- Total: ~30s after payment
```

---

## ✅ **THAT'S EVERYTHING!**

**Complete user flow, backend workflow, scraper integration, payment processing, session management, security, error handling, and timing - every single detail!** 🎯

---

**Last Updated:** November 9, 2025

