const http = require("http");
const { createClient } = require("redis");

const PORT = process.env.BACKEND_PORT || 3001;
const REDIS_HOST = process.env.REDIS_HOST || "cache";
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const redisUrl = `redis://${REDIS_HOST}:${REDIS_PORT}`;
const client = createClient({ url: redisUrl });

client.on("error", (err) => console.error("Redis error:", err));

async function connectRedis() {
  try {
    await client.connect();
    console.log(`Connecté à Redis sur ${REDIS_HOST}:${REDIS_PORT}`);
  } catch (err) {
    console.error("Erreur connexion Redis:", err.message);
    process.exit(1);
  }
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try { resolve(JSON.parse(body)); } 
      catch { reject(new Error("JSON invalide")); }
    });
    req.on("error", reject);
  });
}

function sendJSON(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "GET" && req.url === "/health") {
    try {
      await client.ping();
      sendJSON(res, 200, { status: "ok", redis: "connected" });
    } catch {
      sendJSON(res, 503, { status: "error", redis: "disconnected" });
    }
    return;
  }

  if (req.method === "GET" && req.url === "/tasks") {
    try {
      const ids = await client.sMembers("tasks:ids");
      const tasks = [];
      for (const id of ids) {
        const task = await client.hGetAll(`task:${id}`);
        if (task && task.id) {
          task.completed = task.completed === "true";
          tasks.push(task);
        }
      }
      tasks.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      sendJSON(res, 200, tasks);
    } catch (err) {
      sendJSON(res, 500, { error: err.message });
    }
    return;
  }

  if (req.method === "POST" && req.url === "/tasks") {
    try {
      const { title } = await parseBody(req);
      if (!title || !title.trim()) {
        sendJSON(res, 400, { error: "Le champ title est requis" });
        return;
      }
      const id = generateId();
      const task = {
        id,
        title: title.trim(),
        completed: "false",
        created_at: new Date().toISOString(),
      };
      await client.hSet(`task:${id}`, task);
      await client.sAdd("tasks:ids", id);
      task.completed = false;
      sendJSON(res, 201, task);
    } catch (err) {
      sendJSON(res, 500, { error: err.message });
    }
    return;
  }

  const patchMatch = req.url.match(/^\/tasks\/([a-z0-9]+)$/);
  if (req.method === "PATCH" && patchMatch) {
    try {
      const id = patchMatch[1];
      const exists = await client.exists(`task:${id}`);
      if (!exists) {
        sendJSON(res, 404, { error: "Tâche introuvable" });
        return;
      }
      const current = await client.hGet(`task:${id}`, "completed");
      const newVal = current === "true" ? "false" : "true";
      await client.hSet(`task:${id}`, "completed", newVal);
      const task = await client.hGetAll(`task:${id}`);
      task.completed = task.completed === "true";
      sendJSON(res, 200, task);
    } catch (err) {
      sendJSON(res, 500, { error: err.message });
    }
    return;
  }

  const deleteMatch = req.url.match(/^\/tasks\/([a-z0-9]+)$/);
  if (req.method === "DELETE" && deleteMatch) {
    try {
      const id = deleteMatch[1];
      const exists = await client.exists(`task:${id}`);
      if (!exists) {
        sendJSON(res, 404, { error: "Tâche introuvable" });
        return;
      }
      await client.del(`task:${id}`);
      await client.sRem("tasks:ids", id);
      sendJSON(res, 200, { deleted: id });
    } catch (err) {
      sendJSON(res, 500, { error: err.message });
    }
    return;
  }

  sendJSON(res, 404, { error: "Route introuvable" });
});

connectRedis().then(() => {
  server.listen(PORT, () => {
    console.log(`TaskFlow API démarrée sur le port ${PORT}`);
  });
});