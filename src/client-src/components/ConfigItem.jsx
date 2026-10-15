/*
 * File: ConfigItem.jsx
 * Project: discord-rpc
 * Author: Tee & Antigravity
 * Copyright (c) 2026
 */
import React from "react";
import "../discord.css";

function ConfigCheckbox({ id, checked, onChange }) {
    return (
        <div className="checkbox-container my-auto">
            <input
                checked={!!checked}
                onChange={onChange}
                className="checkbox cursor-pointer"
                id={id}
                type="checkbox"
            />
            <div className="checkbox-visual outline-none border-none focus:ring-0 cursor-pointer">
                <div></div>
            </div>
        </div>
    );
}

function ConfigDropdown({ id, value, onChange }) {
    return (
        <div>
            <select
                value={value || "old"}
                onChange={(e) => onChange(e.target.value)}
                id={id}
                style={{
                    backgroundColor: '#1e1f22',
                    color: '#f2f3f5',
                    border: '1px solid #4e5058',
                    borderRadius: '4px',
                    padding: '4px 10px',
                    fontSize: '12px',
                    outline: 'none',
                    cursor: 'pointer',
                    minWidth: '110px'
                }}
                name={id}
            >
                <option value="old">Old</option>
                <option value="new">Updated</option>
            </select>
        </div>
    );
}

function ConfigTimeSpoof({ id, data, onChange }) {
    const isEnabled = !!data?.enabled;
    const hours = data?.hours !== undefined ? data.hours : 4;
    const minutes = data?.minutes !== undefined ? data.minutes : 20;

    const handleToggle = () => {
        onChange({ ...data, enabled: !isEnabled, hours, minutes });
    };

    const handleSetHours = (h) => {
        const val = Math.max(0, parseInt(h, 10) || 0);
        onChange({ ...data, hours: val });
    };

    const handleSetMinutes = (m) => {
        const val = Math.max(0, Math.min(59, parseInt(m, 10) || 0));
        onChange({ ...data, minutes: val });
    };

    const handlePreset = (presetH) => {
        onChange({ ...data, enabled: true, hours: presetH, minutes: 0 });
    };

    return (
        <div style={{ width: '100%', padding: '6px 0' }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', color: '#dbdee1' }}>
                <div>
                    <label
                        style={{ userSelect: 'none', fontSize: '13px', cursor: 'pointer', color: '#f2f3f5', fontWeight: '400' }}
                        htmlFor={id}
                    >
                        Spoof Elapsed Time
                    </label>
                    <div style={{ fontSize: '11px', color: '#949ba4' }}>
                        Make it look like you've been grinding for hours
                    </div>
                </div>
                <ConfigCheckbox id={id} checked={isEnabled} onChange={handleToggle} />
            </div>

            {isEnabled && (
                <div style={{ marginTop: '8px', padding: '10px 12px', backgroundColor: '#1e1f22', borderRadius: '6px', border: '1px solid #35373c' }}>
                    {/* Quick Presets */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '11px', color: '#949ba4', marginRight: '4px' }}>Presets:</span>
                        {[1, 2, 4, 8, 12, 24, 48].map((h) => (
                            <button
                                key={h}
                                type="button"
                                onClick={() => handlePreset(h)}
                                style={{
                                    backgroundColor: hours === h && minutes === 0 ? '#5865F2' : '#2b2d31',
                                    color: hours === h && minutes === 0 ? '#ffffff' : '#dbdee1',
                                    border: '1px solid #4e5058',
                                    borderRadius: '4px',
                                    padding: '2px 8px',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                {h}h
                            </button>
                        ))}
                    </div>

                    {/* Custom input */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <input
                                type="number"
                                min="0"
                                max="999"
                                value={hours}
                                onChange={(e) => handleSetHours(e.target.value)}
                                style={{
                                    backgroundColor: '#2b2d31',
                                    color: '#ffffff',
                                    border: '1px solid #4e5058',
                                    borderRadius: '4px',
                                    padding: '4px 6px',
                                    width: '52px',
                                    fontSize: '12px',
                                    textAlign: 'center',
                                    outline: 'none'
                                }}
                            />
                            <span style={{ fontSize: '11px', color: '#dbdee1' }}>hours</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <input
                                type="number"
                                min="0"
                                max="59"
                                value={minutes}
                                onChange={(e) => handleSetMinutes(e.target.value)}
                                style={{
                                    backgroundColor: '#2b2d31',
                                    color: '#ffffff',
                                    border: '1px solid #4e5058',
                                    borderRadius: '4px',
                                    padding: '4px 6px',
                                    width: '46px',
                                    fontSize: '12px',
                                    textAlign: 'center',
                                    outline: 'none'
                                }}
                            />
                            <span style={{ fontSize: '11px', color: '#dbdee1' }}>mins</span>
                        </div>

                        <div style={{ marginLeft: 'auto', fontSize: '11px', color: '#23a55a', fontWeight: '500' }}>
                            ~{String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:00 elapsed
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ConfigItem({ title, template, group, config, setConfig }) {
    const handleCheckboxChange = (key) => {
        if (!config || !config[group] || !config[group][key]) return;
        const current = config[group][key].enabled;
        const nextConfig = {
            ...config,
            [group]: {
                ...config[group],
                [key]: {
                    ...config[group][key],
                    enabled: !current
                }
            }
        };
        setConfig(nextConfig);
    };

    const handleDropdownChange = (key, val) => {
        if (!config || !config[group] || !config[group][key]) return;
        const nextConfig = {
            ...config,
            [group]: {
                ...config[group],
                [key]: {
                    ...config[group][key],
                    value: val
                }
            }
        };
        setConfig(nextConfig);
    };

    const handleCustomChange = (key, val) => {
        if (!config || !config[group]) return;
        const nextConfig = {
            ...config,
            [group]: {
                ...config[group],
                [key]: val
            }
        };
        setConfig(nextConfig);
    };

    if (!config || !config[group]) {
        return null;
    }

    const list = Object.keys(template)
        .filter((key) => !template[key].hidden)
        .map((key) => {
            const itemData = config[group][key] || template[key];
            const isCheckbox = template[key].type === "checkbox";
            const isDropdown = template[key].type === "dropdown";
            const isTimeSpoof = template[key].type === "timeSpoof";

            return (
                <li key={key} style={{ padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    {isTimeSpoof ? (
                        <ConfigTimeSpoof
                            id={key}
                            data={itemData}
                            onChange={(newVal) => handleCustomChange(key, newVal)}
                        />
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', color: '#dbdee1' }}>
                            <label
                                style={{
                                    userSelect: 'none',
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    color: '#f2f3f5',
                                    fontWeight: '400'
                                }}
                                htmlFor={key}
                            >
                                {template[key].name}
                            </label>
                            <div>
                                {isDropdown && (
                                    <ConfigDropdown
                                        id={key}
                                        value={itemData.value}
                                        onChange={(val) => handleDropdownChange(key, val)}
                                    />
                                )}
                                {isCheckbox && (
                                    <ConfigCheckbox
                                        id={key}
                                        checked={itemData.enabled}
                                        onChange={() => handleCheckboxChange(key)}
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </li>
            );
        });

    return (
        <div style={{ paddingBottom: '10px' }}>
            <p style={{ fontSize: '11px', fontWeight: '700', color: '#949ba4', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                {title}
            </p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {list}
            </ul>
        </div>
    );
}
