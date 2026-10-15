/*
 * File: Repository.jsx
 * Project: discord-rpc
 * Original Author: Tee (tee@stainless.love)
 * Upgraded & Maintained By: Cane
 * 
 * Copyright (c) 2023-2024 Tee & Cane
 */
import React, { useEffect, useState } from 'react';
import property from "../../../package.json";
import { FaDiscord, FaGithub, FaHeart, FaCode, FaExternalLinkAlt, FaClock, FaSyncAlt, FaBug, FaWrench } from 'react-icons/fa';
import { openURLInDefaultBrowser } from '..';

export default function Repository() {
    const [update, setUpdate] = useState(false);
    const [latest, setLatest] = useState(property.version);

    useEffect(() => {
        fetch("https://api.github.com/repos/teeteeteeteetee/adobe-discord-rpc/releases/latest")
            .then(response => response.json())
            .then(data => {
                if (data && data["tag_name"] && data["tag_name"] !== property.version) {
                    setUpdate(true);
                    setLatest(data["tag_name"]);
                }
            })
            .catch(() => {});
    }, []);

    const cardStyle = {
        backgroundColor: '#2b2d31',
        borderRadius: '8px',
        border: '1px solid #383a40',
        padding: '14px',
        marginBottom: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
    };

    const badgeStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '11px',
        fontWeight: '600',
        padding: '3px 8px',
        borderRadius: '12px',
        backgroundColor: '#1e1f22',
        color: '#b5bac1',
        border: '1px solid #35373c'
    };

    const linkBtnStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '12px',
        fontWeight: '500',
        padding: '7px 12px',
        borderRadius: '6px',
        backgroundColor: '#35373c',
        color: '#ffffff',
        cursor: 'pointer',
        border: 'none',
        transition: 'background-color 0.15s ease'
    };

    return (
        <div style={{
            padding: '16px',
            color: '#dbdee1',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            boxSizing: 'border-box',
            maxWidth: '100%',
            overflowY: 'auto'
        }}>
            {/* Header Banner */}
            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 6px 0', letterSpacing: '-0.3px' }}>
                    Adobe Discord RPC
                </h1>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        color: '#5865F2',
                        backgroundColor: 'rgba(88,101,242,0.15)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        border: '1px solid rgba(88,101,242,0.3)'
                    }}>
                        v{property.version} • Enhanced Edition
                    </span>
                </div>
            </div>

            {/* Cane Credit Card (Upgraded & Maintained By) */}
            <div style={{ ...cardStyle, borderLeft: '4px solid #23a55a' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        backgroundColor: '#23a55a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontWeight: 'bold',
                        fontSize: '18px',
                        boxShadow: '0 2px 8px rgba(35,165,90,0.3)',
                        flexShrink: 0
                    }}>
                        C
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#ffffff' }}>Cane</span>
                            <span style={{
                                fontSize: '10px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                backgroundColor: 'rgba(35,165,90,0.2)',
                                color: '#23a55a',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                fontWeight: '700'
                            }}>
                                Upgraded By
                            </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '12px', color: '#949ba4' }}>
                            Modernization, Spoofing & Bug Fixes
                        </p>
                        <div style={{ marginTop: '6px' }}>
                            <button
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    padding: '3px 8px',
                                    borderRadius: '5px',
                                    backgroundColor: '#1e1f22',
                                    color: '#23a55a',
                                    border: '1px solid #23a55a',
                                    cursor: 'pointer'
                                }}
                                onClick={() => openURLInDefaultBrowser("https://github.com/canefly/adobe-discord-rpc")}
                            >
                                <FaGithub size={12} />
                                <span>Fork: @canefly</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Feature tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                    <span style={badgeStyle}><FaClock style={{ color: '#23a55a' }} /> Spoof Elapsed Time</span>
                    <span style={badgeStyle}><FaSyncAlt style={{ color: '#5865F2' }} /> Live Presence Sync</span>
                    <span style={badgeStyle}><FaBug style={{ color: '#f0b232' }} /> ExtendScript Probing</span>
                    <span style={badgeStyle}><FaCode style={{ color: '#eb459e' }} /> Discord Dark UI</span>
                </div>
            </div>

            {/* Tee Credit Card (Original Creator) */}
            <div style={{ ...cardStyle, borderLeft: '4px solid #5865F2' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        backgroundColor: '#5865F2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontWeight: 'bold',
                        fontSize: '18px',
                        boxShadow: '0 2px 8px rgba(88,101,242,0.3)',
                        flexShrink: 0
                    }}>
                        T
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#ffffff' }}>Tee</span>
                            <span style={{
                                fontSize: '10px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                backgroundColor: 'rgba(88,101,242,0.2)',
                                color: '#5865F2',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                fontWeight: '700'
                            }}>
                                Original Creator
                            </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '12px', color: '#949ba4' }}>
                            Original Extension & Architecture
                        </p>
                    </div>
                </div>
            </div>

            {/* Repository Links */}
            <div style={cardStyle}>
                <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#949ba4', letterSpacing: '0.6px', marginBottom: '10px' }}>
                    Links & Repository
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                        style={{ ...linkBtnStyle, backgroundColor: '#23a55a' }}
                        onClick={() => openURLInDefaultBrowser("https://github.com/canefly/adobe-discord-rpc")}
                    >
                        <FaGithub size={15} /> Cane's Fork
                    </button>
                    <button
                        style={linkBtnStyle}
                        onClick={() => openURLInDefaultBrowser("https://github.com/teeteeteeteetee/adobe-discord-rpc")}
                    >
                        <FaGithub size={15} /> Original Repo
                    </button>
                    <button
                        style={linkBtnStyle}
                        onClick={() => openURLInDefaultBrowser("https://discord.com/invite/RGtxbuFtzb")}
                    >
                        <FaDiscord size={15} style={{ color: '#5865F2' }} /> Discord Server
                    </button>
                </div>

                {update && (
                    <div style={{ marginTop: '12px', padding: '8px 10px', borderRadius: '6px', backgroundColor: 'rgba(35,165,90,0.15)', border: '1px solid rgba(35,165,90,0.3)' }}>
                        <a
                            style={{ color: '#23a55a', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
                            onClick={() => openURLInDefaultBrowser(`https://github.com/teeteeteeteetee/adobe-discord-rpc/releases/tag/${latest}`)}
                        >
                            <span>New upstream release: <strong>{latest}</strong></span>
                            <FaExternalLinkAlt size={10} />
                        </a>
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer style={{ textAlign: 'center', marginTop: '18px', paddingBottom: '16px' }}>
                <p style={{ margin: 0, fontSize: '11px', color: '#80848e' }}>
                    Made by <span style={{ color: '#b5bac1' }}>Tee</span> • Upgraded by <span style={{ color: '#ffffff', fontWeight: '600' }}>Cane</span>
                </p>
            </footer>
        </div>
    );
}