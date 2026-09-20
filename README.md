# Krys Kollection

Krys Kollection is a card collection website with a static public interface and an Express API backed by SQLite. The API provides collection data, set data, login authentication, and protected card-quantity updates. The website is currently being hosted at https://kryskollection1.onrender.com/collection.html. Please give it a minute or two to open up.

## Project Structure

```text
WebsiteProject/
├── Public/                         # Static website files served by Express
└── Server/
    └── my-sqlite-app/
        ├── db.js                   # SQLite connection
        ├── package.json             # Node.js dependencies and scripts
        ├── routes.js                # API routes
        ├── schema.sql               # Database SQL notes and migrations
        └── server.js                # Express server entry point
```

## Requirements

- Node.js 18 or newer
- npm
- An existing SQLite database containing the tables used by the API, including `users`, `sets`, and `collectionCard`

## Installation

From the server directory:

```powershell
cd Server/my-sqlite-app
npm install
```

## Running the Server

`server.js` reads the port from the `PORT` environment variable. In PowerShell:

```powershell
$env:PORT = "3000"
node server.js
```

The site is then available at:

```text
http://localhost:3000
```

The server also accepts requests from `http://127.0.0.1:3000`.

## Database

The SQLite connection is created in `db.js`. The database file is named `collection.sqlite` and is resolved relative to the directory from which Node.js starts the process. For predictable behavior, start the server from `Server/my-sqlite-app`.

The API expects these tables and fields:

- `users`: `id`, `email`, `password`
- `sets`: set information returned by `GET /api/setData`
- `collectionCard`: `id`, `cardSet`, `quantity`, `reverse_quantity`

Use `schema.sql` as a reference for collection-card SQL changes. A backup should be made before changing the database schema.

## API Endpoints

All API routes are prefixed with `/api`.

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `GET` | `/api/collection` | None | Returns all collection cards |
| `GET` | `/api/setData` | None | Returns available set data |
| `GET` | `/api/collection/151` | None | Returns cards from set `sv03.5` |
| `POST` | `/api/login` | None | Verifies an email and password and returns a JWT |
| `GET` | `/api/verifyToken` | Bearer token | Verifies a JWT and returns the user payload |
| `GET` | `/api/card/quantity/:id` | None | Returns normal and reverse quantities for a card |
| `PUT` | `/api/card/quantity/:id` | Bearer token | Creates or updates a card quantity |

### Login Example

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri http://localhost:3000/api/login `
  -ContentType "application/json" `
  -Body '{"email":"user@example.com","password":"your-password"}'
```

The response contains a token when authentication succeeds. Send it on protected requests with an `Authorization` header:

```text
Authorization: Bearer <token>
```

### Update Quantity Request

`PUT /api/card/quantity/:id` expects JSON similar to:

```json
{
  "type": "normal",
  "newQuantity": 2,
  "reverseExists": true,
  "setId": "sv03.5"
}
```

Set `type` to `reverse` when updating `reverse_quantity`.

## Configuration and Security Notes

- Set `PORT` before starting the server. If it is omitted, the server may not listen on the expected port.
- The JWT signing secret is currently defined in `routes.js`. Replace it with an environment variable before deploying the application.
- Do not commit production credentials, JWT secrets, or the SQLite database if it contains real user data.
- Passwords must be stored as bcrypt hashes in the `users.password` column.

## Available npm Script

The package currently includes a placeholder test script:

```powershell
npm test
```

Automated tests have not yet been configured.
