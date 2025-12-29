
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
            <div className="bg-neutral-800/80 border border-neutral-700 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-neutral-700">
                    <div className="flex items-center space-x-3">
                        <div className="bg-indigo-500/20 p-2 rounded-lg">
                            <FileText className="w-5 h-5 text-indigo-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">{t.analysisTitle}</h3>
                    </div>

                    {/* TTS Controls */}
                    <div className="flex items-center space-x-2">
                        {!isPlaying && !isPaused && (
                            <button
                                onClick={handlePlay}
                                className="p-2 rounded-full hover:bg-indigo-500/20 text-indigo-400 transition-colors"
                                title={t.play}
                            >
                                <Volume2 className="w-5 h-5" />
                            </button>
                        )}
                        {isPlaying && (
                            <button
                                onClick={handlePause}
                                className="p-2 rounded-full hover:bg-amber-500/20 text-amber-400 transition-colors"
                                title={t.pause}
                            >
                                <PauseCircle className="w-5 h-5" />
                            </button>
                        )}
                        {isPaused && (
                            <button
                                onClick={handlePlay}
                                className="p-2 rounded-full hover:bg-indigo-500/20 text-indigo-400 transition-colors"
                                title={t.play}
                            >
                                <Volume2 className="w-5 h-5" />
                            </button>
                        )}
                        {(isPlaying || isPaused) && (
                            <button
                                onClick={handleStop}
                                className="p-2 rounded-full hover:bg-red-500/20 text-red-400 transition-colors"
                                title={t.stop}
                            >
                                <StopCircle className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="prose prose-invert prose-indigo max-w-none text-neutral-300">
                    <ReactMarkdown
                        components={{
                            h1: ({ node, ...props }) => <h3 className="text-xl font-bold text-white mb-4" {...props} />,
                            h2: ({ node, ...props }) => <h4 className="text-lg font-bold text-white mt-6 mb-3" {...props} />,
                            h3: ({ node, ...props }) => <h5 className="text-base font-bold text-white mt-4 mb-2" {...props} />,
                            p: ({ node, ...props }) => <p className="leading-relaxed mb-4" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc pl-5 space-y-1 mb-4" {...props} />,
                            li: ({ node, ...props }) => <li className="marker:text-indigo-400" {...props} />,
                            strong: ({ node, ...props }) => <strong className="text-indigo-300 font-semibold" {...props} />,
                        }}
                    >
                        {explanation}
                    </ReactMarkdown>
                </div>
            </div>

            {/* RAG Context Card */}
            {relatedLaws && relatedLaws.length > 0 && (
                <div className="bg-neutral-800/50 border border-neutral-700 rounded-2xl p-6 backdrop-blur-sm">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="bg-amber-500/20 p-2 rounded-lg">
                            <BookOpen className="w-5 h-5 text-amber-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">{t.legalContextTitle}</h3>
                    </div>

                    <div className="space-y-3">
                        {relatedLaws.map((law, index) => (
                            <div key={index} className="flex gap-3 bg-neutral-900/50 p-3 rounded-lg border border-neutral-700/50 hover:border-neutral-600 transition-colors">
                                <Info className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-1" />
                                <p className="text-sm text-neutral-300">{law}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
