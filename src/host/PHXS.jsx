function state(){
    try{
        return app.activeDocument.activeLayer.name;
    }catch(err){
        switch(err.description){
            case "No such element":
                return "Idling";

            default:
                return "";
        }
    }
}

function details(){
    try{
        return app.activeDocument.name

    }catch(err){
        switch(err.description){
            case "No such element":
                return "No file."
            break;

            default:
                return "";
        }
    }
}

function smallImageKey(){
    try{
        return app.currentTool.toString().toLowerCase();
    }catch(e){
        return "";
    }
}

function smallImageText(){
    try{
        if(state === "") return "";
        return "Editing " + state();
    }catch(e){
        return "";
    }
}

function largeImageText(){
    return "Adobe Photoshop";
}

function partySize(){
    try{
        // due to performance related stuff because javascript sucks
        if(app.activeDocument.layerSets.length > 20) return 0;
        if(app.activeDocument.activeLayer.itemIndex > app.activeDocument.layers.length) return 0;
        if(app.activeDocument.layers.length > 100) return 0;

        party_size = app.activeDocument.activeLayer.itemIndex;

        return party_size;

    }catch(e){
        return 0;
    }
}

function partyMax(){
    try{

        var all_layers = 0;

        if(app.activeDocument.layerSets.length > 20) return 0;
        if(app.activeDocument.activeLayer.itemIndex > app.activeDocument.layers.length) return 0;
        if(app.activeDocument.layers.length > 100) return 0;

            if(app.activeDocument.layerSets.length !== 0){
                for (var i=0, len=app.activeDocument.layerSets.length; i < len; i++) {
                    all_layers = all_layers + app.activeDocument.layerSets[i].layers.length;
                };
            }

        return app.activeDocument.layers.length + all_layers + app.activeDocument.layerSets.length;
    }catch(e){
        return 0;
    }
}

// ---- Fun-feature helpers (used by the presence engine) ----
function extra(){
    try{
        var d = app.activeDocument;
        var w = Math.round(d.width.as("px"));
        var h = Math.round(d.height.as("px"));
        return w + "\u00D7" + h + " px \u2022 " + d.layers.length + " layers";
    }catch(e){
        return "";
    }
}

// Changes whenever the user edits, so the engine can tell "working" from "AFK".
function activitySig(){
    try{
        var d = app.activeDocument;
        return d.historyStates.length + ":" + d.activeHistoryState.name;
    }catch(e){
        return "";
    }
}
