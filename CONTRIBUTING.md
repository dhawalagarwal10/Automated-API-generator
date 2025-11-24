# contributing to automated api generator

thank you for considering contributing to this project! we welcome contributions from everyone.

## how can i contribute?

### reporting bugs

if you find a bug, please open an issue with:
- clear title and description
- steps to reproduce the bug
- expected vs actual behavior
- your environment (node version, os, etc.)
- screenshots if applicable

### suggesting features

we love feature suggestions! please open an issue with:
- clear description of the feature
- why it would be useful
- example use cases
- any implementation ideas you have

### code contributions

1. **fork the repository**
   ```bash
   # fork on github, then clone your fork
   git clone https://github.com/your-username/Automated-API-generator.git
   cd Automated-API-generator
   ```

2. **create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

3. **make your changes**
   - write clean, readable code
   - follow the existing code style
   - add comments where needed
   - test your changes thoroughly

4. **test your changes**
   ```bash
   npm start
   # test in browser
   # try generating multiple apis
   # test edge cases
   ```

5. **commit your changes**
   ```bash
   git add .
   git commit -m "brief description of changes"
   ```

6. **push and create pull request**
   ```bash
   git push origin feature/your-feature-name
   ```
   then open a pull request on github.

## code style guidelines

### javascript
- use const/let, not var
- use arrow functions where appropriate
- use template literals for strings
- use async/await for promises
- meaningful variable and function names
- comments start with lowercase (e.g., "// validate input")

### formatting
- 2 spaces for indentation
- semicolons at end of statements
- single quotes for strings
- descriptive function names

### example
```javascript
// good
async function generateAPI(schema, businessName) {
  const apiId = uuidv4().slice(0, 8);
  const apiPath = path.join(__dirname, 'generated', apiId);

  try {
    await createDirectory(apiPath);
    return { success: true, apiId };
  } catch (error) {
    console.error('generation failed:', error);
    return { success: false, error: error.message };
  }
}

// avoid
var generate_api = function(s, bn) {
  var id = uuidv4().slice(0, 8)
  // Validate the input
  if(!s) return null
  return id
}
```

## areas we need help with

### high priority
- [ ] add user authentication system
- [ ] implement api rate limiting
- [ ] add postgresql support
- [ ] create docker templates for deployment
- [ ] add comprehensive test suite

### medium priority
- [ ] improve error messages
- [ ] add api versioning support
- [ ] create more code templates
- [ ] add graphql generation option
- [ ] improve ui/ux design

### low priority
- [ ] add dark mode to ui
- [ ] create video tutorials
- [ ] add more examples
- [ ] improve documentation
- [ ] add translations

## project structure

```
├── server/
│   ├── index.js              # main server entry point
│   ├── routes/               # api route definitions
│   ├── controllers/          # request handlers
│   └── services/             # business logic
│       ├── openai.js         # ai integration
│       └── generator.js      # code generation
├── public/
│   ├── index.html            # main ui
│   ├── js/app.js             # frontend logic
│   └── css/styles.css        # custom styles
└── generated/                # where apis are created
```

## testing guidelines

before submitting a pull request:

1. **manual testing**
   - start the server
   - generate at least 3 different apis
   - test all crud operations
   - verify error handling

2. **edge cases**
   - empty inputs
   - very long descriptions
   - special characters
   - multiple entities with relationships

3. **browser testing**
   - test in chrome
   - test in firefox
   - test in safari (if possible)

## questions?

- open an issue for questions
- check existing issues first
- be respectful and patient

## recognition

all contributors will be recognized in the project. significant contributions may result in being added as a project maintainer.

## code of conduct

- be respectful and inclusive
- welcome newcomers
- focus on constructive feedback
- help others learn and grow

thank you for contributing! 🚀
