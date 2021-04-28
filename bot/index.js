process.env.NTBA_FIX_319 = 1;
const TG = require('node-telegram-bot-api');
const config = require('../config/index').app;
const logger = require('../helpers/logger');

const bot = new TG(config.botToken, { polling: true });
bot.on('message', (message) => { bot.sendMessage(message.chat.id, '🐥'); });

const mapAsync = (arr, func) => Promise.all(arr.map(func));

const sendMessage = async (text) => {
  try {
    mapAsync(config.telegramUserIds, (id) => bot.sendMessage(id, text));
  } catch (err) {
    console.log('Error send messages', err);
  }
};

const alert = async (serviceName, status, queueName) => {
  const messagesTemplates = {
    DOWN: `❌ ${serviceName} IS DOWN ${queueName ? `(jam in ${queueName})` : ''}`,
    UP: `✅ ${serviceName} IS UP`,
  };
  await sendMessage(messagesTemplates[status]);
};

class MonitoringUnit {
  constructor(name) {
    this.name = name;
    this.timeout = true;
    this.reset();
  }

  async reset() {
    if (!this.timeout) {
      await alert(this.name, 'UP');
    }
    clearTimeout(this.timeout);
    this.timeout = setTimeout(async () => {
      try {
        this.timeout = null;
        await alert(this.name, 'DOWN');
      } catch (err) {
        logger.info(`${this.name} Can't send message`);
        logger.error(err);
      }
    }, config.serviceDownTimeout);
  }
}

module.exports = {
  sendMessage,
  alert,
  MonitoringUnit,
};
