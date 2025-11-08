import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Package,
  Monitor,
  Wrench,
  Code,
  GraduationCap,
  Briefcase,
  Palette,
  Scale,
  Globe,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  MapPin,
  Award,
  FileText,
} from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type OfferingCategory = 
  | 'physical_product'
  | 'digital_product'
  | 'physical_service'
  | 'digital_service'
  | 'education_coaching'
  | 'subscription_saas'
  | 'creative_intellectual'
  | 'professional_services';

interface QuestionnaireState {
  // Stage 1: Business Context
  offeringType: 'product' | 'service' | 'both' | '';
  medium: 'physical' | 'digital' | 'hybrid' | '';
  businessEntity: 'individual' | 'freelancer' | 'agency' | 'company' | '';
  location: string;
  targetMarket: 'local' | 'regional' | 'national' | 'global' | '';
  pricingStrategy: 'market_rate' | 'cost_based' | 'premium' | '';
  hasCompetitors: boolean;
  competitorLinks: string;

  // Determined category
  category: OfferingCategory | '';

  // Stage 2A: Physical Product
  productType: string;
  productionType: 'mass_produced' | 'custom_made' | 'limited_edition' | '';
  productionVolume: string;
  rawMaterials: string;
  materialSource: string;
  productionTime: string;
  handlesShipping: boolean;
  targetDemographic: string;
  hasBrand: boolean;
  salesChannels: string[];
  certifications: string;
  afterSalesService: boolean;

  // Stage 2B: Digital Product
  digitalCategory: string;
  platform: string;
  developmentTime: string;
  salesModel: 'one_time' | 'subscription' | 'license' | '';
  providesUpdates: boolean;
  recurringCosts: string;
  positioning: 'budget' | 'mid_tier' | 'premium' | '';
  nicheAudience: string;
  comparableProducts: string;
  uniqueValue: string;
  mainFeatures: string; // NEW: For tiered pricing (Q2.11)

  // Stage 2C: Physical Service
  serviceType: string;
  operatingRegion: string;
  pricingModel: 'hourly' | 'project' | 'outcome' | '';
  staffCount: string;
  clientProvidesMaterials: boolean;
  turnaroundTime: string;
  travelCosts: boolean;
  equipmentDepreciation: string;
  hasLicense: boolean;
  localCompetitorPricing: string;

  // Stage 2D: Digital Service
  digitalServiceCategory: string;
  chargeModel: 'project' | 'hourly' | 'retainer' | '';
  deliverables: string;
  projectComplexity: 'basic' | 'medium' | 'advanced' | '';
  toolsUsed: string;
  revisionsAllowed: string;
  projectTimeline: string;
  handlesClientManagement: boolean;
  usesSubcontractors: boolean;
  clientRegion: string;
  hasSoW: boolean;
  nicheSpecialization: string;

  // Stage 2E: Education/Coaching
  sessionFormat: 'one_on_one' | 'group' | 'hybrid' | '';
  sessionDuration: string;
  programLength: string;
  providesMaterials: boolean;
  expertiseArea: string;
  experienceYears: string;
  targetAudience: string;
  personalizationLevel: string;
  providesCertification: boolean;
  deliveryMode: 'online' | 'offline' | 'hybrid' | '';

  // Stage 2F: Subscription/SaaS
  coreFunctionality: string;
  expectedUsers: string;
  infrastructureCosts: string;
  hasFreeTier: boolean;
  similarServicesCost: string;
  saasPositioning: 'low_cost' | 'balanced' | 'enterprise' | '';
  maintenanceTeamSize: string;
  supportType: 'human' | 'automated' | 'hybrid' | '';

  // Stage 2G: Creative/Intellectual
  creativeForm: string;
  salesFormat: 'license' | 'physical' | 'digital' | 'nft' | '';
  hasRoyalties: boolean;
  workType: 'commission' | 'self_created' | 'both' | '';
  deliveryMethod: string;
  recognitionLevel: string;
  productionTimePerPiece: string;
  collaboratesWithClients: boolean;

  // Stage 2H: Professional Services
  professionalService: string;
  hasLicensing: boolean;
  professionalPricingModel: 'time_based' | 'outcome_based' | 'both' | '';
  serviceScope: 'consultation' | 'implementation' | 'both' | '';
  complianceCosts: string;
  clientSegment: 'individual' | 'smb' | 'enterprise' | '';
  engagementType: 'retainer' | 'one_time' | 'both' | '';

  // Travel Requirements (for services)
  travelRequired: boolean;
  travelFrequency: 'one_time' | 'weekly' | 'daily' | 'per_project' | 'monthly' | '';
  travelScope: 'local' | 'regional' | 'inter_city' | 'interstate' | 'international' | '';
  travelMode: 'bike' | 'car' | 'public_transport' | 'train' | 'flight' | 'mixed' | '';
  travelDistance: string;
  travelTime: string;
  clientBearsTravelCost: boolean;
  travelOrigin: string;
  travelDestination: string;

  // Stage 3: Experience & Positioning
  yearsInField: string;
  skillLevel: 'beginner' | 'intermediate' | 'expert' | '';
  businessStage: 'idea' | 'launch' | 'growth' | 'mature' | '';
  currentPricingMethod: string;
  hasPortfolio: boolean;
  biggestChallenge: string;

  // Stage 4: Output Preference
  preferredCurrency: string;
  pricingPriority: 'affordable' | 'profit_optimized' | 'competitive' | '';
  outputDetail: 'detailed' | 'summarized' | '';
  wantsComparison: boolean;
}

