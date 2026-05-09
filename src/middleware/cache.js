import redis from "../config/redis.js";

const cache =
  (ttl = 3600) =>
  async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    const cached = await redis.get(key);

    if(cached) {
      console.log(`CACHE HIT: ${key}`);
      return res.json(JSON.parse(cached));
    }

    console.log(`CACHE MISS: ${key}`);
    const originalJson = res.json.bind(res);

    res.json = async (data) => {
      await redis.setex(key, ttl, JSON.stringify(data));
      return originalJson(data);
    };

    next();
  };

export default cache;