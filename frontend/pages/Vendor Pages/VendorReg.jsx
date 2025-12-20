import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Store, Clock, Briefcase, Image, HelpCircle } from "lucide-react";
import VendorMap from "../../components/VendorMap";

/**
 * VendorOnboarding - Multi-step vendor registration form
 * Modern, responsive design with step-by-step navigation
 */

/* --- Helpers & initial data --- */
const SAMPLE_CATEGORIES = [
  "Restaurant",
  "Bakery",
  "Florist",
  "Mechanic",
  "Salon",
  "Spa",
  "Gym",
  "Other",
];

const defaultHours = {
  mon: { open: "09:00", close: "17:00", enabled: true },
  tue: { open: "09:00", close: "17:00", enabled: true },
  wed: { open: "09:00", close: "17:00", enabled: true },
  thu: { open: "09:00", close: "17:00", enabled: true },
  fri: { open: "09:00", close: "17:00", enabled: true },
  sat: { open: "10:00", close: "14:00", enabled: false },
  sun: { open: "10:00", close: "14:00", enabled: false },
};

const initialState = {
  businessName: "",
  address: "",
  phone: "",
  email: "",
  website: "",
  category: "",
  tags: "",
  description: "",
  ownerName: "",
  ownerPhone: "",
  ownerEmail: "",
  logoUrl: "",
  bannerUrl: "",
  hours: defaultHours,
  services: [
    { id: 1, name: "Sample Service", durationMin: 30, price: 10.0 },
  ],
  delivery: { pickup: true, delivery: false },
  payments: { cash: true, card: true, stripe: false, bankTransfer: false },
  taxId: "",
  bankAccount: { bankName: "", accountNumber: "", routingNumber: "" },
  logoFile: null,
  coverFile: null,
  password: "",
  confirmPassword: "",
  serviceType: "both", // "booking", "ordering", or "both"
  location: {
    latitude: null,
    longitude: null,
    address: ""
  }
};

let serviceIdCounter = 2;

