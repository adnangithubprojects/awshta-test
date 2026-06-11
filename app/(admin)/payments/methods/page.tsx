"use client";

import { memo, useState } from "react";
import {
  Key,
  ToggleLeft,
  ToggleRight,
  Radio,
  ExternalLink,
  Settings2,
} from "lucide-react";
import Modal from "@/components/common/modal";

export const PaymentGatewaysPage = memo(function PaymentGatewaysPage() {
  const [configGateway, setConfigGateway] = useState<any | null>(null);

  const gatewaysMock = [
    {
      id: "gw_payfast",
      name: "PayFast Online Integration Network",
      mode: "Production / Live Pipeline",
      is_enabled: true,
    },
    {
      id: "gw_bsecure",
      name: "bSecure Checkout System Module",
      mode: "Sandbox Environment Sandbox API",
      is_enabled: false,
    },
    {
      id: "gw_cod",
      name: "Manual Cash On Delivery (COD) Routing",
      mode: "No Authentication API Required",
      is_enabled: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-primary tracking-tight">
          Payment API Processing Acquirers
        </h1>
        <p className="text-slate-400 text-sm">
          Configure encryption credentials, switch active environments, and map
          localized payment tunnels.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {gatewaysMock.map((gw) => (
          <div
            key={gw.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between group hover:border-slate-300 transition-all"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary">
                    <Radio size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 tracking-tight leading-tight">
                      {gw.name}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono tracking-tighter block mt-0.5">
                      Driver Instance: Core_{gw.id.toUpperCase()}
                    </span>
                  </div>
                </div>

                <button type="button" className="cursor-pointer">
                  {gw.is_enabled ? (
                    <ToggleRight
                      size={26}
                      className="text-primary"
                      fill="currentColor"
                    />
                  ) : (
                    <ToggleLeft size={26} className="text-slate-300" />
                  )}
                </button>
              </div>

              <div className="pt-1.5 flex items-center gap-4 text-[11px] font-bold text-slate-400">
                <div>
                  <span className="text-[9px] font-black block tracking-wider text-slate-400 uppercase">
                    ACQUIRER ENVIRONMENT STATUS
                  </span>
                  <span className="text-slate-700 font-semibold">
                    {gw.mode}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <span className="text-[10px] font-black font-mono text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
                {gw.is_enabled ? "ON CHECKOUT STREAM" : "INACTIVE ROUTE"}
              </span>

              <button
                type="button"
                onClick={() => setConfigGateway(gw)}
                className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 hover:border-primary/30 text-slate-500 hover:text-primary bg-white font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
              >
                <Settings2 size={13} /> <span>Modify API Keys</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic API Configuration Overlay Frame Modal */}
      <Modal
        isOpen={!!configGateway}
        onClose={() => setConfigGateway(null)}
        title={`Configure: ${configGateway?.name || ""}`}
        size="md"
      >
        {configGateway && (
          <div className="space-y-4 py-1">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                Merchant Secured Store Account ID Token
              </label>
              <input
                type="text"
                placeholder="e.g., PF_MID_990123"
                className="w-full px-4 py-2.5 font-mono bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-primary/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                Production Pipeline Private Encryption Secret Hash
              </label>
              <div className="relative flex items-center">
                <input
                  type="password"
                  value="••••••••••••••••••••••••••••••••"
                  readOnly
                  className="w-full px-4 py-2.5 font-mono bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-400 outline-none"
                />
                <Key size={14} className="absolute right-3.5 text-slate-300" />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfigGateway(null)}
                className="px-4 py-2 bg-slate-100 text-slate-400 font-bold text-xs rounded-xl"
              >
                Discard Modifications
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-primary text-white font-bold text-xs rounded-xl shadow-sm"
              >
                Deploy Secret Pairs
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
});

export default PaymentGatewaysPage;
