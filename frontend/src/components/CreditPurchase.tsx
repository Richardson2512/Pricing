import { useState, useEffect } from 'react';
import { Coins, X, CreditCard, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { buildApiUrl, API_CONFIG } from '../config/api';

type CreditPackage = {
  credits: number;
  price: number;
  popular?: boolean;
};

const packages: CreditPackage[] = [
  { credits: 5, price: 10 },
  { credits: 10, price: 15, popular: true },
  { credits: 20, price: 25 },
];

type CreditPurchaseProps = {
  onClose: () => void;
};

export function CreditPurchase({ onClose }: CreditPurchaseProps) {
  const { profile, user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'cancelled' | 'checking'>('idle');

  // Check for payment status on mount (after redirect back from Dodo Payments)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const payment = urlParams.get('payment');
    const credits = urlParams.get('credits');

    if (payment === 'success') {
      setPaymentStatus('checking');
      // Poll for credit update
      const pollInterval = setInterval(async () => {
        await refreshProfile();
        // Credits should be updated by webhook
        setPaymentStatus('success');
        clearInterval(pollInterval);
        
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
      }, 2000);

      // Stop polling after 30 seconds
      setTimeout(() => {
        clearInterval(pollInterval);
        if (paymentStatus === 'checking') {
          setPaymentStatus('idle');
        }
      }, 30000);

      return () => clearInterval(pollInterval);
    } else if (payment === 'cancelled') {
      setPaymentStatus('cancelled');
      // Clean URL after 5 seconds
      setTimeout(() => {
        window.history.replaceState({}, '', window.location.pathname);
        setPaymentStatus('idle');
      }, 5000);
    }
  }, []);

  const handlePurchase = async (credits: number) => {
    if (!user) {
      setError('Please sign in to purchase credits');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Creating checkout for', credits, 'credits');
      console.log('📡 Backend URL:', API_CONFIG.BACKEND_URL);
      
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.CREATE_CHECKOUT), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credits,
          userId: user.id,
        }),
      });
      
      console.log('📥 Response status:', response.status, response.statusText);

      if (!response.ok) {
        let errorMessage = `Server error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // Response body is empty or not JSON
          console.error('Empty or invalid error response from backend');
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const { checkoutUrl } = data;
      
      if (!checkoutUrl) {
        throw new Error('No checkout URL received from backend');
      }
      
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

          {/* Payment Success Message */}
          {paymentStatus === 'success' && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-green-800 font-semibold">Payment Successful!</p>
                <p className="text-green-700 text-sm">Your credits have been added to your account.</p>
              </div>
            </div>
          )}

          {/* Payment Checking Message */}
          {paymentStatus === 'checking' && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
              <div>
                <p className="text-blue-800 font-semibold">Processing Payment...</p>
                <p className="text-blue-700 text-sm">Please wait while we confirm your payment.</p>
              </div>
            </div>
          )}

          {/* Payment Cancelled Message */}
          {paymentStatus === 'cancelled' && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <div>
                <p className="text-yellow-800 font-semibold">Payment Cancelled</p>
                <p className="text-yellow-700 text-sm">Your payment was cancelled. No charges were made.</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div>
                <p className="text-red-800 font-semibold">Payment Error</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Credit Packages */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">
              Choose Your Credit Package
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
