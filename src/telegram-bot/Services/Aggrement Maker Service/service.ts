import { createReport } from "docx-templates";
import fs from "fs";
import MyContext from "../../Interfaces/MyContext";

export default class Service {
  private template: Buffer;
  private templateFilePath: string = "./template.docx";
  private constructor() {}

  public CreateReport(ctx: MyContext): Promise<Buffer> {
    try {
    } catch (error) {}
  }

  private InitializeTemplate(): Promise<true> {
    return new Promise((res, rej) => {
      fs.readFile(this.templateFilePath, (err, data) => {
        if (err != null) rej(err);
        this.template = data;
      });
    });
  }

  private _instance: Service;
  public get Instance(): Service {
    if (this._instance == null) this._instance = new Service();
    return this._instance;
  }
}

createReport();
