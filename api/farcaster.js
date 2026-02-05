export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  
  res.status(200).json({
    accountAssociation: {
      header: "REPLACE_WITH_BASE64_ENCODED_HEADER",
      payload: "REPLACE_WITH_BASE64_ENCODED_PAYLOAD",
      signature: "REPLACE_WITH_BASE64_SIGNATURE"
    },
    frame: {
      version: "1",
      name: "Cadence Base",
      iconUrl: "https://cadence-base.vercel.app/icon-1024x1024.png",
      homeUrl: "https://cadence-base.vercel.app",
      splashImageUrl: "https://cadence-base.vercel.app/splash-200x200.png",
      splashBackgroundColor: "#0a0a0a",
      webhookUrl: "https://cadence-base.vercel.app/api/webhook",
      subtitle: "Build USDC savings on Base",
      description: "Save USDC consistently on Base with reminders and a non-custodial vault. Build your savings habit through consistency and calm design.",
      primaryCategory: "finance",
      tags: ["savings", "defi", "usdc", "base", "finance"],
      heroImageUrl: "https://cadence-base.vercel.app/embed-image.png",
      tagline: "Build consistent USDC savings",
      ogTitle: "Cadence Base - USDC Savings",
      ogDescription: "Save USDC consistently on Base with automated reminders",
      ogImageUrl: "https://cadence-base.vercel.app/embed-image.png"
    }
  });
}
