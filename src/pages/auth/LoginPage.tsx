import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './LoginPage.css';

type AllowedBackendRole = 'company_admin' | 'company_secretary';

const ALLOWED_BACKEND_ROLES: AllowedBackendRole[] = ['company_admin', 'company_secretary'];

const isAllowedBackendRole = (role: unknown): role is AllowedBackendRole =>
  typeof role === 'string' && ALLOWED_BACKEND_ROLES.includes(role as AllowedBackendRole);

const mapBackendRoleToAppRole = (role: AllowedBackendRole) =>
  role === 'company_admin' ? 'admin' : 'manager';

const generateCaptchaString = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const LoginPage = () => {
  const { isAuthenticated, mockLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [generatedCaptcha, setGeneratedCaptcha] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [authMessageType, setAuthMessageType] = useState<'success' | 'error' | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  useEffect(() => {
    setGeneratedCaptcha(generateCaptchaString());
  }, []);

  const refreshCaptcha = () => {
    setGeneratedCaptcha(generateCaptchaString());
    setCaptchaInput('');
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !captchaInput) {
      setAuthMessage('Email, password, and captcha are required.');
      setAuthMessageType('error');
      return;
    }
    if (captchaInput.trim() !== generatedCaptcha) {
      setAuthMessage('Invalid captcha');
      setAuthMessageType('error');
      return;
    }

    const submitLogin = async () => {
      try {
        setIsSubmitting(true);
        setAuthMessage('');
        setAuthMessageType('');

        const response = await axios.post('http://localhost:5000/api/auth/login', {
          email,
          password,
          captcha: captchaInput,
        });

        const responseData = response?.data || {};
        const token = responseData?.token;
        const backendRole = responseData?.role;

        // If token is present, login directly (OTP bypassed)
        if (token) {
          if (!isAllowedBackendRole(backendRole)) {
            setAuthMessage('Only Company Admin and Company Secretary are allowed to login.');
            setAuthMessageType('error');
            refreshCaptcha();
            setIsSubmitting(false);
            return;
          }

          const mappedRole = mapBackendRoleToAppRole(backendRole);
          const userForSession = {
            _id: responseData?.user?._id || email,
            id: responseData?.user?._id || email,
            email: responseData?.user?.email || email,
            name: responseData?.user?.name || email.split('@')[0] || 'User',
            role: mappedRole,
          };

          mockLogin(userForSession as any, token, rememberMe);
          setAuthMessage('Login successful. Redirecting to dashboard...');
          setAuthMessageType('success');

          setTimeout(() => {
            navigate('/website/dashboard');
          }, 500);

          return;
        }

        setOtpEmail(email);
        setAuthMessage('OTP sent to your email');
        setAuthMessageType('success');
        setOtpValues(['', '', '', '', '', '']);
        setOtpMessage('');
        setOtpMessageType('');
        setIsOtpModalOpen(true);
      } catch (error: any) {
        const apiErrorMessage =
          error?.response?.data?.message || 'Unable to send OTP. Please try again.';
        setAuthMessage(apiErrorMessage);
        setAuthMessageType('error');
        refreshCaptcha();
      } finally {
        setIsSubmitting(false);
      }
    };

    submitLogin();
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
    if (enteredOtp.length !== 6) {
      setOtpMessage('Please enter a valid 6 digit OTP.');
      setOtpMessageType('error');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/verify-otp', {
        email: otpEmail || email,
        otp: enteredOtp,
      });

      const responseData = response?.data || {};
      const responsePayload = responseData?.data || responseData;
      const backendRole = responsePayload?.role || responsePayload?.user?.role;

      if (!isAllowedBackendRole(backendRole)) {
        setOtpMessage('Only Company Admin and Company Secretary are allowed to login.');
        setOtpMessageType('error');
        return;
      }

      const mappedRole = mapBackendRoleToAppRole(backendRole);
      const token = responsePayload?.token;

      if (!token) {
        setOtpMessage('Invalid server response. Please try again.');
        setOtpMessageType('error');
        return;
      }

      const userForSession = {
        _id: responsePayload?.user?._id || email,
        id: responsePayload?.user?._id || email,
        email: responsePayload?.user?.email || email,
        name: responsePayload?.user?.name || email.split('@')[0] || 'User',
        role: mappedRole,
      };

      mockLogin(userForSession as any, token, rememberMe);

      setOtpMessage('OTP verified successfully. Redirecting...');
      setOtpMessageType('success');
      setTimeout(() => {
        setIsOtpModalOpen(false);
        setOtpValues(['', '', '', '', '', '']);
        setOtpEmail('');
        navigate('/website/dashboard');
      }, 350);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Invalid OTP. Please try again.';
      setOtpMessage(message);
      setOtpMessageType('error');
    }
  };

  const handleResendOtp = () => {
    setOtpValues(['', '', '', '', '', '']);
    setOtpMessage('Please click Send OTP again to get a new code.');
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
          <p>Sign in to continue</p>
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

          <div className="login-form-group">
            <label htmlFor="password">Password</label>
            <div className="login-input-wrap">
              <span className="login-input-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.7" />
                  <path d="M8 10V8C8 5.79 9.79 4 12 4C14.21 4 16 5.79 16 8V10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
              </span>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div className="login-form-group">
            <label htmlFor="captcha">Captcha</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                aria-hidden="true"
                style={{
                  border: '1px solid var(--ds-border)',
                  borderRadius: 'var(--ds-input-radius)',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 700,
                  letterSpacing: '1.2px',
                  color: '#1e3a8a',
                  background: '#f8fbff',
                  userSelect: 'none',
                  minHeight: '46px',
                  minWidth: '120px',
                  padding: '0 12px',
                }}
              >
                {generatedCaptcha}
              </div>
              <button
                type="button"
                onClick={refreshCaptcha}
                aria-label="Refresh captcha"
                style={{
                  border: '1px solid var(--ds-border)',
                  borderRadius: 'var(--ds-input-radius)',
                  background: '#ffffff',
                  minHeight: '46px',
                  minWidth: '46px',
                  cursor: 'pointer',
                }}
              >
                Refresh
              </button>
            </div>
            <label htmlFor="captcha" style={{ marginTop: '10px' }}>
              Enter Captcha
            </label>
            <div className="login-input-wrap">
              <input
                id="captcha"
                type="text"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                required
                placeholder="Enter captcha"
                style={{ padding: '12px 14px' }}
              />
            </div>
          </div>

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

          <button
            className="login-submit-button ds-btn-primary"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send OTP'}
          </button>
          {authMessage && (
            <p
              className="signup-helper"
              style={{
                color: authMessageType === 'error' ? '#b91c1c' : '#166534',
                marginTop: '2px',
              }}
            >
              {authMessage}
            </p>
          )}
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
