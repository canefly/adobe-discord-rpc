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

// ---------------------------------------------------------------------------
// Fun features (all opt-in or harmless by default)
// ---------------------------------------------------------------------------
export const featuresConfigurationTemplate = {
    statusLines: {
        enabled: false,
        type: "statusLines",
        name: "Rotating Status Lines",
        description: "Cycle through fun phrases. Leave the list empty to use the per-app theme.",
        mode: "replace", // "replace" the state line, or "append" to it
        intervalSec: 30,
        useThemes: true,
        lines: [],
        hidden: false
    },
    sessionFlair: {
        enabled: true,
        type: "checkbox",
        name: "Session Timer Flair (\"3h deep\")",
        description: "",
        hidden: false
    },
    hideFileName: {
        enabled: false,
        type: "checkbox",
        name: "Privacy: Hide File & Layer Names",
        description: "",
        hidden: false
    },
    extraInfo: {
        enabled: true,
        type: "checkbox",
        name: "Show Canvas / Layer / Timeline Info",
        description: "",
        hidden: false
    },
    toolAware: {
        enabled: true,
        type: "checkbox",
        name: "Show Active Tool",
        description: "",
        hidden: false
    },
    idle: {
        enabled: true,
        type: "idle",
        name: "Idle / AFK Detection",
        description: "Switch to a break message when nothing changes for a while.",
        minutes: 10,
        hidden: false
    },
    celebrations: {
        enabled: true,
        type: "checkbox",
        name: "Render Celebrations",
        description: "",
        hidden: false
    },
    webhook: {
        enabled: false,
        type: "webhook",
        name: "Post to a Discord Webhook When a Render Finishes",
        description: "Opt-in. The webhook URL stays on this computer.",
        url: "",
        hidden: false
    },
    trackStats: {
        enabled: true,
        type: "checkbox",
        name: "Track Stats & Achievements",
        description: "",
        hidden: false
    }
};

const GROUP_TEMPLATES = {
    rpc: rpcConfigurationTemplate,
    extension: extensionConfigurationTemplate,
    features: featuresConfigurationTemplate
};

const clone = (obj) => JSON.parse(JSON.stringify(obj));

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

// Make sure a config group exists and contains every key the template defines,
// so upgrading users pick up new features without losing their old settings.
function ensureGroup(conf, group) {
    const template = GROUP_TEMPLATES[group];
    if (!conf[group]) {
        conf[group] = clone(template);
        setConfiguration(group, conf[group]);
        return;
    }
    let changed = false;
    Object.keys(template).forEach((key) => {
        if (!conf[group][key]) {
            conf[group][key] = clone(template[key]);
            changed = true;
        }
    });
    if (changed) setConfiguration(group, conf[group]);
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

    ensureGroup(conf, "rpc");
    ensureGroup(conf, "extension");
    ensureGroup(conf, "features");

    return conf;
}

export function compare(obj, prop) {
    return JSON.stringify(obj) === JSON.stringify(prop);
}

export function resetConfiguration(){
    // Keep lifetime stats: "reset defaults" is about settings, not history.
    const keepStats = getConfiguration("stats");
    try {
        window.localStorage.clear();
    } catch(e) {
        console.error("Failed to clear localStorage:", e);
    }
    setConfiguration("rpc", clone(rpcConfigurationTemplate));
    setConfiguration("extension", clone(extensionConfigurationTemplate));
    setConfiguration("features", clone(featuresConfigurationTemplate));
    if (keepStats) saveStats(keepStats);
    return getConfigurations();
}

// ---------------------------------------------------------------------------
// Themes, status lines, flair
// ---------------------------------------------------------------------------
export const APP_THEMES = {
    PHXS: [
        "Currently suffering",
        "Pushing pixels",
        "Fighting the pen tool",
        "Zoomed to 3200%, still not straight",
        "Hiding layers from the client",
        "Layer 47 copy 12 final FINAL",
        "Selecting hair. Send help",
        "Content-aware filling my feelings",
        "Ctrl+Z is my love language",
        "Masking like a pro (allegedly)"
    ],
    PPRO: [
        "Currently suffering",
        "Cutting on the beat",
        "Hunting for the perfect cut",
        "Syncing audio, again",
        "Ripple deleting bravely",
        "Media offline. Again",
        "Waiting on the render bar",
        "It's not a bug, it's a jump cut",
        "Scrubbing the timeline for meaning",
        "Just one more trim",
        "Praying the autosave worked"
    ],
    AEFT: [
        "Currently suffering",
        "Keyframing in the dark",
        "Waiting on a render",
        "Precomping everything",
        "Easing every curve",
        "Expressions: instructions unclear",
        "RAM preview: 3 frames",
        "Parenting layers, not my kids",
        "The comp is fine. Everything is fine",
        "Nudging one pixel for 40 minutes"
    ],
    ILST: [
        "Currently suffering",
        "Bending Béziers",
        "Wrestling anchor points",
        "Vector or bust",
        "Outlining all the strokes",
        "Pen tool vs me: round 12",
        "Why is there a stray point?!",
        "Expand appearance and pray"
    ],
    IDSN: [
        "Currently suffering",
        "Kerning obsessively",
        "Chasing the grid",
        "Paragraph styles all day",
        "Fixing the widow. Then the orphan",
        "Overset text, my old friend"
    ],
    AUDT: [
        "Currently suffering",
        "Riding the waveform",
        "Hunting background noise",
        "Normalizing everything",
        "Removing every single mouth click",
        "That hum is definitely the fridge"
    ],
    FLPR: [
        "Currently suffering",
        "Tweening frames",
        "Drawing one frame at a time",
        "Onion skins everywhere"
    ],
    DRWV: [
        "Currently suffering",
        "Debugging a div",
        "Centering things, allegedly",
        "It works on my machine"
    ],
    AICY: [
        "Currently suffering",
        "Polishing copy",
        "Fitting the headline",
        "Trimming words to fit"
    ],
    PRLD: [
        "Currently suffering",
        "Logging footage",
        "Ingesting clips"
    ],
    RUSH: [
        "Currently suffering",
        "Cutting on the go",
        "Quick edit mode",
        "Editing from the couch"
    ],
    MEDIA_ENCODER: [
        "Currently suffering",
        "Encoding patiently",
        "Crunching frames",
        "Queue: 47 items. Pray"
    ],
    DEFAULT: [
        "Currently suffering",
        "Creating something",
        "In the zone",
        "Deadline energy"
    ]
};
APP_THEMES.PHSP = APP_THEMES.PHXS;

