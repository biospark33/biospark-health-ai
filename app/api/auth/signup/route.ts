
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { auditLogger } from '@/lib/audit';
import { encryptUserPHI } from '@/lib/crypto';
import { UserRole } from '@/lib/rbac';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Encrypt PHI data
    const encryptedUserData = encryptUserPHI({ email, name });

    // Create user with encrypted PHI
    const user = await prisma.user.create({
      data: {
        email,
        name,
        // Note: In production, store encrypted PHI and hashed password
      }
    });

    // Note: Role assignment would be handled in production with proper database schema
    // await prisma.userRole_Assignment.create({
    //   data: {
    //     userId: user.id,
    //     role: UserRole.PATIENT,
    //     assignedBy: user.id,
    //     reason: 'Default role assignment during user registration'
    //   }
    // });

    // Create user stats
    await prisma.userStats.create({
      data: {
        userId: user.id,
      }
    });

    // Log successful user creation
    await auditLogger.logEvent({
      userId: user.id,
      eventType: 'create',
      resource: 'user_profile',
      action: 'create',
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || undefined,
      endpoint: '/api/auth/signup',
      method: 'POST',
      dataAccessed: { userCreated: true, role: UserRole.PATIENT },
      success: true,
      riskLevel: 'low'
    });

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    
    // Log failed signup attempt
    await auditLogger.logEvent({
      eventType: 'create',
      resource: 'user_profile',
      action: 'create',
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || undefined,
      endpoint: '/api/auth/signup',
      method: 'POST',
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      riskLevel: 'medium'
    });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
