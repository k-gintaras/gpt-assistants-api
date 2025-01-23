export const GET_FULL_ASSISTANT_WITH_DETAILS = `
  SELECT 
    -- Assistant details
    a.id AS assistant_id,
    a.name AS assistant_name,
    a.description AS assistant_description,
    a.type AS assistant_type,
    a.instructions AS assistant_instructions,
    a.feedback_positive,
    a.feedback_negative,
    a.feedback_lastFeedbackDate,
    a.createdAt AS assistant_createdAt,
    a.updatedAt AS assistant_updatedAt,
    
    -- Assistant tags
    at.tag_id AS assistant_tag_id,
    t1.name AS assistant_tag_name,

    -- Memory focus rule
    qs.id AS focus_rule_id,
    qs.maxResults AS focus_rule_maxResults,
    qs.relationshipTypes AS focus_rule_relationshipTypes,
    qs.priorityTags AS focus_rule_priorityTags,
    qs.createdAt AS focus_rule_createdAt,
    qs.updatedAt AS focus_rule_updatedAt,

    -- Memory details
    m.id AS memory_id,
    m.type AS memory_type,
    m.description AS memory_description,
    m.data AS memory_data,
    m.createdAt AS memory_createdAt,
    m.updatedAt AS memory_updatedAt,

    -- Memory tags
    mt.tag_id AS memory_tag_id,
    t2.name AS memory_tag_name

  FROM 
    assistants a

  -- Join assistant tags
  LEFT JOIN 
    assistant_tags at ON a.id = at.assistant_id
  LEFT JOIN 
    tags t1 ON at.tag_id = t1.id

  -- Join memory focus rules and related memories
  LEFT JOIN 
    memory_focus_rules qs ON a.id = qs.assistant_id
  LEFT JOIN 
    focused_memories fm ON qs.id = fm.memory_focus_id
  LEFT JOIN 
    memories m ON fm.memory_id = m.id

  -- Join memory tags
  LEFT JOIN 
    memory_tags mt ON m.id = mt.memory_id
  LEFT JOIN 
    tags t2 ON mt.tag_id = t2.id

  WHERE 
    a.id = ?

  ORDER BY 
    m.createdAt DESC;
`;

export const GET_ASSISTANT_WITHOUT_MEMORIES = `
  SELECT * 
  FROM assistants 
  WHERE id = ?
`;

export const buildGetAssistantWithFiltersQuery = (filters: { type?: string; tags?: string[] }): string => {
  let query = `
    SELECT a.* 
    FROM assistants a
    LEFT JOIN assistant_tags at ON a.id = at.assistant_id
    LEFT JOIN tags t ON at.tag_id = t.id
  `;

  const conditions: string[] = [];
  if (filters.type) {
    conditions.push(`a.type = '${filters.type}'`);
  }
  if (filters.tags && filters.tags.length > 0) {
    const tagsCondition = filters.tags.map((tag) => `'${tag}'`).join(',');
    conditions.push(`t.name IN (${tagsCondition})`);
  }

  if (conditions.length) {
    query += ` WHERE ` + conditions.join(' AND ');
  }

  return query;
};

export const GET_CHAT_ASSISTANTS = buildGetAssistantWithFiltersQuery({ type: 'chat', tags: ['ai', 'assistant'] });
