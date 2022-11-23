import ScheduleListModel from "../Models/ScheduleListModel";
import GetAllScheduleListData from "./GetAllScheduleListsFromHemis";
import logger from "../../logger/logger";

export async function UpdateScheduleList() {
  try {
    let list = await GetAllScheduleListData();
    if (list.length == 0) throw new Error("Schedule list wasn't updated");
    try {
      await ScheduleListModel.deleteMany({});
    } catch (error) {}
    ScheduleListModel.insertMany(list);
  } catch (error) {
    logger?.LogError(error);
  }
}

function TickForUpdating() {
  let b = false;
  setInterval(() => {
    if (new Date().getHours() == 2 && !b) {
      UpdateScheduleList();
      b = true;
      setTimeout(() => {
        b = false;
      }, 61 * 60 * 1000);
    }
    return;
  }, 1);
}
TickForUpdating();
