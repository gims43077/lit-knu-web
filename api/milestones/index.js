const { getCosmosContainer } = require('../shared/cosmosClient')

const PARTITION_KEY = '__milestones'
const DOC_ID = '__milestones'

const DEFAULT_MILESTONES = [
  { count: 30, title: '30 달성', icon: '🌱', badge: '30 달성', reward: '커피 기프티콘', color: 'mint' },
  { count: 50, title: '50 달성', icon: '🌿', badge: '50 달성', reward: '편의점 기프티콘', color: 'amber' },
  { count: 100, title: '100 달성', icon: '🪴', badge: '100 달성', reward: '케익 기프티콘', color: 'pink' },
  { count: 150, title: '150 달성', icon: '🌳', badge: '150 달성', reward: '치킨 기프티콘', color: 'orange' },
  { count: 200, title: '200 달성', icon: '🍎', badge: '200 달성', reward: '자격증 응시비 지원', color: 'violet' },
  { count: 250, title: '250 달성', icon: '👑', badge: '250 달성', reward: 'MSA 달성', color: 'gold' },
]

function sanitizeMilestones(list) {
  if (!Array.isArray(list)) return DEFAULT_MILESTONES
  return list
    .map((item) => {
      const rawCount = Number(item.count)
      const count = isNaN(rawCount) ? 0 : Math.max(0, rawCount)
      return {
        count,
        icon: String(item.icon || '🌱').trim(),
        reward: String(item.reward || '').trim(),
        title: item.title || `${count} 달성`,
        badge: item.badge || `${count} 달성`,
        color: item.color || (count >= 250 ? 'gold' : count >= 200 ? 'violet' : count >= 150 ? 'orange' : count >= 100 ? 'pink' : count >= 50 ? 'amber' : 'mint'),
      }
    })
    .sort((a, b) => a.count - b.count)
}

module.exports = async function (context, req) {
  const container = await getCosmosContainer()

  // 1. GET: 마일스톤 및 단계별 보상 목록 조회
  if (req.method === 'GET') {
    if (container) {
      try {
        const itemRes = await container.item(DOC_ID, PARTITION_KEY).read().catch(() => null)
        if (itemRes && itemRes.resource) {
          const raw = itemRes.resource.milestones || itemRes.resource.data || []
          const sanitized = sanitizeMilestones(raw)
          context.res = {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: { success: true, count: sanitized.length, data: sanitized, source: 'azure-cosmos-db' },
          }
          return
        }

        // DB에 아직 없으면 기본 마일스톤 생성하여 Cosmos DB에 시딩
        const initialDoc = {
          id: DOC_ID,
          handle: PARTITION_KEY,
          type: 'milestones',
          milestones: DEFAULT_MILESTONES,
          updatedAt: new Date().toISOString(),
        }
        await container.items.upsert(initialDoc).catch(() => {})

        context.res = {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: { success: true, count: DEFAULT_MILESTONES.length, data: DEFAULT_MILESTONES, source: 'azure-cosmos-db' },
        }
        return
      } catch (err) {
        context.log.error('Cosmos DB milestones read error:', err)
      }
    }

    // Fallback
    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { success: true, count: DEFAULT_MILESTONES.length, data: DEFAULT_MILESTONES, source: 'fallback' },
    }
    return
  }

  // 2. POST / PUT: 마일스톤 및 보상 업데이트 (Azure Cosmos DB 저장)
  if (req.method === 'POST' || req.method === 'PUT') {
    const rawList = Array.isArray(req.body)
      ? req.body
      : req.body?.milestones || req.body?.data || []

    const sanitized = sanitizeMilestones(rawList)
    const doc = {
      id: DOC_ID,
      handle: PARTITION_KEY,
      type: 'milestones',
      milestones: sanitized,
      updatedAt: new Date().toISOString(),
    }

    if (container) {
      try {
        const { resource } = await container.items.upsert(doc)
        context.res = {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: {
            success: true,
            count: sanitized.length,
            data: resource.milestones || sanitized,
            source: 'azure-cosmos-db',
          },
        }
        return
      } catch (err) {
        context.log.error('Cosmos DB milestones update error:', err)
      }
    }

    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { success: true, count: sanitized.length, data: sanitized, source: 'in-memory' },
    }
    return
  }
}

