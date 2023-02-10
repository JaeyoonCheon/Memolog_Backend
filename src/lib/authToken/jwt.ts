const { promisify } = require("util");
const jwt = require("jsonwebtoken");

const redisClient = require("../../database/redis/client");
const SECRET = process.env.SALT;

const sign = (userId: Number) => {
  const payload = {
    id: userId,
  };

  return jwt.sign(payload, SECRET, {
    algorithm: "HS256",
    expiresIn: "1h",
  });
};

const verify = (token: any) => {
  let decodedToken = null;
  try {
    decodedToken = jwt.verify(token, SECRET);
    return {
      ok: true,
      id: decodedToken.id,
    };
  } catch (e: any) {
    return {
      ok: false,
      message: e.message,
    };
  }
};

const refresh = () => {
  return jwt.sign({}, SECRET, {
    algorithm: "HS256",
    expiresIn: "7d",
  });
};

const refreshVerify = async (token: any, userId: Number) => {
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

module.exports = {
  sign,
  verify,
  refresh,
  refreshVerify,
};
