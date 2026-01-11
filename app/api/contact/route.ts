import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, company, project, budget, timeline, honeypot } = body

    // Honeypot check (anti-spam)
    if (honeypot) {
      return NextResponse.json({ error: 'Spam detected' }, { status: 400 })
    }

    // Validation
    if (!name || !email || !project) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // TODO: Intégrer avec un service email (SendGrid, Resend, etc.)
    // Pour l'instant, on log dans la console (remplacer en production)
    console.log('Contact form submission:', {
      name,
      email,
      company,
      project,
      budget,
      timeline,
      timestamp: new Date().toISOString(),
    })

    // Simuler envoi email (à remplacer par vraie intégration)
    // Exemple avec Resend:
    // import { Resend } from 'resend'
    // const resend = new Resend(process.env.RESEND_API_KEY)
    // await resend.emails.send({
    //   from: 'contact@colorpulsemedia.com',
    //   to: 'hello@colorpulsemedia.com',
    //   subject: `Nouveau contact: ${name}`,
    //   html: `<p><strong>Nom:</strong> ${name}</p>
    //          <p><strong>Email:</strong> ${email}</p>
    //          <p><strong>Entreprise:</strong> ${company}</p>
    //          <p><strong>Projet:</strong> ${project}</p>
    //          <p><strong>Budget:</strong> ${budget}</p>
    //          <p><strong>Timeline:</strong> ${timeline}</p>`,
    // })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
