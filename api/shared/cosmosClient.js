// Shared Azure Cosmos DB Client for LIT MSA Challenge
// Optimized for Azure for Students (Free Tier: 1,000 RU/s & 25 GB)

let cosmosClient = null
let database = null
let container = null

const inMemoryStore = {
  members: [],
  articles: [],
  lastSyncedAt: new Date().toISOString(),
}

export async function getCosmosContainer() {
  const endpoint =
    process.env.COSMOS_ENDPOINT || process.env.AZURE_COSMOS_DB_ENDPOINT || process.env.COSMOS_DB_ENDPOINT
  const key =
    process.env.COSMOS_KEY || process.env.AZURE_COSMOS_DB_KEY || process.env.COSMOS_DB_KEY
  const databaseName =
    process.env.COSMOS_DATABASE || process.env.AZURE_COSMOS_DB_DATABASE || 'litknudb'
  const containerName =
    process.env.COSMOS_CONTAINER || process.env.AZURE_COSMOS_DB_CONTAINER || 'members'

  if (!endpoint || !key) {
    return null // In-memory fallback mode
  }

  if (container) return container

  try {
    const { CosmosClient } = await import('@azure/cosmos')
    cosmosClient = new CosmosClient({ endpoint, key })
    const { database: db } = await cosmosClient.databases.createIfNotExists({ id: databaseName })
    database = db
    const { container: c } = await database.containers.createIfNotExists({
      id: containerName,
      partitionKey: { paths: ['/handle'] },
    })
    container = c
    return container
  } catch (err) {
    console.warn('[Azure Cosmos DB] Connection warning, using fallback store:', err.message)
    return null
  }
}

export function getInMemoryStore() {
  return inMemoryStore
}

