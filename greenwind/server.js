const crypto = require('node:crypto');
const path = require('node:path');
const jsonServer = require('json-server');

/**
 * ---------------------------------------------------------
 * GreenWind REST API (json-server + server-side authorization)
 * ---------------------------------------------------------
 * Access policy, enforced here and not in the frontend:
 *   - Public:     GET / HEAD / OPTIONS on everything (read-only browsing of projects).
 *   - Public:     PUT /projects/:id, restricted to turbine placement. Only the `hasTurbine` flags are
 *                 taken from the request; every other field comes from the stored project, and the
 *                 placement rules (Grass only, no adjacent turbines) are re-validated on the server.
 *   - Admin only: every other request (POST, PATCH, DELETE, PUT on anything else). Needs
 *                 `Authorization: Bearer <ADMIN_TOKEN>`. Without ADMIN_TOKEN set, admin operations
 *                 are disabled (fail closed).
 *
 * The admin token lives only in the server's environment and in the CLI import tool's environment.
 * It is never bundled into the frontend.
 */

const PORT = Number(process.env.PORT) || 3000;
const DB_FILE = path.resolve(process.env.DB_FILE || path.join(__dirname, 'database.json'));
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';

const PUBLIC_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const PROJECT_ITEM_PATH = /^\/projects\/([^/]+)\/?$/i;
const NEIGHBOR_OFFSETS = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];

function sha256(value) {
    return crypto.createHash('sha256').update(value).digest();
}

// Constant-time comparison of the presented bearer token against ADMIN_TOKEN
function isAdmin(req) {
    if (!ADMIN_TOKEN) return false;
    const match = /^Bearer\s+(.+)$/i.exec(req.get('authorization') || '');
    if (!match) return false;
    return crypto.timingSafeEqual(sha256(match[1].trim()), sha256(ADMIN_TOKEN));
}

/**
 * Builds the project that a public PUT is allowed to produce: the stored project with only the
 * turbine flags replaced. Returns { project } on success or { error } when the request is invalid.
 */
function applyTurbinePlacement(stored, body) {
    if (!body || !Array.isArray(body.cells))
        return { error: 'Request body must contain a cells array.' };

    if (body.cells.length !== stored.cells.length)
        return { error: 'The cells array must match the stored map.' };

    const requested = new Map();
    for (const cell of body.cells) {
        if (!cell || typeof cell.hasTurbine !== 'boolean')
            return { error: 'Every cell needs a boolean hasTurbine value.' };
        requested.set(`${cell.x},${cell.y}`, cell.hasTurbine);
    }

    const cells = stored.cells.map(cell => {
        const key = `${cell.x},${cell.y}`;
        return { ...cell, hasTurbine: requested.has(key) ? requested.get(key) : cell.hasTurbine };
    });

    if (requested.size !== stored.cells.length || cells.some(c => !requested.has(`${c.x},${c.y}`)))
        return { error: 'The cell coordinates must match the stored map.' };

    const byCoord = new Map(cells.map(c => [`${c.x},${c.y}`, c]));
    for (const cell of cells) {
        if (!cell.hasTurbine) continue;
        if (cell.type !== 'Grass')
            return { error: `Turbines can only be placed on Grass (cell ${cell.x},${cell.y}).` };
        const crowded = NEIGHBOR_OFFSETS.some(([dx, dy]) => byCoord.get(`${cell.x + dx},${cell.y + dy}`)?.hasTurbine);
        if (crowded)
            return { error: `Turbines cannot be adjacent to each other (cell ${cell.x},${cell.y}).` };
    }

    return { project: { ...stored, cells } };
}

function createApp() {
    const server = jsonServer.create();
    const router = jsonServer.router(DB_FILE);

    server.use(jsonServer.defaults({ logger: process.env.NODE_ENV !== 'test' }));
    server.use(jsonServer.bodyParser);

    server.use((req, res, next) => {
        // The router's method-override would otherwise let a POST turn into DELETE/PUT after this check
        delete req.headers['x-http-method-override'];

        if (PUBLIC_METHODS.has(req.method)) return next();
        if (isAdmin(req)) return next();

        const itemMatch = PROJECT_ITEM_PATH.exec(req.path);
        if (req.method === 'PUT' && itemMatch) {
            const id = decodeURIComponent(itemMatch[1]);
            const stored = router.db.get('projects').find({ id }).value();
            if (!stored) return res.status(404).json({ error: 'Project not found.' });

            const { project, error } = applyTurbinePlacement(stored, req.body);
            if (error) return res.status(422).json({ error });

            req.body = project;
            return next();
        }

        if (req.get('authorization'))
            return res.status(403).json({ error: 'Invalid admin token.' });
        res.set('WWW-Authenticate', 'Bearer');
        return res.status(401).json({ error: 'Admin authentication required.' });
    });

    server.use(router);
    return server;
}

if (require.main === module) {
    createApp().listen(PORT, () => {
        console.log(`GreenWind API running on port ${PORT} (database: ${DB_FILE})`);
        if (!ADMIN_TOKEN)
            console.warn('ADMIN_TOKEN is not set: admin operations (import, delete) are disabled.');
    });
}

module.exports = { createApp, applyTurbinePlacement };
