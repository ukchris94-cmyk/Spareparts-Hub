import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { Package, Eye, EyeOff, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { validateEmail, validatePassword, validatePhone, validateName, formatPhoneNumber } from '../lib/validation';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const validateForm = () => {
    const newErrors = {};
    
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid) {
      newErrors.email = emailValidation.message;
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      const user = await login(formData.email, formData.password);
      toast.success(`Welcome back, ${user.full_name}!`);
      navigate('/dashboard');
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
      
      // Set field-specific errors if available
      if (error.response?.status === 401) {
        setErrors({
          email: 'Invalid email or password',
          password: 'Invalid email or password',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBlur = (field) => {
    if (field === 'email') {
      const validation = validateEmail(formData.email);
      if (!validation.valid) {
        setErrors({ ...errors, email: validation.message });
      } else {
        const newErrors = { ...errors };
        delete newErrors.email;
        setErrors(newErrors);
      }
    }
  };

  return (
    <div className= "min-h-screen flex items-center justify-center p-4 bg-[#09090B] ">
      <Card className= "w-full max-w-md bg-zinc-900/50 border-zinc-800 ">
        <CardHeader className= "text-center ">
          <Link to= "/ " className= "flex items-center justify-center gap-2 mb-4 ">
            <Package className= "h-8 w-8 text-amber-500 " />
            <span className= "font-bold text-xl ">SpareParts Hub</span>
          </Link>
          <CardTitle className= "text-2xl font-black ">Welcome Back</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className= "space-y-4 ">
            <div className= "space-y-2 ">
              <Label htmlFor= "email " className= "label-text ">Email</Label>
              <Input
                id= "email "
                type= "email "
                placeholder= "your@email.com "
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) {
                    const validation = validateEmail(e.target.value);
                    if (validation.valid) {
                      const newErrors = { ...errors };
                      delete newErrors.email;
                      setErrors(newErrors);
                    }
                  }
                }}
                onBlur={() => handleBlur('email')}
                required
                className= {`bg-black/20 border-zinc-800 focus:border-amber-500 h-12 ${errors.email ? 'border-red-500' : ''}`}
                data-testid= "login-email "
              />
              {errors.email && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email}
                </p>
              )}
            </div>
            <div className= "space-y-2 ">
              <Label htmlFor= "password " className= "label-text ">Password</Label>
              <div className= "relative ">
                <Input
                  id= "password "
                  type={showPassword ? 'text' : 'password'}
                  placeholder= "•••••••• "
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (errors.password) {
                      const newErrors = { ...errors };
                      delete newErrors.password;
                      setErrors(newErrors);
                    }
                  }}
                  required
                  className= {`bg-black/20 border-zinc-800 focus:border-amber-500 h-12 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  data-testid= "login-password "
                />
                <button
                  type= "button "
                  onClick={() => setShowPassword(!showPassword)}
                  className= "absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white "
                >
                  {showPassword ? <EyeOff className= "h-5 w-5 " /> : <Eye className= "h-5 w-5 " />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.password}
                </p>
              )}
            </div>
            <Button
              type= "submit "
              disabled={loading}
              className= "w-full bg-amber-500 text-black hover:bg-amber-400 font-bold uppercase tracking-wide h-12 btn-press "
              data-testid= "login-submit "
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <p className= "text-center text-sm text-zinc-400 mt-6 ">
            Don't have an account?{' '}
            <Link to= "/register " className= "text-amber-500 hover:underline ">
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    role: searchParams.get('role') || 'client',
    business_name: '',
    address: '',
  });

  const validateForm = () => {
    const newErrors = {};
    
    const nameValidation = validateName(formData.full_name);
    if (!nameValidation.valid) {
      newErrors.full_name = nameValidation.message;
    }
    
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid) {
      newErrors.email = emailValidation.message;
    }
    
    const phoneValidation = validatePhone(formData.phone);
    if (!phoneValidation.valid) {
      newErrors.phone = phoneValidation.message;
    }
    
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.message;
    }
    
    if (formData.role === 'vendor' && !formData.business_name.trim()) {
      newErrors.business_name = 'Business name is required for vendors';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent multiple submissions
    if (loading) {
      return;
    }
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      // Format phone number before sending
      const submitData = {
        ...formData,
        phone: formatPhoneNumber(formData.phone),
      };
      
      const user = await register(submitData);
      
      if (user) {
        toast.success(`Welcome to SpareParts Hub, ${user.full_name}!`);
        // Navigate after successful registration
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.detail || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        if (errorMessage.includes('Email') || errorMessage.includes('email')) {
          setErrors({ email: 'This email is already registered' });
        } else if (errorMessage.includes('Business name')) {
          setErrors({ business_name: errorMessage });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (password) => {
    setFormData({ ...formData, password });
    const validation = validatePassword(password);
    setPasswordStrength(validation);
    
    if (errors.password && validation.valid) {
      const newErrors = { ...errors };
      delete newErrors.password;
      setErrors(newErrors);
    }
  };

  const handleFieldBlur = (field, value) => {
    let validation;
    
    switch (field) {
      case 'full_name':
        validation = validateName(value);
        break;
      case 'email':
        validation = validateEmail(value);
        break;
      case 'phone':
        validation = validatePhone(value);
        break;
      default:
        return;
    }
    
    if (!validation.valid) {
      setErrors({ ...errors, [field]: validation.message });
    } else {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const getPasswordStrengthColor = () => {
    if (!passwordStrength || !passwordStrength.strength) return '';
    if (passwordStrength.strength <= 2) return 'bg-red-500';
    if (passwordStrength.strength <= 3) return 'bg-yellow-500';
    if (passwordStrength.strength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <div className= "min-h-screen flex items-center justify-center p-4 bg-[#09090B] ">
      <Card className= "w-full max-w-md bg-zinc-900/50 border-zinc-800 ">
        <CardHeader className= "text-center ">
          <Link to= "/ " className= "flex items-center justify-center gap-2 mb-4 ">
            <Package className= "h-8 w-8 text-amber-500 " />
            <span className= "font-bold text-xl ">SpareParts Hub</span>
          </Link>
          <CardTitle className= "text-2xl font-black ">Create Account</CardTitle>
          <CardDescription>Join the largest auto parts network in Port Harcourt</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className= "space-y-4 ">
            <div className= "space-y-2 ">
              <Label htmlFor= "role " className= "label-text ">I am a</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value) => setFormData({ ...formData, role: value })}
                className="bg-black/20 border-zinc-800 h-12"
              >
                <SelectContent>
                  <SelectItem value="client">Mechanic (Client)</SelectItem>
                  <SelectItem value="vendor">Spare Parts Vendor</SelectItem>
                  <SelectItem value="dispatcher">Dispatcher/Driver</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className= "space-y-2 ">
              <Label htmlFor= "full_name " className= "label-text ">Full Name</Label>
              <Input
                id= "full_name "
                placeholder= "John Doe "
                value={formData.full_name}
                onChange={(e) => {
                  setFormData({ ...formData, full_name: e.target.value });
                  if (errors.full_name) {
                    const validation = validateName(e.target.value);
                    if (validation.valid) {
                      const newErrors = { ...errors };
                      delete newErrors.full_name;
                      setErrors(newErrors);
                    }
                  }
                }}
                onBlur={() => handleFieldBlur('full_name', formData.full_name)}
                required
                className= {`bg-black/20 border-zinc-800 focus:border-amber-500 h-12 ${errors.full_name ? 'border-red-500' : ''}`}
                data-testid= "register-name "
              />
              {errors.full_name && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.full_name}
                </p>
              )}
            </div>
            <div className= "space-y-2 ">
              <Label htmlFor= "email " className= "label-text ">Email</Label>
              <Input
                id= "email "
                type= "email "
                placeholder= "your@email.com "
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) {
                    const validation = validateEmail(e.target.value);
                    if (validation.valid) {
                      const newErrors = { ...errors };
                      delete newErrors.email;
                      setErrors(newErrors);
                    }
                  }
                }}
                onBlur={() => handleFieldBlur('email', formData.email)}
                required
                className= {`bg-black/20 border-zinc-800 focus:border-amber-500 h-12 ${errors.email ? 'border-red-500' : ''}`}
                data-testid= "register-email "
              />
              {errors.email && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email}
                </p>
              )}
            </div>
            <div className= "space-y-2 ">
              <Label htmlFor= "phone " className= "label-text ">Phone</Label>
              <Input
                id= "phone "
                type= "tel "
                placeholder= "+234 801 234 5678 "
                value={formData.phone}
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value });
                  if (errors.phone) {
                    const validation = validatePhone(e.target.value);
                    if (validation.valid) {
                      const newErrors = { ...errors };
                      delete newErrors.phone;
                      setErrors(newErrors);
                    }
                  }
                }}
                onBlur={() => handleFieldBlur('phone', formData.phone)}
                required
                className= {`bg-black/20 border-zinc-800 focus:border-amber-500 h-12 ${errors.phone ? 'border-red-500' : ''}`}
                data-testid= "register-phone "
              />
              {errors.phone && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.phone}
                </p>
              )}
              <p className="text-xs text-zinc-500">Format: +234 801 234 5678 or 08012345678</p>
            </div>
            {(formData.role === 'vendor') && (
              <div className= "space-y-2 ">
                <Label htmlFor= "business_name " className= "label-text ">Business Name</Label>
                <Input
                  id= "business_name "
                  placeholder= "Your Shop Name "
                  value={formData.business_name}
                  onChange={(e) => {
                    setFormData({ ...formData, business_name: e.target.value });
                    if (errors.business_name) {
                      const newErrors = { ...errors };
                      delete newErrors.business_name;
                      setErrors(newErrors);
                    }
                  }}
                  className= {`bg-black/20 border-zinc-800 focus:border-amber-500 h-12 ${errors.business_name ? 'border-red-500' : ''}`}
                  data-testid= "register-business "
                />
                {errors.business_name && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.business_name}
                  </p>
                )}
              </div>
            )}
            <div className= "space-y-2 ">
              <Label htmlFor= "address " className= "label-text ">Address</Label>
              <Input
                id= "address "
                placeholder= "Your address in Port Harcourt "
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className= "bg-black/20 border-zinc-800 focus:border-amber-500 h-12 "
                data-testid= "register-address "
              />
            </div>
            <div className= "space-y-2 ">
              <Label htmlFor= "password " className= "label-text ">Password</Label>
              <div className= "relative ">
                <Input
                  id= "password "
                  type={showPassword ? 'text' : 'password'}
                  placeholder= "•••••••• "
                  value={formData.password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  required
                  minLength={6}
                  className= {`bg-black/20 border-zinc-800 focus:border-amber-500 h-12 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  data-testid= "register-password "
                />
                <button
                  type= "button "
                  onClick={() => setShowPassword(!showPassword)}
                  className= "absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white "
                >
                  {showPassword ? <EyeOff className= "h-5 w-5 " /> : <Eye className= "h-5 w-5 " />}
                </button>
              </div>
              {passwordStrength && formData.password && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`${passwordStrength.valid ? 'text-green-500' : 'text-zinc-400'}`}>
                      {passwordStrength.message}
                    </span>
                    {passwordStrength.valid && (
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                    )}
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded ${
                          level <= (passwordStrength.strength || 0)
                            ? getPasswordStrengthColor()
                            : 'bg-zinc-800'
                        }`}
                      />
                    ))}
                  </div>
                  {passwordStrength.checks && (
                    <div className="grid grid-cols-2 gap-1 text-xs text-zinc-500 mt-2">
                      <div className={`flex items-center gap-1 ${passwordStrength.checks.length ? 'text-green-500' : ''}`}>
                        {passwordStrength.checks.length ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        <span>8+ characters</span>
                      </div>
                      <div className={`flex items-center gap-1 ${passwordStrength.checks.uppercase ? 'text-green-500' : ''}`}>
                        {passwordStrength.checks.uppercase ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        <span>Uppercase</span>
                      </div>
                      <div className={`flex items-center gap-1 ${passwordStrength.checks.lowercase ? 'text-green-500' : ''}`}>
                        {passwordStrength.checks.lowercase ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        <span>Lowercase</span>
                      </div>
                      <div className={`flex items-center gap-1 ${passwordStrength.checks.number ? 'text-green-500' : ''}`}>
                        {passwordStrength.checks.number ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        <span>Number</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {errors.password && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.password}
                </p>
              )}
            </div>
            <Button
              type= "submit "
              disabled={loading}
              className= "w-full bg-amber-500 text-black hover:bg-amber-400 font-bold uppercase tracking-wide h-12 btn-press "
              data-testid= "register-submit "
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
          <p className= "text-center text-sm text-zinc-400 mt-6 ">
            Already have an account?{' '}
            <Link to= "/login " className= "text-amber-500 hover:underline ">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
