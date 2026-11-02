"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  User, Phone, Lock, ArrowRight, AlertCircle, ArrowLeft, 
  Sparkles, CheckCircle2, Eye, EyeOff, ShieldCheck, Clock, Zap
} from "lucide-react";
import { citizenLogin } from "@/lib/api";
import { useSettings } from "@/context/SettingsContext";

export default function CitizenLoginPage() {
  const router = useRouter();
  const { t, lang, loginAsCitizen } = useSettings();

  // Official Hackathon Credentials
  const HACKATHON_MOBILE = "9824929296";
  const HACKATHON_PASS = "K@vya";

  const [mobile, setMobile] = useState(HACKATHON_MOBILE);
  const [password, setPassword] = useState(HACKATHON_PASS);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // High-Security JavaScript Brute Force & Rate Limit Protection
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(0);

  // Countdown timer for lockout
  useEffect(() => {
    if (lockoutTime > 0) {
      const timer = setInterval(() => {
        setLockoutTime((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setFailedAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [lockoutTime]);

  // Strict JavaScript Validation Function
  const validateInputs = () => {
    const errors = {};
    const cleanMobile = mobile.trim();

    // 1. Mobile number validation (10 digits starting with 6, 7, 8, or 9)
    if (!cleanMobile) {
      errors.mobile = lang === "gu" ? "મોબાઈલ નંબર દાખલ કરવો ફરજિયાત છે." : "Mobile number is required.";
    } else if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      errors.mobile = lang === "gu" 
        ? "કૃપા કરીને માન્ય 10 અંકનો ભારતીય મોબાઈલ નંબર દાખલ કરો (દા.ત. 9824929296)." 
        : "Please enter a valid 10-digit Indian mobile number (e.g. 9824929296).";
    }

    // 2. Password validation & anti-injection check
    if (!password) {
      errors.password = lang === "gu" ? "પાસવર્ડ દાખલ કરવો ફરજિયાત છે." : "Password is required.";
    } else if (password.length < 4) {
      errors.password = lang === "gu" ? "પાસવર્ડ ઓછામાં ઓછા 4 અક્ષરોનો હોવો જોઈએ." : "Password must be at least 4 characters.";
    } else if (/('|"|--|;|\/\*|\*\/|<script>)/i.test(password)) {
      errors.password = lang === "gu" ? "અમાન્ય પાસવર્ડ કેરેક્ટર્સ મળી આવ્યા છે." : "Invalid characters detected.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleMobileChange = (e) => {
    // Only permit digits up to 10 chars
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setMobile(val);
    if (fieldErrors.mobile) {
      setFieldErrors((prev) => ({ ...prev, mobile: null }));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    // If currently locked out, prevent login
    if (lockoutTime > 0) {
      setError(
        lang === "gu" 
          ? `સુરક્ષા ખાતર લૉગિન બ્લોક છે. કૃપા કરીને ${lockoutTime} સેકન્ડ રાહ જુઓ.` 
          : `Login temporarily locked. Please wait ${lockoutTime} seconds.`
      );
      return;
    }

    // Run strict JS validation
    if (!validateInputs()) {
      return;
    }

    setLoading(true);

    try {
      const res = await citizenLogin(mobile.trim(), password);
      if (res.success) {
        // Reset attempts
        setFailedAttempts(0);
        loginAsCitizen(res.citizen, res.token);
        router.push("/");
      } else {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);

        if (newAttempts >= 5) {
          setLockoutTime(60);
          setError(
            lang === "gu"
              ? "🚨 ૫ થી વધુ અમાન્ય પ્રયાસોના કારણે સુરક્ષા ખાતર લૉગિન ૬૦ સેકન્ડ માટે બ્લોક કરવામાં આવ્યું છે!"
              : "🚨 Too many failed attempts. Login locked for 60 seconds for security!"
          );
        } else {
          setError(
            res.error || 
            (lang === "gu" 
              ? `લૉગિન નિષ્ફળ. સાચો નંબર અને પાસવર્ડ નાખો (બાકી પ્રયાસો: ${5 - newAttempts})` 
              : `Invalid credentials. (${5 - newAttempts} attempts remaining)`)
          );
        }
      }
    } catch (err) {
      setError("Cannot reach backend server. Please verify connection.");
    } finally {
      setLoading(false);
    }
  };

  const autofillHackathonCreds = () => {
    setMobile(HACKATHON_MOBILE);
    setPassword(HACKATHON_PASS);
    setError(null);
    setFieldErrors({});
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-7 sm:p-9 shadow-2xl relative overflow-hidden">
        
        {/* Glow Accent */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Security Badge Header */}
        <div className="flex items-center justify-center mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-800/60 text-emerald-400 text-[11px] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-Bit SSL Protected • Zero Bypass</span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-cyan-500/25">
            <User className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white">
            {lang === "gu" ? "નાગરિક સત્તાવાર લૉગિન" : "Citizen Official Login"}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {lang === "gu" ? "તમારો રજિસ્ટર્ડ મોબાઈલ નંબર દાખલ કરીને ડેશબોર્ડ ખોલો" : "Enter your registered credentials to access civic portal"}
          </p>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3.5 rounded-xl flex items-start gap-2 mb-5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="flex-1 font-medium">{error}</span>
          </div>
        )}

        {/* Lockout Banner */}
        {lockoutTime > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs p-3.5 rounded-xl flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 animate-spin-slow" />
              <span>{lang === "gu" ? "લૉગિન સુરક્ષા બ્લોક સક્રિય:" : "Security Lock Active:"}</span>
            </div>
            <span className="font-mono font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-950">
              {lockoutTime}s
            </span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Mobile Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>{lang === "gu" ? "મોબાઈલ નંબર (Mobile Number) *" : "Mobile Number *"}</span>
              <span className="text-[10px] text-slate-500 font-mono">10 Digits</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="tel"
                value={mobile}
                onChange={handleMobileChange}
                placeholder="9824929296"
                disabled={loading || lockoutTime > 0}
                required
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border text-sm text-white focus:outline-none transition font-mono ${
                  fieldErrors.mobile ? "border-red-500 ring-1 ring-red-500" : "border-slate-700 focus:border-cyan-500"
                }`}
              />
            </div>
            {fieldErrors.mobile && (
              <p className="text-[11px] text-red-400 mt-1 font-medium">{fieldErrors.mobile}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {lang === "gu" ? "પાસવર્ડ / સુરક્ષા કી (Password) *" : "Password / Security Key *"}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: null }));
                }}
                disabled={loading || lockoutTime > 0}
                placeholder="••••••••"
                required
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border text-sm text-white focus:outline-none transition ${
                  fieldErrors.password ? "border-red-500 ring-1 ring-red-500" : "border-slate-700 focus:border-cyan-500"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-[11px] text-red-400 mt-1 font-medium">{fieldErrors.password}</p>
            )}
          </div>

          {/* Quick Hackathon Demo Credentials Auto-Fill Pill */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 text-[11px] text-slate-300 flex items-center justify-between gap-2 shadow-inner">
            <div className="space-y-0.5">
              <div className="font-bold text-white flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === "gu" ? "હેકાથોન ડેમો નાગરિક એકાઉન્ટ:" : "Hackathon Demo Account:"}</span>
              </div>
              <div className="font-mono text-cyan-400 font-semibold text-xs">
                9824929296 / K@vya
              </div>
            </div>

            <button
              type="button"
              onClick={autofillHackathonCreds}
              className="px-2.5 py-1.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 font-semibold text-[11px] transition shrink-0 active:scale-95"
            >
              Auto-Fill ⚡
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || lockoutTime > 0}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 active:scale-95 transition disabled:opacity-50 cursor-pointer"
          >
            <span>
              {loading 
                ? "ચકાસણી થઈ રહી છે (Verifying)..." 
                : lockoutTime > 0
                ? `બ્લોક કરેલ છે (${lockoutTime}s)`
                : (lang === "gu" ? "નાગરિક પોર્ટલ ખોલો (Secure Login)" : "Access Citizen Dashboard")}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400">
          <Link href="/citizen/signup" className="text-cyan-400 hover:underline font-semibold">
            {lang === "gu" ? "નવું એકાઉન્ટ બનાવો (Sign Up)" : "Create New Account"}
          </Link>
          <Link href="/login" className="hover:text-white transition">
            ← {lang === "gu" ? "પોર્ટલ પસંદગી પર પાછા જાઓ" : "Back to Portal Choice"}
          </Link>
        </div>

      </div>
    </div>
  );
}
