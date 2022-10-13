export default interface IConfig {
  /**
   * Config Type
   */
  type: string;
  /**
   * Host address of application
   */
  APP_HOST: string;
  /**
   * Port number of app
   */
  APP_PORT: number;
  /**
   * Telegram bot uchun token
   */
  TELEGRAM_BOT_TOKEN: string;
  /**
   * LOG file Path
   */
  LOG_PATH: string;
  /**
   * MongoDB uchun url manzil
   */
  MONGO_URL: string;
  /**
   * Name of database
   */
  MONGO_DB_NAME: string;
}
