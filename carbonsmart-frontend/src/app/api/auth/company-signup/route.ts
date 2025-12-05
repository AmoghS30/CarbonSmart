import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { companyName, gstin, email, password } = await request.json()

    // Validation
    if (!companyName || !gstin || !email || !password) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate GSTIN format (15 characters alphanumeric)
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
    if (!gstinRegex.test(gstin)) {
      return NextResponse.json(
        { message: 'Invalid GSTIN format' },
        { status: 400 }
      )
    }

    // Check if company already exists
    // @ts-ignore - Company model will be available after prisma generate
    const existingCompany = await prisma.company?.findFirst({
      where: {
        OR: [{ companyName }, { gstin }, { email }],
      },
    })

    if (existingCompany) {
      return NextResponse.json(
        { message: 'Company name, GSTIN, or email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create company
    // @ts-ignore - Company model will be available after prisma generate
    const company = await prisma.company?.create({
      data: {
        companyName,
        gstin,
        email,
        password: hashedPassword,
        profile: {
          create: {
            displayName: companyName,
          },
        },
      },
      include: {
        profile: true,
      },
    })

    // Remove password from response
    const { password: _, ...companyWithoutPassword } = company

    return NextResponse.json({
      message: 'Company registered successfully',
      company: companyWithoutPassword,
    })
  } catch (error) {
    console.error('Company signup error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
