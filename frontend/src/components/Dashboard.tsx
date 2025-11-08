import { useState, useEffect } from 'react';
import { LogOut, Plus, History, Coins, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Consultation } from '../lib/supabase';
import { QuestionnaireForm } from './QuestionnaireForm';
import { CreditPurchase } from './CreditPurchase';
import { ConsultationResult } from './ConsultationResult';

type View = 'dashboard' | 'questionnaire' | 'result';

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

  const generatePricingRecommendation = (data: {
    businessType: string;
    targetMarket: string;
    productDescription: string;
    costToDeliver: string;
    competitorPricing: string;
    valueProposition: string;
  }) => {
    return `Based on your ${data.businessType} business targeting ${data.targetMarket}, here's our pricing recommendation:

PRICING STRATEGY:
Given your cost structure (${data.costToDeliver}) and competitive landscape (${data.competitorPricing}), we recommend a value-based pricing approach.

RECOMMENDED PRICE RANGE:
Consider positioning your offering in the premium segment of your market, reflecting the unique value you provide: ${data.valueProposition}

KEY CONSIDERATIONS:
1. Cost Coverage: Ensure your pricing covers all costs with a healthy margin
2. Market Positioning: Align with how you want to be perceived in ${data.targetMarket}
3. Value Delivery: Price should reflect the value you deliver, not just your costs
4. Competitive Landscape: Stay aware of ${data.competitorPricing} but don't race to the bottom

PRICING MODELS TO CONSIDER:
- Tiered pricing: Offer multiple levels to capture different customer segments
- Value-based: Price according to the value delivered to customers
- Freemium: Offer a free tier to acquire users, premium for advanced features
- Usage-based: Charge based on consumption or usage levels

NEXT STEPS:
1. Test your pricing with a small segment of customers
2. Monitor customer feedback and conversion rates
3. Be prepared to iterate based on market response
4. Consider offering early-bird discounts to gain initial traction

Remember: Pricing is not permanent. Start with a hypothesis and refine based on real market feedback.`;
  };

  const handleQuestionnaireSubmit = async (formData: {
    businessType: string;
    targetMarket: string;
    productDescription: string;
    costToDeliver: string;
    competitorPricing: string;
    valueProposition: string;
  }) => {
    if (!profile || profile.credits < 1) {
      setError('Insufficient credits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const recommendation = generatePricingRecommendation(formData);

      const { data: consultation, error: consultationError } = await supabase
        .from('consultations')
        .insert({
          user_id: profile.id,
          business_type: formData.businessType,
          target_market: formData.targetMarket,
          product_description: formData.productDescription,
          cost_to_deliver: formData.costToDeliver,
          competitor_pricing: formData.competitorPricing,
          value_proposition: formData.valueProposition,
          pricing_recommendation: recommendation,
        })
        .select()
        .single();

      if (consultationError) throw consultationError;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ credits: profile.credits - 1 })
        .eq('id', profile.id);

      if (updateError) throw updateError;

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

  const handleViewConsultation = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setView('result');
  };

  const handleStartNewConsultation = () => {
    if (!profile || profile.credits < 1) {
      setShowPurchase(true);
      return;
    }
    setView('questionnaire');
  };

  if (view === 'result' && selectedConsultation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-beige-50 to-beige-100 p-4 py-8">
        <ConsultationResult
          consultation={selectedConsultation}
          onBack={() => {
            setView('dashboard');
            setSelectedConsultation(null);
          }}
        />
      </div>
    );
  }

  if (view === 'questionnaire') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-beige-50 to-beige-100 p-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
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

          <QuestionnaireForm onSubmit={handleQuestionnaireSubmit} loading={loading} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-50 to-beige-100">
      <nav className="bg-white shadow-sm border-b border-beige-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-olive-600 p-2 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">PriceWise</h1>
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
              className="p-2 text-slate-600 hover:text-slate-800 transition"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
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
    </div>
  );
}
