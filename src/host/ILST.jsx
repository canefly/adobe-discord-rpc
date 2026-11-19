function state(){
    try{
        return app.activeDocument.activeLayer.name;
    }catch(e){
        return "";
    }
}

function details(){
    try{
        return app.activeDocument.name;
    }catch(e){
        return "No file.";
    }
}

function smallImageKey(){

}

function smallImageText(){

}

function largeImageText(){
    return "Adobe Illustrator";
}

function partySize(){
    try{
        return app.activeDocument.activeLayer.zOrderPosition;
    }catch(e){
        return 0;
    }
}

function partyMax(){
    try{
        return app.activeDocument.layers.length;
    }catch(e){
        return 0;
    }
}

// ---- Fun-feature helpers (used by the presence engine) ----
function extra(){
    try{
        var d = app.activeDocument;
        return Math.round(d.width) + "\u00D7" + Math.round(d.height) + " pt \u2022 " + d.layers.length + " layers";
    }catch(e){
        return "";
    }
}

// Changes whenever artwork or selection changes.
function activitySig(){
    try{
        var d = app.activeDocument;
        return d.pageItems.length + ":" + d.selection.length;
    }catch(e){
        return "";
    }
}
