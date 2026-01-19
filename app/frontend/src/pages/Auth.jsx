import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { Package, Eye, EyeOff } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(formData.email, formData.password);
      toast.success(`Welcome back, ${user.full_name}!`);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
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
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className= "bg-black/20 border-zinc-800 focus:border-amber-500 h-12 "
                data-testid= "login-email "
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
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className= "bg-black/20 border-zinc-800 focus:border-amber-500 h-12 pr-10 "
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
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    role: searchParams.get('role') || 'client',
    business_name: '',
    address: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(formData);
      toast.success(`Welcome to SpareParts Hub, ${user.full_name}!`);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
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
          <CardTitle className= "text-2xl font-black ">Create Account</CardTitle>
          <CardDescription>Join the largest auto parts network in Port Harcourt</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className= "space-y-4 ">
            <div className= "space-y-2 ">
              <Label htmlFor= "role " className= "label-text ">I am a</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger className= "bg-black/20 border-zinc-800 h-12 " data-testid= "register-role ">
                  <SelectValue placeholder= "Select role " />
                </SelectTrigger>
                <SelectContent className= "bg-zinc-900 border-zinc-800 ">
                  <SelectItem value= "client ">Mechanic (Client)</SelectItem>
                  <SelectItem value= "vendor ">Spare Parts Vendor</SelectItem>
                  <SelectItem value= "dispatcher ">Dispatcher/Driver</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className= "space-y-2 ">
              <Label htmlFor= "full_name " className= "label-text ">Full Name</Label>
              <Input
                id= "full_name "
                placeholder= "John Doe "
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
                className= "bg-black/20 border-zinc-800 focus:border-amber-500 h-12 "
                data-testid= "register-name "
              />
            </div>
            <div className= "space-y-2 ">
              <Label htmlFor= "email " className= "label-text ">Email</Label>
              <Input
                id= "email "
                type= "email "
                placeholder= "your@email.com "
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className= "bg-black/20 border-zinc-800 focus:border-amber-500 h-12 "
                data-testid= "register-email "
              />
            </div>
            <div className= "space-y-2 ">
              <Label htmlFor= "phone " className= "label-text ">Phone</Label>
              <Input
                id= "phone "
                type= "tel "
                placeholder= "+234... "
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className= "bg-black/20 border-zinc-800 focus:border-amber-500 h-12 "
                data-testid= "register-phone "
              />
            </div>
            {(formData.role === 'vendor') && (
              <div className= "space-y-2 ">
                <Label htmlFor= "business_name " className= "label-text ">Business Name</Label>
                <Input
                  id= "business_name "
                  placeholder= "Your Shop Name "
                  value={formData.business_name}
                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                  className= "bg-black/20 border-zinc-800 focus:border-amber-500 h-12 "
                  data-testid= "register-business "
                />
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
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  className= "bg-black/20 border-zinc-800 focus:border-amber-500 h-12 pr-10 "
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
