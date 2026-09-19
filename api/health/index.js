import { getCosmosContainer } from '../shared/cosmosClient.js'

export default async function (context, req) {
  const container = await getCosmosContainer()
  const isCosmosConnected = !!container

  context.res = {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: {
      status: 'healthy',
      platform: 'Azure Static Web Apps + Azure Functions (Node.js)',
      service: 'LIT × MSA 250 Challenge Cloud API',
      cosmosDbConnected: isCosmosConnected,
      database: isCosmosConnected ? 'Azure Cosmos DB (NoSQL Free Tier 1,000 RU/s & 25GB)' : 'In-Memory / Local Cache Mode',
      timestamp: new Date().toISOString(),
    },
  }
}

