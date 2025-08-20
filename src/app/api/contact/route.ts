import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { z } from 'zod'

// Validation schema
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000),
})

// Rate limiting
const requestCounts = new Map()
const RATE_LIMIT = 5
const WINDOW = 3600000

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const userRequests = requestCounts.get(ip) || []
  const recentRequests = userRequests.filter((time: number) => now - time < WINDOW)
  
  if (recentRequests.length >= RATE_LIMIT) {
    return true
  }
  
  recentRequests.push(now)
  requestCounts.set(ip, recentRequests)
  return false
}

function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (forwardedFor) return forwardedFor.split(',')[0].trim()
  if (realIP) return realIP.trim()
  if (cfConnectingIP) return cfConnectingIP.trim()
  
  return 'unknown'
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const ip = getClientIP(request)
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const validatedData = contactSchema.parse(body)
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Email configuration missing')
      return NextResponse.json(
        { error: 'Server configuration error. Please contact directly via email.' },
        { status: 500 }
      )
    }
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    // Verify transporter
    await transporter.verify()

    // 1. Send notification email to you
    const notificationOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `🌟 ${validatedData.subject}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #e91e63, #ad1457); color: white; padding: 25px; text-align: center;">
            <h1 style="margin: 0; font-size: 26px;">✨ New Portfolio Contact</h1>
            <p style="margin: 8px 0 0 0; opacity: 0.95;">From kaustubhpawar.com</p>
          </div>
          
          <div style="padding: 30px;">
            <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 25px; border-left: 5px solid #e91e63;">
              <h2 style="margin: 0 0 20px 0; color: #333;">👤 Contact Information</h2>
              <p style="margin: 8px 0;"><strong>Name:</strong> ${validatedData.name}</p>
              <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${validatedData.email}" style="color: #e91e63;">${validatedData.email}</a></p>
              <p style="margin: 8px 0;"><strong>Subject:</strong> ${validatedData.subject}</p>
            </div>
            
            <div style="background: white; padding: 25px; border-radius: 10px; border: 2px solid #e91e63; margin-bottom: 25px;">
              <h3 style="margin: 0 0 15px 0; color: #e91e63;">💬 Message:</h3>
              <div style="line-height: 1.8; color: #444; white-space: pre-wrap;">${validatedData.message}</div>
            </div>

            <div style="background: linear-gradient(45deg, #f0f0f0, #fafafa); padding: 20px; border-radius: 10px; text-align: center;">
              <p style="margin: 0; color: #666; font-size: 14px;">
                📅 ${new Date().toLocaleString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZone: 'Asia/Kolkata'
                })} IST • 🌍 IP: ${ip}
              </p>
            </div>
          </div>
        </div>
      `
    }

    // 2. Send auto-reply to visitor
    const autoReplyOptions = {
      from: process.env.EMAIL_USER,
      to: validatedData.email,
      subject: '✅ Thank You for Contacting Kaustubh Pawar',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #e91e63, #ad1457); color: white; padding: 25px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 600;">Thanks for Reaching Out!</h1>
            <p style="margin: 8px 0 0 0; opacity: 0.95; font-size: 16px;">I've received your message</p>
          </div>
          
          <div style="padding: 30px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Hi <strong>${validatedData.name}</strong>,
            </p>
            
            <p style="color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
              Thank you for your message! I appreciate you taking the time to connect with me through my portfolio.
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #e91e63; margin: 20px 0;">
              <h3 style="color: #333; margin: 0 0 10px 0; font-size: 16px;">⏰ What happens next?</h3>
              <ul style="color: #555; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
                <li>I'll review your message within <strong>24-48 hours</strong></li>
                <li>You'll receive a personalized response from me</li>
                <li>For project inquiries, I'll include relevant portfolio examples</li>
                <li>For collaboration opportunities, I'll share my availability</li>
              </ul>
            </div>

            <p style="color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
              In the meantime, feel free to explore more of my work:
            </p>

            <div style="text-align: center; margin: 25px 0;">
              <a href="https://linkedin.com/in/kaustubh-pawar-344a31277" style="display: inline-block; margin: 5px; padding: 10px 20px; background: #0077b5; color: white; text-decoration: none; border-radius: 6px; font-size: 14px;">🔗 LinkedIn</a>
              <a href="https://github.com/KaustubhPawar22" style="display: inline-block; margin: 5px; padding: 10px 20px; background: #333; color: white; text-decoration: none; border-radius: 6px; font-size: 14px;">📱 GitHub</a>
              <a href="https://public.tableau.com/app/profile/kaustubh.pawar22" style="display: inline-block; margin: 5px; padding: 10px 20px; background: #e97627; color: white; text-decoration: none; border-radius: 6px; font-size: 14px;">📊 Tableau</a>
            </div>

            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              Best regards,<br>
              <strong style="color: #333;">Kaustubh Pawar</strong><br>
              <span style="color: #888;">Data Analytics & Business Intelligence Professional</span><br>
              <span style="color: #888;">📧 kaustubhpawar500@gmail.com</span>
            </p>
          </div>
          
          <div style="background: #f1f3f4; padding: 20px; text-align: center; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 12px; margin: 0;">
              📧 This is an automated response • Visit <a href="https://kaustubhpawar.com" style="color: #e91e63; text-decoration: none;">kaustubhpawar.com</a> for more
            </p>
          </div>
        </div>
      `,
      text: `
Hi ${validatedData.name},

Thank you for your message regarding "${validatedData.subject}"! I appreciate you taking the time to connect with me through my portfolio.

What happens next?
• I'll review your message within 24-48 hours
• You'll receive a personalized response from me
• For project inquiries, I'll include relevant portfolio examples
• For collaboration opportunities, I'll share my availability

In the meantime, feel free to explore more of my work:
• LinkedIn: https://linkedin.com/in/kaustubh-pawar-344a31277
• GitHub: https://github.com/KaustubhPawar22
• Tableau: https://public.tableau.com/app/profile/kaustubh.pawar22

Best regards,
Kaustubh Pawar
Data Analytics & Business Intelligence Professional
kaustubhpawar500@gmail.com

---
This is an automated response • Visit https://kaustubhpawar.com
      `
    }

    // Send both emails concurrently for better performance
    const [notificationResult, autoReplyResult] = await Promise.allSettled([
      transporter.sendMail(notificationOptions),
      transporter.sendMail(autoReplyOptions)
    ])

    // Check results
    const notificationSuccess = notificationResult.status === 'fulfilled'
    const autoReplySuccess = autoReplyResult.status === 'fulfilled'

    if (notificationSuccess) {
      console.log('Notification email sent:', notificationResult.value.messageId)
    } else {
      console.error('Notification email failed:', notificationResult.reason)
    }

    if (autoReplySuccess) {
      console.log('Auto-reply sent:', autoReplyResult.value.messageId)
    } else {
      console.error('Auto-reply failed:', autoReplyResult.reason)
    }

    const processingTime = Date.now() - startTime

    return NextResponse.json(
      { 
        success: true, 
        message: notificationSuccess ? 
          'Message sent successfully! You should receive a confirmation email shortly.' :
          'Message received but there was an issue with email delivery. I\'ll still respond manually.',
        processingTime,
        autoReplyStatus: autoReplySuccess ? 'sent' : 'failed'
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Contact form error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Failed to send message. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined 
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    service: 'Portfolio Contact API',
    status: 'operational',
    version: '1.0.0',
    features: ['rate-limiting', 'auto-reply', 'email-notifications']
  })
}
