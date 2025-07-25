/**
 * Memory-Enhanced Chat API Route
 * Phase 2B - Context-Aware Conversation with Memory Integration
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

import { 
  getHealthContext, 
  storeConversationContext, 
  getPersonalizedGreeting,
  getOrCreateUserSession 
} from '@/lib/zep/memory';
import { auditLog } from '@/lib/compliance/audit';
import { validateHIPAACompliance } from '@/lib/compliance/hipaa';

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // HIPAA compliance validation
    const complianceCheck = await validateHIPAACompliance(session.user.id, 'chat_access');
    if (!complianceCheck.isCompliant) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { message, sessionId: providedSessionId, isGreeting = false } = body;

    if (!message && !isGreeting) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    // Get or create session
    const sessionResult = await getOrCreateUserSession(session.user.id, {
      sessionType: 'chat',
      userEmail: session.user.email || ''
    });

    if (!sessionResult.success) {
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }

    const sessionId = providedSessionId || sessionResult.data;

    // Handle greeting request
    if (isGreeting) {
      const greetingResult = await getPersonalizedGreeting(session.user.id, sessionId);
      
      if (greetingResult.success) {
        return NextResponse.json({
          success: true,
          data: {
            message: greetingResult.data,
            type: 'greeting',
            sessionId
          }
        });
      }
    }

    // Get relevant context for the conversation
    const startTime = Date.now();
    const contextResult = await getHealthContext(session.user.id, sessionId, message);
    
    if (!contextResult.success) {
      console.warn('Failed to get health context:', contextResult.error);
    }

    const context = contextResult.data;

    // Generate AI response with context
    const aiResponse = await generateContextAwareResponse(message, context);

    // Store the conversation
    await storeConversationContext(
      session.user.id,
      sessionId,
      message,
      aiResponse,
      { 
        hasContext: !!context,
        contextItems: context?.relevantHistory?.length || 0,
        responseTime: Date.now() - startTime
      }
    );

    // Audit log
    await auditLog({
      userId: session.user.id,
      action: 'memory_enhanced_chat',
      resource: 'chat_conversation',
      metadata: { 
        messageLength: message.length,
        hasContext: !!context,
        contextItems: context?.relevantHistory?.length || 0,
        responseTime: Date.now() - startTime
      },
      timestamp: new Date(),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
    });

    return NextResponse.json({
      success: true,
      data: {
        message: aiResponse,
        context: context ? {
          hasHistory: context.relevantHistory.length > 0,
          historyCount: context.relevantHistory.length,
          hasPreferences: Object.keys(context.userPreferences).length > 0,
          hasGoals: context.healthGoals.length > 0,
          summary: context.conversationSummary
        } : null,
        sessionId,
        metadata: {
          responseTime: Date.now() - startTime,
          contextEnhanced: !!context
        }
      }
    });

  } catch (error) {
    console.error('Memory-enhanced chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Generate context-aware AI response
 */
async function generateContextAwareResponse(
  userMessage: string, 
  context?: any
): Promise<string> {
  try {
    // Build context-aware prompt
    let systemPrompt = `You are LabInsight AI, a specialized health analysis assistant. `;
    
    if (context?.relevantHistory?.length > 0) {
      systemPrompt += `\n\nRelevant user history:\n`;
      context.relevantHistory.slice(0, 3).forEach((item: any, index: number) => {
        systemPrompt += `${index + 1}. ${item.content.substring(0, 200)}...\n`;
      });
    }

    if (context?.userPreferences && Object.keys(context.userPreferences).length > 0) {
      systemPrompt += `\n\nUser preferences: ${JSON.stringify(context.userPreferences)}\n`;
    }

    if (context?.healthGoals?.length > 0) {
      systemPrompt += `\n\nUser health goals: ${context.healthGoals.join(', ')}\n`;
    }

    if (context?.conversationSummary) {
      systemPrompt += `\n\nConversation summary: ${context.conversationSummary}\n`;
    }

    systemPrompt += `\n\nProvide a helpful, personalized response based on the user's history and preferences. Be concise but informative.`;

    // Call AI service (simplified for Phase 2B)
    const response = await fetch(`${process.env.LLM_API_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LLM_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.LLM_MODEL || 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const result = await response.json();
    return result.choices[0].message.content;

  } catch (error) {
    console.error('AI response generation failed:', error);
    return `I understand you're asking about "${userMessage}". While I'm having some technical difficulties accessing my full capabilities right now, I'm here to help with your health analysis needs. Could you please rephrase your question or let me know what specific health information you're looking for?`;
  }
}
