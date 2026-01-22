import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("redirectTo") || "/";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Check if profile exists, if not create one
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", data.user.id)
        .single();

      if (!existingProfile) {
        // Extract GitHub username from user metadata
        const githubUsername =
          data.user.user_metadata?.user_name ||
          data.user.user_metadata?.preferred_username ||
          data.user.email?.split("@")[0] ||
          "user";

        const avatarUrl = data.user.user_metadata?.avatar_url || null;

        // Create profile
        await supabase.from("profiles").insert({
          id: data.user.id,
          username: githubUsername,
          github_username: githubUsername,
          avatar_url: avatarUrl,
        });
      }

      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
