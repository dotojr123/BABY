import { EventEmitter } from 'events';

export interface Env {
    DB: D1Database;
    BUCKET?: R2Bucket;
    JWT_SECRET: string;
}

// Helper: Hashing de senha usando PBKDF2 (Nativo de Web Crypto)
async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
    );
    const key = await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
    const exportedKey = await crypto.subtle.exportKey('raw', key);
    const hash = btoa(String.fromCharCode(...new Uint8Array(exportedKey)));
    const saltStr = btoa(String.fromCharCode(...salt));
    return `${saltStr}:${hash}`;
}

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
    const [saltStr, originalHash] = storedHash.split(':');
    const salt = new Uint8Array(atob(saltStr).split('').map(c => c.charCodeAt(0)));
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
    );
    const key = await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
    const exportedKey = await crypto.subtle.exportKey('raw', key);
    const hash = btoa(String.fromCharCode(...new Uint8Array(exportedKey)));
    return hash === originalHash;
}

// Helper: JWT Simples (Nativo)
async function generateJWT(payload: any, secret: string) {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const stringifiedPayload = btoa(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) }));
    const token = `${header}.${stringifiedPayload}`;

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const signature = await crypto.subtle.sign('HMAC', key, enc.encode(token));
    const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));

    return `${token}.${signatureBase64}`;
}

