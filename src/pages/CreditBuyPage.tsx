import { useState } from "react"; 
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import TeacherSidebar from '@/components/TeacherSidebar';
import GlassmorphismLayout from "@/components/GlassmorphismLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  CreditCard,
  Download,
  FileText,
  Calendar,
  DollarSign,
  Receipt,
  Building,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  Eye,
  Copy,
  ArrowUpRight,
  Shield,
  BadgeCheck,
  X,
  Minus,
  Plus,
  Trash2,
  Edit,
  Check,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Loader2,
} from "lucide-react";

// --- INTERFACE DEFINITIONS ---
interface BillingHistory {
  id: number;
  date: string;
  description: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  invoiceId: string;
  creditsAdded?: number;
  paymentMethod: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
}

interface PaymentMethod {
  id: number;
  type: 'card' | 'paypal' | 'bank_transfer';
  lastFour: string;
  brand: string;
  expiryDate?: string;
  isDefault: boolean;
  cardHolder?: string;
}

interface Subscription {
  plan: string;
  status: 'active' | 'canceled' | 'past_due';
  nextBillingDate: string;
  price: number;
  credits: number;
  features: string[];
}

interface BillingInfo {
  id?: number;
  name: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  email: string;
  phone: string;
  isDefault: boolean;
}

interface CreditPackage {
  id: number;
  name: string;
  credits: number;
  price: number;
  originalPrice?: number;
  popular?: boolean;
  bestValue?: boolean;
  features: string[];
  savings?: string;
}

// --- CONSTANTS ---
const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 1,
    name: "Starter Pack",
    credits: 100,
    price: 9.99,
    features: ["Basic features", "Email support", "7-day validity"],
    popular: false,
    bestValue: false
  },
  {
    id: 2,
    name: "Pro Pack",
    credits: 500,
    price: 39.99,
    originalPrice: 49.99,
    features: ["All basic features", "Priority support", "30-day validity", "Advanced analytics"],
    popular: true,
    bestValue: false,
    savings: "20% off"
  },
  {
    id: 3,
    name: "Enterprise",
    credits: 2000,
    price: 149.99,
    originalPrice: 199.99,
    features: ["All pro features", "24/7 support", "90-day validity", "Custom integrations", "Dedicated account manager"],
    popular: false,
    bestValue: true,
    savings: "25% off"
  }
];

const COUNTRIES = [
  "United States", "Canada", "United Kingdom", "Australia", "Germany", 
  "France", "Japan", "India", "Brazil", "United Arab Emirates"
];

const STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", 
  "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", 
  "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", 
  "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", 
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", 
  "New Hampshire", "New Jersey", "New Mexico", "New York", 
  "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", 
  "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", 
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", 
  "West Virginia", "Wisconsin", "Wyoming"
];

// --- MODAL COMPONENTS ---

