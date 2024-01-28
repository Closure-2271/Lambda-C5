const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

async function sendLanguageSelection(interaction) {
  const embed = new EmbedBuilder()
    .setTitle("选择您的语言 / Choose Your Language / 選擇您的語言")
    .setDescription("请选择机器人的语言设置。")
    .setColor(0x00AE86);

  const buttons = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('language_chinese_simplified')
        .setLabel('简体中文')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('language_chinese_traditional')
        .setLabel('繁体中文')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('language_english')
        .setLabel('English')
        .setStyle(ButtonStyle.Primary),
    );

  await interaction.reply({ embeds: [embed], components: [buttons] });
}

// 用于处理语言选择按钮交互的函数
async function handleLanguageSelection(interaction) {
  if (!interaction.isButton()) return;

  const selectedLanguage = interaction.customId.replace('language_', '');
  // 根据选择的语言进行处理，例如设置用户偏好、发送确认消息等
  // ...

  await interaction.reply(`您已选择的语言: ${selectedLanguage}`);
}

module.exports = { sendLanguageSelection, handleLanguageSelection };
