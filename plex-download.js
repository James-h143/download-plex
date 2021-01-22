const fs = require("fs");
const fetch = require("node-fetch");
const os = require("os");

function log(str) {
  let date_ob = new Date();

  let date = ("0" + date_ob.getDate()).slice(-2);
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  let year = date_ob.getFullYear();

  let hours = date_ob.getHours();
  let minutes = date_ob.getMinutes();
  let seconds = date_ob.getSeconds();

  let output = `[${date}/${month}/${year} ${hours}:${minutes}:${seconds}] ${str}`;
  console.log(output);
}

function getInstallString() {
  return "https://plex.tv/downloads/latest/5?channel=16&build=linux-x86_64&distro=debian";
}

function execute(command) {
  return new Promise((resolve) => {
    const exec = require("child_process").exec;
    const ls = exec(command, { killSignal: "SIGKILL" });

    ls.stdout.on("data", function (data) {
      log(data.replace(/\n|\r/g, ""));
    });

    ls.stderr.on("data", function (data) {
      log(data.replace(/\n|\r/g, ""));
    });

    ls.on("exit", function (code) {
      if (code.toString() !== "0") {
        log("child process exited with code " + code.toString());
      }
      resolve(code);
    });
  });
}

async function getInstaller(filepath) {
  const res = await fetch(getInstallString());
  let body = await res.buffer();
  fs.writeFileSync(filepath, body, "binary");
}

async function main() {
  const installerPath = __dirname + "/plex.deb";

  if (os.userInfo().username !== "root") {
    console.log("this program needs to be run as root, soz");
    return -1;
  }

  await getInstaller(installerPath);

  await execute(`dpkg -i ${installerPath}`);
}
main().catch(console.log);
