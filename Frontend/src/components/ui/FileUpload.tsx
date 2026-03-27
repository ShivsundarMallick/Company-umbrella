import { useState, useRef, useCallback } from 'react';
import { Upload, X, Link as LinkIcon, Loader2, Check } from 'lucide-react';
import { uploadService } from '../../services';

interface FileUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  accept?: string;
  maxSize?: number; // in MB
  label?: string;
  placeholder?: string;
  showPreview?: boolean;
  previewType?: 'image' | 'file';
  error?: string;
  disabled?: boolean;
  hint?: string;
  onFileSelect?: (file: File) => void;
}

export default function FileUpload({
  value = '',
  onChange,
  folder = 'resources',
  accept = 'image/*,application/pdf',
  maxSize = 10,
  label,
  placeholder = 'Enter URL or upload file',
  showPreview = true,
  previewType = 'image',
  error,
  disabled = false,
  hint,
  onFileSelect,
}: FileUploadProps) {
  const [mode, setMode] = useState<'url' | 'upload'>('url');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setUploadSuccess(false);
    setUploadError(null);
  };

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const acceptsPdf = accept.toLowerCase().includes('pdf');
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (acceptsPdf && !isPdf) {
      setUploadError('Only PDF files are allowed');
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setUploadError(`File too large. Maximum size is ${maxSize}MB`);
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      if (onFileSelect) {
        await Promise.resolve(onFileSelect(file));
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      } else {
        const result = await uploadService.uploadFile(file, folder);
        onChange(result.url);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [accept, folder, maxSize, onChange, onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled || uploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file && fileInputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInputRef.current.files = dt.files;
      handleFileSelect({ target: fileInputRef.current } as React.ChangeEvent<HTMLInputElement>);
    }
  }, [disabled, uploading, handleFileSelect]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const clearValue = () => {
    onChange('');
    setUploadSuccess(false);
    setUploadError(null);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {hint && (
        <p className="text-xs text-gray-500 -mt-1">{hint}</p>
      )}

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-2">
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
            mode === 'url'
              ? 'bg-primary-100 text-primary-700 font-medium'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <LinkIcon className="w-4 h-4" />
          URL
        </button>
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
            mode === 'upload'
              ? 'bg-primary-100 text-primary-700 font-medium'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Upload className="w-4 h-4" />
          Upload
        </button>
      </div>

      {mode === 'url' ? (
        /* URL Input Mode */
        <div className="relative">
          <input
            type="url"
            value={value}
            onChange={handleUrlChange}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              error ? 'border-red-500' : 'border-gray-300'
            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          />
          {value && (
            <button
              type="button"
              onClick={clearValue}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        /* File Upload Mode */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
            uploading
              ? 'border-primary-300 bg-primary-50'
              : uploadSuccess
              ? 'border-green-300 bg-green-50'
              : error || uploadError
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled || uploading}
          />

          <div className="flex flex-col items-center gap-2">
            {uploading ? (
              <>
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                <span className="text-sm text-primary-600">Uploading...</span>
              </>
            ) : uploadSuccess ? (
              <>
                <Check className="w-8 h-8 text-green-500" />
                <span className="text-sm text-green-600">Upload successful!</span>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Drag and drop or click to upload
                </span>
                <span className="text-xs text-gray-400">
                  Max size: {maxSize}MB
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {(error || uploadError) && (
        <p className="text-sm text-red-500">{error || uploadError}</p>
      )}

      {/* Preview */}
      {showPreview && value && (
        <div className="mt-2">
          {previewType === 'image' ? (
            <div className="relative inline-block">
              <img
                src={value}
                alt="Preview"
                className="max-w-xs max-h-40 rounded-lg border border-gray-200 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <button
                type="button"
                onClick={clearValue}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
              <LinkIcon className="w-4 h-4 text-gray-400" />
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary-600 hover:underline truncate max-w-xs"
              >
                {value}
              </a>
              <button
                type="button"
                onClick={clearValue}
                className="ml-auto p-1 text-gray-400 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
