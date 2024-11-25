import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.join(process.cwd(), '.env'),
});

export default {
  node_env: process.env.NODE_ENV,
  server_port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
};
