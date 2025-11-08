import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-beige-200 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-olive-600 p-2 rounded-lg group-hover:bg-olive-700 transition">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-800">PriceWise</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/pricing"
              className="text-slate-700 hover:text-olive-600 font-medium transition"
            >
              Pricing
            </Link>
            <Link
              to="/contact"
              className="text-slate-700 hover:text-olive-600 font-medium transition"
            >
              Contact Us
            </Link>
            <Link
              to="/terms"
              className="text-slate-700 hover:text-olive-600 font-medium transition"
            >
              Terms
            </Link>
            <button
              onClick={handleGetStarted}
              className="px-6 py-2 bg-olive-600 text-white rounded-lg hover:bg-olive-700 transition font-medium"
            >
              Get Started
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-800"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-beige-200">
            <div className="flex flex-col gap-4">
              <Link
                to="/pricing"
                className="text-slate-700 hover:text-olive-600 font-medium transition px-2 py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                to="/contact"
                className="text-slate-700 hover:text-olive-600 font-medium transition px-2 py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact Us
              </Link>
              <Link
                to="/terms"
                className="text-slate-700 hover:text-olive-600 font-medium transition px-2 py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                Terms
              </Link>
              <button
                onClick={() => {
                  handleGetStarted();
                  setMobileMenuOpen(false);
                }}
                className="px-6 py-2 bg-olive-600 text-white rounded-lg hover:bg-olive-700 transition font-medium text-left"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

