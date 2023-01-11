# VideoConverterBot
This bot convert your video from certain extension to others.

<h2>Installation</h2>
1.Head on to the project folder<br>
2.Type on terminal:<br><br>

```
npm install
npm run build
npm start
```

<h2>Environment setup</h2>
The .env file must contain the following variables:<br><br>

```
TELEGRAM_BOT_TOKEN = token
FFMPEG_PATH = path
START_PHOTO = path
HELP_PHOTO = path
```

<b>TELEGRAM_BOT_TOKEN</b> - telegram bot token that was provided by official telegram bot (https://t.me/BotFather)<br>
<b>FFMPEG_PATH</b> - path to the ffmpeg.exe file<br>
<b>START_PHOTO</b> - path to the photo that will be displayed when the user enters the /start command<br>
<b>HELP_PHOTO</b> - path to the photo that will be displayed when the user enters the /help command<br>

<h2>Available video extensions</h2>
The bot accepts the following video extensions:<br><br>

```
.mp4
.avi
.mov
.mkv
.wmv
```

<h2>Restrictions</h2>

- The bot do not accept the video that was forwarded from channel, group or private chat.<br>
Instead this, download this video and upload via computer or phone.

