export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nowhen.example.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/account", "/cart"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
