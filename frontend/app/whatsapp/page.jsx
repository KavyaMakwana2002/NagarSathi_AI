"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSettings } from "../../context/SettingsContext";
import {
  Send,
  Paperclip,
  Mic,
  Camera,
  MapPin,
  CheckCheck,
  Phone,
  Video,
  MoreVertical,
  ArrowLeft,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Smile
} from "lucide-react";

export default function WhatsAppBotPage() {
  const { t, lang } = useSettings();
  const [messages, setMessages] = useState([
    {
      id: "intro-1",
      sender: "bot",
      text:
        lang === "gu"
          ? "🙏 *નમસ્તે! હું NagarSathi AI Civic Bot છું.*\n\nહું સમગ્ર ગુજરાત અને અમદાવાદ મ્યુનિસિપલ કોર્પોરેશન સાથે જોડાયેલ AI સહાયક છું.\n\nતમે તમારા વિસ્તારના રસ્તાના ખાડા, કચરો, પાણીની પાઇપ લીક કે બંધ સ્ટ્રીટ લાઈટની ફરિયાદ અહીં સીધા મોકલી શકો છો. હું આપમેળે ટિકિટ બનાવીને વોર્ડ ઇજનેરને મોકલી આપીશ!"
          : "🙏 *Hello! I am NagarSathi AI Civic Bot.*\n\nI am the official AI Civic Assistant connected to Gujarat Municipal Corporations.\n\nReport road potholes, overflowing garbage, water pipe leakage, or street lights right here over WhatsApp! I will automatically generate an official ticket and dispatch it to ward engineers.",
      time: "09:41 AM",
    },
    {
      id: "intro-2",
      sender: "bot",
      text:
        lang === "gu"
          ? "👉 *શરૂ કરવા નીચે આપેલા કોઈપણ વિકલ્પ પર ક્લિક કરો અથવા તમારી સમસ્યા અહીં લખો:*"
          : "👉 *Click any quick option below or type your problem with area name:*",
      time: "09:41 AM",
    },
  ]);

  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [attachedPhoto, setAttachedPhoto] = useState(null);
  const [attachedPhotoName, setAttachedPhotoName] = useState(null);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  const QUICK_PROMPTS = [
    { labelGu: "🛣️ રોડ પર મોટો ખાડો છે", labelEn: "🛣️ Deep pothole on road", text: "નવરંગપુરા મેઈન રોડ પર ૨ ફૂટ ઊંડો ખાડો છે, વાહનો સ્લિપ થાય છે.", photo: "pothole_before.jpg" },
    { labelGu: "🗑️ કચરાપેટી ઉભરાઈ ગઈ છે", labelEn: "🗑️ Garbage overflowing", text: "સેટેલાઇટ જોધપુર ચાર રસ્તા પાસે જાહેર કચરાપેટી ઉભરાઈ ગઈ છે.", photo: "garbage_before.jpg" },
    { labelGu: "💡 શેરીની લાઈટ બંધ છે", labelEn: "💡 Street light off", text: "મણિનગર કાંકરિયા ગેટ પાસે 3 સ્ટ્રીટ લાઈટ બંધ છે, રાત્રે અંધારું રહે છે." },
    { labelGu: "🚰 પીવાના પાણીની પાઈપ લીક છે", labelEn: "🚰 Water pipe leak", text: "વસ્ત્રાપુર તળાવ રોડ પર પીવાની મેઈન પાઇપલાઇન લીક થતાં પાણી વહી રહ્યું છે." },
    { labelGu: "📍 મારું લોકેશન શેર કરો", labelEn: "📍 Share My Location", text: "મારું વર્તમાન લોકેશન: નવરંગપુરા વોર્ડ 7, અમદાવાદ." }
  ];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (customText, customPhoto) => {
    const textToSend = customText || inputText;
    const photoToSend = customPhoto || attachedPhotoName;

    if (!textToSend.trim() && !photoToSend) return;

    const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Append Citizen Message
    const userMsg = {
      id: "user-" + Date.now(),
      sender: "user",
      text: textToSend,
      photo: attachedPhoto,
      time: currentTime,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setAttachedPhoto(null);
    setAttachedPhotoName(null);
    setIsTyping(true);

    try {
      const res = await fetch("http://localhost:5000/api/whatsapp/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: "9876543210",
          sender_name: "Ramesh Patel",
          text: textToSend,
          photo: photoToSend,
          area: "Navrangpura (Ward 7)"
        }),
      });

      const data = await res.json();
      const botTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: "bot-" + Date.now(),
            sender: "bot",
            text: data.bot_reply,
            ticketId: data.complaint_id,
            time: botTime,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: "bot-" + Date.now(),
            sender: "bot",
            text: data.bot_reply || "ક્ષમા કરશો, ફરી પ્રયત્ન કરો.",
            time: botTime,
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: "bot-" + Date.now(),
          sender: "bot",
          text: "⚠️ કનેક્શન સમસ્યા આવી છે. કૃપા કરીને બેકએન્ડ ચાલુ છે કે નહીં તે ચકાસો.",
          time: currentTime,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedPhoto(URL.createObjectURL(file));
      setAttachedPhotoName("pothole_before.jpg");
    }
  };

  return (
    <div className="max-w-5xl w-full mx-auto px-2 sm:px-4 py-4 sm:py-6 flex flex-col">
      {/* Social Impact Top Banner */}
        <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl font-bold">
              💬
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-extrabold text-base sm:text-lg">
                  WhatsApp AI Civic Bot (વોટ્સએપ દ્વારા ફરિયાદ)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-white/25 text-[10px] font-bold tracking-wide uppercase">
                  Social Impact
                </span>
              </div>
              <p className="text-xs text-white/90 mt-0.5">
                {t?.whatsapp?.subtitle || "Report municipal issues directly over WhatsApp without downloading any new apps."}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href="https://wa.me/919876543210?text=Hello%20NagarSathi%20AI"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-white text-emerald-800 hover:bg-slate-100 font-bold text-xs shadow-md transition flex items-center space-x-1.5 whitespace-nowrap"
            >
              <span>{t?.whatsapp?.openInApp || "Open in Real WhatsApp"}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* WhatsApp App Window */}
        <div className="flex-1 rounded-3xl overflow-hidden border border-slate-300 dark:border-slate-800 shadow-2xl bg-[#efeae2] dark:bg-[#0b141a] flex flex-col">
          
          {/* WhatsApp Header */}
          <div className="bg-[#075e54] dark:bg-[#202c33] text-white px-4 py-3 flex items-center justify-between shadow-md z-10">
            <div className="flex items-center space-x-3">
              <Link href="/" className="text-white/80 hover:text-white transition">
                <ArrowLeft className="w-5 h-5" />
              </Link>

              {/* Bot Avatar */}
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white text-emerald-800 font-black flex items-center justify-center text-base shadow-md">
                  NS
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#075e54] dark:border-[#202c33]"></span>
              </div>

              {/* Bot Title & Verified Badge */}
              <div>
                <div className="flex items-center space-x-1">
                  <h3 className="font-bold text-sm sm:text-base leading-tight">
                    NagarSathi AI • Civic Bot
                  </h3>
                  <span className="w-4 h-4 rounded-full bg-emerald-400 text-slate-900 text-[10px] font-black flex items-center justify-center" title="Official Verified Assistant">
                    ✓
                  </span>
                </div>
                <p className="text-[11px] text-white/80 font-medium">
                  {t?.whatsapp?.onlineStatus || "ઓનલાઇન • ત્વરિત સહાયક (Instant AI)"}
                </p>
              </div>
            </div>

            {/* Top Right Call & Menu Icons */}
            <div className="flex items-center space-x-3 text-white/80">
              <span className="hidden sm:inline-block text-xs font-mono px-2 py-0.5 rounded-full bg-white/10 text-emerald-200">
                Ahmedabad Ward 7 Bot
              </span>
              <MoreVertical className="w-5 h-5 cursor-pointer hover:text-white" />
            </div>
          </div>

          {/* Chat Messages Body */}
          <div
            className="flex-1 p-4 overflow-y-auto space-y-3"
            style={{
              backgroundImage:
                "radial-gradient(rgba(0,0,0,0.03) 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          >
            {/* Timestamp Pill */}
            <div className="flex justify-center my-2">
              <span className="px-3 py-1 rounded-lg bg-white/70 dark:bg-slate-800/80 text-[11px] font-semibold text-slate-600 dark:text-slate-400 shadow-sm backdrop-blur-sm">
                TODAY • 24/7 LIVE AI SERVICE
              </span>
            </div>

            {/* Messages */}
            {messages.map((m) => {
              const isUser = m.sender === "user";

              return (
                <div
                  key={m.id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"} animate-in fade-in duration-200`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-md rounded-2xl p-3 shadow-md text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? "bg-[#d9fdd3] dark:bg-[#005c4b] text-slate-900 dark:text-white rounded-tr-none"
                        : "bg-white dark:bg-[#202c33] text-slate-900 dark:text-white rounded-tl-none border border-slate-200/50 dark:border-slate-700/50"
                    }`}
                  >
                    {/* Attached Photo Preview if any */}
                    {m.photo && (
                      <div className="mb-2 rounded-xl overflow-hidden max-h-48 border border-black/10">
                        <img src={m.photo} alt="Issue photo" className="w-full h-full object-cover" />
                      </div>
                    )}

                    {/* Formatted Text Message */}
                    <div className="whitespace-pre-line font-normal">
                      {m.text}
                    </div>

                    {/* Tracking Button if ticket created */}
                    {m.ticketId && (
                      <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                          Official Ticket Generated
                        </span>
                        <Link
                          href={`/track/${m.ticketId}`}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center space-x-1"
                        >
                          <span>{t?.whatsapp?.viewTicketBtn || "Live Status"}</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    )}

                    {/* Timestamp & Double Blue Tick */}
                    <div className="flex items-center justify-end space-x-1 mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                      <span>{m.time}</span>
                      {isUser && <CheckCheck className="w-3.5 h-3.5 text-blue-500" />}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-[#202c33] rounded-2xl rounded-tl-none p-3 shadow-md border border-slate-200/50 dark:border-slate-700/50 flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]"></div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium ml-1">
                    NagarSathi AI is analyzing complaint...
                  </span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="bg-[#f0f2f5] dark:bg-[#111b21] px-3 py-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {QUICK_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p.text, p.photo)}
                className="px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap bg-white dark:bg-[#202c33] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition shadow-sm shrink-0"
              >
                {lang === "gu" ? p.labelGu : p.labelEn}
              </button>
            ))}
          </div>

          {/* Attached Image Preview bar before sending */}
          {attachedPhoto && (
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 border-t border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
              <div className="flex items-center space-x-2">
                <img src={attachedPhoto} alt="Preview" className="w-10 h-10 rounded-lg object-cover" />
                <span>ફોટો જોડાયેલ છે (Photo attached with report)</span>
              </div>
              <button
                onClick={() => {
                  setAttachedPhoto(null);
                  setAttachedPhotoName(null);
                }}
                className="text-red-500 font-bold px-2 py-1"
              >
                ✕ રદ કરો
              </button>
            </div>
          )}

          {/* Message Input Bar */}
          <div className="bg-[#f0f2f5] dark:bg-[#202c33] p-3 flex items-center space-x-2 border-t border-slate-300 dark:border-slate-800">
            {/* Photo Attachment Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handlePhotoSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition"
              title="Attach Photo"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
              placeholder={t?.whatsapp?.inputPlaceholder || "તમારી સમસ્યા અહીં લખો (દા.ત. ખાડો, કચરો, લાઈટ...)"}
              className="flex-1 py-2 px-4 rounded-xl bg-white dark:bg-[#2a3942] text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 border border-slate-200 dark:border-transparent"
            />

            {/* Mic Button (Voice simulation) */}
            <button
              onClick={() => {
                handleSendMessage("નવરંગપુરા વોર્ડ 7 માં ગટરનું ઢાંકણ તૂટી ગયું છે, તાત્કાલિક રીપેર કરો.");
              }}
              className="p-2 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition"
              title="Voice Message (Simulation)"
            >
              <Mic className="w-5 h-5" />
            </button>

            {/* Send Button */}
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() && !attachedPhoto}
              className="p-2.5 rounded-full bg-[#00a884] hover:bg-[#008f6f] text-white disabled:opacity-40 transition shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
    </div>
  );
}
