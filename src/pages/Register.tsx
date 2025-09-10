import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GraduationCap, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/config'; // Import from your config file


// Country data with flags and dial codes
const countries = [
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'PK', name: 'Pakistan', dialCode: '+92', flag: '🇵🇰' },
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦' },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪' },
  { code: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳' },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', dialCode: '+82', flag: '🇰🇷' },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬' },
  { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷' },
];

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [selectedCountry, setSelectedCountry] = useState(countries[2]); // Default to Pakistan
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d+$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must contain only digits';
    } else if (formData.phone.length < 7) {
      newErrors.phone = 'Phone number is too short';
    } else if (formData.phone.length > 15) {
      newErrors.phone = 'Phone number is too long';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };



const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) {
    return;
  }
  
  setIsLoading(true);

  try {
    // Combine country code with phone number
    const fullPhoneNumber = `${selectedCountry.dialCode}${formData.phone}`;
    
    // Use the environment variable for the API URL
    const response = await fetch(`${API_BASE_URL}/user/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        phone: fullPhoneNumber,
        password: formData.password
      }),
    });

      const data = await response.json();

      if (response.ok && data.status) {
        toast({
          title: 'Registration Successful',
          description: 'Your account has been created successfully. You can now log in.',
          variant: 'default',
        });
        
        // Redirect to login page after successful registration
        navigate('/login');
      } else {
        let errorMessage = 'Registration failed. Please try again.';
        
        if (data.message) {
          errorMessage = data.message;
        } else if (data.data?.errors) {
          // Handle validation errors from API
          const errors = data.data.errors;
          errorMessage = Object.values(errors).flat().join(', ');
        }
        
        toast({
          title: 'Registration Failed',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      let errorMessage = 'An error occurred while trying to register.';
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Registration Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <GraduationCap className="text-white" size={48} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">SmartPaper AI</h1>
          <p className="text-white/80">Transforming Education with Intelligence</p>
        </div>

        <Card className="glassmorphism-strong border-white/30 animate-slide-up">
          <CardHeader className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-4 text-white hover:bg-white/20"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={20} />
            </Button>
            <CardTitle className="text-white text-center">Create Account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white/90">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="glass-input"
                  placeholder="Enter your full name"
                  required
                />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/90">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="glass-input"
                  placeholder="Enter your email"
                  required
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white/90">Phone Number</Label>
                <div className="flex gap-2">
                  <Select
                    value={selectedCountry.code}
                    onValueChange={(value) => {
                      const country = countries.find(c => c.code === value);
                      if (country) setSelectedCountry(country);
                    }}
                  >
                    <SelectTrigger className="w-28 glass-input flex items-center">
                      <SelectValue>
                        <div className="flex items-center">
                          <span className="mr-2">{selectedCountry.flag}</span>
                          <span>{selectedCountry.dialCode}</span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="glassmorphism-strong border-white/30">
                      {countries.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          <div className="flex items-center">
                            <span className="mr-2">{country.flag}</span>
                            <span className="mr-2">{country.dialCode}</span>
                            <span className="text-sm">{country.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="glass-input flex-1"
                    placeholder="Phone number"
                    required
                  />
                </div>
                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                <p className="text-white/60 text-xs">
                  Full number: {selectedCountry.dialCode}{formData.phone || 'XXXXXXX'}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/90">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className="glass-input pr-10"
                    placeholder="Create a password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-white/70" />
                    ) : (
                      <Eye className="h-4 w-4 text-white/70" />
                    )}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white/90">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="glass-input pr-10"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-white/70" />
                    ) : (
                      <Eye className="h-4 w-4 text-white/70" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full emerald-gradient text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </div>
                ) : 'Create Account'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-white/80 text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-emerald-300 hover:text-emerald-200 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}