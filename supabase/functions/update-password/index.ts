// Follow Supabase Edge Function pattern
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the caller's JWT to verify they are an ADMIN
    const authHeader = req.headers.get('Authorization')!
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    // Check if the caller is an ADMIN in our 'users' table
    const { data: profile } = await supabaseClient
      .from('users')
      .select('role')
      .eq('email', user.email)
      .single()

    if (profile?.role !== 'ADMIN') {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      })
    }

    // Parse request body
    const { userId, newPassword, email } = await req.json()

    if (!newPassword || newPassword.length < 6) {
      return new Response(JSON.stringify({ error: 'Password too short' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // 1. Update Supabase Auth Password using Admin API
    // We prefer userId if available, else use email to find user
    let targetUserId = userId;
    if (!targetUserId && email) {
       // Search for user by email if ID not provided
       const { data: users, error: listError } = await supabaseClient.auth.admin.listUsers()
       if (listError) throw listError;
       const foundUser = users.users.find(u => u.email === email);
       if (foundUser) targetUserId = foundUser.id;
    }

    if (!targetUserId) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      })
    }

    const { error: updateError } = await supabaseClient.auth.admin.updateUserById(
      targetUserId,
      { password: newPassword }
    )

    if (updateError) throw updateError

    // 2. Sync to 'users' and 'employees' tables in our public schema
    await supabaseClient
      .from('users')
      .update({ password: newPassword })
      .eq('email', email)

    await supabaseClient
      .from('employees')
      .update({ password: newPassword })
      .eq('email', email)

    return new Response(
      JSON.stringify({ message: 'Password updated successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
