import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, CheckCircle, AlertCircle, Crown, Zap } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export function Subscriptions() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plans, setPlans] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [upgrading, setUpgrading] = useState(false);
  const [upgradeRequest, setUpgradeRequest] = useState<any>(null);

  const formatPkr = (amount: number) => {
    return 'Rs ' + amount.toLocaleString('en-PK');
  };

  const markAsPaid = async () => {
    if (!upgradeRequest?._id) return;
    try {
      setUpgrading(true);
      setError('');
      setSuccess('');

      const res = await api.post(`/api/support/requests/${upgradeRequest._id}/paid`);
      if (res.data?.success) {
        setUpgradeRequest(res.data.request);
        setSuccess('Marked as paid. Admin will verify and activate your subscription.');
        setTimeout(() => setSuccess(''), 5000);
      }
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Failed to update payment status');
    } finally {
      setUpgrading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'client') {
      navigate('/');
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const [plansRes, meRes, reqRes] = await Promise.all([
        api.get('/api/subscriptions/plans'),
        api.get('/api/subscriptions/me'),
        api.get('/api/support/requests/me')
      ]);

      const allowedCodes = new Set(['free', 'pro_monthly', 'pro_yearly']);
      const filteredPlans = (plansRes.data.plans || []).filter((p: any) => allowedCodes.has(p.code));
      setPlans(filteredPlans);
      setSubscription(meRes.data.subscription || null);
      setUpgradeRequest(reqRes.data.request || null);
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const requestProUpgrade = async (planCode: string) => {
    try {
      setUpgrading(true);
      setError('');
      setSuccess('');

      const res = await api.post('/api/support/requests', { plan_code: planCode });
      if (res.data?.success) {
        setUpgradeRequest(res.data.request);
        setSuccess('Pro upgrade request sent to admin. Please wait for acceptance.');
        setTimeout(() => setSuccess(''), 5000);
      }
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Upgrade failed');
    } finally {
      setUpgrading(false);
    }
  };

  const renderRequestStatus = () => {
    if (!upgradeRequest) return null;
    const status = upgradeRequest.status;
    const planCode = upgradeRequest.plan_code;
    const planLabel = planCode === 'pro_monthly' ? 'Monthly' : planCode === 'pro_yearly' ? 'Yearly' : 'Pro';
    const amountLabel = planCode === 'pro_monthly' ? 'Rs 1,500' : planCode === 'pro_yearly' ? 'Rs 10,000' : '';
    const method = (upgradeRequest.admin_payment_method || '').toString();
    const methodLabel = method === 'easypaisa' ? 'EasyPaisa' : method === 'jazzcash' ? 'JazzCash' : method === 'bank' ? 'Bank' : method === 'other' ? 'Other' : '';
    const statusLabel =
      status === 'pending' ? 'Pending (Admin review)' :
      status === 'accepted' ? 'Accepted (Chat with admin & pay)' :
      status === 'paid' ? 'Paid (Waiting activation)' :
      status === 'activated' ? 'Activated (You are Pro)' :
      status;

    return (
      <div className="mb-6 p-5 bg-white/80 backdrop-blur-lg border border-orange-200 rounded-2xl shadow">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-gray-900">Pro Upgrade Request</p>
            <p className="text-sm text-gray-700 mt-1">
              Plan: <span className="font-extrabold text-gray-900">{planLabel}</span>
              {amountLabel && <span className="text-gray-600"> ({amountLabel})</span>}
            </p>
            <p className="text-sm text-gray-600 mt-1">Status: <span className="font-extrabold text-orange-700">{statusLabel}</span></p>
            {upgradeRequest.admin_account_details && (
              <p className="text-xs text-gray-600 mt-2 whitespace-pre-wrap">
                <span className="font-bold text-gray-800">Admin Account:</span> {upgradeRequest.admin_account_details}
              </p>
            )}
            {methodLabel && (
              <p className="text-xs text-gray-600 mt-1">
                <span className="font-bold text-gray-800">Payment Method:</span> {methodLabel}
              </p>
            )}
            {status === 'accepted' && upgradeRequest.admin_account_details && (
              <p className="text-xs text-gray-700 mt-3 whitespace-pre-wrap">
                Send <span className="font-extrabold text-gray-900">{amountLabel}</span> to the admin account above, then press <span className="font-extrabold">I Have Paid</span>.
              </p>
            )}
          </div>

          {(status === 'accepted' || status === 'paid' || status === 'activated') && (
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => navigate(`/support/subscription/${upgradeRequest._id}`)}
                className="px-4 py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 shadow-lg hover:shadow-xl"
              >
                Open Chat
              </button>
              {status === 'accepted' && (
                <button
                  type="button"
                  onClick={markAsPaid}
                  disabled={upgrading}
                  className="px-4 py-3 rounded-2xl font-bold bg-white text-gray-800 border border-gray-200 shadow hover:shadow-lg disabled:opacity-50"
                >
                  I Have Paid
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 pt-24 pb-10 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 pt-24 pb-10">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-200/50">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Client Subscription</h1>
              <p className="text-sm text-gray-600">Upgrade to Pro for unlimited bookings and 20% discount</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 shadow">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-800">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {renderRequestStatus()}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-start gap-3 shadow">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-green-800">Success</p>
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan) => {
            const isActive = subscription?.plan_id?._id === plan._id || subscription?.plan_id?.code === plan.code;
            const isProPlan = plan.code === 'pro_monthly' || plan.code === 'pro_yearly';
            const periodLabel = plan.code === 'pro_yearly' ? '/year' : plan.price_pkr > 0 ? '/month' : '';
            return (
              <div
                key={plan._id}
                className={`bg-white/80 backdrop-blur-lg rounded-3xl border shadow-2xl p-8 transition-all duration-300 ${
                  isActive ? 'border-orange-300 ring-2 ring-orange-200' : 'border-white/40'
                }`}
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      {isProPlan ? (
                        <Sparkles className="w-6 h-6 text-orange-600" />
                      ) : (
                        <Zap className="w-6 h-6 text-gray-600" />
                      )}
                      {plan.name}
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">{isProPlan ? '20% discount on every chef + unlimited bookings' : 'Try the platform for free'}</p>
                  </div>

                  {isActive && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200">
                      Active
                    </span>
                  )}
                </div>

                <div className="mb-6">
                  <div className="text-4xl font-extrabold text-gray-900">
                    {plan.price_pkr > 0 ? formatPkr(plan.price_pkr) : 'Free'}
                    {plan.price_pkr > 0 && <span className="text-sm text-gray-500 font-semibold">{periodLabel}</span>}
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-xl bg-green-100 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <p className="text-gray-700 text-sm font-medium">
                      {plan.booking_limit_per_month === null
                        ? 'Unlimited bookings'
                        : `${plan.booking_limit_per_month} bookings per month`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-xl bg-green-100 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <p className="text-gray-700 text-sm font-medium">PKR pricing end-to-end</p>
                  </div>
                </div>

                {isProPlan ? (
                  <button
                    disabled={isActive || upgrading || (upgradeRequest && ['pending','accepted','paid','activated'].includes(upgradeRequest.status))}
                    onClick={() => requestProUpgrade(plan.code)}
                    className={`w-full py-4 rounded-2xl font-bold shadow-2xl transition-all duration-300 ${
                      isActive
                        ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-3xl hover:from-orange-600 hover:to-red-600'
                    }`}
                    type="button"
                  >
                    {upgrading ? 'Sending Request...' : (upgradeRequest ? 'Request Already Sent' : 'Request Pro Upgrade')}
                  </button>
                ) : (
                  <button
                    disabled={isActive}
                    className={`w-full py-4 rounded-2xl font-bold shadow transition-all duration-300 ${
                      isActive ? 'bg-gray-200 text-gray-600 cursor-not-allowed' : 'bg-white text-gray-700 border border-gray-200'
                    }`}
                    type="button"
                  >
                    Current Plan
                  </button>
                )}

                {isProPlan && (
                  <p className="text-xs text-gray-500 mt-3">
                    Pro pricing: Rs 1,500 monthly or Rs 10,000 yearly. You get 20% discount on every chef.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
