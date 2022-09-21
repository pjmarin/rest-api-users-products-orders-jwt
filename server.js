const http = require("http");
const app = require("./app");

const port = process.env.port || 3080;

const server = http.createServer(app);

console.log("La variable process.env.port tiene el valor: ", process.env.port);
console.log("La variable port tiene el valor: ", port);

server.listen(port);