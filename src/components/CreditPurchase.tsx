import { useState } from 'react';
import { Coins, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
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
  const [customCredits, setCustomCredits] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { profile, refreshProfile } = useAuth();

  const handlePurchase = async (credits: number, amount: number) => {
    if (!profile) return;

    setLoading(true);
    setError('');

    try {
      const { error: purchaseError } = await supabase
        .from('credit_purchases')
        .insert({
          user_id: profile.id,
          credits_purchased: credits,
          amount_paid: amount,
        });

      if (purchaseError) throw purchaseError;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ credits: profile.credits + credits })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      await refreshProfile();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Purchase failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomPurchase = () => {
    const credits = parseInt(customCredits);
    if (credits > 0) {
      const amount = credits * 2;
      handlePurchase(credits, amount);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-beige-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-beige-100 p-2 rounded-lg">
              <Coins className="w-6 h-6 text-olive-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Purchase Credits</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-beige-100 border border-beige-200 rounded-xl p-4 mb-6">
            <p className="text-olive-800 text-center">
              <span className="font-semibold">Current Balance:</span> {profile?.credits || 0} credits
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {packages.map((pkg) => (
              <div
                key={pkg.credits}
                className={`relative border-2 rounded-xl p-6 transition hover:shadow-lg ${
                  pkg.popular
                    ? 'border-olive-500 bg-beige-50'
                    : 'border-slate-200 bg-white hover:border-olive-300'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-olive-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-slate-800 mb-2">
                    {pkg.credits}
                  </div>
                  <div className="text-slate-600">Credits</div>
                </div>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-olive-600">
                    ${pkg.price}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">
                    ${(pkg.price / pkg.credits).toFixed(2)} per credit
                  </div>
                </div>
                <button
                  onClick={() => handlePurchase(pkg.credits, pkg.price)}
                  disabled={loading}
                  className="w-full bg-olive-600 text-white py-3 rounded-lg font-semibold hover:bg-olive-700 transition disabled:opacity-50"
                >
                  Purchase
                </button>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Custom Amount
            </h3>
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="number"
                  min="1"
                  value={customCredits}
                  onChange={(e) => setCustomCredits(e.target.value)}
                  placeholder="Enter number of credits"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                />
                {customCredits && parseInt(customCredits) > 0 && (
                  <p className="text-sm text-slate-600 mt-2">
                    Total: ${parseInt(customCredits) * 2}
                  </p>
                )}
              </div>
              <button
                onClick={handleCustomPurchase}
                disabled={loading || !customCredits || parseInt(customCredits) <= 0}
                className="px-6 py-3 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Purchase
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="mt-6 p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600 text-center">
              Credits never expire and can be used anytime
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
