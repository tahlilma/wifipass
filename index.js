#!/usr/bin/env node

import { exec } from "child_process";
import prompts from "prompts";
import QRCode from "qrcode";
import chalk from "chalk";

(async () => {
  exec("netsh wlan show profile", async (error, stdout, stderr) => {
    if (error || stderr) {
      throw error ? error : stderr;
    }

    const list = stdout
      .split(":")
      .slice(2)
      .map((item) => item.trim().split("\r\n")[0]);

    const response = await prompts({
      type: "select",
      name: "value",
      message: "Pick a network connection",
      choices: list.map((item) => ({ title: item, value: item })),
    });

    exec(
      `netsh wlan show profile "${response.value}" key=clear`,
      (error, stdout, stderr) => {
        if (error || stderr) {
          throw error ? error : stderr;
        }

        const pass = stdout.split(":").reverse()[6].split("\r")[0].trim();

        console.log(chalk.bold(`SSID: ${response.value}`));
        console.log(chalk.bold(`Password: ${pass}`));

        const encoding = `WIFI:S:${response.value};T:WPA;P:${pass};;`;
        QRCode.toString(encoding, { type: "terminal" }, (err, code) => {
          if (err) throw "err";
          console.log(code);
        });
      }
    );
  });
})();
