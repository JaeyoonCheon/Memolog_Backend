import { createClient } from "redis";

const client = createClient();
client.connect().then();
client.ping().then();

export default client;
