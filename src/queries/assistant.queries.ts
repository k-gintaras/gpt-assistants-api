export const GET_FULL_ASSISTANT_WITH_DETAILS = `
-- Fetch full assistant with details
SELECT 
  -- Assistant details
  a.id AS assistant_id,
  a.gpt_assistant_id AS gpt_assistant_id,
  a.name AS assistant_name,
  a.description AS assistant_description,
  a.type AS assistant_type,
  a.model AS assistant_model, -- Updated to include the model field
  a.created_at AS assistant_created_at,
  a.updated_at AS assistant_updated_at,
  
  -- Feedback summary (calculated directly)
  COALESCE(AVG(f.rating), 0) AS avg_rating,
  COALESCE(COUNT(f.id), 0) AS total_feedback,

  -- Assistant tags
  at.tag_id AS assistant_tag_id,
  t1.name AS assistant_tag_name,

  -- Memory focus rule
  qs.id AS focus_rule_id,
  qs.max_results AS focus_rule_max_results,
  qs.relationship_types AS focus_rule_relationship_types,
  qs.priority_tags AS focus_rule_priority_tags,
  qs.created_at AS focus_rule_created_at,
  qs.updated_at AS focus_rule_updated_at,

  -- Memory details
  m.id AS memory_id,
  m.type AS memory_type,
  m.description AS memory_description,
  m.data AS memory_data,
  m.created_at AS memory_created_at,
  m.updated_at AS memory_updated_at,

  -- Memory tags
  mt.tag_id AS memory_tag_id,
  t2.name AS memory_tag_name

FROM 
  assistants a

-- Join feedback for aggregate calculation (using LEFT JOIN to include both task and assistant feedback)
LEFT JOIN tasks t ON a.id = t.assigned_assistant
LEFT JOIN feedback f ON (
  t.id = f.target_id AND f.target_type = 'task'  -- For task feedback
  OR a.id = f.target_id AND f.target_type = 'assistant' -- For assistant feedback
)

-- Join assistant tags
LEFT JOIN assistant_tags at ON a.id = at.assistant_id
LEFT JOIN tags t1 ON at.tag_id = t1.id

-- Join memory focus rules and related memories
LEFT JOIN memory_focus_rules qs ON a.id = qs.assistant_id
LEFT JOIN focused_memories fm ON qs.id = fm.memory_focus_id
LEFT JOIN memories m ON fm.memory_id = m.id

-- Join memory tags
LEFT JOIN memory_tags mt ON m.id = mt.memory_id
LEFT JOIN tags t2 ON mt.tag_id = t2.id

WHERE 
  a.id = $1  -- Updated to use PostgreSQL parameter placeholder

GROUP BY 
  a.id, a.model, at.tag_id, t1.name, qs.id, qs.max_results, qs.relationship_types, 
  qs.priority_tags, qs.created_at, qs.updated_at, 
  m.id, m.type, m.description, m.data, m.created_at, m.updated_at, 
  mt.tag_id, t2.name

ORDER BY 
  m.created_at DESC;
`;

export const GET_ASSISTANT_WITHOUT_MEMORIES = `
  SELECT 
    id AS assistant_id,
    gpt_assistant_id AS gpt_assistant_id,
    name AS assistant_name,
    description AS assistant_description,
    type AS assistant_type,
    model AS assistant_model, -- Include model in the query
    created_at AS assistant_created_at,
    updated_at AS assistant_updated_at
  FROM assistants 
  WHERE id = $1;  -- Updated to use PostgreSQL parameter placeholder
`;

export const buildGetAssistantWithFiltersQuery = (filters: { type?: string; tags?: string[] }): string => {
  let query = `
    SELECT 
      a.id AS assistant_id,
      a.gpt_assistant_id AS gpt_assistant_id,
      a.name AS assistant_name,
      a.description AS assistant_description,
      a.type AS assistant_type,
      a.model AS assistant_model,
      a.created_at AS assistant_created_at,
      a.updated_at AS assistant_updated_at
    FROM assistants a
    LEFT JOIN assistant_tags at ON a.id = at.assistant_id
    LEFT JOIN tags t ON at.tag_id = t.id
  `;

  const conditions: string[] = [];
  if (filters.type) {
    conditions.push(`a.type = $2`); // Using parameter placeholder
  }
  if (filters.tags && filters.tags.length > 0) {
    const tagsCondition = filters.tags.map((tag, index) => `$${index + 3}`).join(','); // Dynamically map to placeholders
    conditions.push(`t.name IN (${tagsCondition})`);
  }

  if (conditions.length) {
    query += ` WHERE ` + conditions.join(' AND ');
  }

  return query;
};

export const GET_CHAT_ASSISTANTS = buildGetAssistantWithFiltersQuery({ type: 'chat', tags: ['ai', 'assistant'] });
