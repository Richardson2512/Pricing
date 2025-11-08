import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the form data to your backend
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-50 to-beige-100 flex flex-col">
      <Header />

      <main className="flex-1 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-slate-800 mb-4">
              Get in Touch
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-xl p-6 border border-beige-200">
                <div className="flex items-start gap-4">
                  <div className="bg-olive-100 p-3 rounded-lg">
                    <Mail className="w-6 h-6 text-olive-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-1">Email Us</h3>
                    <p className="text-slate-600 text-sm mb-2">
                      Our team is here to help
                    </p>
                    <a
                      href="mailto:support@pricewise.com"
                      className="text-olive-600 hover:text-olive-700 font-medium"
                    >
                      support@pricewise.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-beige-200">
                <div className="flex items-start gap-4">
                  <div className="bg-olive-100 p-3 rounded-lg">
                    <Phone className="w-6 h-6 text-olive-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-1">Call Us</h3>
                    <p className="text-slate-600 text-sm mb-2">
                      Mon-Fri from 9am to 6pm EST
                    </p>
                    <a
                      href="tel:+1234567890"
                      className="text-olive-600 hover:text-olive-700 font-medium"
                    >
                      +1 (234) 567-890
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-beige-200">
                <div className="flex items-start gap-4">
                  <div className="bg-olive-100 p-3 rounded-lg">
                    <MapPin className="w-6 h-6 text-olive-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-1">Visit Us</h3>
                    <p className="text-slate-600 text-sm">
                      123 Business Street<br />
                      Suite 100<br />
                      New York, NY 10001<br />
                      United States
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-olive-600 to-olive-700 rounded-xl p-6 text-white">
                <h3 className="font-semibold mb-2">Need Immediate Help?</h3>
                <p className="text-beige-100 text-sm mb-4">
                  Check out our FAQ section or browse our documentation for quick answers.
                </p>
                <a
                  href="/pricing#faq"
                  className="text-white hover:text-beige-100 font-medium text-sm underline"
                >
                  View FAQ →
                </a>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl p-8 border border-beige-200">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">
                  Send us a Message
                </h2>

                {submitted ? (
                  <div className="bg-olive-50 border border-olive-200 rounded-lg p-6 text-center">
                    <div className="bg-olive-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="w-8 h-8 text-olive-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-olive-800 mb-2">
                      Message Sent!
                    </h3>
                    <p className="text-olive-700">
                      Thank you for contacting us. We'll get back to you within 24 hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Your Name *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent transition"
                          required
                          placeholder="John Doe"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent transition"
                          required
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Subject *
                      </label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) =>
                          setFormData({ ...formData, subject: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent transition"
                        required
                        placeholder="How can we help you?"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Message *
                      </label>
                      <textarea
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        rows={6}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent transition resize-none"
                        required
                        placeholder="Tell us more about your inquiry..."
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full px-6 py-3 bg-olive-600 text-white rounded-lg hover:bg-olive-700 transition font-semibold flex items-center justify-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                      Send Message
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-16 bg-white rounded-xl p-8 border border-beige-200">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
              Other Ways to Connect
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <h3 className="font-semibold text-slate-800 mb-2">Sales Inquiries</h3>
                <p className="text-slate-600 text-sm mb-2">
                  Interested in enterprise solutions?
                </p>
                <a
                  href="mailto:sales@pricewise.com"
                  className="text-olive-600 hover:text-olive-700 font-medium"
                >
                  sales@pricewise.com
                </a>
              </div>

              <div className="text-center">
                <h3 className="font-semibold text-slate-800 mb-2">Technical Support</h3>
                <p className="text-slate-600 text-sm mb-2">
                  Need help with your account?
                </p>
                <a
                  href="mailto:support@pricewise.com"
                  className="text-olive-600 hover:text-olive-700 font-medium"
                >
                  support@pricewise.com
                </a>
              </div>

              <div className="text-center">
                <h3 className="font-semibold text-slate-800 mb-2">Partnerships</h3>
                <p className="text-slate-600 text-sm mb-2">
                  Interested in partnering with us?
                </p>
                <a
                  href="mailto:partners@pricewise.com"
                  className="text-olive-600 hover:text-olive-700 font-medium"
                >
                  partners@pricewise.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

