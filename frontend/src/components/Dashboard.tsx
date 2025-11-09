import { useState, useEffect } from 'react';
import { LogOut, Plus, History, Coins, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Consultation } from '../lib/supabase';
import { PricingIntakeSelector } from './PricingIntakeSelector';
import { AnthropologicalQuestionnaire } from './AnthropologicalQuestionnaire';
import { DocumentUploadFlow } from './DocumentUploadFlow';
import { CreditPurchase } from './CreditPurchase';
import { PricingAnalysisResult } from './PricingAnalysisResult';
import { Footer } from './Footer';
import { buildApiUrl, fetchWithTimeout, API_CONFIG } from '../config/api';

type View = 'dashboard' | 'intake-selector' | 'questionnaire' | 'document-upload' | 'result';

export function Dashboard() {
  const { profile, signOut, refreshProfile } = useAuth();
  const [view, setView] = useState<View>('dashboard');
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [showPurchase, setShowPurchase] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    if (!profile) return;

    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });

    if (data) {
      setConsultations(data);
    }
  };

  // API endpoint for backend (now centralized)
  const API_URL = API_CONFIG.BACKEND_URL;

  const handleQuestionnaireSubmit = async (formData: any) => {
    if (!profile || profile.credits < 1) {
      setError('Insufficient credits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      // Transform anthropological questionnaire data to backend format
      const transformedData = {
        businessType: formData.medium || 'digital', // 'physical' or 'digital'
        offeringType: formData.offeringType || 'product', // 'product' or 'service'
        experienceLevel: formData.skillLevel || 'intermediate', // 'beginner', 'intermediate', 'expert'
        region: formData.location || 'Global',
        niche: formData.digitalCategory || formData.serviceType || formData.productType || '',
        // Map pricingStrategy to backend enum values
        pricingGoal: formData.pricingStrategy === 'cost_based' ? 'cost_plus' : (formData.pricingStrategy || 'market_rate'), // 'cost_plus', 'market_rate', 'premium'
        
        // Construct detailed descriptions from questionnaire data
        productDescription: buildProductDescription(formData),
        costToDeliver: buildCostToDeliver(formData),
        competitorPricing: formData.comparableProducts || formData.competitorLinks || 'No specific competitors mentioned',
        valueProposition: formData.uniqueValue || 'To be determined',
        
        // Additional metadata
        preferredCurrency: formData.preferredCurrency || 'USD',
        businessEntity: formData.businessEntity,
        targetMarket: formData.targetMarket,
        yearsInField: formData.yearsInField,
        businessStage: formData.businessStage,
        pricingPriority: formData.pricingPriority,
        outputDetail: formData.outputDetail,
        wantsComparison: formData.wantsComparison,
        
        // Include pre-analyzed data if available (from background analysis)
        usePreAnalyzedData: formData.preAnalysisData ? true : false,
        preAnalyzedMarketData: formData.preAnalysisData?.marketData || null,
      };

      console.log('📤 Submitting consultation request');
      console.log('📊 Full transformed data:', transformedData);
      console.log('🔄 Pre-analysis data available:', formData.preAnalysisData ? 'YES ✅' : 'NO - will scrape now');

      // Call backend API to generate pricing with DeepSeek
      const response = await fetch(`${API_URL}/api/consultations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(transformedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Backend error:', errorData);
        
        // Show detailed validation errors if available
        if (errorData.details) {
          console.error('Validation errors:', errorData.details);
          const validationErrors = errorData.details.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
          throw new Error(`Validation failed: ${validationErrors}`);
        }
        
        throw new Error(errorData.error || 'Failed to generate pricing');
      }

      const { consultation } = await response.json();

      await refreshProfile();
      await fetchConsultations();

      setSelectedConsultation(consultation);
      setView('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to build product description from questionnaire
  const buildProductDescription = (data: any): string => {
    let desc = '';
    
    // Start with the actual product description (most important!)
    if (data.uniqueValue) {
      desc += `PRODUCT DESCRIPTION:\n${data.uniqueValue}\n\n`;
    }
    
    // Add category and type
    desc += `TYPE: ${data.medium || 'Digital'} ${data.offeringType || 'product'}. `;
    
    if (data.digitalCategory) {
      desc += `Category: ${data.digitalCategory}. `;
    }
    
    // Add features list if provided
    if (data.comparableProducts && data.comparableProducts.includes('-')) {
      desc += `\n\nFEATURES:\n${data.comparableProducts}\n\n`;
    }
    
    if (data.platform) {
      desc += `Platforms: ${data.platform}. `;
    }
    if (data.developmentTime) {
      desc += `Development time: ${data.developmentTime}. `;
    }
    if (data.salesModel) {
      desc += `Sales model: ${data.salesModel}. `;
    }
    if (data.nicheAudience) {
      desc += `Target audience: ${data.nicheAudience}. `;
    }
    if (data.positioning) {
      desc += `Market positioning: ${data.positioning}. `;
    }
    if (data.businessEntity) {
      desc += `Business type: ${data.businessEntity}. `;
    }
    
    // Ensure we always return something meaningful
    if (!desc || desc.length < 50) {
      desc = `${data.medium || 'Digital'} ${data.offeringType || 'product'} in ${data.location || 'global market'}. Business stage: ${data.businessStage || 'launch'}. Experience level: ${data.skillLevel || 'intermediate'}. Category: ${data.digitalCategory || 'General'}.`;
    }
    
    return desc;
  };

  // Helper function to build cost breakdown
  const buildCostToDeliver = (data: any): string => {
    let cost = '';
    
    if (data.recurringCosts) {
      cost += `Recurring costs: ${data.recurringCosts}. `;
    }
    if (data.developmentTime) {
      cost += `Development investment: ${data.developmentTime}. `;
    }
    if (data.providesUpdates) {
      cost += `Includes ongoing updates and support. `;
    }
    if (data.yearsInField) {
      cost += `Experience: ${data.yearsInField} years. `;
    }
    if (data.currentPricingMethod) {
      cost += `Current method: ${data.currentPricingMethod}. `;
    }
    
    // Ensure we always return something meaningful
    if (!cost || cost.length < 10) {
      cost = `Experience level: ${data.skillLevel || 'intermediate'}. Business stage: ${data.businessStage || 'launch'}. Pricing goal: ${data.pricingStrategy || 'market_rate'}.`;
    }
    
    return cost;
  };

  const handleViewConsultation = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setView('result');
  };

  const handleStartNewConsultation = () => {
    if (!profile || profile.credits < 1) {
      setShowPurchase(true);
      return;
    }
    setView('intake-selector');
  };

  const handleDocumentSubmit = async (files: File[]) => {
    if (!profile || profile.credits < 1) {
      setError('Insufficient credits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      // Upload files to Supabase storage
      const uploadedFilePaths: string[] = [];
      
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${profile.id}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, file);

        if (uploadError) throw uploadError;
        
        uploadedFilePaths.push(fileName);
      }

      // Call backend API to parse documents and generate pricing
      const response = await fetch(`${API_URL}/api/consultations/document`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          filePaths: uploadedFilePaths,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to parse documents and generate pricing');
      }

      const { consultation } = await response.json();

      await refreshProfile();
      await fetchConsultations();

      setSelectedConsultation(consultation);
      setView('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (view === 'result' && selectedConsultation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-beige-50 to-beige-100 p-4 py-8">
        <PricingAnalysisResult
          consultation={selectedConsultation}
          onBack={() => {
            setView('dashboard');
            setSelectedConsultation(null);
          }}
        />
      </div>
    );
  }

  if (view === 'intake-selector') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-beige-50 to-beige-100 p-4 py-8">
        <PricingIntakeSelector
          onSelect={(method) => {
            if (method === 'manual') {
              setView('questionnaire');
            } else {
              setView('document-upload');
            }
          }}
        />
      </div>
    );
  }

  if (view === 'document-upload') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-beige-50 to-beige-100 p-4 py-8">
        <DocumentUploadFlow
          onBack={() => setView('intake-selector')}
          onSubmit={handleDocumentSubmit}
          loading={loading}
        />
        {error && (
          <div className="max-w-4xl mx-auto mt-4 bg-red-50 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
      </div>
    );
  }

  if (view === 'questionnaire') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-beige-50 to-beige-100 p-4 py-8">
        {/* Logo button at top left */}
        <div className="max-w-4xl mx-auto mb-4">
          <button
            onClick={() => setView('dashboard')}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition border border-beige-200 hover:border-olive-300"
            title="Return to Dashboard"
          >
            <img 
              src="/logo.png" 
              alt="HowMuchShouldIPrice Logo" 
              className="w-6 h-6 object-contain"
            />
            <span className="text-sm font-medium text-slate-700">Dashboard</span>
          </button>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <button
                onClick={() => setView('intake-selector')}
                className="text-slate-600 hover:text-slate-800 mb-4 transition flex items-center gap-2"
              >
                ← Back to selection
              </button>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Price Your Product</h1>
              <p className="text-slate-600">Answer these questions to get your AI-powered pricing recommendation</p>
            </div>
            <button
              onClick={() => setView('dashboard')}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 transition"
            >
              Cancel
            </button>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <AnthropologicalQuestionnaire 
            onSubmit={handleQuestionnaireSubmit} 
            loading={loading}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-50 to-beige-100">
      <nav className="bg-white shadow-sm border-b border-beige-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="HowMuchShouldIPrice Logo" 
              className="w-10 h-10 object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold text-slate-800">HowMuchShouldIPrice</h1>
              {profile?.first_name && (
                <p className="text-sm text-slate-600">
                  Welcome, {profile.first_name}!
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-beige-100 px-4 py-2 rounded-lg border border-beige-200">
              <Coins className="w-5 h-5 text-olive-600" />
              <span className="font-semibold text-olive-900">{profile?.credits || 0} credits</span>
            </div>
            <button
              onClick={() => setShowPurchase(true)}
              className="px-4 py-2 bg-olive-600 text-white rounded-lg hover:bg-olive-700 transition font-medium"
            >
              Buy Credits
            </button>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <button
            onClick={handleStartNewConsultation}
            className="w-full bg-gradient-to-r from-olive-600 to-olive-700 text-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition group"
          >
            <div className="flex items-center justify-center gap-4">
              <div className="bg-white bg-opacity-20 p-4 rounded-xl group-hover:scale-110 transition">
                <Plus className="w-8 h-8" />
              </div>
              <div className="text-left">
                <h2 className="text-2xl font-bold mb-1">Check Your Product Pricing</h2>
                <p className="text-beige-100">Get AI-powered pricing recommendations for your product or service</p>
              </div>
            </div>
          </button>
        </div>

        {consultations.length > 0 ? (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <History className="w-6 h-6 text-slate-600" />
              <h2 className="text-2xl font-bold text-slate-800">Pricing History</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {consultations.map((consultation) => (
                <div
                  key={consultation.id}
                  onClick={() => handleViewConsultation(consultation)}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition cursor-pointer border border-slate-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800 mb-1">
                        {consultation.business_type}
                      </h3>
                      <p className="text-sm text-slate-600">{consultation.target_market}</p>
                    </div>
                  </div>

                  <p className="text-slate-700 text-sm mb-4 line-clamp-2">
                    {consultation.product_description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>
                      {new Date(consultation.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="text-olive-600 font-medium">View details →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-slate-200">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <History className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No pricing checks yet</h3>
            <p className="text-slate-600">Check your first product pricing to get AI-powered recommendations</p>
          </div>
        )}
      </main>

      {showPurchase && <CreditPurchase onClose={() => setShowPurchase(false)} />}
      
      <Footer />
    </div>
  );
}
