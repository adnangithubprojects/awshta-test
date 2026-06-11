"use client";

import { memo, useState } from "react";
import {
  Plus,
  Sliders,
  Layers,
  Settings,
  Trash2,
  Pencil,
  SlidersHorizontal,
} from "lucide-react";
import Modal from "@/components/common/modal";

export const AttributesAndOptionsPage = memo(
  function AttributesAndOptionsPage() {
    const [createOpen, setCreateOpen] = useState(false);
    const [activeConfigAttr, setActiveConfigAttr] = useState<any | null>(null);

    // Fallback Mock Data Array for UI visualization
    const attributesMock = [
      {
        id: "attr_1",
        name: "Size",
        code: "size",
        values: ["Small", "Medium", "Large", "XL"],
        configuration_type: "Button Select",
      },
      {
        id: "attr_2",
        name: "Color",
        code: "color",
        values: ["Crimson Red", "Deep Black", "Navy Blue"],
        configuration_type: "Visual Swatch",
      },
      {
        id: "attr_3",
        name: "Material",
        code: "material",
        values: ["100% Cotton", "Polyester Blend", "Leather"],
        configuration_type: "Dropdown Select",
      },
    ];

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-black text-primary tracking-tight">
              Variant Attributes Configuration
            </h1>
            <p className="text-slate-400 text-sm">
              Create global properties to map cross-variant product option
              swatches.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-1.5 bg-primary text-white px-5 py-3 rounded-2xl font-bold text-sm hover:bg-primary/90 transition-all cursor-pointer shadow-sm"
          >
            <Plus size={16} /> <span>Create Attribute Group</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {attributesMock.map((attr) => (
            <div
              key={attr.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-slate-300 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-primary/5 text-primary border border-primary/10 flex items-center justify-center">
                    <Sliders size={14} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 tracking-tight">
                      {attr.name}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono">
                      System Key: config_{attr.code}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {attr.values.map((val, idx) => (
                    <span
                      key={idx}
                      className="bg-slate-50 text-slate-600 border border-slate-200 text-[10px] px-2.5 py-1 rounded-lg font-bold"
                    >
                      {val}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                <div className="text-left md:text-right">
                  <span className="text-[9px] text-slate-400 font-black block tracking-wider uppercase">
                    RENDER LAYOUT
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    {attr.configuration_type}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveConfigAttr(attr)}
                    className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 bg-white text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <Settings size={13} /> <span>Map Values</span>
                  </button>
                  <button
                    type="button"
                    className="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create Attribute Modal Placeholder */}
        <Modal
          isOpen={createOpen}
          onClose={() => setCreateOpen(false)}
          title="New System Variant Attribute Definition"
        >
          <div className="space-y-4 py-1">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                Attribute Display Title
              </label>
              <input
                type="text"
                placeholder="e.g., Fabric Weight, Shoe Size"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-primary/30"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                Selection Controls Layout Type
              </label>
              <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 outline-none focus:border-primary/30">
                <option>Visual Color Swatch Frame</option>
                <option>Text Label Option Button select</option>
                <option>
                  Standard Distribution Dropdown Option Selection Tree
                </option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-400 font-bold text-xs rounded-xl"
              >
                Dismiss
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-primary text-white font-bold text-xs rounded-xl shadow-sm"
              >
                Save Rules Matrix
              </button>
            </div>
          </div>
        </Modal>
      </div>
    );
  },
);

export default AttributesAndOptionsPage;
