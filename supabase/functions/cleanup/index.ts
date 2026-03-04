/**
 * Cleanup Job
 * 
 * Deletes expired mix_sessions and old rate_limits records.
 * Triggered via pg_cron or manual invocation.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { jsonResponse, corsResponse } from "../_shared/security-headers.ts";
import { internalError, methodNotAllowed } from "../_shared/error-response.ts";
import { logInfo, logError, generateRequestId } from "../_shared/structured-logger.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse();
  if (req.method !== "POST") return methodNotAllowed();

  const requestId = generateRequestId();
  const startTime = Date.now();

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const now = new Date().toISOString();

    // 1. Mark expired sessions
    const { count: expiredSessions } = await supabase
      .from("mix_sessions")
      .update({ status: "expired" })
      .eq("status", "active")
      .lt("expires_at", now)
      .select("*", { count: "exact", head: true });

    // 2. Delete rate limit records older than 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: deletedRateLimits } = await supabase
      .from("rate_limits")
      .delete()
      .lt("created_at", oneHourAgo)
      .select("*", { count: "exact", head: true });

    logInfo("Cleanup completed", {
      requestId,
      endpoint: "cleanup",
      status: 200,
      latencyMs: Date.now() - startTime,
      expiredSessions: expiredSessions ?? 0,
      deletedRateLimits: deletedRateLimits ?? 0,
    });

    return jsonResponse({
      status: "ok",
      expiredSessions: expiredSessions ?? 0,
      deletedRateLimits: deletedRateLimits ?? 0,
      timestamp: new Date().toISOString(),
    }, 200);
  } catch (err) {
    logError("Cleanup failed", { requestId, endpoint: "cleanup", status: 500, latencyMs: Date.now() - startTime });
    return internalError();
  }
});