interface AnthropologicalQuestionnaireProps {
  onSubmit: (data: QuestionnaireState) => void;
  loading: boolean;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AnthropologicalQuestionnaire({ onSubmit, loading }: AnthropologicalQuestionnaireProps) {
  const [stage, setStage] = useState(1);
  const [substage, setSubstage] = useState(0);
  const [backgroundAnalysisStarted, setBackgroundAnalysisStarted] = useState(false);
  const [preAnalysisData, setPreAnalysisData] = useState<any>(null);
  const [formData, setFormData] = useState<QuestionnaireState>({
    offeringType: '',
    medium: '',
    businessEntity: '',
    location: '',
    targetMarket: '',
    pricingStrategy: '',
    hasCompetitors: false,
    competitorLinks: '',
    category: '',
    productType: '',
    productionType: '',
    productionVolume: '',
    rawMaterials: '',
    materialSource: '',
    productionTime: '',
    handlesShipping: false,
    targetDemographic: '',
    hasBrand: false,
    salesChannels: [],
    certifications: '',
    afterSalesService: false,
    digitalCategory: '',
    platform: '',
    developmentTime: '',
    salesModel: '',
    providesUpdates: false,
    recurringCosts: '',
    positioning: '',
    nicheAudience: '',
    comparableProducts: '',
    uniqueValue: '',
    mainFeatures: '',
    serviceType: '',
    operatingRegion: '',
    pricingModel: '',
    staffCount: '',
    clientProvidesMaterials: false,
    turnaroundTime: '',
    travelCosts: false,
    equipmentDepreciation: '',
    hasLicense: false,
    localCompetitorPricing: '',
    digitalServiceCategory: '',
    chargeModel: '',
    deliverables: '',
    projectComplexity: '',
    toolsUsed: '',
    revisionsAllowed: '',
    projectTimeline: '',
    handlesClientManagement: false,
    usesSubcontractors: false,
    clientRegion: '',
    hasSoW: false,
    nicheSpecialization: '',
    sessionFormat: '',
    sessionDuration: '',
    programLength: '',
    providesMaterials: false,
    expertiseArea: '',
    experienceYears: '',
    targetAudience: '',
    personalizationLevel: '',
    providesCertification: false,
    deliveryMode: '',
    coreFunctionality: '',
    expectedUsers: '',
    infrastructureCosts: '',
    hasFreeTier: false,
    similarServicesCost: '',
    saasPositioning: '',
    maintenanceTeamSize: '',
    supportType: '',
    creativeForm: '',
    salesFormat: '',
    hasRoyalties: false,
    workType: '',
    deliveryMethod: '',
    recognitionLevel: '',
    productionTimePerPiece: '',
    collaboratesWithClients: false,
    professionalService: '',
    hasLicensing: false,
    professionalPricingModel: '',
    serviceScope: '',
    complianceCosts: '',
    clientSegment: '',
    engagementType: '',
    travelRequired: false,
    travelFrequency: '',
    travelScope: '',
    travelMode: '',
    travelDistance: '',
    travelTime: '',
    clientBearsTravelCost: false,
    travelOrigin: '',
    travelDestination: '',
    yearsInField: '',
    skillLevel: '',
    businessStage: '',
    currentPricingMethod: '',
    hasPortfolio: false,
    biggestChallenge: '',
    preferredCurrency: 'USD',
    pricingPriority: '',
    outputDetail: '',
    wantsComparison: false,
  });

  // Trigger background analysis after Stage 1 completion
  React.useEffect(() => {
    if (stage === 2 && !backgroundAnalysisStarted && formData.category) {
      triggerBackgroundAnalysis();
    }
  }, [stage, formData.category]);

  const triggerBackgroundAnalysis = async () => {
    setBackgroundAnalysisStarted(true);
    
    console.log('🔄 Starting background market data scraping...');
    
    // Start pre-scraping market data based on Stage 1 answers
    try {
      const API_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      // Import supabase from lib
      const { supabase } = await import('../lib/supabase');
      
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        console.warn('No auth token for background analysis');
        return;
      }

      // Trigger background scraping (fire and forget)
      fetch(`${API_URL}/api/consultations/pre-analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          businessType: formData.medium,
          offeringType: formData.offeringType,
          region: formData.location,
          niche: formData.category,
          targetMarket: formData.targetMarket,
        }),
      }).then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setPreAnalysisData(data);
          console.log('✅ Background market data ready!', data);
        }
      }).catch((err) => {
        console.warn('Background analysis failed (non-critical):', err);
      });
    } catch (error) {
      console.warn('Background analysis error (non-critical):', error);
    }
  };

  // Determine category based on offering type and medium
  const determineCategory = (): OfferingCategory | '' => {
    const { offeringType, medium } = formData;
    
    if (offeringType === 'product' && medium === 'physical') return 'physical_product';
    if (offeringType === 'product' && medium === 'digital') return 'digital_product';
    if (offeringType === 'service' && medium === 'physical') return 'physical_service';
    if (offeringType === 'service' && medium === 'digital') return 'digital_service';
    
    // Special categories based on additional context
    if (formData.digitalServiceCategory?.toLowerCase().includes('education') || 
        formData.digitalServiceCategory?.toLowerCase().includes('coaching')) {
      return 'education_coaching';
    }
    if (formData.digitalCategory?.toLowerCase().includes('saas') || 
        formData.digitalCategory?.toLowerCase().includes('subscription')) {
      return 'subscription_saas';
    }
    if (formData.digitalServiceCategory?.toLowerCase().includes('creative') || 
        formData.digitalServiceCategory?.toLowerCase().includes('design') ||
        formData.digitalServiceCategory?.toLowerCase().includes('art')) {
      return 'creative_intellectual';
    }
    if (formData.serviceType?.toLowerCase().includes('legal') ||
        formData.serviceType?.toLowerCase().includes('accounting') ||
        formData.serviceType?.toLowerCase().includes('medical') ||
        formData.serviceType?.toLowerCase().includes('engineering')) {
      return 'professional_services';
    }
    
    return '';
  };

  const handleNext = () => {
    // Determine category after Stage 1 (now has 8 substages: 0-7)
    if (stage === 1 && substage === 7) {
      const category = determineCategory();
      setFormData({ ...formData, category });
      setStage(2);
      setSubstage(0);
      return;
    }

    // Navigate through substages
    if (stage === 2) {
      // Stage 2 has different substages based on category
      const maxSubstages = getMaxSubstagesForCategory();
      if (substage < maxSubstages) {
        setSubstage(substage + 1);
      } else {
        setStage(3);
        setSubstage(0);
      }
    } else if (stage === 3 && substage < 5) {
      setSubstage(substage + 1);
    } else if (stage === 3 && substage === 5) {
      setStage(4);
      setSubstage(0);
    } else if (stage === 4 && substage < 2) { // Stage 4 now has 3 questions (0-2)
      setSubstage(substage + 1);
    } else if (stage === 1 && substage < 7) {
      setSubstage(substage + 1);
    }
  };

  const handleBack = () => {
    if (substage > 0) {
      setSubstage(substage - 1);
    } else if (stage > 1) {
      setStage(stage - 1);
      setSubstage(stage === 2 ? 7 : 0); // Stage 1 now has 8 questions (0-7)
    }
  };

  const handleSubmit = () => {
    // Include pre-analysis data in submission
    const submissionData = {
      ...formData,
      preAnalysisData: preAnalysisData,
    };
    onSubmit(submissionData);
  };

  const getMaxSubstagesForCategory = (): number => {
    switch (formData.category) {
      case 'physical_product': return 11;
      case 'digital_product': return 10; // Added feature list question
      case 'physical_service': return 9;
      case 'digital_service': return 11;
      case 'education_coaching': return 9;
      case 'subscription_saas': return 7;
      case 'creative_intellectual': return 7;
      case 'professional_services': return 6;
      default: return 0;
    }
  };

  const getTotalProgress = (): number => {
    const stage1Questions = 8; // Currency + Product/Service + Type + 5 business context questions
    const stage2Questions = getMaxSubstagesForCategory() + 1;
    const stage3Questions = 6;
    const stage4Questions = 3; // Reduced from 4 (currency moved to Stage 1)
    const totalQuestions = stage1Questions + stage2Questions + stage3Questions + stage4Questions;
    
    let answeredQuestions = 0;
    
    // Calculate based on current stage and substage
    if (stage === 1) {
      answeredQuestions = substage + 1;
    } else if (stage === 2) {
      answeredQuestions = stage1Questions + substage + 1;
    } else if (stage === 3) {
      answeredQuestions = stage1Questions + stage2Questions + substage + 1;
    } else if (stage === 4) {
      answeredQuestions = stage1Questions + stage2Questions + stage3Questions + substage + 1;
    }
    
    // Cap at 100%
    const percentage = Math.round((answeredQuestions / totalQuestions) * 100);
    return Math.min(percentage, 100);
  };

  const getCategoryIcon = () => {
    switch (formData.category) {
      case 'physical_product': return <Package className="w-8 h-8" />;
      case 'digital_product': return <Monitor className="w-8 h-8" />;
      case 'physical_service': return <Wrench className="w-8 h-8" />;
      case 'digital_service': return <Code className="w-8 h-8" />;
      case 'education_coaching': return <GraduationCap className="w-8 h-8" />;
      case 'subscription_saas': return <TrendingUp className="w-8 h-8" />;
      case 'creative_intellectual': return <Palette className="w-8 h-8" />;
      case 'professional_services': return <Scale className="w-8 h-8" />;
      default: return <Briefcase className="w-8 h-8" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm font-medium text-slate-600 mb-2">
          <span>Stage {stage} of 4</span>
          <span>{getTotalProgress()}% Complete</span>
        </div>
        <div className="w-full bg-beige-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-olive-600 to-olive-700 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${getTotalProgress()}%` }}
          ></div>
        </div>
      </div>

      {/* Category Badge (if determined) */}
      {formData.category && (
        <div className="mb-6">
          <div className="flex items-center justify-center gap-3 bg-olive-50 border border-olive-200 rounded-xl p-4">
            <div className="text-olive-600">
              {getCategoryIcon()}
            </div>
            <div>
              <p className="text-sm text-olive-600 font-medium">Detected Category</p>
              <p className="text-lg font-bold text-olive-800">
                {formData.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </p>
            </div>
          </div>
          
          {/* Background Analysis Indicator */}
          {backgroundAnalysisStarted && (
            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800">
                    {preAnalysisData ? '✅ Market data ready!' : '🔄 Analyzing market data in background...'}
                  </p>
                  <p className="text-xs text-blue-600">
                    {preAnalysisData 
                      ? 'Your pricing will be ready instantly when you submit!' 
                      : 'Continue answering questions while we gather pricing data'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Question Content */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* Render questions based on stage and substage */}
        {renderQuestionContent(stage, substage, formData, setFormData)}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-beige-200">
          {(stage > 1 || substage > 0) && (
            <button
              onClick={handleBack}
              disabled={loading}
              className="px-6 py-3 bg-beige-100 text-olive-600 rounded-lg font-semibold hover:bg-beige-200 transition flex items-center gap-2 disabled:opacity-50"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          )}

          {stage === 4 && substage === 2 ? (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-3 bg-olive-600 text-white rounded-lg font-semibold hover:bg-olive-700 transition flex items-center gap-2 ml-auto disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : 'Get Pricing Recommendation'}
              <CheckCircle className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={loading}
              className="px-6 py-3 bg-olive-600 text-white rounded-lg font-semibold hover:bg-olive-700 transition flex items-center gap-2 ml-auto disabled:opacity-50"
            >
              Next
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// QUESTION RENDERING LOGIC
// ============================================================================

function renderQuestionContent(
  stage: number,
  substage: number,
  formData: QuestionnaireState,
  setFormData: React.Dispatch<React.SetStateAction<QuestionnaireState>>
) {
  // STAGE 1: Business Context
  if (stage === 1) {
    return renderStage1Questions(substage, formData, setFormData);
  }

  // STAGE 2: Offer Identification (Category-specific)
  if (stage === 2) {
    return renderStage2Questions(substage, formData, setFormData);
  }

  // STAGE 3: Experience & Positioning
  if (stage === 3) {
    return renderStage3Questions(substage, formData, setFormData);
  }

  // STAGE 4: Output Preference
  if (stage === 4) {
    return renderStage4Questions(substage, formData, setFormData);
  }

  return null;
}

// ============================================================================
// STAGE 1: BUSINESS CONTEXT QUESTIONS
// ============================================================================

function renderStage1Questions(
  substage: number,
  formData: QuestionnaireState,
  setFormData: React.Dispatch<React.SetStateAction<QuestionnaireState>>
) {
  switch (substage) {
    case 0: // Q1.0: Preferred Currency (FIRST QUESTION)
      return (
        <div>
          <h3 className="text-2xl font-bold text-slate-800 mb-4">
            What currency would you like your pricing in?
          </h3>
          <p className="text-slate-600 mb-6">
            All calculations, fuel costs, and recommendations will be shown in your preferred currency
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
            {[
              { code: 'USD', name: 'US Dollar', symbol: '$' },
              { code: 'EUR', name: 'Euro', symbol: '€' },
              { code: 'GBP', name: 'British Pound', symbol: '£' },
              { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
              { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
              { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
              { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
              { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
              { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
              { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
            ].map((curr) => (
              <button
                key={curr.code}
                type="button"
                onClick={() => setFormData({ ...formData, preferredCurrency: curr.code })}
                className={`p-4 rounded-lg border-2 transition ${
                  formData.preferredCurrency === curr.code
                    ? 'border-olive-600 bg-olive-50'
                    : 'border-beige-200 hover:border-olive-300'
                }`}
              >
                <p className="text-2xl mb-1">{curr.symbol}</p>
                <p className="font-semibold text-slate-800 text-sm">{curr.code}</p>
                <p className="text-xs text-slate-600">{curr.name}</p>
              </button>
            ))}
          </div>
          <div className="bg-olive-50 border border-olive-200 rounded-lg p-4">
            <p className="text-sm text-olive-800">
              💡 <strong>Smart Tip:</strong> We'll automatically detect fuel prices and costs based on your location and convert everything to your chosen currency.
            </p>
          </div>
        </div>
      );

    case 1: // Q1.1: What do you want to price?
      return (
        <div>
          <h3 className="text-2xl font-bold text-slate-800 mb-4">
            What do you want to price?
          </h3>
          <p className="text-slate-600 mb-6">
            This helps us understand the nature of your offering
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, offeringType: 'product' })}
              className={`p-8 rounded-xl border-2 transition ${
                formData.offeringType === 'product'
                  ? 'border-olive-600 bg-olive-50 shadow-lg'
                  : 'border-beige-200 hover:border-olive-300'
              }`}
            >
              <Package className="w-12 h-12 text-olive-600 mx-auto mb-4" />
              <p className="font-bold text-slate-800 text-lg mb-2">Product</p>
              <p className="text-sm text-slate-600">Something you create, manufacture, or sell</p>
              <p className="text-xs text-slate-500 mt-2">Examples: Software, Books, Crafts, Electronics, Food</p>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, offeringType: 'service' })}
              className={`p-8 rounded-xl border-2 transition ${
                formData.offeringType === 'service'
                  ? 'border-olive-600 bg-olive-50 shadow-lg'
                  : 'border-beige-200 hover:border-olive-300'
              }`}
            >
              <Wrench className="w-12 h-12 text-olive-600 mx-auto mb-4" />
              <p className="font-bold text-slate-800 text-lg mb-2">Service</p>
              <p className="text-sm text-slate-600">Work or expertise you provide to clients</p>
              <p className="text-xs text-slate-500 mt-2">Examples: Design, Consulting, Repair, Coaching, Development</p>
            </button>
          </div>
        </div>
      );

    case 2: // Q1.2: What TYPE of product/service? (Immediate segregation)
      return (
        <div>
          <h3 className="text-2xl font-bold text-slate-800 mb-4">
            What type of {formData.offeringType} is it?
          </h3>
          <p className="text-slate-600 mb-6">
            This determines which markets and platforms we'll analyze for pricing data
          </p>
          
          {formData.offeringType === 'product' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, medium: 'physical' })}
                className={`p-8 rounded-xl border-2 transition ${
                  formData.medium === 'physical'
                    ? 'border-olive-600 bg-olive-50 shadow-lg'
                    : 'border-beige-200 hover:border-olive-300'
                }`}
              >
                <Package className="w-12 h-12 text-olive-600 mx-auto mb-4" />
                <p className="font-bold text-slate-800 text-lg mb-2">Physical Product</p>
                <p className="text-sm text-slate-600 mb-3">Tangible items that need to be manufactured, stored, and shipped</p>
                <div className="text-left">
                  <p className="text-xs text-slate-500 font-semibold mb-1">Examples:</p>
                  <p className="text-xs text-slate-500">• Handmade crafts, Jewelry, Apparel</p>
                  <p className="text-xs text-slate-500">• Electronics, Auto parts, Furniture</p>
                  <p className="text-xs text-slate-500">• Food products, Cosmetics, Toys</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, medium: 'digital' })}
                className={`p-8 rounded-xl border-2 transition ${
                  formData.medium === 'digital'
                    ? 'border-olive-600 bg-olive-50 shadow-lg'
                    : 'border-beige-200 hover:border-olive-300'
                }`}
              >
                <Monitor className="w-12 h-12 text-olive-600 mx-auto mb-4" />
                <p className="font-bold text-slate-800 text-lg mb-2">Digital Product</p>
                <p className="text-sm text-slate-600 mb-3">Downloadable or online products with no physical shipping</p>
                <div className="text-left">
                  <p className="text-xs text-slate-500 font-semibold mb-1">Examples:</p>
                  <p className="text-xs text-slate-500">• Software, Apps, SaaS, Plugins</p>
                  <p className="text-xs text-slate-500">• Ebooks, Courses, Templates</p>
                  <p className="text-xs text-slate-500">• Design assets, Stock photos, Music</p>
                </div>
              </button>
            </div>
          )}
          
          {formData.offeringType === 'service' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, medium: 'physical' })}
                className={`p-8 rounded-xl border-2 transition ${
                  formData.medium === 'physical'
                    ? 'border-olive-600 bg-olive-50 shadow-lg'
                    : 'border-beige-200 hover:border-olive-300'
                }`}
              >
                <Wrench className="w-12 h-12 text-olive-600 mx-auto mb-4" />
                <p className="font-bold text-slate-800 text-lg mb-2">Physical Service</p>
                <p className="text-sm text-slate-600 mb-3">On-site work requiring physical presence or travel</p>
                <div className="text-left">
                  <p className="text-xs text-slate-500 font-semibold mb-1">Examples:</p>
                  <p className="text-xs text-slate-500">• Construction, Plumbing, Electrical</p>
                  <p className="text-xs text-slate-500">• Photography, Event planning, Catering</p>
                  <p className="text-xs text-slate-500">• Repair, Installation, Delivery</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, medium: 'digital' })}
                className={`p-8 rounded-xl border-2 transition ${
                  formData.medium === 'digital'
                    ? 'border-olive-600 bg-olive-50 shadow-lg'
                    : 'border-beige-200 hover:border-olive-300'
                }`}
              >
                <Code className="w-12 h-12 text-olive-600 mx-auto mb-4" />
                <p className="font-bold text-slate-800 text-lg mb-2">Digital Service</p>
                <p className="text-sm text-slate-600 mb-3">Remote work done online without physical presence</p>
                <div className="text-left">
                  <p className="text-xs text-slate-500 font-semibold mb-1">Examples:</p>
                  <p className="text-xs text-slate-500">• Web/App Development, Design</p>
                  <p className="text-xs text-slate-500">• Writing, Marketing, Consulting</p>
                  <p className="text-xs text-slate-500">• Video editing, Data analysis, Coaching</p>
                </div>
              </button>
            </div>
          )}
          
          {formData.medium && (
            <div className="mt-6 bg-olive-50 border border-olive-200 rounded-lg p-4">
              <p className="text-sm text-olive-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <strong>Detected Category:</strong> {formData.medium.charAt(0).toUpperCase() + formData.medium.slice(1)} {formData.offeringType.charAt(0).toUpperCase() + formData.offeringType.slice(1)}
              </p>
            </div>
          )}
        </div>
      );

    case 3: // Q1.3: Business entity type
      return (
        <div>
          <h3 className="text-2xl font-bold text-slate-800 mb-4">
            What type of business entity are you?
          </h3>
          <p className="text-slate-600 mb-6">
            This helps us understand your overhead and pricing structure
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { value: 'individual', label: 'Individual', desc: 'Solo creator or seller', icon: Users },
              { value: 'freelancer', label: 'Freelancer', desc: 'Independent professional', icon: Briefcase },
              { value: 'agency', label: 'Agency', desc: 'Team of professionals', icon: Users },
              { value: 'company', label: 'Company', desc: 'Registered business', icon: Briefcase },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData({ ...formData, businessEntity: option.value as any })}
                className={`p-6 rounded-xl border-2 transition text-left ${
                  formData.businessEntity === option.value
                    ? 'border-olive-600 bg-olive-50'
                    : 'border-beige-200 hover:border-olive-300'
                }`}
              >
                <option.icon className="w-6 h-6 text-olive-600 mb-2" />
                <p className="font-semibold text-slate-800">{option.label}</p>
                <p className="text-sm text-slate-600 mt-1">{option.desc}</p>
              </button>
            ))}
          </div>
        </div>
      );

    case 4: // Q1.4: Location and target market
      return (
        <div>
          <h3 className="text-2xl font-bold text-slate-800 mb-4">
            Where are you located and who is your target market?
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Your Location (City, Country)
                </div>
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-olive-500"
                placeholder="e.g., Mumbai, India"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Target Market
                </div>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { value: 'local', label: 'Local' },
                  { value: 'regional', label: 'Regional' },
                  { value: 'national', label: 'National' },
                  { value: 'global', label: 'Global' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, targetMarket: option.value as any })}
                    className={`p-3 rounded-lg border-2 transition ${
                      formData.targetMarket === option.value
                        ? 'border-olive-600 bg-olive-50'
                        : 'border-beige-200 hover:border-olive-300'
                    }`}
                  >
                    <p className="font-medium text-slate-800">{option.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      );

    case 5: // Q1.5: Pricing strategy
      return (
        <div>
          <h3 className="text-2xl font-bold text-slate-800 mb-4">
            What's your pricing goal?
          </h3>
          <p className="text-slate-600 mb-6">
            This helps us optimize for your specific objective
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, pricingStrategy: 'market_rate' })}
              className={`p-6 rounded-xl border-2 transition ${
                formData.pricingStrategy === 'market_rate'
                  ? 'border-olive-600 bg-olive-50'
                  : 'border-beige-200 hover:border-olive-300'
              }`}
            >
              <TrendingUp className="w-8 h-8 text-olive-600 mx-auto mb-3" />
              <p className="font-semibold text-slate-800">Market Rate</p>
              <p className="text-sm text-slate-600 mt-1">Competitive pricing</p>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, pricingStrategy: 'cost_based' })}
              className={`p-6 rounded-xl border-2 transition ${
                formData.pricingStrategy === 'cost_based'
                  ? 'border-olive-600 bg-olive-50'
                  : 'border-beige-200 hover:border-olive-300'
              }`}
            >
              <DollarSign className="w-8 h-8 text-olive-600 mx-auto mb-3" />
              <p className="font-semibold text-slate-800">Cost-Based</p>
              <p className="text-sm text-slate-600 mt-1">Cover costs + margin</p>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, pricingStrategy: 'premium' })}
              className={`p-6 rounded-xl border-2 transition ${
                formData.pricingStrategy === 'premium'
                  ? 'border-olive-600 bg-olive-50'
                  : 'border-beige-200 hover:border-olive-300'
              }`}
            >
              <Award className="w-8 h-8 text-olive-600 mx-auto mb-3" />
              <p className="font-semibold text-slate-800">Premium</p>
              <p className="text-sm text-slate-600 mt-1">High-value positioning</p>
            </button>
          </div>
        </div>
      );

    case 6: // Q1.6: Competitors
      return (
        <div>
          <h3 className="text-2xl font-bold text-slate-800 mb-4">
            Do you have competitors or benchmark offerings in mind?
          </h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, hasCompetitors: true })}
                className={`flex-1 p-4 rounded-lg border-2 transition ${
                  formData.hasCompetitors
                    ? 'border-olive-600 bg-olive-50'
                    : 'border-beige-200 hover:border-olive-300'
                }`}
              >
                <p className="font-semibold text-slate-800">Yes</p>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, hasCompetitors: false, competitorLinks: '' })}
                className={`flex-1 p-4 rounded-lg border-2 transition ${
                  !formData.hasCompetitors
                    ? 'border-olive-600 bg-olive-50'
                    : 'border-beige-200 hover:border-olive-300'
                }`}
              >
                <p className="font-semibold text-slate-800">No</p>
              </button>
            </div>
            {formData.hasCompetitors && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Competitor links or names (optional)
                </label>
                <textarea
                  value={formData.competitorLinks}
                  onChange={(e) => setFormData({ ...formData, competitorLinks: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-olive-500"
                  rows={4}
                  placeholder="e.g., https://competitor1.com, Competitor Name 2"
                />
              </div>
            )}
          </div>
        </div>
      );

    case 7: // Q1.7: Review and category detection
      return (
        <div>
          <h3 className="text-2xl font-bold text-slate-800 mb-4">
            Review Your Business Context
          </h3>
          <div className="bg-beige-50 rounded-xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-olive-600 mt-0.5" />
              <div>
                <p className="font-medium text-slate-800">Offering Type</p>
                <p className="text-slate-600">{formData.offeringType || 'Not specified'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-olive-600 mt-0.5" />
              <div>
                <p className="font-medium text-slate-800">Medium</p>
                <p className="text-slate-600">{formData.medium || 'Not specified'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-olive-600 mt-0.5" />
              <div>
                <p className="font-medium text-slate-800">Business Entity</p>
                <p className="text-slate-600">{formData.businessEntity || 'Not specified'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-olive-600 mt-0.5" />
              <div>
                <p className="font-medium text-slate-800">Location & Market</p>
                <p className="text-slate-600">
                  {formData.location || 'Not specified'} • {formData.targetMarket || 'Not specified'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-olive-600 mt-0.5" />
              <div>
                <p className="font-medium text-slate-800">Pricing Strategy</p>
                <p className="text-slate-600">{formData.pricingStrategy?.replace('_', ' ') || 'Not specified'}</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-slate-500 mt-4 text-center">
            Click Next to continue to category-specific questions
          </p>
        </div>
      );

    default:
      return <div>Unknown question</div>;
  }
}

// ============================================================================
// STAGE 2: CATEGORY-SPECIFIC QUESTIONS
// ============================================================================

function renderStage2Questions(substage: number, formData: QuestionnaireState, setFormData: any) {
  // Route to appropriate category questions
  switch (formData.category) {
    case 'digital_product':
      return renderDigitalProductQuestions(substage, formData, setFormData);
    case 'physical_product':
      return renderPhysicalProductQuestions(substage, formData, setFormData);
    case 'digital_service':
      return renderDigitalServiceQuestions(substage, formData, setFormData);
    case 'physical_service':
      return renderPhysicalServiceQuestions(substage, formData, setFormData);
    default:
      return (
        <div className="text-center py-12">
          <h3 className="text-2xl font-bold text-slate-800 mb-4">
            Category-specific questions
          </h3>
          <p className="text-slate-600">
            Questions for {formData.category} will appear here
          </p>
        </div>
      );
  }
}

// ============================================================================
// DIGITAL PRODUCT QUESTIONS (10 questions)
// ============================================================================

function renderDigitalProductQuestions(substage: number, formData: QuestionnaireState, setFormData: any) {
  switch (substage) {
    case 0: // What category?
      return (
        <div>
          <h3 className="text-2xl font-bold text-slate-800 mb-4">
            What category is your digital product?
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {['Software', 'App', 'Plugin', 'Template', 'Course', 'Design Asset', 'Dataset', 'Ebook', 'Other'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFormData({ ...formData, digitalCategory: cat })}
                className={`p-4 rounded-lg border-2 transition ${
                  formData.digitalCategory === cat
                    ? 'border-olive-600 bg-olive-50'
                    : 'border-beige-200 hover:border-olive-300'
                }`}
              >
                <p className="font-semibold text-slate-800">{cat}</p>
              </button>
            ))}
          </div>
        </div>
      );

    case 1: // Detailed product description
      return (
        <div>
          <h3 className="text-2xl font-bold text-slate-800 mb-4">
            What does your {formData.digitalCategory || 'product'} do?
          </h3>
          <p className="text-slate-600 mb-4">
            Describe the main features, functionality, and what problem it solves
          </p>
          <textarea
            value={formData.uniqueValue}
            onChange={(e) => setFormData({ ...formData, uniqueValue: e.target.value })}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-olive-500 resize-none"
            rows={6}
            placeholder="Example for SaaS: 'Social media scheduling tool that helps businesses plan and automate posts across Twitter, LinkedIn, and Instagram. Key features: AI content suggestions, analytics dashboard, team collaboration, bulk scheduling. Solves the problem of time-consuming manual posting and inconsistent social media presence.'"
          />
          <div className="mt-4 bg-olive-50 border border-olive-200 rounded-lg p-4">
            <p className="text-sm text-olive-800">
              💡 <strong>Be specific!</strong> Include main features, target users, and the core problem you solve. This helps us understand your product's value.
            </p>
          </div>
        </div>
      );

    case 2: // Platform/Marketplace
      return (
        <div>
          <h3 className="text-2xl font-bold text-slate-800 mb-4">
            Where do you plan to sell it?
          </h3>
          <p className="text-slate-600 mb-4">Select all that apply</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {['AppSumo', 'Gumroad', 'Shopify', 'ProductHunt', 'Own Website', 'App Store', 'Play Store', 'Etsy', 'Other'].map((plat) => (
              <button
                key={plat}
                type="button"
                onClick={() => {
                  const current = formData.platform || '';
                  const platforms = current.split(',').filter(p => p.trim());
                  if (platforms.includes(plat)) {
                    setFormData({ ...formData, platform: platforms.filter(p => p !== plat).join(', ') });
                  } else {
                    setFormData({ ...formData, platform: [...platforms, plat].join(', ') });
                  }
                }}
                className={`p-3 rounded-lg border-2 transition ${
                  formData.platform?.includes(plat)
                    ? 'border-olive-600 bg-olive-50'
                    : 'border-beige-200 hover:border-olive-300'
                }`}
              >
                <p className="text-sm font-medium text-slate-800">{plat}</p>
              </button>
            ))}
          </div>
        </div>
      );

    case 3: // Development time
      return (
        <div>
          <h3 className="text-2xl font-bold text-slate-800 mb-4">
            How long did it take to develop/build?
          </h3>
          <div className="flex gap-4">
            <input
              type="number"
              value={formData.developmentTime.split(' ')[0] || ''}
              onChange={(e) => setFormData({ ...formData, developmentTime: `${e.target.value} ${formData.developmentTime.split(' ')[1] || 'months'}` })}
              className="w-32 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-olive-500"
              placeholder="6"
            />
            <select
              value={formData.developmentTime.split(' ')[1] || 'months'}
              onChange={(e) => setFormData({ ...formData, developmentTime: `${formData.developmentTime.split(' ')[0] || '1'} ${e.target.value}` })}
              className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-olive-500"
            >
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
              <option value="months">Months</option>
              <option value="years">Years</option>
            </select>
          </div>
        </div>
      );

    case 4: // Sales model
      return (
        <div>
          <h3 className="text-2xl font-bold text-slate-800 mb-4">
            What's your sales model?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { value: 'one_time', label: 'One-time Purchase', desc: 'Single payment, lifetime access' },
              { value: 'subscription', label: 'Subscription', desc: 'Recurring monthly/yearly payment' },
              { value: 'license', label: 'License', desc: 'Per-seat or usage-based licensing' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData({ ...formData, salesModel: option.value as any })}
                className={`p-6 rounded-xl border-2 transition text-left ${
                  formData.salesModel === option.value
                    ? 'border-olive-600 bg-olive-50'
                    : 'border-beige-200 hover:border-olive-300'
                }`}
              >
                <p className="font-semibold text-slate-800">{option.label}</p>
                <p className="text-sm text-slate-600 mt-1">{option.desc}</p>
              </button>
            ))}
          </div>
        </div>
      );

    case 5: // Updates & support
      return (
        <div>
          <h3 className="text-2xl font-bold text-slate-800 mb-4">
            Do you offer updates, support, or version control?
          </h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-4 bg-beige-50 rounded-lg border border-beige-200 cursor-pointer hover:bg-beige-100">
              <input
                type="checkbox"
                checked={formData.providesUpdates}
                onChange={(e) => setFormData({ ...formData, providesUpdates: e.target.checked })}
                className="w-5 h-5 text-olive-600 rounded focus:ring-olive-500"
              />
              <span className="text-slate-700 font-medium">Yes, I provide regular updates and support</span>
            </label>
          </div>
        </div>
      );

    case 6: // Recurring costs
      return (
        <div>
          <h3 className="text-2xl font-bold text-slate-800 mb-4">
            Do you incur any recurring costs?
          </h3>
          <p className="text-slate-600 mb-4">List servers, APIs, design tools, etc.</p>
          <textarea
            value={formData.recurringCosts}
            onChange={(e) => setFormData({ ...formData, recurringCosts: e.target.value })}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-olive-500 resize-none"
            rows={4}
            placeholder="e.g., AWS hosting $50/month, Stripe fees 2.9%, Design tools $30/month"
          />
        </div>
      );

    case 7: // Positioning
      return (
        <div>
          <h3 className="text-2xl font-bold text-slate-800 mb-4">
            How do you position your product?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { value: 'budget', label: 'Budget', desc: 'Affordable, accessible' },
              { value: 'mid_tier', label: 'Mid-Tier', desc: 'Balanced value' },
              { value: 'premium', label: 'Premium', desc: 'High-end, exclusive' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData({ ...formData, positioning: option.value as any })}
                className={`p-6 rounded-xl border-2 transition ${
                  formData.positioning === option.value
                    ? 'border-olive-600 bg-olive-50'
                    : 'border-beige-200 hover:border-olive-300'
                }`}
              >
                <p className="font-semibold text-slate-800">{option.label}</p>
                <p className="text-sm text-slate-600 mt-1">{option.desc}</p>
              </button>
            ))}
          </div>
        </div>
      );

    case 8: // Niche audience
      return (
        <div>
          <h3 className="text-2xl font-bold text-slate-800 mb-4">
            Who is your niche audience?
          </h3>
          <input
            type="text"
            value={formData.nicheAudience}
            onChange={(e) => setFormData({ ...formData, nicheAudience: e.target.value })}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-olive-500"
            placeholder="e.g., SaaS founders, Marketers, Designers, Students"
          />
        </div>
      );

    case 9: // Comparable products
      return (
        <div>
          <h3 className="text-2xl font-bold text-slate-800 mb-4">
            Do you have comparable products in the market?
          </h3>
          <p className="text-slate-600 mb-4">Provide URLs or product names for benchmarking</p>
          <textarea
            value={formData.comparableProducts}
            onChange={(e) => setFormData({ ...formData, comparableProducts: e.target.value })}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-olive-500 resize-none"
            rows={4}
            placeholder="e.g., https://competitor1.com/product, Similar Product Name"
          />
        </div>
      );

    case 10: // Features for tiered pricing (NEW - specific for SaaS)
      return (
        <div>
          <h3 className="text-2xl font-bold text-slate-800 mb-4">
            What are your main features?
          </h3>
          <p className="text-slate-600 mb-4">
            List the key features of your product (we'll help you organize them into pricing tiers)
          </p>
          <textarea
            value={formData.mainFeatures}
            onChange={(e) => setFormData({ ...formData, mainFeatures: e.target.value })}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-olive-500 resize-none"
            rows={8}
            placeholder="Example for SaaS:&#10;- AI content generation&#10;- Schedule up to 100 posts/month&#10;- Analytics dashboard&#10;- Team collaboration (5 users)&#10;- Instagram, Twitter, LinkedIn integration&#10;- Custom branding&#10;- Priority support&#10;- API access&#10;&#10;List all features - we'll help you decide which go in Free, Starter, Pro, and Enterprise tiers."
          />
          <div className="mt-4 bg-olive-50 border border-olive-200 rounded-lg p-4">
            <p className="text-sm text-olive-800">
              💡 <strong>Tip:</strong> List ALL features. We'll use AI to suggest which features belong in which pricing tier and what to charge for each tier.
            </p>
          </div>
        </div>
      );

    default:
      return <div>Unknown question</div>;
  }
}

