import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// DEV ONLY - bypasses magic link for local testing
// This uses the service role key to create a session directly

export async function GET(request: Request) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  // Create admin client with service role
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  // Check if user exists
  const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers()
  
  if (listError) {
    return NextResponse.json({ error: listError.message }, { status: 500 })
  }

  let user = users.users.find((u) => u.email === email)

  // Create user if doesn't exist
  if (!user) {
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
    })

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }

    user = newUser.user
  }

  // Generate magic link (this creates a valid session token)
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email,
  })

  if (linkError) {
    return NextResponse.json({ error: linkError.message }, { status: 500 })
  }

  // Redirect to the auth callback with the token
  const redirectUrl = new URL('/auth/callback', request.url)
  redirectUrl.searchParams.set('token_hash', linkData.properties.hashed_token)
  redirectUrl.searchParams.set('type', 'magiclink')

  return NextResponse.redirect(redirectUrl)
}
