// IMPORTANT: This file is temporarily disabled to allow for a Neon-only deployment.
// The Supabase client initialization has been commented out.
// Re-enable and adapt this logic when Supabase integration is resumed.

// import { createBrowserClient, createServerClient, type CookieOptions } from '@supabase/ssr'
// import { cookies } from 'next/headers'

// export const createClient = () =>
//   // createBrowserClient(
//   //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   //   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
//   // )

// export const createServer = () => {
//   // const cookieStore = cookies()

//   // return createServerClient(
//   //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   //   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//   //   {
//   //     cookies: {
//   //       get(name: string) {
//   //         return cookieStore.get(name)?.value
//   //       },
//   //       set(name: string, value: string, options: CookieOptions) {
//   //         try {
//   //           cookieStore.set({ name, value, ...options })
//   //         } catch (error) {
//   //           // The `set` method was called from a Server Component.
//   //           // This can be ignored if you have middleware refreshing
//   //           // user sessions.
//   //         }
//   //       },
//   //       remove(name: string, options: CookieOptions) {
//   //         try {
//   //           cookieStore.set({ name, value: '', ...options })
//   //         } catch (error) {
//   //           // The `delete` method was called from a Server Component.
//   //           // This can be ignored if you have middleware refreshing
//   //           // user sessions.
//   //         }
//   //       },
//   //     },
//   //   }
//   // )
// }
