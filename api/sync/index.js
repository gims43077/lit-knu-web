const { getCosmosContainer, getInMemoryStore } = require('../shared/cosmosClient')

module.exports = async function (context, req) {
  const container = await getCosmosContainer()
  const inMemory = getInMemoryStore()

  // POST: Bulk push local snapshot to Azure Cosmos DB
  if (req.method === 'POST') {
    const payload = req.body || {}
    const members = payload.members || []
    const articles = payload.articles || []
    const missions = payload.missions || []
    const faqs = payload.faqs || []

    let syncedMembers = 0
    let syncedArticles = 0
    let syncedMissions = 0
    let syncedFaqs = 0

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
          syncedMembers++
        }
        for (const a of articles) {
          if (!a || !a.id) continue
          await container.items.upsert({
            ...a,
            id: a.id,
            handle: '__articles',
            type: 'article',
            syncedAt: new Date().toISOString(),
          })
          syncedArticles++
        }
        for (const m of missions) {
          if (!m || !m.id) continue
          await container.items.upsert({
            ...m,
            id: m.id,
            handle: '__missions',
            type: 'mission',
            syncedAt: new Date().toISOString(),
          })
          syncedMissions++
        }
        for (const f of faqs) {
          if (!f || !f.id) continue
          await container.items.upsert({
            ...f,
            id: f.id,
            handle: '__faqs',
            type: 'faq',
            syncedAt: new Date().toISOString(),
          })
          syncedFaqs++
        }

        context.res = {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: {
            success: true,
            syncedMembers,
            syncedArticles,
            syncedMissions,
            syncedFaqs,
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
    inMemory.missions = missions
    inMemory.faqs = faqs
    inMemory.lastSyncedAt = new Date().toISOString()

    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: {
        success: true,
        syncedMembers: members.length,
        syncedArticles: articles.length,
        syncedMissions: missions.length,
        syncedFaqs: faqs.length,
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
        const missions = resources.filter((r) => r.type === 'mission')
        const faqs = resources.filter((r) => r.type === 'faq')
        context.res = {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: { success: true, members, articles, missions, faqs, count: resources.length, source: 'Azure Cosmos DB' },
        }
        return
      } catch (err) {
        context.log.error('Cosmos DB read all error:', err)
      }
    }

    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: {
        success: true,
        members: inMemory.members || [],
        articles: inMemory.articles || [],
        missions: inMemory.missions || [],
        faqs: inMemory.faqs || [],
        source: 'In-Memory',
      },
    }
  }
}
