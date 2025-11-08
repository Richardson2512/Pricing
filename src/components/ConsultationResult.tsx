import { Check, Calendar, ArrowLeft } from 'lucide-react';
import { Consultation } from '../lib/supabase';

type ConsultationResultProps = {
  consultation: Consultation;
  onBack: () => void;
};

export function ConsultationResult({ consultation, onBack }: ConsultationResultProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6 transition"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Dashboard
      </button>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-xl">
              <Check className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Your Pricing Recommendation</h2>
              <div className="flex items-center gap-2 text-blue-100 mt-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">{formatDate(consultation.created_at)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-bold text-blue-900 mb-4">Recommended Pricing Strategy</h3>
            <div className="prose max-w-none text-slate-700 whitespace-pre-wrap">
              {consultation.pricing_recommendation}
            </div>
          </div>

          <div className="space-y-6">
            <div className="border-l-4 border-blue-500 pl-6">
              <h4 className="font-semibold text-slate-800 mb-2">Business Type</h4>
              <p className="text-slate-600">{consultation.business_type}</p>
            </div>

            <div className="border-l-4 border-blue-500 pl-6">
              <h4 className="font-semibold text-slate-800 mb-2">Target Market</h4>
              <p className="text-slate-600">{consultation.target_market}</p>
            </div>

            <div className="border-l-4 border-blue-500 pl-6">
              <h4 className="font-semibold text-slate-800 mb-2">Product/Service Description</h4>
              <p className="text-slate-600">{consultation.product_description}</p>
            </div>

            <div className="border-l-4 border-blue-500 pl-6">
              <h4 className="font-semibold text-slate-800 mb-2">Cost to Deliver</h4>
              <p className="text-slate-600">{consultation.cost_to_deliver}</p>
            </div>

            <div className="border-l-4 border-blue-500 pl-6">
              <h4 className="font-semibold text-slate-800 mb-2">Competitor Pricing</h4>
              <p className="text-slate-600">{consultation.competitor_pricing}</p>
            </div>

            <div className="border-l-4 border-blue-500 pl-6">
              <h4 className="font-semibold text-slate-800 mb-2">Unique Value Proposition</h4>
              <p className="text-slate-600">{consultation.value_proposition}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
