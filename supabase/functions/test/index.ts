// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/v135/@supabase/functions-js@2.3.1/src/edge-runtime.d.ts" />
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1"
import { multiParser, FormFile } from 'https://deno.land/x/multiparser@0.114.0/mod.ts'

console.log("Hello from Functions!")

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const form = await multiParser(req);
    console.log("Form data:", form);

    if (!form || !form.files.file) {
      throw new Error('No file found');
    }

    const audio: FormFile = form.files.file as FormFile;
    console.log("Audio file:", audio);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabaseClient.auth.getUser(token);

    if (error || !user) {
      throw new Error('User not authenticated');
    }

    const response = {
      message: `Hello ${user.id}! You've sent the file "${audio.filename}."`,
    };

    return new Response(
      JSON.stringify(response),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { "Content-Type": "application/json" }, status: 400 }
    );
  }
});