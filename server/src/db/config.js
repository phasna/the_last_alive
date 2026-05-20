export function getMysqlConfig() {
  return {
    host: process.env.MYSQL_HOST || "127.0.0.1",
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD ?? "",
    database: process.env.MYSQL_DATABASE || "last_one_alive",
  };
}

export function getConnectionLabel() {
  const { host, port, database, user } = getMysqlConfig();
  return `${user}@${host}:${port}/${database}`;
}
