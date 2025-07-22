
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateComprehensiveAnalysis } from '@/lib/biomarker-analysis';
import { BiomarkerData } from '@/lib/types';
import { auditLogger } from '@/lib/audit';
import { validateConsentForOperation } from '@/lib/consent';
import { encryptPHI } from '@/lib/crypto';
import withHIPAAAudit from '@/middleware/hipaa-audit';
import { 
  getOrCreateUserSession, 
  storeHealthAnalysis, 
  storeConversationContext,
  getComprehensiveHealthInsights,
  getPersonalizedGreeting,
  AnalysisSummary 
} from '@/lib/zep';

export const dynamic = 'force-dynamic';

async function handleAnalysisRequest(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const email = formData.get('email') as string;
    const initials = formData.get('initials') as string;
    const age = formData.get('age') as string;
    const city = formData.get('city') as string;

    if (!file || !email || !initials || !age || !city) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email },
      include: { userStats: true }
    });

    // Validate consent for analysis operation
    if (user) {
      const hasConsent = await validateConsentForOperation(user.id, 'analysis');
      if (!hasConsent) {
        await auditLogger.logAnalysisRequest(
          user.id,
          'comprehensive',
          request,
          false,
          'Insufficient consent for analysis operation'
        );
        
        return NextResponse.json(
          { error: 'User consent required for health analysis' },
          { status: 403 }
        );
      }
    }

    // Extract text from PDF using LLM API
    const base64Buffer = await file.arrayBuffer();
    const base64String = Buffer.from(base64Buffer).toString('base64');

    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [{
          role: "user",
          content: [{
            type: "file",
            file: {
              filename: file.name,
              file_data: `data:application/pdf;base64,${base64String}`
            }
          }, {
            type: "text",
            text: `Extract all biomarker values from this lab report and return them in JSON format. 
            
            Extract ALL available biomarkers including:
            - Thyroid Panel: TSH, Free T4, Free T3, Reverse T3, TPO Antibodies, Anti-Thyroglobulin
            - Metabolic Panel: Fasting Glucose, Fasting Insulin, HbA1c, C-Peptide, OGTT
            - Lipid Panel: Total Cholesterol, HDL, LDL, Triglycerides, ApoB, ApoA1, Lp(a)
            - Inflammation: hs-CRP, ESR, Ferritin, IL-6, TNF-alpha
            - Vitamins: Vitamin D, B12, Folate, B6, B1, B2, B3, B5, Biotin, Vitamin A, E, K
            - Minerals: Magnesium, Zinc, Iron, Copper, Selenium, Manganese, Chromium
            - Liver Function: ALT, AST, Alkaline Phosphatase, GGT, Total Bilirubin, Direct Bilirubin
            - Kidney Function: Creatinine, BUN, eGFR, Cystatin C, Microalbumin
            - Hormones: Cortisol, DHEA-S, Testosterone, Estradiol, Progesterone, IGF-1
            - Complete Blood Count: WBC, RBC, Hemoglobin, Hematocrit, Platelets, MCV, MCH, MCHC
            - Electrolytes: Sodium, Potassium, Chloride, CO2, Calcium, Phosphorus
            - Proteins: Total Protein, Albumin, Globulin, Prealbumin
            - Cardiac: Troponin, CK-MB, NT-proBNP, Homocysteine
            - Autoimmune: ANA, Anti-CCP, RF, Anti-dsDNA
            
            Return JSON with biomarker names as keys and numeric values only.
            Use consistent naming (e.g., "tsh", "freeT4", "fastingGlucose").
            
            If a biomarker is not present, don't include it in the JSON.
            Return only the JSON object, no other text.`
          }]
        }],
        max_tokens: 3000,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status}`);
    }

    const llmResult = await response.json();
    const extractedData = JSON.parse(llmResult.choices[0].message.content);

    // Generate comprehensive analysis
    const analysisResults = generateComprehensiveAnalysis(extractedData as BiomarkerData);

    // Generate AI-enhanced insights
    const aiInsights = await generateAIInsights(extractedData, analysisResults);

    // Create user if doesn't exist
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          initials,
          age: parseInt(age),
          city,
          name: initials,
        },
        include: { userStats: true }
      });

      await prisma.userStats.create({
        data: {
          userId: user.id,
        }
      });

      // Assign default patient role for new user
      await prisma.userRole_Assignment.create({
        data: {
          userId: user.id,
          role: 'PATIENT',
          assignedBy: user.id,
          reason: 'Default role assignment during analysis'
        }
      });
    }

    // Encrypt sensitive biomarker data
    const encryptedBiomarkers = encryptPHI(JSON.stringify(extractedData));

    const analysis = await prisma.analysis.create({
      data: {
        userId: user.id,
        email,
        initials,
        age: parseInt(age),
        city,
        biomarkers: extractedData as any,
        metabolicScore: analysisResults.metabolicScore,
        thyroidScore: analysisResults.thyroidScore,
        metabolicHealth: analysisResults.metabolicHealth,
        inflammation: analysisResults.inflammation,
        nutrients: analysisResults.nutrients,
        patterns: analysisResults.patterns as any,
        criticalFindings: analysisResults.criticalFindings as any,
        recommendations: {
          ...analysisResults.recommendations,
          aiInsights
        } as any,
        analysisType: 'comprehensive',
        aiEnhanced: true,
        originalFilename: file.name,
        fileSize: file.size,
      }
    });

    // Store encrypted PHI separately
    await prisma.encryptedPHI.create({
      data: {
        userId: user.id,
        fieldName: 'biomarkers',
        encryptedData: encryptedBiomarkers.encryptedData,
        keyVersion: encryptedBiomarkers.keyVersion,
        sourceTable: 'analyses',
        sourceId: analysis.id,
        dataType: 'json',
        classification: 'PHI'
      }
    });

    // Update user stats
    await prisma.userStats.update({
      where: { userId: user.id },
      data: {
        totalAnalyses: { increment: 1 },
        averageMetabolicScore: analysisResults.metabolicScore,
        bestMetabolicScore: Math.max(analysisResults.metabolicScore, user.userStats?.bestMetabolicScore || 0),
        latestAnalysisDate: new Date(),
      }
    });

    // Log successful analysis
    await auditLogger.logAnalysisRequest(
      user.id,
      'comprehensive',
      request,
      true
    );

    // Log data access for biomarkers
    await auditLogger.logDataAccess(
      user.id,
      'analysis',
      analysis.id,
      'write',
      request,
      { 
        analysisType: 'comprehensive',
        biomarkerCount: Object.keys(extractedData).length,
        fileSize: file.size
      }
    );

    // Store analysis results in Zep memory for future context
    try {
      const sessionResult = await getOrCreateUserSession(user.id, {
        sessionType: 'health_analysis',
        userEmail: user.email
      });

      if (sessionResult.success && sessionResult.data) {
        const analysisSummary: AnalysisSummary = {
          id: analysis.id,
          timestamp: new Date(),
          labResults: {
            testType: 'Comprehensive Lab Analysis',
            keyFindings: (analysisResults.criticalFindings || []).map((f: any) => 
              typeof f === 'string' ? f : f.finding || f.description || 'Critical finding detected'
            ),
            recommendations: analysisResults.recommendations?.immediate || [],
            riskFactors: Array.isArray(analysisResults.patterns) ? 
              analysisResults.patterns.map((p: any) => p.description || 'Risk factor identified') : []
          },
          bioenergetic: {
            metabolicHealth: String(analysisResults.metabolicHealth || 'Assessment pending'),
            thyroidFunction: (analysisResults.thyroidScore || 0) > 70 ? 'Optimal' : 'Needs attention',
            stressMarkers: String(analysisResults.inflammation || 'Normal'),
            nutritionalStatus: String(analysisResults.nutrients || 'Adequate')
          },
          rayPeatInsights: {
            principles: analysisResults.recommendations?.longTerm || [],
            recommendations: analysisResults.recommendations?.shortTerm || [],
            warnings: analysisResults.recommendations?.immediate || []
          },
          severity: analysisResults.metabolicScore > 80 ? 'low' : 
                   analysisResults.metabolicScore > 60 ? 'moderate' : 'high',
          followUpRequired: analysisResults.metabolicScore < 70
        };

        await storeHealthAnalysis(user.id, sessionResult.data, analysisSummary);
        
        // Store conversation context
        await storeConversationContext(
          user.id,
          sessionResult.data,
          `Lab analysis request for ${file.name}`,
          `Comprehensive analysis completed with metabolic score: ${analysisResults.metabolicScore}`,
          { analysisId: analysis.id, fileSize: file.size }
        );
      }
    } catch (zepError) {
      // Log Zep error but don't fail the analysis
      console.error('Zep memory storage failed:', zepError);
      await auditLogger.logDataAccess(
        user.id,
        'analysis',
        analysis.id,
        'write',
        request,
        { zepError: (zepError as Error).message }
      );
    }

    // Get memory-enhanced insights for the response
    let memoryInsights = null;
    try {
      if (sessionResult.success && sessionResult.data) {
        const comprehensiveInsights = await getComprehensiveHealthInsights(
          user.id, 
          sessionResult.data, 
          analysisResults
        );
        
        if (comprehensiveInsights.success) {
          memoryInsights = comprehensiveInsights.data;
        }
      }
    } catch (memoryError) {
      console.warn('Memory insights failed:', memoryError);
    }

    return NextResponse.json({
      success: true,
      analysisId: analysis.id,
      results: {
        ...analysisResults,
        aiInsights,
        // Phase 2B: Memory-enhanced features
        memoryInsights: memoryInsights ? {
          relevantHistory: memoryInsights.context.relevantHistory.length,
          trends: memoryInsights.trends,
          personalizedInsights: memoryInsights.insights,
          recommendations: memoryInsights.recommendations,
          hasHistoricalContext: memoryInsights.context.relevantHistory.length > 0
        } : null
      },
      message: 'Comprehensive analysis completed successfully with memory integration'
    });

  } catch (error) {
    console.error('Comprehensive analysis error:', error);
    
    // Log failed analysis attempt
    const formData = await request.formData();
    const email = formData.get('email') as string;
    
    if (email) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        await auditLogger.logAnalysisRequest(
          user.id,
          'comprehensive',
          request,
          false,
          error.message
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Comprehensive analysis failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Apply HIPAA audit middleware
export const POST = withHIPAAAudit(handleAnalysisRequest);

async function generateAIInsights(biomarkerData: BiomarkerData, analysisResults: any) {
  try {
    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [{
          role: "user",
          content: `Based on this comprehensive lab analysis, provide advanced insights and personalized recommendations:

Biomarker Data: ${JSON.stringify(biomarkerData)}
Analysis Results: ${JSON.stringify(analysisResults)}

Please provide:
1. Advanced pattern recognition beyond basic analysis
2. Personalized optimization strategies
3. Risk assessment and prevention recommendations
4. Integration insights (how biomarkers interact)
5. Lifestyle and nutritional recommendations
6. Monitoring and follow-up suggestions

Focus on actionable insights that go beyond standard lab interpretation.`
        }],
        max_tokens: 2000,
      })
    });

    if (response.ok) {
      const result = await response.json();
      return result.choices[0].message.content;
    } else {
      return "AI insights temporarily unavailable. Please refer to the comprehensive analysis results.";
    }
  } catch (error) {
    console.error('AI insights generation error:', error);
    return "AI insights temporarily unavailable. Please refer to the comprehensive analysis results.";
  }
}
