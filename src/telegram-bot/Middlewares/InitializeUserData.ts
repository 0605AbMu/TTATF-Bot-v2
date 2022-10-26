import MyContext from "../Interfaces/MyContext";
import UserModel, { IUser } from "../Models/UserModel";

async function InitializeUserData(ctx: MyContext, next) {
  let User: IUser = await UserModel.findOne({
    "telegamUser.id": ctx.from.id,
  });

  if (User === null) {
    User = {
      role: "User",
      registratedDate: new Date(Date.now()),
      telegamUser: ctx.from,
      HemisData: null
    };
    User._id = await (await UserModel.insertOne(User)).insertedId;
  }
  ctx.UserData = User;
  next();
}

export default InitializeUserData;
