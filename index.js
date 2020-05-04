const Discord = require('discord.js');
const client = new Discord.Client();
const token = process.env.token;
const welcomeChannelName = "입장";
const byeChannelName = "퇴장";
const welcomeChannelComment = "`님이 서버에 입장하셨습니다`";
const byeChannelComment = "`님이 서버에서 퇴장하셨습니다`";

client.on('ready', () => {
  console.log('NEW jsBot 0.0.2 is now Online!');
});

client.on("guildMemberAdd", (member) => {
  const guild = member.guild;
  const newUser = member.user;
  const welcomeChannel = guild.channels.find(channel => channel.name == welcomeChannelName);

  welcomeChannel.send(`<@${newUser.id}> ${welcomeChannelComment}\n`);

  member.addRole(guild.roles.find(role => role.name == "미인증 유저"));
});

client.on("guildMemberRemove", (member) => {
  const guild = member.guild;
  const deleteUser = member.user;
  const byeChannel = guild.channels.find(channel => channel.name == byeChannelName);

  byeChannel.send(`<@${deleteUser.id}> ${byeChannelComment}\n`);
});

client.on('message', (message) => {
  if(message.author.bot) return;

  if(message.content == ';;version') {
    return message.reply('`NEW jsBot 0.0.1`');
  }

  if(message.content.startsWith(';;공지')) {
    if(checkPermission(message)) return
    if(message.member != null) { // 채널에서 공지 쓸 때
      let contents = message.content.slice(';;공지'.length);
      message.member.guild.members.array().forEach(x => {
        if(x.user.bot) return;
        x.user.send(`${contents}`);
      });
  
      return message.reply('`공지를 전송했습니다.`');
    } else {
      return message.reply('`채널에서 실행해주세요.`');
    }
  }
});

function checkPermission(message) {
  if(!message.member.hasPermission("MANAGE_MESSAGES")) {
    message.channel.send(`<@${message.author.id}> ` + "`You don't have any permission to do this`")
    return true;
  } else {
    return false;
  }
}


client.login(token);