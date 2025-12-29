
import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { BookOpen, AlertTriangle, ShieldCheck, FileText, Info, Volume2, PauseCircle, StopCircle } from 'lucide-react'
import { translations } from '../utils/translations'
import { getLanguageCode, getVoiceForLanguage } from '../utils/ttsUtils'

export default function ExplanationView({ explanation, relatedLaws, loading, language }) {
    const t = translations[language] || translations['English']
    const [isPlaying, setIsPlaying] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const synthRef = useRef(window.speechSynthesis)
    const utteranceRef = useRef(null)

    // Reset TTS when explanation changes
    useEffect(() => {
        cancelSpeech()
    }, [explanation, language])

    const cancelSpeech = () => {
        if (synthRef.current) {
            synthRef.current.cancel()
        }
        setIsPlaying(false)
        setIsPaused(false)
    }

    const handlePlay = () => {
        const synth = synthRef.current

        if (isPaused) {
            synth.resume()
            setIsPlaying(true)
            setIsPaused(false)
            return
        }

        if (synth.speaking) {
            cancelSpeech()
        }

        // Strip markdown symbols for cleaner speech
        const cleanText = explanation.replace(/[#*`_]/g, '')

        const utterance = new SpeechSynthesisUtterance(cleanText)
        utterance.lang = getLanguageCode(language)

        const voice = getVoiceForLanguage(utterance.lang)
        if (voice) {
            utterance.voice = voice
        }

        utterance.onend = () => {
            setIsPlaying(false)
            setIsPaused(false)
        }

        utterance.onerror = () => {
            setIsPlaying(false)
            setIsPaused(false)
        }

        utteranceRef.current = utterance
        synth.speak(utterance)
        setIsPlaying(true)
    }

    const handlePause = () => {
        const synth = synthRef.current
        if (synth.speaking && !synth.paused) {
            synth.pause()
            setIsPaused(true)
            setIsPlaying(false)
        }
    }

    const handleStop = () => {
        cancelSpeech()
    }

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center space-y-6 py-12">
                <div className="relative w-20 h-20">
                    <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full animate-ping"></div>
                    <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-xl font-medium text-white">{t.analyzingTitle}</h3>
                    <p className="text-neutral-400 text-sm">{t.analyzingDesc}</p>
                </div>
            </div>
        )
    }

    if (!explanation) {
        return null
    }

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            {/* AI Explanation Card */}
            <div className="glass-card rounded-3xl p-8 shadow-2xl animate-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10">
                    <div className="flex items-center space-x-4">
                        <div className="bg-indigo-500/20 p-2.5 rounded-xl ring-1 ring-indigo-500/30">
                            <FileText className="w-6 h-6 text-indigo-300" />
                        </div>
                        <h3 className="text-xl font-semibold text-white tracking-tight">{t.analysisTitle}</h3>
                    </div>

                    {/* TTS Controls */}
                    <div className="flex items-center space-x-2 bg-white/5 rounded-full p-1 border border-white/10">
                        {!isPlaying && !isPaused && (
                            <button
                                onClick={handlePlay}
                                className="p-2 rounded-full hover:bg-indigo-500/20 text-indigo-300 transition-colors"
                                title={t.play}
                            >
                                <Volume2 className="w-5 h-5" />
                            </button>
                        )}
                        {isPlaying && (
                            <button
                                onClick={handlePause}
                                className="p-2 rounded-full hover:bg-amber-500/20 text-amber-300 transition-colors"
                                title={t.pause}
                            >
                                <PauseCircle className="w-5 h-5" />
                            </button>
                        )}
                        {isPaused && (
                            <button
                                onClick={handlePlay}
                                className="p-2 rounded-full hover:bg-indigo-500/20 text-indigo-300 transition-colors"
                                title={t.play}
                            >
                                <Volume2 className="w-5 h-5" />
                            </button>
                        )}
                        {(isPlaying || isPaused) && (
                            <button
                                onClick={handleStop}
                                className="p-2 rounded-full hover:bg-red-500/20 text-red-300 transition-colors"
                                title={t.stop}
                            >
                                <StopCircle className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="prose prose-invert prose-indigo max-w-none text-neutral-300 leading-relaxed">
                    <ReactMarkdown
                        components={{
                            h1: ({ node, ...props }) => <h3 className="text-2xl font-bold text-white mb-6 font-outfit" {...props} />,
                            h2: ({ node, ...props }) => <h4 className="text-xl font-bold text-white mt-8 mb-4 font-outfit" {...props} />,
                            h3: ({ node, ...props }) => <h5 className="text-lg font-bold text-white mt-6 mb-3 font-outfit" {...props} />,
                            p: ({ node, ...props }) => <p className="leading-7 mb-4 text-neutral-300" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc pl-5 space-y-2 mb-6 text-neutral-300" {...props} />,
                            li: ({ node, ...props }) => <li className="marker:text-indigo-400 pl-1" {...props} />,
                            strong: ({ node, ...props }) => <strong className="text-indigo-200 font-semibold" {...props} />,
                            blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-indigo-500/50 pl-4 py-1 italic text-neutral-400 bg-white/5 rounded-r-lg my-4" {...props} />,
                        }}
                    >
                        {explanation}
                    </ReactMarkdown>
                </div>
            </div>

            {/* RAG Context Card */}
            {relatedLaws && relatedLaws.length > 0 && (
                <div className="glass-card rounded-3xl p-6 shadow-xl">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="bg-amber-500/20 p-2 rounded-lg ring-1 ring-amber-500/30">
                            <BookOpen className="w-5 h-5 text-amber-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">{t.legalContextTitle}</h3>
                    </div>

                    <div className="space-y-3">
                        {relatedLaws.map((law, index) => (
                            <div key={index} className="flex gap-3 bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/20 transition-colors">
                                <Info className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-neutral-300 leading-relaxed">{law}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
