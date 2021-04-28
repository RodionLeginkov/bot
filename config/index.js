require('dotenv').config({ path: `${__dirname}/../.env` });

module.exports = {
  app: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    port: process.env.PORT || 3000,
    serviceDownTimeout: process.env.SERVICE_DOWN_TIMEOUT || 180000,
    telegramUserIds: JSON.parse(process.env.TELEGRAM_USER_IDS),
    dynamoDbTableName: process.env.DYNAMODB_TABLENAME,
    //
  },
};
