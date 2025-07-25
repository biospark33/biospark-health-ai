
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Activity, Brain, Target, Zap, Loader2 } from 'lucide-react';

interface BiomarkerInput {
  name: string;
  value: number;
  unit: string;
  referenceRange?: string;
}

interface AssessmentData {
  type: string;
  biomarkers: BiomarkerInput[];
  symptoms: string[];
  lifestyle: {
    diet: string;
    exercise: string;
    sleep: string;
    stress: string;
  };
  goals: string[];
}

interface AnalysisResult {
  analysis: string;
  recommendations: string[];
  insights: any;
  memoryContext: any;
}

export default function AssessmentPage() {
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({
    type: 'comprehensive',
    biomarkers: [],
    symptoms: [],
    lifestyle: {
      diet: '',
      exercise: '',
      sleep: '',
      stress: ''
    },
    goals: []
  });
  
  const [currentBiomarker, setCurrentBiomarker] = useState<BiomarkerInput>({
    name: '',
    value: 0,
    unit: '',
    referenceRange: ''
  });
  
  const [currentSymptom, setCurrentSymptom] = useState('');
  const [currentGoal, setCurrentGoal] = useState('');
  const [enableMemoryEnhancement, setEnableMemoryEnhancement] = useState(true);
  const [layerPreference, setLayerPreference] = useState<number>(2);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');

  const commonBiomarkers = [
    { name: 'TSH', unit: 'mIU/L', range: '0.4-4.0' },
    { name: 'Free T3', unit: 'pg/mL', range: '2.3-4.2' },
    { name: 'Free T4', unit: 'ng/dL', range: '0.8-1.8' },
    { name: 'Cortisol', unit: 'μg/dL', range: '6-23' },
    { name: 'Glucose', unit: 'mg/dL', range: '70-100' },
    { name: 'Insulin', unit: 'μIU/mL', range: '2-25' },
    { name: 'Vitamin D', unit: 'ng/mL', range: '30-100' },
    { name: 'B12', unit: 'pg/mL', range: '300-900' }
  ];

  const commonSymptoms = [
    'Fatigue', 'Brain fog', 'Weight gain', 'Weight loss', 'Cold intolerance',
    'Heat intolerance', 'Hair loss', 'Dry skin', 'Anxiety', 'Depression',
    'Insomnia', 'Joint pain', 'Muscle weakness', 'Digestive issues',
    'Irregular periods', 'Low libido', 'Memory problems', 'Mood swings'
  ];

  const healthGoals = [
    'Increase energy levels', 'Improve sleep quality', 'Optimize metabolism',
    'Balance hormones', 'Reduce inflammation', 'Improve cognitive function',
    'Weight management', 'Stress reduction', 'Better digestion',
    'Enhanced athletic performance', 'Longevity optimization'
  ];

  const addBiomarker = () => {
    if (currentBiomarker.name && currentBiomarker.value) {
      setAssessmentData(prev => ({
        ...prev,
        biomarkers: [...prev.biomarkers, { ...currentBiomarker }]
      }));
      setCurrentBiomarker({ name: '', value: 0, unit: '', referenceRange: '' });
    }
  };

  const removeBiomarker = (index: number) => {
    setAssessmentData(prev => ({
      ...prev,
      biomarkers: prev.biomarkers.filter((_, i) => i !== index)
    }));
  };

  const addSymptom = (symptom: string) => {
    if (!assessmentData.symptoms.includes(symptom)) {
      setAssessmentData(prev => ({
        ...prev,
        symptoms: [...prev.symptoms, symptom]
      }));
    }
  };

  const removeSymptom = (symptom: string) => {
    setAssessmentData(prev => ({
      ...prev,
      symptoms: prev.symptoms.filter(s => s !== symptom)
    }));
  };

  const addGoal = (goal: string) => {
    if (!assessmentData.goals.includes(goal)) {
      setAssessmentData(prev => ({
        ...prev,
        goals: [...prev.goals, goal]
      }));
    }
  };

  const removeGoal = (goal: string) => {
    setAssessmentData(prev => ({
      ...prev,
      goals: prev.goals.filter(g => g !== goal)
    }));
  };

  const handleSubmit = async () => {
    if (assessmentData.biomarkers.length === 0) {
      setError('Please add at least one biomarker');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/health/memory-enhanced-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assessmentData,
          enableMemoryEnhancement,
          layerPreference
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Memory-Enhanced Health Assessment
        </h1>
        <p className="text-xl text-gray-600">
          Comprehensive health analysis with personalized Ray Peat insights and memory integration
        </p>
      </div>

      <Tabs defaultValue="biomarkers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="biomarkers">Biomarkers</TabsTrigger>
          <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
          <TabsTrigger value="lifestyle">Lifestyle</TabsTrigger>
          <TabsTrigger value="goals">Goals & Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="biomarkers">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-6 w-6" />
                Biomarker Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label>Biomarker Name</Label>
                  <Select 
                    value={currentBiomarker.name} 
                    onValueChange={(value) => {
                      const biomarker = commonBiomarkers.find(b => b.name === value);
                      setCurrentBiomarker(prev => ({
                        ...prev,
                        name: value,
                        unit: biomarker?.unit || '',
                        referenceRange: biomarker?.range || ''
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select biomarker" />
                    </SelectTrigger>
                    <SelectContent>
                      {commonBiomarkers.map(biomarker => (
                        <SelectItem key={biomarker.name} value={biomarker.name}>
                          {biomarker.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Value</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={currentBiomarker.value || ''}
                    onChange={(e) => setCurrentBiomarker(prev => ({
                      ...prev,
                      value: parseFloat(e.target.value) || 0
                    }))}
                    placeholder="Enter value"
                  />
                </div>
                
                <div>
                  <Label>Unit</Label>
                  <Input
                    value={currentBiomarker.unit}
                    onChange={(e) => setCurrentBiomarker(prev => ({
                      ...prev,
                      unit: e.target.value
                    }))}
                    placeholder="mg/dL, μIU/mL, etc."
                  />
                </div>
                
                <div className="flex items-end">
                  <Button onClick={addBiomarker} className="w-full">
                    Add Biomarker
                  </Button>
                </div>
              </div>

              {currentBiomarker.referenceRange && (
                <p className="text-sm text-gray-600">
                  Reference range: {currentBiomarker.referenceRange}
                </p>
              )}

              {assessmentData.biomarkers.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Added Biomarkers:</h3>
                  <div className="space-y-2">
                    {assessmentData.biomarkers.map((biomarker, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span>
                          <strong>{biomarker.name}:</strong> {biomarker.value} {biomarker.unit}
                          {biomarker.referenceRange && (
                            <span className="text-gray-500 ml-2">
                              (Ref: {biomarker.referenceRange})
                            </span>
                          )}
                        </span>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => removeBiomarker(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="symptoms">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-6 w-6" />
                Symptoms & Health Concerns
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Common Symptoms</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
                  {commonSymptoms.map(symptom => (
                    <Button
                      key={symptom}
                      variant={assessmentData.symptoms.includes(symptom) ? "default" : "outline"}
                      size="sm"
                      onClick={() => 
                        assessmentData.symptoms.includes(symptom) 
                          ? removeSymptom(symptom)
                          : addSymptom(symptom)
                      }
                    >
                      {symptom}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Custom Symptom</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={currentSymptom}
                    onChange={(e) => setCurrentSymptom(e.target.value)}
                    placeholder="Enter custom symptom"
                  />
                  <Button 
                    onClick={() => {
                      if (currentSymptom.trim()) {
                        addSymptom(currentSymptom.trim());
                        setCurrentSymptom('');
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>

              {assessmentData.symptoms.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Selected Symptoms:</h3>
                  <div className="flex flex-wrap gap-2">
                    {assessmentData.symptoms.map(symptom => (
                      <Badge 
                        key={symptom} 
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => removeSymptom(symptom)}
                      >
                        {symptom} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lifestyle">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-6 w-6" />
                Lifestyle Factors
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Diet Description</Label>
                  <Textarea
                    value={assessmentData.lifestyle.diet}
                    onChange={(e) => setAssessmentData(prev => ({
                      ...prev,
                      lifestyle: { ...prev.lifestyle, diet: e.target.value }
                    }))}
                    placeholder="Describe your typical diet, eating patterns, restrictions..."
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label>Exercise Routine</Label>
                  <Textarea
                    value={assessmentData.lifestyle.exercise}
                    onChange={(e) => setAssessmentData(prev => ({
                      ...prev,
                      lifestyle: { ...prev.lifestyle, exercise: e.target.value }
                    }))}
                    placeholder="Describe your exercise routine, frequency, intensity..."
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label>Sleep Patterns</Label>
                  <Textarea
                    value={assessmentData.lifestyle.sleep}
                    onChange={(e) => setAssessmentData(prev => ({
                      ...prev,
                      lifestyle: { ...prev.lifestyle, sleep: e.target.value }
                    }))}
                    placeholder="Sleep duration, quality, schedule, issues..."
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label>Stress Levels & Management</Label>
                  <Textarea
                    value={assessmentData.lifestyle.stress}
                    onChange={(e) => setAssessmentData(prev => ({
                      ...prev,
                      lifestyle: { ...prev.lifestyle, stress: e.target.value }
                    }))}
                    placeholder="Stress sources, levels, management techniques..."
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-6 w-6" />
                  Health Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Select Your Health Goals</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                    {healthGoals.map(goal => (
                      <Button
                        key={goal}
                        variant={assessmentData.goals.includes(goal) ? "default" : "outline"}
                        size="sm"
                        onClick={() => 
                          assessmentData.goals.includes(goal) 
                            ? removeGoal(goal)
                            : addGoal(goal)
                        }
                      >
                        {goal}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Custom Goal</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={currentGoal}
                      onChange={(e) => setCurrentGoal(e.target.value)}
                      placeholder="Enter custom health goal"
                    />
                    <Button 
                      onClick={() => {
                        if (currentGoal.trim()) {
                          addGoal(currentGoal.trim());
                          setCurrentGoal('');
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </div>

                {assessmentData.goals.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Selected Goals:</h3>
                    <div className="flex flex-wrap gap-2">
                      {assessmentData.goals.map(goal => (
                        <Badge 
                          key={goal} 
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => removeGoal(goal)}
                        >
                          {goal} ×
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Analysis Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="memory-enhancement"
                    checked={enableMemoryEnhancement}
                    onCheckedChange={setEnableMemoryEnhancement}
                  />
                  <Label htmlFor="memory-enhancement">
                    Enable Memory Enhancement (uses your health history for personalized insights)
                  </Label>
                </div>

                <div>
                  <Label>Analysis Depth</Label>
                  <Select 
                    value={layerPreference.toString()} 
                    onValueChange={(value) => setLayerPreference(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Layer 1 - Basic Analysis</SelectItem>
                      <SelectItem value="2">Layer 2 - Comprehensive Analysis</SelectItem>
                      <SelectItem value="3">Layer 3 - Deep Bioenergetic Analysis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
                    {error}
                  </div>
                )}

                <Button 
                  onClick={handleSubmit} 
                  disabled={loading || assessmentData.biomarkers.length === 0}
                  size="lg"
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Generate Memory-Enhanced Analysis'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {result && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-md">
                {result.analysis}
              </pre>
              
              {result.recommendations && result.recommendations.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Recommendations:</h3>
                  <div className="space-y-2">
                    {result.recommendations.map((rec, index) => (
                      <div key={index} className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-md">
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
