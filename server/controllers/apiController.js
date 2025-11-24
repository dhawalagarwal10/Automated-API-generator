const { parseRequirements, validateSchema } = require('../services/openai');
const { generateAPI } = require('../services/generator');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// store running apis (in production, use redis or database)
const runningAPIs = new Map();

/**
 * handle api generation request
 */
async function generateAPIHandler(req, res) {
  try {
    const { businessName, description, dataEntities, operations } = req.body;

    // validate input
    if (!businessName || !description || !dataEntities) {
      return res.status(400).json({
        error: 'missing required fields',
        required: ['businessName', 'description', 'dataEntities']
      });
    }

    // step 1: parse requirements with openai
    console.log('parsing requirements...');
    const parseResult = await parseRequirements({
      businessName,
      description,
      dataEntities,
      operations: operations || ['create', 'read', 'update', 'delete']
    });

    if (!parseResult.success) {
      return res.status(500).json({
        error: 'failed to parse requirements',
        details: parseResult.error
      });
    }

    // step 2: validate schema
    const validation = validateSchema(parseResult.schema);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'invalid schema generated',
        details: validation.error
      });
    }

    // step 3: generate api code
    console.log('generating api code...');
    const apiInfo = await generateAPI(parseResult.schema, businessName);

    // step 4: install dependencies and start api
    console.log('installing dependencies...');
    await installDependencies(apiInfo.path);

    console.log('starting api server...');
    const port = await startAPIServer(apiInfo.apiId, apiInfo.path);

    // return success response
    res.json({
      success: true,
      api: {
        id: apiInfo.apiId,
        name: businessName,
        url: `http://localhost:${port}`,
        entities: apiInfo.entities,
        schema: parseResult.schema,
        endpoints: generateEndpointList(parseResult.schema, port)
      }
    });
  } catch (error) {
    console.error('generation error:', error);
    res.status(500).json({
      error: 'api generation failed',
      message: error.message
    });
  }
}

/**
 * install npm dependencies for generated api
 */
function installDependencies(apiPath) {
  return new Promise((resolve, reject) => {
    const npm = spawn('npm', ['install'], {
      cwd: apiPath,
      stdio: 'pipe'
    });

    npm.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`npm install failed with code ${code}`));
      }
    });

    npm.on('error', reject);
  });
}

/**
 * start the generated api server
 */
function startAPIServer(apiId, apiPath) {
  return new Promise((resolve, reject) => {
    // find available port
    const port = 4000 + runningAPIs.size;

    const apiProcess = spawn('node', ['index.js'], {
      cwd: apiPath,
      env: { ...process.env, PORT: port },
      stdio: 'pipe'
    });

    apiProcess.stdout.on('data', (data) => {
      console.log(`[${apiId}]:`, data.toString());
    });

    apiProcess.stderr.on('data', (data) => {
      console.error(`[${apiId}]:`, data.toString());
    });

    apiProcess.on('error', (error) => {
      console.error(`failed to start api ${apiId}:`, error);
      reject(error);
    });

    // wait a bit for server to start
    setTimeout(() => {
      if (!apiProcess.killed) {
        runningAPIs.set(apiId, {
          process: apiProcess,
          port,
          startTime: new Date()
        });
        resolve(port);
      } else {
        reject(new Error('api process died immediately'));
      }
    }, 2000);
  });
}

/**
 * generate list of available endpoints
 */
function generateEndpointList(schema, port) {
  const baseUrl = `http://localhost:${port}`;
  const endpoints = [];

  for (const entity of schema.entities) {
    const entityPath = entity.name.toLowerCase() + 's';
    endpoints.push(
      { method: 'GET', path: `/api/${entityPath}`, description: `get all ${entityPath}` },
      { method: 'GET', path: `/api/${entityPath}/:id`, description: `get single ${entity.name}` },
      { method: 'POST', path: `/api/${entityPath}`, description: `create ${entity.name}` },
      { method: 'PUT', path: `/api/${entityPath}/:id`, description: `update ${entity.name}` },
      { method: 'DELETE', path: `/api/${entityPath}/:id`, description: `delete ${entity.name}` }
    );
  }

  return endpoints.map(e => ({
    ...e,
    url: `${baseUrl}${e.path}`
  }));
}

/**
 * get status of running apis
 */
function getAPIStatus(req, res) {
  const apis = Array.from(runningAPIs.entries()).map(([id, info]) => ({
    id,
    port: info.port,
    uptime: Date.now() - info.startTime.getTime(),
    url: `http://localhost:${info.port}`
  }));

  res.json({ apis, count: apis.length });
}

/**
 * stop a running api
 */
function stopAPI(req, res) {
  const { apiId } = req.params;

  if (!runningAPIs.has(apiId)) {
    return res.status(404).json({ error: 'api not found' });
  }

  const apiInfo = runningAPIs.get(apiId);
  apiInfo.process.kill();
  runningAPIs.delete(apiId);

  res.json({ message: 'api stopped successfully', apiId });
}

module.exports = {
  generateAPIHandler,
  getAPIStatus,
  stopAPI
};
