import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig'; // Import custom Axios instance
import logo from '../assets/logos/company-logo.png';
import bgImage from '../assets/images/bg-login.jpg';
import countries from 'world-countries';
import { useNavigate } from 'react-router-dom';

const countryList = countries.map(c => ({ code: c.cca2, name: c.name.common }));

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [redirect, setRedirect] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [regForm, setRegForm] = useState({
    name: '',
    contact: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    country: '',
    state: '',
    district: '',
    city: '',
    pincode: '',
  });
  const [regError, setRegError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // If token exists, redirect to dashboard
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  // Password validation function
  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (password.length < minLength) return 'Password must be at least 8 characters long';
    if (!hasUpperCase) return 'Password must contain at least one uppercase letter';
    if (!hasLowerCase) return 'Password must contain at least one lowercase letter';
    if (!hasNumbers) return 'Password must contain at least one number';
    if (!hasSpecialChar) return 'Password must contain at least one special character';
    
    return null;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const username = e.target.email.value; // Using email field as username per API
    const password = e.target.password.value;
    
    // Basic validation
    if (!username || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }
    
    try {
      const response = await api.post('/common/login', { username, password });
      console.log('Login response:', response.data);
      
      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
        // Store uid as well
        if (response.data.data?.id) {
          localStorage.setItem('uid', response.data.data.id);
        }
        setRedirect(true);
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError('');
    setLoading(true);
    
    // Validation
    if (regForm.password !== regForm.confirmPassword) {
      setRegError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    const passwordError = validatePassword(regForm.password);
    if (passwordError) {
      setRegError(passwordError);
      setLoading(false);
      return;
    }
    
    // Check if all required fields are filled
    const requiredFields = ['name', 'contact', 'email', 'password', 'address', 'country', 'state', 'district', 'city', 'pincode'];
    const missingFields = requiredFields.filter(field => !regForm[field]);
    
    if (missingFields.length > 0) {
      setRegError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      setLoading(false);
      return;
    }
    
    try {
      // Registration API call would go here
      console.log('Registration data:', regForm);
      setRedirect(true);
    } catch (err) {
      setRegError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegChange = (e) => {
    setRegForm({ ...regForm, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (regError) setRegError('');
  };

  // Use useEffect for navigation
  useEffect(() => {
    if (redirect) {
      navigate('/dashboard', { replace: true });
    }
  }, [redirect, navigate]);

  // if (redirect) {
  //   return null;
  // }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden font-poppins"
      style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="relative z-10 w-full max-w-md p-8 bg-white/95 rounded-2xl shadow-2xl">
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="Company Logo" className="h-20 mb-4 drop-shadow-xl rounded-full bg-white/80 p-2" />
          <h2 className={`text-3xl font-extrabold tracking-tight mb-1 ${isLogin ? 'text-primary-dark' : 'text-green-700'}`}>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="text-accent text-sm mb-2">{isLogin ? 'Sign in to your account' : 'Register to get started'}</p>
        </div>
        {isLogin ? (
          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label htmlFor="login-email" className="block text-primary-dark font-semibold mb-1">Email</label>
              <input 
                id="login-email"
                name="email" 
                type="email" 
                required 
                className="w-full px-4 py-2 border border-primary-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white/80 text-primary-dark" 
                placeholder="Enter your email"
                aria-describedby="login-email-error"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-primary-dark font-semibold mb-1">Password</label>
              <input 
                id="login-password"
                name="password" 
                type="password" 
                required 
                className="w-full px-4 py-2 border border-primary-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white/80 text-primary-dark" 
                placeholder="Enter your password"
                aria-describedby="login-password-error"
              />
            </div>
            {error && <div id="login-error" className="text-red-500 text-sm text-center" role="alert">{error}</div>}
            <button 
              type="submit" 
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold shadow-lg hover:bg-blue-700 transition disabled:opacity-50" 
              disabled={loading}
              aria-describedby={loading ? "loading-status" : undefined}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            {loading && <div id="loading-status" className="sr-only">Loading...</div>}
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleRegister}>
            <div>
              <label htmlFor="reg-name" className="block text-primary-dark font-semibold mb-1">Name</label>
              <input 
                id="reg-name"
                name="name" 
                value={regForm.name} 
                onChange={handleRegChange} 
                required 
                className="w-full px-4 py-2 border border-primary-light rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/80 text-primary-dark" 
                placeholder="Enter your name"
                aria-describedby="reg-name-error"
              />
            </div>
            <div>
              <label htmlFor="reg-contact" className="block text-primary-dark font-semibold mb-1">Contact No</label>
              <input 
                id="reg-contact"
                name="contact" 
                value={regForm.contact} 
                onChange={handleRegChange} 
                type="tel"
                required 
                className="w-full px-4 py-2 border border-primary-light rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/80 text-primary-dark" 
                placeholder="Enter your contact number"
                aria-describedby="reg-contact-error"
              />
            </div>
            <div>
              <label htmlFor="reg-email" className="block text-primary-dark font-semibold mb-1">Email</label>
              <input 
                id="reg-email"
                name="email" 
                value={regForm.email} 
                onChange={handleRegChange} 
                type="email" 
                required 
                className="w-full px-4 py-2 border border-primary-light rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/80 text-primary-dark" 
                placeholder="Enter your email"
                aria-describedby="reg-email-error"
              />
            </div>
            <div className="flex gap-2">
              <div className="w-1/2">
                <label htmlFor="reg-password" className="block text-primary-dark font-semibold mb-1">Password</label>
                <input 
                  id="reg-password"
                  name="password" 
                  value={regForm.password} 
                  onChange={handleRegChange} 
                  type="password" 
                  required 
                  className="w-full px-4 py-2 border border-primary-light rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/80 text-primary-dark" 
                  placeholder="Password"
                  aria-describedby="reg-password-error"
                />
              </div>
              <div className="w-1/2">
                <label htmlFor="reg-confirm-password" className="block text-primary-dark font-semibold mb-1">Confirm Password</label>
                <input 
                  id="reg-confirm-password"
                  name="confirmPassword" 
                  value={regForm.confirmPassword} 
                  onChange={handleRegChange} 
                  type="password" 
                  required 
                  className="w-full px-4 py-2 border border-primary-light rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/80 text-primary-dark" 
                  placeholder="Confirm Password"
                  aria-describedby="reg-confirm-password-error"
                />
              </div>
            </div>
            <div>
              <label htmlFor="reg-address" className="block text-primary-dark font-semibold mb-1">Address</label>
              <input 
                id="reg-address"
                name="address" 
                value={regForm.address} 
                onChange={handleRegChange} 
                required 
                className="w-full px-4 py-2 border border-primary-light rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/80 text-primary-dark" 
                placeholder="Enter your address"
                aria-describedby="reg-address-error"
              />
            </div>
            <div>
              <label htmlFor="reg-country" className="block text-primary-dark font-semibold mb-1">Country</label>
              <select 
                id="reg-country"
                name="country" 
                value={regForm.country} 
                onChange={handleRegChange} 
                required 
                className="w-full px-4 py-2 border border-primary-light rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/80 text-primary-dark"
                aria-describedby="reg-country-error"
              >
                <option value="">Select Country</option>
                {countryList.map(c => (
                  <option key={c.code} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="reg-state" className="block text-primary-dark font-semibold mb-1">State</label>
              <input 
                id="reg-state"
                name="state" 
                value={regForm.state} 
                onChange={handleRegChange} 
                required 
                className="w-full px-4 py-2 border border-primary-light rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/80 text-primary-dark" 
                placeholder="Enter your state"
                aria-describedby="reg-state-error"
              />
            </div>
            <div>
              <label htmlFor="reg-district" className="block text-primary-dark font-semibold mb-1">District</label>
              <input 
                id="reg-district"
                name="district" 
                value={regForm.district} 
                onChange={handleRegChange} 
                required 
                className="w-full px-4 py-2 border border-primary-light rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/80 text-primary-dark" 
                placeholder="Enter your district"
                aria-describedby="reg-district-error"
              />
            </div>
            <div>
              <label htmlFor="reg-city" className="block text-primary-dark font-semibold mb-1">City</label>
              <input 
                id="reg-city"
                name="city" 
                value={regForm.city} 
                onChange={handleRegChange} 
                required 
                className="w-full px-4 py-2 border border-primary-light rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/80 text-primary-dark" 
                placeholder="Enter your city"
                aria-describedby="reg-city-error"
              />
            </div>
            <div>
              <label htmlFor="reg-pincode" className="block text-primary-dark font-semibold mb-1">Pincode</label>
              <input 
                id="reg-pincode"
                name="pincode" 
                value={regForm.pincode} 
                onChange={handleRegChange} 
                required 
                className="w-full px-4 py-2 border border-primary-light rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/80 text-primary-dark" 
                placeholder="Enter your pincode"
                aria-describedby="reg-pincode-error"
              />
            </div>
            {regError && <div id="reg-error" className="text-red-500 text-sm text-center" role="alert">{regError}</div>}
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-green-600 to-primary text-white py-2 rounded-lg font-bold shadow-lg hover:from-green-700 hover:to-primary-dark transition disabled:opacity-50"
              disabled={loading}
              aria-describedby={loading ? "reg-loading-status" : undefined}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
            {loading && <div id="reg-loading-status" className="sr-only">Loading...</div>}
          </form>
        )}
        {isLogin ? (
          <>
            <div className="mt-6 text-center">
              <a href="#" className="text-red-500 underline hover:underline text-sm">Forgot password?</a>
            </div>
            <div className="mt-2 text-center">
              <span className="text-gray-600 text-sm">Don't have an account? </span>
              <button type="button" className="text-green-700 underline hover:text-primary text-sm" onClick={() => setIsLogin(false)}>
                Register
              </button>
            </div>
          </>
        ) : (
          <div className="mt-2 text-center">
            <span className="text-gray-600 text-sm">Already have an account? </span>
            <button type="button" className="text-green-700 underline hover:text-primary text-sm" onClick={() => setIsLogin(true)}>
              Login
            </button>
          </div>
        )}
        <div className="mt-8 text-xs text-gray-500 text-center">
          {isLogin ? (
            <>By logging in, you agree to our <a href="#" className=" text-blue-500 underline hover:text-primary">Terms & Conditions</a>.</>
          ) : (
            <>By registering, you agree to our <a href="#" className=" text-blue-500 underline hover:text-primary">Terms & Conditions</a>.</>
          )}
        </div>
        <div className="mt-2 text-xs text-gray-400 text-center">
          © {new Date().getFullYear()} ETribe. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Login;