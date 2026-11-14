import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useStore } from '../store/useStore';

const DEMO_OTP = '123456';

export function LoginPage() {
  useDocumentTitle('Login or Signup', 'Sign in to Stylo with your mobile number and OTP.');

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/';

  const loginWithOtp = useStore((s) => s.loginWithOtp);
  const showToast = useStore((s) => s.showToast);

  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const handleMobileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = mobile.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      setError('Enter a valid 10-digit mobile number (starting with 6–9).');
      return;
    }
    setError('');
    setStep('otp');
    showToast(`Demo OTP sent: ${DEMO_OTP}`, 'info');
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.trim() !== DEMO_OTP) {
      setError(`Invalid OTP. Please enter demo OTP ${DEMO_OTP}.`);
      return;
    }
    setError('');
    loginWithOtp(mobile, name);
    showToast('Signed in to Stylo!', 'success');
    navigate(decodeURIComponent(redirectTarget), { replace: true });
  };

  return (
    <main className="flex min-h-[75vh] items-center justify-center bg-[#F5F5F6] px-4 py-12 pb-24">
      <div className="w-full max-w-md overflow-hidden rounded-lg border border-[#EAEAEC] bg-white shadow-[0_4px_16px_rgba(40,44,63,0.08)]">
        <div className="bg-[#282C3F] px-6 py-6 text-white">
          <p className="text-xs font-bold uppercase tracking-wider text-[#FF905A]">
            Stylo Membership
          </p>
          <h1 className="mt-1 font-display text-2xl font-extrabold">
            {step === 'mobile' ? 'Login or Signup' : 'Verify with OTP'}
          </h1>
          <p className="mt-1 text-xs text-white/80">
            Track orders, save delivery addresses, and unlock member coupons.
          </p>
        </div>

        <div className="p-6">
          {step === 'mobile' ? (
            <form onSubmit={handleMobileSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="login-mobile"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#282C3F]"
                >
                  Mobile Number
                </label>
                <div className="flex items-center rounded border border-[#EAEAEC] focus-within:border-[#282C3F]">
                  <span className="border-r border-[#EAEAEC] bg-[#F5F5F6] px-3 py-2.5 text-sm font-semibold text-[#7E818C]">
                    +91
                  </span>
                  <input
                    id="login-mobile"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => {
                      setMobile(e.target.value.replace(/\D/g, ''));
                      setError('');
                    }}
                    placeholder="10-digit mobile number"
                    className="w-full px-3 py-2.5 text-sm text-[#282C3F] placeholder:text-[#7E818C] focus:outline-none tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="login-name"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#282C3F]"
                >
                  Full Name <span className="font-normal text-[#7E818C]">(Optional for new signup)</span>
                </label>
                <input
                  id="login-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ananya Sharma"
                  className="w-full rounded border border-[#EAEAEC] px-3 py-2.5 text-sm text-[#282C3F] placeholder:text-[#7E818C] focus:border-[#282C3F] focus:outline-none"
                />
              </div>

              {error && (
                <p role="alert" className="text-xs font-semibold text-[#ba1a1a]">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full rounded bg-[#FF3F6C] py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#E02D59]"
              >
                Continue
              </button>

              <p className="text-center text-xs text-[#7E818C]">
                By continuing, you agree to Stylo&apos;s Terms of Use &amp; Privacy Policy.
              </p>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <button
                type="button"
                onClick={() => {
                  setStep('mobile');
                  setOtp('');
                  setError('');
                }}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#7E818C] hover:text-[#282C3F]"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Change number (+91 {mobile})
              </button>

              <div className="rounded border border-[#03A685]/30 bg-[#03A685]/10 px-3.5 py-2.5 text-xs text-[#282C3F]">
                <span className="font-semibold">Demo Verification Code:</span>{' '}
                <strong className="font-mono text-sm tracking-widest text-[#03A685]">
                  {DEMO_OTP}
                </strong>
              </div>

              <div>
                <label
                  htmlFor="login-otp"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#282C3F]"
                >
                  Enter 6-Digit OTP
                </label>
                <input
                  id="login-otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  autoFocus
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, ''));
                    setError('');
                  }}
                  placeholder="123456"
                  className="w-full rounded border border-[#EAEAEC] px-3 py-2.5 text-center font-mono text-lg font-bold tracking-[0.35em] text-[#282C3F] focus:border-[#282C3F] focus:outline-none"
                />
              </div>

              {error && (
                <p role="alert" className="text-xs font-semibold text-[#ba1a1a]">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded bg-[#FF3F6C] py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#E02D59]"
              >
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                Verify &amp; Continue
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
