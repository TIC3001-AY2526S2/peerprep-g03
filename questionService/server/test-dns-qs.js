import dns from "node:dns/promises";

const hosts = [
  "_mongodb._tcp.peerprepg03.l2ceiwp.mongodb.net",   // working cluster
  "_mongodb._tcp.userservice.zksviqz.mongodb.net",   // failing cluster
];

for (const host of hosts) {
  try {
    const records = await dns.resolveSrv(host);
    console.log(`OK: ${host}`);
    console.log(records);
  } catch (err) {
    console.log(`FAIL: ${host}`);
    console.error(err);
  }
}