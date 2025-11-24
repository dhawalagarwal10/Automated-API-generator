# usage examples

this document provides practical examples of how to use the automated api generator.

## example 1: bookstore api

### input
```
business name: my online bookstore
description: we sell books online, manage inventory, and track customer orders
data entities: books with title, author, price, isbn, stock quantity.
               customers with name, email, phone number.
               orders with customer, books, total price, order date.
operations: create, read, update, delete
```

### what you get
- complete rest api with 3 entities (books, customers, orders)
- 15 endpoints for full crud operations
- relationships between entities (orders → customers)
- sqlite database with proper schema

### example requests
```bash
# create a book
curl -X POST http://localhost:4000/api/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "the great gatsby",
    "author": "f. scott fitzgerald",
    "price": 12.99,
    "isbn": "9780743273565",
    "stock_quantity": 50
  }'

# get all books
curl http://localhost:4000/api/books

# get single book
curl http://localhost:4000/api/books/1

# update book
curl -X PUT http://localhost:4000/api/books/1 \
  -H "Content-Type: application/json" \
  -d '{
    "stock_quantity": 45
  }'

# delete book
curl -X DELETE http://localhost:4000/api/books/1
```

---

## example 2: task management api

### input
```
business name: taskflow
description: simple task management for teams
data entities: tasks with title, description, status, due date, priority.
               users with name, email, role.
operations: create, read, update, delete
```

### what you get
- api for managing tasks and users
- status tracking (todo, in progress, done)
- priority levels
- user assignment capabilities

### example requests
```bash
# create a task
curl -X POST http://localhost:4000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "implement login feature",
    "description": "add user authentication",
    "status": "todo",
    "priority": "high",
    "due_date": "2024-12-31"
  }'

# get all tasks
curl http://localhost:4000/api/tasks

# update task status
curl -X PUT http://localhost:4000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in progress"
  }'
```

---

## example 3: restaurant menu api

### input
```
business name: bella cucina
description: italian restaurant managing menu items and orders
data entities: menu items with name, description, category, price, available.
               orders with items, table number, status, total.
operations: create, read, update, delete
```

### what you get
- menu management system
- order tracking
- category organization (appetizers, mains, desserts)
- availability status

### example requests
```bash
# add menu item
curl -X POST http://localhost:4000/api/menuitems \
  -H "Content-Type: application/json" \
  -d '{
    "name": "margherita pizza",
    "description": "fresh mozzarella, tomatoes, basil",
    "category": "main",
    "price": 14.99,
    "available": true
  }'

# get available items
curl http://localhost:4000/api/menuitems

# create order
curl -X POST http://localhost:4000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "table_number": 5,
    "items": "margherita pizza, caesar salad",
    "status": "preparing",
    "total": 22.98
  }'
```

---

## example 4: fitness tracker api

### input
```
business name: fittrack
description: track workouts and fitness goals
data entities: workouts with exercise, duration, calories, date.
               goals with target, current, deadline, achieved.
operations: create, read, update, delete
```

### what you get
- workout logging system
- goal tracking
- progress monitoring
- date-based queries

---

## example 5: inventory management api

### input
```
business name: stockmaster
description: warehouse inventory management
data entities: products with sku, name, quantity, location, supplier.
               suppliers with name, contact, email, phone.
operations: create, read, update, delete
```

### what you get
- product tracking
- supplier management
- stock level monitoring
- location tracking

---

## tips for better results

### be specific about data
❌ **vague**: "user information"
✅ **specific**: "users with full name, email, password hash, registration date, role"

### describe relationships
❌ **incomplete**: "orders and products"
✅ **complete**: "orders belong to customers. each order contains multiple products with quantity"

### mention data types naturally
the ai understands natural descriptions:
- "price" → infers decimal/float
- "email" → infers string with validation
- "is_active" → infers boolean
- "created_at" → infers timestamp
- "quantity" → infers integer

### use common terminology
- **CRUD** operations (create, read, update, delete)
- **relationships**: "belongs to", "has many", "links to"
- **constraints**: "required", "unique", "optional"

---

## testing your generated api

### 1. use the sandbox
the built-in sandbox provides an interactive way to test endpoints without writing code.

### 2. use curl
```bash
# create
curl -X POST http://localhost:4000/api/items -H "Content-Type: application/json" -d '{"name":"test"}'

# read all
curl http://localhost:4000/api/items

# read one
curl http://localhost:4000/api/items/1

# update
curl -X PUT http://localhost:4000/api/items/1 -H "Content-Type: application/json" -d '{"name":"updated"}'

# delete
curl -X DELETE http://localhost:4000/api/items/1
```

### 3. use postman or insomnia
import the generated api documentation into these tools for a better testing experience.

---

## what to do with your generated api

### 1. test it locally
use the sandbox to verify everything works as expected.

### 2. download the code
navigate to the `generated/{api-id}` folder to see all the code.

### 3. customize if needed
the generated code is clean and readable. you can modify it to add:
- authentication
- validation rules
- custom business logic
- additional endpoints

### 4. deploy it
deploy to any node.js hosting platform:
- heroku
- railway
- vercel
- digital ocean
- aws ec2

### 5. integrate with your frontend
use the api in your web or mobile app. all endpoints return json and accept json.

---

## common questions

**q: can i modify the generated code?**
a: yes! the code is yours. modify it as needed.

**q: can i add authentication later?**
a: yes. add passport.js or jwt middleware to the generated code.

**q: how do i deploy the generated api?**
a: copy the generated folder to your hosting platform and run `npm install && npm start`.

**q: can i use a different database?**
a: yes. replace sqlite with postgresql or mysql by updating the database.js file.

**q: does it support file uploads?**
a: not yet. this is on the roadmap.

---

## need help?

- check the main README.md for setup instructions
- open an issue for bugs or questions
- review the generated code to understand the structure
