
// OpenAI Integration for Health AI Analysis
// Production-ready OpenAI client with health-specific prompts

import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API key')
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Health AI specific OpenAI operations
export const healthAI = {
  // Generate health insights based on assessment data
  async generateHealthInsights(assessmentData: any) {
    try {
      const prompt = `
        As a health AI assistant specializing in bioenergetic medicine and Ray Peat's methodology, 
        analyze the following health assessment data and provide insights:

        Assessment Data: ${JSON.stringify(assessmentData, null, 2)}

        Please provide:
        1. Key findings and their significance
        2. Ray Peat-based explanations for metabolic patterns
        3. Actionable recommendations
        4. Areas requiring attention
        5. Positive health indicators

        Format the response as structured JSON with clear categories.
      `

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a health AI assistant specializing in bioenergetic medicine, metabolic health, and Ray Peat methodology. Provide evidence-based insights while being encouraging and actionable.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      })

      return completion.choices[0]?.message?.content
    } catch (error) {
      console.error('OpenAI API error:', error)
      throw new Error('Failed to generate health insights')
    }
  },

  // Generate personalized recommendations
  async generateRecommendations(userProfile: any, assessmentResults: any) {
    try {
      const prompt = `
        Based on the user profile and assessment results, generate personalized health recommendations:

        User Profile: ${JSON.stringify(userProfile, null, 2)}
        Assessment Results: ${JSON.stringify(assessmentResults, null, 2)}

        Focus on:
        1. Nutrition recommendations aligned with Ray Peat principles
        2. Lifestyle modifications for metabolic optimization
        3. Supplement suggestions based on deficiencies
        4. Exercise recommendations for bioenergetic health
        5. Stress management techniques

        Provide practical, actionable advice with scientific rationale.
      `

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a health optimization expert specializing in personalized recommendations based on bioenergetic principles and metabolic health.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.6,
        max_tokens: 1500,
      })

      return completion.choices[0]?.message?.content
    } catch (error) {
      console.error('OpenAI API error:', error)
      throw new Error('Failed to generate recommendations')
    }
  },

  // Explain medical terminology with Ray Peat context
  async explainTerm(term: string, context?: string) {
    try {
      const prompt = `
        Explain the medical/health term "${term}" in simple language, 
        ${context ? `in the context of: ${context}` : ''}
        
        Include:
        1. Simple definition
        2. Why it matters for health
        3. Ray Peat's perspective if relevant
        4. Practical implications

        Keep it concise but informative.
      `

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a health educator who explains complex medical concepts in simple, accessible language while incorporating bioenergetic principles.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.5,
        max_tokens: 500,
      })

      return completion.choices[0]?.message?.content
    } catch (error) {
      console.error('OpenAI API error:', error)
      throw new Error('Failed to explain term')
    }
  },

  // Generate curiosity gaps for progressive disclosure
  async generateCuriosityGap(topic: string, userLevel: 'beginner' | 'intermediate' | 'advanced') {
    try {
      const prompt = `
        Create an engaging "curiosity gap" statement about ${topic} for a ${userLevel} level user.
        
        The curiosity gap should:
        1. Spark interest and make them want to learn more
        2. Be surprising or counterintuitive
        3. Be scientifically accurate
        4. Relate to practical health benefits
        5. Be 1-2 sentences maximum

        Examples:
        - "Did you know that your body temperature reveals more about your metabolism than your weight?"
        - "The color of your urine can predict your thyroid function better than most blood tests."
      `

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a health content creator who specializes in creating engaging, curiosity-driven content that makes people want to learn more about their health.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 200,
      })

      return completion.choices[0]?.message?.content
    } catch (error) {
      console.error('OpenAI API error:', error)
      throw new Error('Failed to generate curiosity gap')
    }
  },
}

export default openai
