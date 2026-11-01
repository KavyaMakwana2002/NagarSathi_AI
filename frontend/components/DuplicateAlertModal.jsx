"use client";

import { AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

export default function DuplicateAlertModal({ isOpen, duplicateInfo, onClose, onViewParent }) {
  if (!isOpen || !duplicateInfo?.is_duplicate) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
        <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400 mb-4 mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-bold text-center text-white mb-2">
          સ્માર્ટ ડુપ્લિકેટ ઓળખાયું! ⚡
        </h3>

        <p className="text-sm text-slate-300 text-center leading-relaxed mb-5">
          તમારા વિસ્તારમાં આ જ સમસ્યાની ફરિયાદ અગાઉથી નોંધાયેલ છે (ટિકિટ:{" "}
          <span className="font-mono font-bold text-cyan-400">
            #{duplicateInfo.parent_id}
          </span>
          ).
        </p>

        <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/60 mb-6 text-xs text-slate-300 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>મ્યુનિસિપલ કંટ્રોલ રૂમમાં અગ્રતા વધારી દેવામાં આવી છે</span>
          </div>
          <p className="text-slate-400 pl-6">
            નવી ટિકિટ બનાવીને લાઇન લાંબી કરવાને બદલે સિસ્ટમે આપોઆપ જૂની ફરિયાદને High Priority આપી દીધી છે.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition active:scale-95"
        >
          સમજાઈ ગયું, આભાર! 👍
        </button>
      </div>
    </div>
  );
}
