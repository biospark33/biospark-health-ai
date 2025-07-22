
// AbacusAI Integration for Advanced Health Analytics
// Production-ready AbacusAI client for health model deployment

interface AbacusAIConfig {
  apiKey: string
  baseUrl: string
}

class AbacusAIClient {
  private config: AbacusAIConfig

  constructor() {
    if (!process.env.ABACUSAI_API_KEY) {
      throw new Error('Missing AbacusAI API key')
    }

    this.config = {
      apiKey: process.env.ABACUSAI_API_KEY,
      baseUrl: 'https://api.abacus.ai/api/v0',
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.config.baseUrl}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`AbacusAI API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Health AI specific AbacusAI operations
  async predictHealthRisk(patientData: any) {
    try {
      const response = await this.makeRequest('/predict', {
        method: 'POST',
        body: JSON.stringify({
          deploymentId: process.env.ABACUS_HEALTH_RISK_MODEL_ID,
          data: patientData,
        }),
      })

      return response
    } catch (error) {
      console.error('AbacusAI health risk prediction error:', error)
      throw new Error('Failed to predict health risk')
    }
  }

  async analyzeMetabolicProfile(metabolicData: any) {
    try {
      const response = await this.makeRequest('/predict', {
        method: 'POST',
        body: JSON.stringify({
          deploymentId: process.env.ABACUS_METABOLIC_MODEL_ID,
          data: metabolicData,
        }),
      })

      return response
    } catch (error) {
      console.error('AbacusAI metabolic analysis error:', error)
      throw new Error('Failed to analyze metabolic profile')
    }
  }

  async generatePersonalizedPlan(userProfile: any, healthGoals: any) {
    try {
      const response = await this.makeRequest('/predict', {
        method: 'POST',
        body: JSON.stringify({
          deploymentId: process.env.ABACUS_PERSONALIZATION_MODEL_ID,
          data: {
            profile: userProfile,
            goals: healthGoals,
          },
        }),
      })

      return response
    } catch (error) {
      console.error('AbacusAI personalization error:', error)
      throw new Error('Failed to generate personalized plan')
    }
  }

  async detectAnomalies(healthMetrics: any) {
    try {
      const response = await this.makeRequest('/predict', {
        method: 'POST',
        body: JSON.stringify({
          deploymentId: process.env.ABACUS_ANOMALY_MODEL_ID,
          data: healthMetrics,
        }),
      })

      return response
    } catch (error) {
      console.error('AbacusAI anomaly detection error:', error)
      throw new Error('Failed to detect anomalies')
    }
  }

  async listModels() {
    try {
      const response = await this.makeRequest('/listDeployments')
      return response
    } catch (error) {
      console.error('AbacusAI list models error:', error)
      throw new Error('Failed to list models')
    }
  }

  async getModelStatus(deploymentId: string) {
    try {
      const response = await this.makeRequest(`/getDeployment?deploymentId=${deploymentId}`)
      return response
    } catch (error) {
      console.error('AbacusAI model status error:', error)
      throw new Error('Failed to get model status')
    }
  }
}

// Health AI specific AbacusAI operations
export const healthAI = {
  client: new AbacusAIClient(),

  async runHealthAssessment(assessmentData: any) {
    try {
      // Run multiple models in parallel for comprehensive analysis
      const [riskPrediction, metabolicAnalysis, anomalies] = await Promise.allSettled([
        this.client.predictHealthRisk(assessmentData),
        this.client.analyzeMetabolicProfile(assessmentData.metabolicData),
        this.client.detectAnomalies(assessmentData.metrics),
      ])

      return {
        riskPrediction: riskPrediction.status === 'fulfilled' ? riskPrediction.value : null,
        metabolicAnalysis: metabolicAnalysis.status === 'fulfilled' ? metabolicAnalysis.value : null,
        anomalies: anomalies.status === 'fulfilled' ? anomalies.value : null,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      console.error('Health assessment error:', error)
      throw new Error('Failed to run health assessment')
    }
  },

  async generateInsights(analysisResults: any, userContext: any) {
    try {
      const insights = await this.client.generatePersonalizedPlan(userContext, {
        analysisResults,
        preferences: userContext.preferences,
        goals: userContext.healthGoals,
      })

      return insights
    } catch (error) {
      console.error('Insight generation error:', error)
      throw new Error('Failed to generate insights')
    }
  },

  async validateModelHealth() {
    try {
      const models = await this.client.listModels()
      const modelStatuses = await Promise.all(
        models.map((model: any) => this.client.getModelStatus(model.deploymentId))
      )

      return {
        totalModels: models.length,
        activeModels: modelStatuses.filter((status: any) => status.status === 'ACTIVE').length,
        modelStatuses,
      }
    } catch (error) {
      console.error('Model health validation error:', error)
      throw new Error('Failed to validate model health')
    }
  },
}

export default AbacusAIClient
