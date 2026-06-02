export function createMercariShopsClient() {
  return {
    endpoint: process.env.MERCARI_SHOPS_API_ENDPOINT,
    hasToken: Boolean(process.env.MERCARI_SHOPS_ACCESS_TOKEN)
  };
}
