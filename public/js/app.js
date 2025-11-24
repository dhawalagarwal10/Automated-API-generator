let currentAPI = null;

// form submission handler
document.getElementById('api-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = {
    businessName: document.getElementById('businessName').value,
    description: document.getElementById('description').value,
    dataEntities: document.getElementById('dataEntities').value,
    operations: Array.from(document.querySelectorAll('input[name="operations"]:checked'))
      .map(cb => cb.value)
  };

  await generateAPI(formData);
});

// generate api function
async function generateAPI(data) {
  // show loading state
  document.getElementById('form-section').classList.add('hidden');
  document.getElementById('loading-section').classList.remove('hidden');
  document.getElementById('results-section').classList.add('hidden');

  const loadingMessages = [
    'analyzing your requirements with ai',
    'generating database schema',
    'creating api endpoints',
    'installing dependencies',
    'starting your api server'
  ];

  let messageIndex = 0;
  const messageInterval = setInterval(() => {
    messageIndex = (messageIndex + 1) % loadingMessages.length;
    document.getElementById('loading-message').textContent = loadingMessages[messageIndex];
  }, 3000);

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    clearInterval(messageInterval);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'failed to generate api');
    }

    const result = await response.json();
    currentAPI = result.api;

    // show results
    displayResults(result.api);
  } catch (error) {
    clearInterval(messageInterval);
    showError(error.message);
  }
}

// display results
function displayResults(api) {
  document.getElementById('loading-section').classList.add('hidden');
  document.getElementById('results-section').classList.remove('hidden');

  // set api url
  document.getElementById('api-url').textContent = api.url;

  // display entities
  const entitiesList = document.getElementById('entities-list');
  entitiesList.innerHTML = '';
  api.entities.forEach(entity => {
    const badge = document.createElement('span');
    badge.className = 'px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium';
    badge.textContent = entity;
    entitiesList.appendChild(badge);
  });

  // display endpoints
  const endpointsList = document.getElementById('endpoints-list');
  endpointsList.innerHTML = '';
  api.endpoints.forEach(endpoint => {
    const endpointDiv = document.createElement('div');
    endpointDiv.className = 'flex items-center gap-3 p-3 bg-gray-50 rounded border border-gray-200';

    const methodBadge = document.createElement('span');
    methodBadge.className = `px-2 py-1 rounded text-xs font-bold ${getMethodColor(endpoint.method)}`;
    methodBadge.textContent = endpoint.method;

    const pathText = document.createElement('code');
    pathText.className = 'text-sm text-gray-700 flex-1';
    pathText.textContent = endpoint.path;

    const testBtn = document.createElement('button');
    testBtn.className = 'text-blue-600 hover:text-blue-800 text-sm font-medium';
    testBtn.textContent = 'try it';
    testBtn.onclick = () => loadEndpoint(endpoint);

    endpointDiv.appendChild(methodBadge);
    endpointDiv.appendChild(pathText);
    endpointDiv.appendChild(testBtn);
    endpointsList.appendChild(endpointDiv);
  });

  // set first endpoint as default
  if (api.endpoints.length > 0) {
    loadEndpoint(api.endpoints[0]);
  }
}

// get color for http method
function getMethodColor(method) {
  const colors = {
    GET: 'bg-blue-100 text-blue-800',
    POST: 'bg-green-100 text-green-800',
    PUT: 'bg-yellow-100 text-yellow-800',
    DELETE: 'bg-red-100 text-red-800'
  };
  return colors[method] || 'bg-gray-100 text-gray-800';
}

// load endpoint into sandbox
function loadEndpoint(endpoint) {
  document.getElementById('request-method').value = endpoint.method;
  document.getElementById('request-endpoint').value = endpoint.path;

  // show/hide body section based on method
  const bodySection = document.getElementById('request-body-section');
  if (endpoint.method === 'GET' || endpoint.method === 'DELETE') {
    bodySection.classList.add('hidden');
  } else {
    bodySection.classList.remove('hidden');
    if (endpoint.method === 'POST') {
      document.getElementById('request-body').value = '{\n  \n}';
    }
  }

  // clear previous response
  document.getElementById('response-status').classList.add('hidden');
  document.getElementById('response-body').innerHTML = '<code class="text-gray-500">response will appear here</code>';
}

// send request handler
document.getElementById('send-request-btn').addEventListener('click', async () => {
  if (!currentAPI) return;

  const method = document.getElementById('request-method').value;
  const endpoint = document.getElementById('request-endpoint').value;
  const body = document.getElementById('request-body').value;

  await sendRequest(method, endpoint, body);
});

// send api request
async function sendRequest(method, endpoint, bodyText) {
  const statusDiv = document.getElementById('response-status');
  const responseDiv = document.getElementById('response-body');

  // show loading
  statusDiv.className = 'px-3 py-2 rounded-md text-sm font-medium bg-gray-100 text-gray-700';
  statusDiv.textContent = 'sending request...';
  statusDiv.classList.remove('hidden');

  try {
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (method !== 'GET' && method !== 'DELETE' && bodyText.trim()) {
      try {
        options.body = JSON.stringify(JSON.parse(bodyText));
      } catch (e) {
        throw new Error('invalid json in request body');
      }
    }

    const url = currentAPI.url + endpoint;
    const response = await fetch(url, options);

    // update status
    if (response.ok) {
      statusDiv.className = 'px-3 py-2 rounded-md text-sm font-medium bg-green-100 text-green-800';
      statusDiv.textContent = `${response.status} ${response.statusText}`;
    } else {
      statusDiv.className = 'px-3 py-2 rounded-md text-sm font-medium bg-red-100 text-red-800';
      statusDiv.textContent = `${response.status} ${response.statusText}`;
    }

    // parse and display response
    const data = await response.json();
    responseDiv.innerHTML = `<code class="text-gray-900">${JSON.stringify(data, null, 2)}</code>`;
  } catch (error) {
    statusDiv.className = 'px-3 py-2 rounded-md text-sm font-medium bg-red-100 text-red-800';
    statusDiv.textContent = 'request failed';
    responseDiv.innerHTML = `<code class="text-red-600">${error.message}</code>`;
  }
}

// show error message
function showError(message) {
  document.getElementById('loading-section').classList.add('hidden');
  document.getElementById('form-section').classList.remove('hidden');

  // create error alert
  const alert = document.createElement('div');
  alert.className = 'bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-4';
  alert.innerHTML = `
    <div class="flex items-start gap-3">
      <svg class="w-5 h-5 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
      </svg>
      <div>
        <p class="font-medium">generation failed</p>
        <p class="text-sm mt-1">${message}</p>
      </div>
    </div>
  `;

  const formSection = document.getElementById('form-section');
  formSection.insertBefore(alert, formSection.firstChild);

  // remove alert after 5 seconds
  setTimeout(() => alert.remove(), 5000);
}

// update request body visibility based on method
document.getElementById('request-method').addEventListener('change', (e) => {
  const bodySection = document.getElementById('request-body-section');
  if (e.target.value === 'GET' || e.target.value === 'DELETE') {
    bodySection.classList.add('hidden');
  } else {
    bodySection.classList.remove('hidden');
  }
});
