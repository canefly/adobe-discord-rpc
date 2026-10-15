/*
 * File: localstorage.js
 * Project: discord-rpc-client
 * Author: Tee & Antigravity
 * Copyright (c) 2026
 */

const csInterface = typeof CSInterface !== 'undefined' ? new CSInterface() : null;

export const rpcConfigurationTemplate = {
    enabled: {
        enabled: true,
        description: "",
        name: "Rich Presence Enable",
        type: "checkbox",
        hidden: false
    },
    details: {
        enabled: true,
        description: "",
        name: "Details",
        type: "checkbox",
        hidden: false
    },
    state: {
        enabled: true,
        description: "",
        name: "State",
        type: "checkbox",
        hidden: false
    },
    timestamp: {
        enabled: true,
        description: "",
        name: "Timestamp",
        type: "checkbox",
        hidden: false
    },
    fakeElapsed: {
        enabled: false,
        hours: 4,
        minutes: 20,
        description: "Spoof elapsed time on Discord",
        name: "Spoof Elapsed Time",
        type: "timeSpoof",
        hidden: false
    },
    largeImageKey: {
        enabled: true,
        value: "old",
        description: "",
        name: "Large Icon",
        type: "dropdown",
        hidden: false
    },
    largeImageText: {
        enabled: true,
        description: "",
        name: "Large Icon Text",
        type: "checkbox",
        hidden: false
    },
    smallImageKey: {
        enabled: true,
        description: "",
        name: "Small Icon",
        type: "checkbox",
        hidden: false
    },
    smallImageText: {
        enabled: true,
        description: "",
        name: "Small Icon Text",
        type: "checkbox",
        hidden: false
    },
    partySize: {
        enabled: true,
        description: "",
        name: "Party Size",
        type: "checkbox",
        hidden: true
    },
    partyMax: {
        enabled: true,
        description: "",
        name: "Party Max",
        type: "checkbox",
        hidden: true
    }
};

export const extensionConfigurationTemplate = {
    updateNotification: {
        enabled: true,
        description: "",
        name: "Update Notification",
        type: "checkbox",
        hidden: false
    },
    catMode: {
        enabled: false,
        description: "",
        name: "Cat",
        type: "checkbox",
        hidden: false
    },
};

export function setConfiguration(name, configuration){
    try {
        window.localStorage.setItem(name, JSON.stringify(configuration));
    } catch(e) {
        console.error("Failed to write to localStorage:", e);
    }
    if (csInterface && typeof CSEvent !== 'undefined') {
        try {
            const event = new CSEvent('com.tee.panel.settings', 'APPLICATION');
            event.data = { name, configuration };
            csInterface.dispatchEvent(event);
        } catch(e) {
            console.error("Failed to dispatch settings event:", e);
        }
    }
}

export function getConfiguration(name){
    try {
        const item = window.localStorage.getItem(name);
        return item ? JSON.parse(item) : null;
    } catch(e) {
        console.error("Failed to get configuration:", e);
        return null;
    }
}

export function getConfigurations(){
    const conf = {};
    try {
        Object.keys(window.localStorage).forEach(key => {
            conf[key] = getConfiguration(key);
        });
    } catch(e) {
        console.error("Failed to get configurations:", e);
    }

    if (!conf.rpc) {
        conf.rpc = JSON.parse(JSON.stringify(rpcConfigurationTemplate));
        setConfiguration("rpc", conf.rpc);
    } else if (!conf.rpc.fakeElapsed) {
        conf.rpc.fakeElapsed = JSON.parse(JSON.stringify(rpcConfigurationTemplate.fakeElapsed));
        setConfiguration("rpc", conf.rpc);
    }
    if (!conf.extension) {
        conf.extension = JSON.parse(JSON.stringify(extensionConfigurationTemplate));
        setConfiguration("extension", conf.extension);
    }

    return conf;
}

export function compare(obj, prop) {
    return JSON.stringify(obj) === JSON.stringify(prop);
}

export function resetConfiguration(){
    try {
        window.localStorage.clear();
    } catch(e) {
        console.error("Failed to clear localStorage:", e);
    }
    setConfiguration("rpc", JSON.parse(JSON.stringify(rpcConfigurationTemplate)));
    setConfiguration("extension", JSON.parse(JSON.stringify(extensionConfigurationTemplate)));
    return getConfigurations();
}