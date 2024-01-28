const { Client, GatewayIntentBits } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const setStatus = require('./status');
const { token } = require('./config.json');
const { sendLanguageSelection, handleLanguageSelection } = require('./language');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);

  const commands = [
    {
      name: 'weekupdate',
      description: '获取周常更新剩余时间',
    },
  ];

  const rest = new REST({ version: '9' }).setToken(token);

  (async () => {
    try {
      console.log('Started refreshing application (/) commands.');
      await rest.put(
        Routes.applicationCommands(client.user.id),
        { body: commands },
      );
      console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
      console.error(error);
    }
  })();
  setStatus(client);
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.type === InteractionType.ApplicationCommand) {
    const { commandName } = interaction;

    if (commandName === 'weekupdate') {
      await startCountdown(interaction, calculateTimeUntilWednesday());
    }
  } else if (interaction.type === InteractionType.MessageComponent) {
    await handleLanguageSelection(interaction);
  }
});

async function startCountdown(interaction, timeUntilWednesday) {
  const countdownEmbed = {
    description: '周常更新时间剩余:',
    color: 0x00FFFF,
  };

  let countdownMessage;
  try {
    countdownMessage = await interaction.reply({
      content: '',
      embeds: [countdownEmbed],
    });
  } catch (error) {
    console.error('回复消息时出错:', error);
    return;
  }

  const interval = setInterval(async () => {
    if (timeUntilWednesday <= 0) {
      clearInterval(interval);
      try {
        await countdownMessage.edit({
          content: 'Week Update completed!',
          embeds: [],
        });
      } catch (error) {
        console.error('编辑消息时出错:', error);
      }

      // 设置一个定时器在10分钟后删除消息
      setTimeout(async () => {
        try {
          await countdownMessage.delete();
        } catch (error) {
          console.error('删除消息时出错:', error);
        }
      }, 600000); // 10分钟后删除
      return;
    }

    const days = Math.floor(timeUntilWednesday / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeUntilWednesday / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((timeUntilWednesday / (1000 * 60)) % 60);
    const seconds = Math.floor((timeUntilWednesday / 1000) % 60);

    await countdownMessage.edit({
      content: '',
      embeds: [{
        ...countdownEmbed,
        description: `周常更新时间剩余: ${days}d ${hours}h ${minutes}m ${seconds}s`,
      }],
    });

    timeUntilWednesday -= 1000;
  }, 1000);
}

function calculateTimeUntilWednesday() {
  const now = new Date();
  const nextWednesday = new Date(now);
  nextWednesday.setDate(now.getDate() + ((3 + 7 - now.getDay()) % 7));
  nextWednesday.setUTCHours(17, 0, 0, 0); // 下周三凌晨1点的UTC时间

  return nextWednesday - now;
}

client.on('error', error => console.error('Client Error:', error));
process.on('unhandledRejection', error => console.error('Unhandled Promise Rejection:', error));

client.login(token);
