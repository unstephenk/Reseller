export function buildFacebookMarketplaceSearchUrl(query: string) {
  const q = query.trim();
  const url = new URL("https://www.facebook.com/marketplace/search");
  if (q) url.searchParams.set("query", q);
  return url.toString();
}

export function buildEbaySoldSearchUrl(query: string) {
  const q = query.trim();
  const url = new URL("https://www.ebay.com/sch/i.html");
  if (q) url.searchParams.set("_nkw", q);
  url.searchParams.set("LH_Sold", "1");
  url.searchParams.set("LH_Complete", "1");
  return url.toString();
}