async function verifyJWT(token: string, secret: string): Promise<any | null> {
    try {
        const [header, payload, signature] = token.split('.');
        const enc = new TextEncoder();
        const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
        const valid = await crypto.subtle.verify('HMAC', key, new Uint8Array(atob(signature).split('').map(c => c.charCodeAt(0))), enc.encode(`${header}.${payload}`));

        if (!valid) return null;
        const decodedPayload = JSON.parse(atob(payload));
        if (decodedPayload.exp < Date.now() / 1000) return null;
        return decodedPayload;
    } catch {
        return null;
    }
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const url = new URL(request.url);
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        };

        if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

        try {
            // --- AUTH ROUTES ---
            if (url.pathname === '/api/auth/register' && request.method === 'POST') {
                const { email, password, name } = await request.json() as any;
                const userId = crypto.randomUUID();
                const hash = await hashPassword(password);
                await env.DB.prepare('INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)')
                    .bind(userId, email, hash, name).run();
                return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }

            if (url.pathname === '/api/auth/login' && request.method === 'POST') {
                const { email, password } = await request.json() as any;
                const user: any = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();

                // Demo login bypass or normal verification
                const isDemo = email === 'demo@babyapp.com' && password === 'demo123';
                const isVerified = user && !isDemo ? await verifyPassword(password, user.password_hash) : false;

                if (!isDemo && !isVerified) {
                    return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401, headers: corsHeaders });
                }

                // If demo user doesn't exist in DB (unlikely after seed), we use the demo info
                const userData = user || { id: 'demo-u-001', email: 'demo@babyapp.com', name: 'Usuário Demo' };
                const token = await generateJWT({ sub: userData.id, email: userData.email, name: userData.name }, env.JWT_SECRET || 'fallback-secret');
                return new Response(JSON.stringify({ token, user: { id: userData.id, email: userData.email, name: userData.name } }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }

            // --- PROTECTED ROUTES MIDDLEWARE ---
            const authHeader = request.headers.get('Authorization');
            const token = authHeader?.split(' ')[1];
            const payload = token ? await verifyJWT(token, env.JWT_SECRET || 'fallback-secret') : null;

            if (!payload && !url.pathname.startsWith('/api/auth')) {
                return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
            }

            const userId = payload?.sub;

            // --- PROTECTED ENDPOINTS ---

            // Baby Info (Get or Create)
            if (url.pathname === '/api/baby' && request.method === 'GET') {
                let baby: any = await env.DB.prepare('SELECT * FROM babies WHERE user_id = ? LIMIT 1').bind(userId).first();
                if (!baby) {
                    // Auto-create a first baby for a new user
                    const babyId = crypto.randomUUID();
                    await env.DB.prepare('INSERT INTO babies (id, user_id, name) VALUES (?, ?, ?)')
                        .bind(babyId, userId, 'Meu Bebê').run();
                    baby = { id: babyId, name: 'Meu Bebê', user_id: userId };
                }
                return new Response(JSON.stringify(baby), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }

            // Events
            if (url.pathname.startsWith('/api/events')) {
                const id = url.pathname.split('/').pop();
                if (request.method === 'GET') {
                    const babyId = url.searchParams.get('babyId');
                    const { results } = await env.DB.prepare('SELECT e.* FROM events e JOIN babies b ON e.baby_id = b.id WHERE b.user_id = ? AND b.id = ? ORDER BY e.date DESC')
                        .bind(userId, babyId).all();
                    return new Response(JSON.stringify(results), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
                }

                if (request.method === 'POST') {
                    const body: any = await request.json();
                    const newId = crypto.randomUUID();
                    await env.DB.prepare('INSERT INTO events (id, baby_id, type, title, details, date, duration, frequency, completed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
                        .bind(newId, body.babyId, body.type, body.title, body.details, body.date, body.duration, body.frequency, body.completed ? 1 : 0).run();
                    return new Response(JSON.stringify({ id: newId, success: true }), { status: 201, headers: corsHeaders });
                }

                // Update/Delete (Check ownership via JOIN)
                if (request.method === 'PUT' && id && id !== 'events') {
                    const body: any = await request.json();
                    await env.DB.prepare('UPDATE events SET title = ?, details = ?, date = ?, duration = ?, frequency = ?, completed = ? WHERE id = ? AND baby_id IN (SELECT id FROM babies WHERE user_id = ?)')
                        .bind(body.title, body.details, body.date, body.duration, body.frequency, body.completed ? 1 : 0, id, userId).run();
                    return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
                }

                if (request.method === 'DELETE' && id && id !== 'events') {
                    await env.DB.prepare('DELETE FROM events WHERE id = ? AND baby_id IN (SELECT id FROM babies WHERE user_id = ?)')
                        .bind(id, userId).run();
                    return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
                }
            }

            // Documents
            if (url.pathname === '/api/documents' && request.method === 'POST') {
                const formData = await request.formData();
                const file = formData.get('file') as File;
                const babyId = formData.get('babyId') as string;
                const title = formData.get('title') as string;
                const type = formData.get('type') as string;

                const babyCheck = await env.DB.prepare('SELECT id FROM babies WHERE id = ? AND user_id = ?').bind(babyId, userId).first();
                if (!babyCheck) return new Response('Unauthorized baby access', { status: 403, headers: corsHeaders });

                const fileId = crypto.randomUUID();
                const fileName = `${userId}/${babyId}/${fileId}-${file.name}`;

                if (env.BUCKET) {
                    await env.BUCKET.put(fileName, file.stream(), { httpMetadata: { contentType: file.type } });
                }

                await env.DB.prepare('INSERT INTO documents (id, baby_id, title, type, file_path, file_type) VALUES (?, ?, ?, ?, ?, ?)')
                    .bind(fileId, babyId, title, type, env.BUCKET ? fileName : 'LOCAL_STORAGE_ONLY', file.type).run();

                return new Response(JSON.stringify({ id: fileId, success: true }), { headers: corsHeaders });
            }

            if (url.pathname.startsWith('/api/documents/')) {
                const id = url.pathname.split('/').pop();
                if (request.method === 'DELETE' && id && id !== 'documents') {
                    const doc: any = await env.DB.prepare('SELECT d.file_path FROM documents d JOIN babies b ON d.baby_id = b.id WHERE d.id = ? AND b.user_id = ?').bind(id, userId).first();
                    if (doc?.file_path && env.BUCKET) {
                        await env.BUCKET.delete(doc.file_path);
                    }
                    await env.DB.prepare('DELETE FROM documents WHERE id = ? AND baby_id IN (SELECT id FROM babies WHERE user_id = ?)')
                        .bind(id, userId).run();
                    return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
                }
            }

            return new Response('Not Found', { status: 404, headers: corsHeaders });
        } catch (error: any) {
            return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
        }
    },
};
