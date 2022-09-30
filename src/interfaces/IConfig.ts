export default interface IConfig {
  BOT_TOKEN: string;
  HOST: string;
  PORT: number;
  MONGO: {
    URL: string;
    DBNAME: string;
  };
}
