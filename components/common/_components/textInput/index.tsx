/* eslint-disable @typescript-eslint/no-explicit-any */
import { Label } from '@radix-ui/react-label'
import { Controller, type Control } from 'react-hook-form'
import { LucideIcon, EyeOff, Eye } from 'lucide-react'
import { useState } from 'react'

type TTextInputProps = {
  name: string
  control: any
  placeholder: string
  label?: string
  // type?: string
  className?: string
  disabled?: boolean
  icon?: LucideIcon // Added icon prop
  type?: 'text' | 'password' | 'email' | 'number'
}

const TextInput = (props: TTextInputProps) => {
  const [showPassword, setShowPassword] = useState(false)

  const Icon = props.icon

  const isPasswordField = props.type === 'password'

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev)
  }
  return (
    <Controller
      name={props.name}
      control={props.control}
      render={({ field, fieldState: { error } }) => (
        <div className="flex flex-col w-full">
          {props.label && (
            <Label className="mb-1.5 text-sm font-semibold text-slate-700">{props.label}</Label>
          )}

          <div className="relative group">
            {Icon && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                <Icon size={18} strokeWidth={2} />
              </div>
            )}

            <input
              {...field}
              // type={props.type || 'text'}
              type={isPasswordField ? (showPassword ? 'text' : 'password') : props.type || 'text'}
              placeholder={props.placeholder}
              disabled={props.disabled}
              className={`
                w-full text-primary rounded-xl border border-slate-200 bg-white py-2.5 text-sm
                transition-all duration-200 outline-none
                ${Icon ? 'pl-10' : 'px-4'} 
                pr-4
                focus:border-primary focus:ring-4 focus:ring-primary/10
                disabled:bg-slate-50 disabled:text-slate-400
                ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''}
                ${props.className}
              `}
            />
            {isPasswordField && (
              <button
                type="button"
                onClick={togglePasswordVisibility}
                disabled={props.disabled}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-primary transition-colors disabled:opacity-50"
              >
                {showPassword ? (
                  <EyeOff size={18} strokeWidth={2} />
                ) : (
                  <Eye size={18} strokeWidth={2} />
                )}
              </button>
            )}
          </div>

          {error && <span className="mt-1 text-xs font-medium text-red-500">{error?.message}</span>}
        </div>
      )}
    />
  )
}

export default TextInput
