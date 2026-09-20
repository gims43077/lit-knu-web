const { getCosmosContainer, getInMemoryStore } = require('../shared/cosmosClient')

module.exports = async function (context, req) {
  const { handle: rawHandle, amount, isAbsolute } = req.body || {}
  const handle = String(rawHandle || '').trim().toLowerCase()
  if (!handle) {
    context.res = { status: 400, body: { success: false, message: 'handle is required' } }
    return
  }

  const container = await getCosmosContainer()
  const inMemory = getInMemoryStore()
  const delta = Number(amount) || 0

  if (container) {
    try {
      const itemResponse = await container.item(handle, handle).read().catch(() => null)
      const current = itemResponse?.resource
      const nextClicks = isAbsolute ? Math.max(0, delta) : Math.max(0, (Number(current?.clicks) || 0) + delta)

      const docToSave = {
        ...(current || { id: handle, handle }),
        clicks: nextClicks,
        updatedAt: new Date().toISOString(),
      }

      const { resource: updated } = await container.items.upsert(docToSave)
      context.res = { status: 200, body: { success: true, member: updated, source: 'azure-cosmos-db' } }
      return
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
