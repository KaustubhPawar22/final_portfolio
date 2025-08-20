import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { z } from 'zod'

// Validation schema (includes hardcoded subject from frontend)
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'), // This will be hardcoded from frontend
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000),
})

// Simple rate limiting
const requestCounts = new Map()
const RATE_LIMIT = 5 // requests per hour
const WINDOW = 3600000 // 1 hour in milliseconds

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const userRequests = requestCounts.get(ip) || []
  
  // Clean old requests
  const recentRequests = userRequests.filter((time: number) => now - time < WINDOW)
  
  if (recentRequests.length >= RATE_LIMIT) {
    return true
  }
  
  recentRequests.push(now)
  requestCounts.set(ip, recentRequests)
  return false
}

// ADDED: Helper function to get client IP (TypeScript compatible)
function getClientIP(request: NextRequest): string {
  // Try multiple headers for IP address
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP.trim()
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP.trim()
  }
  
  return 'unknown'
}

export async function POST(request: NextRequest) {
  try {
    // FIXED: Rate limiting - use helper function instead of request.ip
    const ip = getClientIP(request)
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    
    // Validate input using Zod v4
    const validatedData = contactSchema.parse(body)
    
    // Check if environment variables are set
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Email configuration missing')
      return NextResponse.json(
        { error: 'Server configuration error. Please contact directly via email.' },
        { status: 500 }
      )
    }
    
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    // Verify transporter configuration
    try {
      await transporter.verify()
      console.log('SMTP server is ready to take messages')
    } catch (error) {
      console.error('SMTP verification failed:', error)
      return NextResponse.json(
        { error: 'Email service is currently unavailable. Please try again later.' },
        { status: 503 }
      )
    }

    // Email options with portfolio-specific styling
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: `🗨️New ${validatedData.subject}`, // Add icon to recognize portfolio emails
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #e91e63, #ad1457); color: white; padding: 25px; text-align: center;">
            <h1 style="margin: 0; font-size: 26px; font-weight: 600;">✨ New Portfolio Contact</h1>
            <p style="margin: 8px 0 0 0; opacity: 0.95; font-size: 16px;">From kaustubhpawar.com</p>
            <div style="margin-top: 15px; padding: 10px; background: rgba(255,255,255,0.2); border-radius: 8px; display: inline-block;">
              <span style="font-size: 14px; font-weight: 500;">🎯 ${validatedData.subject}</span>
            </div>
          </div>
          
          <div style="padding: 30px;">
            <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 25px; border-left: 5px solid #e91e63;">
              <h2 style="margin: 0 0 20px 0; color: #333; font-size: 20px; font-weight: 600;">👤 Contact Information</h2>
              <div style="display: grid; gap: 12px;">
                <p style="margin: 0; padding: 8px 0; border-bottom: 1px solid #e0e0e0;"><strong style="color: #555; width: 80px; display: inline-block;">Name:</strong> <span style="color: #333;">${validatedData.name}</span></p>
                <p style="margin: 0; padding: 8px 0;"><strong style="color: #555; width: 80px; display: inline-block;">Email:</strong> <a href="mailto:${validatedData.email}" style="color: #e91e63; text-decoration: none; font-weight: 500;">${validatedData.email}</a></p>
              </div>
            </div>
            
            <div style="background: white; padding: 25px; border-radius: 10px; border: 2px solid #e91e63; margin-bottom: 25px; position: relative;">
              <div style="position: absolute; top: -10px; left: 20px; background: white; padding: 0 10px; color: #e91e63; font-weight: 600; font-size: 14px;">💬 MESSAGE</div>
              <div style="line-height: 1.8; color: #444; white-space: pre-wrap; font-size: 16px; margin-top: 10px;">${validatedData.message}</div>
            </div>

            <div style="background: linear-gradient(45deg, #f0f0f0, #fafafa); padding: 20px; border-radius: 10px; text-align: center;">
              <p style="margin: 0; color: #666; font-size: 14px;">
                <strong>📅 Received:</strong> ${new Date().toLocaleString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZone: 'Asia/Kolkata'
                })} IST
              </p>
              <p style="margin: 8px 0 0 0; color: #888; font-size: 12px;">
                💻 Sent via Portfolio Contact Form • IP: ${ip}
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
        🌟 PORTFOLIO CONTACT
        
        Subject: ${validatedData.subject}
        Name: ${validatedData.name}
        Email: ${validatedData.email}
        
        Message:
        ${validatedData.message}
        
        ---
        📅 Received: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })} IST
        💻 From: kaustubhpawar.com contact form
        🌍 IP: ${ip}
      `
    }

    // Send email
    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully:', info.messageId)

    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        message: 'Message sent successfully!',
        messageId: info.messageId 
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Contact form error:', error)
    
    // Handle Zod validation errors (v4 compatible)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: error.issues // Zod v4 uses 'issues' instead of 'errors'
        },
        { status: 400 }
      )
    }

    // FIXED: Handle other errors with proper type casting
    return NextResponse.json(
      { 
        error: 'Failed to send message. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined 
      },
      { status: 500 }
    )
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to send contact messages.' },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to send contact messages.' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to send contact messages.' },
    { status: 405 }
  )
}
