const { exec, spawn } = require("child_process");

const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const inquirer = require("inquirer");
const Table = require("cli-table3");
const figlet = require("figlet");

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
async function installDependencies() {
  await sleep(20);
  console.log(chalk.cyan.bold("安裝 npm 依賴項..."));
  return new Promise((resolve, reject) => {
    exec("npm install", (error) => {
      if (error) {
        console.error(chalk.red.bold(`安裝依賴項時發生錯誤: ${error.message}`));
        reject(error);
        return;
      }
      console.log(chalk.green.bold("✓ npm 依賴項安裝完成!"));
      resolve();
    });
  });
}
/**
 * Gets user input with optional masking for secrets
 */
async function getInput(envName, displayName, isSecret = false) {
  const questionType = isSecret ? "password" : "input";

  const answer = await inquirer.prompt([
    {
      type: questionType,
      name: "value",
      message: `${displayName} [${envName}]`,
      mask: isSecret ? "*" : null,
    },
  ]);

  return answer.value;
}

/**
 * Displays configuration and requests confirmation
 */
async function confirmSetup(envVars) {
  const table = new Table({
    head: [chalk.cyan.bold("環境變數"), chalk.cyan.bold("值")],
    style: {
      head: [],
      border: [],
    },
  });

  for (const [key, value] of Object.entries(envVars)) {
    if (
      key.includes("TOKEN") ||
      key.includes("SECRET") ||
      key.includes("KEY")
    ) {
      const masked =
        value.length > 8
          ? `${value.substring(0, 4)}${"•".repeat(
              value.length - 8
            )}${value.substring(value.length - 4)}`
          : "•".repeat(value.length);
      table.push([chalk.yellow.bold(key), masked]);
    } else {
      table.push([chalk.yellow.bold(key), value]);
    }
  }

  console.log(chalk.cyan.bold("\n您的配置"));
  console.log(table.toString());

  const answer = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: "將此配置儲存到 .env 檔案嗎？",
      default: true,
    },
  ]);

  return answer.confirm;
}

/**
 * Creates .env file with provided environment variables
 */
function createEnvFile(envVars) {
  try {
    let content = "";
    for (const [key, value] of Object.entries(envVars)) {
      content += `${key}=${value}\n`;
    }

    fs.writeFileSync(".env", content);
    console.log(chalk.green.bold("\n✓ .env 檔案建立成功!"));
    return true;
  } catch (error) {
    console.error(chalk.red.bold(`建立 .env 檔案時發生錯誤: ${error.message}`));
    return false;
  }
}

/**
 * Main setup function
 */
const discordhex = chalk.hex("#06c755");
const linehex = chalk.hex("#7289da");

figlet.text(
  "Cross Chat",
  {
    font: "Standard",
    horizontalLayout: "default",
    verticalLayout: "default",
  },
  function (err, data) {
    if (err) {
      console.log("Something went wrong...");
      console.dir(err);
      return;
    }

    const lines = data.split("\n");
    const splitPosition = 25;

    // Apply different colors to each part
    const coloredText = lines
      .map((line) => {
        const firstPart = line.substring(0, splitPosition);
        const secondPart = line.substring(splitPosition);
        return discordhex(firstPart) + linehex(secondPart);
      })
      .join("\n");
    console.log(coloredText);
  }
);

async function setup() {
  console.log(chalk.cyan.bold("━ CrossChat 環境設置 ━\n"));

  try {
    await installDependencies();

    // Check if .env file already exists
    if (fs.existsSync(".env")) {
      const { overwrite } = await inquirer.prompt([
        {
          type: "confirm",
          name: "overwrite",
          message: "警告: .env 檔案已存在。是否覆蓋？",
          default: false,
        },
      ]);

      if (!overwrite) {
        console.log(chalk.red.bold("設置已取消。"));
        process.exit(0);
      }
    }

    const envVars = {};

    console.log(chalk.cyan.bold("\n▌ Discord 配置 ▌"));
    envVars["DISCORD_BOT_TOKEN"] = await getInput(
      "DISCORD_BOT_TOKEN",
      "Discord 機器人令牌",
      true
    );
    envVars["DISCORD_CLIENT_ID"] = await getInput(
      "DISCORD_CLIENT_ID",
      "Discord 客戶端 ID"
    );
    envVars["DISCORD_GUILD_ID"] = await getInput(
      "DISCORD_GUILD_ID",
      "Discord 伺服器 ID"
    );
    envVars["DISCORD_WEBHOOK_URL"] = await getInput(
      "DISCORD_WEBHOOK_URL",
      "Discord Webhook 網址"
    );

    console.log(chalk.cyan.bold("\n▌ LINE 配置 ▌"));
    envVars["LINE_CHANNEL_ID"] = await getInput(
      "LINE_CHANNEL_ID",
      "LINE 頻道 ID"
    );
    envVars["LINE_CHANNEL_SECRET"] = await getInput(
      "LINE_CHANNEL_SECRET",
      "LINE 頻道密鑰",
      true
    );
    envVars["LINE_CHANNEL_ACCESS_TOKEN"] = await getInput(
      "LINE_CHANNEL_ACCESS_TOKEN",
      "LINE 頻道訪問令牌",
      true
    );

    if (await confirmSetup(envVars)) {
      createEnvFile(envVars);
      console.log(chalk.green.bold("\n━ 設置完成! ━"));
      console.log(
        `${chalk.yellow.bold("運行應用程式:")} ${chalk.green(
          "npm start 或 npm run dev"
        )}`
      );
    } else {
      console.log(chalk.red.bold("設置已取消。"));
    }
  } catch (error) {
    console.error(chalk.red.bold(`設置過程中發生錯誤: ${error.message}`));
    process.exit(1);
  }
}

// Run the setup
setup();
