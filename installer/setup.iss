; Script generated for Inno Setup Compiler
; Adobe Discord RPC (Enhanced Edition by Cane)
; Repository: https://github.com/canefly/adobe-discord-rpc

#define MyAppName "Adobe Discord RPC"
#define MyAppEdition "Enhanced Edition by Cane"
#define MyAppVersion "1.1.0"
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
; "Just me" installs to %APPDATA%\Adobe\CEP\extensions; "all users" installs to
; C:\Program Files (x86)\Common Files\Adobe\CEP\extensions. Setup asks which at startup.
DefaultDirName={code:GetDefaultDirName}
DisableDirPage=no
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=dialog
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
Name: "{autoprograms}\Adobe Discord RPC\Uninstall Adobe Discord RPC"; Filename: "{uninstallexe}"
Name: "{autoprograms}\Adobe Discord RPC\Open Extension Folder"; Filename: "{app}"
Name: "{autoprograms}\Adobe Discord RPC\GitHub Repository"; Filename: "{#MyAppURL}"

[Messages]
FinishedHeadingLabel=Installation Complete!
FinishedLabel=Adobe Discord RPC ({#MyAppEdition}) has been installed to the Adobe CEP extensions folder you chose.%n%nPlayerDebugMode has been automatically configured in your Windows registry.%n%nPlease restart Adobe After Effects or Premiere Pro and open the extension from:%nWindow -> Extensions -> Discord RPC.


[Code]
const
  ExtFolder = 'Adobe\CEP\extensions\com.tee.discord-rpc';

function UserCopyPath(): String;
begin
  Result := ExpandConstant('{userappdata}') + '\' + ExtFolder;
end;

function GlobalCopyPath(): String;
begin
  Result := ExpandConstant('{commoncf32}') + '\' + ExtFolder;
end;

// "Install for all users" (admin) -> Program Files CEP folder, otherwise the user's AppData CEP folder.
function GetDefaultDirName(Param: String): String;
begin
  if IsAdminInstallMode then
    Result := GlobalCopyPath()
  else
    Result := UserCopyPath();
end;

// Adobe apps load extensions from BOTH folders. A stale copy in the other one can
// shadow this install, which is why presence sometimes "doesn't work" for people.
function NextButtonClick(CurPageID: Integer): Boolean;
var
  OtherPath, OtherLabel: String;
begin
  Result := True;
  if CurPageID = wpSelectDir then
  begin
    if IsAdminInstallMode then
    begin
      OtherPath := UserCopyPath();
      OtherLabel := 'your user profile';
    end
    else
    begin
      OtherPath := GlobalCopyPath();
      OtherLabel := 'Program Files (all users)';
    end;

    if FileExists(OtherPath + '\CSXS\manifest.xml') and
       (CompareText(RemoveBackslashUnlessRoot(WizardDirValue), OtherPath) <> 0) then
    begin
      MsgBox('Another copy of Adobe Discord RPC already exists in ' + OtherLabel + ':' + #13#10 + #13#10 +
             OtherPath + #13#10 + #13#10 +
             'Adobe apps can load either location. If your status looks stuck or outdated after installing, ' +
             'update or delete that copy too, or run this installer again and pick the other install mode.',
             mbInformation, MB_OK);
    end;
  end;
end;
