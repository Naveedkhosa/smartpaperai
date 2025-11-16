import { useState } from "react"; 
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import TeacherSidebar from '@/components/TeacherSidebar';
import GlassmorphismLayout from "@/components/GlassmorphismLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Star, // For "Make Default"
  Check, // For Checkbox
  ChevronDown, // For Dropdowns
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
}

interface PaymentMethod {
  id: number;
  type: 'card' | 'paypal' | 'bank';
  lastFour: string;
  brand: string;
  expiryDate?: string;
  isDefault: boolean;
}

interface Subscription {
  plan: string;
  status: 'active' | 'canceled' | 'past_due';
  nextBillingDate: string;
  price: number;
  credits: number;
}

interface BillingInfo {
  name: string;
  address1: string;
  address2: string;
  city: string;
  zip: string;
  country: string;
  email: string;
  phone: string;
}

// --- CONSTANTS ---
const CREDIT_PACKAGES = [100, 500, 1000, 2500];
const PRICE_PER_CREDIT = 0.10; // $0.10 per credit
const MIN_CREDITS = 10;
const CREDIT_STEP = 100; // Step size for plus/minus buttons

// --- STYLED COMPONENTS (Professional Inputs) ---
const Input = ({ className = '', ...props }) => (
  <input 
    className={`w-full p-3 rounded-lg bg-slate-700/50 border border-slate-700 text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500/50 focus:outline-none transition-colors ${className}`}
    {...props}
  />
);

const Checkbox = ({ id, label, checked, onChange }) => (
  <label htmlFor={id} className="flex items-center gap-2 cursor-pointer text-slate-200">
    <div className={`w-5 h-5 rounded border-2 ${checked ? 'bg-indigo-500 border-indigo-400' : 'border-slate-600 bg-slate-700/50'} flex items-center justify-center transition-all`}>
      {checked && <Check size={14} className="text-white" />}
    </div>
    {label}
  </label>
);


// --- MODAL COMPONENTS (Professional Refactor) ---

/**
 * 1. Buy Credits Modal (With Payment Method Selection)
 */
