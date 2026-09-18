export async function fetchLtaDataMall(_endpoint: string): Promise<unknown> {
  const accountKey = process.env.LTA_ACCOUNT_KEY

  if (!accountKey) {
    throw new Error('LTA_ACCOUNT_KEY is not set')
  }

  // Example header format for DataMall requests: { AccountKey: process.env.LTA_ACCOUNT_KEY }
  throw new Error('LTA DataMall client stub not implemented yet')
}
