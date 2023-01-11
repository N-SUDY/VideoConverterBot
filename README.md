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

```env
TELEGRAM_BOT_TOKEN = token
FFMPEG_PATH = path
START_PHOTO = path
HELP_PHOTO = path
```

TELEGRAM_BOT_TOKEN - telegram bot token that was provided by official telegram bot (https://t.me/BotFather)<br>
FFMPEG_PATH - path to the ffmpeg.exe file
START_PHOTO - path to the photo that will be displayed when the user enters the /start command
HELP_PHOTO - path to the photo that will be displayed when the user enters the /help command
