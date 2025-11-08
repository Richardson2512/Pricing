import { Coins, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type CreditPackage = {
  credits: number;
  price: number;
  popular?: boolean;
};

const packages: CreditPackage[] = [
  { credits: 5, price: 10 },
  { credits: 10, price: 15, popular: true },
  { credits: 20, price: 25 },
  { credits: 50, price: 50 },
];

type CreditPurchaseProps = {
  onClose: () => void;
};

export function CreditPurchase({ onClose }: CreditPurchaseProps) {
  const { profile } = useAuth();

  // Payment integration coming soon - show informational modal only

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full">
        <div className="bg-white border-b border-beige-200 p-6 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-beige-100 p-2 rounded-lg">
              <Coins className="w-6 h-6 text-olive-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Credit Top-Up</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 text-center">
          {/* Current Balance */}
          <div className="bg-beige-100 border border-beige-200 rounded-xl p-6 mb-8">
            <p className="text-olive-800 text-lg">
              <span className="font-semibold">Current Balance:</span> {profile?.credits || 0} credits
            </p>
          </div>

          {/* Coming Soon Message */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-olive-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Coins className="w-10 h-10 text-olive-600" />
            </div>
            
            <h3 className="text-3xl font-bold text-slate-800 mb-4">
              Credit Top-Up Coming Soon! 🚀
            </h3>
            
            <p className="text-lg text-slate-600 mb-6">
              We're currently integrating secure payment options to make purchasing credits seamless.
            </p>
            
            <div className="bg-olive-50 border border-olive-200 rounded-xl p-6 text-left max-w-md mx-auto">
              <p className="font-semibold text-olive-900 mb-3">What's coming:</p>
              <ul className="space-y-2 text-sm text-olive-800">
                <li className="flex items-start gap-2">
                  <span className="text-olive-600 font-bold">✓</span>
                  <span>Multiple payment options (Credit Card, PayPal, UPI)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-olive-600 font-bold">✓</span>
                  <span>Flexible credit packages (5, 10, 20, 50 credits)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-olive-600 font-bold">✓</span>
                  <span>Instant credit delivery</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-olive-600 font-bold">✓</span>
                  <span>Secure payment processing</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Preview Packages */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-slate-800 mb-4">
              Planned Credit Packages:
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {packages.map((pkg) => (
                <div
                  key={pkg.credits}
                  className="border-2 border-beige-200 rounded-xl p-4 bg-beige-50"
                >
                  <div className="text-2xl font-bold text-slate-800 mb-1">
                    {pkg.credits}
                  </div>
                  <div className="text-xs text-slate-600 mb-2">Credits</div>
                  <div className="text-xl font-bold text-olive-600">
                    ${pkg.price}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    ${(pkg.price / pkg.credits).toFixed(2)}/credit
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact for Early Access */}
          <div className="bg-gradient-to-r from-olive-600 to-olive-700 rounded-xl p-6 text-white">
            <p className="font-semibold mb-2">Need more credits now?</p>
            <p className="text-sm text-beige-100 mb-4">
              Contact us for early access to credit purchases or special arrangements.
            </p>
            <a
              href="mailto:support@howmuchshouldiprice.com?subject=Credit Purchase Inquiry"
              className="inline-block px-6 py-3 bg-white text-olive-600 rounded-lg font-semibold hover:bg-beige-50 transition"
            >
              Contact Support
            </a>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="mt-8 px-8 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
