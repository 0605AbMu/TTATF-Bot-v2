import { User as tgUser } from "telegraf/typings/core/types/typegram";

export class User {
  public readonly tgData: tgUser;
  public isAdmin: boolean = false;
  public registratedDate: Date;
  constructor(tgData: tgUser) {
    this.tgData = tgData;
  }
}


