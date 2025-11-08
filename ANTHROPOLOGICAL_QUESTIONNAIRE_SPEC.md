# Anthropological Questionnaire Specification

## Overview
This document outlines the complete question tree for the anthropological pricing questionnaire system. The system uses a 4-stage approach with intelligent routing based on user responses.

## System Architecture

```
Stage 1: Business Context (7 questions)
    ↓
Determine Category → Route to Stage 2
    ↓
Stage 2: Offer Identification (Category-specific, 6-12 questions)
    ├─ Physical Product (12 questions)
    ├─ Digital Product (10 questions)
    ├─ Physical Service (10 questions)
    ├─ Digital Service (12 questions)
    ├─ Education/Coaching (10 questions)
    ├─ Subscription/SaaS (8 questions)
    ├─ Creative/Intellectual (8 questions)
    └─ Professional Services (7 questions)
    ↓
Stage 3: Experience & Positioning (6 questions)
    ↓
Stage 4: Output Preference (4 questions)
    ↓
Submit → AI Analysis
```

## Detailed Question Breakdown

### STAGE 1: Business Context (Universal)

**Purpose:** Understand the domain and medium of the offering

**Q1.1:** What do you want to price?
- Options: Product / Service / Both
- Icon: Package/Wrench
- Next: Determines primary offering type

**Q1.2:** Is it physical, digital, or hybrid?
- Options: Physical / Digital / Hybrid
- Icon: Box/Monitor/Globe
- Next: Determines medium

**Q1.3:** Are you an individual, freelancer, agency, or company?
- Options: Individual / Freelancer / Agency / Company
- Icon: User/Users/Building
- Context: Affects pricing expectations and overhead

**Q1.4:** Where are you located, and who is your target market?
- Location: Text input (city, country)
- Target Market: Local / Regional / National / Global
- Icon: MapPin/Globe
- Context: Regional pricing variations

**Q1.5:** What's your pricing goal?
- Options: Find market rate / Cost-based minimum / Premium pricing
- Icon: DollarSign/TrendingUp/Award
- Context: Pricing strategy preference

**Q1.6:** Do you have competitors or benchmark offerings in mind?
- Yes/No toggle
- If Yes: Text area for competitor links/names
- Icon: Users/Link
- Context: Helps with competitive analysis

**Q1.7:** Review & Category Detection
- Display: Summary of Stage 1 answers
- System: Auto-detect category
- Show: Detected category badge
- Next: Route to appropriate Stage 2

---

### STAGE 2A: Physical Product

**Q2A.1:** What type of product is it?
- Examples: Apparel, Food, Electronics, Decor, Auto parts, Handmade craft, Furniture, Toys, etc.
- Input: Dropdown + Text input
- Icon: Package

**Q2A.2:** Is it mass-produced, custom-made, or limited edition?
- Options: Mass-produced / Custom-made / Limited edition
- Icon: Factory/Wrench/Star
- Context: Affects pricing model and scalability

**Q2A.3:** What's your current production volume per month?
- Input: Number + Unit (pieces, kg, liters, etc.)
- Icon: TrendingUp
- Context: Economies of scale

**Q2A.4:** What are your raw materials or components?
- Input: Text area (list materials)
- Icon: Layers
- Context: Material cost calculation

**Q2A.5:** Where are you sourcing these materials from?
- Input: Text (supplier location, marketplace)
- Icon: MapPin
- Context: Logistics and import costs

**Q2A.6:** How long does it take to make or assemble one unit?
- Input: Number + Time unit (minutes, hours, days)
- Icon: Clock
- Context: Labor cost calculation

**Q2A.7:** Do you handle packaging and shipping yourself?
- Options: Yes, myself / Through partners / Buyer handles
- Icon: Package/Truck
- Context: Logistics overhead

**Q2A.8:** What is your target customer demographic?
- Input: Text (age, gender, profession, location)
- Icon: Users
- Context: Market positioning

**Q2A.9:** Do you have a brand or sell under a marketplace name?
- Options: Own brand / Marketplace (specify) / Both
- Input: Brand name (optional)
- Icon: Award
- Context: Brand premium

