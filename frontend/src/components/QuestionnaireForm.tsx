import { useState } from 'react';
import { FileText, TrendingUp, Users, DollarSign, Target, Sparkles } from 'lucide-react';

type QuestionnaireData = {
  businessType: string;
  targetMarket: string;
  productDescription: string;
  costToDeliver: string;
  competitorPricing: string;
  valueProposition: string;
};

type QuestionnaireFormProps = {
  onSubmit: (data: QuestionnaireData) => void;
  loading: boolean;
};

export function QuestionnaireForm({ onSubmit, loading }: QuestionnaireFormProps) {
  const [formData, setFormData] = useState<QuestionnaireData>({
    businessType: '',
    targetMarket: '',
    productDescription: '',
    costToDeliver: '',
    competitorPricing: '',
    valueProposition: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const questions = [
    {
      id: 'businessType',
      label: 'What type of business are you in?',
      placeholder: 'e.g., SaaS, E-commerce, Service, Product...',
      icon: FileText,
      description: 'Help us understand your business model',
    },
    {
      id: 'targetMarket',
      label: 'Who is your target market?',
      placeholder: 'e.g., Small businesses, Enterprises, Consumers...',
      icon: Users,
      description: 'Define your ideal customer segment',
    },
    {
      id: 'productDescription',
      label: 'Describe your product or service',
      placeholder: 'What problem does it solve? What are the key features?',
      icon: Sparkles,
      description: 'Tell us what makes your offering unique',
      multiline: true,
    },
    {
      id: 'costToDeliver',
      label: 'What does it cost you to deliver?',
      placeholder: 'e.g., $50 per unit, $100/month in expenses...',
      icon: DollarSign,
      description: 'Include all direct costs and overhead',
    },
    {
      id: 'competitorPricing',
      label: 'How do competitors price similar offerings?',
      placeholder: 'e.g., $99-199/month, $500 one-time...',
      icon: TrendingUp,
      description: 'Research your competitive landscape',
    },
    {
      id: 'valueProposition',
      label: 'What unique value do you provide?',
      placeholder: 'Why would customers choose you over competitors?',
      icon: Target,
      description: 'Highlight your competitive advantages',
      multiline: true,
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {questions.map((question) => {
        const Icon = question.icon;
        return (
          <div key={question.id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-start gap-4">
              <div className="bg-beige-100 p-3 rounded-lg flex-shrink-0">
                <Icon className="w-5 h-5 text-olive-600" />
              </div>
              <div className="flex-1">
                <label className="block text-lg font-semibold text-slate-800 mb-1">
                  {question.label}
                </label>
                <p className="text-sm text-slate-600 mb-3">{question.description}</p>
                {question.multiline ? (
                  <textarea
                    value={formData[question.id as keyof QuestionnaireData]}
                    onChange={(e) => setFormData({ ...formData, [question.id]: e.target.value })}
                    placeholder={question.placeholder}
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent transition resize-none"
                    required
                  />
                ) : (
                  <input
                    type="text"
                    value={formData[question.id as keyof QuestionnaireData]}
                    onChange={(e) => setFormData({ ...formData, [question.id]: e.target.value })}
                    placeholder={question.placeholder}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent transition"
                    required
                  />
                )}
              </div>
            </div>
          </div>
        );
      })}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-olive-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-olive-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
      >
        {loading ? 'Analyzing...' : 'Get Pricing Recommendation'}
      </button>
    </form>
  );
}
