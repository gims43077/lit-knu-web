const { getCosmosContainer } = require('../shared/cosmosClient')

const PARTITION_KEY = '__articles'

module.exports = async function (context, req) {
  const container = await getCosmosContainer()

  // 1. GET: 전체 글 목록 조회
  if (req.method === 'GET') {
    if (container) {
      try {
        const { resources } = await container.items
          .query({
            query: "SELECT * FROM c WHERE c.type = 'article'",
          })
          .fetchAll()
        context.res = {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: { success: true, count: resources.length, data: resources, source: 'azure-cosmos-db' },
        }
        return
      } catch (err) {
        context.log.error('Cosmos DB articles read error:', err)
      }
    }
    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { success: true, count: 0, data: [], source: 'fallback' },
    }
    return
  }

  // 2. POST: 글 생성 또는 업데이트 (upsert)
  if (req.method === 'POST') {
    const article = req.body
    if (!article || !article.id) {
      context.res = { status: 400, body: { success: false, message: '글 id는 필수입니다.' } }
      return
    }

    const doc = {
      ...article,
      id: article.id,
      handle: PARTITION_KEY,
      type: 'article',
      updatedAt: new Date().toISOString(),
    }

    if (container) {
      try {
        const { resource } = await container.items.upsert(doc)
        context.res = {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: { success: true, article: resource, source: 'azure-cosmos-db' },
        }
        return
      } catch (err) {
        context.log.error('Cosmos DB articles upsert error:', err)
      }
    }

    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { success: true, article: doc, source: 'fallback' },
    }
    return
  }

  // 3. DELETE: 글 삭제
  if (req.method === 'DELETE') {
    const id = req.query.id || (req.body && req.body.id)
    if (!id) {
      context.res = { status: 400, body: { success: false, message: '삭제할 글 id를 지정해주세요.' } }
      return
    }

    if (container) {
      try {
        await container.item(id, PARTITION_KEY).delete()
        context.res = {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: { success: true, message: `${id} 글이 삭제되었습니다.`, source: 'azure-cosmos-db' },
        }
        return
      } catch (err) {
        context.log.error('Cosmos DB articles delete error:', err)
        // 문서가 없는 경우에도 성공으로 처리
        if (err.code === 404) {
          context.res = {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: { success: true, message: `${id} 글이 이미 삭제되었습니다.`, source: 'azure-cosmos-db' },
          }
          return
        }
      }
    }

    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { success: true, message: `${id} 글이 삭제되었습니다.`, source: 'fallback' },
    }
    return
  }
}

