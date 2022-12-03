import { createReport } from "docx-templates";
import fs from "fs";
import { Student as TStudent } from "../../Models/StudentModel";
import AggBucket from "../../Models/AggrementFilesBucket";
import { ObjectId } from "mongodb";
import Config from "../../../config/Config";
import qrCode from "qrcode";
import path from "path";
import { Readable } from "node:stream";
class Service {
  private template: Buffer;
  private templateFilePath: string = path.join(process.cwd(), "src", "telegram-bot", "Services", "Aggrement Maker Service", "template.docx");
  private constructor() { }
  public async CreateDocumentAsync(data: TStudent): Promise<ObjectId> {
    try {
      if (this.template == undefined) await this.InitializeTemplate();
      let tempData = await this.CreateFullData(data);
      await this.SaveToBucket(
        tempData.id,
        await this.CreateReport(tempData),
        data.login
      );
      return tempData.id;
    } catch (error) {
      throw error;
    }
  }
  private CreateReport(data): Promise<Uint8Array> {
    return new Promise(async (res, rej) => {
      try {
        res(
          await createReport({
            template: this.template,
            data: data,
            cmdDelimiter: ["{{", "}}"],
            failFast: true,
            rejectNullish: false,
            errorHandler(e, raw_code?) {

            },
          })
        );
      } catch (error) {
        rej(error);
      }
    });
  }
  private SaveToBucket(
    fileId: ObjectId,
    data: Uint8Array,
    student_id_number: string
  ): Promise<void> {
    return new Promise((res, rej) => {
      let docStream = AggBucket.openUploadStreamWithId(fileId, "", {
        metadata: { extension: ".docx", studentId: student_id_number },
      });
      Readable.from(Buffer.from(data)).pipe(docStream);
      docStream.on("unpipe", res);
    });
  }
  private CreateQrCode(fileId: ObjectId): Promise<{
    width: number;
    height: number;
    data: ArrayBuffer;
    extension: string;
  }> {
    const URLPath =
      Config.APP_HOST + ":" + Config.APP_PORT + "/file/" + fileId.toString();
    return new Promise(async (res, rej) => {
      qrCode.toBuffer(URLPath, { color: {}, type: "png" }, (err, buffer) => {
        if (err) rej(err);
        res({
          width: 3,
          height: 3,
          extension: ".png",
          data: buffer,
        });
      });
    });
  }
  private async CreateFullData(data: TStudent) {
    let date = new Date(Date.now());
    let id = new ObjectId();
    return {
      date: {
        day: date.getDate(),
        month: date.getMonth() + 1,
        year: date.getFullYear(),
      },
      orderNumber:
        Config.LAST_AGGREMENT_FILE_ORDER + (await AggBucket.find().count()),
      id: id,
      qrCode: await this.CreateQrCode(id),
      data: data,
    };
  }

  private InitializeTemplate(): Promise<true> {
    return new Promise((res, rej) => {
      if (fs.existsSync(this.templateFilePath))
        fs.readFile(this.templateFilePath, (err, data) => {
          if (err != null) rej(err);
          this.template = data;
          res(true);
        });
      else rej(new Error("document not found"));
    });
  }

  private static _instance: Service;
  public static get Instance(): Service {
    if (this._instance == null) this._instance = new Service();
    return this._instance;
  }
}

export default Service.Instance;
