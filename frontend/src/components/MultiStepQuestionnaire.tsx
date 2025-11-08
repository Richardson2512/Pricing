import { useState } from 'react';
import { ArrowRight, ArrowLeft, Upload, FileText, X } from 'lucide-react';

type QuestionnaireData = {
  businessType: 'digital' | 'physical' | '';
  offeringType: 'product' | 'service' | '';
  experienceLevel: 'beginner' | 'intermediate' | 'expert' | '';
  region: string;
  niche: string;
  pricingGoal: 'cost_plus' | 'market_rate' | 'premium' | '';
  productDescription: string;
  costToDeliver: string;
  competitorPricing: string;
  valueProposition: string;
  files: File[];
};

type MultiStepQuestionnaireProps = {
  onSubmit: (data: QuestionnaireData) => void;
  loading: boolean;
};

export function MultiStepQuestionnaire({ onSubmit, loading }: MultiStepQuestionnaireProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<QuestionnaireData>({
    businessType: '',
    offeringType: '',
    experienceLevel: '',
    region: '',
    niche: '',
    pricingGoal: '',
    productDescription: '',
    costToDeliver: '',
    competitorPricing: '',
    valueProposition: '',
    files: [],
  });

  const totalSteps = formData.businessType === 'digital' && formData.offeringType === 'service' ? 5 : 4;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormData({ ...formData, files: [...formData.files, ...newFiles] });
    }
  };

  const removeFile = (index: number) => {
    const newFiles = formData.files.filter((_, i) => i !== index);
    setFormData({ ...formData, files: newFiles });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.businessType && formData.offeringType;
      case 2:
        return formData.experienceLevel && formData.region;
      case 3:
        return formData.productDescription && formData.costToDeliver;
      case 4:
        return formData.competitorPricing && formData.valueProposition;
      case 5:
        return true; // File upload is optional
      default:
        return false;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Progress Bar */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-beige-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">Step {step} of {totalSteps}</span>
          <span className="text-sm text-slate-600">{Math.round((step / totalSteps) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-beige-200 rounded-full h-2">
          <div
            className="bg-olive-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: Business & Offering Type */}
      {step === 1 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-beige-200 space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-slate-800 mb-4">What type of business are you in?</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, businessType: 'digital' })}
                className={`p-6 rounded-xl border-2 transition ${
                  formData.businessType === 'digital'
                    ? 'border-olive-600 bg-olive-50'
                    : 'border-beige-200 hover:border-olive-300'
                }`}
              >
                <div className="text-4xl mb-2">💻</div>
                <div className="font-semibold text-slate-800">Digital</div>
                <div className="text-sm text-slate-600">Software, apps, online services</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, businessType: 'physical' })}
                className={`p-6 rounded-xl border-2 transition ${
                  formData.businessType === 'physical'
                    ? 'border-olive-600 bg-olive-50'
                    : 'border-beige-200 hover:border-olive-300'
                }`}
              >
                <div className="text-4xl mb-2">📦</div>
                <div className="font-semibold text-slate-800">Physical</div>
                <div className="text-sm text-slate-600">Products, goods, materials</div>
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-slate-800 mb-4">What are you offering?</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, offeringType: 'product' })}
                className={`p-6 rounded-xl border-2 transition ${
                  formData.offeringType === 'product'
                    ? 'border-olive-600 bg-olive-50'
                    : 'border-beige-200 hover:border-olive-300'
                }`}
              >
                <div className="text-4xl mb-2">🎁</div>
                <div className="font-semibold text-slate-800">Product</div>
                <div className="text-sm text-slate-600">Tangible or digital goods</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, offeringType: 'service' })}
                className={`p-6 rounded-xl border-2 transition ${
                  formData.offeringType === 'service'
                    ? 'border-olive-600 bg-olive-50'
                    : 'border-beige-200 hover:border-olive-300'
                }`}
              >
                <div className="text-4xl mb-2">⚙️</div>
                <div className="font-semibold text-slate-800">Service</div>
                <div className="text-sm text-slate-600">Work, consulting, freelancing</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Experience & Region */}
      {step === 2 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-beige-200 space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-slate-800 mb-4">What's your experience level?</h3>
            <div className="grid grid-cols-3 gap-4">
              {['beginner', 'intermediate', 'expert'].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormData({ ...formData, experienceLevel: level as any })}
                  className={`p-6 rounded-xl border-2 transition ${
                    formData.experienceLevel === level
                      ? 'border-olive-600 bg-olive-50'
                      : 'border-beige-200 hover:border-olive-300'
                  }`}
                >
                  <div className="font-semibold text-slate-800 capitalize">{level}</div>
                  <div className="text-sm text-slate-600 mt-1">
                    {level === 'beginner' && '0-2 years'}
                    {level === 'intermediate' && '2-5 years'}
                    {level === 'expert' && '5+ years'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-lg font-semibold text-slate-800 mb-3">
              Region / Market
            </label>
            <input
              type="text"
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              placeholder="e.g., India, USA, Europe, Southeast Asia"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent transition"
              required
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-slate-800 mb-3">
              Niche / Industry (Optional)
            </label>
            <input
              type="text"
              value={formData.niche}
              onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
              placeholder="e.g., SaaS, E-commerce, Healthcare, Education"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-slate-800 mb-3">
              Pricing Goal
            </label>
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: 'cost_plus', label: 'Cost Plus', desc: 'Cover costs + margin' },
                { value: 'market_rate', label: 'Market Rate', desc: 'Match competition' },
                { value: 'premium', label: 'Premium', desc: 'High-end positioning' },
              ].map((goal) => (
                <button
                  key={goal.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, pricingGoal: goal.value as any })}
                  className={`p-4 rounded-xl border-2 transition ${
                    formData.pricingGoal === goal.value
                      ? 'border-olive-600 bg-olive-50'
                      : 'border-beige-200 hover:border-olive-300'
                  }`}
                >
                  <div className="font-semibold text-slate-800 text-sm">{goal.label}</div>
                  <div className="text-xs text-slate-600 mt-1">{goal.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Product Details */}
      {step === 3 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-beige-200 space-y-6">
          <div>
            <label className="block text-lg font-semibold text-slate-800 mb-3">
              Describe your {formData.offeringType || 'offering'}
            </label>
            <p className="text-sm text-slate-600 mb-3">
              What problem does it solve? What are the key features or deliverables?
            </p>
            <textarea
              value={formData.productDescription}
              onChange={(e) => setFormData({ ...formData, productDescription: e.target.value })}
              placeholder="e.g., I create custom UI/UX designs for mobile apps with 3 screens, interactive prototype, and design system..."
              rows={5}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent transition resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-slate-800 mb-3">
              What does it cost you to deliver?
            </label>
            <p className="text-sm text-slate-600 mb-3">
              Include tools, materials, time, overhead, and any other costs
            </p>
            <textarea
              value={formData.costToDeliver}
              onChange={(e) => setFormData({ ...formData, costToDeliver: e.target.value })}
              placeholder="e.g., Figma Pro $12/month, 20 hours of work at $25/hr, stock photos $50..."
              rows={4}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent transition resize-none"
              required
            />
          </div>
        </div>
      )}

      {/* Step 4: Market & Competition */}
      {step === 4 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-beige-200 space-y-6">
          <div>
            <label className="block text-lg font-semibold text-slate-800 mb-3">
              How do competitors price similar offerings?
            </label>
            <p className="text-sm text-slate-600 mb-3">
              Share what you've seen on Fiverr, Upwork, Etsy, or other platforms
            </p>
            <textarea
              value={formData.competitorPricing}
              onChange={(e) => setFormData({ ...formData, competitorPricing: e.target.value })}
              placeholder="e.g., I see similar designs ranging from $500-$2000 on Fiverr, with most sellers around $800-$1200..."
              rows={4}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent transition resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-slate-800 mb-3">
              What unique value do you provide?
            </label>
            <p className="text-sm text-slate-600 mb-3">
              Why would customers choose you over competitors?
            </p>
            <textarea
              value={formData.valueProposition}
              onChange={(e) => setFormData({ ...formData, valueProposition: e.target.value })}
              placeholder="e.g., 10+ years experience, unlimited revisions, 24-hour turnaround, specialized in healthcare apps..."
              rows={4}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent transition resize-none"
              required
            />
          </div>
        </div>
      )}

      {/* Step 5: File Upload (for digital service freelancers) */}
      {step === 5 && formData.businessType === 'digital' && formData.offeringType === 'service' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-beige-200 space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-slate-800 mb-3">
              Upload Documents (Optional)
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Upload your Statement of Work (SoW), contract, or project brief for more accurate analysis
            </p>

            <div className="border-2 border-dashed border-beige-300 rounded-xl p-8 text-center hover:border-olive-400 transition">
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <label className="cursor-pointer">
                <span className="text-olive-600 font-semibold hover:text-olive-700">
                  Click to upload
                </span>
                <span className="text-slate-600"> or drag and drop</span>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-slate-500 mt-2">PDF, DOC, DOCX, TXT (Max 10MB each)</p>
            </div>

            {formData.files.length > 0 && (
              <div className="mt-4 space-y-2">
                {formData.files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-beige-50 rounded-lg border border-beige-200"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-olive-600" />
                      <div>
                        <div className="font-medium text-slate-800 text-sm">{file.name}</div>
                        <div className="text-xs text-slate-500">
                          {(file.size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-slate-400 hover:text-red-600 transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4">
        {step > 1 && (
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 px-6 py-3 bg-beige-100 text-slate-700 rounded-lg hover:bg-beige-200 transition font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        )}

        {step < totalSteps ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={!isStepValid()}
            className="ml-auto flex items-center gap-2 px-6 py-3 bg-olive-600 text-white rounded-lg hover:bg-olive-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={loading || !isStepValid()}
            className="ml-auto px-8 py-3 bg-olive-600 text-white rounded-lg hover:bg-olive-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Analyzing with AI...' : 'Get Pricing Analysis'}
          </button>
        )}
      </div>
    </form>
  );
}

