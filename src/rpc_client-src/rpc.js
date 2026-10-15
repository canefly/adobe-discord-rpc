/**
 * @author Tee & Antigravity
 */

const { Client } = require('discord-rpc');

class RichPresence {
    constructor(clientInfo, csInterface) {
        this.active = false;
        this.clientInfo = clientInfo || {};
        this.clientId = this.clientInfo.id;
        this.csInterface = csInterface;
        this.reconnectTimer = null;
    }

    notifyStatus(connected, user) {
        if (!this.csInterface || typeof CSEvent === 'undefined') return;
        try {
            const statusEv = new CSEvent("com.tee.rpc.status", "APPLICATION");
            statusEv.data = {
                connected: !!connected,
                user: user || (this.client ? this.client.user : null)
            };
            this.csInterface.dispatchEvent(statusEv);
        } catch(e) {
            console.error("Failed to dispatch status event:", e);
        }
    }

    login() {
        return new Promise((resolve, reject) => {
            if (!this.clientId) {
                console.warn("No clientId found for this Adobe application.");
                this.notifyStatus(false, null);
                return resolve();
            }

            try {
                this.client = new Client({ transport: 'ipc' });

                this.client.on('ready', () => {
                    console.log(`Rich Presence ready! ${this.client.user.username}#${this.client.user.discriminator}`);
                    this.active = true;
                    this.notifyStatus(true, this.client.user);
                    resolve();
                });

                this.client.on('disconnected', () => {
                    console.log('Discord disconnected. Attempting reconnect...');
                    this.active = false;
                    this.notifyStatus(false, null);
                    this.destroy();
                    if (!this.reconnectTimer) {
                        this.reconnectTimer = setInterval(() => {
                            this.login().then(() => {
                                if (this.active && this.reconnectTimer) {
                                    clearInterval(this.reconnectTimer);
                                    this.reconnectTimer = null;
                                }
                            }).catch((err) => {
                                console.error("Couldn't reconnect to Discord! Error: " + err);
                            });
                        }, 15000);
                    }
                });

                this.client.login({ clientId: this.clientId }).catch(err => {
                    console.error("Discord login error:", err);
                    this.active = false;
                    this.notifyStatus(false, null);
                    resolve(); // resolve so app main() can still run and try to reconnect
                });
            } catch (err) {
                console.error("Exception during Discord login:", err);
                this.active = false;
                this.notifyStatus(false, null);
                resolve();
            }
        });
    }

    async destroy() {
        this.active = false;
        if (this.client) {
            try {
                await this.client.destroy();
            } catch(e) {
                // ignore
            }
            this.client = null;
        }
    }

    setActivity(props) {
        if (!this.client || !this.active) return;

        const activity = {};

        if (props.details && typeof props.details === 'string' && props.details.trim() !== '') {
            activity.details = props.details;
        }

        if (props.state && typeof props.state === 'string' && props.state.trim() !== '') {
            activity.state = props.state;
        }

        if (props.startTimestamp) {
            activity.startTimestamp = props.startTimestamp;
        }

        if (props.largeImageKey && typeof props.largeImageKey === 'string' && props.largeImageKey.trim() !== '') {
            activity.largeImageKey = props.largeImageKey;
            if (props.largeImageText && typeof props.largeImageText === 'string') {
                activity.largeImageText = props.largeImageText;
            }
        }

        if (props.smallImageKey && typeof props.smallImageKey === 'string' && props.smallImageKey.trim() !== '') {
            activity.smallImageKey = props.smallImageKey;
            if (props.smallImageText && typeof props.smallImageText === 'string') {
                activity.smallImageText = props.smallImageText;
            }
        }

        if (typeof props.partySize === 'number' && typeof props.partyMax === 'number' && props.partyMax > 0) {
            activity.partySize = props.partySize;
            activity.partyMax = props.partyMax;
        }

        // If no details, state, or icon, clear activity
        if (!activity.details && !activity.state && !activity.largeImageKey) {
            this.client.clearActivity().catch(console.error);
        } else {
            this.client.setActivity(activity).catch(console.error);
        }
    }

    getUser() {
        return this.client ? this.client.user : null;
    }

    getStatus() {
        return this.active;
    }
}

module.exports = RichPresence;
module.exports.default = RichPresence;