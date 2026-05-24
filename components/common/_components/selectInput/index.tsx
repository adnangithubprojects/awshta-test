import { Label } from "@radix-ui/react-label";
import { Controller } from "react-hook-form";
import { LucideIcon, ChevronDown, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export type TOption = {
  id: string | number;
  name: string;
};

type TSelectInputProps = {
  name: string;
  control: any;
  options: TOption[];
  placeholder?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
  icon?: LucideIcon;
  isMulti?: boolean; // Flag switcher for single vs multi-select behaviors
};

const SelectInput = (props: TSelectInputProps) => {
  const { options, isMulti = false, placeholder = "Select Option..." } = props;
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const Icon = props.icon;

  // Close multi-select menu when clicking outside of the active container scope
  useEffect(() => {
    if (!isMulti) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMulti]);

  return (
    <Controller
      name={props.name}
      control={props.control}
      render={({ field: { onChange, value, ref }, fieldState: { error } }) => {
        // Ensure values match expected arrays or strings safely based on type flags
        const currentValues: any[] = Array.isArray(value)
          ? value
          : value
            ? [value]
            : [];

        const handleToggleOption = (optionId: string | number) => {
          if (isMulti) {
            if (currentValues.includes(optionId)) {
              onChange(currentValues.filter((v) => v !== optionId));
            } else {
              onChange([...currentValues, optionId]);
            }
          } else {
            onChange(optionId);
            setIsOpen(false);
          }
        };

        const handleRemoveMultiItem = (
          e: React.MouseEvent,
          optionId: string | number,
        ) => {
          e.stopPropagation();
          onChange(currentValues.filter((v) => v !== optionId));
        };

        return (
          <div className="flex flex-col w-full" ref={containerRef}>
            {props.label && (
              <Label className="mb-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                {Icon && <Icon size={13} />} {props.label}
              </Label>
            )}

            <div className="relative group">
              {/* Native Select Layout Engine for Single-Select workflow optimization */}
              {!isMulti ? (
                <div className="relative flex items-center">
                  {Icon && (
                    <div className="absolute left-3 text-slate-400 group-focus-within:text-primary transition-colors z-10 pointer-events-none">
                      <Icon size={18} strokeWidth={2} />
                    </div>
                  )}

                  <select
                    ref={ref}
                    value={value || ""}
                    disabled={props.disabled}
                    onChange={(e) => onChange(e.target.value)}
                    className={`
                      w-full text-primary rounded-xl border border-slate-200 bg-white py-2.5 text-sm
                      transition-all duration-200 outline-none appearance-none cursor-pointer
                      ${Icon ? "pl-10" : "px-4"} 
                      pr-10
                      focus:border-primary focus:ring-4 focus:ring-primary/10
                      disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
                      ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : ""}
                      ${props.className}
                    `}
                  >
                    <option value="" disabled hidden>
                      {placeholder}
                    </option>
                    <option value="">{placeholder}</option>
                    {options?.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name}
                      </option>
                    ))}
                  </select>

                  <div className="absolute right-3 pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                    <ChevronDown size={18} strokeWidth={2} />
                  </div>
                </div>
              ) : (
                /* Dynamic Custom Tag Engine Interface for Multi-Select Workflow */
                <div className="relative">
                  <div
                    onClick={() => !props.disabled && setIsOpen(!isOpen)}
                    className={`
                      w-full min-h-[42px] flex flex-wrap items-center gap-1.5 text-primary rounded-xl border border-slate-200 bg-white py-2 text-sm
                      transition-all duration-200 outline-none cursor-pointer pr-10
                      ${Icon ? "pl-10" : "px-4"} 
                      ${isOpen ? "border-primary ring-4 ring-primary/10" : ""}
                      {props.disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : ''}
                      ${error ? "border-red-500 ring-red-500/10" : ""}
                      ${props.className}
                    `}
                  >
                    {Icon && (
                      <div className="absolute left-3 top-3.5 text-slate-400 transition-colors pointer-events-none">
                        <Icon size={18} strokeWidth={2} />
                      </div>
                    )}

                    {currentValues.length === 0 ? (
                      <span className="text-slate-400">{placeholder}</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {currentValues.map((val) => {
                          const option = options.find((o) => o.id === val);
                          if (!option) return null;
                          return (
                            <span
                              key={option.id}
                              className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 text-xs font-semibold px-2 py-1 rounded-md transition-all hover:bg-slate-200"
                            >
                              {option.name}
                              <button
                                type="button"
                                disabled={props.disabled}
                                onClick={(e) =>
                                  handleRemoveMultiItem(e, option.id)
                                }
                                className="hover:text-red-500 rounded-full outline-none focus:text-red-500 transition-colors"
                              >
                                <X size={12} strokeWidth={2.5} />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}

                    <div className="absolute right-3 top-3 pointer-events-none text-slate-400 transition-colors">
                      <ChevronDown
                        size={18}
                        strokeWidth={2}
                        className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      />
                    </div>
                  </div>

                  {/* Dropdown Options Overlay Portal Container */}
                  {isOpen && (
                    <div className="absolute left-0 mt-1.5 w-full max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg z-50 p-1.5 animate-in fade-in-50 duration-200">
                      {options.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-slate-400 text-center">
                          No options available
                        </div>
                      ) : (
                        options.map((opt) => {
                          const isSelected = currentValues.includes(opt.id);
                          return (
                            <div
                              key={opt.id}
                              onClick={() => handleToggleOption(opt.id)}
                              className={`
                                px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors font-medium flex items-center justify-between
                                ${isSelected ? "bg-primary/10 text-primary font-semibold" : "text-slate-700 hover:bg-slate-50"}
                              `}
                            >
                              <span>{opt.name}</span>
                              {isSelected && (
                                <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {error && (
              <span className="mt-1 text-xs font-medium text-red-500">
                {error?.message}
              </span>
            )}
          </div>
        );
      }}
    />
  );
};

export default SelectInput;
