import { createClient } from "redis";

const client = createClient();

(async () => {
  try {
    await client.connect();
  } catch (e) {
    console.log(e);
  }
})();

export default client;
