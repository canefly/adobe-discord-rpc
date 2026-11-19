function state(){
    try{
        var x;
        
        if (app.project.activeSequence) {
            x = app.project.activeSequence.name+" ("+ app.project.rootItem.children.numItems+ ")";
        } else {
            x = "No active sequence.";
        }

        return x
    }catch(e){
        return "";
    }
}

function details(){
    try{
        return app.project.name
    }catch(e){
        return "Untitled.prproj";
    }
}

function smallImageKey(){

}

function smallImageText(){

}

function largeImageText(){
    return "Adobe Premiere Pro";
}

function partySize(){

}

function partyMax(){

}

// ---- Fun-feature helpers (used by the presence engine) ----
function extra(){
    try{
        var s = app.project.activeSequence;
        if (!s) return "";
        var secs = Math.round(Number(s.end) / 254016000000);
        var mm = Math.floor(secs / 60);
        var ss = secs % 60;
        return s.videoTracks.numTracks + "V " + s.audioTracks.numTracks + "A \u2022 " + mm + ":" + (ss < 10 ? "0" : "") + ss + " long";
    }catch(e){
        return "";
    }
}

// Changes when the playhead moves or the sequence length changes.
function activitySig(){
    try{
        var s = app.project.activeSequence;
        if (!s) return "";
        return s.getPlayerPosition().ticks + ":" + s.end + ":" + app.project.rootItem.children.numItems;
    }catch(e){
        return "";
    }
}
