import express from "express";
import bodyParser from "body-parser";
import jwt from "jwt-express";
import { startOfDatabase } from "./utils/db_handler";
import { routerArtistes } from "./artistes/route";
import { routerMaquette } from "./maquette/route";
import { routerManager } from "./manager/route";
import { errorHandler } from "./utils/error_handler";
import { keyToken } from "./utils/jwt";

startOfDatabase();

const app = express();

app.use(bodyParser.json());
app.use(
  jwt.init(keyToken, {
    cookies: false,
  }),
);

app.get("/", (_req, res) => {
  res.json({ message: "The API is working"});
});


app.use(routerArtistes);
app.use(routerManager);
app.use(routerMaquette);

app.use((_req, res) => {
  res.status(404).json({ message: "This route does not exist" });
});

app.use(errorHandler);

app.listen(3000, () => {
  console.log("listening on port 3000!");
});
