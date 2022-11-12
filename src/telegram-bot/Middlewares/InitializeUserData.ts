import MyContext from "../Interfaces/MyContext";
import UserModel, { IUser } from "../Models/UserModel";
import StudentModel, { IStudent } from "../Models/StudentModel";

async function InitializeUserData(ctx: MyContext, next) {
  let User: IUser = await UserModel.findOne({
    "telegamUser.id": ctx.from.id,
  });

  if (User === null) {
    User = {
      role: "User",
      registratedDate: new Date(Date.now()),
      telegamUser: ctx.from,
      StudentData: null,
    };
    User._id = await (await UserModel.insertOne(User)).insertedId;
  }

  ctx.UserData = {
    registratedDate: User.registratedDate,
    role: User.role,
    telegamUser: User.telegamUser,
    _id: User._id,
    StudentData: User.StudentData,
  };
  next();
}

export default InitializeUserData;
