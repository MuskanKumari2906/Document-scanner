
import { useState } from 'react'
import { FileText, AlertCircle, Sparkles } from 'lucide-react'
import FileUpload from './components/FileUpload'
import LanguageSelector from './components/LanguageSelector'
import ExplanationView from './components/ExplanationView'
import { uploadFile, analyzeDocument } from './api'

function App() {
  const [file, setFile] = useState(null)
  const [language, setLanguage] = useState('Hindi')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile)
    setResult(null)
    setError(null)
  }

  const handleAnalyze = async () => {
    if (!file) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // 1. Upload
      const uploadResp = await uploadFile(file)
      // Robustly handle both forward and backslashes
      const serverFilename = uploadResp.path.split(/[/\\]/).pop()

      // 2. Analyze
      const analysisResp = await analyzeDocument(serverFilename, language)
      setResult(analysisResp)
    } catch (err) {
      console.error("Full Error Object:", err)
      const errorMsg = err.response?.data?.detail || err.message || "Something went wrong. Please try again."
      const finalError = typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : String(errorMsg)
      setError(finalError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 font-sans selection:bg-indigo-500 selection:text-white pb-20">
      {/* Background Gradient Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-900/20 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-indigo-600 to-cyan-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
              DocExplainer
            </span>
          </div>
          <p className="text-sm text-neutral-400 hidden sm:block font-medium">
            AI-Powered Document Analysis
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="text-center mb-12 space-y-4 animate-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-sm font-medium mb-2 border border-indigo-500/20">
            <Sparkles className="w-4 h-4" />
            <span>Powered by Gemini 2.0 Vision</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Understand Documents in <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Any Language</span>
          </h1>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Upload legal notices, bills, or official letters. Our AI extracts key details, explains complex terms, and translates everything for you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Controls */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-2xl p-6 backdrop-blur-sm hover:border-indigo-500/30 transition-all duration-300 shadow-xl">
              <h2 className="text-lg font-semibold text-white mb-4">1. Upload Document</h2>
              <FileUpload
                onFileSelect={handleFileSelect}
                selectedFile={file}
                error={null}
              />
            </div>

            <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-2xl p-6 backdrop-blur-sm hover:border-indigo-500/30 transition-all duration-300 shadow-xl">
              <h2 className="text-lg font-semibold text-white mb-4">2. Select Language</h2>
              <LanguageSelector
                selectedLanguage={language}
                onLanguageChange={setLanguage}
              />

              <button
                onClick={handleAnalyze}
                disabled={!file || loading}
                className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold py-3 px-6 rounded-xl transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Analyze Document</span>
                  </>
                )}
              </button>

              {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start space-x-3 text-red-400 text-sm animate-in shake">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Results */}
          <div className="lg:col-span-7">
            {/* When no result/loading, show placeholder or loading state inside ExplanationView handles loading */}
            {!result && !loading ? (
              <div className="bg-neutral-800/30 border border-neutral-700/30 rounded-2xl p-12 text-center text-neutral-500 flex flex-col items-center justify-center min-h-[500px] border-dashed">
                <div className="w-20 h-20 bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-10 h-10 text-neutral-600" />
                </div>
                <h3 className="text-xl font-medium text-neutral-300 mb-2">Ready to Analyze</h3>
                <p className="max-w-xs mx-auto">Upload a document and select your language to get started.</p>
              </div>
            ) : (
              <ExplanationView
                explanation={result?.explanation}
                relatedLaws={result?.related_laws}
                loading={loading}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
