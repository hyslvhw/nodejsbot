const Discord = require('discord.js');
const client = new Discord.Client();
const token = process.argv.length == 2 ? process.env.token : "";
const welcomeChannelName = "입장";
const byeChannelName = "퇴장";
const welcomeChannelComment = "`님께서 서버에 입장하셨습니다`";
const byeChannelComment = "`님께서 서버에서 퇴장하셨습니다`";
const prefix = ';;';

client.on('ready', () => {
  console.log('Online');
  client.user.setPresence({ game: { name: ';;도움 을 쳐서 도움을 받아보세요!' }, status: 'online' })
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

  if(message.content == ';;버전') {
    return message.reply('`Renewaled jsBot 0.0.5 한글패치`');
  }

  if(message.content == ';;서버상태') {
    let embed = new Discord.RichEmbed()
    let img = 'https://discordapp.com/channels/706768367301820469/706768367956000793/707164004753211404';
    var duration = moment.duration(client.uptime).format(" D [일], H [시간], m [분], s [초]");
    embed.setColor('#186de6')
    embed.setAuthor('Server Information', img)
    embed.setFooter(`js Support Bot`)
    embed.addField('RAM usage',    `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, true);
    embed.addField('running time', `${duration}`, true);
    embed.addField('user',         `${client.users.size.toLocaleString()}`, true);
    embed.addField('server',       `${client.guilds.size.toLocaleString()}`, true);
    embed.addField('channel',      `${client.channels.size.toLocaleString()}`, true);
    embed.addField('Discord.js',   `v${Discord.version}`, true);
    embed.addField('Node',         `${process.version}`, true);
  }

  if(message.content == ';;도움') {
    let helpImg = 'https://images-ext-1.discordapp.net/external/RyofVqSAVAi0H9-1yK6M8NGy2grU5TWZkLadG-rwqk0/https/i.imgur.com/EZRAPxR.png';
    let commandList = [
      {name: ';;도움', desc: '명령어 리스트'},

      {name: ';;버전', desc: '봇 버전 확인'},

      {name: ';;공지', desc: 'dm으로 전체 공지 보내기'},

      {name: ';;청소', desc: '텍스트 지움'},

      {name: ';;초대코드', desc: '초대 코드 표기'},

      {name: '제작 및 도움', desc: '제작: 0utS1D3R 도움: 나긋해'}
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
  } else if(message.content == ';;초대코드') {
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

  if(message.content.startsWith(';;공지')) {
    if(checkPermission(message)) return
    if(message.member != null) { // 채널에서 공지 쓸 때
      let contents = message.content.slice(';;공지'.length);
      let embed = new Discord.RichEmbed()
        .setAuthor('관리자로부터 공지가 도착했습니다')
        .setColor('#5100BF')
        .setFooter(`jsBot 공지`)
        .setTimestamp()
  
      embed.addField('내용: ', contents);
  
      message.member.guild.members.array().forEach(x => {
        if(x.user.bot) return;
        x.user.send(embed)
      });
  
      return message.reply('`공지를 전송했습니다.`');
    } else {
      return message.reply('`채널에서 실행해주세요.`');
    }
  }

  if(message.content.startsWith(';;청소')) {
    if(checkPermission(message)) return

    var clearLine = message.content.slice(';;청소 '.length);
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