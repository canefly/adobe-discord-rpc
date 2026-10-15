; Script generated for Inno Setup Compiler
; Adobe Discord RPC (Enhanced Edition by Cane)
; Repository: https://github.com/canefly/adobe-discord-rpc

#define MyAppName "Adobe Discord RPC"
#define MyAppEdition "Enhanced Edition by Cane"
#define MyAppVersion "1.0.2"
#define MyAppPublisher "Cane"
#define MyAppURL "https://github.com/canefly/adobe-discord-rpc"

[Setup]
AppId={{5E97D453-2F47-49A8-A013-1BE4F9C2B7E1}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppVerName={#MyAppName} ({#MyAppEdition}) v{#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}/issues
AppUpdatesURL={#MyAppURL}/releases
DefaultDirName={userappdata}\Adobe\CEP\extensions\com.tee.discord-rpc
DisableDirPage=no
PrivilegesRequired=lowest
SetupIconFile=..\icons\favicon.ico
UninstallDisplayIcon={app}\icons\favicon.ico
OutputDir=output
OutputBaseFilename=Adobe-Discord-RPC-Setup
Compression=lzma2/max
SolidCompression=yes
WizardStyle=modern
DisableWelcomePage=no

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Files]
Source: "..\CSXS\*"; DestDir: "{app}\CSXS"; Flags: recursesubdirs createallsubdirs ignoreversion
Source: "..\client-dist\*"; DestDir: "{app}\client-dist"; Flags: recursesubdirs createallsubdirs ignoreversion
Source: "..\rpc_client-dist\*"; DestDir: "{app}\rpc_client-dist"; Flags: recursesubdirs createallsubdirs ignoreversion
Source: "..\host\*"; DestDir: "{app}\host"; Flags: recursesubdirs createallsubdirs ignoreversion
Source: "..\icons\*"; DestDir: "{app}\icons"; Flags: recursesubdirs createallsubdirs ignoreversion
Source: "..\libs\*"; DestDir: "{app}\libs"; Flags: recursesubdirs createallsubdirs ignoreversion
Source: "..\index.html"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\rpc.html"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\package.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\README.md"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\LICENSE"; DestDir: "{app}"; Flags: ignoreversion

[Registry]
; Enable Adobe PlayerDebugMode so unsigned CEP extensions load in Adobe CC apps
Root: HKCU; Subkey: "Software\Adobe\CSXS.9"; ValueType: string; ValueName: "PlayerDebugMode"; ValueData: "1"; Flags: createvalueifdoesntexist
Root: HKCU; Subkey: "Software\Adobe\CSXS.10"; ValueType: string; ValueName: "PlayerDebugMode"; ValueData: "1"; Flags: createvalueifdoesntexist
Root: HKCU; Subkey: "Software\Adobe\CSXS.11"; ValueType: string; ValueName: "PlayerDebugMode"; ValueData: "1"; Flags: createvalueifdoesntexist
Root: HKCU; Subkey: "Software\Adobe\CSXS.12"; ValueType: string; ValueName: "PlayerDebugMode"; ValueData: "1"; Flags: createvalueifdoesntexist
Root: HKCU; Subkey: "Software\Adobe\CSXS.13"; ValueType: string; ValueName: "PlayerDebugMode"; ValueData: "1"; Flags: createvalueifdoesntexist
Root: HKCU; Subkey: "Software\Adobe\CSXS.14"; ValueType: string; ValueName: "PlayerDebugMode"; ValueData: "1"; Flags: createvalueifdoesntexist
Root: HKCU; Subkey: "Software\Adobe\CSXS.15"; ValueType: string; ValueName: "PlayerDebugMode"; ValueData: "1"; Flags: createvalueifdoesntexist
Root: HKCU; Subkey: "Software\Adobe\CSXS.16"; ValueType: string; ValueName: "PlayerDebugMode"; ValueData: "1"; Flags: createvalueifdoesntexist
Root: HKCU; Subkey: "Software\Adobe\CSXS.17"; ValueType: string; ValueName: "PlayerDebugMode"; ValueData: "1"; Flags: createvalueifdoesntexist

[Icons]
Name: "{userprograms}\Adobe Discord RPC\Uninstall Adobe Discord RPC"; Filename: "{uninstallexe}"
Name: "{userprograms}\Adobe Discord RPC\Open Extension Folder"; Filename: "{app}"
Name: "{userprograms}\Adobe Discord RPC\GitHub Repository"; Filename: "{#MyAppURL}"

[Messages]
FinishedHeadingLabel=Installation Complete!
FinishedLabel=Adobe Discord RPC ({#MyAppEdition}) has been installed to your Adobe extensions folder.%n%nPlayerDebugMode has been automatically configured in your Windows registry.%n%nPlease restart Adobe After Effects or Premiere Pro and open the extension from:%nWindow -> Extensions -> Discord RPC.
