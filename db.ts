import mysql from "mysql";
import { config } from "./config/config";

export const db = mysql.createConnection({
  host: config.dbHost,
  user: config.dbUser,
  password: config.dbPassword,
  database: config.dbDatabase,
  socketPath: "/Applications/MAMP/tmp/mysql/mysql.sock",
});
