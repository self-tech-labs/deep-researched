import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

const suggestionSchema = z.object({
  message: z.string().min(10, 'Suggestion must be at least 10 characters').max(1000, 'Suggestion must be less than 1000 characters'),
  email: z.string().email('Invalid email format').optional(),
  name: z.string().max(100).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Check rate limit for suggestions
    const rateLimitResponse = await checkRateLimit(request, 'submit');
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    
    // Validate input
    const validationResult = suggestionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input', 
          details: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        },
        { status: 400 }
      );
    }

    const { message, email, name } = validationResult.data;

    // Prepare email content
    const emailSubject = 'New Suggestion - Deep Research Archive';
    const emailBody = `
New suggestion received from Deep Research Archive:

From: ${name || 'Anonymous'} ${email ? `(${email})` : ''}
IP: ${request.headers.get('x-forwarded-for') || 'unknown'}
Time: ${new Date().toISOString()}

Message:
${message}

---
Sent from Deep Research Archive
`;

    // For development/demo purposes, we'll use a simple email service
    // In production, you would use a service like Resend, SendGrid, or Nodemailer
    const emailData = {
      to: 'info@ritsl.com',
      subject: emailSubject,
      text: emailBody,
      from: email || 'noreply@deep-research.com',
      replyTo: email || undefined,
    };

    try {
      // Mock email sending for now - replace with actual email service
      console.log('Email would be sent:', emailData);
      
      // If you want to use Resend (recommended for Vercel), install it and use:
      // const resend = new Resend(process.env.RESEND_API_KEY);
      // await resend.emails.send(emailData);
      
      // For now, we'll simulate success
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return NextResponse.json({ 
        success: true, 
        message: 'Suggestion sent successfully!' 
      }, { status: 200 });
      
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      return NextResponse.json(
        { error: 'Failed to send suggestion. Please try again later.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error processing suggestion:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to process suggestion' },
      { status: 500 }
    );
  }
} 