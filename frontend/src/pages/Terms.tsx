import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Shield, FileText, RefreshCw } from 'lucide-react';

export function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-50 to-beige-100 flex flex-col">
      <Header />

      <main className="flex-1 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-slate-800 mb-4">
              Terms & Policies
            </h1>
            <p className="text-xl text-slate-600">
              Last updated: November 8, 2025
            </p>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <a
              href="#terms"
              className="bg-white rounded-xl p-6 border border-beige-200 hover:shadow-lg transition text-center"
            >
              <div className="bg-olive-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-olive-600" />
              </div>
              <h3 className="font-semibold text-slate-800">Terms & Conditions</h3>
            </a>

            <a
              href="#privacy"
              className="bg-white rounded-xl p-6 border border-beige-200 hover:shadow-lg transition text-center"
            >
              <div className="bg-olive-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-olive-600" />
              </div>
              <h3 className="font-semibold text-slate-800">Privacy Policy</h3>
            </a>

            
          </div>

          {/* Terms & Conditions */}
          <section id="terms" className="bg-white rounded-xl p-8 border border-beige-200 mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-6 flex items-center gap-3">
              <FileText className="w-8 h-8 text-olive-600" />
              Terms & Conditions
            </h2>

            <div className="prose prose-slate max-w-none space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">1. Acceptance of Terms</h3>
                <p className="text-slate-600 leading-relaxed">
                  By accessing and using PriceWise, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our service.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">2. Use License</h3>
                <p className="text-slate-600 leading-relaxed mb-3">
                  Permission is granted to temporarily use PriceWise for personal or commercial purposes. This license shall automatically terminate if you violate any of these restrictions.
                </p>
                <ul className="list-disc list-inside text-slate-600 space-y-2">
                  <li>You must not modify or copy the materials</li>
                  <li>You must not use the materials for any commercial purpose without proper licensing</li>
                  <li>You must not attempt to reverse engineer any software contained on PriceWise</li>
                  <li>You must not remove any copyright or other proprietary notations</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">3. User Accounts</h3>
                <p className="text-slate-600 leading-relaxed">
                  When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">4. Credits and Pricing Checks</h3>
                <p className="text-slate-600 leading-relaxed">
                  Credits purchased on PriceWise never expire. Each pricing check costs 1 credit. New users receive 3 free credits upon registration. Additional credits can be purchased at any time.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">5. Disclaimer</h3>
                <p className="text-slate-600 leading-relaxed">
                  The pricing recommendations provided by PriceWise are for informational purposes only. We do not guarantee specific results or outcomes. Users should conduct their own research and consult with professionals before making pricing decisions.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">6. Limitations</h3>
                <p className="text-slate-600 leading-relaxed">
                  In no event shall PriceWise or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use PriceWise.
                </p>
              </div>
            </div>
          </section>

          {/* Privacy Policy */}
          <section id="privacy" className="bg-white rounded-xl p-8 border border-beige-200 mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-6 flex items-center gap-3">
              <Shield className="w-8 h-8 text-olive-600" />
              Privacy Policy
            </h2>

            <div className="prose prose-slate max-w-none space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">Information We Collect</h3>
                <p className="text-slate-600 leading-relaxed mb-3">
                  We collect information that you provide directly to us, including:
                </p>
                <ul className="list-disc list-inside text-slate-600 space-y-2">
                  <li>Account information (email, password)</li>
                  <li>Business information provided in consultations</li>
                  <li>Payment information (processed securely through third-party providers)</li>
                  <li>Usage data and analytics</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">How We Use Your Information</h3>
                <p className="text-slate-600 leading-relaxed mb-3">
                  We use the information we collect to:
                </p>
                <ul className="list-disc list-inside text-slate-600 space-y-2">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Generate personalized pricing recommendations</li>
                  <li>Process transactions and send related information</li>
                  <li>Send technical notices and support messages</li>
                  <li>Respond to your comments and questions</li>
                  <li>Protect against fraud and abuse</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">Data Security</h3>
                <p className="text-slate-600 leading-relaxed">
                  We implement appropriate technical and organizational measures to protect your personal data against unauthorized or unlawful processing, accidental loss, destruction, or damage. All data is encrypted in transit and at rest.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">Your Rights</h3>
                <p className="text-slate-600 leading-relaxed mb-3">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside text-slate-600 space-y-2">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Object to processing of your data</li>
                  <li>Export your data</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">Cookies</h3>
                <p className="text-slate-600 leading-relaxed">
                  We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                </p>
              </div>
            </div>
          </section>

          

          {/* Contact CTA */}
          <div className="bg-gradient-to-r from-olive-600 to-olive-700 rounded-xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-3">Have Questions?</h3>
            <p className="text-beige-100 mb-6">
              If you have any questions about our terms or privacy policy, we're here to help.
            </p>
            <a
              href="/contact"
              className="inline-block px-6 py-3 bg-white text-olive-600 rounded-lg hover:bg-beige-50 transition font-semibold"
            >
              Contact Us
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

