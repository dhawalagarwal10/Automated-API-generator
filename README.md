# automated api generator

generate production-ready REST APIs from natural language descriptions using AI.

## what is this?

a web application that lets business owners and developers generate fully functional REST APIs by simply describing their business needs in plain English. no coding required - just describe what you want, and get a working API with a sandbox to test it.

## key features

- **ai-powered schema generation** - describe your data in natural language, ai figures out the structure
- **instant api creation** - generates complete express.js apis with CRUD operations
- **built-in sandbox** - test your api immediately with an interactive request builder
- **sqlite database** - each api gets its own database, ready to use
- **full code export** - download and self-host your generated apis
- **zero vendor lock-in** - own your code completely

## how it works

1. visit the web app
2. describe your business and data needs
3. ai analyzes and generates an api schema
4. system creates a complete express api with database
5. test immediately in the interactive sandbox
6. download and deploy anywhere

## tech stack

- **frontend**: vanilla javascript + tailwind css
- **backend**: node.js + express
- **ai**: openai gpt-4 for requirement parsing
- **generated apis**: express + sqlite
- **database**: sqlite per api instance

## getting started

### prerequisites

- node.js 16+ installed
- openai api key ([get one here](https://platform.openai.com/api-keys))

### installation

1. clone the repository
```bash
git clone <repository-url>
cd Automated-API-generator
```

2. install dependencies
```bash
npm install
```

3. create environment file
```bash
cp .env.example .env
```

4. add your openai api key to `.env`
```
OPENAI_API_KEY=your_key_here
PORT=3000
NODE_ENV=development
```

5. start the server
```bash
npm start
```

6. open your browser
```
http://localhost:3000
```

## usage example

### input
```
business name: my bookstore
description: we sell books online and manage inventory
data entities: books with title, author, price, isbn. customers with name, email, phone.
operations: create, read, update, delete
```

### output
a complete rest api with:
- `GET /api/books` - list all books
- `GET /api/books/:id` - get single book
- `POST /api/books` - create book
- `PUT /api/books/:id` - update book
- `DELETE /api/books/:id` - delete book
- similar endpoints for customers
- sqlite database with proper schema
- full crud functionality

## project structure

```
├── server/
│   ├── index.js              # main server
│   ├── routes/
│   │   └── api.js            # api routes
│   ├── controllers/
│   │   └── apiController.js  # request handlers
│   └── services/
│       ├── openai.js         # ai integration
│       └── generator.js      # code generation
├── public/
│   ├── index.html            # frontend ui
│   ├── js/
│   │   └── app.js            # frontend logic
│   └── css/
│       └── styles.css        # custom styles
├── generated/                # generated apis stored here
└── templates/                # code templates
```

## generated api structure

each generated api includes:
```
generated/{api-id}/
├── index.js          # main server file
├── database.js       # database setup
├── models/           # data models
│   └── entity.js
├── routes/           # api routes
│   └── entity.js
├── package.json      # dependencies
└── README.md         # api documentation
```

## development

```bash
# install dependencies
npm install

# start development server (with auto-reload)
npm run dev

# start production server
npm start
```

## limitations (v1.0)

- no authentication/authorization (coming soon)
- no file upload support
- no real-time features (websockets)
- sqlite only (postgres support planned)
- single server deployment
- no user accounts yet

## roadmap

- [ ] user authentication and accounts
- [ ] postgresql/mysql support
- [ ] docker containerization for generated apis
- [ ] custom domain support
- [ ] api versioning
- [ ] rate limiting
- [ ] webhook support
- [ ] graphql option
- [ ] typescript generation
- [ ] deployment integrations (vercel, railway, etc.)

## contributing

contributions welcome! please:
1. fork the repository
2. create a feature branch
3. make your changes
4. test thoroughly
5. submit a pull request

## license

MIT license - see LICENSE file for details

## support

- open an issue for bugs
- discussions for questions and ideas
- check existing issues before creating new ones

## acknowledgments

- built with node.js and express
- powered by openai gpt-4
- ui styled with tailwind css

---

**note**: this is a proof of concept. use generated apis in production at your own discretion. always review generated code before deploying to production environments.
