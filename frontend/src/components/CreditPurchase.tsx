import { useState } from 'react';
import { Coins, X, CreditCard, Loader2 } from 'lucide-react';
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
  const { profile, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async (credits: number) => {
    if (!user) {
      setError('Please sign in to purchase credits');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/payments/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credits,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout');
      }

      const { checkoutUrl } = await response.json();
      
      // Redirect to Dodo Payments checkout
      window.location.href = checkoutUrl;
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Failed to initiate payment. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
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

        <div className="p-8">
          {/* Current Balance */}
          <div className="bg-beige-100 border border-beige-200 rounded-xl p-6 mb-8 text-center">
            <p className="text-olive-800 text-lg">
              <span className="font-semibold">Current Balance:</span> {profile?.credits || 0} credits
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Credit Packages */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">
              Choose Your Credit Package
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {packages.map((pkg) => (
                <div
                  key={pkg.credits}
                  className={`relative border-2 rounded-xl p-6 transition hover:shadow-lg ${
                    pkg.popular
                      ? 'border-olive-600 bg-olive-50'
                      : 'border-beige-200 bg-white hover:border-olive-300'
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-olive-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        POPULAR
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-4">
                    <div className="text-4xl font-bold text-slate-800 mb-1">
                      {pkg.credits}
                    </div>
                    <div className="text-sm text-slate-600 mb-3">Credits</div>
                    <div className="text-3xl font-bold text-olive-600 mb-1">
                      ${pkg.price}
                    </div>
                    <div className="text-xs text-slate-500">
                      ${(pkg.price / pkg.credits).toFixed(2)} per credit
                    </div>
                  </div>

                  <button
                    onClick={() => handlePurchase(pkg.credits)}
                    disabled={loading}
                    className={`w-full py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                      pkg.popular
                        ? 'bg-olive-600 text-white hover:bg-olive-700'
                        : 'bg-beige-100 text-olive-600 hover:bg-beige-200'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Purchase
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-olive-50 border border-olive-200 rounded-xl p-6 mb-6">
            <p className="text-sm text-olive-800 text-center">
              <strong>✓ Secure Payment</strong> • <strong>✓ Instant Delivery</strong> • <strong>✓ Credits Never Expire</strong>
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            disabled={loading}
            className="w-full px-8 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition disabled:opacity-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
