import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const { isAuthenticated, mockLogin } = useAuth();
  const [authMode, setAuthMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [designation, setDesignation] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [otpMessage, setOtpMessage] = useState('');
  const [otpMessageType, setOtpMessageType] = useState('');
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/website/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (authMode === 'signup') {
      if (!email || !designation) return;
      setOtpValues(['', '', '', '', '', '']);
      setOtpMessage('');
      setOtpMessageType('');
      setIsOtpModalOpen(true);
      return;
    }

    if (!email) return;
    setOtpValues(['', '', '', '', '', '']);
    setOtpMessage('');
    setOtpMessageType('');
    setIsOtpModalOpen(true);
  };

  const handleOtpChange = (index: number, value: string) => {
    const nextChar = value.replace(/\D/g, '').slice(-1);
    const nextOtp = [...otpValues];
    nextOtp[index] = nextChar;
    setOtpValues(nextOtp);

    if (nextChar && index < otpInputsRef.current.length - 1) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, event: React.KeyboardEvent) => {
    if (event.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const enteredOtp = otpValues.join('');
    if (enteredOtp === '123456') {
      // Prototype mode: force authentication state update
      mockLogin(
        { id: 'proto-1', name: 'Prototype User', email, role: 'admin' } as any,
        'prototype-token'
      );

      setOtpMessage('OTP verified successfully. Redirecting...');
      setOtpMessageType('success');
      setTimeout(() => {
        setIsOtpModalOpen(false);
        setOtpValues(['', '', '', '', '', '']);
        navigate('/website/dashboard');
      }, 350);
      return;
    }

    setOtpMessage('Invalid OTP. Please try again.');
    setOtpMessageType('error');
  };

  const handleResendOtp = () => {
    setOtpValues(['', '', '', '', '', '']);
    setOtpMessage('OTP resent. Use 123456 for this prototype.');
    setOtpMessageType('info');
    otpInputsRef.current[0]?.focus();
  };

  return (
    <div className="login-page ds-page-shell">
      <div className="login-bg-shape login-bg-shape-one" aria-hidden="true"></div>
      <div className="login-bg-shape login-bg-shape-two" aria-hidden="true"></div>
      <div className="login-container ds-card">
        <div className="login-header">
          <div className="login-brand-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 3L20 8V16L12 21L4 16V8L12 3Z" stroke="currentColor" strokeWidth="1.8" />
              <path d="M8.5 10.5L12 12.5L15.5 10.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M12 12.5V17.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <h1>Company Umbrella</h1>
          <p>{authMode === 'signin' ? 'Sign in to continue' : 'Create your account'}</p>
        </div>

        <div className="auth-switch" role="tablist" aria-label="Authentication mode">
          <button
            type="button"
            className={`auth-switch-btn ${authMode === 'signin' ? 'active' : ''}`}
            onClick={() => setAuthMode('signin')}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-switch-btn ${authMode === 'signup' ? 'active' : ''}`}
            onClick={() => setAuthMode('signup')}
          >
            Sign Up
          </button>
        </div>

        <form className="login-form" onSubmit={handleAuthSubmit}>
          <div className="login-form-group">
            <label htmlFor="email">Email</label>
            <div className="login-input-wrap">
              <span className="login-input-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M4 7.5C4 6.67 4.67 6 5.5 6H18.5C19.33 6 20 6.67 20 7.5V16.5C20 17.33 19.33 18 18.5 18H5.5C4.67 18 4 17.33 4 16.5V7.5Z" stroke="currentColor" strokeWidth="1.7" />
                  <path d="M4.8 7L12 12L19.2 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
              </span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@company.com"
              />
            </div>
          </div>

          {authMode === 'signup' && (
            <div className="login-form-group">
              <label htmlFor="designation">Designation</label>
              <div className="login-input-wrap">
                <span className="login-input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="7.5" r="3" stroke="currentColor" strokeWidth="1.7" />
                    <path d="M5 19C5.7 16.2 8.1 14.6 12 14.6C15.9 14.6 18.3 16.2 19 19" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                </span>
                <input
                  id="designation"
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  required
                  placeholder="Enter your designation"
                />
              </div>
            </div>
          )}

          {authMode === 'signin' ? (
            <div className="login-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember Me</span>
              </label>
              <a href="#" className="forgot-password" onClick={(e) => e.preventDefault()}>
                Forgot Password?
              </a>
            </div>
          ) : (
            <p className="signup-helper">Prototype mode: OTP is fixed to 123456.</p>
          )}

          <button className="login-submit-button ds-btn-primary" type="submit">
            {authMode === 'signin' ? 'Send OTP' : 'Create Account'}
          </button>

          <p className="auth-footer">
            {authMode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              className="auth-footer-link"
              onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
            >
              {authMode === 'signin' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </form>
      </div>

      {isOtpModalOpen && (
        <div className="otp-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="otp-title">
          <div className="otp-modal">
            <h3 id="otp-title">Verify Your Email</h3>
            <p>Enter the OTP sent to your email</p>

            <div className="otp-input-grid">
              {otpValues.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    otpInputsRef.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                />
              ))}
            </div>

            {otpMessage && <div className={`otp-message ${otpMessageType}`}>{otpMessage}</div>}

            <div className="otp-actions">
              <button type="button" className="otp-verify-btn ds-btn-primary" onClick={handleVerifyOtp}>
                Verify OTP
              </button>
              <button type="button" className="otp-resend-btn ds-btn-secondary" onClick={handleResendOtp}>
                Resend OTP
              </button>
            </div>

            <button type="button" className="otp-close-link" onClick={() => setIsOtpModalOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
