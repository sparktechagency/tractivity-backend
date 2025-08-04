import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.join(process.cwd(), '.env'),
});

export default {
  // server env
  node_env: process.env.NODE_ENV,
  server_port: process.env.PORT,
  database_url: process.env.DATABASE_URL,

  // jwt env
  jwt_access_token_secret: process.env.JWT_ACCESS_TOKEN_SECRET,
  jwt_access_token_expiresin: process.env.JWT_ACCESS_TOKEN_EXPIRESIN,
  jwt_refresh_token_secret: process.env.JWT_REFRESH_TOKEN_SECRET,
  jwt_refresh_token_expiresin: process.env.JWT_REFRESH_TOKEN_EXPIRESIN,

  // SMTP credentials
  gmail_app_user: process.env.GMAIL_APP_USER,
  gmail_app_password: process.env.GMAIL_APP_PASSWORD,

  playstore: process.env.PLAYSOTRE,
  appstore: process.env.APPSTORE,
};