**Q2A.10:** What are your main sales channels?
- Multi-select: IndiaMART / Etsy / Shopify / Amazon / Offline retail / B2B supply / Own website / Other
- Icon: ShoppingCart
- Context: Platform fees and reach

**Q2A.11:** Are there any certification or compliance costs?
- Input: Text (BIS, ISO, Organic, Food safety, etc.)
- Icon: ShieldCheck
- Context: Regulatory overhead

**Q2A.12:** Do you provide after-sales service, warranty, or installation?
- Options: Yes (specify) / No
- Input: Text area (details)
- Icon: Tool
- Context: Post-sale support costs

---

### STAGE 2B: Digital Product

**Q2B.1:** What category is it?
- Options: Software / App / Plugin / Template / Course / Design asset / Dataset / Other
- Icon: Monitor/Code
- Context: Market segment

**Q2B.2:** What platform or marketplace do you plan to sell on?
- Multi-select: AppSumo / Gumroad / Shopify / ProductHunt / Own website / App Store / Play Store / Other
- Icon: Store
- Context: Platform fees and audience

**Q2B.3:** How long did it take to develop/build?
- Input: Number + Time unit (days, weeks, months)
- Icon: Clock
- Context: Development cost amortization

**Q2B.4:** Are you selling a one-time purchase, subscription, or license?
- Options: One-time / Subscription / License / Freemium
- Icon: DollarSign/Repeat
- Context: Revenue model

**Q2B.5:** Do you offer updates, support, or version control?
- Multi-select: Updates / Support / Version control / None
- Icon: RefreshCw
- Context: Ongoing maintenance costs

**Q2B.6:** Do you incur any recurring costs?
- Input: Text area (servers, APIs, design tools, etc.)
- Amount: Number (monthly)
- Icon: CreditCard
- Context: Operational expenses

**Q2B.7:** How do you position it?
- Options: Budget / Mid-tier / Premium
- Icon: TrendingUp
- Context: Market positioning

**Q2B.8:** What's your niche audience?
- Examples: SaaS founders, Marketers, Designers, Developers, Students, etc.
- Input: Text
- Icon: Users
- Context: Target market specificity

**Q2B.9:** Do you have comparable products in the market?
- Input: Text area (URLs, product names)
- Icon: Link
- Context: Competitive benchmarking

**Q2B.10:** What's the unique value or feature that differentiates yours?
- Input: Text area
- Icon: Star
- Context: Value proposition

---

### STAGE 2C: Physical Service

**Q2C.1:** What service do you provide?
- Examples: Construction, Event planning, Photography, Repair, Delivery, Salon, Plumbing, etc.
- Input: Dropdown + Text
- Icon: Wrench

**Q2C.2:** What's your operating region or coverage radius?
- Input: Text (city, radius in km)
- Icon: MapPin
- Context: Service area

**Q2C.3:** Do you price per hour, per project, or per outcome?
- Options: Hourly / Per project / Per outcome / Hybrid
- Icon: Clock/FileText/Target
- Context: Pricing model

**Q2C.4:** How many people or staff are involved?
- Input: Number
- Icon: Users
- Context: Labor costs

**Q2C.5:** Do you bring your own materials/tools or do clients provide them?
- Options: I provide / Client provides / Shared
- Icon: Tool
- Context: Material costs

**Q2C.6:** What is your average turnaround time per job?
- Input: Number + Time unit (hours, days, weeks)
- Icon: Clock
- Context: Throughput and scheduling

**Q2C.7:** Are there travel or logistics costs involved?
- Options: Yes (specify) / No
- Input: Text (fuel, vehicle, etc.)
- Icon: Car
- Context: Travel overhead

**Q2C.8:** Do you handle equipment depreciation, rentals, or consumables?
- Input: Text area (equipment list and costs)
- Icon: Tool
- Context: Equipment costs

**Q2C.9:** Do you have certification or licenses for the service?
- Input: Text (certifications, licenses)
- Icon: Award
- Context: Professional credentials

**Q2C.10:** What do competitors charge locally?
- Input: Text area (price ranges, competitor names)
- Icon: Users
- Context: Local market rates

---

