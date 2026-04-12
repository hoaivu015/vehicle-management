import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"

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
    const { imageUrl, public_id } = await req.json()
    
    // Config from Env
    const cloudName = Deno.env.get('CLOUDINARY_CLOUD_NAME')
    const apiKey = Deno.env.get('CLOUDINARY_API_KEY')
    const apiSecret = Deno.env.get('CLOUDINARY_API_SECRET')

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('Cloudinary config missing in Edge Function secrets')
    }

    // Determine target ID
    let targetPublicId = public_id
    if (!targetPublicId && imageUrl) {
      // Small logic to extract public_id from URL if needed
      // https://res.cloudinary.com/[cloud]/image/upload/v123/inventory/VH-2401-01.jpg
      const parts = imageUrl.split('/')
      const lastPart = parts[parts.length - 1] // VH-2401-01.jpg
      const folderIdx = parts.indexOf('inventory')
      if (folderIdx !== -1) {
        targetPublicId = 'inventory/' + lastPart.split('.')[0]
      } else {
        targetPublicId = lastPart.split('.')[0]
      }
    }

    if (!targetPublicId) {
      throw new Error('No public_id found to delete')
    }

    // Cloudinary Destroy API requires Signature
    const timestamp = Math.round(new Date().getTime() / 1000)
    const signatureTarget = `public_id=${targetPublicId}&timestamp=${timestamp}${apiSecret}`
    
    const hashBuffer = await crypto.subtle.digest(
      "SHA-1",
      new TextEncoder().encode(signatureTarget)
    )
    const signature = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")

    const formData = new FormData()
    formData.append('public_id', targetPublicId)
    formData.append('timestamp', timestamp.toString())
    formData.append('api_key', apiKey)
    formData.append('signature', signature)

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      {
        method: 'POST',
        body: formData,
      }
    )

    const result = await response.json()

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
