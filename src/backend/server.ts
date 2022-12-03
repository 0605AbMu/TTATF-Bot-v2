import Express, { Request, Response } from "express";
import AggFilesBucket from "../telegram-bot/Models/AggrementFilesBucket";

// Config
import Config from "../config/Config";
import path from "path";
import { ObjectId } from "mongodb";

const app = Express();

app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "src", "views"));



app.get("/files/:id", async (req, res, next) => {
  let file_id = req.params.id;
  if (!ObjectId.isValid(file_id)) {
    next(new Error("Is not valid fileId"));
    return;
  }

  let file = await AggFilesBucket.find({ _id: new ObjectId(file_id) }).tryNext();
  if (file == null) {
    next(new Error("File not found"));
    return;
  }
  res.setHeader("Content-Disposition", `attachment; filename="${file._id.toString()}.${file.metadata.extension}"`);
  AggFilesBucket.openDownloadStream(file._id).pipe(res);
})



app.use("*", (req, res, next) => {
  throw new Error("Page Not found");
})

app.use((err: Error, req: Request, res: Response, next: any) => {
  res.render("error", { error: err });
})


app.listen(Config.APP_PORT, Config.APP_HOST, () => {
  console.info(
    "App running on " + `http://${Config.APP_HOST}:${Config.APP_PORT}/`
  );
});

