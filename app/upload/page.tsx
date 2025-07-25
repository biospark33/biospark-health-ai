
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, Image, FileSpreadsheet, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AnalysisResult {
  id: string;
  analysis: string;
  recommendations: string[];
  biomarkers: any;
  timestamp: string;
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [email, setEmail] = useState('');
  const [initials, setInitials] = useState('');
  const [age, setAge] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'text/csv', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Please upload a PDF, CSV, or image file (JPG, PNG)');
        return;
      }
      
      // Validate file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !email || !initials || !age || !city) {
      setError('Please fill in all fields and select a file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('email', email);
      formData.append('initials', initials);
      formData.append('age', age);
      formData.append('city', city);

      const response = await fetch('/api/comprehensive-analysis', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const data = await response.json();
      setResult(data);
      
      // Redirect to results page with analysis ID
      if (data.id) {
        router.push(`/results/${data.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="h-8 w-8 text-red-500" />;
    if (fileType.includes('csv')) return <FileSpreadsheet className="h-8 w-8 text-green-500" />;
    if (fileType.includes('image')) return <Image className="h-8 w-8 text-blue-500" />;
    return <FileText className="h-8 w-8 text-gray-500" />;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Upload Health Data for Analysis
        </h1>
        <p className="text-xl text-gray-600">
          Upload your lab reports, biomarker data, or health documents for comprehensive Ray Peat analysis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-6 w-6" />
              File Upload & User Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Upload */}
              <div>
                <Label htmlFor="file">Health Data File</Label>
                <div className="mt-2">
                  <input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.csv,.jpg,.jpeg,.png"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Supported formats: PDF, CSV, JPG, PNG (max 10MB)
                  </p>
                </div>
                
                {file && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg flex items-center gap-3">
                    {getFileIcon(file.type)}
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* User Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="initials">Initials</Label>
                  <Input
                    id="initials"
                    type="text"
                    value={initials}
                    onChange={(e) => setInitials(e.target.value)}
                    placeholder="J.D."
                    maxLength={5}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="30"
                    min="1"
                    max="120"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="New York"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                disabled={loading || !file} 
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Upload & Analyze'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What We Analyze</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-red-500 mt-1" />
              <div>
                <h3 className="font-semibold">Lab Reports (PDF)</h3>
                <p className="text-sm text-gray-600">
                  Complete blood panels, hormone tests, metabolic markers with Ray Peat interpretation
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <FileSpreadsheet className="h-5 w-5 text-green-500 mt-1" />
              <div>
                <h3 className="font-semibold">Biomarker Data (CSV)</h3>
                <p className="text-sm text-gray-600">
                  Structured data files with biomarker values and timestamps
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Image className="h-5 w-5 text-blue-500 mt-1" />
              <div>
                <h3 className="font-semibold">Lab Report Images</h3>
                <p className="text-sm text-gray-600">
                  Photos of lab results with OCR processing and analysis
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Ray Peat Analysis Includes:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Bioenergetic metabolic assessment</li>
                <li>• Thyroid function optimization</li>
                <li>• Stress hormone evaluation</li>
                <li>• Nutritional recommendations</li>
                <li>• Lifestyle intervention suggestions</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {result && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Analysis Complete</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-600 mb-4">
              Your analysis has been completed successfully! You can view the full results on the results page.
            </p>
            <Button onClick={() => router.push(`/results/${result.id}`)}>
              View Full Results
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
