// deno-lint-ignore-file no-explicit-any
import { supabase } from "../services/db.ts";
import { Context } from "jsr:@oak/oak";

async function signup(ctx: Context) {
  const registerData = await ctx.request.body.json();

  const validation = validateSignupInput(registerData);
  if (!validation.valid) {
    ctx.response.status = 400;
    ctx.response.body = { error: validation.message };
    return;
  }

  const { data, error } = await registerUser(
    registerData.email,
    registerData.password1,
  );

  if (error) {
    ctx.response.status = 500;
    ctx.response.body = { error: error.message };
    return;
  }

  ctx.response.status = 201;
  ctx.response.body = { data };
}
function validateSignupInput(input: any): { valid: boolean; message?: string } {
  if (!input.email || !input.password1 || !input.password2) {
    return { valid: false, message: "Missing fields" };
  }

  if (input.password1 !== input.password2) {
    return { valid: false, message: "Passwords don't match" };
  }

  return { valid: true };
}

async function registerUser(email: string, password: string) {
  return await supabase.auth.signUp({ email, password });
}

async function login(ctx: Context) {
  const loginData = await ctx.request.body.json();
  console.log(loginData);
  const { data, error } = await loginUser(
    loginData.email,
    loginData.password,
  );

  if (error) {
    ctx.response.status = 500;
    ctx.response.body = { error: error.message };
    return;
  }

  ctx.response.status = 200;
  ctx.response.body = { data };
  ctx.request.headers.get("authorization")?.replace(
    "Bearer ",
    `${data.session.access_token}`,
  );
  console.log(data.session.access_token);
}

async function loginUser(email: string, password: string) {
  return await supabase.auth.signInWithPassword({ email, password });
}

async function googleLogin() {
  await supabase.auth.signInWithOAuth({ provider: "google" });
}

export { googleLogin, login, signup };
