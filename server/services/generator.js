const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * generate complete express api from schema
 */
async function generateAPI(schema, businessName) {
  const apiId = uuidv4().slice(0, 8);
  const apiPath = path.join(__dirname, '../../generated', apiId);

  // create directory structure
  fs.mkdirSync(apiPath, { recursive: true });
  fs.mkdirSync(path.join(apiPath, 'routes'), { recursive: true });
  fs.mkdirSync(path.join(apiPath, 'models'), { recursive: true });

  // generate files
  const files = {
    'package.json': generatePackageJson(businessName, apiId),
    'index.js': generateMainFile(schema),
    'database.js': generateDatabaseFile(schema),
    'README.md': generateReadme(businessName, schema, apiId)
  };

  // write core files
  for (const [filename, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(apiPath, filename), content);
  }

  // generate model files
  for (const entity of schema.entities) {
    const modelContent = generateModelFile(entity);
    fs.writeFileSync(
      path.join(apiPath, 'models', `${entity.name.toLowerCase()}.js`),
      modelContent
    );
  }

  // generate route files
  for (const entity of schema.entities) {
    const routeContent = generateRouteFile(entity, schema);
    fs.writeFileSync(
      path.join(apiPath, 'routes', `${entity.name.toLowerCase()}.js`),
      routeContent
    );
  }

  return {
    apiId,
    path: apiPath,
    entities: schema.entities.map(e => e.name)
  };
}

function generatePackageJson(businessName, apiId) {
  return JSON.stringify({
    name: `api-${apiId}`,
    version: '1.0.0',
    description: `generated api for ${businessName}`,
    main: 'index.js',
    scripts: {
      start: 'node index.js'
    },
    dependencies: {
      express: '^4.18.2',
      cors: '^2.8.5',
      sqlite3: '^5.1.6',
      'body-parser': '^1.20.2'
    }
  }, null, 2);
}

function generateMainFile(schema) {
  const entityNames = schema.entities.map(e => e.name.toLowerCase());
  const routeImports = entityNames.map(name =>
    `const ${name}Routes = require('./routes/${name}');`
  ).join('\n');
  const routeUses = entityNames.map(name =>
    `app.use('/api/${name}s', ${name}Routes);`
  ).join('\n');

  return `const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');

${routeImports}

const app = express();
const PORT = process.env.PORT || 4000;

// middleware
app.use(cors());
app.use(bodyParser.json());

// initialize database
db.initialize();

// routes
${routeUses}

// health check
app.get('/health', (req, res) => {
  res.json({
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'something went wrong',
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(\`api server running on port \${PORT}\`);
});

module.exports = app;
`;
}

function generateDatabaseFile(schema) {
  const tableCreations = schema.entities.map(entity => {
    const fields = entity.fields.map(field => {
      let sql = `${field.name} `;

      // type mapping
      switch(field.type) {
        case 'integer':
          sql += 'INTEGER';
          break;
        case 'string':
          sql += 'TEXT';
          break;
        case 'boolean':
          sql += 'INTEGER';
          break;
        case 'date':
          sql += 'TEXT';
          break;
        default:
          sql += 'TEXT';
      }

      if (field.primaryKey) sql += ' PRIMARY KEY';
      if (field.autoIncrement) sql += ' AUTOINCREMENT';
      if (field.required && !field.primaryKey) sql += ' NOT NULL';
      if (field.unique) sql += ' UNIQUE';

      return sql;
    }).join(',\n      ');

    return `    db.run(\`
      CREATE TABLE IF NOT EXISTS ${entity.name.toLowerCase()}s (
      ${fields}
      )
    \`);`;
  }).join('\n\n');

  return `const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

function initialize() {
  db.serialize(() => {
${tableCreations}
  });

  console.log('database initialized successfully');
}

function getDb() {
  return db;
}

module.exports = {
  initialize,
  getDb,
  db
};
`;
}

