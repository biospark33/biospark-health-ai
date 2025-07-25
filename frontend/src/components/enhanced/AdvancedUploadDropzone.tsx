
'use client'

import { useState, useCallback, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Upload, FileText, X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

interface UploadFile {
  file: File
  id: string
  status: 'uploading' | 'success' | 'error'
  progress: number
  error?: string
}

interface AdvancedUploadDropzoneProps {
  onFileUpload: (files: File[]) => Promise<void>
  acceptedTypes?: string[]
  maxSize?: number
  maxFiles?: number
  showPreview?: boolean
  className?: string
}

export default function AdvancedUploadDropzone({
  onFileUpload,
  acceptedTypes = ['.pdf', '.jpg', '.jpeg', '.png'],
  maxSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 5,
  showPreview = true,
  className = ''
}: AdvancedUploadDropzoneProps) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!acceptedTypes.includes(fileExtension)) {
      return `File type ${fileExtension} is not supported. Please use: ${acceptedTypes.join(', ')}`
    }

    // Check file size
    if (file.size > maxSize) {
      return `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds maximum allowed size (${(maxSize / 1024 / 1024).toFixed(1)}MB)`
    }

    return null
  }

  const handleFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles)
    
    // Check total file count
    if (files.length + fileArray.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`)
      return
    }

    const validFiles: UploadFile[] = []
    const errors: string[] = []

    fileArray.forEach((file) => {
      const error = validateFile(file)
      if (error) {
        errors.push(`${file.name}: ${error}`)
      } else {
        validFiles.push({
          file,
          id: Math.random().toString(36).substr(2, 9),
          status: 'uploading',
          progress: 0
        })
      }
    })

    if (errors.length > 0) {
      alert('File validation errors:\n' + errors.join('\n'))
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles])
      processFiles(validFiles)
    }
  }, [files.length, maxFiles, acceptedTypes, maxSize])

  const processFiles = async (uploadFiles: UploadFile[]) => {
    setIsUploading(true)
    
    try {
      // Simulate upload progress
      for (const uploadFile of uploadFiles) {
        // Update progress
        for (let progress = 0; progress <= 100; progress += 20) {
          await new Promise(resolve => setTimeout(resolve, 100))
          setFiles(prev => prev.map(f => 
            f.id === uploadFile.id ? { ...f, progress } : f
          ))
        }
        
        // Mark as success
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id ? { ...f, status: 'success' } : f
        ))
      }

      // Call the upload handler
      await onFileUpload(uploadFiles.map(f => f.file))
    } catch (error) {
      // Mark files as error
      uploadFiles.forEach(uploadFile => {
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, status: 'error', error: 'Upload failed' } 
            : f
        ))
      })
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Area */}
      <Card 
        className={`border-2 border-dashed transition-all duration-300 cursor-pointer hover:border-blue-400 ${
          isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <CardContent className="p-12 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className={`p-4 rounded-full ${isDragOver ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <Upload className={`h-8 w-8 ${isDragOver ? 'text-blue-600' : 'text-gray-600'}`} />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Upload Your Health Reports
              </h3>
              <p className="text-gray-600 mb-4">
                Drag and drop your files here, or click to browse
              </p>
              <p className="text-sm text-gray-500">
                Supports: {acceptedTypes.join(', ')} • Max {(maxSize / 1024 / 1024).toFixed(0)}MB per file • Up to {maxFiles} files
              </p>
            </div>

            <Button 
              type="button" 
              variant="outline" 
              className="mt-4"
              disabled={isUploading}
            >
              Choose Files
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hidden File Input */}
      <Input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        aria-label="File upload input"
      />

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">Uploaded Files</h4>
          {files.map((uploadFile) => (
            <Card key={uploadFile.id} className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="flex-shrink-0">
                      <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {uploadFile.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(uploadFile.file.size / 1024 / 1024).toFixed(1)} MB
                      </p>
                      
                      {/* Progress Bar */}
                      {uploadFile.status === 'uploading' && (
                        <div className="mt-2">
                          <div className="bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadFile.progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Uploading... {uploadFile.progress}%
                          </p>
                        </div>
                      )}
                      
                      {/* Error Message */}
                      {uploadFile.status === 'error' && uploadFile.error && (
                        <p className="text-xs text-red-600 mt-1">
                          {uploadFile.error}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Status Icon */}
                    {uploadFile.status === 'uploading' && (
                      <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                    )}
                    {uploadFile.status === 'success' && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                    {uploadFile.status === 'error' && (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(uploadFile.id)}
                      className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                      aria-label={`Remove ${uploadFile.file.name}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Status */}
      {isUploading && (
        <div className="text-center py-4">
          <div className="inline-flex items-center space-x-2 text-blue-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="font-medium">Processing your files...</span>
          </div>
        </div>
      )}
    </div>
  )
}
