import { useNavigate } from 'react-router-dom';
import { TrendingUp, Target, Zap, Shield, Users, BarChart3, ArrowRight, CheckCircle } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';

export function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: TrendingUp,
      title: 'Data-Driven Insights',
      description: 'Get pricing recommendations based on market analysis and competitive intelligence.',
    },
    {
      icon: Target,
      title: 'Tailored Strategies',
      description: 'Personalized pricing models designed specifically for your business and target market.',
    },
    {
      icon: Zap,
      title: 'Instant Results',
      description: 'Receive comprehensive pricing recommendations in minutes, not days.',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your business data is encrypted and protected with enterprise-grade security.',
    },
    {
      icon: Users,
      title: 'Expert Guidance',
      description: 'Benefit from pricing strategies used by successful businesses worldwide.',
    },
    {
      icon: BarChart3,
      title: 'Actionable Plans',
      description: 'Get step-by-step implementation guides to execute your pricing strategy.',
    },
  ];

  const benefits = [
    'Maximize revenue with optimal pricing',
    'Understand your competitive position',
    'Test different pricing models',
    'Reduce pricing guesswork',
    'Increase customer acquisition',
    'Improve profit margins',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-50 to-beige-100 flex flex-col">
      <SEO
        title="How Much Should I Price for a Project? | Free AI Pricing Calculator"
        description="Wondering how much should I charge for a project? Get instant AI-powered pricing recommendations for products, services, and freelance work. Free pricing calculator for entrepreneurs, freelancers, and businesses. Start with 3 free pricing checks!"
        keywords="how much should i charge for a project, how much should i price for a project, pricing calculator, freelance pricing tool, product pricing calculator, service pricing, AI pricing recommendations, price my work, pricing strategy, freelance rates calculator, project pricing tool"
        canonicalUrl="https://howmuchshouldiprice.com"
      />
      <Header />

      {/* Hero Section */}
      <section className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-slate-800 mb-6">
              How Much Should I{' '}
              <span className="text-olive-600">Price</span>
              <br />
              for a Project?
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Wondering <strong>"how much should I charge for a project"</strong>? 
              Get AI-powered pricing recommendations for your product, service, or freelance work in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/signup')}
                className="px-8 py-4 bg-olive-600 text-white rounded-xl hover:bg-olive-700 transition font-semibold text-lg shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/pricing')}
                className="px-8 py-4 bg-white text-olive-600 border-2 border-olive-600 rounded-xl hover:bg-olive-50 transition font-semibold text-lg"
              >
                View Pricing
              </button>
            </div>
            <p className="text-sm text-slate-500 mt-4">
              ✨ New users get 3 free pricing checks • No credit card required
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="text-4xl font-bold text-olive-600 mb-2">10,000+</div>
              <div className="text-slate-600">Products Priced</div>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="text-4xl font-bold text-olive-600 mb-2">95%</div>
              <div className="text-slate-600">Customer Satisfaction</div>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="text-4xl font-bold text-olive-600 mb-2">$2M+</div>
              <div className="text-slate-600">Revenue Optimized</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              How Much Should I Charge for a Project?
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Powerful AI features to help you determine exactly <strong>how much to price for a project</strong>, 
              whether it's a product, service, or freelance work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="p-6 bg-beige-50 rounded-xl border border-beige-200 hover:shadow-lg transition"
                >
                  <div className="bg-olive-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-olive-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-beige-50 to-beige-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-600">
              Get your pricing recommendation in 3 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-olive-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                Answer Questions
              </h3>
              <p className="text-slate-600">
                Tell us about your business, market, and value proposition
              </p>
            </div>

            <div className="text-center">
              <div className="bg-olive-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                AI Analysis
              </h3>
              <p className="text-slate-600">
                Our AI analyzes your data against market trends and best practices
              </p>
            </div>

            <div className="text-center">
              <div className="bg-olive-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                Get Recommendations
              </h3>
              <p className="text-slate-600">
                Receive detailed pricing strategies and implementation guides
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-slate-800 mb-6">
                How Much Should I Price for a Project?
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                Stop asking <strong>"how much should I charge for a project"</strong> and get data-driven answers. 
                Join thousands of freelancers, entrepreneurs, and businesses who've optimized their pricing with our AI-powered tool.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-olive-600 flex-shrink-0" />
                    <span className="text-slate-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-olive-600 to-olive-700 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
              <p className="text-beige-100 mb-6">
                Sign up today and get 3 free pricing checks. No credit
                card required.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Instant access to all features</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>3 free pricing checks included</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Cancel anytime, no commitment</span>
                </li>
              </ul>
              <button
                onClick={() => navigate('/signup')}
                className="w-full px-6 py-3 bg-white text-olive-600 rounded-lg hover:bg-beige-50 transition font-semibold"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-olive-600 to-olive-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            How Much Should I Charge for a Project? Get Your Answer Now.
          </h2>
          <p className="text-xl text-beige-100 mb-8">
            Stop guessing and start earning what you're worth. Get AI-powered pricing recommendations 
            for a project in minutes—whether you're pricing a product, service, or freelance work.
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="px-8 py-4 bg-white text-olive-600 rounded-xl hover:bg-beige-50 transition font-semibold text-lg shadow-lg"
          >
            Get Started Now
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}

