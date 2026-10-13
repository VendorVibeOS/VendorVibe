// All AI traffic goes through a server-side gateway so no API key ever ships inside the PWA.
// Override the URL in-app: More -> Cloud + AI -> "AI Gateway URL" (Cloudflare Worker, Vercel, etc).
const VV_GATEWAY_FALLBACK = "https://vendorvibe-ai.vercel.app/api/ask";

function vvGatewayUrl() {
  try {
    if (typeof cloudConfig === "function") {
      const u = (cloudConfig().aiGatewayUrl || "").trim();
      if (u) return u;
    }
  } catch (e) {}
  return VV_GATEWAY_FALLBACK;
}

const coachBrain = {
  evaluate: async function (query, businessType, metrics) {
    const res = await fetch(vvGatewayUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: query,
        businessType: businessType || "General Business",
        metrics: typeof metrics === "string" ? metrics : JSON.stringify(metrics || {})
      })
    });
    if (!res.ok) throw new Error("gateway " + res.status);
    const data = await res.json();
    if (!data || !data.reply) throw new Error("empty reply");
    return { reply: data.reply };
  }
};

window.coachBrain = coachBrain;
