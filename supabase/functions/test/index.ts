// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/v135/@supabase/functions-js@2.3.1/src/edge-runtime.d.ts" />
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1"
import {multiParser, FormFile} from 'https://deno.land/x/multiparser@0.114.0/mod.ts'

console.log("Hello from Functions!")

Deno.serve(async (req) => {

  const authHeader = req.headers.get('Authorization')!
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } }
  )

  const form = await multiParser(req);
  console.log("Form data:", form);

  if (!form) {
    console.log("No file found")
    return new Response(JSON.stringify({success: false, error: 'no file found'}), {
      headers: {"Content-Type": "application/json"},
      status: 400
    });
  }

  const audio: FormFile = form.files.file as FormFile;
  console.log("Audio file:", audio);

  const token = authHeader.replace('Bearer ', '')
  const { data: { user } } = await supabaseClient.auth.getUser(token)

  const response = {
    message: `Hello ${user?.id}! You've sent the file "${audio.contentType}."`,
  }

  return new Response(
    JSON.stringify(response),
    { headers: { "Content-Type": "application/json" } },
  )
  
})