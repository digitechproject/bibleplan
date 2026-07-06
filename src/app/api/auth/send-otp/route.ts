import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "L'adresse e-mail est requise." }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    const brevoApiKey = process.env.BREVO_API_KEY || '';

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Configuration Supabase incomplète côté serveur." }, { status: 500 });
    }

    if (!brevoApiKey || brevoApiKey.startsWith('mettez_ici')) {
      return NextResponse.json({ error: "Clé d'API Brevo non configurée dans .env.local." }, { status: 500 });
    }

    // Client admin Supabase (contourne RLS pour stocker les OTP)
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // 1. Génère un code OTP à 6 chiffres
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Valable 10 minutes

    // 2. Nettoie les anciens OTP pour cet e-mail et insère le nouveau
    await supabaseAdmin.from('user_otps').delete().eq('email', email);
    const { error: insertError } = await supabaseAdmin.from('user_otps').insert({
      email,
      code,
      expires_at: expiresAt.toISOString(),
    });

    if (insertError) throw insertError;

    // 3. Envoie l'e-mail via Brevo API
    const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': brevoApiKey,
        'content-type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: "Défi Bible 2026 - 2030", email: "noreply@defibible.fr" },
        to: [{ email: email }],
        subject: `${code} est votre code de connexion`,
        htmlContent: `
          <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 500px; margin: auto; border: 1px solid #eee; border-radius: 12px;">
            <h2 style="color: #d97706; text-align: center;">Connexion à Défi Bible 2026 - 2030</h2>
            <p>Bonjour,</p>
            <p>Voici votre code de vérification pour vous connecter à votre espace de lecture biblique :</p>
            <div style="background-color: #fef3c7; border: 1.5px dashed #d97706; border-radius: 8px; padding: 15px; text-align: center; margin: 20px 0;">
              <span style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #b45309;">${code}</span>
            </div>
            <p style="font-size: 12px; color: #666;">Ce code est confidentiel et valable pendant 10 minutes.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 10px; color: #999; text-align: center;">Si vous n'avez pas demandé ce code, vous pouvez ignorer cet e-mail.</p>
          </div>
        `,
      }),
    });

    if (!brevoResponse.ok) {
      const errorText = await brevoResponse.text();
      throw new Error(`Erreur Brevo : ${errorText}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erreur send-otp :", error);
    return NextResponse.json({ error: error.message || "Erreur lors de l'envoi de l'e-mail." }, { status: 500 });
  }
}
