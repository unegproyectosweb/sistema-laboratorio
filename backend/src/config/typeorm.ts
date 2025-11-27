import "dotenv/config";

import { DataSource } from "typeorm";
import { databaseConfig } from "./database.js";

const config = databaseConfig();

export const dataSource = new DataSource(config);
