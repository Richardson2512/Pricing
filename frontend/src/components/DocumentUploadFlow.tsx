import React, { useState } from 'react';
import { 
  Upload, 
  File, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Loader, 
  FileText,
  ArrowLeft 
} from 'lucide-react';

interface UploadedFile {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'parsing' | 'completed' | 'error';
  error?: string;
  parsedData?: any;
}

interface DocumentUploadFlowProps {
  onBack: () => void;
  onSubmit: (files: File[]) => Promise<void>;
  loading: boolean;
}

export function DocumentUploadFlow({ onBack, onSubmit, loading }: DocumentUploadFlowProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      const validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/plain',
        'text/csv'
      ];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!validTypes.includes(file.type)) {
        alert(`${file.name} is not a supported file type`);
        return false;
      }
      if (file.size > maxSize) {
        alert(`${file.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    });

    const newFiles: UploadedFile[] = validFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending'
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleSubmit = async () => {
    if (uploadedFiles.length === 0) {
      alert('Please upload at least one document');
      return;
    }

    const files = uploadedFiles.map(uf => uf.file);
    await onSubmit(files);
  };

  const getFileIcon = (file: File) => {
    if (file.type.includes('pdf')) return '📄';
    if (file.type.includes('word')) return '📝';
    if (file.type.includes('text')) return '📃';
    if (file.type.includes('csv')) return '📊';
    return '📁';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6 transition"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to selection
      </button>

      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">
            Upload Your Documents
          </h2>
          <p className="text-slate-600">
            Upload your business documents and our AI will automatically extract pricing information
          </p>
        </div>

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center transition ${
            dragActive
              ? 'border-olive-500 bg-olive-50'
              : 'border-beige-300 hover:border-olive-400 hover:bg-beige-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileInput}
            multiple
            accept=".pdf,.doc,.docx,.txt,.csv"
          />
          
          <Upload className="w-16 h-16 text-beige-400 mx-auto mb-4" />
          
          <h3 className="text-xl font-semibold text-slate-800 mb-2">
            Drag & drop your files here
          </h3>
          <p className="text-slate-600 mb-4">
            or click to browse from your computer
          </p>
          
          <label
            htmlFor="file-upload"
            className="inline-block px-6 py-3 bg-olive-600 text-white rounded-lg hover:bg-olive-700 transition cursor-pointer font-medium"
          >
            Choose Files
          </label>
          
          <p className="text-sm text-slate-500 mt-4">
            Supported formats: PDF, DOCX, DOC, TXT, CSV (Max 10MB per file)
          </p>
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Uploaded Files ({uploadedFiles.length})
            </h3>
            <div className="space-y-3">
              {uploadedFiles.map((uploadedFile) => (
                <div
                  key={uploadedFile.id}
                  className="flex items-center justify-between bg-beige-50 p-4 rounded-lg border border-beige-200"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-2xl">{getFileIcon(uploadedFile.file)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 truncate">
                        {uploadedFile.file.name}
                      </p>
                      <p className="text-sm text-slate-500">
                        {formatFileSize(uploadedFile.file.size)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {uploadedFile.status === 'pending' && (
                      <CheckCircle className="w-5 h-5 text-olive-600" />
                    )}
                    {uploadedFile.status === 'uploading' && (
                      <Loader className="w-5 h-5 text-olive-600 animate-spin" />
                    )}
                    {uploadedFile.status === 'error' && (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                    
                    <button
                      onClick={() => removeFile(uploadedFile.id)}
                      className="text-slate-400 hover:text-red-500 transition"
                      disabled={loading}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-olive-50 border border-olive-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-olive-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-olive-800">
              <p className="font-semibold mb-1">What happens next?</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Our AI will parse your documents and extract key information</li>
                <li>We'll identify deliverables, materials, timeline, and complexity</li>
                <li>Market data will be scraped from relevant platforms</li>
                <li>You'll receive a comprehensive pricing analysis with reasoning</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={handleSubmit}
            disabled={uploadedFiles.length === 0 || loading}
            className="flex-1 bg-olive-600 text-white py-4 rounded-lg font-semibold hover:bg-olive-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Analyzing Documents...
              </>
            ) : (
              <>
                Analyze & Get Pricing
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

