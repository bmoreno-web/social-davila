import { prisma } from '@/lib/db/prisma';

interface SendNotificationParams {
  type: 'CHANGES_REQUESTED' | 'APPROVED' | 'REVIEW_REQUESTED' | 'NEW_COMMENT' | 'SYSTEM';
  title: string;
  message: string;
  link?: string;
  clientId?: string;
  clientName?: string;
  recipientEmail?: string;
  recipientName?: string;
  recipientRole?: 'AGENCY' | 'CLIENT' | 'ALL';
  postTitle?: string;
  feedbackText?: string;
}

export async function createAndSendNotification(params: SendNotificationParams) {
  const {
    type,
    title,
    message,
    link = '/parrilla',
    clientId,
    clientName = 'Cliente Davila PM',
    recipientEmail,
    recipientName = 'Equipo Davila PM',
    recipientRole = 'AGENCY',
    postTitle,
    feedbackText
  } = params;

  // 1. Save In-App Notification to Database
  let savedNotif = null;
  try {
    savedNotif = await prisma.notification.create({
      data: {
        clientId: clientId || null,
        recipientRole,
        title,
        message,
        type,
        link,
        read: false
      }
    });
  } catch (err) {
    console.error('Error saving in-app notification in DB:', err);
  }

  // 2. Prepare & Send Email Notification
  try {
    await sendBrandedEmail({
      to: recipientEmail,
      recipientName,
      title,
      message,
      link,
      type,
      clientName,
      postTitle,
      feedbackText
    });
  } catch (err) {
    console.error('Error sending email notification:', err);
  }

  return savedNotif;
}

async function sendBrandedEmail(data: {
  to?: string;
  recipientName: string;
  title: string;
  message: string;
  link: string;
  type: string;
  clientName: string;
  postTitle?: string;
  feedbackText?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.NOTIFICATION_FROM_EMAIL || 'notificaciones@davilapm.com';
  const targetEmail = data.to || process.env.AGENCY_NOTIFICATION_EMAIL || 'ddigital@davilaweb.com';

  const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
  const fullActionUrl = data.link.startsWith('http') ? data.link : `${baseUrl}${data.link}`;

  const typeBadges: Record<string, { label: string; color: string; bg: string }> = {
    CHANGES_REQUESTED: { label: 'CAMBIOS SOLICITADOS', color: '#f43f5e', bg: '#ffe4e6' },
    APPROVED: { label: 'PUBLICACIÓN APROBADA', color: '#10b981', bg: '#d1fae5' },
    REVIEW_REQUESTED: { label: 'LISTO PARA TU REVISIÓN', color: '#f59e0b', bg: '#fef3c7' },
    NEW_COMMENT: { label: 'NUEVO MENSAJE', color: '#8b5cf6', bg: '#ede9fe' },
    SYSTEM: { label: 'AVISO DEL SISTEMA', color: '#6b7280', bg: '#f3f4f6' }
  };

  const badge = typeBadges[data.type] || typeBadges.SYSTEM;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #07090e; color: #f4f4f5; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #0f121a; border: 1px solid #27272a; border-radius: 16px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%); padding: 30px 24px; text-align: center; }
          .brand { font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: 1px; margin: 0; }
          .sub-brand { font-size: 11px; color: #ddd6fe; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; }
          .content { padding: 32px 24px; }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; background-color: ${badge.bg}; color: ${badge.color}; margin-bottom: 16px; }
          .title { font-size: 20px; font-weight: 700; color: #ffffff; margin-top: 0; margin-bottom: 12px; }
          .message { font-size: 14px; line-height: 1.6; color: #a1a1aa; margin-bottom: 24px; }
          .box { background-color: #181b24; border: 1px solid #27272a; border-radius: 12px; padding: 16px; margin-bottom: 24px; }
          .box-title { font-size: 12px; font-weight: 700; color: #d4d4d8; text-transform: uppercase; margin-bottom: 6px; }
          .box-text { font-size: 14px; color: #e4e4e7; line-height: 1.5; margin: 0; font-style: italic; }
          .button { display: inline-block; padding: 14px 28px; background-color: #7c3aed; color: #ffffff !important; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; text-align: center; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3); }
          .footer { background-color: #0b0d13; padding: 20px; text-align: center; font-size: 11px; color: #71717a; border-top: 1px solid #1f222e; }
        </style>
      </head>
      <body>
        <div className="container" style="max-width: 600px; margin: 0 auto; background-color: #0f121a; border: 1px solid #27272a; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%); padding: 28px 24px; text-align: center;">
            <h1 style="font-size: 22px; font-weight: 800; color: #ffffff; margin: 0;">DAVILA PM</h1>
            <p style="font-size: 11px; color: #ddd6fe; text-transform: uppercase; letter-spacing: 2px; margin: 4px 0 0 0;">Digital Agency Suite • Parrilla de Redes</p>
          </div>
          
          <div style="padding: 32px 24px;">
            <div style="display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; background-color: ${badge.bg}; color: ${badge.color}; margin-bottom: 16px;">
              ${badge.label}
            </div>

            <h2 style="font-size: 19px; font-weight: 700; color: #ffffff; margin-top: 0; margin-bottom: 12px;">
              ${data.title}
            </h2>

            <p style="font-size: 14px; line-height: 1.6; color: #a1a1aa; margin-bottom: 20px;">
              Hola <strong>${data.recipientName}</strong>,<br/>
              ${data.message}
            </p>

            ${data.postTitle ? `
              <div style="background-color: #181b24; border: 1px solid #27272a; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                <div style="font-size: 11px; font-weight: 700; color: #a1a1aa; text-transform: uppercase;">Publicación / Cuenta:</div>
                <div style="font-size: 15px; font-weight: 700; color: #ffffff; margin-top: 4px;">${data.postTitle} (${data.clientName})</div>
                ${data.feedbackText ? `<div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #27272a; font-size: 13px; color: #f43f5e; font-style: italic;"><strong>Observación:</strong> "${data.feedbackText}"</div>` : ''}
              </div>
            ` : ''}

            <div style="text-align: center; margin: 28px 0 12px 0;">
              <a href="${fullActionUrl}" style="display: inline-block; padding: 14px 28px; background-color: #7c3aed; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; text-align: center;">
                Ver en la Plataforma →
              </a>
            </div>
          </div>

          <div style="background-color: #090b10; padding: 20px; text-align: center; font-size: 11px; color: #71717a; border-top: 1px solid #1f222e;">
            © 2026 Davila Publicidad & Marketing — Transformación Digital y Estrategia de Medios
          </div>
        </div>
      </body>
    </html>
  `;

  // If Resend API Key is set, send live email
  if (apiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [targetEmail],
          subject: `[Davila PM] ${data.title} — ${data.clientName}`,
          html: htmlContent
        })
      });
      const result = await response.json();
      console.log('Resend email sent successfully:', result);
      return result;
    } catch (apiErr) {
      console.error('Failed to send via Resend API:', apiErr);
    }
  } else {
    // Log to console in development / staging
    console.log(`[EMAIL NOTIFICATION TO: ${targetEmail}] Subject: [Davila PM] ${data.title} — ${data.clientName}`);
  }
}
