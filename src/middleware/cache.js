import redis from "../config/redis.js";

const cache =
  (ttl = 3600) =>
  async (req, res, next) => {
    try {
      const key = `cache:${req.originalUrl}`;
      const cached = await redis.get(key);

      if (cached) {
        console.log(`CACHE HIT: ${key}`);
        return res.json(JSON.parse(cached));
      }

      console.log(`CACHE MISS: ${key}`);
      const originalJson = res.json.bind(res);

      res.json = (data) => {
        redis.setex(key, ttl, JSON.stringify(data)).catch((err) =>
          console.error("Redis setex error:", err)
        );
        return originalJson(data);
      };

      next();
    } catch (err) {
      console.error("Cache middleware error:", err);
      next();
    }
  };

export default cache;