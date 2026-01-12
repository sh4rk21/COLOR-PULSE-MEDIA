import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { ContactTemplate } from '@/components/emails/ContactTemplate'

const resend = new Resend(process.env.RESEND_API_KEY)

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

    // Vérifier si la clé API est configurée
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY manquante. Log console uniquement.')
      console.log('Form data:', { name, email, company, project, budget, timeline })
      return NextResponse.json({ success: true, message: 'Simulation (Key missing)' }, { status: 200 })
    }

    try {
      const data = await resend.emails.send({
        // Utiliser 'onboarding@resend.dev' pour tester sans domaine, 
        // ou votre domaine vérifié une fois configuré (ex: 'contact@colorpulsemedia.com')
        from: 'Color Pulse Media Website <onboarding@resend.dev>',
        to: ['publishing@eldorado-consulting.com'], // Votre email personnel pour recevoir les tests
        replyTo: email, // Pour répondre directement au client
        subject: `Nouveau contact : ${name} (${company || 'Particulier'})`,
        react: <ContactTemplate name={name} email={email} company={company} project={project} budget={budget} timeline={timeline} />,
      })

      if (data.error) {
        console.error('Resend error:', data.error)
        return NextResponse.json({ error: data.error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true }, { status: 200 })
    } catch (emailError: any) {
      console.error('Resend send error:', emailError)
      return NextResponse.json({ error: emailError.message || 'Error sending email' }, { status: 500 })
    }

  } catch (error: any) {
    console.error('Contact form error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}