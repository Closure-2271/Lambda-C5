const { Client, GatewayIntentBits } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const setStatus = require('./status');
const { token } = require('./config.json');

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
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'weekupdate') {
    await startCountdown(interaction, calculateTimeUntilWednesday());
  }
});

async function startCountdown(interaction, timeUntilWednesday) {
  const countdownEmbed = {
    description: '周常更新时间剩余:',
    color: 0x00FFFF,
  };

  const countdownMessage = await interaction.reply({
    content: '',
    embeds: [countdownEmbed],
  });

  const interval = setInterval(async () => {
    if (timeUntilWednesday <= 0) {
      clearInterval(interval);
      await countdownMessage.edit({
        content: 'Week Update completed!',
        embeds: [],
      });
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
        description: `周常更新时间剩余: ${days}d ${hours}h ${minutes}m ${seconds}s :clock1:`,
      }],
    });

    timeUntilWednesday -= 1000;
  }, 1000);
}

function calculateTimeUntilWednesday() {
  const now = new Date();
  const nextWednesday = new Date(now);
  nextWednesday.setDate(now.getDate() + ((3 + 7 - now.getDay()) % 7));
  nextWednesday.setUTCHours(17, 0, 0, 0);

  return nextWednesday - now;
}

client.on('error', error => console.error('Client Error:', error));
process.on('unhandledRejection', error => console.error('Unhandled Promise Rejection:', error));

client.login(token);
