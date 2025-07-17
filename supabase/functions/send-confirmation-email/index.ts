import React from 'npm:react@18.3.1'
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { EmailConfirmationTemplate } from './_templates/email-confirmation.tsx'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)
const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET') as string

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const payload = await req.text()
    const headers = Object.fromEntries(req.headers)
    const wh = new Webhook(hookSecret)
    
    const {
      user,
      email_data: { token_hash, email_action_type, redirect_to },
    } = wh.verify(payload, headers) as {
      user: {
        email: string
      }
      email_data: {
        token_hash: string
        email_action_type: string
        redirect_to: string
        site_url: string
      }
    }

    // Build confirmation URL with redirect to alulajourney.icu/confirmed
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const confirmationUrl = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=https://alulajourney.icu/confirmed`

    console.log('Sending confirmation email to:', user.email)
    console.log('Confirmation URL:', confirmationUrl)

    const html = await renderAsync(
      React.createElement(EmailConfirmationTemplate, {
        confirmation_url: confirmationUrl,
        user_email: user.email,
      })
    )

    const { error } = await resend.emails.send({
      from: 'AlulaJourney <onboarding@resend.dev>',
      to: [user.email],
      subject: 'Confirm your email - AlulaJourney',
      html,
    })

    if (error) {
      console.error('Error sending email:', error)
      throw error
    }

    console.log('Confirmation email sent successfully')

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in send-confirmation-email function:', error)
    return new Response(
      JSON.stringify({
        error: {
          message: error.message,
        },
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
})