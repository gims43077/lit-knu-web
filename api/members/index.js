const { getCosmosContainer, getInMemoryStore } = require('../shared/cosmosClient')

module.exports = async function (context, req) {
  const container = await getCosmosContainer()
  const inMemory = getInMemoryStore()

  const blockedHandles = new Set([
    'shlee', 'minji_kim', 'junho_park', 'sujin_choi', 'dohyun_lee', 'chaewon_yoon', 'taeyang_jung', 'yejin_han', 'sanjun', 'aa'
  ])

  // 1. GET: 부원 전체 목록 조회
  if (req.method === 'GET') {
    const publicMember = (member) => {
      const { contributorId, msLink, password, ...safe } = member
      return safe
    }
    if (container) {
      try {
        const { resources } = await container.items.query('SELECT * FROM c').fetchAll()
        const members = resources.filter((r) => {
          if (r.type && r.type !== 'member') return false
          const h = String(r.handle || r.id || '').trim().toLowerCase()
          if (blockedHandles.has(h) || r.name === '이승환') return false
          return true
        })
        context.res = {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: { success: true, count: members.length, data: members.map(publicMember), source: 'azure-cosmos-db' },
        }
        return
      } catch (err) {
        context.log.error('Cosmos DB read error:', err)
      }
    }

    // Fallback store
    const fbMembers = inMemory.members.filter((r) => {
      const h = String(r.handle || r.id || '').trim().toLowerCase()
      return !blockedHandles.has(h) && r.name !== '이승환'
    })
    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { success: true, count: fbMembers.length, data: fbMembers.map(publicMember), source: 'in-memory' },
    }
    return
  }

  // 2. POST: 부원 생성 또는 업데이트
  if (req.method === 'POST') {
    const member = req.body
    const rawHandle = member && (member.handle || member.id)
    const handle = String(rawHandle || '').trim().toLowerCase()
    if (!handle) {
      context.res = { status: 400, body: { success: false, message: '부원 handle은 필수입니다.' } }
      return
    }

    if (blockedHandles.has(handle) || member.name === '이승환') {
      context.res = { status: 400, body: { success: false, message: '더미 계정은 등록할 수 없습니다.' } }
      return
    }

    const doc = {
      ...member,
      handle,
      id: handle,
      type: 'member',
      updatedAt: new Date().toISOString(),
    }

    if (container) {
      try {
        const { resource } = await container.items.upsert(doc)
        const { contributorId, msLink, password, ...safe } = resource
        context.res = {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: { success: true, member: safe, source: 'azure-cosmos-db' },
        }
        return
      } catch (err) {
        context.log.error('Cosmos DB upsert error:', err)
      }
    }

    const idx = inMemory.members.findIndex((m) => m.handle === member.handle)
    if (idx >= 0) {
      inMemory.members[idx] = doc
    } else {
      inMemory.members.push(doc)
    }

    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { success: true, member: (() => { const { contributorId, msLink, password, ...safe } = doc; return safe })(), source: 'in-memory' },
    }
    return
  }

  // 3. DELETE: 부원 삭제
  if (req.method === 'DELETE') {
    const rawHandle = req.query.handle || (req.body && req.body.handle)
    const handle = String(rawHandle || '').trim().toLowerCase()
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
        if (err.code === 404) {
          context.res = {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: { success: true, message: `${handle} 부원이 이미 삭제되었습니다.`, source: 'azure-cosmos-db' },
          }
          return
        }
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
