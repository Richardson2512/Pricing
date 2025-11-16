import { Link } from 'react-router-dom';
import { Sparkles, Mail, MapPin, Phone, Twitter, Linkedin, Github } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-800 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4 group">
              <img 
                src="/logo.png" 
                alt="HowMuchShouldIPrice Logo" 
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold text-white group-hover:text-beige-200 transition">
                HowMuchShouldIPrice
              </span>
            </Link>
            <p className="text-sm text-slate-400">
              AI-powered pricing recommendations to help your business thrive.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm hover:text-olive-400 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-sm hover:text-olive-400 transition">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-sm hover:text-olive-400 transition">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/signin" className="text-sm hover:text-olive-400 transition">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-sm hover:text-olive-400 transition">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/terms#privacy" className="text-sm hover:text-olive-400 transition">
                  Privacy Policy
                </Link>
              </li>
              
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-olive-400" />
                <a href="mailto:support@howmuchshouldiprice.com" className="hover:text-olive-400 transition">
                  support@howmuchshouldiprice.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-olive-400" />
                <a href="tel:+1234567890" className="hover:text-olive-400 transition">
                  +1 (234) 567-890
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-olive-400 mt-1" />
                <span>123 Business St, Suite 100<br />New York, NY 10001</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-400">
            © {currentYear} PriceWise. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-olive-400 transition p-2 hover:bg-slate-700 rounded-lg"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-olive-400 transition p-2 hover:bg-slate-700 rounded-lg"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="https://github.com/Richardson2512/Pricing"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-olive-400 transition p-2 hover:bg-slate-700 rounded-lg"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

