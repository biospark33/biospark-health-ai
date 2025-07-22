
// Optimized Comprehensive Analysis API with Caching and Performance Enhancements
// Phase 1D: Performance-optimized version

import { NextRequest, NextResponse } from 'next/server';
import { OptimizedQueries } from '@/lib/db-optimized';
import { generateComprehensiveAnalysis } from '@/lib/biomarker-analysis';
import { BiomarkerData } from '@/lib/types';
import { auditLogger } from '@/lib/audit';
import { validateConsentForOperation } from '@/lib/consent';
import { encryptPHI } from '@/lib/crypto';
import { cacheManager } from '@/lib/cache';
import { withPerformanceOptimization, withRequestBatching } from '@/middleware/performance';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

async function handleAnalysisRequest(request: NextRequest) {
  const startTime = Date.now();
  
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

    // Generate cache key for biomarker analysis
    const fileBuffer = await file.arrayBuffer();
    const fileHash = crypto.createHash('sha256').update(Buffer.from(fileBuffer)).digest('hex');
    const cacheKey = `analysis:${email}:${fileHash}`;

    // Check cache first
    const cachedAnalysis = await cacheManager.getCachedBiomarkerAnalysis(email, fileHash);
    if (cachedAnalysis) {
      console.log(`Cache hit for analysis: ${Date.now() - startTime}ms`);
      const response = NextResponse.json(cachedAnalysis);
      response.headers.set('X-Cache-Status', 'HIT');
      response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`);
      return response;
    }

    // Optimized user lookup with caching
    let user = await cacheManager.getCachedUser(email);
    if (!user) {
      user = await OptimizedQueries.findUserByEmail(email);
      if (user) {
        await cacheManager.cacheUser(email, user, 3600); // Cache for 1 hour
      }
    }

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

    // Parallel processing for better performance
    const base64String = Buffer.from(fileBuffer).toString('base64');
    
    // Use Promise.all for parallel operations where possible
    const [extractionResponse] = await Promise.all([
      // PDF extraction with optimized prompt
      fetch('https://apps.abacus.ai/v1/chat/completions', {
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
              text: `Extract biomarker values from this lab report in JSON format. Focus on key biomarkers: TSH, Free T4, Glucose, HbA1c, Cholesterol, HDL, LDL, Triglycerides, Vitamin D, B12, CRP, Ferritin. Return only JSON with biomarker names as keys and numeric values. Use consistent naming (e.g., "tsh", "freeT4", "glucose").`
            }]
          }],
          max_tokens: 1000, // Reduced for faster response
          temperature: 0.1
        })
      })
    ]);

    if (!extractionResponse.ok) {
      throw new Error(`PDF extraction failed: ${extractionResponse.statusText}`);
    }

    const extractionData = await extractionResponse.json();
    let biomarkerData: BiomarkerData;

    try {
      const extractedText = extractionData.choices[0].message.content;
      const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        biomarkerData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in extraction');
      }
    } catch (parseError) {
      console.error('Failed to parse biomarker data:', parseError);
      return NextResponse.json(
        { error: 'Failed to extract biomarker data from PDF' },
        { status: 400 }
      );
    }

    // Generate comprehensive analysis with caching
    const analysisResult = await generateComprehensiveAnalysis(biomarkerData, {
      age: parseInt(age),
      initials,
      city
    });

    // Cache the analysis result
    await cacheManager.cacheBiomarkerAnalysis(email, fileHash, analysisResult, 7200); // Cache for 2 hours

    // Audit logging (async for better performance)
    setImmediate(async () => {
      if (user) {
        await auditLogger.logAnalysisRequest(
          user.id,
          'comprehensive',
          request,
          true,
          'Analysis completed successfully'
        );
      }
    });

    const responseTime = Date.now() - startTime;
    console.log(`Analysis completed in ${responseTime}ms`);

    const response = NextResponse.json(analysisResult);
    response.headers.set('X-Cache-Status', 'MISS');
    response.headers.set('X-Response-Time', `${responseTime}ms`);
    
    return response;

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`Analysis error in ${responseTime}ms:`, error);
    
    return NextResponse.json(
      { error: 'Analysis processing failed', details: error.message },
      { status: 500 }
    );
  }
}

// Apply performance optimizations
export const POST = withPerformanceOptimization(
  withRequestBatching(handleAnalysisRequest)
);
