import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: "L'e-mail et le code sont requis." }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Configuration Supabase incomplète côté serveur." }, { status: 500 });
    }

    // Client admin Supabase
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // 1. Vérifie si le code OTP existe et n'est pas expiré
    const { data: otpData, error: otpError } = await supabaseAdmin
      .from('user_otps')
      .select('*')
      .eq('email', email)
      .eq('code', code.trim())
      .single();

    if (otpError || !otpData) {
      return NextResponse.json({ error: "Code de vérification incorrect ou expiré." }, { status: 400 });
    }

    const isExpired = new Date(otpData.expires_at) < new Date();
    if (isExpired) {
      await supabaseAdmin.from('user_otps').delete().eq('email', email);
      return NextResponse.json({ error: "Code de vérification expiré." }, { status: 400 });
    }

    // 2. Supprime l'OTP utilisé (sécurité)
    await supabaseAdmin.from('user_otps').delete().eq('email', email);

    // 3. Assurer que l'utilisateur existe dans Supabase Auth (le créer si absent)
    try {
      await supabaseAdmin.auth.admin.createUser({
        email: email,
        email_confirm: true,
      });
    } catch (e) {
      // Si l'utilisateur existe déjà, l'API lèvera une erreur que l'on ignore
    }

    // 4. Générer le lien de connexion sécurisé (magiclink)
    // On utilise NEXT_PUBLIC_SITE_URL (variable de déploiement) en priorité,
    // puis le header origin (fiable en production), puis localhost en fallback dev.
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
      || request.headers.get('origin')
      || 'http://localhost:3000';
    const redirectTo = `${siteUrl.replace(/\/$/, '')}/`;

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo,
      },
    });

    if (linkError || !linkData?.properties?.action_link) {
      throw new Error(linkError?.message || "Impossible de générer le lien de connexion.");
    }

    // Renvoie le lien de connexion à rediriger côté client
    return NextResponse.json({ actionLink: linkData.properties.action_link });
  } catch (error: any) {
    console.error("Erreur verify-otp :", error);
    return NextResponse.json({ error: error.message || "Erreur lors de la validation du code." }, { status: 500 });
  }
}
