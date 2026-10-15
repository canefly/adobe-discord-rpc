/*
 * File: index.js
 * Project: discord-rpc-client
 * Author: Tee & Antigravity
 * Copyright (c) 2026
 */

var _rpc = require('./rpc');
var RichPresence = (_rpc && _rpc.default) ? _rpc.default : _rpc;
var _isEqual = require('lodash/isEqual');
var _isEqual2 = _interopRequireDefault(_isEqual);
var _clone = require('lodash/clone');
var _clone2 = _interopRequireDefault(_clone);
var _localstorage = require('./localstorage');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var csInterface = new CSInterface();
var rawClientMap = require('./client.js');
var clientMap = (rawClientMap && rawClientMap.default) ? rawClientMap.default : rawClientMap;
var appId = csInterface.getApplicationID();
var client = clientMap[appId] || { id: "", name: "Adobe" };
var rpc = new RichPresence(client, csInterface);

var activityEvent = new CSEvent("com.tee.rpc.activity", "APPLICATION");
var userEvent = new CSEvent("com.tee.rpc.user", "APPLICATION");
var statusEvent = new CSEvent("com.tee.rpc.status", "APPLICATION");

var props = {
    state: undefined,
    details: undefined,
    startTimestamp: new Date(),
    largeImageKey: 'logo',
    largeImageText: undefined,
    smallImageKey: undefined,
    smallImageText: undefined,
    partySize: 0,
    partyMax: 0
};

var presence = {};
var configurations = (0, _localstorage.getConfigurations)();
var interval = 1500;
var isUpdating = false;

// Do not initialize if run through dynamic link (After Effects)
if (appId === "AEFT") {
    csInterface.evalScript("app.activeViewer", function (x) {
        if (x === "null") {
            console.log("AE started with no active viewer");
        }
    });
}

function queryHost(func) {
    return new Promise(function (resolve) {
        try {
            csInterface.evalScript(func, function (result) {
                if (result === "EvalScript error." || result === "undefined" || result === "null") {
                    resolve("");
                } else {
                    resolve(result);
                }
            });
        } catch (e) {
            resolve("");
        }
    });
}

function sendConfigAck(isReset) {
    try {
        var ack = new CSEvent("com.tee.rpc.config.ack", "APPLICATION");
        ack.data = { success: true, reset: !!isReset, timestamp: Date.now() };
        csInterface.dispatchEvent(ack);
    } catch (e) {
        console.error("Failed to send config ack:", e);
    }
}

function sendCurrentState() {
    try {
        statusEvent.data = {
            connected: rpc.getStatus(),
            user: rpc.getUser()
        };
        csInterface.dispatchEvent(statusEvent);

        if (rpc.getStatus()) {
            userEvent.data = rpc.getUser();
            csInterface.dispatchEvent(userEvent);
        }

        var confEvent = new CSEvent("com.tee.rpc.config.current", "APPLICATION");
        confEvent.data = configurations;
        csInterface.dispatchEvent(confEvent);
    } catch (e) {
        console.error("Failed to send current state:", e);
    }
}

csInterface.addEventListener('com.tee.rpc.reset', function () {
    console.log("Resetting RPC configurations to default...");
    configurations = (0, _localstorage.resetConfiguration)();
    presence = {};
    sendConfigAck(true);
    sendCurrentState();
    updateCycle();
});

csInterface.addEventListener('com.tee.rpc.config', function (e) {
    try {
        var data = e.data;
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (pErr) {
                console.error("Failed to parse config event data:", pErr);
                return;
            }
        }

        if (data && typeof data === 'object') {
            for (var key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    (0, _localstorage.setConfiguration)(key, data[key]);
                }
            }
            configurations = (0, _localstorage.getConfigurations)();
            presence = {};
            console.log("Configuration updated successfully:", configurations);
            sendConfigAck(false);
            sendCurrentState();
            updateCycle();
        }
    } catch (err) {
        console.error("Error in com.tee.rpc.config listener:", err);
    }
});

csInterface.addEventListener('com.tee.rpc.update', function () {
    console.log("Manual update requested from UI.");
    presence = {};
    sendCurrentState();
    updateCycle();
});

