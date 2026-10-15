/*
 * File: Preview.jsx
 * Project: discord-rpc
 * Author: Tee & Antigravity
 * Copyright (c) 2026
 */

import React, { useEffect, useState } from "react";
import Avatar from "../components/Avatar";
import Banner from "../components/Banner";
import { dispatchEvent } from "..";
import Icons from "../components/Icons";
import { getConfigurations } from "../../rpc_client-src/localstorage";

export default function Preview() {
    const [activity, setActivity] = useState({});
    const [user, setUser] = useState({
        username: "User",
        discriminator: "0000",
    });
    const [connected, setConnected] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [config, setConfig] = useState(getConfigurations());
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        const intervalId = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(intervalId);
    }, []);

    const formatElapsed = () => {
        if (!activity.startTimestamp) return "Active";
        const start = new Date(activity.startTimestamp).getTime();
        if (isNaN(start)) return "Active";
        const totalSecs = Math.max(0, Math.floor((now - start) / 1000));
        const hours = Math.floor(totalSecs / 3600);
        const mins = Math.floor((totalSecs % 3600) / 60);
        const secs = totalSecs % 60;
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')} elapsed`;
    };

    const csi = window.csInterface || (window.parent && window.parent.csInterface);

    const safeParse = (data) => {
        if (typeof data === 'string') {
            try { return JSON.parse(data); } catch(e) { return {}; }
        }
        return data || {};
    };

    const handleRefresh = () => {
        setRefreshing(true);
        setConfig(getConfigurations());
        dispatchEvent("com.tee.rpc.update", {});
        setTimeout(() => setRefreshing(false), 800);
    };

    useEffect(() => {
        setConfig(getConfigurations());
        dispatchEvent("com.tee.rpc.update", {});

        const onActivity = (e) => {
            const data = safeParse(e.data);
            setActivity(data);
        };

        const onUser = (e) => {
            const data = safeParse(e.data);
            if (data && data.username) {
                setUser(data);
                setConnected(true);
            }
        };

        const onStatus = (e) => {
            const data = safeParse(e.data);
            setConnected(!!data.connected);
            if (data.user) {
                setUser(data.user);
            }
            setRefreshing(false);
        };

        const onConfigCurrent = (e) => {
            const data = safeParse(e.data);
            if (data && data.rpc) {
                setConfig(data);
            }
        };

        if (csi) {
            csi.addEventListener("com.tee.rpc.activity", onActivity);
            csi.addEventListener("com.tee.rpc.user", onUser);
            csi.addEventListener("com.tee.rpc.status", onStatus);
            csi.addEventListener("com.tee.rpc.config.current", onConfigCurrent);
        }

        return () => {
            if (csi) {
                csi.removeEventListener("com.tee.rpc.activity", onActivity);
                csi.removeEventListener("com.tee.rpc.user", onUser);
                csi.removeEventListener("com.tee.rpc.status", onStatus);
                csi.removeEventListener("com.tee.rpc.config.current", onConfigCurrent);
            }
        };
    }, []);

    const iconChoice = config?.rpc?.largeImageKey?.value;
    const iconVersion = (iconChoice === "new" || iconChoice === "logo2") ? 1 : 0;
    const isRpcEnabled = config?.rpc?.enabled?.enabled !== false;

    return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '16px', paddingBottom: '32px', overflowY: 'auto' }}>
            {/* Status & Refresh Bar */}
            <div style={{
                width: '320px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '14px',
                padding: '8px 12px',
                backgroundColor: '#2b2d31',
                borderRadius: '6px',
                border: '1px solid #35373c',
                boxSizing: 'border-box'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                    <span style={{
                        display: 'inline-block',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: connected ? '#23a55a' : '#f23f43'
                    }} />
                    <span style={{ color: '#dbdee1', fontWeight: '500' }}>
                        {connected ? `Discord Connected` : `Discord Disconnected`}
                    </span>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        fontWeight: '600',
                        color: '#f2f3f5',
                        backgroundColor: '#383a40',
                        border: 'none',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = '#4e5058')}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = '#383a40')}
                >
                    <span style={{ display: 'inline-block', transform: refreshing ? 'rotate(180deg)' : 'none', transition: 'transform 0.4s ease' }}>↻</span>
                    <span>{refreshing ? 'Syncing...' : 'Refresh'}</span>
                </button>
            </div>

            {/* Discord Profile Preview Card */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignSelf: 'center',
                    backgroundColor: '#111214',
                    borderRadius: '8px',
                    width: '320px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                    overflow: 'hidden'
                }}>
                    <div className="flex flex-col -space-y-12">
                        <Banner className={"self-start"} />
                        <div className="pl-3">
                            <Avatar />
                        </div>
                    </div>
                    <div className="w-full pt-7 px-5">
                        <div className="flex flex-col divide-y divide-gray-800 gap-1 bg-black">
                            <p style={{ color: '#ffffff', fontWeight: '600', fontSize: '15px' }}>
                                {user.username}
                                {user.discriminator && user.discriminator !== "0" && user.discriminator !== "0000" && (
                                    <span style={{ color: '#949ba4', fontSize: '13px', marginLeft: '4px' }}>{`#${user.discriminator}`}</span>
                                )}
                            </p>
                            <p style={{ color: '#949ba4', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', paddingTop: '4px' }}>
                                PLAYING A GAME
                            </p>
                        </div>

                        {isRpcEnabled ? (
                            <div style={{ display: 'flex', gap: '12px', paddingTop: '12px', paddingBottom: '20px', alignItems: 'center' }}>
                                <Icons className="rounded-md w-[60px] h-[60px] object-cover flex-shrink-0" version={iconVersion} />
                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>
                                    <p style={{ color: '#ffffff', fontWeight: '700', fontSize: '13px', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                        {activity.name || "Adobe"}
                                    </p>
                                    {activity.details && (
                                        <p style={{ color: '#dbdee1', fontSize: '12px', margin: '2px 0 0 0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                            {activity.details}
                                        </p>
                                    )}
                                    {activity.state && (
                                        <p style={{ color: '#949ba4', fontSize: '12px', margin: '2px 0 0 0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                            {activity.state}
                                            {activity.partySize > 0 && activity.partyMax > 0 && (
                                                <span>{` (${activity.partySize} of ${activity.partyMax})`}</span>
                                            )}
                                        </p>
                                    )}
                                    <p style={{ color: '#949ba4', fontSize: '11px', margin: '4px 0 0 0' }}>{formatElapsed()}</p>
                                </div>
                            </div>
                        ) : (
                            <div style={{ padding: '24px 0', textAlign: 'center', fontSize: '12px', color: '#949ba4', fontStyle: 'italic' }}>
                                Rich Presence is currently disabled in Config.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