### STAGE 2D: Digital Service (Freelancing/Agency)

**Q2D.1:** What's your main service category?
- Options: Design / Writing / Development / Marketing / Consulting / Video/Photo / Data/Analytics / Other
- Icon: Code/Pen/Camera
- Context: Service type

**Q2D.2:** Do you charge per project, hourly, or retainer?
- Options: Per project / Hourly / Retainer / Value-based
- Icon: DollarSign
- Context: Billing model

**Q2D.3:** What deliverables are typically included in one project?
- Input: Text area (list deliverables)
- Icon: FileText
- Context: Scope definition

**Q2D.4:** How complex are these projects?
- Options: Basic / Medium / Advanced
- Icon: Layers
- Context: Complexity multiplier

**Q2D.5:** What tools/software do you use?
- Input: Text area (Figma, Adobe, VS Code, etc.)
- Icon: Tool
- Context: Tool costs

**Q2D.6:** How many revisions do you typically allow?
- Input: Number or "Unlimited"
- Icon: RefreshCw
- Context: Revision overhead

**Q2D.7:** What's your average project timeline?
- Input: Number + Time unit (days, weeks)
- Icon: Clock
- Context: Time investment

**Q2D.8:** Do you handle client communication and management yourself?
- Options: Yes / No / Partially
- Icon: MessageSquare
- Context: Project management overhead

**Q2D.9:** Do you subcontract or collaborate with others?
- Options: Yes (specify) / No
- Input: Text (roles, cost sharing)
- Icon: Users
- Context: Collaboration costs

**Q2D.10:** What region or type of clients do you target?
- Input: Text (USA, Europe, Startups, Enterprises, etc.)
- Icon: Globe
- Context: Client segment

**Q2D.11:** Have you signed or used SoWs or contracts before?
- Options: Yes / No
- Icon: FileText
- Context: Professionalism level

**Q2D.12:** Do you have a niche specialization?
- Input: Text (SaaS UI, Legal writing, Fintech apps, etc.)
- Icon: Target
- Context: Specialization premium

---

### STAGE 2E: Education/Coaching/Consulting

**Q2E.1:** Is it one-on-one or group-based?
- Options: One-on-one / Group / Both
- Icon: User/Users
- Context: Delivery format

**Q2E.2:** What's the duration of one session or program?
- Input: Number + Time unit (minutes, hours)
- Icon: Clock
- Context: Session length

**Q2E.3:** What's the total length?
- Input: Number + Time unit (weeks, months)
- Icon: Calendar
- Context: Program duration

**Q2E.4:** Do you provide materials, recordings, or follow-ups?
- Multi-select: Materials / Recordings / Follow-ups / None
- Icon: Book/Video/Mail
- Context: Additional value

**Q2E.5:** What's your field or expertise area?
- Input: Text (Business, Fitness, Language, Tech, etc.)
- Icon: Award
- Context: Expertise domain

**Q2E.6:** How experienced are you?
- Input: Years + Credentials/Achievements
- Icon: Star
- Context: Experience premium

**Q2E.7:** What's your audience?
- Options: Students / Professionals / Businesses / Mixed
- Icon: Users
- Context: Target market

**Q2E.8:** How personalized is your program?
- Options: Highly personalized / Somewhat / Standardized
- Icon: Target
- Context: Customization level

**Q2E.9:** Do you provide certifications?
- Options: Yes / No
- Icon: Award
- Context: Certification value

**Q2E.10:** Are you offering online, offline, or hybrid sessions?
- Options: Online / Offline / Hybrid
- Icon: Monitor/MapPin/Globe
- Context: Delivery mode

---

### STAGE 2F: Subscription/SaaS/Membership

**Q2F.1:** What's the core functionality or purpose?
- Input: Text area (describe the product)
- Icon: Monitor
- Context: Product value

**Q2F.2:** How many active users or subscribers do you expect?
- Input: Number range (e.g., 10-100, 100-1000)
- Icon: Users
- Context: Scale estimation

**Q2F.3:** What are your recurring infrastructure costs?
- Input: Text area + Amount (hosting, database, APIs)
- Icon: Server
- Context: Operational costs

