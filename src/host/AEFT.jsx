// After Effects Host Script for Discord Rich Presence

var AEItems;
var renderItemLock;

function state(){
    try {
        if (!app.project) {
            return "No project opened.";
        }

        if (app.project.renderQueue && app.project.renderQueue.rendering) {
            return "Rendering";
        }

        // Active viewer or active item check
        if (app.project.activeItem && (app.project.activeItem instanceof CompItem)) {
            var layerCount = app.project.activeItem.layers ? app.project.activeItem.layers.length : 0;
            return app.project.activeItem.name + " (" + layerCount + ")";
        }

        if (app.project.activeItem) {
            return app.project.activeItem.name;
        }

        return "No active composition.";
    } catch(e) {
        return "No composition.";
    }
}

function details(){
    try {
        if (!app.project) {
            return "No Project";
        }

        if (app.project.file) {
            if (app.project.file.displayName) {
                return app.project.file.displayName;
            }
            if (app.project.file.name) {
                return app.project.file.name;
            }
        }

        return "Untitled Project.aep";
    } catch(e) {
        return "Untitled Project.aep";
    }
}

function smallImageKey(){
    try {
        return app.project && app.project.toolType ? app.project.toolType : "";
    } catch(e) {
        return "";
    }
}

function smallImageText(){
    try {
        var det = details();
        return det ? "Editing " + det : "";
    } catch(e) {
        return "";
    }
}

function largeImageText(){
    return "Adobe After Effects";
}

function partySize(){
    try {
        if (app.project && app.project.renderQueue && app.project.renderQueue.rendering) {
            var info = 0;
            var total = AEItems || app.project.renderQueue.numItems;
            for (var index = 1; index <= total; index++) {
                var item = app.project.renderQueue.item(index);
                if (item && item.status === RQItemStatus.RENDERING) {
                    info = index;
                    break;
                }
            }
            return info;
        }
        return 0;
    } catch(e) {
        return 0;
    }
}

function partyMax(){
    try {
        if (app.project && app.project.renderQueue && app.project.renderQueue.rendering) {
            if (!renderItemLock) {
                AEItems = app.project.renderQueue.numItems;
                renderItemLock = app.project.renderQueue.numItems;
            }
            return renderItemLock;
        } else {
            renderItemLock = null;
            return 0;
        }
    } catch(e) {
        return 0;
    }
}