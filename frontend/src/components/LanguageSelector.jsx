
import { Globe } from 'lucide-react'

export const LANGUAGES = [
    "Hindi", "English", "Tamil", "Telugu", "Kannada", "Malayalam",
    "Marathi", "Gujarati", "Bengali", "Punjabi", "Spanish", "French"
]

export default function LanguageSelector({ selectedLanguage, onLanguageChange, label }) {
    return (
        <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-neutral-400 flex items-center space-x-2">
                <Globe className="w-4 h-4" />
                <span>{label || "Explain in"}</span>
            </label>
            <div className="relative">
                <select
                    value={selectedLanguage}
                    onChange={(e) => onLanguageChange(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-neutral-200 rounded-xl px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all hover:bg-white/10 cursor-pointer"
                >
                    {LANGUAGES.map((lang) => (
                        <option key={lang} value={lang} className="bg-neutral-900 text-neutral-200">
                            {lang}
                        </option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        </div>
    )
}
