import { getCosmosContainer, getInMemoryStore } from '../shared/cosmosClient.js'

export default async function (context, req) {
  const container = await getCosmosContainer()
  const inMemory = getInMemoryStore()

  // 1. GET: 부원 전체 목록 조회
  if (req.method === 'GET') {
    if (container) {
      try {
        const { resources } = await container.items.query('SELECT * FROM c').fetchAll()
        context.res = {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: { success: true, count: resources.length, data: resources, source: 'azure-cosmos-db' },
        }
        return
      } catch (err) {
        context.log.error('Cosmos DB read error:', err)
      }
    }

    // Fallback store
    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { success: true, count: inMemory.members.length, data: inMemory.members, source: 'in-memory' },
    }
    return
  }

  // 2. POST: 부원 생성 또는 업데이트
  if (req.method === 'POST') {
    const member = req.body
    if (!member || !member.handle) {
      context.res = { status: 400, body: { success: false, message: '부원 handle은 필수입니다.' } }
      return
    }

    const doc = {
      ...member,
      id: member.handle, // Cosmos DB partition id
      updatedAt: new Date().toISOString(),
    }

    if (container) {
      try {
        const { resource } = await container.items.upsert(doc)
        context.res = {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: { success: true, member: resource, source: 'azure-cosmos-db' },
        }
        return
      } catch (err) {
        context.log.error('Cosmos DB upsert error:', err)
      }
    }

    // Fallback store
    const idx = inMemory.members.findIndex((m) => m.handle === member.handle)
    if (idx >= 0) {
      inMemory.members[idx] = doc
    } else {
      inMemory.members.push(doc)
    }

    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { success: true, member: doc, source: 'in-memory' },
    }
    return
  }

  // 3. DELETE: 부원 삭제
  if (req.method === 'DELETE') {
    const handle = req.query.handle || (req.body && req.body.handle)
    if (!handle) {
      context.res = { status: 400, body: { success: false, message: '삭제할 부원 handle을 지정해주세요.' } }
      return
    }

    if (container) {
      try {
        await container.item(handle, handle).delete()
        context.res = {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: { success: true, message: `${handle} 부원이 Azure DB에서 삭제되었습니다.`, source: 'azure-cosmos-db' },
        }
        return
      } catch (err) {
        context.log.error('Cosmos DB delete error:', err)
      }
    }

    inMemory.members = inMemory.members.filter((m) => m.handle !== handle)
    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { success: true, message: `${handle} 부원이 삭제되었습니다.`, source: 'in-memory' },
    }
    return
  }
}

