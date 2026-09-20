const { getCosmosContainer } = require('../shared/cosmosClient')

const PARTITION_KEY = '__faqs'

module.exports = async function (context, req) {
  const container = await getCosmosContainer()

  // 1. GET: 전체 FAQ 목록 조회
  if (req.method === 'GET') {
    if (container) {
      try {
        const { resources } = await container.items
          .query({
            query: "SELECT * FROM c WHERE c.type = 'faq'",
          })
          .fetchAll()
        context.res = {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: { success: true, count: resources.length, data: resources, source: 'azure-cosmos-db' },
        }
        return
      } catch (err) {
        context.log.error('Cosmos DB faqs read error:', err)
      }
    }
    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { success: true, count: 0, data: [], source: 'fallback' },
    }
    return
  }

  // 2. POST: FAQ 생성 또는 업데이트 (upsert)
  if (req.method === 'POST') {
    const faq = req.body
    if (!faq || !faq.id) {
      context.res = { status: 400, body: { success: false, message: 'FAQ id는 필수입니다.' } }
      return
    }

    const doc = {
      ...faq,
      id: faq.id,
      handle: PARTITION_KEY,
      type: 'faq',
      updatedAt: new Date().toISOString(),
    }

    if (container) {
      try {
        const { resource } = await container.items.upsert(doc)
        context.res = {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: { success: true, faq: resource, source: 'azure-cosmos-db' },
        }
        return
      } catch (err) {
        context.log.error('Cosmos DB faqs upsert error:', err)
      }
    }

    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { success: true, faq: doc, source: 'fallback' },
    }
    return
  }

  // 3. DELETE: FAQ 삭제
  if (req.method === 'DELETE') {
    const id = req.query.id || (req.body && req.body.id)
    if (!id) {
      context.res = { status: 400, body: { success: false, message: '삭제할 FAQ id를 지정해주세요.' } }
      return
    }

    if (container) {
      try {
        await container.item(id, PARTITION_KEY).delete()
        context.res = {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: { success: true, message: `${id} FAQ가 삭제되었습니다.`, source: 'azure-cosmos-db' },
        }
        return
      } catch (err) {
        context.log.error('Cosmos DB faqs delete error:', err)
        if (err.code === 404) {
          context.res = {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: { success: true, message: `${id} FAQ가 이미 삭제되었습니다.`, source: 'azure-cosmos-db' },
          }
          return
        }
      }
    }

    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { success: true, message: `${id} FAQ가 삭제되었습니다.`, source: 'fallback' },
    }
    return
  }
}

