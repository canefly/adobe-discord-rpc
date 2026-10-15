/*
 * File: Debug.jsx
 * Project: discord-rpc
 * Author: Tee & Antigravity
 * Copyright (c) 2026
 */

import React, { useEffect, useState } from 'react';
import { getApplicationID, dispatchEvent } from '..';
import { getConfigurations } from '../../rpc_client-src/localstorage';

export default function Debug() {
    const [appId, setAppId] = useState('Unknown');
    const [probeResult, setProbeResult] = useState(null);
    const [logs, setLogs] = useState([]);
    const [probing, setProbing] = useState(false);

    const csi = window.csInterface || (window.parent && window.parent.csInterface);

    const addLog = (msg) => {
        const time = new Date().toLocaleTimeString();
        setLogs((prev) => [`[${time}] ${msg}`, ...prev.slice(0, 30)]);
    };

    const runProbe = () => {
        setProbing(true);
        addLog("Querying ExtendScript host probes...");
        if (!csi) {
            setProbeResult({ error: "CSInterface not available" });
            setProbing(false);
            return;
        }

        csi.evalScript("typeof state === 'function' ? state() : 'N/A'", (stateRes) => {
            csi.evalScript("typeof details === 'function' ? details() : 'N/A'", (detailsRes) => {
                csi.evalScript("typeof largeImageText === 'function' ? largeImageText() : 'N/A'", (appTextRes) => {
                    setProbeResult({
                        state: stateRes,
                        details: detailsRes,
                        appText: appTextRes,
                        timestamp: new Date().toLocaleTimeString()
                    });
                    addLog(`Probe completed: state="${stateRes}", details="${detailsRes}"`);
                    setProbing(false);
                });
            });
        });
    };

    useEffect(() => {
        const id = (typeof getApplicationID === 'function' ? getApplicationID() : null) || 'AEFT';
        setAppId(id);
        addLog(`Debug dashboard initialized for ${id}`);

        const onActivity = (e) => {
            try {
                const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
                addLog(`Event: com.tee.rpc.activity -> "${data.details || ''}" | "${data.state || ''}"`);
            } catch(err) {}
        };

        const onStatus = (e) => {
            try {
                const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
                addLog(`Event: com.tee.rpc.status -> connected=${data.connected}`);
            } catch(err) {}
        };

        const onAck = (e) => {
            addLog("Event: com.tee.rpc.config.ack received from background RPC.");
        };

        if (csi) {
            csi.addEventListener("com.tee.rpc.activity", onActivity);
            csi.addEventListener("com.tee.rpc.status", onStatus);
            csi.addEventListener("com.tee.rpc.config.ack", onAck);
        }

        // Auto-run probe once
        runProbe();

        return () => {
            if (csi) {
                csi.removeEventListener("com.tee.rpc.activity", onActivity);
                csi.removeEventListener("com.tee.rpc.status", onStatus);
                csi.removeEventListener("com.tee.rpc.config.ack", onAck);
            }
        };
    }, []);

    const appNames = {
        AEFT: "After Effects",
        PPRO: "Premiere Pro",
        PHXS: "Photoshop",
        PHSP: "Photoshop",
        ILST: "Illustrator",
        AUDT: "Audition",
        IDSN: "InDesign",
        DRWV: "Dreamweaver",
        FLPR: "Animate"
    };

    return (
        <div style={{ width: '100%', height: '100%', padding: '16px', boxSizing: 'border-box', overflowY: 'auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* System & Connection Info */}
                <div style={{ backgroundColor: '#2b2d31', borderRadius: '6px', padding: '12px', border: '1px solid #35373c' }}>
                    <p style={{ color: '#949ba4', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px 0' }}>
                        System Diagnostics
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                        <div>
                            <span style={{ color: '#949ba4' }}>Host Application: </span>
                            <span style={{ color: '#ffffff', fontWeight: '600' }}>{appNames[appId] || appId} ({appId})</span>
                        </div>
                        <div>
                            <span style={{ color: '#949ba4' }}>Extension Version: </span>
                            <span style={{ color: '#5865F2', fontWeight: '600' }}>1.0.2</span>
                        </div>
                    </div>
                </div>

                {/* Live Host Probe Card */}
                <div style={{ backgroundColor: '#2b2d31', borderRadius: '6px', padding: '12px', border: '1px solid #35373c' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <p style={{ color: '#949ba4', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                            Live ExtendScript Probe
                        </p>
                        <button
                            onClick={runProbe}
                            disabled={probing}
                            style={{
                                backgroundColor: '#5865F2',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '4px 10px',
                                fontSize: '11px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            {probing ? "Probing..." : "Test Host Probe"}
                        </button>
                    </div>

                    {probeResult ? (
                        <div style={{ backgroundColor: '#1e1f22', borderRadius: '4px', padding: '8px 10px', fontSize: '12px', fontFamily: 'monospace' }}>
                            <div style={{ color: '#dbdee1' }}>
                                <span style={{ color: '#23a55a' }}>details():</span> {probeResult.details || '<empty>'}
                            </div>
                            <div style={{ color: '#dbdee1', marginTop: '4px' }}>
                                <span style={{ color: '#23a55a' }}>state():</span> {probeResult.state || '<empty>'}
                            </div>
                            <div style={{ color: '#949ba4', fontSize: '10px', marginTop: '6px' }}>
                                Last checked: {probeResult.timestamp}
                            </div>
                        </div>
                    ) : (
                        <p style={{ color: '#949ba4', fontSize: '12px', margin: 0 }}>Click "Test Host Probe" to inspect Adobe state.</p>
                    )}
                </div>

                {/* Event & Activity Stream */}
                <div style={{ backgroundColor: '#2b2d31', borderRadius: '6px', padding: '12px', border: '1px solid #35373c' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <p style={{ color: '#949ba4', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                            Live Event Stream
                        </p>
                        <button
                            onClick={() => setLogs([])}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#949ba4',
                                fontSize: '11px',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => (e.target.style.color = '#ffffff')}
                            onMouseLeave={(e) => (e.target.style.color = '#949ba4')}
                        >
                            Clear
                        </button>
                    </div>

                    <div style={{
                        backgroundColor: '#111214',
                        borderRadius: '4px',
                        padding: '8px 10px',
                        maxHeight: '140px',
                        overflowY: 'auto',
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        color: '#dbdee1',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                    }}>
                        {logs.length > 0 ? (
                            logs.map((log, i) => (
                                <div key={i} style={{ wordBreak: 'break-all' }}>
                                    {log}
                                </div>
                            ))
                        ) : (
                            <span style={{ color: '#6d6f78', fontStyle: 'italic' }}>Listening for CEP events...</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}