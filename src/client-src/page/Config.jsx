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
    extensionConfigurationTemplate,
    getConfigurations,
    resetConfiguration,
    rpcConfigurationTemplate,
    setConfiguration
} from "../../rpc_client-src/localstorage";

export default function Config() {
    const [config, setConfig] = useState({});
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

        if (window.csInterface) {
            window.csInterface.addEventListener("com.tee.rpc.config.ack", handleAck);
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            if (window.csInterface) {
                window.csInterface.removeEventListener("com.tee.rpc.config.ack", handleAck);
            }
        };
    }, []);

    const handleSaveConfig = () => {
        showBanner('info', 'Applying configuration to Discord RPC...', 0);
        try {
            for (const [key, value] of Object.entries(config)) {
                setConfiguration(key, value);
            }
            dispatchEvent("com.tee.rpc.config", config);

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