**Q2F.4:** Do you provide a free trial or freemium tier?
- Options: Free trial / Freemium / Paid only
- Icon: Gift
- Context: Acquisition strategy

**Q2F.5:** What's the average cost of similar services in your niche?
- Input: Text area (competitor pricing)
- Icon: DollarSign
- Context: Market benchmark

**Q2F.6:** Are you positioning as low-cost, balanced, or enterprise-grade?
- Options: Low-cost / Balanced / Enterprise
- Icon: TrendingUp
- Context: Market positioning

**Q2F.7:** How many people are maintaining the service?
- Input: Number
- Icon: Users
- Context: Team costs

**Q2F.8:** Do you include human support or just automation?
- Options: Human support / Automated / Hybrid
- Icon: Headphones/Bot
- Context: Support costs

---

### STAGE 2G: Creative/Intellectual Work

**Q2G.1:** What form does your work take?
- Options: Art / Design / Writing / Photography / Film / Music / Other
- Icon: Palette/Camera/Music
- Context: Creative medium

**Q2G.2:** Are you selling licenses, physical copies, or digital downloads?
- Options: Licenses / Physical / Digital / NFTs
- Icon: Key/Package/Download
- Context: Sales format

**Q2G.3:** Are there royalties or rights involved?
- Options: Yes (specify) / No
- Input: Text (royalty structure)
- Icon: DollarSign
- Context: Rights management

**Q2G.4:** Do you work on commissions or self-created works?
- Options: Commissions / Self-created / Both
- Icon: Briefcase/Palette
- Context: Work type

**Q2G.5:** How do you deliver your work?
- Input: Text (digital files, prints, NFTs, etc.)
- Icon: Send
- Context: Delivery method

**Q2G.6:** What's your experience or recognition level?
- Input: Text (years, awards, exhibitions, etc.)
- Icon: Award
- Context: Reputation premium

**Q2G.7:** What's the average production time per piece or project?
- Input: Number + Time unit
- Icon: Clock
- Context: Time investment

**Q2G.8:** Do you collaborate with clients or work independently?
- Options: Collaborate / Independent / Both
- Icon: Users/User
- Context: Client involvement

---

### STAGE 2H: Professional Services

**Q2H.1:** What specific service are you offering?
- Examples: Legal, Accounting, Medical, Finance, Engineering, Architecture, etc.
- Input: Dropdown + Text
- Icon: Scale/Calculator/Stethoscope
- Context: Professional domain

**Q2H.2:** Do you have licensing or certifications?
- Input: Text (licenses, certifications, credentials)
- Icon: Award
- Context: Professional credentials

**Q2H.3:** Is your pricing time-based or outcome-based?
- Options: Time-based / Outcome-based / Both
- Icon: Clock/Target
- Context: Billing model

**Q2H.4:** Do you offer consultation, implementation, or both?
- Options: Consultation / Implementation / Both
- Icon: MessageSquare/Tool
- Context: Service scope

**Q2H.5:** What are your administrative or compliance costs?
- Input: Text area (insurance, licenses, software, etc.)
- Icon: FileText
- Context: Overhead costs

**Q2H.6:** What client segment do you serve?
- Options: Individual / SMB / Enterprise / Mixed
- Icon: Users
- Context: Client type

**Q2H.7:** Are there recurring retainers or one-time engagements?
- Options: Retainer / One-time / Both
- Icon: Repeat/FileText
- Context: Engagement model

---

### STAGE 3: Experience & Positioning (Universal)

**Q3.1:** How long have you been in this field?
- Input: Number (years) or "Just starting"
- Icon: Calendar
- Context: Experience level

**Q3.2:** How do you describe your skill level?
- Options: Beginner / Intermediate / Expert
- Icon: TrendingUp
- Context: Skill multiplier

**Q3.3:** What's your business stage?
- Options: Idea / Launch / Growth / Mature
- Icon: Rocket
- Context: Business maturity

**Q3.4:** What's your current pricing method (if any)?
- Input: Text area (how you currently price)
- Icon: DollarSign
- Context: Current approach

