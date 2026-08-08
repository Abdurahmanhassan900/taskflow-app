import { type ReactElement, useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Register = (): ReactElement => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const success = await register({ fullName, email, password });
    if (success) navigate('/dashboard');
  };

  const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthLabel = ['', 'Weak', 'Fair', 'Strong'][passwordStrength];
  const strengthColor = ['', '#ef4444', '#f59e0b', '#10b981'][passwordStrength];

  return (
    <div
      className="min-h-screen flex"
      style={{ background: '#08060d', fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <style>{`
        @keyframes float-reg { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        .tf-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 12px 16px;
          color: #fff;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .tf-input:focus {
          border-color: rgba(170,59,255,0.5);
          box-shadow: 0 0 0 3px rgba(170,59,255,0.1);
        }
        .tf-input::placeholder { color: rgba(255,255,255,0.25); }
      `}</style>

      {/* Left decorative panel */}
      <div
        className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden"
        style={{ background: 'rgba(170,59,255,0.03)', borderRight: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(170,59,255,0.1) 0%, transparent 70%)',
          }}
        />
        <div className="relative z-10 text-center px-12 w-full max-w-sm">
          <h2 className="text-3xl font-black text-white mb-3">Start shipping.</h2>
          <p className="text-base mb-10" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Join thousands of teams who get more done with TaskFlow.
          </p>

          {/* Feature list */}
          <div className="space-y-4 text-left">
            {[
              { icon: '✓', text: 'Unlimited tasks on the free plan' },
              { icon: '✓', text: 'Invite your team in seconds' },
              { icon: '✓', text: 'Real-time progress tracking' },
              { icon: '✓', text: 'No credit card required' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                  style={{ background: 'rgba(170,59,255,0.15)', color: '#aa3bff', border: '1px solid rgba(170,59,255,0.3)' }}
                >
                  {item.icon}
                </div>
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div
            className="mt-10 px-4 py-4 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex -space-x-2 mb-3">
              {['SC', 'MR', 'AT', 'JL'].map((initials, i) => (
                <div
                  key={initials}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2"
                  style={{
                    background: `hsl(${260 + i * 20}, 70%, 55%)`,
                    borderColor: '#08060d',
                    color: '#fff',
                    zIndex: 4 - i,
                  }}
                >
                  {initials}
                </div>
              ))}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs border-2"
                style={{ background: 'rgba(255,255,255,0.08)', borderColor: '#08060d', color: 'rgba(255,255,255,0.5)' }}
              >
                +12k
              </div>
            </div>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Join 12,000+ teams already using TaskFlow
            </p>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link to="/" className="flex items-center gap-2 mb-10">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #aa3bff, #7c3aed)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
            <span className="font-bold text-lg text-white">TaskFlow</span>
          </Link>

          <h1 className="text-3xl font-black text-white mb-2">Create account</h1>
          <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#aa3bff' }} className="font-medium hover:underline">
              Sign in
            </Link>
          </p>

          {error && (
            <div
              className="mb-6 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.55)' }}>
                Full name
              </label>
              <input
                type="text"
                required
                className="tf-input"
                placeholder="Jane Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.55)' }}>
                Email address
              </label>
              <input
                type="email"
                required
                className="tf-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.55)' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="tf-input"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.7)')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.3)')}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {/* Password strength */}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{
                          background: passwordStrength >= level ? strengthColor : 'rgba(255,255,255,0.08)',
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-xs" style={{ color: strengthColor }}>
                    {strengthLabel} password
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all"
              style={{
                background: loading ? 'rgba(170,59,255,0.4)' : 'linear-gradient(135deg, #aa3bff, #7c3aed)',
                color: '#fff',
                boxShadow: loading ? 'none' : '0 0 20px rgba(170,59,255,0.3)',
                cursor: loading ? 'not-allowed' : 'pointer',
                border: 'none',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create account →'
              )}
            </button>

            <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.25)' }}>
              By creating an account, you agree to our{' '}
              <a href="#" className="hover:underline" style={{ color: 'rgba(255,255,255,0.4)' }}>Terms</a>{' '}
              and{' '}
              <a href="#" className="hover:underline" style={{ color: 'rgba(255,255,255,0.4)' }}>Privacy Policy</a>.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
