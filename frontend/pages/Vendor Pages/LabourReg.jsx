import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Wrench, Phone, Shield, Upload, MapPin, FileText, AlertCircle, CheckCircle2, Clock, Briefcase } from "lucide-react";
import VendorMap from "../../components/VendorMap";
import useMobileNet from "../../hooks/useMobileNet";
import { CONFIDENCE_THRESHOLD, getCnicDecision } from "../../utils/cnicRules";

const SKILLS = ["Electrician", "Plumber", "Carpenter", "Painter", "Mason", "Welder", "Mechanic", "AC Technician", "Cleaner", "Gardener", "Driver", "Other"];
const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function LabourRegistration() {
  const navigate = useNavigate();
  const { isLoading: isModelLoading, error: modelError, classifyImage } = useMobileNet();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form data
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [cnicNumber, setCnicNumber] = useState("");
  const [skill, setSkill] = useState("");
  const [experience, setExperience] = useState("");
  const [availableDays, setAvailableDays] = useState([]);
  const [workingHours, setWorkingHours] = useState("");
  const [cnicFront, setCnicFront] = useState(null);
  const [cnicBack, setCnicBack] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [serviceArea, setServiceArea] = useState({ latitude: null, longitude: null, address: "", radius: 10 });
  const [bio, setBio] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // UI states
  const [otpSent, setOtpSent] = useState(false);
  const [errors, setErrors] = useState({});
  
  // File previews
  const [cnicFrontPreview, setCnicFrontPreview] = useState(null);
  const [cnicBackPreview, setCnicBackPreview] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState(null);
  const [cnicFrontDecision, setCnicFrontDecision] = useState(null);
  const [cnicBackDecision, setCnicBackDecision] = useState(null);

  const readFileAsDataURL = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const loadImageFromObjectURL = (objectURL) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = objectURL;
    });

  const classifyCnicCandidate = async (file) => {
    const objectURL = URL.createObjectURL(file);

    try {
      const imageElement = await loadImageFromObjectURL(objectURL);
      const predictions = await classifyImage(imageElement);
      return getCnicDecision(predictions, CONFIDENCE_THRESHOLD);
    } finally {
      URL.revokeObjectURL(objectURL);
    }
  };

  // Send OTP
  const handleSendOTP = async () => {
    if (!phone.trim()) {
      setErrors({ phone: "Phone number is required" });
      return;
    }
    
    setErrors({});
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/labour/send-otp", { phone });
      setOtpSent(true);
      alert("OTP sent to your phone number!");
    } catch (error) {
      setErrors({ phone: error.response?.data?.message || "Failed to send OTP" });
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      setErrors({ otp: "Please enter OTP" });
      return;
    }
    
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/labour/verify-otp", { phone, otp });
      setPhoneVerified(true);
      setErrors({});
      alert("Phone verified successfully!");
    } catch (error) {
      setErrors({ otp: error.response?.data?.message || "Invalid OTP" });
    } finally {
      setLoading(false);
    }
  };

  // Handle file uploads
  const handleFileChange = async (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ [type]: "File size must be less than 5MB" });
        return;
      }

      if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
        setErrors({ [type]: "Only JPG and PNG images are allowed" });
        return;
      }

      if (type === "cnicFront" || type === "cnicBack") {
        if (isModelLoading) {
          setErrors({ [type]: "Model is loading. Please wait a moment and try again." });
          return;
        }

        if (modelError) {
          setErrors({ [type]: "Classifier is unavailable right now. Please refresh and try again." });
          return;
        }

        try {
          const decision = await classifyCnicCandidate(file);

          if (decision.finalDecision !== "CNIC-like") {
            if (type === "cnicFront") {
              setCnicFront(null);
              setCnicFrontPreview(null);
              setCnicFrontDecision(null);
            } else {
              setCnicBack(null);
              setCnicBackPreview(null);
              setCnicBackDecision(null);
            }

            setErrors((prev) => ({
              ...prev,
              [type]: `Image blocked: not CNIC-like (top label: ${decision.topLabel}, confidence: ${(decision.confidence * 100).toFixed(1)}%).`,
            }));
            return;
          }

          if (type === "cnicFront") {
            setCnicFrontDecision(decision);
          } else {
            setCnicBackDecision(decision);
          }
        } catch (classificationError) {
          setErrors((prev) => ({
            ...prev,
            [type]: "Could not classify this image. Please try a clearer image.",
          }));
          return;
        }
      }

      const previewData = await readFileAsDataURL(file);

      if (type === "cnicFront") {
        setCnicFront(file);
        setCnicFrontPreview(previewData);
      } else if (type === "cnicBack") {
        setCnicBack(file);
        setCnicBackPreview(previewData);
      } else if (type === "selfie") {
        setSelfie(file);
        setSelfiePreview(previewData);
      }

      setErrors((prev) => ({ ...prev, [type]: null }));
    }
  };

  const toggleDay = (day) => {
    setAvailableDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  // Validate and submit
  const handleSubmit = async () => {
    const newErrors = {};
    
    console.log("Form validation starting...");
    console.log("Phone verified:", phoneVerified);
    console.log("Full name:", fullName);
    console.log("CNIC:", cnicNumber);
    console.log("Skill:", skill);
    console.log("Experience:", experience);
    console.log("Available days:", availableDays);
    console.log("Working hours:", workingHours);
    console.log("CNIC Front:", cnicFront);
    console.log("CNIC Back:", cnicBack);
    console.log("Selfie:", selfie);
    console.log("Service Area:", serviceArea);
    console.log("Bio:", bio);
    console.log("Password:", password ? "***" : "empty");
    
    if (!phoneVerified) newErrors.phone = "Please verify your phone number";
    if (!fullName.trim()) newErrors.fullName = "Full name is required";
    if (!/^\d{5}-\d{7}-\d{1}$/.test(cnicNumber)) newErrors.cnicNumber = "Invalid CNIC format (e.g., 12345-1234567-1)";
    if (!skill) newErrors.skill = "Skill is required";
    if (!experience || experience < 0) newErrors.experience = "Valid experience is required";
    if (availableDays.length === 0) newErrors.days = "Select at least one day";
    if (!workingHours.trim()) newErrors.hours = "Working hours required";
    if (!cnicFront) newErrors.cnicFront = "CNIC front image required";
    if (!cnicBack) newErrors.cnicBack = "CNIC back image required";
    if (!selfie) newErrors.selfie = "Selfie required";
    if (!serviceArea.latitude) newErrors.location = "Service area required";
    if (!bio.trim()) newErrors.bio = "Bio is required";
    if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords don't match";

    console.log("Validation errors:", newErrors);
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      alert("Please fill all required fields correctly");
      return;
    }

    setLoading(true);
    console.log("Starting registration...");
    try {
      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("phone", phone);
      formData.append("phoneVerified", phoneVerified);
      if (email) formData.append("email", email);
      formData.append("cnicNumber", cnicNumber);
      formData.append("skill", skill);
      formData.append("experience", experience);
      formData.append("availability", JSON.stringify({ days: availableDays, hours: workingHours }));
      formData.append("serviceArea", JSON.stringify(serviceArea));
      formData.append("bio", bio);
      formData.append("password", password);
      formData.append("cnicFront", cnicFront);
      formData.append("cnicBack", cnicBack);
      formData.append("selfie", selfie);

      console.log("Sending registration request...");
      const response = await axios.post("http://localhost:5000/api/labour/register", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      console.log("Registration response:", response.data);

      if (response.data.success) {
        alert("Registration successful! Your profile is under verification. You'll be notified once approved.");
        navigate("/login");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
              <Wrench className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Labour Registration</h1>
          </div>
          <p className="text-gray-600">Register as a skilled worker with verification</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition ${s <= step ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-500"}`}>
                    {s}
                  </div>
                  <p className="text-xs mt-2">{s === 1 ? "Phone & Info" : s === 2 ? "Documents" : "Area & Bio"}</p>
                </div>
                {s < 3 && <div className={`h-1 w-16 transition ${step > s ? "bg-purple-600" : "bg-gray-200"}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8">
          {/* Step 1: Phone Verification + Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-2"><Phone className="h-6 w-6 text-purple-600" />Phone Verification & Personal Info</h2>

              {/* Phone Verification */}
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-start gap-3 mb-4">
                  <Shield className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-purple-900">Verify Your Phone Number</h3>
                    <p className="text-sm text-purple-700">We'll send you a verification code</p>
                  </div>
                  {phoneVerified && <CheckCircle2 className="h-6 w-6 text-green-600" />}
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.phone) setErrors({ ...errors, phone: null });
                      }}
                      disabled={phoneVerified}
                      className="flex-1 px-4 py-3 border rounded-lg disabled:bg-gray-100"
                      placeholder="+92 300 1234567"
                    />
                    <button
                      onClick={handleSendOTP}
                      disabled={phoneVerified || loading}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                      {otpSent ? "Resend OTP" : "Send OTP"}
                    </button>
                  </div>
                  {errors.phone && <p className="text-red-600 text-sm">{errors.phone}</p>}

                  {otpSent && !phoneVerified && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => {
                          setOtp(e.target.value);
                          if (errors.otp) setErrors({ ...errors, otp: null });
                        }}
                        className="flex-1 px-4 py-3 border rounded-lg"
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                      />
                      <button
                        onClick={handleVerifyOTP}
                        disabled={loading}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Verify
                      </button>
                    </div>
                  )}
                  {errors.otp && <p className="text-red-600 text-sm">{errors.otp}</p>}
                </div>
              </div>

              {phoneVerified && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name *</label>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-3 border rounded-xl" placeholder="Your full name" />
                    {errors.fullName && <p className="text-red-600 text-sm mt-1">{errors.fullName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email (Optional)</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border rounded-xl" placeholder="your.email@example.com" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">CNIC Number *</label>
                    <input type="text" value={cnicNumber} onChange={(e) => setCnicNumber(e.target.value)} className="w-full px-4 py-3 border rounded-xl" placeholder="12345-1234567-1" maxLength={15} />
                    {errors.cnicNumber && <p className="text-red-600 text-sm mt-1">{errors.cnicNumber}</p>}
                    <p className="text-xs text-gray-500 mt-1">Format: 12345-1234567-1</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-purple-600" />
                      Skill / Trade *
                    </label>
                    <select value={skill} onChange={(e) => setSkill(e.target.value)} className="w-full px-4 py-3 border rounded-xl">
                      <option value="">Select skill</option>
                      {SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.skill && <p className="text-red-600 text-sm mt-1">{errors.skill}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Years of Experience *</label>
                    <input type="number" min="0" value={experience} onChange={(e) => setExperience(e.target.value)} className="w-full px-4 py-3 border rounded-xl" placeholder="5" />
                    {errors.experience && <p className="text-red-600 text-sm mt-1">{errors.experience}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-purple-600" />
                      Available Days *
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {DAYS_OF_WEEK.map(day => (
                        <button key={day} type="button" onClick={() => toggleDay(day)} className={`px-4 py-2 rounded-lg border-2 font-medium ${availableDays.includes(day) ? "bg-purple-100 border-purple-600 text-purple-700" : "bg-white border-gray-300"}`}>
                          {day.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                    {errors.days && <p className="text-red-600 text-sm mt-1">{errors.days}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Working Hours *</label>
                    <input type="text" value={workingHours} onChange={(e) => setWorkingHours(e.target.value)} className="w-full px-4 py-3 border rounded-xl" placeholder="e.g., 9am - 5pm" />
                    {errors.hours && <p className="text-red-600 text-sm mt-1">{errors.hours}</p>}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 2: Document Uploads */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-2"><Upload className="h-6 w-6 text-purple-600" />Upload Documents</h2>
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-900">Document Verification Required</p>
                  <p className="text-sm text-yellow-700">Upload clear photos of your CNIC (front & back) and a selfie for verification. Max 5MB per file.</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">CNIC Front Image *</label>
                <input type="file" accept="image/jpeg,image/jpg,image/png" onChange={(e) => handleFileChange(e, "cnicFront")} className="w-full px-4 py-3 border rounded-xl" />
                {cnicFrontPreview && <img src={cnicFrontPreview} alt="CNIC Front" className="mt-3 w-full max-w-md h-48 object-cover rounded-lg border" />}
                {cnicFrontDecision && (
                  <p className="text-green-700 text-sm mt-1">
                    Accepted as CNIC-like ({(cnicFrontDecision.confidence * 100).toFixed(1)}% confidence)
                  </p>
                )}
                {errors.cnicFront && <p className="text-red-600 text-sm mt-1">{errors.cnicFront}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">CNIC Back Image *</label>
                <input type="file" accept="image/jpeg,image/jpg,image/png" onChange={(e) => handleFileChange(e, "cnicBack")} className="w-full px-4 py-3 border rounded-xl" />
                {cnicBackPreview && <img src={cnicBackPreview} alt="CNIC Back" className="mt-3 w-full max-w-md h-48 object-cover rounded-lg border" />}
                {cnicBackDecision && (
                  <p className="text-green-700 text-sm mt-1">
                    Accepted as CNIC-like ({(cnicBackDecision.confidence * 100).toFixed(1)}% confidence)
                  </p>
                )}
                {errors.cnicBack && <p className="text-red-600 text-sm mt-1">{errors.cnicBack}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Selfie Photo *</label>
                <input type="file" accept="image/jpeg,image/jpg,image/png" onChange={(e) => handleFileChange(e, "selfie")} className="w-full px-4 py-3 border rounded-xl" />
                {selfiePreview && <img src={selfiePreview} alt="Selfie" className="mt-3 w-full max-w-md h-48 object-cover rounded-lg border" />}
                {errors.selfie && <p className="text-red-600 text-sm mt-1">{errors.selfie}</p>}
              </div>
            </div>
          )}

          {/* Step 3: Service Area & Bio */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-2"><MapPin className="h-6 w-6 text-purple-600" />Service Area & Bio</h2>

              <div>
                <label className="block text-sm font-medium mb-2">Service Area *</label>
                <p className="text-sm text-gray-600 mb-4">Pin your location (must be within Pakistan)</p>
                <VendorMap isEditable={true} initialLocation={serviceArea} onLocationChange={setServiceArea} height="400px" />
                {errors.location && <p className="text-red-600 text-sm mt-2">{errors.location}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Service Radius (km)</label>
                <input type="number" min="1" max="50" value={serviceArea.radius} onChange={(e) => setServiceArea({ ...serviceArea, radius: parseInt(e.target.value) })} className="w-full px-4 py-3 border rounded-xl" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-600" />
                  Short Bio *
                </label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full px-4 py-3 border rounded-xl resize-none" rows={4} maxLength={500} placeholder="Tell customers about your skills and experience..." />
                <p className="text-xs text-gray-500 mt-1">{bio.length}/500 characters</p>
                {errors.bio && <p className="text-red-600 text-sm mt-1">{errors.bio}</p>}
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-4">Create Login Credentials</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Password *</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border rounded-xl" placeholder="Minimum 6 characters" />
                    {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Confirm Password *</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 border rounded-xl" placeholder="Re-enter password" />
                    {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-4 mt-8 pt-6 border-t">
            {step > 1 && <button onClick={() => setStep(step - 1)} className="px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold">Previous</button>}
            <button onClick={() => navigate("/register")} className="px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold">Cancel</button>
            <div className="flex-1" />
            {step < 3 ? (
              <button onClick={() => setStep(step + 1)} disabled={!phoneVerified} className="px-8 py-3 bg-purple-600 text-white rounded-xl font-semibold disabled:opacity-50">
                Next Step
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} className="px-8 py-3 bg-purple-600 text-white rounded-xl font-semibold disabled:opacity-50">
                {loading ? "Submitting..." : "Complete Registration"}
              </button>
            )}
          </div>
        </div>

        <div className="text-center text-sm text-gray-600">
          <p>Your profile will be reviewed within 24-48 hours. You'll be notified once approved.</p>
        </div>
      </div>
    </div>
  );
}
