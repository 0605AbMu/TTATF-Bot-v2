import "./backend/server";
import "./telegram-bot/bot";
import Bcrypt from "bcrypt";
console.log(Bcrypt.getRounds("UmGQ3gbtqVU6FJo50wCeeNObQGeEb1BQtKVilLL-W3kcA_OOMYWfCltnqlySOak2g-4PM8E2AGXG5i_t8J8rLw=="));
console.log(Bcrypt.hashSync("e321996638b3bdfe08e4859c99fac1096c6bcdb7571cf85e46212f5da69227a4a", 10))