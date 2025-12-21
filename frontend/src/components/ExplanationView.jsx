
import ReactMarkdown from 'react-markdown'
import { BookOpen, AlertTriangle, ShieldCheck, FileText, Info } from 'lucide-react'

export default function ExplanationView({ explanation, relatedLaws, loading }) {
    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center space-y-6 py-12">
                <div className="relative w-20 h-20">
                    <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full animate-ping"></div>
                    <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-xl font-medium text-white">Analyzing Document...</h3>
                    <p className="text-neutral-400 text-sm">Extracting text, checking laws, and generating explanation.</p>
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
                <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-neutral-700">
                    <div className="bg-indigo-500/20 p-2 rounded-lg">
                        <FileText className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Document Analysis</h3>
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
                        <h3 className="text-lg font-semibold text-white">Relevant Legal Context</h3>
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
