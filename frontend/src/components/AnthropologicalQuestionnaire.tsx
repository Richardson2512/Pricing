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
    // Determine category after Stage 1
    if (stage === 1 && substage === 6) {
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
    } else if (stage === 4 && substage < 3) {
      setSubstage(substage + 1);
    } else if (stage === 1 && substage < 6) {
      setSubstage(substage + 1);
    }
  };

  const handleBack = () => {
    if (substage > 0) {
      setSubstage(substage - 1);
    } else if (stage > 1) {
      setStage(stage - 1);
      setSubstage(stage === 2 ? 6 : 0);
    }
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const getMaxSubstagesForCategory = (): number => {
    switch (formData.category) {
      case 'physical_product': return 11;
      case 'digital_product': return 9;
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
    const stage1Questions = 7;
    const stage2Questions = getMaxSubstagesForCategory() + 1;
    const stage3Questions = 6;
    const stage4Questions = 4;
    const totalQuestions = stage1Questions + stage2Questions + stage3Questions + stage4Questions;
    
    let answeredQuestions = 0;
    if (stage > 1) answeredQuestions += stage1Questions;
    if (stage > 2) answeredQuestions += stage2Questions;
    if (stage > 3) answeredQuestions += stage3Questions;
    if (stage === 4) answeredQuestions += substage + 1;
    else if (stage === 3) answeredQuestions += stage1Questions + stage2Questions + substage + 1;
    else if (stage === 2) answeredQuestions += stage1Questions + substage + 1;
    else answeredQuestions += substage + 1;
    
    return Math.round((answeredQuestions / totalQuestions) * 100);
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
        <div className="mb-6 flex items-center justify-center gap-3 bg-olive-50 border border-olive-200 rounded-xl p-4">
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

          {stage === 4 && substage === 3 ? (
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

// Helper function to render Stage 1 questions
function renderStage1Questions(
  substage: number,
  formData: QuestionnaireState,
  setFormData: React.Dispatch<React.SetStateAction<QuestionnaireState>>
) {
  // Implementation continues in next part...
  return <div>Stage 1 Question {substage + 1}</div>;
}

// Helper functions for other stages...
function renderStage2Questions(substage: number, formData: QuestionnaireState, setFormData: any) {
  return <div>Stage 2 Question {substage + 1} for {formData.category}</div>;
}

function renderStage3Questions(substage: number, formData: QuestionnaireState, setFormData: any) {
  return <div>Stage 3 Question {substage + 1}</div>;
}

function renderStage4Questions(substage: number, formData: QuestionnaireState, setFormData: any) {
  return <div>Stage 4 Question {substage + 1}</div>;
}