// Buy Credits Modal
const BuyCreditsModal = ({ isOpen, onClose, onPurchase, toast }) => {
  const [selectedPackage, setSelectedPackage] = useState<number>(2);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("default");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const selectedPkg = CREDIT_PACKAGES.find(pkg => pkg.id === selectedPackage);
  const paymentMethods = [
    { id: "default", type: "card", label: "Visa **** 4242", isDefault: true },
    { id: "paypal", type: "paypal", label: "PayPal Account", isDefault: false },
    { id: "new", type: "new", label: "Add New Card", isDefault: false }
  ];

  const handlePurchase = async () => {
    if (!selectedPaymentMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    onPurchase(selectedPkg!);
    onClose();
    
    toast({
      title: "Purchase Successful!",
      description: `${selectedPkg?.credits.toLocaleString()} credits have been added to your account.`,
      variant: "success",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-emerald-400/30 w-full max-w-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <DollarSign className="text-emerald-400" size={24} />
              Buy Credits
            </h2>
            <p className="text-slate-300 text-sm mt-1">Choose your credit package and payment method</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-white/10 rounded-full"
          >
            <X size={20} />
          </Button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Credit Packages */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg">Select Package</h3>
            <div className="grid grid-cols-1 gap-4">
              {CREDIT_PACKAGES.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    selectedPackage === pkg.id
                      ? 'border-emerald-400/50 bg-emerald-400/10'
                      : 'border-white/10 bg-slate-700/50 hover:border-white/20'
                  }`}
                  onClick={() => setSelectedPackage(pkg.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-white font-semibold text-lg">{pkg.name}</h4>
                        {pkg.popular && (
                          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 text-xs">
                            POPULAR
                          </Badge>
                        )}
                        {pkg.bestValue && (
                          <Badge className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white border-0 text-xs">
                            BEST VALUE
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-3xl font-bold text-emerald-300">
                          {pkg.credits.toLocaleString()} Cr
                        </span>
                        <div className="flex items-center gap-2">
                          {pkg.originalPrice && (
                            <span className="text-slate-400 line-through text-sm">
                              ${pkg.originalPrice}
                            </span>
                          )}
                          <span className="text-2xl font-bold text-white">${pkg.price}</span>
                          {pkg.savings && (
                            <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                              {pkg.savings}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        {pkg.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-slate-300 text-sm">
                            <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedPackage === pkg.id 
                        ? 'border-emerald-400 bg-emerald-400' 
                        : 'border-slate-400'
                    }`}>
                      {selectedPackage === pkg.id && <Check size={14} className="text-white" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg">Payment Method</h3>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    selectedPaymentMethod === method.id
                      ? 'border-purple-400/50 bg-purple-400/10'
                      : 'border-white/10 bg-slate-700/50 hover:border-white/20'
                  }`}
                  onClick={() => setSelectedPaymentMethod(method.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-600/50 flex items-center justify-center">
                        <CreditCard size={18} className="text-slate-300" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{method.label}</p>
                        {method.isDefault && (
                          <Badge className="bg-emerald-500/20 text-emerald-300 border-0 text-xs mt-1">
                            Default
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedPaymentMethod === method.id 
                        ? 'border-purple-400 bg-purple-400' 
                        : 'border-slate-400'
                    }`}>
                      {selectedPaymentMethod === method.id && <Check size={12} className="text-white" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-slate-700/30 rounded-xl p-4 border border-white/10">
            <h4 className="text-white font-semibold mb-3">Order Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Credits:</span>
                <span className="text-white font-medium">{selectedPkg?.credits.toLocaleString()} Cr</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Price:</span>
                <span className="text-white font-medium">${selectedPkg?.price}</span>
              </div>
              <div className="flex justify-between items-center border-t border-white/10 pt-2">
                <span className="text-white font-semibold">Total:</span>
                <span className="text-2xl font-bold text-emerald-300">${selectedPkg?.price}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-white/10">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-white/20 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePurchase}
            disabled={isProcessing}
            className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 animate-spin" size={16} />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2" size={16} />
                Complete Purchase
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Add Payment Method Modal
const AddPaymentMethodModal = ({ isOpen, onClose, onSave, toast }) => {
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolder: '',
    isDefault: false
  });
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cardNumber || !formData.expiryDate || !formData.cvv || !formData.cardHolder) {
      toast({
        title: "Missing Information",
        description: "Please fill in all card details.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsProcessing(false);
    onSave({
      id: Date.now(),
      type: 'card' as const,
      lastFour: formData.cardNumber.slice(-4),
      brand: 'Visa',
      expiryDate: formData.expiryDate,
      isDefault: formData.isDefault,
      cardHolder: formData.cardHolder
    });
    onClose();
    
    toast({
      title: "Payment Method Added",
      description: "Your card has been saved successfully.",
      variant: "success",
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCardNumber = (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').slice(0, 19);
  };

  const formatExpiryDate = (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{2})(?=\d)/, '$1/').slice(0, 5);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-purple-400/30 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <CreditCard className="text-purple-400" size={24} />
              Add Payment Method
            </h2>
            <p className="text-slate-300 text-sm mt-1">Enter your card details securely</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-white/10 rounded-full"
          >
            <X size={20} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardHolder" className="text-white/80 text-sm font-medium">
              Cardholder Name
            </Label>
            <Input
              id="cardHolder"
              value={formData.cardHolder}
              onChange={(e) => handleInputChange('cardHolder', e.target.value)}
              className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500/50"
              placeholder="John Doe"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardNumber" className="text-white/80 text-sm font-medium">
              Card Number
            </Label>
            <Input
              id="cardNumber"
              value={formData.cardNumber}
              onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
              className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500/50 font-mono"
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryDate" className="text-white/80 text-sm font-medium">
                Expiry Date
              </Label>
              <Input
                id="expiryDate"
                value={formData.expiryDate}
                onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e.target.value))}
                className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500/50"
                placeholder="MM/YY"
                maxLength={5}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cvv" className="text-white/80 text-sm font-medium">
                CVV
              </Label>
              <Input
                id="cvv"
                value={formData.cvv}
                onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500/50"
                placeholder="123"
                maxLength={4}
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg border border-white/10">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
              className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-purple-500 focus:ring-purple-500/50"
            />
            <Label htmlFor="isDefault" className="text-white/80 text-sm cursor-pointer">
              Set as default payment method
            </Label>
          </div>

          <div className="flex items-center gap-2 text-slate-400 text-xs p-3 bg-slate-700/20 rounded-lg">
            <Shield size={12} />
            <span>Your payment information is secure and encrypted</span>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={16} />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="mr-2" size={16} />
                  Save Card
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Billing Info Modal
const EditBillingInfoModal = ({ isOpen, onClose, onSave, initialData, existingAddresses, toast }) => {
  const [formData, setFormData] = useState<BillingInfo>(initialData);
  const [useExisting, setUseExisting] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState<string>("default");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.address1 || !formData.city || !formData.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsProcessing(false);
    onSave(formData);
    onClose();
    
    toast({
      title: "Billing Info Updated",
      description: "Your billing information has been saved successfully.",
      variant: "success",
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUseExistingChange = (value: string) => {
    setUseExisting(value === "existing");
    if (value === "existing" && existingAddresses.length > 0) {
      const selected = existingAddresses.find(addr => addr.id?.toString() === selectedAddress) || existingAddresses[0];
      setFormData(selected);
    } else if (value === "new") {
      setFormData({
        name: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        zip: '',
        country: 'United States',
        email: '',
        phone: '',
        isDefault: false
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-blue-400/30 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Building className="text-blue-400" size={24} />
              Edit Billing Information
            </h2>
            <p className="text-slate-300 text-sm mt-1">Update your billing address and contact details</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-white/10 rounded-full"
          >
            <X size={20} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Address Selection */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Address Selection</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  useExisting ? 'border-blue-400/50 bg-blue-400/10' : 'border-white/10 bg-slate-700/50'
                }`}
                onClick={() => handleUseExistingChange("existing")}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    useExisting ? 'border-blue-400 bg-blue-400' : 'border-slate-400'
                  }`}>
                    {useExisting && <Check size={12} className="text-white" />}
                  </div>
                  <span className="text-white font-medium">Use Existing Address</span>
                </div>
              </div>

              <div
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  !useExisting ? 'border-blue-400/50 bg-blue-400/10' : 'border-white/10 bg-slate-700/50'
                }`}
                onClick={() => handleUseExistingChange("new")}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    !useExisting ? 'border-blue-400 bg-blue-400' : 'border-slate-400'
                  }`}>
                    {!useExisting && <Check size={12} className="text-white" />}
                  </div>
                  <span className="text-white font-medium">Add New Address</span>
                </div>
              </div>
            </div>

            {useExisting && existingAddresses.length > 0 && (
              <Select value={selectedAddress} onValueChange={setSelectedAddress}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue placeholder="Select an address" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10">
                  {existingAddresses.map((address) => (
                    <SelectItem key={address.id} value={address.id?.toString() || 'default'}>
                      {address.name} - {address.address1}, {address.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Billing Form */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Billing Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white/80 text-sm font-medium">
                  Full Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/80 text-sm font-medium">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address1" className="text-white/80 text-sm font-medium">
                Street Address *
              </Label>
              <Input
                id="address1"
                value={formData.address1}
                onChange={(e) => handleInputChange('address1', e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address2" className="text-white/80 text-sm font-medium">
                Address Line 2
              </Label>
              <Input
                id="address2"
                value={formData.address2}
                onChange={(e) => handleInputChange('address2', e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-white/80 text-sm font-medium">
                  City *
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state" className="text-white/80 text-sm font-medium">
                  State
                </Label>
                <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/10 max-h-60">
                    {STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="zip" className="text-white/80 text-sm font-medium">
                  ZIP Code
                </Label>
                <Input
                  id="zip"
                  value={formData.zip}
                  onChange={(e) => handleInputChange('zip', e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country" className="text-white/80 text-sm font-medium">
                Country
              </Label>
              <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10 max-h-60">
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-white/80 text-sm font-medium">
                Phone Number
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg border border-white/10">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
              className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500/50"
            />
            <Label htmlFor="isDefault" className="text-white/80 text-sm cursor-pointer">
              Set as default billing address
            </Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={16} />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="mr-2" size={16} />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Invoice Detail Modal
const InvoiceDetailModal = ({ isOpen, onClose, invoice }) => {
  if (!isOpen || !invoice) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-blue-400/30 w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <FileText className="text-blue-400" size={24} />
              Invoice {invoice.invoiceId}
            </h2>
            <p className="text-slate-300 text-sm mt-1">{invoice.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Download logic would go here
                alert(`Downloading invoice ${invoice.invoiceId}`);
              }}
              className="border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/10"
            >
              <Download size={16} className="mr-2" />
              Download
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-slate-400 hover:text-white hover:bg-white/10 rounded-full"
            >
              <X size={20} />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Invoice Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-white font-semibold mb-2">Billed To</h3>
              <div className="text-slate-300 space-y-1">
                <p>Aqeel Abbas</p>
                <p>123 Main Street</p>
                <p>Suite 100</p>
                <p>New York, NY 10001</p>
                <p>United States</p>
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">Invoice Details</h3>
              <div className="text-slate-300 space-y-2">
                <div className="flex justify-between">
                  <span>Invoice ID:</span>
                  <span className="font-mono">{invoice.invoiceId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{new Date(invoice.date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant="outline" className={
                    invoice.status === 'paid' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                    invoice.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                    'bg-red-500/20 text-red-300 border-red-500/30'
                  }>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span>{invoice.paymentMethod}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h3 className="text-white font-semibold mb-4">Items</h3>
            <div className="border border-white/10 rounded-lg overflow-hidden">
              <div className="grid grid-cols-12 gap-4 p-4 bg-slate-700/50 border-b border-white/10">
                <div className="col-span-6 text-slate-300 font-medium">Description</div>
                <div className="col-span-2 text-slate-300 font-medium text-center">Quantity</div>
                <div className="col-span-2 text-slate-300 font-medium text-right">Price</div>
                <div className="col-span-2 text-slate-300 font-medium text-right">Amount</div>
              </div>
              
              {invoice.items?.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 p-4 border-b border-white/5">
                  <div className="col-span-6 text-white">{item.name}</div>
                  <div className="col-span-2 text-slate-300 text-center">{item.quantity}</div>
                  <div className="col-span-2 text-slate-300 text-right">${item.price}</div>
                  <div className="col-span-2 text-white text-right font-medium">${(item.quantity * item.price).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal:</span>
                <span>${invoice.amount}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Tax:</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between text-white font-bold text-lg border-t border-white/10 pt-2">
                <span>Total:</span>
                <span>${invoice.amount}</span>
              </div>
              {invoice.creditsAdded && (
                <div className="flex justify-between text-emerald-400 font-medium mt-2">
                  <span>Credits Added:</span>
                  <span>+{invoice.creditsAdded.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Change Plan Modal
const ChangePlanModal = ({ isOpen, onClose, currentPlan, onPlanChange, toast }) => {
  const [selectedPlan, setSelectedPlan] = useState(currentPlan);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const plans = [
    {
      id: 'basic',
      name: 'Basic Plan',
      price: 9.99,
      credits: 100,
      features: ['100 credits/month', 'Basic features', 'Email support', '7-day history']
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      price: 24.99,
      credits: 300,
      features: ['300 credits/month', 'All basic features', 'Priority support', '30-day history', 'Advanced analytics'],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 79.99,
      credits: 1000,
      features: ['1000 credits/month', 'All pro features', '24/7 support', '90-day history', 'Custom integrations', 'Dedicated manager'],
      bestValue: true
    }
  ];

  const handlePlanChange = async () => {
    if (selectedPlan === currentPlan) {
      toast({
        title: "Same Plan Selected",
        description: "You are already on this plan.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    onPlanChange(selectedPlan);
    onClose();
    
    toast({
      title: "Plan Changed Successfully!",
      description: `Your subscription has been updated to the ${plans.find(p => p.id === selectedPlan)?.name}.`,
      variant: "success",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-emerald-400/30 w-full max-w-4xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <BadgeCheck className="text-emerald-400" size={24} />
              Change Subscription Plan
            </h2>
            <p className="text-slate-300 text-sm mt-1">Choose the plan that best fits your needs</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-white/10 rounded-full"
          >
            <X size={20} />
          </Button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                  selectedPlan === plan.id
                    ? 'border-emerald-400/50 bg-emerald-400/10 scale-105'
                    : 'border-white/10 bg-slate-700/50 hover:border-white/20'
                }`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {/* Plan Header */}
                <div className="text-center mb-4">
                  {plan.popular && (
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 mb-2">
                      MOST POPULAR
                    </Badge>
                  )}
                  {plan.bestValue && (
                    <Badge className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white border-0 mb-2">
                      BEST VALUE
                    </Badge>
                  )}
                  
                  <h3 className="text-white font-bold text-xl mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span className="text-3xl font-bold text-emerald-300">${plan.price}</span>
                    <span className="text-slate-400">/month</span>
                  </div>
                  <p className="text-slate-300 text-sm">{plan.credits.toLocaleString()} credits included</p>
                </div>

                {/* Features */}
                <div className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-slate-300 text-sm">
                      <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>

                {/* Select Button */}
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mx-auto ${
                  selectedPlan === plan.id 
                    ? 'border-emerald-400 bg-emerald-400' 
                    : 'border-slate-400'
                }`}>
                  {selectedPlan === plan.id && <Check size={14} className="text-white" />}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 border-t border-white/10 pt-6">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePlanChange}
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={16} />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="mr-2" size={16} />
                  Change Plan
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Cancel Plan Modal
const CancelPlanModal = ({ isOpen, onClose, onCancel, toast }) => {
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const reasons = [
    "Too expensive",
    "Missing features",
    "Found a better alternative",
    "Not using the service enough",
    "Technical issues",
    "Other"
  ];

  const handleCancel = async () => {
    if (!reason) {
      toast({
        title: "Reason Required",
        description: "Please select a reason for cancellation.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    onCancel({ reason, feedback });
    onClose();
    
    toast({
      title: "Subscription Cancelled",
      description: "Your subscription has been cancelled successfully.",
      variant: "success",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-red-400/30 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <XCircle className="text-red-400" size={24} />
              Cancel Subscription
            </h2>
            <p className="text-slate-300 text-sm mt-1">We're sorry to see you go</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-white/10 rounded-full"
          >
            <X size={20} />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-slate-300 text-sm">
            Your subscription will remain active until the end of your current billing period. 
            You can reactivate anytime.
          </p>

          <div className="space-y-2">
            <Label className="text-white/80 text-sm font-medium">
              Why are you cancelling? *
            </Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/10">
                {reasons.map((reasonOption) => (
                  <SelectItem key={reasonOption} value={reasonOption}>
                    {reasonOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback" className="text-white/80 text-sm font-medium">
              Additional feedback (optional)
            </Label>
            <textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-red-500/50 focus:outline-none resize-none"
              rows={3}
              placeholder="Help us improve our service..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-white/20 text-white hover:bg-white/10"
            >
              Keep Subscription
            </Button>
            <Button
              onClick={handleCancel}
              disabled={isProcessing || !reason}
              className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={16} />
                  Cancelling...
                </>
              ) : (
                <>
                  <XCircle className="mr-2" size={16} />
                  Cancel Subscription
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
export default function BillingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [isBuyCreditsModalOpen, setIsBuyCreditsModalOpen] = useState(false);
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);
  const [isEditBillingModalOpen, setIsEditBillingModalOpen] = useState(false);
  const [isInvoiceDetailModalOpen, setIsInvoiceDetailModalOpen] = useState(false);
  const [isChangePlanModalOpen, setIsChangePlanModalOpen] = useState(false);
  const [isCancelPlanModalOpen, setIsCancelPlanModalOpen] = useState(false);
  
  const [selectedInvoice, setSelectedInvoice] = useState<BillingHistory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // --- MOCK DATA ---
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: 1,
      type: 'card',
      lastFour: '4242',
      brand: 'Visa',
      expiryDate: '12/25',
      isDefault: true,
      cardHolder: 'Aqeel Abbas'
    },
    {
      id: 2,
      type: 'paypal',
      lastFour: 'PPAL',
      brand: 'PayPal',
      isDefault: false
    }
  ]);

  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([
    {
      id: 1,
      date: '2024-01-15',
      description: 'Pro Plan - Monthly Subscription',
      amount: 24.99,
      status: 'paid',
      invoiceId: 'INV-001',
      creditsAdded: 300,
      paymentMethod: 'Visa **** 4242',
      items: [
        { name: 'Pro Plan Subscription', quantity: 1, price: 24.99 }
      ]
    },
    {
      id: 2,
      date: '2024-01-10',
      description: 'Credit Purchase - 500 Credits',
      amount: 39.99,
      status: 'paid',
      invoiceId: 'INV-002',
      creditsAdded: 500,
      paymentMethod: 'Visa **** 4242',
      items: [
        { name: 'Credit Pack (500)', quantity: 1, price: 39.99 }
      ]
    },
    {
      id: 3,
      date: '2024-01-05',
      description: 'Enterprise Plan - Annual',
      amount: 299.99,
      status: 'pending',
      invoiceId: 'INV-003',
      creditsAdded: 5000,
      paymentMethod: 'PayPal',
      items: [
        { name: 'Enterprise Plan (Annual)', quantity: 1, price: 299.99 }
      ]
    },
    {
      id: 4,
      date: '2023-12-20',
      description: 'Starter Pack',
      amount: 9.99,
      status: 'refunded',
      invoiceId: 'INV-004',
      creditsAdded: 100,
      paymentMethod: 'Visa **** 4242',
      items: [
        { name: 'Starter Pack', quantity: 1, price: 9.99 }
      ]
    }
  ]);

  const [billingAddresses, setBillingAddresses] = useState<BillingInfo[]>([
    {
      id: 1,
      name: 'Aqeel Abbas',
      address1: '123 Main Street',
      address2: 'Suite 100',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'United States',
      email: user?.email || 'aqeel@teacher.com',
      phone: '+1 (555) 123-4567',
      isDefault: true
    }
  ]);

  const currentSubscription: Subscription = {
    plan: 'Pro Plan',
    status: 'active',
    nextBillingDate: '2024-02-15',
    price: 24.99,
    credits: 300,
    features: [
      '300 credits per month',
      'Priority support',
      'Advanced analytics',
      '30-day history',
      'Custom templates'
    ]
  };

  // --- FILTERED DATA ---
  const filteredBillingHistory = billingHistory.filter(invoice => {
    const matchesSearch = invoice.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.invoiceId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // --- ACTION HANDLERS ---
  const handleDownloadInvoice = (invoice: BillingHistory) => {
    // Create a mock invoice file
    const invoiceContent = `
INVOICE: ${invoice.invoiceId}
Date: ${new Date(invoice.date).toLocaleDateString()}
Description: ${invoice.description}
Amount: $${invoice.amount}
Status: ${invoice.status}
Payment Method: ${invoice.paymentMethod}
${invoice.creditsAdded ? `Credits Added: ${invoice.creditsAdded}` : ''}

ITEMS:
${invoice.items.map(item => `- ${item.name} x${item.quantity} - $${item.price}`).join('\n')}

TOTAL: $${invoice.amount}

Thank you for your business!
    `.trim();

    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${invoice.invoiceId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Invoice Downloaded",
      description: `Invoice ${invoice.invoiceId} has been downloaded.`,
      variant: "success",
    });
  };

  const handleViewInvoice = (invoice: BillingHistory) => {
    setSelectedInvoice(invoice);
    setIsInvoiceDetailModalOpen(true);
  };

  const handleCopyInvoiceId = (invoiceId: string) => {
    navigator.clipboard.writeText(invoiceId);
    toast({
      title: "Copied!",
      description: "Invoice ID copied to clipboard",
    });
  };

  const handleAddPaymentMethod = (newMethod: PaymentMethod) => {
    setPaymentMethods(prev => {
      // If new method is default, remove default from others
      if (newMethod.isDefault) {
        return [newMethod, ...prev.map(m => ({ ...m, isDefault: false }))];
      }
      return [...prev, newMethod];
    });
  };

  const handleDeletePaymentMethod = (id: number) => {
    const methodToDelete = paymentMethods.find(m => m.id === id);
    if (methodToDelete?.isDefault) {
      toast({
        title: "Cannot Delete Default",
        description: "Please set another payment method as default before deleting this one.",
        variant: "destructive",
      });
      return;
    }
    setPaymentMethods(prev => prev.filter(m => m.id !== id));
    toast({
      title: "Payment Method Removed",
      description: "The payment method has been deleted successfully.",
      variant: "success",
    });
  };

  const handleSaveBillingInfo = (newInfo: BillingInfo) => {
    setBillingAddresses(prev => {
      // If new info is default, remove default from others
      if (newInfo.isDefault) {
        return [newInfo, ...prev.map(a => ({ ...a, isDefault: false }))];
      }
      return [...prev, newInfo];
    });
  };

  const handlePurchaseCredits = (pkg: CreditPackage) => {
    // Add new transaction to billing history
    const newInvoice: BillingHistory = {
      id: Date.now(),
      date: new Date().toISOString(),
      description: `Credit Purchase - ${pkg.credits} Credits`,
      amount: pkg.price,
      status: 'paid',
      invoiceId: `INV-${Date.now().toString().slice(-6)}`,
      creditsAdded: pkg.credits,
      paymentMethod: 'Visa **** 4242',
      items: [
        { name: `${pkg.credits} Credits`, quantity: 1, price: pkg.price }
      ]
    };
    setBillingHistory(prev => [newInvoice, ...prev]);
  };

  const handleChangePlan = (newPlan: string) => {
    // In a real app, this would call an API to change the subscription
    console.log('Changing plan to:', newPlan);
  };

  const handleCancelPlan = (cancellationData: any) => {
    // In a real app, this would call an API to cancel the subscription
    console.log('Cancelling plan with reason:', cancellationData);
  };

  // --- UI HELPERS ---
  const getStatusBadge = (status: BillingHistory['status']) => {
    const statusConfig = {
      paid: { color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: CheckCircle },
      pending: { color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', icon: Clock },
      failed: { color: 'bg-red-500/20 text-red-300 border-red-500/30', icon: XCircle },
      refunded: { color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', icon: ArrowUpRight }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={`${config.color} border`}>
        <Icon size={12} className="mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPaymentMethodIcon = (type: PaymentMethod['type']) => {
    switch (type) {
      case 'card':
        return <CreditCard size={16} />;
      case 'paypal':
        return <Building size={16} />;
      case 'bank_transfer':
        return <Building size={16} />;
      default:
        return <CreditCard size={16} />;
    }
  };

  const defaultBillingInfo = billingAddresses.find(addr => addr.isDefault) || billingAddresses[0];

  return (
    <GlassmorphismLayout>
      {/* Modals */}
      <BuyCreditsModal 
        isOpen={isBuyCreditsModalOpen} 
        onClose={() => setIsBuyCreditsModalOpen(false)}
        onPurchase={handlePurchaseCredits}
        toast={toast}
      />
      
      <AddPaymentMethodModal 
        isOpen={isAddPaymentModalOpen} 
        onClose={() => setIsAddPaymentModalOpen(false)}
        onSave={handleAddPaymentMethod}
        toast={toast}
      />
      
      <EditBillingInfoModal 
        isOpen={isEditBillingModalOpen} 
        onClose={() => setIsEditBillingModalOpen(false)}
        onSave={handleSaveBillingInfo}
        initialData={defaultBillingInfo}
        existingAddresses={billingAddresses}
        toast={toast}
      />
      
      <InvoiceDetailModal 
        isOpen={isInvoiceDetailModalOpen} 
        onClose={() => setIsInvoiceDetailModalOpen(false)}
        invoice={selectedInvoice}
      />
      
      <ChangePlanModal 
        isOpen={isChangePlanModalOpen} 
        onClose={() => setIsChangePlanModalOpen(false)}
        currentPlan="pro"
        onPlanChange={handleChangePlan}
        toast={toast}
      />
      
      <CancelPlanModal 
        isOpen={isCancelPlanModalOpen} 
        onClose={() => setIsCancelPlanModalOpen(false)}
        onCancel={handleCancelPlan}
        toast={toast}
      />

      <div className="flex">
        <TeacherSidebar />
        
        {/* Main Content */}
        <div className="flex-1 ml-0 lg:ml-0 min-h-screen p-4 lg:p-6">
          {/* Header */}
          <div className="glassmorphism-strong rounded-2xl p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => navigate("/teacher")}
                  className="bg-slate-700 hover:bg-slate-600 text-white transition-colors"
                  size="sm"
                >
                  <ArrowLeft size={16} />
                </Button>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-2">
                    <Receipt className="text-purple-400" size={32} />
                    Billing & Invoices
                  </h2>
                  <p className="text-slate-200/90 text-sm sm:text-base">
                    Manage your subscription, payment methods, and billing history
                  </p>
                </div>
              </div>
              
              <Button
                onClick={() => setIsBuyCreditsModalOpen(true)}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-purple-500/20"
              >
                <DollarSign className="mr-2" size={16} />
                Buy Credits
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Subscription & Billing History */}
            <div className="lg:col-span-2 space-y-6">
              {/* Current Subscription */}
              <Card className="glassmorphism-strong border-emerald-400/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BadgeCheck className="text-emerald-300" size={20} />
                    Current Subscription
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-white font-semibold text-lg">{currentSubscription.plan}</h3>
                      <p className="text-slate-300 text-sm">
                        {currentSubscription.credits} credits per month
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-emerald-300">${currentSubscription.price}</p>
                      <p className="text-slate-400 text-sm">per month</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                    <div>
                      <p className="text-slate-400 text-sm">Status</p>
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-0 mt-1">
                        {currentSubscription.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Next Billing</p>
                      <p className="text-white font-semibold mt-1">
                        {new Date(currentSubscription.nextBillingDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
                    <Button 
                      onClick={() => setIsChangePlanModalOpen(true)}
                      variant="outline" 
                      className="border-white/20 text-white hover:bg-white/10 flex-1"
                    >
                      Change Plan
                    </Button>
                    <Button 
                      onClick={() => setIsCancelPlanModalOpen(true)}
                      variant="outline" 
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10 flex-1"
                    >
                      Cancel Subscription
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Billing History */}
              <Card className="glassmorphism-strong border-white/30">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle className="text-white flex items-center gap-2">
                      <FileText className="text-blue-400" size={20} />
                      Transaction History
                    </CardTitle>
                    
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                        <Input
                          placeholder="Search invoices..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="bg-slate-700/50 border-slate-600 text-white pl-10 w-full sm:w-48 focus:ring-2 focus:ring-blue-500/50"
                        />
                      </div>
                      
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white w-full sm:w-32">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-white/10">
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                          <SelectItem value="refunded">Refunded</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {filteredBillingHistory.length > 0 ? (
                      filteredBillingHistory.map((invoice) => (
                        <div
                          key={invoice.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg border border-white/10 hover:border-white/20 transition-colors group gap-4"
                        >
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center flex-shrink-0">
                              <Receipt className="text-slate-300" size={18} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h4 className="text-white font-semibold truncate">{invoice.description}</h4>
                                {getStatusBadge(invoice.status)}
                              </div>
                              <div className="flex items-center gap-4 text-slate-400 text-sm flex-wrap">
                                <span className="flex items-center gap-1">
                                  <Calendar size={12} />
                                  {new Date(invoice.date).toLocaleDateString()}
                                </span>
                                <span 
                                  className="flex items-center gap-1 cursor-pointer hover:text-white"
                                  onClick={() => handleCopyInvoiceId(invoice.invoiceId)}
                                >
                                  <FileText size={12} />
                                  {invoice.invoiceId}
                                  <Copy size={10} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </span>
                                {invoice.creditsAdded && (
                                  <span className="text-emerald-400">
                                    +{invoice.creditsAdded} credits
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-white font-semibold">${invoice.amount}</p>
                              <p className="text-slate-400 text-xs">{invoice.paymentMethod}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewInvoice(invoice)}
                                className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-full w-8 h-8 p-0"
                              >
                                <Eye size={14} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadInvoice(invoice)}
                                className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 rounded-full w-8 h-8 p-0"
                              >
                                <Download size={14} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <FileText className="mx-auto text-slate-400 mb-4" size={48} />
                        <h3 className="text-xl text-white mb-2">No transactions found</h3>
                        <p className="text-slate-300 mb-6">
                          {searchTerm || statusFilter !== 'all' 
                            ? "No transactions match your search criteria" 
                            : "Your transaction history will appear here once you make your first purchase"}
                        </p>
                        {!searchTerm && statusFilter === 'all' && (
                          <Button
                            onClick={() => setIsBuyCreditsModalOpen(true)}
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                          >
                            <DollarSign className="mr-2" size={16} />
                            Buy Credits
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {filteredBillingHistory.length > 0 && (
                    <div className="pt-6 text-center border-t border-white/10 mt-6">
                      <Button 
                        variant="outline" 
                        className="border-blue-400/30 text-blue-400 hover:bg-blue-400/10"
                        onClick={() => {
                          // Export all filtered transactions
                          const exportData = filteredBillingHistory.map(invoice => ({
                            Date: invoice.date,
                            Description: invoice.description,
                            Amount: invoice.amount,
                            Status: invoice.status,
                            'Invoice ID': invoice.invoiceId,
                            'Payment Method': invoice.paymentMethod,
                            'Credits Added': invoice.creditsAdded || 0
                          }));
                          
                          const csvContent = [
                            Object.keys(exportData[0]).join(','),
                            ...exportData.map(row => Object.values(row).join(','))
                          ].join('\n');
                          
                          const blob = new Blob([csvContent], { type: 'text/csv' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `billing-history-${new Date().toISOString().split('T')[0]}.csv`;
                          a.click();
                          URL.revokeObjectURL(url);
                          
                          toast({
                            title: "Export Complete",
                            description: "Your billing history has been exported as CSV.",
                            variant: "success",
                          });
                        }}
                      >
                        <Download size={16} className="mr-2" />
                        Export History (CSV)
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Payment Methods & Billing Info */}
            <div className="space-y-6">
              {/* Payment Methods */}
              <Card className="glassmorphism-strong border-purple-400/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CreditCard className="text-purple-400" size={20} />
                    Payment Methods
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-white/10 hover:border-white/20 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center">
                          {getPaymentMethodIcon(method.type)}
                        </div>
                        <div>
                          <p className="text-white font-semibold">
                            {method.brand} •••• {method.lastFour}
                          </p>
                          {method.expiryDate && (
                            <p className="text-slate-400 text-sm">Expires {method.expiryDate}</p>
                          )}
                          {method.cardHolder && (
                            <p className="text-slate-400 text-sm">{method.cardHolder}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {method.isDefault && (
                          <Badge className="bg-emerald-500/20 text-emerald-300 border-0 text-xs">
                            Default
                          </Badge>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeletePaymentMethod(method.id)}
                          className="text-red-400 hover:bg-red-500/10 rounded-full w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button
                    onClick={() => setIsAddPaymentModalOpen(true)}
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/10 border-dashed"
                  >
                    <Plus className="mr-2" size={16} />
                    Add Payment Method
                  </Button>
                </CardContent>
              </Card>

              {/* Billing Information */}
              <Card className="glassmorphism-strong border-blue-400/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Building className="text-blue-400" size={20} />
                    Billing Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Billing Address</p>
                    <p className="text-white">
                      {defaultBillingInfo.name}<br />
                      {defaultBillingInfo.address1}<br />
                      {defaultBillingInfo.address2 && <>{defaultBillingInfo.address2}<br /></>}
                      {defaultBillingInfo.city}, {defaultBillingInfo.state} {defaultBillingInfo.zip}<br />
                      {defaultBillingInfo.country}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-400 text-sm mb-1">Contact Information</p>
                    <div className="space-y-2">
                      <p className="text-white flex items-center gap-2">
                        <Mail size={14} className="text-slate-400" />
                        {defaultBillingInfo.email}
                      </p>
                      <p className="text-white flex items-center gap-2">
                        <Phone size={14} className="text-slate-400" />
                        {defaultBillingInfo.phone}
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={() => setIsEditBillingModalOpen(true)}
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/10"
                  >
                    <Edit className="mr-2" size={16} />
                    Edit Billing Info
                  </Button>
                </CardContent>
              </Card>

              {/* Billing Summary */}
              <Card className="glassmorphism-strong border-emerald-400/30">
                <CardContent className="p-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <DollarSign className="text-emerald-300" size={20} />
                    Billing Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">This Month</span>
                      <span className="text-white font-semibold">$24.99</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Last Month</span>
                      <span className="text-white font-semibold">$24.99</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Total Spent</span>
                      <span className="text-white font-semibold">$349.86</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-white/10 pt-3">
                      <span className="text-white font-semibold">Credits Available</span>
                      <span className="text-2xl font-bold text-emerald-300">425</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Support Card */}
              <Card className="glassmorphism-strong border-slate-400/30">
                <CardContent className="p-6">
                  <div className="text-center">
                    <Shield className="mx-auto text-blue-400 mb-3" size={32} />
                    <h3 className="text-white font-semibold mb-2">Need Help?</h3>
                    <p className="text-slate-300 text-sm mb-4">
                      Our support team is here to help with any billing questions.
                    </p>
                    <Button
                      variant="outline"
                      className="border-blue-400/30 text-blue-400 hover:bg-blue-400/10 w-full"
                    >
                      Contact Support
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </GlassmorphismLayout>
  );
}