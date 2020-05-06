const Discord = require('discord.js');
const client = new Discord.Client();
const token = process.argv.length == 2 ? process.env.token : "";
const welcomeChannelName = "입장";
const byeChannelName = "퇴장";
const welcomeChannelComment = "`님께서 서버에 입장하셨습니다`";
const byeChannelComment = "`님께서 서버에서 퇴장하셨습니다`";
const prefix = 'j?';
const moment = require("moment");
require("moment-duration-format");


client.on('ready', () => {
  console.log('Online');
  client.user.setPresence({ game: { name: 'j?help' }, status: 'online' })
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

  if(message.content == 'j?version') {
    return message.reply('`Renewaled jsBot 0.1.1`');
  }

  if(message.content == 'j?status') {
    let embed = new Discord.RichEmbed()
    let img = 'https://cdn.discordapp.com/attachments/706768367956000793/707164004887429162/d908a378a563cb86.png';
    var duration = moment.duration(client.uptime).format(" D [일], H [시간], m [분], s [초]");
    embed.setColor('#BF0000')
    embed.setAuthor('Server Info', img)
    embed.setFooter('js Support Bot')
    embed.addField('RAM usage',    `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, true);
    embed.addField('running time', `${duration}`, true);
    embed.addField('user',         `${client.users.size.toLocaleString()}`, true);
    embed.addField('server',       `${client.guilds.size.toLocaleString()}`, true);
    embed.addField('channel',      `${client.channels.size.toLocaleString()}`, true);
    embed.addField('Discord.js',   `v${Discord.version}`, true);
    //embed.addField('Node',         `${process.version}`, true);
    
    embed.setTimestamp()
    message.channel.send(embed);
  }

  if(message.content == 'j?help') {
    let helpImg = 'https://images-ext-1.discordapp.net/external/RyofVqSAVAi0H9-1yK6M8NGy2grU5TWZkLadG-rwqk0/https/i.imgur.com/EZRAPxR.png';
    let commandList = [
      {name: 'j?help', desc: '명령어 리스트'},

      {name: 'j?version', desc: '봇 버전 확인'},

      {name: 'j?announce', desc: 'dm으로 전체 공지 보내기'},

      {name: 'j?clean', desc: '텍스트 지움'},

      {name: 'j?invite', desc: '초대 코드 표기'},

      {name: 'j?status', desc: '서버의 상태를 표시해줍니다'},

      {name: 'MAKE & HELP', desc: '제작: 0utS1D3R 도움: 나긋해'}
    ];
    let commandStr = '';
    let embed = new Discord.RichEmbed()
      .setAuthor('jsBot Support', helpImg)
      .setColor('#186de6')
      .setTimestamp()
    
    commandList.forEach(x => {
      commandStr += `• \`\`${changeCommandStringLength(`${x.name}`)}\`\` : **${x.desc}**\n`;
    });

    embed.addField('Commands: ', commandStr);

    message.channel.send(embed)
  } else if(message.content == 'j?invite') {
    if(message.channel.type == 'dm') {
      return message.reply('`dm에서 사용할 수 없는 명령어 입니다.`');
    }
    message.guild.channels.get(message.channel.id).createInvite({maxAge: 0}) // maxAge: 0은 무한이라는 의미, maxAge부분을 지우면 24시간으로 설정됨
      .then(invite => {
        message.channel.send("`" + invite.url + "`")
      })
      .catch((err) => {
        if(err.code == 50013) {
          message.channel.send('**'+message.guild.channels.get(message.channel.id).guild.name+'** `채널 권한이 없어 초대코드 발행 실패`')
        }
      })
  }

  if(message.content.startsWith('j?announce')) {
    if(checkPermission(message)) return
    if(message.member != null) { // 채널에서 공지 쓸 때
      let contents = message.content.slice('j?announce'.length);
      let embed = new Discord.RichEmbed()
        .setAuthor('공지가 도착했습니다')
        .setColor('#5100BF')
        .setFooter(`jsBot 공지`)
        .setTimestamp()
  
      embed.addField('내용 ', contents);
  
      message.member.guild.members.array().forEach(x => {
        if(x.user.bot) return;
        x.user.send(embed)
      });
  
      return message.reply('`공지를 전송했습니다.`');
    } else {
      return message.reply('`채널에서 실행해주세요.`');
    }
  }

  if(message.content.startsWith('j?clean')) {
    if(checkPermission(message)) return

    var clearLine = message.content.slice('j?clean '.length);
    var isNum = !isNaN(clearLine)

    if(isNum && (clearLine <= 0 || 99 < clearLine)) {
      message.channel.send("`You can only type 1 ~ 99`")
      return;
    } else if(!isNum) { // c @나긋해 3
      if(message.content.split('<@').length == 2) {
        if(isNaN(message.content.split(' ')[2])) return;

        var user = message.content.split(' ')[1].split('<@!')[1].split('>')[0];
        var count = parseInt(message.content.split(' ')[2])+1;
        const _limit = 10;
        let _cnt = 0;

        message.channel.fetchMessages({limit: _limit}).then(collected => {
          collected.every(msg => {
            if(msg.author.id == user) {
              msg.delete();
              ++_cnt;
            }
            return !(_cnt == count);
          });
        });
      }
    } else {
      message.channel.bulkDelete(parseInt(clearLine)+1)
        .then(() => {
          AutoMsgDelete(message, `<@${message.author.id}> ` + "`" + parseInt(clearLine) + " messages deleted`");
        })
        .catch(console.error)
    }
  }
});

function checkPermission(message) {
  if(!message.member.hasPermission("MANAGE_MESSAGES")) {
    message.channel.send(`<@${message.author.id}> ` + "`You don't have any permission to do this :(`")
    return true;
  } else {
    return false;
  }
}

function changeCommandStringLength(str, limitLen = 8) {
  let tmp = str;
  limitLen -= tmp.length;

  for(let i=0;i<limitLen;i++) {
      tmp += ' ';
  }

  return tmp;
}

async function AutoMsgDelete(message, str, delay = 3000) {
  let msg = await message.channel.send(str);

  setTimeout(() => {
    msg.delete();
  }, delay);
}

client.login(token);