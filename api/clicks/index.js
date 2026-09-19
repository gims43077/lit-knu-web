import { getCosmosContainer, getInMemoryStore } from '../shared/cosmosClient.js'

export default async function (context, req) {
  const { handle, amount, isAbsolute } = req.body || {}
  if (!handle) {
    context.res = { status: 400, body: { success: false, message: 'handle is required' } }
    return
  }

  const container = await getCosmosContainer()
  const inMemory = getInMemoryStore()
  const delta = Number(amount) || 0

  if (container) {
    try {
      const { resource: current } = await container.item(handle, handle).read()
      if (current) {
        const nextClicks = isAbsolute ? Math.max(0, delta) : Math.max(0, (Number(current.clicks) || 0) + delta)
        current.clicks = nextClicks
        current.updatedAt = new Date().toISOString()
        const { resource: updated } = await container.items.upsert(current)
        context.res = { status: 200, body: { success: true, member: updated, source: 'azure-cosmos-db' } }
        return
      }
    } catch (err) {
      context.log.warn('Cosmos DB atomic clicks error:', err.message)
    }
  }

  // In-memory fallback
  const member = inMemory.members.find((m) => m.handle === handle)
  if (member) {
    const nextClicks = isAbsolute ? Math.max(0, delta) : Math.max(0, (Number(member.clicks) || 0) + delta)
    member.clicks = nextClicks
    member.updatedAt = new Date().toISOString()
    context.res = { status: 200, body: { success: true, member, source: 'in-memory' } }
    return
  }

  context.res = { status: 200, body: { success: true, clicks: delta } }
}

