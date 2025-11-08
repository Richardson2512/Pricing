import { useNavigate } from 'react-router-dom';
import { Check, Sparkles } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export function Pricing() {
  const navigate = useNavigate();

  const packages = [
    {
      name: 'Starter',
      credits: 5,
      price: 10,
      pricePerCredit: 2.0,
      description: 'Perfect for testing the waters',
      features: [
        '5 pricing consultations',
        'Basic recommendations',
        'Email support',
        'Consultation history',
      ],
    },
    {
      name: 'Professional',
      credits: 10,
      price: 15,
      pricePerCredit: 1.5,
      description: 'Most popular for small businesses',
      popular: true,
      features: [
        '10 pricing consultations',
        'Advanced recommendations',
        'Priority email support',
        'Consultation history',
        'Export to PDF',
      ],
    },
    {
      name: 'Business',
      credits: 20,
      price: 25,
      pricePerCredit: 1.25,
      description: 'For growing businesses',
      features: [
        '20 pricing consultations',
        'Premium recommendations',
        'Priority support',
        'Consultation history',
        'Export to PDF',
        'Team collaboration',
      ],
    },
    {
      name: 'Enterprise',
      credits: 50,
      price: 50,
      pricePerCredit: 1.0,
      description: 'For large organizations',
      features: [
        '50 pricing consultations',
        'Enterprise recommendations',
        '24/7 dedicated support',
        'Unlimited history',
        'Export to PDF',
        'Team collaboration',
        'Custom integrations',
        'API access',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-50 to-beige-100 flex flex-col">
      <Header />

      <main className="flex-1 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-slate-800 mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Choose the plan that fits your needs. All plans include full access to our AI-powered pricing recommendations.
            </p>
          </div>

          {/* Free Trial Banner */}
          <div className="bg-gradient-to-r from-olive-600 to-olive-700 rounded-2xl p-8 text-white text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-6 h-6" />
              <h2 className="text-2xl font-bold">Start Free</h2>
            </div>
            <p className="text-beige-100">
              New users get <span className="font-bold">3 free consultations</span> • No credit card required
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {packages.map((pkg, index) => (
              <div
                key={index}
                className={`relative bg-white rounded-2xl p-6 border-2 transition hover:shadow-xl ${
                  pkg.popular
                    ? 'border-olive-500 shadow-lg'
                    : 'border-beige-200 hover:border-olive-300'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-olive-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">
                    {pkg.name}
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">{pkg.description}</p>
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-olive-600">
                      ${pkg.price}
                    </span>
                  </div>
                  <div className="text-sm text-slate-500">
                    ${pkg.pricePerCredit.toFixed(2)} per consultation
                  </div>
                  <div className="text-lg font-semibold text-slate-700 mt-2">
                    {pkg.credits} Credits
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="w-5 h-5 text-olive-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => navigate('/auth')}
                  className={`w-full py-3 rounded-lg font-semibold transition ${
                    pkg.popular
                      ? 'bg-olive-600 text-white hover:bg-olive-700'
                      : 'bg-beige-100 text-olive-600 hover:bg-beige-200'
                  }`}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>

          {/* Custom Package */}
          <div className="bg-white rounded-2xl p-8 border-2 border-beige-200 max-w-3xl mx-auto">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                Need a Custom Plan?
              </h3>
              <p className="text-slate-600 mb-6">
                For larger organizations or specific requirements, we can create a custom package tailored to your needs.
              </p>
              <button
                onClick={() => navigate('/contact')}
                className="px-8 py-3 bg-olive-600 text-white rounded-lg hover:bg-olive-700 transition font-semibold"
              >
                Contact Sales
              </button>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-800 text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 border border-beige-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  Do credits expire?
                </h3>
                <p className="text-slate-600">
                  No! Your credits never expire. Use them whenever you need pricing recommendations.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-beige-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  Can I purchase more credits anytime?
                </h3>
                <p className="text-slate-600">
                  Yes, you can purchase additional credits at any time from your dashboard. You can also buy custom amounts.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-beige-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  What payment methods do you accept?
                </h3>
                <p className="text-slate-600">
                  We accept all major credit cards, debit cards, and PayPal for your convenience.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-beige-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  Is there a refund policy?
                </h3>
                <p className="text-slate-600">
                  Yes, we offer a 30-day money-back guarantee. If you're not satisfied, contact us for a full refund.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