// ============================================================================
// PHYSICAL PRODUCT QUESTIONS (12 questions)
// ============================================================================

function renderPhysicalProductQuestions(substage: number, formData: QuestionnaireState, setFormData: any) {
  // Placeholder for now - will implement next
  return (
    <div className="text-center py-12">
      <h3 className="text-2xl font-bold text-slate-800 mb-4">
        Physical Product Question {substage + 1}
      </h3>
      <p className="text-sm text-slate-500">
        (Physical product questions will be implemented here)
      </p>
    </div>
  );
}

// ============================================================================
// DIGITAL SERVICE QUESTIONS (12 questions)
// ============================================================================

function renderDigitalServiceQuestions(substage: number, formData: QuestionnaireState, setFormData: any) {
  // Placeholder for now
  return (
    <div className="text-center py-12">
      <h3 className="text-2xl font-bold text-slate-800 mb-4">
        Digital Service Question {substage + 1}
      </h3>
      <p className="text-sm text-slate-500">
        (Digital service questions will be implemented here)
      </p>
    </div>
  );
}

// ============================================================================
// PHYSICAL SERVICE QUESTIONS (10 questions)
// ============================================================================

function renderPhysicalServiceQuestions(substage: number, formData: QuestionnaireState, setFormData: any) {
  // Placeholder for now
  return (
    <div className="text-center py-12">
      <h3 className="text-2xl font-bold text-slate-800 mb-4">
        Physical Service Question {substage + 1}
      </h3>
      <p className="text-sm text-slate-500">
        (Physical service questions will be implemented here)
      </p>
    </div>
  );
}