/* --- Component --- */
export default function VendorOnboarding() {
  const navigate = useNavigate();
  
  const [form, setForm] = useState(() => {
    // try load saved data
    try {
      const saved = localStorage.getItem("vendor_onboard");
      return saved ? JSON.parse(saved) : initialState;
    } catch {
      return initialState;
    }
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // preview images if files are present (persisted as base64 in localStorage or file objects not persisted)
    if (form.logoFile && typeof form.logoFile === "string") {
      setLogoPreview(form.logoFile);
    }
    if (form.coverFile && typeof form.coverFile === "string") {
      setCoverPreview(form.coverFile);
    }
  }, []); // run once

  useEffect(() => {
    // autosave (serialize file previews only)
    const copy = { ...form, logoFile: logoPreview || null, coverFile: coverPreview || null };
    localStorage.setItem("vendor_onboard", JSON.stringify(copy));
  }, [form, logoPreview, coverPreview]);

  /* --- Handlers --- */
  const update = (patch) => setForm((s) => ({ ...s, ...patch }));

  const handleLogo = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setForm((s) => ({ ...s, logoFile: f.name }));
    const url = URL.createObjectURL(f);
    setLogoPreview(url);
  };
  const handleCover = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setForm((s) => ({ ...s, coverFile: f.name }));
    const url = URL.createObjectURL(f);
    setCoverPreview(url);
  };

  const addService = () => {
    const newService = { id: serviceIdCounter++, name: "", durationMin: 30, price: 0 };
    update({ services: [...form.services, newService] });
  };
  const removeService = (id) => update({ services: form.services.filter((s) => s.id !== id) });
  const updateService = (id, patch) =>
    update({ services: form.services.map((s) => (s.id === id ? { ...s, ...patch } : s)) });

  const toggleHour = (day) =>
    update({
      hours: { ...form.hours, [day]: { ...form.hours[day], enabled: !form.hours[day].enabled } },
    });

  const setHour = (day, field, value) =>
    update({
      hours: { ...form.hours, [day]: { ...form.hours[day], [field]: value } },
    });

  const validateStep = (st = step) => {
    const e = {};
    if (st === 1) {
      if (!form.businessName?.trim()) e.businessName = "Business name is required";
      if (!form.address?.trim()) e.address = "Address is required";
      if (!form.phone?.trim()) e.phone = "Phone is required";
      if (!form.ownerName?.trim()) e.ownerName = "Owner name is required";
      if (!form.ownerEmail?.trim()) e.ownerEmail = "Login email is required";
      if (form.ownerEmail && !/^[^\s]+@[^\s]+\.[^\s]+$/.test(form.ownerEmail)) e.ownerEmail = "Email looks invalid";
      if (!form.password?.trim()) e.password = "Password is required";
      if (form.password && form.password.length < 6) e.password = "Password must be at least 6 characters";
      if (form.password && form.confirmPassword && form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
      if (!form.ownerPhone?.trim()) e.ownerPhone = "Owner phone is required";
      if (form.email && !/^[^\s]+@[^\s]+\.[^\s]+$/.test(form.email)) e.email = "Email looks invalid";
      if (!form.category) e.category = "Choose a category";
    }
    if (st === 2) {
      // Step 2 is hours - no strict validation needed, hours are optional
    }
    if (st === 3) {
      // Step 3 is services - ensure at least one service
      if (!form.services?.length) e.services = "Add at least one service";
      form.services.forEach((s, idx) => {
        if (!s.name?.trim()) e[`service_${s.id}_name`] = `Service ${idx + 1} needs a name`;
        if (!s.durationMin || Number(s.durationMin) <= 0) e[`service_${s.id}_duration`] = "Duration required";
        if (s.price == null || Number(s.price) < 0) e[`service_${s.id}_price`] = "Price required";
      });
    }
    if (st === 4) {
      // Step 4 is images & review - optional
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(4, s + 1));
  };
  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  const handleSubmit = async (e) => {
    e?.preventDefault();
    // final validation - validate key steps
    if (!validateStep(1) || !validateStep(3)) {
      // If step 1 or 3 fails, go to the first failing step
      if (!validateStep(1)) {
        setStep(1);
      } else if (!validateStep(3)) {
        setStep(3);
      }
      return;
    }
    
    try {
      // Build payload for backend
      const payload = {
        businessName: form.businessName,
        ownerName: form.ownerName,
        email: form.ownerEmail,
        password: form.password,
        phone: form.ownerPhone,
        category: form.category,
        address: {
          street: form.address,
          city: "",
          state: "",
          zipCode: "",
          country: "",
          fullAddress: form.location.address || form.address
        },
        location: {
          latitude: form.location.latitude,
          longitude: form.location.longitude,
          coordinates: form.location.longitude && form.location.latitude 
            ? [form.location.longitude, form.location.latitude] 
            : undefined
        },
        description: form.description,
        services: form.services.map(s => s.name).filter(n => n),
        serviceType: form.serviceType,
        images: {
          logo: form.logoUrl || "",
          banner: form.bannerUrl || "",
          gallery: []
        }
      };

      const res = await axios.post("http://localhost:5000/api/auth/vendor/register", payload);
      
      alert(`Registration successful! ${res.data.message}\n\nYour application is pending admin approval. You'll be notified once approved.`);
      console.log("Vendor registered:", res.data);
      
      localStorage.removeItem("vendor_onboard");
      // reset
      setForm(initialState);
      setLogoPreview(null);
      setCoverPreview(null);
      setStep(1);
      
      // Redirect to login after 2 seconds
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Registration failed. Please try again.";
      alert(`Error: ${errorMsg}`);
      console.error("Registration error:", error);
    }
  };

  /* --- Render helpers --- */
  const renderStepper = () => {
    const steps = [
      { n: 1, title: "Business Info", icon: Store },
      { n: 2, title: "Hours", icon: Clock },
      { n: 3, title: "Services", icon: Briefcase },
      { n: 4, title: "Images", icon: Image },
    ];

    return (
      <aside className="hidden lg:flex lg:w-64 xl:w-80 bg-white border-r border-gray-200 flex-col min-h-screen">
        <div className="p-4 lg:p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white rounded-lg p-2 lg:p-2.5">
              <Store className="w-4 h-4 lg:w-5 lg:h-5" />
            </div>
            <div>
              <h3 className="text-base lg:text-lg font-bold text-gray-900">KhoojLocal</h3>
              <p className="text-xs text-gray-500">Vendor Onboarding</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 lg:p-6">
          <div className="space-y-1">
            {steps.map((item, idx) => {
              const active = item.n === step;
              const completed = item.n < step;
              const Icon = item.icon;
              
              return (
                <div
                  key={item.n}
                  className={`flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg transition-all ${
                    active
                      ? "bg-indigo-50 text-indigo-600"
                      : completed
                      ? "text-gray-600 hover:bg-gray-50"
                      : "text-gray-400"
                  }`}
                >
                  <div
                    className={`flex items-center justify-center w-7 h-7 lg:w-8 lg:h-8 rounded-full text-xs lg:text-sm font-semibold ${
                      active
                        ? "bg-indigo-600 text-white"
                        : completed
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {completed ? "✓" : item.n}
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs lg:text-sm font-medium ${active ? "text-indigo-600" : ""}`}>
                      Step {item.n}/4
                    </p>
                    <p className="text-xs text-gray-500">{item.title}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </nav>

        <div className="p-4 lg:p-6 border-t border-gray-200">
          <button 
            onClick={(e) => { e.preventDefault(); }}
            className="flex items-center gap-2 text-xs lg:text-sm text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
            Help Center
          </button>
        </div>
      </aside>
    );
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Business Information</h2>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">Let's get started by telling us about your business.</p>
            </div>

            <div className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Business Name</label>
                <input 
                  value={form.businessName} 
                  onChange={(e)=>update({ businessName: e.target.value })} 
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
                  placeholder="Enter your business name" 
                />
                {errors.businessName && <div className="text-red-600 text-xs sm:text-sm mt-1.5">{errors.businessName}</div>}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Address</label>
                <textarea 
                  value={form.address} 
                  onChange={(e)=>update({ address: e.target.value })} 
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none" 
                  rows={3}
                  placeholder="Enter your full business address" 
                />
                {errors.address && <div className="text-red-600 text-xs sm:text-sm mt-1.5">{errors.address}</div>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Phone Number</label>
                  <input 
                    value={form.phone} 
                    onChange={(e)=>update({ phone: e.target.value })} 
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
                    placeholder="Enter your phone number" 
                  />
                  {errors.phone && <div className="text-red-600 text-xs sm:text-sm mt-1.5">{errors.phone}</div>}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Business Category</label>
                  <select 
                    value={form.category} 
                    onChange={(e)=>update({ category: e.target.value })} 
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
                  >
                    <option value="">Select category</option>
                    {SAMPLE_CATEGORIES.map((c)=> <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.category && <div className="text-red-600 text-xs sm:text-sm mt-1.5">{errors.category}</div>}
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Business Email (Optional)</label>
                <input 
                  value={form.email} 
                  onChange={(e)=>update({ email: e.target.value })} 
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
                  placeholder="contact@business.com" 
                  type="email"
                />
                {errors.email && <div className="text-red-600 text-xs sm:text-sm mt-1.5">{errors.email}</div>}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Website (Optional)</label>
                <input 
                  value={form.website} 
                  onChange={(e)=>update({ website: e.target.value })} 
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
                  placeholder="https://your-website.com" 
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Short Description</label>
                <textarea
                  value={form.description} 
                  onChange={(e)=>update({ description: e.target.value })} 
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none" 
                  rows={3}
                  placeholder="A brief description of your business for customers"
                />
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Business Location</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-4">Pin your exact location on the map so customers can find you easily</p>
                <VendorMap
                  isEditable={true}
                  initialLocation={form.location}
                  onLocationChange={(locationData) => {
                    update({
                      location: {
                        latitude: locationData.latitude,
                        longitude: locationData.longitude,
                        address: locationData.address
                      }
                    });
                  }}
                  height="450px"
                />
                {errors.location && <div className="text-red-600 text-xs sm:text-sm mt-1.5">{errors.location}</div>}
              </div>

              <div className="pt-6 mt-4 border-t border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Service Type</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-4">What type of services will you offer?</p>
                <div className="space-y-3 mb-6">
                  <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition ${
                    form.serviceType === "booking" ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-indigo-300"
                  }`}>
                    <input
                      type="radio"
                      name="serviceType"
                      value="booking"
                      checked={form.serviceType === "booking"}
                      onChange={(e) => update({ serviceType: e.target.value })}
                      className="h-4 w-4 text-indigo-600"
                    />
                    <div>
                      <p className="font-medium text-sm">Booking Only</p>
                      <p className="text-xs text-gray-500">Appointments, services, reservations (e.g., Salon, Spa, Gym)</p>
                    </div>
                  </label>
                  <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition ${
                    form.serviceType === "ordering" ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-indigo-300"
                  }`}>
                    <input
                      type="radio"
                      name="serviceType"
                      value="ordering"
                      checked={form.serviceType === "ordering"}
                      onChange={(e) => update({ serviceType: e.target.value })}
                      className="h-4 w-4 text-indigo-600"
                    />
                    <div>
                      <p className="font-medium text-sm">Ordering Only</p>
                      <p className="text-xs text-gray-500">Products, food, items for delivery/pickup (e.g., Restaurant, Bakery, Florist)</p>
                    </div>
                  </label>
                  <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition ${
                    form.serviceType === "both" ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-indigo-300"
                  }`}>
                    <input
                      type="radio"
                      name="serviceType"
                      value="both"
                      checked={form.serviceType === "both"}
                      onChange={(e) => update({ serviceType: e.target.value })}
                      className="h-4 w-4 text-indigo-600"
                    />
                    <div>
                      <p className="font-medium text-sm">Both Booking & Ordering</p>
                      <p className="text-xs text-gray-500">Offer both appointments and product orders</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Owner Information & Login Credentials</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Owner Full Name *</label>
                    <input 
                      value={form.ownerName} 
                      onChange={(e)=>update({ ownerName: e.target.value })} 
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
                      placeholder="Enter owner's full name" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Login Email *</label>
                    <input 
                      value={form.ownerEmail} 
                      onChange={(e)=>update({ ownerEmail: e.target.value })} 
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
                      placeholder="owner@email.com (used for login)" 
                      type="email"
                    />
                    {errors.ownerEmail && <div className="text-red-600 text-xs sm:text-sm mt-1.5">{errors.ownerEmail}</div>}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Password *</label>
                    <input 
                      value={form.password || ""} 
                      onChange={(e)=>update({ password: e.target.value })} 
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
                      placeholder="Enter password (min 6 characters)" 
                      type="password"
                    />
                    {errors.password && <div className="text-red-600 text-xs sm:text-sm mt-1.5">{errors.password}</div>}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Confirm Password *</label>
                    <input 
                      value={form.confirmPassword || ""} 
                      onChange={(e)=>update({ confirmPassword: e.target.value })} 
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
                      placeholder="Confirm your password" 
                      type="password"
                    />
                    {errors.confirmPassword && <div className="text-red-600 text-xs sm:text-sm mt-1.5">{errors.confirmPassword}</div>}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Owner Phone Number *</label>
                    <input 
                      value={form.ownerPhone} 
                      onChange={(e)=>update({ ownerPhone: e.target.value })} 
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
                      placeholder="Enter owner's phone number" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Business Hours</h2>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">Set your business opening hours for each day of the week.</p>
            </div>

            <div className="space-y-2 sm:space-y-3">
              {Object.entries(form.hours).map(([day, info]) => (
                <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 sm:p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3 flex-1 min-w-[120px]">
                    <input 
                      type="checkbox" 
                      checked={info.enabled} 
                      onChange={()=>toggleHour(day)} 
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label className="text-sm font-medium text-gray-700 capitalize">{day}day</label>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-1">
                    <input 
                      type="time" 
                      value={info.open} 
                      disabled={!info.enabled} 
                      onChange={(e)=>setHour(day,"open",e.target.value)} 
                      className="flex-1 px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" 
                    />
                    <span className="text-xs sm:text-sm text-gray-400">to</span>
                    <input 
                      type="time" 
                      value={info.close} 
                      disabled={!info.enabled} 
                      onChange={(e)=>setHour(day,"close",e.target.value)} 
                      className="flex-1 px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Services</h2>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">Add the services you offer to your customers.</p>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {form.services.map((s, idx) => (
                <div key={s.id} className="p-3 sm:p-4 border border-gray-200 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-700">Service #{idx + 1}</h4>
                    {form.services.length > 1 && (
                      <button 
                        type="button"
                        className="text-red-600 hover:text-red-700 text-xs sm:text-sm font-medium px-2 py-1" 
                        onClick={(ev)=>{ ev.preventDefault(); removeService(s.id); }}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Service Name</label>
                      <input 
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" 
                        placeholder="e.g., Haircut, Consultation" 
                        value={s.name} 
                        onChange={(e)=>updateService(s.id, { name: e.target.value })} 
                      />
                      {errors[`service_${s.id}_name`] && <div className="text-red-600 text-xs sm:text-sm mt-1.5">{errors[`service_${s.id}_name`]}</div>}
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Duration (min)</label>
                        <input 
                          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" 
                          placeholder="30" 
                          value={s.durationMin} 
                          onChange={(e)=>updateService(s.id, { durationMin: e.target.value })} 
                          type="number" 
                          min="1"
                        />
                        {errors[`service_${s.id}_duration`] && <div className="text-red-600 text-xs sm:text-sm mt-1.5">{errors[`service_${s.id}_duration`]}</div>}
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Price ($)</label>
                        <input 
                          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" 
                          placeholder="0.00" 
                          value={s.price} 
                          onChange={(e)=>updateService(s.id, { price: e.target.value })} 
                          type="number" 
                          min="0" 
                          step="0.01"
                        />
                        {errors[`service_${s.id}_price`] && <div className="text-red-600 text-xs sm:text-sm mt-1.5">{errors[`service_${s.id}_price`]}</div>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button 
                type="button"
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-600 hover:border-indigo-500 hover:text-indigo-600 transition-colors active:scale-95" 
                onClick={(ev)=>{ ev.preventDefault(); addService(); }}
              >
                + Add Another Service
              </button>
              {errors.services && <div className="text-red-600 text-xs sm:text-sm mt-2">{errors.services}</div>}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Images & Review</h2>
              <p className="mt-1 text-sm text-gray-500">Upload your business logo and cover image, then review your information.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Business Logo URL</label>
                <input 
                  value={form.logoUrl} 
                  onChange={(e)=>update({ logoUrl: e.target.value })} 
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
                  placeholder="https://example.com/logo.jpg" 
                  type="url"
                />
                {form.logoUrl && (
                  <div className="mt-3 w-32 h-32 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden">
                    <img src={form.logoUrl} alt="logo preview" className="w-full h-full object-cover" onError={(e) => e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>'} />
                  </div>
                )}
                <p className="mt-2 text-xs text-gray-500">Enter a URL for your business logo (square recommended)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Banner Image URL</label>
                <input 
                  value={form.bannerUrl} 
                  onChange={(e)=>update({ bannerUrl: e.target.value })} 
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
                  placeholder="https://example.com/banner.jpg" 
                  type="url"
                />
                {form.bannerUrl && (
                  <div className="mt-3 w-full h-32 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden">
                    <img src={form.bannerUrl} alt="banner preview" className="w-full h-full object-cover" onError={(e) => e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>'} />
                  </div>
                )}
                <p className="mt-2 text-xs text-gray-500">Enter a URL for your banner image (16:9 ratio recommended)</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Review Summary</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Business Name:</span>
                  <p className="font-medium text-gray-900">{form.businessName || "—"}</p>
                </div>
                <div>
                  <span className="text-gray-500">Category:</span>
                  <p className="font-medium text-gray-900">{form.category || "—"}</p>
                </div>
                <div>
                  <span className="text-gray-500">Phone:</span>
                  <p className="font-medium text-gray-900">{form.phone || "—"}</p>
                </div>
                <div>
                  <span className="text-gray-500">Email:</span>
                  <p className="font-medium text-gray-900">{form.email || "—"}</p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-gray-500">Address:</span>
                  <p className="font-medium text-gray-900">{form.address || "—"}</p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-gray-500">Services:</span>
                  <p className="font-medium text-gray-900">
                    {form.services.map(s=>s.name || "(unnamed)").join(", ") || "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Sidebar Stepper */}
      {renderStepper()}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 text-white rounded-lg p-2">
                <Store className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">KhoojLocal</h3>
                <p className="text-xs text-gray-500">Vendor Registration</p>
              </div>
            </div>
            <div className="text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
              Step {step}/4
            </div>
          </div>
          
          {/* Mobile Progress Bar */}
          <div className="mt-3">
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 transition-all duration-300 ease-out"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Form Container */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-12">
            {/* Step Content */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8 shadow-sm">
              {renderStepContent()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white rounded-xl border border-gray-200 p-4 sm:p-5 lg:p-6 shadow-sm sticky bottom-0 lg:static">
              <button 
                type="button" 
                onClick={handleBack} 
                disabled={step === 1} 
                className="px-5 sm:px-6 py-3 sm:py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-95"
              >
                Back
              </button>

              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                <span>Step {step} of 4</span>
              </div>

              {step < 4 ? (
                <button 
                  type="button" 
                  onClick={handleNext} 
                  className="px-5 sm:px-6 py-3 sm:py-2.5 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors active:scale-95 shadow-md"
                >
                  Next Step
                </button>
              ) : (
                <button 
                  type="button"
                  onClick={handleSubmit} 
                  className="px-5 sm:px-6 py-3 sm:py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 transition-all active:scale-95 shadow-md"
                >
                  Submit & Finish
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
