
import { useState } from 'react'
import { FileText, AlertCircle, Sparkles, Camera } from 'lucide-react'
import FileUpload from './components/FileUpload'
import Scanner from './components/Scanner'
import LanguageSelector from './components/LanguageSelector'
import HeaderLanguageSelector from './components/HeaderLanguageSelector'
import ExplanationView from './components/ExplanationView'
import { uploadFile, analyzeDocument } from './api'
import { translations } from './utils/translations'

function App() {
  const [file, setFile] = useState(null)
  const [showScanner, setShowScanner] = useState(false)
  const [language, setLanguage] = useState('Hindi') // Explanation Language
  const [uiLanguage, setUiLanguage] = useState('English') // UI Language
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile)
    setResult(null)
    setError(null)
  }

  const t = translations[uiLanguage] || translations['English']

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
      const errorMsg = err.response?.data?.detail || err.message || t.errorGeneric
      const finalError = typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : String(errorMsg)
      setError(finalError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-100 font-sans selection:bg-indigo-500 selection:text-white pb-20 overflow-hidden relative">

      {showScanner && (
        <Scanner
          onScan={(scannedFile) => {
            handleFileSelect(scannedFile)
            setShowScanner(false)
          }}
          onCancel={() => setShowScanner(false)}
        />
      )}

      {/* Animated Background Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/30 rounded-full mix-blend-screen filter blur-[100px] opacity-50 animate-blob" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-600/30 rounded-full mix-blend-screen filter blur-[100px] opacity-50 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-purple-600/30 rounded-full mix-blend-screen filter blur-[100px] opacity-50 animate-blob animation-delay-4000" />
      </div>

      {/* Header */}
      <header className="border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 z-50 supports-[backdrop-filter]:bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-indigo-500 to-cyan-500 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20 ring-1 ring-white/10">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 via-white to-cyan-200 tracking-tight">
                {t.appTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <HeaderLanguageSelector
              selectedLanguage={uiLanguage}
              onLanguageChange={setUiLanguage}
            />
            <p className="text-sm text-neutral-400 hidden sm:block font-medium border-l border-white/10 pl-6">
              {t.subtitle}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="text-center mb-16 space-y-6 animate-in slide-in-from-top-4 duration-700 fade-in">
          <div className="inline-flex items-center space-x-2 bg-white/5 text-indigo-300 px-4 py-1.5 rounded-full text-sm font-medium border border-white/10 backdrop-blur-md shadow-xl">
            <Sparkles className="w-4 h-4" />
            <span className="tracking-wide text-xs uppercase">{t.poweredBy}</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-sm">
            {t.heroTitle} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">{t.heroTitleHighlight}</span>
          </h1>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed font-light">
            {t.heroDescription}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Controls */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-card rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-cyan-500/5 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-white tracking-tight">{t.step1}</h2>
                  <button
                    onClick={() => setShowScanner(true)}
                    className="flex items-center space-x-2 text-sm bg-indigo-500/20 text-indigo-200 px-4 py-2 rounded-lg hover:bg-indigo-500/30 transition-all border border-indigo-500/20"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{t.scanButton}</span>
                  </button>
                </div>

                <FileUpload
                  onFileSelect={handleFileSelect}
                  selectedFile={file}
                  error={null}
                />
              </div>
            </div>

            <div className="glass-card rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 shadow-2xl relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-cyan-500/5" />
               <div className="relative z-10">
                <h2 className="text-xl font-semibold text-white mb-6 tracking-tight">{t.step2}</h2>
                <LanguageSelector
                  selectedLanguage={language}
                  onLanguageChange={setLanguage}
                  label={t.explainIn}
                />

                <button
                  onClick={handleAnalyze}
                  disabled={!file || loading}
                  className="w-full mt-8 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold py-4 px-6 rounded-2xl transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25 flex items-center justify-center space-x-3 group"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{t.processing}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span className="text-lg">{t.analyzeButton}</span>
                    </>
                  )}
                </button>

                {error && (
                  <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start space-x-3 text-red-200 text-sm animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Results */}
          <div className="lg:col-span-7">
            {/* When no result/loading, show placeholder or loading state inside ExplanationView handles loading */}
            {!result && !loading ? (
              <div className="glass-card rounded-3xl p-12 text-center text-neutral-500 flex flex-col items-center justify-center min-h-[600px] border-dashed border-2 border-white/5 bg-white/[0.02]">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 ring-1 ring-white/10">
                  <FileText className="w-10 h-10 text-neutral-600" />
                </div>
                <h3 className="text-2xl font-medium text-neutral-300 mb-3 font-outfit">Ready to Analyze</h3>
                <p className="max-w-xs mx-auto text-neutral-500">Upload a document and select your language to get started with AI-powered insights.</p>
              </div>
            ) : (
              <ExplanationView
                explanation={result?.explanation}
                relatedLaws={result?.related_laws}
                loading={loading}
                language={language}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