// ============================================================================
// STAGE 3: EXPERIENCE & POSITIONING (6 questions - Universal)
// ============================================================================

function renderStage3Questions(substage: number, formData: QuestionnaireState, setFormData: any) {
  switch (substage) {
    case 0: // Q3.1: Years in field
      return (
        <div>
          <h3 className="text-2xl font-bold text-slate-800 mb-4">
            How long have you been in this field?
          </h3>
          <p className="text-slate-600 mb-6">
            Your experience level helps us adjust pricing recommendations
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {[
              { value: '0', label: 'Just Starting', desc: '< 1 year' },
              { value: '1-3', label: '1-3 Years', desc: 'Early stage' },
              { value: '3-5', label: '3-5 Years', desc: 'Established' },
              { value: '5-10', label: '5-10 Years', desc: 'Experienced' },
              { value: '10+', label: '10+ Years', desc: 'Expert' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData({ ...formData, yearsInField: option.value })}
                className={`p-4 rounded-lg border-2 transition ${
                  formData.yearsInField === option.value
                    ? 'border-olive-600 bg-olive-50'
                    : 'border-beige-200 hover:border-olive-300'
                }`}
              >
                <p className="font-semibold text-slate-800 text-sm">{option.label}</p>
                <p className="text-xs text-slate-600 mt-1">{option.desc}</p>
              </button>
            ))}
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Or enter specific years:
            </label>
            <input
              type="text"
              value={formData.yearsInField}
              onChange={(e) => setFormData({ ...formData, yearsInField: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-olive-500"
              placeholder="e.g., 7 years"
            />
          </div>
        </div>
      );

    case 1: // Q3.2: Skill level
      return (
        <div>
          <h3 className="text-2xl font-bold text-slate-800 mb-4">
            How do you describe your skill level?
          </h3>
          <p className="text-slate-600 mb-6">
            This affects the pricing multiplier we recommend
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { value: 'beginner', label: 'Beginner', desc: 'Learning and building portfolio', icon: '🌱' },
              { value: 'intermediate', label: 'Intermediate', desc: 'Proven track record', icon: '📈' },
              { value: 'expert', label: 'Expert', desc: 'Industry leader, specialized', icon: '⭐' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData({ ...formData, skillLevel: option.value as any })}
                className={`p-6 rounded-xl border-2 transition ${
                  formData.skillLevel === option.value
                    ? 'border-olive-600 bg-olive-50'
                    : 'border-beige-200 hover:border-olive-300'
                }`}
              >
                <div className="text-3xl mb-2">{option.icon}</div>
                <p className="font-semibold text-slate-800">{option.label}</p>
                <p className="text-sm text-slate-600 mt-1">{option.desc}</p>
              </button>
            ))}
          </div>
        </div>
      );

    case 2: // Q3.3: Business stage
      return (
        <div>
          <h3 className="text-2xl font-bold text-slate-800 mb-4">
            What's your business stage?
          </h3>
          <p className="text-slate-600 mb-6">
            This helps us understand your market position
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { value: 'idea', label: 'Idea', desc: 'Planning phase', icon: '💡' },
              { value: 'launch', label: 'Launch', desc: 'Just started', icon: '🚀' },
              { value: 'growth', label: 'Growth', desc: 'Scaling up', icon: '📈' },
              { value: 'mature', label: 'Mature', desc: 'Established', icon: '🏆' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData({ ...formData, businessStage: option.value as any })}
                className={`p-6 rounded-xl border-2 transition ${
                  formData.businessStage === option.value
                    ? 'border-olive-600 bg-olive-50'
                    : 'border-beige-200 hover:border-olive-300'
                }`}
              >
                <div className="text-3xl mb-2">{option.icon}</div>
                <p className="font-semibold text-slate-800">{option.label}</p>
                <p className="text-xs text-slate-600 mt-1">{option.desc}</p>
              </button>
            ))}
          </div>
        </div>
      );

    case 3: // Q3.4: Current pricing method (OPTIONAL)
      return (
        <div>
          <h3 className="text-2xl font-bold text-slate-800 mb-4">
            What's your current pricing method? <span className="text-slate-500 font-normal text-lg">(Optional)</span>
          </h3>
          <p className="text-slate-600 mb-4">
            How do you currently determine your prices? Skip if you don't have a formal method yet.
          </p>
          <textarea
            value={formData.currentPricingMethod}
            onChange={(e) => setFormData({ ...formData, currentPricingMethod: e.target.value })}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-olive-500 resize-none"
            rows={4}
            placeholder="e.g., Cost + 30% margin, Match competitor prices, Hourly rate × estimated hours, or leave blank if no formal method yet"
          />
        </div>
      );

    case 4: // Q3.5: Portfolio/testimonials
      return (
        <div>
          <h3 className="text-2xl font-bold text-slate-800 mb-4">
            Do you have testimonials, case studies, or portfolio samples?
          </h3>
          <p className="text-slate-600 mb-6">
            Social proof can justify premium pricing
          </p>
          <div className="space-y-4">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, hasPortfolio: true })}
                className={`flex-1 p-4 rounded-lg border-2 transition ${
                  formData.hasPortfolio
                    ? 'border-olive-600 bg-olive-50'
                    : 'border-beige-200 hover:border-olive-300'
                }`}
              >
                <p className="font-semibold text-slate-800">Yes</p>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, hasPortfolio: false })}
                className={`flex-1 p-4 rounded-lg border-2 transition ${
                  !formData.hasPortfolio
                    ? 'border-olive-600 bg-olive-50'
                    : 'border-beige-200 hover:border-olive-300'
                }`}
              >
                <p className="font-semibold text-slate-800">No</p>
              </button>
            </div>
            {formData.hasPortfolio && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Portfolio/testimonial links (optional)
                </label>
                <textarea
                  value={formData.biggestChallenge}
                  onChange={(e) => setFormData({ ...formData, biggestChallenge: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-olive-500 resize-none"
                  rows={3}
                  placeholder="Paste URLs to your portfolio, testimonials, or case studies"
                />
              </div>
            )}
          </div>
        </div>
      );

    case 5: // Q3.6: Biggest pricing challenge
      return (
        <div>
          <h3 className="text-2xl font-bold text-slate-800 mb-4">
            What's your biggest challenge in pricing right now?
          </h3>
          <p className="text-slate-600 mb-6">
            This helps us provide targeted recommendations
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {[
              { value: 'competition', label: 'Too much competition', icon: '👥' },
              { value: 'cost', label: 'Calculating costs accurately', icon: '💰' },
              { value: 'perception', label: 'Perceived value vs price', icon: '🎯' },
              { value: 'uncertainty', label: 'Market uncertainty', icon: '❓' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData({ ...formData, biggestChallenge: option.value })}
                className={`p-4 rounded-lg border-2 transition text-left ${
                  formData.biggestChallenge === option.value
                    ? 'border-olive-600 bg-olive-50'
                    : 'border-beige-200 hover:border-olive-300'
                }`}
              >
                <span className="text-2xl mr-2">{option.icon}</span>
                <span className="font-medium text-slate-800">{option.label}</span>
              </button>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Or describe your challenge:
            </label>
            <textarea
              value={formData.biggestChallenge}
              onChange={(e) => setFormData({ ...formData, biggestChallenge: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-olive-500 resize-none"
              rows={3}
              placeholder="Describe your specific pricing challenge..."
            />
          </div>
        </div>
      );

    default:
      return <div>Unknown question</div>;
  }
}

function renderStage4Questions(substage: number, formData: QuestionnaireState, setFormData: any) {
  switch (substage) {
    case 0: // Q4.1: Pricing priority
      return (
        <div>
          <h3 className="text-2xl font-bold text-slate-800 mb-4">
            What should the system prioritize?
          </h3>
          <p className="text-slate-600 mb-6">
            This determines how we optimize your pricing recommendation
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, pricingPriority: 'affordable' })}
              className={`p-6 rounded-xl border-2 transition ${
                formData.pricingPriority === 'affordable'
                  ? 'border-olive-600 bg-olive-50'
                  : 'border-beige-200 hover:border-olive-300'
              }`}
            >
              <DollarSign className="w-8 h-8 text-olive-600 mx-auto mb-3" />
              <p className="font-semibold text-slate-800">Affordable</p>
              <p className="text-sm text-slate-600 mt-1">Competitive, accessible pricing</p>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, pricingPriority: 'profit_optimized' })}
              className={`p-6 rounded-xl border-2 transition ${
                formData.pricingPriority === 'profit_optimized'
                  ? 'border-olive-600 bg-olive-50'
                  : 'border-beige-200 hover:border-olive-300'
              }`}
            >
              <TrendingUp className="w-8 h-8 text-olive-600 mx-auto mb-3" />
              <p className="font-semibold text-slate-800">Profit-Optimized</p>
              <p className="text-sm text-slate-600 mt-1">Maximum profitability</p>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, pricingPriority: 'competitive' })}
              className={`p-6 rounded-xl border-2 transition ${
                formData.pricingPriority === 'competitive'
                  ? 'border-olive-600 bg-olive-50'
                  : 'border-beige-200 hover:border-olive-300'
              }`}
            >
              <Users className="w-8 h-8 text-olive-600 mx-auto mb-3" />
              <p className="font-semibold text-slate-800">Competitive</p>
              <p className="text-sm text-slate-600 mt-1">Match market leaders</p>
            </button>
          </div>
        </div>
      );

    case 1: // Q4.2: Output detail level
      return (
        <div>
          <h3 className="text-2xl font-bold text-slate-800 mb-4">
            How detailed should your pricing report be?
          </h3>
          <p className="text-slate-600 mb-6">
            Choose the level of detail you need
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, outputDetail: 'detailed' })}
              className={`p-6 rounded-xl border-2 transition ${
                formData.outputDetail === 'detailed'
                  ? 'border-olive-600 bg-olive-50'
                  : 'border-beige-200 hover:border-olive-300'
              }`}
            >
              <FileText className="w-8 h-8 text-olive-600 mx-auto mb-3" />
              <p className="font-semibold text-slate-800">Detailed Breakdown</p>
              <p className="text-sm text-slate-600 mt-1">Complete cost analysis with reasoning</p>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, outputDetail: 'summarized' })}
              className={`p-6 rounded-xl border-2 transition ${
                formData.outputDetail === 'summarized'
                  ? 'border-olive-600 bg-olive-50'
                  : 'border-beige-200 hover:border-olive-300'
              }`}
            >
              <CheckCircle className="w-8 h-8 text-olive-600 mx-auto mb-3" />
              <p className="font-semibold text-slate-800">Summarized</p>
              <p className="text-sm text-slate-600 mt-1">Quick recommendation with key points</p>
            </button>
          </div>
        </div>
      );

    case 2: // Q4.3: Comparison preference
      return (
        <div>
          <h3 className="text-2xl font-bold text-slate-800 mb-4">
            Would you like to compare with similar profiles or top performers?
          </h3>
          <p className="text-slate-600 mb-6">
            See how your pricing compares to others in your field
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, wantsComparison: true })}
              className={`p-6 rounded-xl border-2 transition ${
                formData.wantsComparison
                  ? 'border-olive-600 bg-olive-50'
                  : 'border-beige-200 hover:border-olive-300'
              }`}
            >
              <Users className="w-8 h-8 text-olive-600 mx-auto mb-3" />
              <p className="font-semibold text-slate-800">Yes, show comparisons</p>
              <p className="text-sm text-slate-600 mt-1">Benchmark against similar profiles</p>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, wantsComparison: false })}
              className={`p-6 rounded-xl border-2 transition ${
                !formData.wantsComparison
                  ? 'border-olive-600 bg-olive-50'
                  : 'border-beige-200 hover:border-olive-300'
              }`}
            >
              <FileText className="w-8 h-8 text-olive-600 mx-auto mb-3" />
              <p className="font-semibold text-slate-800">No, just my pricing</p>
              <p className="text-sm text-slate-600 mt-1">Focus on my specific case</p>
            </button>
          </div>
        </div>
      );

    default:
      return <div>Unknown question</div>;
  }
}

