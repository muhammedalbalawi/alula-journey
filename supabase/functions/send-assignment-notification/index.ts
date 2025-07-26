import React from 'npm:react@18.3.1'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { TouristAssignmentEmail } from './_templates/tourist-assignment.tsx'
import { GuideAssignmentEmail } from './_templates/guide-assignment.tsx'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const { touristId, guideId, tourName, startDate, endDate } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get tourist email and profile
    const { data: touristData, error: touristError } = await supabase
      .from('profiles')
      .select('full_name, contact_info')
      .eq('id', touristId)
      .single()

    if (touristError) throw touristError

    // Get guide email and profile  
    const { data: guideData, error: guideError } = await supabase
      .from('guides')
      .select('name, email')
      .eq('id', guideId)
      .single()

    if (guideError) throw guideError

    // Send email to tourist
    const touristHtml = await renderAsync(
      React.createElement(TouristAssignmentEmail, {
        touristName: touristData.full_name || 'Tourist',
        guideName: guideData.name,
        guideEmail: guideData.email,
        tourName,
        startDate,
        endDate
      })
    )

    await resend.emails.send({
      from: 'AlulaJourney <onboarding@resend.dev>',
      to: [touristData.contact_info],
      subject: 'Tour Guide Assigned - AlulaJourney',
      html: touristHtml,
    })

    // Send email to guide
    const guideHtml = await renderAsync(
      React.createElement(GuideAssignmentEmail, {
        guideName: guideData.name,
        touristName: touristData.full_name || 'Tourist',
        touristEmail: touristData.contact_info,
        tourName,
        startDate,
        endDate
      })
    )

    await resend.emails.send({
      from: 'AlulaJourney <onboarding@resend.dev>',
      to: [guideData.email],
      subject: 'New Tour Assignment - AlulaJourney',
      html: guideHtml,
    })

    console.log('Assignment notification emails sent successfully')

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  } catch (error) {
    console.error('Error sending assignment notifications:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    )
  }
})