/*
 * File: Config.jsx
 * Project: discord-rpc
 * Author: Tee & Antigravity
 * Copyright (c) 2026
 */

import React, { useEffect, useState, useRef } from 'react';
import ConfigItem from '../components/ConfigItem';
import { dispatchEvent } from '..';
import {
    ACHIEVEMENTS,
    extensionConfigurationTemplate,
    featuresConfigurationTemplate,
    formatDuration,
    getConfigurations,
    getStats,
    resetConfiguration,
    rpcConfigurationTemplate,
    setConfiguration
} from "../../rpc_client-src/localstorage";

const APP_NAMES = {
    PHXS: "Photoshop", PHSP: "Photoshop", PPRO: "Premiere Pro", AEFT: "After Effects",
    ILST: "Illustrator", IDSN: "InDesign", AUDT: "Audition", FLPR: "Animate",
    DRWV: "Dreamweaver", AICY: "InCopy", PRLD: "Prelude", RUSH: "Premiere Rush",
    MEDIA_ENCODER: "Media Encoder"
};

function StatsPanel({ stats }) {
    const unlocked = stats.unlocked || {};
    const apps = Object.keys(stats.perApp || {}).sort((a, b) => stats.perApp[b] - stats.perApp[a]);
    const tile = { flex: 1, backgroundColor: '#1e1f22', border: '1px solid #35373c', borderRadius: '6px', padding: '8px 10px', textAlign: 'center' };
    const big = { color: '#ffffff', fontSize: '15px', fontWeight: '700' };
    const small = { color: '#949ba4', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' };

    return (
        <div style={{ paddingBottom: '10px' }}>
            <p style={{ fontSize: '11px', fontWeight: '700', color: '#949ba4', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Stats &amp; Achievements
            </p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <div style={tile}><div style={big}>{formatDuration(stats.totalMs || 0)}</div><div style={small}>Time logged</div></div>
                <div style={tile}><div style={big}>{stats.sessions || 0}</div><div style={small}>Sessions</div></div>
                <div style={tile}><div style={big}>{stats.exports || 0}</div><div style={small}>Renders</div></div>
            </div>
            {apps.length > 0 && (
                <div style={{ marginBottom: '10px', fontSize: '12px', color: '#dbdee1' }}>
                    {apps.map((id) => (
                        <div key={id} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                            <span>{APP_NAMES[id] || id}</span>
                            <span style={{ color: '#949ba4' }}>{formatDuration(stats.perApp[id])}</span>
                        </div>
                    ))}
                </div>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {ACHIEVEMENTS.map((a) => {
                    const got = !!unlocked[a.id];
                    return (
                        <div
                            key={a.id}
                            title={`${a.name}: ${a.desc}`}
                            style={{
                                width: '78px', padding: '6px 4px', textAlign: 'center', borderRadius: '6px',
                                border: got ? '1px solid #5865F2' : '1px solid #35373c',
                                backgroundColor: got ? 'rgba(88, 101, 242, 0.15)' : '#1e1f22',
                                opacity: got ? 1 : 0.45
                            }}
                        >
                            <div style={{ fontSize: '18px' }}>{got ? a.icon : '🔒'}</div>
                            <div style={{ fontSize: '10px', color: '#f2f3f5', fontWeight: '600', marginTop: '2px' }}>{a.name}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function Config() {
    const [config, setConfig] = useState({});
    const [stats, setStats] = useState(getStats());
    const [statusBanner, setStatusBanner] = useState(null); // { type: 'success' | 'info' | 'error', text: '' }
    const timerRef = useRef(null);

    const showBanner = (type, text, autoClearMs = 4000) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setStatusBanner({ type, text });
        if (autoClearMs) {
            timerRef.current = setTimeout(() => {
                setStatusBanner(null);
            }, autoClearMs);
        }
    };

    useEffect(() => {
        setConfig(getConfigurations());

        const handleAck = (e) => {
            try {
                let data = e.data;
                if (typeof data === 'string') data = JSON.parse(data);
                if (data && data.reset) {
                    showBanner('info', 'Settings restored to defaults.');
                } else if (data && data.success) {
                    showBanner('success', 'Configuration applied & Discord presence updated!');
                }
            } catch (err) {
                console.error("Error reading ack:", err);
            }
        };

        // Stats live in the presence engine; it pushes them to us.
        const handleStats = (e) => {
            try {
                let data = e.data;
                if (typeof data === 'string') data = JSON.parse(data);
                if (data && typeof data === 'object') setStats(data);
            } catch (err) {
                console.error("Error reading stats:", err);
            }
        };

        const handleAchievement = (e) => {
            try {
                let data = e.data;
                if (typeof data === 'string') data = JSON.parse(data);
                if (Array.isArray(data) && data.length) {
                    showBanner('success', `Achievement unlocked: ${data.join(', ')}`, 6000);
                }
            } catch (err) {
                console.error("Error reading achievement:", err);
            }
        };

        if (window.csInterface) {
            window.csInterface.addEventListener("com.tee.rpc.config.ack", handleAck);
            window.csInterface.addEventListener("com.tee.rpc.stats", handleStats);
            window.csInterface.addEventListener("com.tee.rpc.achievement", handleAchievement);
        }
        // Ask the engine for its current state (includes stats).
        dispatchEvent("com.tee.rpc.update", {});

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            if (window.csInterface) {
                window.csInterface.removeEventListener("com.tee.rpc.config.ack", handleAck);
                window.csInterface.removeEventListener("com.tee.rpc.stats", handleStats);
                window.csInterface.removeEventListener("com.tee.rpc.achievement", handleAchievement);
            }
        };
    }, []);

    const handleSaveConfig = () => {
        showBanner('info', 'Applying configuration to Discord RPC...', 0);
        try {
            // "stats" belongs to the presence engine, so never write it back from here.
            const { stats: _ignoredStats, ...settingsOnly } = config;
            for (const [key, value] of Object.entries(settingsOnly)) {
                setConfiguration(key, value);
            }
            dispatchEvent("com.tee.rpc.config", settingsOnly);

            timerRef.current = setTimeout(() => {
                showBanner('success', 'Configuration applied & Discord presence updated!');
            }, 400);
        } catch (err) {
            console.error("Failed to save config:", err);
            showBanner('error', 'Failed to apply configuration.');
        }
    };

    const handleResetConfig = () => {
        try {
            const defaults = resetConfiguration();
            setConfig(defaults);
            dispatchEvent("com.tee.rpc.reset", {});
            showBanner('info', 'Settings restored to defaults.');
        } catch (err) {
            console.error("Failed to reset config:", err);
            showBanner('error', 'Failed to reset settings.');
        }
    };

    return (
        <div style={{ width: '100%', height: '100%', padding: '16px', boxSizing: 'border-box', overflowY: 'auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Clean Discord-Styled Inline Status Banner */}
                {statusBanner && (
                    <div
                        style={{
                            marginBottom: '14px',
                            padding: '10px 14px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor:
                                statusBanner.type === 'success'
                                    ? 'rgba(35, 165, 90, 0.2)'
                                    : statusBanner.type === 'error'
                                    ? 'rgba(242, 63, 67, 0.2)'
                                    : 'rgba(88, 101, 242, 0.2)',
                            border:
                                statusBanner.type === 'success'
                                    ? '1px solid #23a55a'
                                    : statusBanner.type === 'error'
                                    ? '1px solid #f23f43'
                                    : '1px solid #5865F2',
                            color: '#ffffff',
                            fontSize: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                                {statusBanner.type === 'success' && '✓'}
                                {statusBanner.type === 'error' && '✕'}
                                {statusBanner.type === 'info' && '●'}
                            </span>
                            <span style={{ fontWeight: '500' }}>{statusBanner.text}</span>
                        </div>
                        <button
                            onClick={() => setStatusBanner(null)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#949ba4',
                                fontSize: '16px',
                                cursor: 'pointer',
                                padding: '0 4px',
                                lineHeight: '1'
                            }}
                            onMouseEnter={(e) => (e.target.style.color = '#ffffff')}
                            onMouseLeave={(e) => (e.target.style.color = '#949ba4')}
                        >
                            &times;
                        </button>
                    </div>
                )}

                <ConfigItem
                    group="rpc"
                    config={config}
                    setConfig={setConfig}
                    title="Rich Presence Configuration"
                    template={rpcConfigurationTemplate}
                />

                <div style={{ margin: '14px 0', borderTop: '1px solid #35373c' }} />

                <ConfigItem
                    group="features"
                    config={config}
                    setConfig={setConfig}
                    title="Fun Features"
                    template={featuresConfigurationTemplate}
                />

                <div style={{ margin: '14px 0', borderTop: '1px solid #35373c' }} />

                <StatsPanel stats={stats} />

                <div style={{ margin: '14px 0', borderTop: '1px solid #35373c' }} />

                <ConfigItem
                    group="extension"
                    config={config}
                    setConfig={setConfig}
                    title="Extension Configuration"
                    template={extensionConfigurationTemplate}
                />

                {/* Professional Discord Button Bar */}
                <div style={{ display: 'flex', flexDirection: 'row', gap: '12px', justifyContent: 'center', paddingTop: '20px', paddingBottom: '20px' }}>
                    <button
                        onClick={handleSaveConfig}
                        style={{
                            backgroundColor: '#5865F2',
                            color: '#ffffff',
                            border: 'none',
                            padding: '8px 18px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s ease',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}
                        onMouseEnter={(e) => (e.target.style.backgroundColor = '#4752c4')}
                        onMouseLeave={(e) => (e.target.style.backgroundColor = '#5865F2')}
                    >
                        Apply Configuration
                    </button>
                    <button
                        onClick={handleResetConfig}
                        style={{
                            backgroundColor: 'transparent',
                            color: '#f23f43',
                            border: '1px solid #f23f43',
                            padding: '8px 18px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#f23f43';
                            e.target.style.color = '#ffffff';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.color = '#f23f43';
                        }}
                    >
                        Reset Default
                    </button>
                </div>
            </div>
        </div>
    );
}