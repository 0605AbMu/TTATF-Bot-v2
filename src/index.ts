import Express from "express";

// Config
import Config from "./config/Config";

const app = Express();

app.listen(Config.APP_PORT, Config.APP_HOST, () => {
  console.info(
    "App running on " + `http://${Config.APP_HOST}:${Config.APP_PORT}/`
  );
});
