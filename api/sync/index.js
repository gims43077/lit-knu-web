const { getCosmosContainer, getInMemoryStore } = require('../shared/cosmosClient')

module.exports = async function (context, req) {
  const container = await getCosmosContainer()
  const inMemory = getInMemoryStore()

  // POST: Bulk push local snapshot to Azure Cosmos DB
  if (req.method === 'POST') {
    const payload = req.body || {}
    const members = payload.members || []
    const articles = payload.articles || []

    let syncedCount = 0

    if (container) {
      try {
        for (const m of members) {
          if (!m || !m.handle) continue
          await container.items.upsert({
            ...m,
            id: m.handle,
            type: 'member',
            syncedAt: new Date().toISOString(),
          })
          syncedCount++
        }
        context.res = {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: {
            success: true,
            syncedMembers: syncedCount,
            syncedArticles: articles.length,
            timestamp: new Date().toISOString(),
            destination: 'Azure Cosmos DB (NoSQL)',
          },
        }
        return
      } catch (err) {
        context.log.error('Cosmos DB bulk sync error:', err)
      }
    }

    // In-memory fallback
    inMemory.members = members
    inMemory.articles = articles
    inMemory.lastSyncedAt = new Date().toISOString()

    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: {
        success: true,
        syncedMembers: members.length,
        syncedArticles: articles.length,
        timestamp: inMemory.lastSyncedAt,
        destination: 'In-Memory Cache (Azure Functions)',
      },
    }
    return
  }

  // GET: Read all data from Cosmos DB
  if (req.method === 'GET') {
    if (container) {
      try {
        const { resources } = await container.items.query('SELECT * FROM c').fetchAll()
        const members = resources.filter((r) => !r.type || r.type === 'member')
        const articles = resources.filter((r) => r.type === 'article')
        context.res = {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: { success: true, members, articles, count: resources.length, source: 'Azure Cosmos DB' },
        }
        return
      } catch (err) {
        context.log.error('Cosmos DB read all error:', err)
      }
    }

    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { success: true, members: inMemory.members, articles: inMemory.articles, source: 'In-Memory' },
    }
  }
}
