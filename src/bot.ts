import { VK } from 'vk-io';
import { token } from './config';
import { writeFile } from 'fs/promises';

const vk = new VK({
  token: token,
});

console.log("[Bot]: +")

vk.updates.on('message_new', async (context) => {
  const message = context.message.text.toLowerCase();
  const angry: string = "😡"
  if (context.isDM) {
    // Обработка команд и логика бота
    if (message === 'привет' || message === 'начать' || message === '/start')
    {
      await context.send(`Привет! Я бот который написан прямиком на TypeScript нафиг ${angry}!!!`);
    } 
    else if (message === 'пока')
    {
      await context.send('Пока! Хорошего дня!');
    } 
    else if (message === '/me' || message.startsWith('/check')) {
      let userId: string;
      if (message === '/me') {
        userId = context.senderId;
      } else {
        const commandParts = message.split(' ');
        if (commandParts.length === 2) {
          if (commandParts[1].startsWith('id')) {
            userId = commandParts[1];
          } else {
            const userInfo = await vk.api.users.get({
              user_ids: commandParts[1],
              fields: ['id'],
            });
            userId = userInfo[0].id;
          }
        } else {
          await context.send('Неверный формат команды. Используйте /check (ид пользователя или домен).');
          return;
        }
      }

      const userInfo = await vk.api.users.get({
        user_ids: userId,
        fields: ['sex', 'city', 'status', 'domain', 'bdate', 'followers_count', 'career', 'personal', 'last_seen', 'counters', 'activities', 'connections'],
      });

      if (userInfo.length === 0) {
        await context.send('Пользователь не найден.');
        return;
      }  
      const { first_name, last_name, sex, city, status, domain, bdate, followers_count, career, personal, last_seen, counters, activities, connections } = userInfo[0];

      let infoMessage = `${first_name} ${last_name}\n`;
      infoMessage += `Пол: ${sex === 1 ? 'Женский' : 'Мужской'}\n`;
      infoMessage += `Город: ${city ? city.title : 'Не указан'}\n`;
      infoMessage += `Статус: ${status ? status : 'Не указан'}\n`;
      infoMessage += `Домен: ${domain ? domain : 'Не указан'}\n`;
      infoMessage += `Дата рождения: ${bdate ? bdate : 'Не указана'}\n`;
      infoMessage += `Количество подписчиков: ${followers_count ? followers_count : '0'}\n`;
      infoMessage += `Языки: ${personal ? personal.langs : 'Не указаны'}\n`;
      infoMessage += `Количество друзей: ${counters ? counters.friends : '0'}\n`;
      infoMessage += `Последний визит: ${last_seen ? new Date(last_seen.time * 1000).toLocaleString() : 'Неизвестно'}\n`;
      infoMessage += `Активности: ${activities ? activities : 'Не указаны'}\n`;
      infoMessage += `Количество сообществ: ${counters ? counters.groups : '0'}\n`;
      infoMessage += `Количество групп: ${counters ? counters.groups : '0'}`;

      await context.send(infoMessage);

      const jsonContent = JSON.stringify(userInfo[0], null, 2);
      const fileName = `users/user_${userId}.json`;

      try {
        await writeFile(fileName, jsonContent, 'utf8');
        console.log("Записано!");
      } catch (error) {
        console.log("Не записано");
        console.error(error);
      }
    } 
  }
  else {
    await context.send('Извини, я не понимаю.');
  }
});

vk.updates.start().catch(console.error);
