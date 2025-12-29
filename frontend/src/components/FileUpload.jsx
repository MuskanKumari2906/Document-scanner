
import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, CheckCircle, XCircle } from 'lucide-react'

export default function FileUpload({ onFileSelect, selectedFile, error }) {
    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles?.length > 0) {
            onFileSelect(acceptedFiles[0])
        }
    }, [onFileSelect])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'image/*': ['.png', '.jpg', '.jpeg', '.webp']
        },
        maxFiles: 1,
        multiple: false
    })

    return (
        <div className="w-full">
            <div
                {...getRootProps()}
                className={`relative h-64 border-2 border-dashed rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center p-6 group
          ${isDragActive ? 'border-indigo-400 bg-indigo-500/10' : 'border-white/10 hover:border-indigo-400 hover:bg-white/5'}
          ${selectedFile ? 'border-emerald-500/50 bg-emerald-500/5' : ''}
          ${error ? 'border-red-500/50 bg-red-500/5' : ''}
        `}
            >
                <input {...getInputProps()} />

                {selectedFile ? (
                    <div className="text-center space-y-3 animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto ring-1 ring-emerald-500/30">
                            <CheckCircle className="w-8 h-8 text-emerald-400" />
                        </div>
                        <div>
                            <p className="font-medium text-emerald-400 truncate max-w-[200px] mx-auto">
                                {selectedFile.name}
                            </p>
                            <p className="text-sm text-neutral-400 mt-1">
                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onFileSelect(null)
                            }}
                            className="text-xs text-neutral-400 hover:text-red-400 transition-colors py-1 px-2 hover:bg-red-500/10 rounded"
                        >
                            Remove file
                        </button>
                    </div>
                ) : (
                    <div className="text-center space-y-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto transition-transform duration-300 group-hover:scale-110 
              ${isDragActive ? 'bg-indigo-500/20' : 'bg-white/5 ring-1 ring-white/10'}`}>
                            <Upload className={`w-8 h-8 ${isDragActive ? 'text-indigo-400' : 'text-neutral-400 group-hover:text-indigo-300'}`} />
                        </div>
                        <div>
                            <p className="text-lg font-medium text-neutral-200">
                                {isDragActive ? 'Drop it here!' : 'Drop your document here'}
                            </p>
                            <p className="text-sm text-neutral-500 mt-1">
                                PDF, JPG, PNG up to 10MB
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div className="mt-3 flex items-center space-x-2 text-red-400 text-sm animate-in slide-in-from-top-1">
                    <XCircle className="w-4 h-4" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    )
}
