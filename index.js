const { Client, GatewayIntentBits } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { setTimeout } = require('timers/promises');
const  setStatus  = require('./status');
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

async function updateCountdown(message, timeUntilWednesday) {
  const countdownEmbed = {
    description: '周常更新时间剩余:',
    color: 0x3498db, // 设置颜色，可以根据需要调整
  };

  const countdownMessage = await message.reply({
    content: '',
    embeds: [countdownEmbed],
  });

  while (timeUntilWednesday > 0) {
    const days = Math.floor(timeUntilWednesday / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeUntilWednesday / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((timeUntilWednesday / (1000 * 60)) % 60);
    const seconds = Math.floor((timeUntilWednesday / 1000) % 60);

    // Update the status message with the countdown
    await countdownMessage.edit({
      content: '',
      embeds: [{
        ...countdownEmbed,
        description: `周常更新时间剩余: ${days}d ${hours}h ${minutes}m ${seconds}s :clock1:`,
      }],
    });

    // Wait for 1 second
    await setTimeout(1000);

    // Recalculate the time remaining
    timeUntilWednesday -= 1000;
  }

  // Update the status message when the countdown reaches 0
  await countdownMessage.edit({
    content: 'Week Update completed!',
    embeds: [],
  });
}

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'weekupdate') {
    // Triggered by the slash command '/weekupdate'

    // Displaying a status with a countdown
    await updateCountdown(interaction, calculateTimeUntilWednesday());
  }
});

function calculateTimeUntilWednesday() {
  // Calculate the time until the next Wednesday at 1 AM (Chinese time)
  const now = new Date();
  const nextWednesday = new Date(now);
  nextWednesday.setDate(now.getDate() + ((3 + 7 - now.getDay()) % 7));
  nextWednesday.setUTCHours(17, 0, 0, 0); // 1 AM Chinese time is 5 PM UTC

  return nextWednesday - now;
}

client.login(token);
