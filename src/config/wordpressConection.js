import mysql from "mysql2/promise";

export const wordpressDB = await mysql.createPool({
  host: "62.146.183.165",
  user: "nov13sid_gise",
  password: "NYhGjfATQAVe", // o la que tengas
  database: "nov13sid_w787",
});