function generateModelFile(entity) {
  const entityNameLower = entity.name.toLowerCase();
  const entityNamePlural = entityNameLower + 's';

  return `const { db } = require('../database');

class ${entity.name} {
  static getAll(callback) {
    db.all('SELECT * FROM ${entityNamePlural}', [], callback);
  }

  static getById(id, callback) {
    db.get('SELECT * FROM ${entityNamePlural} WHERE id = ?', [id], callback);
  }

  static create(data, callback) {
    const fields = Object.keys(data).filter(k => k !== 'id');
    const values = fields.map(f => data[f]);
    const placeholders = fields.map(() => '?').join(', ');

    const sql = \`INSERT INTO ${entityNamePlural} (\${fields.join(', ')}) VALUES (\${placeholders})\`;

    db.run(sql, values, function(err) {
      callback(err, { id: this.lastID, ...data });
    });
  }

  static update(id, data, callback) {
    const fields = Object.keys(data).filter(k => k !== 'id');
    const values = fields.map(f => data[f]);
    const setClause = fields.map(f => \`\${f} = ?\`).join(', ');

    const sql = \`UPDATE ${entityNamePlural} SET \${setClause} WHERE id = ?\`;

    db.run(sql, [...values, id], function(err) {
      callback(err, { id, ...data });
    });
  }

  static delete(id, callback) {
    db.run('DELETE FROM ${entityNamePlural} WHERE id = ?', [id], callback);
  }
}

module.exports = ${entity.name};
`;
}

function generateRouteFile(entity, schema) {
  const entityNameLower = entity.name.toLowerCase();
  const EntityName = entity.name;

  return `const express = require('express');
const router = express.Router();
const ${EntityName} = require('../models/${entityNameLower}');

// get all ${entityNameLower}s
router.get('/', (req, res) => {
  ${EntityName}.getAll((err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ data: rows, count: rows.length });
  });
});

// get single ${entityNameLower}
router.get('/:id', (req, res) => {
  ${EntityName}.getById(req.params.id, (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: '${entityNameLower} not found' });
    }
    res.json({ data: row });
  });
});

// create ${entityNameLower}
router.post('/', (req, res) => {
  ${EntityName}.create(req.body, (err, result) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.status(201).json({ data: result });
  });
});

// update ${entityNameLower}
router.put('/:id', (req, res) => {
  ${EntityName}.update(req.params.id, req.body, (err, result) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ data: result });
  });
});

// delete ${entityNameLower}
router.delete('/:id', (req, res) => {
  ${EntityName}.delete(req.params.id, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: '${entityNameLower} deleted successfully' });
  });
});

module.exports = router;
`;
}

function generateReadme(businessName, schema, apiId) {
  const entities = schema.entities.map(e => {
    const entityNamePlural = e.name.toLowerCase() + 's';
    return `### ${e.name}

**Endpoints:**
- \`GET /api/${entityNamePlural}\` - get all ${entityNamePlural}
- \`GET /api/${entityNamePlural}/:id\` - get single ${e.name}
- \`POST /api/${entityNamePlural}\` - create new ${e.name}
- \`PUT /api/${entityNamePlural}/:id\` - update ${e.name}
- \`DELETE /api/${entityNamePlural}/:id\` - delete ${e.name}

**Fields:**
${e.fields.map(f => `- \`${f.name}\` (${f.type})${f.required ? ' *required*' : ''}`).join('\n')}
`;
  }).join('\n\n');

  return `# ${businessName} API

generated api id: \`${apiId}\`

## getting started

\`\`\`bash
npm install
npm start
\`\`\`

the api will run on http://localhost:4000

## available endpoints

${entities}

## example requests

### create a new record
\`\`\`bash
curl -X POST http://localhost:4000/api/${schema.entities[0].name.toLowerCase()}s \\
  -H "Content-Type: application/json" \\
  -d '{"field": "value"}'
\`\`\`

### get all records
\`\`\`bash
curl http://localhost:4000/api/${schema.entities[0].name.toLowerCase()}s
\`\`\`

## notes

- database: SQLite (database.db)
- all responses are JSON
- error responses include an "error" field
- timestamps are in ISO 8601 format
`;
}

module.exports = {
  generateAPI
};