**Q3.5:** Do you have testimonials, case studies, or portfolio samples?
- Options: Yes (provide links) / No
- Input: Text area (URLs)
- Icon: Star
- Context: Social proof

**Q3.6:** What's your biggest challenge in pricing right now?
- Options: Competition / Cost calculation / Perceived value / Market uncertainty / Other
- Input: Text area (explain)
- Icon: AlertCircle
- Context: Pain points

---

### STAGE 4: Output Preference (Universal)

**Q4.1:** Do you want pricing in your local currency or USD benchmark?
- Input: Currency selector (USD, INR, EUR, GBP, etc.)
- Icon: DollarSign
- Context: Currency preference

**Q4.2:** Should the system prioritize?
- Options: Affordable pricing / Profit-optimized / Competitive pricing
- Icon: Target
- Context: Optimization goal

**Q4.3:** Do you want a detailed cost breakdown or a summarized recommendation?
- Options: Detailed breakdown / Summarized / Both
- Icon: FileText/List
- Context: Output detail level

**Q4.4:** Would you like to compare with similar profiles or top performers?
- Options: Yes / No
- Icon: Users
- Context: Benchmarking

---

## Hidden Intelligence Layer

After collecting all responses, the system automatically:

1. **Identifies relevant data sources** for scraping
   - Maps category → platforms (e.g., Digital Service → Fiverr, Upwork)
   - Filters by region and niche

2. **Infers category clusters**
   - Groups similar offerings for better benchmarking
   - Identifies micro-niches for specialized pricing

3. **Builds structured prompts** for DeepSeek V3
   - Includes all relevant context
   - Formats data for optimal AI reasoning

4. **Predicts cost structure**
   - Calculates tool costs
   - Estimates time investment
   - Factors in complexity multipliers

5. **Generates pricing recommendation**
   - Low/Average/High range
   - Detailed reasoning
   - Market positioning advice
   - Actionable next steps

---

## Implementation Status

✅ **Completed:**
- Type definitions
- Component structure
- Progress tracking
- Category detection logic
- Navigation flow

🔄 **In Progress:**
- Question rendering functions
- Form validation
- Conditional logic
- Data transformation

📋 **Next Steps:**
- Complete all question renderers
- Add validation rules
- Implement skip logic
- Add help tooltips
- Create summary view
- Integrate with backend API

---

## Usage Flow

```
User starts questionnaire
    ↓
Stage 1: Answer 7 business context questions
    ↓
System detects category (e.g., "Digital Service")
    ↓
Stage 2: Answer 12 category-specific questions
    ↓
Stage 3: Answer 6 experience/positioning questions
    ↓
Stage 4: Answer 4 output preference questions
    ↓
Submit → Backend processes
    ↓
AI analyzes with DeepSeek V3
    ↓
Market data scraped
    ↓
Pricing recommendation generated
    ↓
Results displayed to user
```

---

## Data Transformation

The questionnaire data is transformed into the format expected by the backend:

```typescript
{
  // Mapped from questionnaire
  businessType: formData.medium, // 'digital' | 'physical'
  offeringType: formData.offeringType, // 'product' | 'service'
  experienceLevel: formData.skillLevel, // 'beginner' | 'intermediate' | 'expert'
  region: formData.location,
  niche: formData.category,
  pricingGoal: formData.pricingStrategy,
  
  // Constructed from category-specific answers
  productDescription: `[Detailed description from Stage 2]`,
  costToDeliver: `[Cost breakdown from Stage 2]`,
  competitorPricing: `[Competitor data from Stage 1 & 2]`,
  valueProposition: `[Unique value from Stage 2 & 3]`,
  
  // Metadata
  businessEntity: formData.businessEntity,
  targetMarket: formData.targetMarket,
  currentPricingMethod: formData.currentPricingMethod,
  biggestChallenge: formData.biggestChallenge,
  
  // Output preferences
  preferredCurrency: formData.preferredCurrency,
  pricingPriority: formData.pricingPriority,
  outputDetail: formData.outputDetail,
  wantsComparison: formData.wantsComparison,
}
```

This comprehensive questionnaire ensures we capture every relevant detail for accurate, AI-powered pricing recommendations!