const BuyCreditsModal = ({ isOpen, onClose, toast, paymentMethods, onAddNewPayment }) => {
  const [credits, setCredits] = useState(CREDIT_PACKAGES[1]);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState(
    paymentMethods.find(p => p.isDefault)?.id || paymentMethods[0]?.id
  );
  
  if (!isOpen) return null;

  const calculatedPrice = (credits * PRICE_PER_CREDIT).toFixed(2);
  
  const handleCreditChange = (newCredits) => {
    const value = Math.max(MIN_CREDITS, Number(newCredits) || MIN_CREDITS);
    setCredits(value);
  };
  
  const handleQuickSelect = (amount) => setCredits(amount);

  const handlePurchase = () => {
    if (!selectedPaymentMethodId) {
        toast({ title: "No Payment Method", description: "Please select or add a payment method.", variant: "destructive" });
        return;
    }
    const method = paymentMethods.find(p => p.id === selectedPaymentMethodId);
    toast({
        title: "Purchase Initiated",
        description: `Charging $${calculatedPrice} to ${method.brand} **** ${method.lastFour}.`,
        variant: "success",
    });
    onClose();
  };

  const isMinDisabled = credits <= MIN_CREDITS;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <Card className="glassmorphism-strong border-emerald-400/50 w-full max-w-lg shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 pb-3">
          <CardTitle className="text-white flex items-center gap-2 text-xl">
            <DollarSign className="text-emerald-400" size={24} />
            Secure Credit Purchase
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10 rounded-full">
            <X size={20} />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          
          {/* Credit Selection */}
          <div className="space-y-3">
            <label className="text-slate-300 text-sm font-medium block">1. Select Amount (Quick Select):</label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {CREDIT_PACKAGES.map(amount => (
                    <Button key={amount} onClick={() => handleQuickSelect(amount)} variant={credits === amount ? "default" : "outline"}
                        className={`font-semibold text-xs h-16 flex flex-col justify-center items-center rounded-xl transition-all duration-200 ${credits === amount ? 'bg-indigo-500 hover:bg-indigo-600 border-indigo-300/50 shadow-lg ring-2 ring-indigo-500/50' : 'border-white/20 text-white hover:bg-white/10'}`}>
                        <span className="text-lg font-bold">{amount.toLocaleString()} Cr</span>
                        <span className="text-xs opacity-70">(${(amount * PRICE_PER_CREDIT).toFixed(2)})</span>
                    </Button>
                ))}
            </div>
          </div>
          <div className="space-y-3">
             <label className="text-slate-300 text-sm font-medium block">Customize Amount (Step {CREDIT_STEP}):</label>
             <div className="flex items-center justify-between border border-white/20 rounded-xl p-2 bg-slate-800/80 shadow-inner">
                <Button variant="outline" size="icon" onClick={() => handleCreditChange(credits - CREDIT_STEP)} disabled={isMinDisabled}
                    className={`w-12 h-12 rounded-lg transition-colors ${isMinDisabled ? 'opacity-50' : 'border-red-500/30 text-red-400 hover:bg-red-500/10'}`}>
                    <Minus size={20} />
                </Button>
                <div className="flex flex-col items-center justify-center mx-4 flex-1">
                    <input type="number" value={credits} onChange={(e) => handleCreditChange(e.target.value)} min={MIN_CREDITS} step={CREDIT_STEP}
                        className="w-full text-center text-4xl font-extrabold bg-transparent text-emerald-400 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        aria-label="Number of credits" />
                    <span className="text-xs text-slate-400 uppercase tracking-widest">Credits</span>
                </div>
                <Button variant="outline" size="icon" onClick={() => handleCreditChange(credits + CREDIT_STEP)}
                    className="w-12 h-12 rounded-lg border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-colors">
                    <Plus size={20} />
                </Button>
             </div>
          </div>
          
          {/* Payment Method Selection */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <label className="text-slate-300 text-sm font-medium block">2. Select Payment Method:</label>
            <div className="space-y-2">
              {paymentMethods.map(method => (
                <label key={method.id} className={`flex items-center justify-between p-3 rounded-lg border-2 ${selectedPaymentMethodId === method.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 bg-slate-700/50'} cursor-pointer transition-all`}>
                  <div className="flex items-center gap-3">
                    <CreditCard size={20} className="text-purple-400" />
                    <span className="text-white font-medium">{method.brand} **** {method.lastFour}</span>
                    {method.isDefault && <Badge className="bg-emerald-500/20 text-emerald-300 border-0 text-xs">Default</Badge>}
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 ${selectedPaymentMethodId === method.id ? 'border-indigo-400 bg-indigo-500' : 'border-slate-500'}`} />
                  <input type="radio" name="paymentMethod" value={method.id} checked={selectedPaymentMethodId === method.id} onChange={() => setSelectedPaymentMethodId(method.id)} className="hidden" />
                </label>
              ))}
            </div>
            <Button variant="outline" onClick={onAddNewPayment} className="w-full border-white/20 text-white hover:bg-white/10 border-dashed">
                <Plus size={16} className="mr-2" /> Add New Payment Method
            </Button>
          </div>

          {/* Summary and Checkout */}
          <div className="pt-4 border-t border-white/10 space-y-4">
              <div className="flex justify-between items-center text-3xl font-bold">
                  <span className="text-white">Total Price:</span>
                  <span className="text-purple-400">${calculatedPrice}</span>
              </div>
              <Button onClick={handlePurchase} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 mt-4 h-12 text-lg font-bold shadow-xl shadow-purple-500/30">
                <CreditCard className="mr-3" size={20} />
                Pay ${calculatedPrice}
              </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * 2. Add Payment Method Modal (With Full Billing Address)
 */
const AddPaymentMethodModal = ({ isOpen, onClose, toast, existingBillingInfo }) => {
  const [useExistingAddress, setUseExistingAddress] = useState(true);
  const [cardHolderName, setCardHolderName] = useState(existingBillingInfo.name);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [newBillingInfo, setNewBillingInfo] = useState({ address1: '', city: '', zip: '', country: '' });

  if (!isOpen) return null;

  const handleSave = () => {
    if (cardNumber.length < 16 || expiry.length !== 5 || cvc.length < 3 || !cardHolderName) {
      toast({ title: "Validation Error", description: "Please fill in all card details, including name.", variant: "destructive" });
      return;
    }
    if (!useExistingAddress && (!newBillingInfo.address1 || !newBillingInfo.city || !newBillingInfo.country)) {
        toast({ title: "Validation Error", description: "Please fill in all new billing address fields.", variant: "destructive" });
        return;
    }
    
    toast({
      title: "Payment Method Added",
      description: `New card ending in **** ${cardNumber.slice(-4)} saved successfully.`,
      variant: "success",
    });
    onClose(); // In real app, you'd pass the new card data back
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <Card className="glassmorphism-strong border-purple-400/50 w-full max-w-lg shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 pb-3">
          <CardTitle className="text-white flex items-center gap-2 text-xl">
            <CreditCard className="text-purple-400" size={24} />
            Add New Payment Method
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10 rounded-full">
            <X size={20} />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <Input placeholder="Cardholder Name" value={cardHolderName} onChange={(e) => setCardHolderName(e.target.value)} />
          <Input value={cardNumber} onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))} placeholder="Card Number" maxLength={16} />
          <div className="flex gap-4">
            <Input value={expiry} onChange={(e) => setExpiry(e.target.value.replace(/\D/g, '').slice(0, 4).replace(/(\d{2})/, '$1/'))} placeholder="MM/YY" maxLength={5} />
            <Input value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="CVC" maxLength={4} />
          </div>
          
          <div className="pt-4 border-t border-white/10 space-y-3">
            <label className="text-slate-300 text-sm font-medium block">Billing Address</label>
            <Checkbox id="useExisting" label="Use default billing information" checked={useExistingAddress} onChange={() => setUseExistingAddress(!useExistingAddress)} />
            
            {useExistingAddress && (
              <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-700 text-slate-300 text-sm">
                {existingBillingInfo.name}<br/>
                {existingBillingInfo.address1}, {existingBillingInfo.city}, {existingBillingInfo.zip}
              </div>
            )}

            {!useExistingAddress && (
              <div className="space-y-3 pt-2">
                <Input placeholder="Address Line 1" value={newBillingInfo.address1} onChange={(e) => setNewBillingInfo({...newBillingInfo, address1: e.target.value})} />
                <div className="flex gap-4">
                  <Input placeholder="City" value={newBillingInfo.city} onChange={(e) => setNewBillingInfo({...newBillingInfo, city: e.target.value})} />
                  <Input placeholder="Zip Code" value={newBillingInfo.zip} onChange={(e) => setNewBillingInfo({...newBillingInfo, zip: e.target.value})} />
                </div>
                <Input placeholder="Country" value={newBillingInfo.country} onChange={(e) => setNewBillingInfo({...newBillingInfo, country: e.target.value})} />
              </div>
            )}
          </div>

          <Button onClick={handleSave} className="w-full bg-purple-600 hover:bg-purple-700 mt-4 h-11 shadow-md shadow-purple-500/20">
            Save Card Details
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * 4. View Invoice Modal (NEW)
 */
const ViewInvoiceModal = ({ isOpen, onClose, invoice, billingInfo }) => {
    if (!isOpen || !invoice) return null;
    
    const getStatusChip = (status) => {
        const config = {
          paid: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
          failed: 'bg-red-500/20 text-red-300 border-red-500/30',
          refunded: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
        };
        return <Badge variant="outline" className={`${config[status]} border`}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <Card className="glassmorphism-strong border-blue-400/50 w-full max-w-2xl shadow-2xl">
                <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-xl">
                    <Receipt className="text-blue-400" size={24} />
                    Invoice Details
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10 rounded-full">
                    <X size={20} />
                </Button>
                </CardHeader>
                <CardContent className="space-y-6 pt-6 max-h-[70vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-2xl font-bold text-white">Invoice {invoice.invoiceId}</h3>
                            <p className="text-slate-300">Date Issued: {new Date(invoice.date).toLocaleDateString()}</p>
                        </div>
                        {getStatusChip(invoice.status)}
                    </div>
                    
                    {/* Billing Info */}
                    <div className="grid grid-cols-2 gap-4 border-t border-b border-white/10 py-4">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Billed To</p>
                            <p className="text-white font-medium">{billingInfo.name}</p>
                            <p className="text-slate-300">{billingInfo.address1}</p>
                            <p className="text-slate-300">{billingInfo.city}, {billingInfo.zip}</p>
                            <p className="text-slate-300">{billingInfo.email}</p>
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Payment Method</p>
                            <p className="text-white font-medium">{invoice.paymentMethod}</p>
                        </div>
                    </div>
                    
                    {/* Line Items */}
                    <div>
                        <p className="text-slate-400 text-sm mb-2">Summary</p>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                                <span className="text-white">{invoice.description}</span>
                                <span className="text-white font-medium">${invoice.amount.toFixed(2)}</span>
                            </div>
                            {invoice.creditsAdded && (
                                <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                                    <span className="text-slate-200">Credits Added</span>
                                    <span className="text-emerald-400 font-medium">+{invoice.creditsAdded.toLocaleString()}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Total */}
                    <div className="flex justify-end items-center pt-4 border-t border-white/10">
                        <div className="text-right">
                            <p className="text-slate-400 text-sm">Total Amount</p>
                            <p className="text-3xl font-bold text-emerald-400">${invoice.amount.toFixed(2)}</p>
                        </div>
                    </div>

                    <Button onClick={() => alert('Downloading PDF...')} className="w-full bg-blue-600 hover:bg-blue-700 h-11">
                        <Download size={16} className="mr-2" /> Download PDF
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

/**
 * 5. Change Plan Modal (NEW)
 */
const ChangePlanModal = ({ isOpen, onClose, currentPlan }) => {
    const plans = [
        { name: "Starter", price: 9.99, credits: 100 },
        { name: "Pro Plan", price: 24.99, credits: 300 },
        { name: "Enterprise", price: 49.99, credits: 750 },
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <Card className="glassmorphism-strong border-white/30 w-full max-w-2xl shadow-2xl">
                <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-xl">
                    <BadgeCheck className="text-emerald-300" size={24} />
                    Change Subscription Plan
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10 rounded-full">
                    <X size={20} />
                </Button>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {plans.map(plan => (
                            <div key={plan.name} className={`p-4 rounded-xl border-2 ${currentPlan === plan.name ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 bg-slate-700/50'} relative`}>
                                {currentPlan === plan.name && <Badge className="absolute -top-3 left-4 bg-indigo-500">Current Plan</Badge>}
                                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                                <p className="text-2xl font-bold text-emerald-400">${plan.price}<span className="text-sm text-slate-400">/mo</span></p>
                                <p className="text-slate-300">{plan.credits} credits/month</p>
                                <Button className={`w-full mt-4 ${currentPlan === plan.name ? 'bg-slate-600' : 'bg-indigo-500 hover:bg-indigo-600'}`} disabled={currentPlan === plan.name}>
                                    {currentPlan === plan.name ? 'Selected' : 'Switch to ' + plan.name}
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

/**
 * 6. Cancel Plan Modal (NEW)
 */
const CancelPlanModal = ({ isOpen, onClose, toast }) => {
    if (!isOpen) return null;

    const handleCancel = () => {
        toast({ title: "Subscription Canceled", description: "Your plan will be canceled at the end of the billing period.", variant: "destructive" });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <Card className="glassmorphism-strong border-red-500/50 w-full max-w-md shadow-2xl">
                <CardHeader className="border-b border-white/10 pb-3">
                    <CardTitle className="text-white flex items-center gap-2 text-xl">
                        <XCircle className="text-red-400" size={24} />
                        Cancel Subscription
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <p className="text-slate-200">Are you sure you want to cancel your subscription? This action cannot be undone.</p>
                    <div className="flex gap-4">
                        <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 flex-1" onClick={onClose}>
                            Keep Subscription
                        </Button>
                        <Button className="bg-red-600 hover:bg-red-700 text-white flex-1" onClick={handleCancel}>
                            Confirm Cancellation
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

// 3. Edit Billing Info (Stub, as it's similar to Add Method)
const EditBillingInfoModal = ({ isOpen, onClose, initialInfo, toast }) => {
   // This would be a full form, similar to AddPaymentMethodModal's "new address" fields
   // For this example, we'll reuse the logic but with a different title
   if (!isOpen) return null;
   return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <Card className="glassmorphism-strong border-blue-400/50 w-full max-w-lg shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 pb-3">
          <CardTitle className="text-white flex items-center gap-2 text-xl">
            <Building className="text-blue-400" size={24} />
            Edit Billing Information
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10 rounded-full">
            <X size={20} />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3 pt-6">
            <Input name="name" defaultValue={initialInfo.name} placeholder="Full Name (Required)" />
            <Input name="address1" defaultValue={initialInfo.address1} placeholder="Address Line 1 (Required)" />
            <Input name="address2" defaultValue={initialInfo.address2} placeholder="Address Line 2 (Optional)" />
            <div className="grid grid-cols-2 gap-4">
                <Input name="city" defaultValue={initialInfo.city} placeholder="City (Required)" />
                <Input name="zip" defaultValue={initialInfo.zip} placeholder="Zip Code" />
            </div>
            <Input name="country" defaultValue={initialInfo.country} placeholder="Country" />
            <div className="pt-2 border-t border-white/10">
                <p className="text-slate-400 text-sm mb-2 font-medium">Contact Details</p>
                <Input name="email" type="email" defaultValue={initialInfo.email} placeholder="Email Address (Required)" />
                <Input name="phone" type="tel" defaultValue={initialInfo.phone} className="mt-3" placeholder="Phone Number" />
            </div>
            <Button onClick={onClose} className="w-full bg-blue-600 hover:bg-blue-700 mt-4 h-11 shadow-md shadow-blue-500/20">
                Save Billing Information
            </Button>
        </CardContent>
      </Card>
    </div>
   );
};


// --- MAIN PAGE COMPONENT ---

export default function BillingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // --- MODAL STATE ---
  const [isBuyCreditsModalOpen, setIsBuyCreditsModalOpen] = useState(false);
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);
  const [isEditBillingModalOpen, setIsEditBillingModalOpen] = useState(false);
  const [isViewInvoiceModalOpen, setIsViewInvoiceModalOpen] = useState(false);
  const [isChangePlanModalOpen, setIsChangePlanModalOpen] = useState(false);
  const [isCancelPlanModalOpen, setIsCancelPlanModalOpen] = useState(false);
  
  // --- DATA STATE ---
  const [selectedInvoice, setSelectedInvoice] = useState<BillingHistory | null>(null);
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: 1, type: 'card', lastFour: '4242', brand: 'Visa', expiryDate: '12/25', isDefault: true },
    { id: 2, type: 'paypal', lastFour: 'PPAL', brand: 'PayPal', isDefault: false }
  ]);
  
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([
    { id: 1, date: '2024-01-15', description: 'Pro Plan - Monthly Subscription', amount: 24.99, status: 'paid', invoiceId: 'INV-001', creditsAdded: 300, paymentMethod: 'Visa **** 4242' },
    { id: 2, date: '2024-01-10', description: 'Credit Purchase - 100 Credits', amount: 9.99, status: 'paid', invoiceId: 'INV-002', creditsAdded: 100, paymentMethod: 'Visa **** 4242' },
    { id: 3, date: '2024-01-05', description: 'Enterprise Plan - Annual', amount: 299.99, status: 'pending', invoiceId: 'INV-003', creditsAdded: 5000, paymentMethod: 'PayPal' },
    { id: 4, date: '2023-12-20', description: 'Starter Pack', amount: 9.99, status: 'refunded', invoiceId: 'INV-004', creditsAdded: 100, paymentMethod: 'Visa **** 4242' }
  ]);

  const currentSubscription: Subscription = {
    plan: 'Pro Plan',
    status: 'active',
    nextBillingDate: '2024-02-15',
    price: 24.99,
    credits: 300
  };

  const mockBillingInfo: BillingInfo = {
    name: user?.name || 'Aqeel Abbas',
    address1: '123 Main Street',
    address2: 'Suite 100',
    city: 'New York',
    zip: '10001',
    country: 'United States',
    email: user?.email || 'aqeel@teacher.com',
    phone: '+1 (555) 123-4567'
  };

  // --- ACTIONS ---

  const handleAddNewPayment = () => {
      // This function can close one modal and open another
      setIsBuyCreditsModalOpen(false);
      setIsAddPaymentModalOpen(true);
  };
  
  const handleSetDefaultPayment = (id: number) => {
      setPaymentMethods(prev => 
        prev.map(method => ({ ...method, isDefault: method.id === id }))
      );
      toast({ title: "Default Payment Updated", description: "Your default payment method has been changed." });
  };

  const handleDeletePayment = (id: number) => {
    const methodToDelete = paymentMethods.find(m => m.id === id);
    if (methodToDelete?.isDefault) {
        toast({ title: "Cannot Delete Default", description: "Please set another payment method as default first.", variant: "destructive" });
        return;
    }
    setPaymentMethods(prev => prev.filter(method => method.id !== id));
    toast({ title: "Payment Method Removed", variant: "destructive" });
  };

  const handleDownloadInvoice = (invoice: BillingHistory) => {
    toast({ title: "Download Initiated", description: `Invoice ${invoice.invoiceId} download should start shortly.`, variant: "success" });
  };

  const handleViewInvoice = (invoice: BillingHistory) => {
    setSelectedInvoice(invoice);
    setIsViewInvoiceModalOpen(true); // Open the new modal
  };

  const handleCopyInvoiceId = (invoiceId: string) => {
    navigator.clipboard.writeText(invoiceId);
    toast({ title: "Copied!", description: "Invoice ID copied to clipboard" });
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
    return <Badge variant="outline" className={`${config.color} border`}><Icon size={12} className="mr-1" />{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  const getPaymentMethodIcon = (type: PaymentMethod['type']) => {
    switch (type) {
      case 'card': return <CreditCard size={16} />;
      case 'paypal': return <svg height="16" width="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="currentColor" d="M382.1 25.5c4.7-5.3 4.2-13.4-1.2-18.1s-13.4-4.2-18.1 1.2L246 168.3c-13.9 15.6-33.3 24.7-54 24.7H128c-70.7 0-128 57.3-128 128s57.3 128 128 128h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H128c-17.7 0 32-14.3 32-32s-14.3-32-32-32h16c21.2 0 41.3-8.8 55.7-24.3l184.4-208.2zM128 319.4c0-26 21.3-47.4 47.7-47.4h4.3c21.2 0 41.3-8.8 55.7-24.3L373.1 39.5c4.7-5.3 4.2-13.4-1.2-18.1s-13.4-4.2-18.1 1.2L216.4 231.1c-13.9 15.6-33.3 24.7-54 24.7H128c-17.7 0-32 14.3-32 32s14.3 32 32 32z"/></svg>; // PayPal icon
      case 'bank': return <Building size={16} />;
      default: return <CreditCard size={16} />;
    }
  };

  return (
    <GlassmorphismLayout>
      {/* Modals are placed at the highest level */}
      <BuyCreditsModal 
        isOpen={isBuyCreditsModalOpen} 
        onClose={() => setIsBuyCreditsModalOpen(false)} 
        toast={toast}
        paymentMethods={paymentMethods}
        onAddNewPayment={handleAddNewPayment}
      />
      <AddPaymentMethodModal 
        isOpen={isAddPaymentModalOpen} 
        onClose={() => setIsAddPaymentModalOpen(false)} 
        toast={toast}
        existingBillingInfo={mockBillingInfo}
      />
      <EditBillingInfoModal 
        isOpen={isEditBillingModalOpen} 
        onClose={() => setIsEditBillingModalOpen(false)} 
        initialInfo={mockBillingInfo}
        toast={toast}
      />
      <ViewInvoiceModal
        isOpen={isViewInvoiceModalOpen}
        onClose={() => setIsViewInvoiceModalOpen(false)}
        invoice={selectedInvoice}
        billingInfo={mockBillingInfo}
      />
      <ChangePlanModal
        isOpen={isChangePlanModalOpen}
        onClose={() => setIsChangePlanModalOpen(false)}
        currentPlan={currentSubscription.plan}
      />
      <CancelPlanModal
        isOpen={isCancelPlanModalOpen}
        onClose={() => setIsCancelPlanModalOpen(false)}
        toast={toast}
      />

      <div className="flex">
        <TeacherSidebar />
        
        {/* Main Content */}
        <div className="flex-1 ml-0 lg:ml-0 min-h-screen p-4 md:p-6">
          
          {/* Header */}
          <div className="glassmorphism-strong rounded-2xl p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button onClick={() => navigate("/teacher")} className="bg-slate-700 hover:bg-slate-600 text-white transition-colors" size="sm">
                  <ArrowLeft size={16} />
                </Button>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-2">
                    <Receipt className="text-purple-400" size={32} />
                    Billing & Invoices
                  </h2>
                  <p className="text-slate-200/90 text-sm sm:text-base">
                    Manage your subscription, payment methods, and billing history.
                  </p>
                </div>
              </div>
              
              <Button onClick={() => setIsBuyCreditsModalOpen(true)} className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-purple-500/20">
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
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-white font-semibold text-lg">{currentSubscription.plan}</h3>
                      <p className="text-slate-300 text-sm">{currentSubscription.credits} credits per month</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-emerald-300">${currentSubscription.price}</p>
                      <p className="text-slate-400 text-sm">per month</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                    <div>
                      <p className="text-slate-400 text-sm">Status</p>
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-0 mt-1">{currentSubscription.status === 'active' ? 'Active' : 'Inactive'}</Badge>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Next Billing</p>
                      <p className="text-white font-semibold mt-1">{new Date(currentSubscription.nextBillingDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 flex-1" onClick={() => setIsChangePlanModalOpen(true)}>
                      Change Plan
                    </Button>
                    <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 flex-1" onClick={() => setIsCancelPlanModalOpen(true)}>
                      Cancel Subscription
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Billing History (Transaction History) */}
              <Card className="glassmorphism-strong border-white/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="text-blue-400" size={20} />
                    Transaction History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {billingHistory.length > 0 ? (
                        billingHistory.map((invoice) => (
                        <div key={invoice.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border border-white/10 hover:border-white/20 transition-colors group">
                            <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center flex-shrink-0">
                                <Receipt className="text-slate-300" size={18} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-white font-semibold">{invoice.description}</h4>
                                {getStatusBadge(invoice.status)}
                                </div>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-400 text-sm">
                                <span className="flex items-center gap-1"><Calendar size={12} />{new Date(invoice.date).toLocaleDateString()}</span>
                                <span className="flex items-center gap-1 cursor-pointer hover:text-white" onClick={() => handleCopyInvoiceId(invoice.invoiceId)}>
                                    <FileText size={12} />{invoice.invoiceId}
                                    <Copy size={10} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </span>
                                {invoice.creditsAdded && <span className="text-emerald-400">+{invoice.creditsAdded} credits</span>}
                                </div>
                            </div>
                            </div>

                            <div className="flex items-center gap-4 mt-3 sm:mt-0 w-full sm:w-auto">
                            <div className="text-right flex-1">
                                <p className="text-white font-semibold text-lg">${invoice.amount}</p>
                                <p className="text-slate-400 text-xs">{invoice.paymentMethod}</p>
                            </div>
                            <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="sm" onClick={() => handleViewInvoice(invoice)} className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-full w-8 h-8 p-0">
                                <Eye size={14} />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDownloadInvoice(invoice)} className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 rounded-full w-8 h-8 p-0">
                                <Download size={14} />
                                </Button>
                            </div>
                            </div>
                        </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <FileText className="mx-auto text-slate-400 mb-4" size={48} />
                            <h3 className="text-xl text-white mb-2">No transaction history</h3>
                            <p className="text-slate-300 mb-6">Your transaction history will appear here once you make your first purchase.</p>
                        </div>
                    )}
                  </div>

                  {billingHistory.length > 0 && (
                     <div className="pt-6 text-center border-t border-white/10 mt-6">
                        <Button variant="outline" className="border-blue-400/30 text-blue-400 hover:bg-blue-400/10"
                            onClick={() => handleDownloadInvoice({id: 0, date: new Date().toISOString(), description: "Full History", amount: 0, status: 'paid', invoiceId: 'BULK', paymentMethod: 'N/A'})}>
                            <Download size={16} className="mr-2" />
                            Download Full History (CSV)
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
                    <div key={method.id} className="flex items-center justify-between p-4 rounded-lg border border-white/10 hover:border-white/20 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center">
                          {getPaymentMethodIcon(method.type)}
                        </div>
                        <div>
                          <p className="text-white font-semibold">{method.brand} •••• {method.lastFour}</p>
                          {method.expiryDate && <p className="text-slate-400 text-sm">Expires {method.expiryDate}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {method.isDefault ? (
                          <Badge className="bg-emerald-500/20 text-emerald-300 border-0 text-xs">Default</Badge>
                        ) : (
                          <Button variant="ghost" size="sm" onClick={() => handleSetDefaultPayment(method.id)} className="text-slate-400 hover:text-white rounded-full w-8 h-8 p-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <Star size={14} />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => handleDeletePayment(method.id)}
                            className="text-red-400 hover:bg-red-500/10 rounded-full w-8 h-8 p-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button onClick={() => setIsAddPaymentModalOpen(true)} variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 border-dashed">
                    <CreditCard className="mr-2" size={16} />
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
                      {mockBillingInfo.name}<br />
                      {mockBillingInfo.address1}, {mockBillingInfo.address2}<br />
                      {mockBillingInfo.city}, {mockBillingInfo.zip}<br />
                      {mockBillingInfo.country}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Contact Information</p>
                    <div className="space-y-2">
                      <p className="text-white flex items-center gap-2"><Mail size={14} className="text-slate-400" />{mockBillingInfo.email}</p>
                      <p className="text-white flex items-center gap-2"><Phone size={14} className="text-slate-400" />{mockBillingInfo.phone}</p>
                    </div>
                  </div>
                  <Button onClick={() => setIsEditBillingModalOpen(true)} variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
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
                    <div className="flex justify-between items-center"><span className="text-slate-300">This Month</span><span className="text-white font-semibold">$24.99</span></div>
                    <div className="flex justify-between items-center"><span className="text-slate-300">Last Month</span><span className="text-white font-semibold">$24.99</span></div>
                    <div className="flex justify-between items-center"><span className="text-slate-300">Total Spent</span><span className="text-white font-semibold">$349.86</span></div>
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
                    <p className="text-slate-300 text-sm mb-4">Our support team is here to help with any billing questions.</p>
                    <Button variant="outline" className="border-blue-400/30 text-blue-400 hover:bg-blue-400/10 w-full">
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