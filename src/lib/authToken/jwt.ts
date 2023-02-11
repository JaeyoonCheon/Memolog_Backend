import { promisify } from "util";
import * as jwt from "jsonwebtoken";

const redisClient = require("../../database/redis/client");
const SECRET: jwt.Secret = process.env.SALT || "";

const sign = (userId: Number) => {
  const payload = {
    id: userId,
  };

  return jwt.sign(payload, SECRET, {
    algorithm: "HS256",
    expiresIn: "1h",
  });
};

const verify = (token: string) => {
  try {
    const decodedToken = jwt.verify(token, SECRET);
    return decodedToken;
  } catch (e) {
    return e;
  }
};

const refresh = () => {
  return jwt.sign({}, SECRET, {
    algorithm: "HS256",
    expiresIn: "7d",
  });
};

const refreshVerify = async (token: string, userId: Number) => {
  const getRedisAsync = promisify(redisClient.get).bind(redisClient);

  try {
    const refreshData = await getRedisAsync(userId);

    if (token === refreshData) {
      try {
        jwt.verify(token, SECRET);
        return true;
      } catch (err) {
        return false;
      }
    } else {
      return false;
    }
  } catch (err) {
    return false;
  }
};

export { sign, verify, refresh, refreshVerify };
