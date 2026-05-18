import { Camera, X } from 'lucide-react'
import { useState, useRef } from 'react'

// Note: value and onChange come from the Controller in RegisterCompany
export default function ImageFile({ value, onChange }) {
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // 1. Update React Hook Form state
      onChange(file)

      // 2. Create local preview for UI
      const reader = new FileReader()
      reader.onloadend = () => {
        setLocalPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setLocalPreview(null)
    onChange(null) // Clear form state
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative group">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/*"
          className="hidden"
        />

        <div
          onClick={() => fileInputRef.current?.click()}
          className={`w-28 h-28 rounded-full border-2 border-dashed transition-all duration-300 flex items-center justify-center overflow-hidden cursor-pointer
            ${localPreview ? 'border-primary bg-white' : 'border-slate-200 bg-slate-50 hover:border-primary'}`}
        >
          {localPreview ? (
            <img src={localPreview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <Camera className="text-slate-400 group-hover:text-primary" size={32} />
          )}
        </div>

        {localPreview && (
          <button
            type="button"
            onClick={removeImage}
            className="absolute -bottom-1 -right-1 bg-red-500 p-1.5 rounded-full text-white shadow-lg hover:bg-red-600 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
