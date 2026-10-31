import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  DiscountRule,
  DiscountValidationResult,
  Frequency,
  Plan,
  Product,
  ProductVariant,
} from '../types';
import {
  Package,
  Plus,
  Search,
  Filter,
  Tag,
  Calendar,
  Percent,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit3,
  Layers,
  Sparkles,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sliders,
  Check,
} from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'products' | 'plans' | 'discounts'>('products');

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // Plans state
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedFrequency, setSelectedFrequency] = useState<string>('ALL');

  // Discounts state
  const [discounts, setDiscounts] = useState<DiscountRule[]>([]);
  const [testCode, setTestCode] = useState<string>('WELCOME2026');
  const [testAmount, setTestAmount] = useState<number>(1000);
  const [calcResult, setCalcResult] = useState<DiscountValidationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  // Common UI state
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [showProductModal, setShowProductModal] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<{
    name: string;
    type: string;
    salesPrice: number;
    costPrice: number;
    notes: string;
    isActive: boolean;
  }>({
    name: '',
    type: 'Software',
    salesPrice: 199,
    costPrice: 30,
    notes: '',
    isActive: true,
  });

  // Variant Modal state
  const [showVariantModal, setShowVariantModal] = useState<boolean>(false);
  const [targetProductForVariant, setTargetProductForVariant] = useState<Product | null>(null);
  const [variantForm, setVariantForm] = useState<{ name: string; priceAdjustment: number }>({
    name: '',
    priceAdjustment: 0,
  });

  // Plan Modal state
  const [showPlanModal, setShowPlanModal] = useState<boolean>(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [planForm, setPlanForm] = useState<{
    name: string;
    description: string;
    price: number;
    billingFrequency: Frequency;
    minQuantity: number;
    canPause: boolean;
    canRenew: boolean;
    autoClose: boolean;
    isActive: boolean;
  }>({
    name: '',
    description: '',
    price: 499,
    billingFrequency: 'MONTHLY',
    minQuantity: 1,
    canPause: true,
    canRenew: true,
    autoClose: false,
    isActive: true,
  });

  // Discount Modal state
  const [showDiscountModal, setShowDiscountModal] = useState<boolean>(false);
  const [discountForm, setDiscountForm] = useState<{
    code: string;
    description: string;
    type: 'PERCENTAGE' | 'FIXED';
    value: number;
    minPurchase: number;
    maxUsage: number;
    isActive: boolean;
  }>({
    code: '',
    description: '',
    type: 'PERCENTAGE',
    value: 15,
    minPurchase: 200,
    maxUsage: 100,
    isActive: true,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [prodsData, plansData, discsData] = await Promise.all([
        api.products.getAll(),
        api.products.getPlans(),
        api.products.getDiscounts(),
      ]);
      setProducts(prodsData);
      setPlans(plansData);
      setDiscounts(discsData);
    } catch (err: any) {
      showToast(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesType = selectedType === 'ALL' || p.type.toLowerCase() === selectedType.toLowerCase();
    const q = searchKeyword.toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.type.toLowerCase().includes(q) ||
      (p.notes && p.notes.toLowerCase().includes(q)) ||
      p.variants.some((v) => v.name.toLowerCase().includes(q));
    return matchesType && matchesSearch;
  });

  // Filtered Plans
  const filteredPlans = plans.filter((pl) => {
    return selectedFrequency === 'ALL' || pl.billingFrequency === selectedFrequency;
  });

  // Handlers for Products
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        const updated = await api.products.update(editingProduct.id, productForm);
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        showToast(`Product '${updated.name}' updated successfully.`);
      } else {
        const created = await api.products.create(productForm);
        setProducts((prev) => [created, ...prev]);
        showToast(`Product '${created.name}' created successfully.`);
      }
      setShowProductModal(false);
      setEditingProduct(null);
    } catch (err: any) {
      alert(err.message || 'Error saving product');
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove product '${name}'?`)) return;
    try {
      await api.products.delete(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast(`Product '${name}' deleted successfully.`);
    } catch (err: any) {
      alert(err.message || 'Error deleting product');
    }
  };

  // Handlers for Variants
  const handleAddVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetProductForVariant) return;
    try {
      const newVar = await api.products.addVariant(targetProductForVariant.id, variantForm);
      setProducts((prev) =>
        prev.map((p) =>
          p.id === targetProductForVariant.id ? { ...p, variants: [...p.variants, newVar] } : p
        )
      );
      showToast(`Variant '${newVar.name}' added to ${targetProductForVariant.name}.`);
      setShowVariantModal(false);
      setTargetProductForVariant(null);
      setVariantForm({ name: '', priceAdjustment: 0 });
    } catch (err: any) {
      alert(err.message || 'Error adding variant');
    }
  };

  const handleDeleteVariant = async (productId: string, variantId: string, varName: string) => {
    if (!confirm(`Delete variant '${varName}'?`)) return;
    try {
      await api.products.deleteVariant(productId, variantId);
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, variants: p.variants.filter((v) => v.id !== variantId) } : p
        )
      );
      showToast(`Variant '${varName}' deleted.`);
    } catch (err: any) {
      alert(err.message || 'Error removing variant');
    }
  };

  // Handlers for Plans
  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        const updated = await api.products.updatePlan(editingPlan.id, planForm);
        setPlans((prev) => prev.map((pl) => (pl.id === updated.id ? updated : pl)));
        showToast(`Plan '${updated.name}' updated successfully.`);
      } else {
        const created = await api.products.createPlan(planForm);
        setPlans((prev) => [created, ...prev]);
        showToast(`Plan '${created.name}' created successfully.`);
      }
      setShowPlanModal(false);
      setEditingPlan(null);
    } catch (err: any) {
      alert(err.message || 'Error saving plan');
    }
  };

  const handleDeletePlan = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete plan '${name}'?`)) return;
    try {
      await api.products.deletePlan(id);
      setPlans((prev) => prev.filter((pl) => pl.id !== id));
      showToast(`Plan '${name}' deleted successfully.`);
    } catch (err: any) {
      alert(err.message || 'Error deleting plan');
    }
  };

  // Handlers for Discounts
  const handleSaveDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.products.createDiscount(discountForm);
      setDiscounts((prev) => [created, ...prev]);
      showToast(`Promo code '${created.code}' created successfully.`);
      setShowDiscountModal(false);
      setDiscountForm({
        code: '',
        description: '',
        type: 'PERCENTAGE',
        value: 15,
        minPurchase: 200,
        maxUsage: 100,
        isActive: true,
      });
    } catch (err: any) {
      alert(err.message || 'Error creating discount code');
    }
  };

  const handleDeleteDiscount = async (id: string, code: string) => {
    if (!confirm(`Delete promo code '${code}'?`)) return;
    try {
      await api.products.deleteDiscount(id);
      setDiscounts((prev) => prev.filter((d) => d.id !== id));
      showToast(`Promo rule '${code}' deleted.`);
    } catch (err: any) {
      alert(err.message || 'Error deleting discount');
    }
  };

  const handleTestDiscount = async () => {
    if (!testCode.trim()) return;
    try {
      setIsCalculating(true);
      const res = await api.products.validateDiscount(testCode.trim(), Number(testAmount) || 0);
      setCalcResult(res);
    } catch (err: any) {
      alert(err.message || 'Validation error');
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-zinc-700 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Hero Header matching Brightloop design */}
      <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-800 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Catalog & Revenue Architecture</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
              Products, Plans & Discounts
            </h1>
            <p className="text-zinc-600 text-sm sm:text-base max-w-2xl leading-relaxed">
              Configure product variants, multi-frequency subscription billing models (Daily, Weekly, Monthly,
              Yearly), and targeted promotion discount engines.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {activeTab === 'products' && (
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({
                    name: '',
                    type: 'Software',
                    salesPrice: 299,
                    costPrice: 40,
                    notes: '',
                    isActive: true,
                  });
                  setShowProductModal(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-950 text-white text-xs font-semibold shadow hover:bg-zinc-800 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Create Product</span>
              </button>
            )}

            {activeTab === 'plans' && (
              <button
                onClick={() => {
                  setEditingPlan(null);
                  setPlanForm({
                    name: '',
                    description: '',
                    price: 499,
                    billingFrequency: 'MONTHLY',
                    minQuantity: 1,
                    canPause: true,
                    canRenew: true,
                    autoClose: false,
                    isActive: true,
                  });
                  setShowPlanModal(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow hover:bg-indigo-700 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Create Subscription Plan</span>
              </button>
            )}

            {activeTab === 'discounts' && (
              <button
                onClick={() => setShowDiscountModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-semibold shadow hover:bg-purple-700 transition"
              >
                <Tag className="w-4 h-4" />
                <span>Create Promo Code</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-3 border-t border-zinc-150 pt-6 mt-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
              activeTab === 'products'
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Products & Variants ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('plans')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
              activeTab === 'plans'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Subscription Plans ({plans.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('discounts')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
              activeTab === 'discounts'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            <Percent className="w-4 h-4" />
            <span>Discounts & Promotions ({discounts.length})</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-zinc-500 text-sm font-medium">Loading catalog components...</p>
        </div>
      ) : (
        <>
          {/* ================= SECTION 1: PRODUCTS & VARIANTS ================= */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              {/* Search & Filters */}
              <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Search by product or variant name..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                  <span className="text-xs font-medium text-zinc-400 flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5" /> Type:
                  </span>
                  {['ALL', 'Software', 'License', 'Add-on', 'Service'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedType(t)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        selectedType === t
                          ? 'bg-zinc-900 text-white'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Products List Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((prod) => {
                  const margin =
                    prod.salesPrice > 0
                      ? Math.round(((prod.salesPrice - prod.costPrice) / prod.salesPrice) * 100)
                      : 0;

                  return (
                    <div
                      key={prod.id}
                      className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div>
                        {/* Header: Type Pill & Actions */}
                        <div className="flex items-center justify-between mb-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              prod.type === 'Software'
                                ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                : prod.type === 'License'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                : prod.type === 'Add-on'
                                ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                : 'bg-purple-50 text-purple-700 border border-purple-100'
                            }`}
                          >
                            {prod.type}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setEditingProduct(prod);
                                setProductForm({
                                  name: prod.name,
                                  type: prod.type,
                                  salesPrice: prod.salesPrice,
                                  costPrice: prod.costPrice,
                                  notes: prod.notes || '',
                                  isActive: prod.isActive,
                                });
                                setShowProductModal(true);
                              }}
                              className="p-1.5 text-zinc-400 hover:text-zinc-800 rounded-lg hover:bg-zinc-100"
                              title="Edit Product"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id, prod.name)}
                              className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Title & Description */}
                        <h3 className="text-xl font-bold text-zinc-950 tracking-tight leading-snug mb-1">
                          {prod.name}
                        </h3>
                        <p className="text-zinc-500 text-xs line-clamp-2 leading-relaxed mb-4">
                          {prod.notes || 'No extended notes specified for this catalog item.'}
                        </p>

                        {/* Pricing details */}
                        <div className="bg-zinc-50 p-3 rounded-2xl border border-zinc-150 flex items-center justify-between text-xs mb-4">
                          <div>
                            <span className="text-zinc-400 block text-[11px]">Base Sales Price</span>
                            <strong className="text-base font-bold text-zinc-900">
                              ${prod.salesPrice.toFixed(2)}
                            </strong>
                          </div>
                          <div className="text-right">
                            <span className="text-zinc-400 block text-[11px]">Gross Margin</span>
                            <span className="font-bold text-emerald-600">{margin}%</span>
                          </div>
                        </div>

                        {/* Variants Compartment */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-zinc-700 flex items-center gap-1">
                              <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                              <span>Configured Variants ({prod.variants.length})</span>
                            </span>
                            <button
                              onClick={() => {
                                setTargetProductForVariant(prod);
                                setVariantForm({ name: '', priceAdjustment: 0 });
                                setShowVariantModal(true);
                              }}
                              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                            >
                              + Add Variant
                            </button>
                          </div>

                          <div className="space-y-1.5">
                            {prod.variants.length === 0 ? (
                              <div className="text-xs text-zinc-400 italic bg-zinc-50/50 p-2.5 rounded-xl border border-dashed border-zinc-200 text-center">
                                No variants configured yet.
                              </div>
                            ) : (
                              prod.variants.map((v) => (
                                <div
                                  key={v.id}
                                  className="flex items-center justify-between bg-white border border-zinc-150 px-3 py-1.5 rounded-xl text-xs group hover:border-indigo-200 transition"
                                >
                                  <span className="font-medium text-zinc-800">{v.name}</span>
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`font-mono text-xs font-semibold ${
                                        v.priceAdjustment > 0
                                          ? 'text-indigo-600'
                                          : v.priceAdjustment < 0
                                          ? 'text-emerald-600'
                                          : 'text-zinc-400'
                                      }`}
                                    >
                                      {v.priceAdjustment > 0
                                        ? `+$${v.priceAdjustment.toFixed(2)}`
                                        : v.priceAdjustment < 0
                                        ? `-$${Math.abs(v.priceAdjustment).toFixed(2)}`
                                        : '$0.00'}
                                    </span>
                                    <button
                                      onClick={() => handleDeleteVariant(prod.id, v.id, v.name)}
                                      className="text-zinc-300 hover:text-rose-500 transition opacity-0 group-hover:opacity-100"
                                      title="Remove Variant"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status indicator */}
                      <div className="pt-3 border-t border-zinc-150 flex items-center justify-between text-xs">
                        <span className="text-zinc-400">Status</span>
                        {prod.isActive ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                          </span>
                        ) : (
                          <span className="text-zinc-400 font-medium">Inactive</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= SECTION 2: SUBSCRIPTION PLANS ================= */}
          {activeTab === 'plans' && (
            <div className="space-y-6">
              {/* Frequency Filters */}
              <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-x-auto">
                  <span className="text-xs font-medium text-zinc-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Billing Frequency:
                  </span>
                  {['ALL', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'].map((freq) => (
                    <button
                      key={freq}
                      onClick={() => setSelectedFrequency(freq)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        selectedFrequency === freq
                          ? 'bg-indigo-600 text-white'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      {freq}
                    </button>
                  ))}
                </div>

                <div className="text-xs text-zinc-500">
                  Showing <strong>{filteredPlans.length}</strong> configured plans
                </div>
              </div>

              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlans.map((pl, idx) => {
                  const colors = [
                    'bg-[#dbeafe] text-[#1e3a8a]',
                    'bg-[#ede9fe] text-[#581c87]',
                    'bg-[#dcfce7] text-[#14532d]',
                    'bg-[#fef3c7] text-[#78350f]',
                    'bg-[#ffe4e6] text-[#881337]',
                  ];
                  const colorClass = colors[idx % colors.length];

                  return (
                    <div
                      key={pl.id}
                      className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div>
                        {/* Plan Header */}
                        <div className="flex items-center justify-between mb-4">
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {pl.billingFrequency} CYCLE
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingPlan(pl);
                                setPlanForm({
                                  name: pl.name,
                                  description: pl.description || '',
                                  price: pl.price,
                                  billingFrequency: pl.billingFrequency,
                                  minQuantity: pl.minQuantity,
                                  canPause: pl.canPause,
                                  canRenew: pl.canRenew,
                                  autoClose: pl.autoClose,
                                  isActive: pl.isActive,
                                });
                                setShowPlanModal(true);
                              }}
                              className="p-1.5 text-zinc-400 hover:text-zinc-800 rounded-lg hover:bg-zinc-100"
                              title="Edit Plan"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeletePlan(pl.id, pl.name)}
                              className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                              title="Delete Plan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <h3 className="text-xl font-bold text-zinc-950 tracking-tight leading-snug mb-2">
                          {pl.name}
                        </h3>
                        <p className="text-zinc-500 text-xs leading-relaxed mb-6">
                          {pl.description || 'Flexible cloud subscription plan configuration.'}
                        </p>
                      </div>

                      {/* Bottom Compartment styled with pastel theme */}
                      <div className="space-y-4">
                        <div className={`rounded-2xl p-4 ${colorClass} flex items-center justify-between`}>
                          <div>
                            <div className="text-xs font-medium opacity-80">Recurring Price</div>
                            <div className="text-2xl font-extrabold tracking-tight">
                              ${pl.price.toFixed(2)}{' '}
                              <span className="text-xs font-medium opacity-75">
                                / {pl.billingFrequency.toLowerCase()}
                              </span>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/80 shadow-sm">
                            Min: {pl.minQuantity} unit{pl.minQuantity > 1 ? 's' : ''}
                          </span>
                        </div>

                        {/* Plan Configuration Features */}
                        <div className="grid grid-cols-2 gap-2 text-xs text-zinc-600 pt-2">
                          <div className="flex items-center gap-1.5">
                            {pl.canPause ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <span className="w-4 h-4 text-zinc-300 font-bold">✕</span>
                            )}
                            <span>Pause Allowed</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {pl.canRenew ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <span className="w-4 h-4 text-zinc-300 font-bold">✕</span>
                            )}
                            <span>Auto-Renewable</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= SECTION 3: DISCOUNTS & PROMOTIONS ================= */}
          {activeTab === 'discounts' && (
            <div className="space-y-6">
              {/* Interactive Sandbox: Promo Code Validator & Calculator */}
              <div className="bg-gradient-to-br from-indigo-900 to-zinc-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
                <div className="max-w-2xl space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-semibold">
                    <Zap className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Live Promotion Engine Sandbox</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Instant Promo Code & Discount Simulator
                  </h2>
                  <p className="text-zinc-300 text-xs sm:text-sm">
                    Test discount rules against arbitrary purchase amounts in real-time. Enforces percentage rates,
                    minimum purchase limits, and active status.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
                    <div className="sm:col-span-5">
                      <label className="text-xs text-zinc-400 block mb-1">Promo Code</label>
                      <input
                        type="text"
                        placeholder="e.g. WELCOME2026"
                        value={testCode}
                        onChange={(e) => setTestCode(e.target.value.toUpperCase())}
                        className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <label className="text-xs text-zinc-400 block mb-1">Purchase Amount ($)</label>
                      <input
                        type="number"
                        placeholder="1000"
                        value={testAmount}
                        onChange={(e) => setTestAmount(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                    </div>
                    <div className="sm:col-span-3 flex items-end">
                      <button
                        onClick={handleTestDiscount}
                        disabled={isCalculating}
                        className="w-full py-2.5 px-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 font-bold text-xs text-white shadow-lg transition"
                      >
                        {isCalculating ? 'Checking...' : 'Calculate'}
                      </button>
                    </div>
                  </div>

                  {/* Calculation Result Display */}
                  {calcResult && (
                    <div
                      className={`mt-4 p-4 rounded-2xl border ${
                        calcResult.valid
                          ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                          : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
                      }`}
                    >
                      {calcResult.valid ? (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                          <div>
                            <span className="font-bold text-sm block text-emerald-300">
                              ✓ Promo Code Applied: {calcResult.rule?.code}
                            </span>
                            <span className="opacity-90">{calcResult.rule?.description}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-zinc-400 block text-[11px]">Deduction</span>
                            <span className="text-base font-extrabold text-emerald-400">
                              -${calcResult.discountAmount.toFixed(2)}
                            </span>{' '}
                            <span className="text-xs text-zinc-300">
                              (Final: ${calcResult.finalAmount.toFixed(2)})
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs font-semibold text-rose-300">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>{calcResult.error || 'Discount code is invalid.'}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Discount Rules Table */}
              <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-150">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-950">Configured Discount Rules</h3>
                    <p className="text-xs text-zinc-500">Active promo codes and coupon thresholds</p>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-zinc-100 text-zinc-800">
                    {discounts.length} Active Rules
                  </span>
                </div>

                <div className="overflow-x-auto pt-4">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-zinc-150 text-zinc-400 uppercase tracking-wider">
                        <th className="py-3 font-semibold">Promo Code</th>
                        <th className="py-3 font-semibold">Description</th>
                        <th className="py-3 font-semibold">Benefit</th>
                        <th className="py-3 font-semibold">Min Spend</th>
                        <th className="py-3 font-semibold">Usage</th>
                        <th className="py-3 font-semibold">Status</th>
                        <th className="py-3 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {discounts.map((rule) => (
                        <tr key={rule.id} className="hover:bg-zinc-50/60 transition">
                          <td className="py-3.5">
                            <span className="font-mono font-bold text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-lg border border-purple-100">
                              {rule.code}
                            </span>
                          </td>
                          <td className="py-3.5 text-zinc-600 max-w-xs">{rule.description || '—'}</td>
                          <td className="py-3.5 font-bold text-zinc-900">
                            {rule.type === 'PERCENTAGE' ? `${rule.value}% Off` : `$${rule.value.toFixed(2)} Flat`}
                          </td>
                          <td className="py-3.5 text-zinc-700">
                            {rule.minPurchase ? `$${rule.minPurchase.toFixed(2)}` : 'None'}
                          </td>
                          <td className="py-3.5 text-zinc-600 font-mono text-[11px]">
                            {rule.timesUsed} / {rule.maxUsage || '∞'}
                          </td>
                          <td className="py-3.5">
                            {rule.isActive ? (
                              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                                Active
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-zinc-200 text-zinc-600">
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 text-right">
                            <button
                              onClick={() => handleDeleteDiscount(rule.id, rule.code)}
                              className="text-zinc-400 hover:text-rose-600 transition p-1"
                              title="Delete Rule"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ================= MODAL: CREATE / EDIT PRODUCT ================= */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-150 pb-3">
              <h3 className="text-lg font-bold text-zinc-950">
                {editingProduct ? 'Edit Product' : 'Create New Product'}
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-zinc-400 hover:text-zinc-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Brightloop Core ERP"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-700 block mb-1">Product Type</label>
                  <select
                    value={productForm.type}
                    onChange={(e) => setProductForm({ ...productForm, type: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  >
                    <option value="Software">Software</option>
                    <option value="License">License</option>
                    <option value="Add-on">Add-on</option>
                    <option value="Service">Service</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-zinc-700 block mb-1">Sales Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.salesPrice}
                    onChange={(e) =>
                      setProductForm({ ...productForm, salesPrice: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Cost Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={productForm.costPrice}
                  onChange={(e) => setProductForm({ ...productForm, costPrice: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Key features, specifications, and provisioning details..."
                  value={productForm.notes}
                  onChange={(e) => setProductForm({ ...productForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-150">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 rounded-xl text-zinc-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-zinc-950 text-white font-bold shadow hover:bg-zinc-800 transition"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD VARIANT ================= */}
      {showVariantModal && targetProductForVariant && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-150 pb-3">
              <div>
                <h3 className="text-base font-bold text-zinc-950">Add Product Variant</h3>
                <p className="text-xs text-zinc-400">For {targetProductForVariant.name}</p>
              </div>
              <button
                onClick={() => setShowVariantModal(false)}
                className="text-zinc-400 hover:text-zinc-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddVariant} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Variant Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Odoo Brand Edition"
                  value={variantForm.name}
                  onChange={(e) => setVariantForm({ ...variantForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">
                  Price Adjustment ($) (e.g. +560.00)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={variantForm.priceAdjustment}
                  onChange={(e) =>
                    setVariantForm({ ...variantForm, priceAdjustment: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowVariantModal(false)}
                  className="px-4 py-2 rounded-xl text-zinc-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold shadow hover:bg-indigo-700 transition"
                >
                  Add Variant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE / EDIT PLAN ================= */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-150 pb-3">
              <h3 className="text-lg font-bold text-zinc-950">
                {editingPlan ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
              </h3>
              <button
                onClick={() => setShowPlanModal(false)}
                className="text-zinc-400 hover:text-zinc-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Plan Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Enterprise Cloud Suite"
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-700 block mb-1">Billing Frequency</label>
                  <select
                    value={planForm.billingFrequency}
                    onChange={(e) =>
                      setPlanForm({ ...planForm, billingFrequency: e.target.value as Frequency })
                    }
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-zinc-700 block mb-1">Recurring Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={planForm.price}
                    onChange={(e) => setPlanForm({ ...planForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Minimum Order Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={planForm.minQuantity}
                  onChange={(e) => setPlanForm({ ...planForm, minQuantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Plan features, SLA tier, and billing terms..."
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="bg-zinc-50 p-3 rounded-2xl border border-zinc-150 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-zinc-800">
                  <input
                    type="checkbox"
                    checked={planForm.canPause}
                    onChange={(e) => setPlanForm({ ...planForm, canPause: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Allow subscribers to pause this plan</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium text-zinc-800">
                  <input
                    type="checkbox"
                    checked={planForm.canRenew}
                    onChange={(e) => setPlanForm({ ...planForm, canRenew: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Allow automated recurring renewal</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-150">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="px-4 py-2 rounded-xl text-zinc-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold shadow hover:bg-indigo-700 transition"
                >
                  {editingPlan ? 'Save Changes' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE DISCOUNT ================= */}
      {showDiscountModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-150 pb-3">
              <h3 className="text-lg font-bold text-zinc-950">Create Promo Discount</h3>
              <button
                onClick={() => setShowDiscountModal(false)}
                className="text-zinc-400 hover:text-zinc-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDiscount} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Promo Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FLASH30"
                  value={discountForm.code}
                  onChange={(e) => setDiscountForm({ ...discountForm, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl font-mono uppercase font-bold focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-700 block mb-1">Discount Type</label>
                  <select
                    value={discountForm.type}
                    onChange={(e) =>
                      setDiscountForm({ ...discountForm, type: e.target.value as 'PERCENTAGE' | 'FIXED' })
                    }
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount ($)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-zinc-700 block mb-1">
                    Value {discountForm.type === 'PERCENTAGE' ? '(%)' : '($)'} *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={discountForm.value}
                    onChange={(e) => setDiscountForm({ ...discountForm, value: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-700 block mb-1">Min Spend Requirement ($)</label>
                  <input
                    type="number"
                    value={discountForm.minPurchase}
                    onChange={(e) =>
                      setDiscountForm({ ...discountForm, minPurchase: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div>
                  <label className="font-semibold text-zinc-700 block mb-1">Max Usages</label>
                  <input
                    type="number"
                    value={discountForm.maxUsage}
                    onChange={(e) => setDiscountForm({ ...discountForm, maxUsage: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Terms or campaign details..."
                  value={discountForm.description}
                  onChange={(e) => setDiscountForm({ ...discountForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-150">
                <button
                  type="button"
                  onClick={() => setShowDiscountModal(false)}
                  className="px-4 py-2 rounded-xl text-zinc-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold shadow hover:bg-purple-700 transition"
                >
                  Create Promo Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
