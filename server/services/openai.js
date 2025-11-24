const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * parse user requirements and generate structured api schema
 */
async function parseRequirements(businessInfo) {
  const { businessName, description, dataEntities, operations } = businessInfo;

  const prompt = `you are an expert API architect. analyze this business requirement and generate a structured JSON schema for a REST API.

business name: ${businessName}
description: ${description}
data entities: ${dataEntities}
required operations: ${operations.join(', ')}

return ONLY valid JSON (no markdown, no explanation) with this exact structure:
{
  "entities": [
    {
      "name": "EntityName",
      "fields": [
        {
          "name": "id",
          "type": "integer",
          "primaryKey": true,
          "autoIncrement": true
        },
        {
          "name": "fieldName",
          "type": "string|integer|boolean|date",
          "required": true|false,
          "unique": true|false
        }
      ]
    }
  ],
  "relationships": [
    {
      "from": "EntityA",
      "to": "EntityB",
      "type": "oneToMany|manyToOne|manyToMany",
      "foreignKey": "entity_b_id"
    }
  ]
}

rules:
- always include an "id" field as primary key with autoIncrement
- infer reasonable field types from context
- include timestamps (created_at, updated_at) when relevant
- detect relationships from entity descriptions
- use snake_case for field names
- keep it simple and practical`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'you are an API schema designer. return only valid JSON, no markdown formatting.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const content = completion.choices[0].message.content.trim();

    // remove markdown code blocks if present
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const schema = JSON.parse(cleaned);

    return {
      success: true,
      schema: schema
    };
  } catch (error) {
    console.error('openai api error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * validate generated schema structure
 */
function validateSchema(schema) {
  if (!schema.entities || !Array.isArray(schema.entities)) {
    return { valid: false, error: 'missing or invalid entities array' };
  }

  for (const entity of schema.entities) {
    if (!entity.name || !entity.fields) {
      return { valid: false, error: `invalid entity structure: ${JSON.stringify(entity)}` };
    }

    const hasIdField = entity.fields.some(f => f.primaryKey === true);
    if (!hasIdField) {
      return { valid: false, error: `entity ${entity.name} missing primary key` };
    }
  }

  return { valid: true };
}

module.exports = {
  parseRequirements,
  validateSchema
};
