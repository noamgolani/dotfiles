"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.SerialPortCtrl = void 0;
const child_process_1 = require("child_process");
const os = require("os");
const path = require("path");
const deviceContext_1 = require("../deviceContext");
class SerialPortCtrl {
    constructor(port, baudRate, _outputChannel) {
        this._outputChannel = _outputChannel;
        this._currentSerialPort = null;
        this._currentBaudRate = baudRate;
        this._currentPort = port;
    }
    /**
     * Launches the serial monitor to check which external usb devices are connected.
     *
     * @returns An array of ISerialPortDetail from external serial devices.
     *
     */
    static list() {
        // TODO: Wrap this in a try catch block, catch error if no serial monitor at path
        const stdout = child_process_1.execFileSync(SerialPortCtrl._serialCliPath, ["list-ports"]);
        const lists = JSON.parse(stdout.toString("utf-8"));
        lists.forEach((port) => {
            const vidPid = this._parseVidPid(port["hwid"]);
            port["vendorId"] = vidPid["vid"];
            port["productId"] = vidPid["pid"];
        });
        return lists;
    }
    /**
     * Parse out vendor id and product id from the hardware id provided by the device.
     *
     * @param hwid: The hardware information for a sepcific device
     *
     * @returns vendor id and product id values in an array. Returns null if none are found.
     */
    static _parseVidPid(hwid) {
        const result = hwid.match(/VID:PID=(?<vid>\w+):(?<pid>\w+)/i);
        return result !== null ? result["groups"] : [null, null];
    }
    static get _serialCliPath() {
        let fileName;
        if (os.platform() === "win32") {
            fileName = "main.exe";
        }
        else if (os.platform() === "linux" || os.platform() === "darwin") {
            fileName = "main";
        }
        const deviceContext = deviceContext_1.DeviceContext.getInstance();
        return path.resolve(deviceContext.extensionPath, "out", "serial-monitor-cli", `${os.platform}`, fileName);
    }
    /*
    * Return true if child proccess is currently running
    */
    get isActive() {
        return this._child ? true : false;
    }
    get currentPort() {
        return this._currentPort;
    }
    open() {
        this._outputChannel.appendLine(`[Starting] Opening the serial port - ${this._currentPort}`);
        this._outputChannel.show();
        if (this._child) {
            this.stop();
        }
        return new Promise((resolve, reject) => {
            this._child = child_process_1.spawn(SerialPortCtrl._serialCliPath, ["open", this._currentPort, "-b", this._currentBaudRate.toString(), "--json"]);
            this._child.on("error", (err) => {
                reject(err);
            });
            this._child.stdout.on("data", (data) => {
                const jsonObj = JSON.parse(data.toString());
                this._outputChannel.append(jsonObj["payload"] + "\n");
            });
            // TODO: add message check to ensure _child spawned without errors
            resolve();
            // The spawn event is only supported in node v15+ vscode
            // this._child.on("spawn", (spawn) => {
            //     resolve();
            // });
        });
    }
    sendMessage(text) {
        return new Promise((resolve, reject) => {
            if (!text || !this.isActive) {
                resolve();
                return;
            }
            this._child.stdin.write(`{"cmd": "write", "payload": "${text}"}\n`, (error) => {
                if (!error) {
                    resolve();
                }
                else {
                    return reject(error);
                }
            });
        });
    }
    changePort(newPort) {
        return new Promise((resolve, reject) => {
            if (newPort === this._currentPort) {
                resolve();
                return;
            }
            this._currentPort = newPort;
            if (!this._currentSerialPort || !this.isActive) {
                resolve();
                return;
            }
            this._currentSerialPort.close((err) => {
                if (err) {
                    reject(err);
                }
                else {
                    this._currentSerialPort = null;
                    resolve();
                }
            });
        });
    }
    stop() {
        return new Promise((resolve, reject) => {
            if (!this.isActive) {
                resolve(false);
                return;
            }
            try {
                this._child.stdin.write('{"cmd": "close"}\n');
                if (this._outputChannel) {
                    this._outputChannel.appendLine(`[Done] Closed the serial port ${os.EOL}`);
                }
                this._child = null;
                resolve(true);
            }
            catch (error) {
                reject(error);
            }
        });
    }
    changeBaudRate(newRate) {
        return new Promise((resolve, reject) => {
            this._currentBaudRate = newRate;
            if (!this._child || !this.isActive) {
                resolve();
                return;
            }
            else {
                try {
                    this.stop();
                    this.open();
                    resolve();
                }
                catch (error) {
                    reject(error);
                }
            }
        });
    }
}
exports.SerialPortCtrl = SerialPortCtrl;

//# sourceMappingURL=serialportctrl.js.map