async function updateCycle() {
    if (isUpdating) return;
    isUpdating = true;

    try {
        if (!configurations.rpc || !configurations.rpc.enabled || !configurations.rpc.enabled.enabled) {
            if (rpc.getStatus()) {
                rpc.setActivity({});
                presence = {};
            }
            isUpdating = false;
            return;
        }

        if (!rpc.getStatus()) {
            isUpdating = false;
            return;
        }

        var rpcConf = configurations.rpc;

        // Query host values in parallel
        var results = await Promise.all([
            rpcConf.state && rpcConf.state.enabled ? queryHost('state()') : Promise.resolve(""),
            rpcConf.details && rpcConf.details.enabled ? queryHost('details()') : Promise.resolve(""),
            rpcConf.smallImageKey && rpcConf.smallImageKey.enabled ? queryHost('smallImageKey()') : Promise.resolve(""),
            rpcConf.smallImageText && rpcConf.smallImageText.enabled ? queryHost('smallImageText()') : Promise.resolve(""),
            rpcConf.largeImageText && rpcConf.largeImageText.enabled ? queryHost('largeImageText()') : Promise.resolve(""),
            rpcConf.partySize && rpcConf.partySize.enabled ? queryHost('partySize()') : Promise.resolve("0"),
            rpcConf.partyMax && rpcConf.partyMax.enabled ? queryHost('partyMax()') : Promise.resolve("0")
        ]);

        var stateVal = results[0];
        var detailsVal = results[1];
        var smallKeyVal = results[2];
        var smallTextVal = results[3];
        var largeTextVal = results[4];
        var partySizeVal = parseInt(results[5], 10) || 0;
        var partyMaxVal = parseInt(results[6], 10) || 0;

        props.state = (rpcConf.state && rpcConf.state.enabled && stateVal) ? stateVal : undefined;
        props.details = (rpcConf.details && rpcConf.details.enabled && detailsVal) ? detailsVal : undefined;
        props.smallImageKey = (rpcConf.smallImageKey && rpcConf.smallImageKey.enabled && smallKeyVal) ? smallKeyVal : undefined;
        props.smallImageText = (rpcConf.smallImageText && rpcConf.smallImageText.enabled && smallTextVal) ? smallTextVal : undefined;
        props.largeImageText = (rpcConf.largeImageText && rpcConf.largeImageText.enabled && largeTextVal) ? largeTextVal : undefined;
        props.partySize = partySizeVal;
        props.partyMax = partyMaxVal;

        if (rpcConf.largeImageKey && rpcConf.largeImageKey.enabled) {
            var iconChoice = rpcConf.largeImageKey.value;
            if (iconChoice === "new" || iconChoice === "logo2") {
                props.largeImageKey = 'logo2';
            } else {
                props.largeImageKey = 'logo';
            }
        } else {
            props.largeImageKey = undefined;
        }

        if (rpcConf.timestamp && rpcConf.timestamp.enabled) {
            if (rpcConf.fakeElapsed && rpcConf.fakeElapsed.enabled) {
                var spoofHours = parseInt(rpcConf.fakeElapsed.hours, 10) || 0;
                var spoofMinutes = parseInt(rpcConf.fakeElapsed.minutes, 10) || 0;
                var offsetMs = (spoofHours * 60 + spoofMinutes) * 60 * 1000;

                if (!props._spoofStart || props._spoofOffset !== offsetMs) {
                    props._spoofOffset = offsetMs;
                    props._spoofStart = Date.now() - offsetMs;
                }
                props.startTimestamp = new Date(props._spoofStart);
            } else {
                props._spoofOffset = null;
                props._spoofStart = null;
                if (!props.startTimestamp) {
                    props.startTimestamp = new Date();
                }
            }
        } else {
            props.startTimestamp = undefined;
            props._spoofOffset = null;
            props._spoofStart = null;
        }

        if (!(0, _isEqual2.default)(presence, props)) {
            rpc.setActivity(props);
            presence = (0, _clone2.default)(props);

            activityEvent.data = Object.assign({}, presence, {
                name: client.name || "Adobe"
            });
            csInterface.dispatchEvent(activityEvent);
        }
    } catch (err) {
        console.error("Error in updateCycle:", err);
    } finally {
        isUpdating = false;
    }
}

function mainLoop() {
    updateCycle().catch(console.error).finally(function () {
        setTimeout(mainLoop, interval);
    });
}

// Start
rpc.login().then(function () {
    console.log("RPC initialized.");
    sendCurrentState();
    mainLoop();
}).catch(function (err) {
    console.error("Failed to initialize RPC:", err);
    mainLoop();
});