
// Mock for Prisma client
export const prisma = {
  user: {
    findUnique: jest.fn().mockResolvedValue({
      id: 'test-user-123',
      email: 'test@example.com',
      healthAssessments: [],
      zepSessions: []
    }),
    create: jest.fn().mockResolvedValue({
      id: 'test-user-123',
      email: 'test@example.com'
    }),
    update: jest.fn().mockResolvedValue({
      id: 'test-user-123',
      email: 'test@example.com'
    }),
    findFirst: jest.fn().mockResolvedValue({
      id: 'test-user-123',
      email: 'test@example.com'
    }),
    upsert: jest.fn().mockResolvedValue({
      id: 'test-user-123',
      email: 'test@example.com'
    })
  },
  healthAssessment: {
    create: jest.fn().mockResolvedValue({
      id: 'assessment-123',
      userId: 'test-user-123',
      assessmentType: 'comprehensive',
      overallScore: 85,
      memoryEnhanced: true,
      zepSessionId: 'zep-session-123',
      createdAt: new Date(),
      updatedAt: new Date()
    }),
    findFirst: jest.fn().mockResolvedValue({
      id: 'assessment-123',
      userId: 'test-user-123',
      zepSessionId: 'zep-session-123',
      layerProgress: { layer1: true, layer2: false, layer3: false }
    }),
    findMany: jest.fn().mockResolvedValue([]),
    update: jest.fn().mockResolvedValue({
      id: 'assessment-123',
      userId: 'test-user-123'
    })
  },
  userEngagementAnalytics: {
    create: jest.fn().mockResolvedValue({
      id: 'engagement-123',
      assessmentId: 'assessment-123',
      userId: 'test-user-123',
      layerTransitions: []
    }),
    findFirst: jest.fn().mockResolvedValue({
      id: 'engagement-123',
      assessmentId: 'assessment-123',
      userId: 'test-user-123',
      layerTransitions: []
    }),
    update: jest.fn().mockResolvedValue({
      id: 'engagement-123',
      assessmentId: 'assessment-123',
      userId: 'test-user-123'
    })
  },
  userMemoryPreferences: {
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({
      id: 'pref-123',
      userId: 'test-user-123',
      preferredDetailLevel: 'high',
      communicationStyle: 'detailed',
      averageSessionTime: 450,
      completionRate: 0.85,
      createdAt: new Date(),
      updatedAt: new Date()
    }),
    update: jest.fn().mockResolvedValue({
      id: 'pref-123',
      userId: 'test-user-123'
    }),
    upsert: jest.fn().mockResolvedValue({
      id: 'pref-123',
      userId: 'test-user-123'
    })
  },
  zepSession: {
    create: jest.fn().mockResolvedValue({
      id: 'zep-session-123',
      sessionId: 'zep-session-123',
      userId: 'test-user-123'
    }),
    findFirst: jest.fn().mockResolvedValue({
      id: 'zep-session-123',
      sessionId: 'zep-session-123',
      userId: 'test-user-123'
    }),
    update: jest.fn().mockResolvedValue({
      id: 'zep-session-123',
      sessionId: 'zep-session-123',
      userId: 'test-user-123'
    }),
    upsert: jest.fn().mockResolvedValue({
      id: 'zep-session-123',
      sessionId: 'zep-session-123',
      userId: 'test-user-123'
    })
  },
  auditLog: {
    create: jest.fn().mockResolvedValue({
      id: 'audit-123',
      action: 'health_analysis_stored',
      userId: 'test-user-123'
    })
  }
};