export function getThemeLines(appId) {
    return APP_THEMES[appId] || APP_THEMES.DEFAULT;
}

export function pickStatusLine(cfg, appId, nowMs) {
    if (!cfg || !cfg.enabled) return "";
    const custom = (cfg.lines || []).map((l) => String(l).trim()).filter(Boolean);
    const pool = custom.length ? custom : (cfg.useThemes === false ? [] : getThemeLines(appId));
    if (!pool.length) return "";
    // Discord ignores presence updates faster than ~1 per 15s, so never rotate quicker than that.
    const slot = Math.max(15, parseInt(cfg.intervalSec, 10) || 30) * 1000;
    return pool[Math.floor(nowMs / slot) % pool.length];
}

export function flairText(appName, elapsedMs) {
    const h = Math.floor(elapsedMs / 3600000);
    if (h < 1) return "";
    if (h >= 12) return h + "h in. Are you okay? 😳";
    if (h >= 8) return h + "h deep. Touch some grass 🌱";
    if (h >= 4) return h + "h deep. Hydrate! 💧";
    if (h >= 2) return h + "h deep in " + appName + ". Send coffee ☕";
    return "1h deep in " + appName;
}

export function prettyTool(key) {
    if (!key || key === "undefined") return "";
    const words = String(key)
        .replace(/tool$/i, "")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .trim();
    if (!words) return "";
    return "Using " + words.charAt(0).toUpperCase() + words.slice(1).toLowerCase() + " tool";
}

export function isWebhookUrl(url) {
    return /^https:\/\/(discord|discordapp)\.com\/api\/webhooks\/\d+\/[\w-]+$/i.test(String(url || "").trim());
}

export function formatDuration(ms) {
    const mins = Math.floor(ms / 60000);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? h + "h " + m + "m" : m + "m";
}

// ---------------------------------------------------------------------------
// Stats & achievements (stored under the "stats" key, kept apart from settings)
// ---------------------------------------------------------------------------
export const ACHIEVEMENTS = [
    { id: "first",    icon: "👋", name: "First Steps",       desc: "Start your first tracked session",  test: (s) => s.sessions >= 1 },
    { id: "hour1",    icon: "⏱️", name: "Hour One",          desc: "Log 1 hour total",                  test: (s) => s.totalMs >= 3600000 },
    { id: "hour10",   icon: "🔥", name: "Getting Serious",   desc: "Log 10 hours total",                test: (s) => s.totalMs >= 36000000 },
    { id: "hour50",   icon: "🏅", name: "Dedicated",         desc: "Log 50 hours total",                test: (s) => s.totalMs >= 180000000 },
    { id: "hour100",  icon: "🏆", name: "Centurion",         desc: "Log 100 hours total",               test: (s) => s.totalMs >= 360000000 },
    { id: "regular",  icon: "📅", name: "Regular",           desc: "Open 10 sessions",                  test: (s) => s.sessions >= 10 },
    { id: "owl",      icon: "🦉", name: "Night Owl",         desc: "Work between midnight and 5am",     test: (s) => !!s.nightOwl },
    { id: "layers",   icon: "🥞", name: "100 Layers Deep",   desc: "Open a document with 100+ layers",  test: (s) => s.maxLayers >= 100 },
    { id: "render1",  icon: "🎬", name: "First Render",      desc: "Finish a render",                   test: (s) => s.exports >= 1 },
    { id: "render25", icon: "🏭", name: "Render Farm",       desc: "Finish 25 renders",                 test: (s) => s.exports >= 25 }
];

export function defaultStats() {
    return { totalMs: 0, perApp: {}, sessions: 0, exports: 0, maxLayers: 0, nightOwl: false, unlocked: {}, since: Date.now() };
}

export function getStats() {
    const saved = getConfiguration("stats");
    return Object.assign(defaultStats(), saved || {});
}

// Written straight to localStorage (no CSEvent) so frequent saves stay quiet.
export function saveStats(stats) {
    try {
        window.localStorage.setItem("stats", JSON.stringify(stats));
    } catch(e) {
        console.error("Failed to save stats:", e);
    }
}

// Marks any newly earned achievements on the stats object and returns them.
export function evaluateAchievements(stats) {
    const fresh = [];
    stats.unlocked = stats.unlocked || {};
    ACHIEVEMENTS.forEach((a) => {
        if (!stats.unlocked[a.id] && a.test(stats)) {
            stats.unlocked[a.id] = Date.now();
            fresh.push(a);
        }
    });
    return fresh;
}
