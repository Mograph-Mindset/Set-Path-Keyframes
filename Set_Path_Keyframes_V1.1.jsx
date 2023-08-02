/*
    Set_Path_Keyframes.jsx
    Open-source and free.
    
    Description:
    No more CTRL+F searching for "path" to add and remove your keyframes. Just hit a key.

    Special thanks to:
        James Ronan (https://creativecow.net/forums/thread/scripting-add-keyframe-to-all-path-shape/)
        Nik Ska (https://github.com/ae-scripting/scripting-snippets/blob/master/setKeysForPaths.jsx)
        Justin Taylor (https://hyperbrew.co/blog/after-effects-command-ids/)
        Dan Ebberts
        Zack Lovatt
        Lloyd Alvarez
        David Torno
        Nate Lovell

    By: Mograph Mindset & Nate Lovell
    Version 1.1
    March 2023

    1.0         Initial release.
    1.1         Added Select Keys at Time
*/

// Selected Layers
var myComp = app.project.activeItem;
var atTime = myComp.time;
var myLayers = myComp.selectedLayers;
var myLayer;

var allPathProps = [];
var allPathPropsWithKeys = [];

app.beginUndoGroup("Set Path Keyframes");

// ADD KEYS
// Loop through selected layers
for (var i = 0; i < myLayers.length; i++) {
    myLayer = myLayers[i];
    // Check if layer Shape Layer
    if (myLayer instanceof ShapeLayer) {
        // Find the contents
        var myContents = myLayer.property("ADBE Root Vectors Group");

        // Apply Function to Shapes contents
        setKeysForPaths(myContents);

        // Deselect each Shape Layer after processing
        // This deselects each key & property to avoid duplicates
        myLayer.selected = false;

        // SELECT KEYS
        // Loop through all Path Properties
        for (var j = 0; j < allPathProps.length; j++) {
            var myPaths = allPathProps[j];

            // Select Keys At Time
            var nKey = myPaths.nearestKeyIndex(atTime);
            myPaths.setSelectedAtKey(nKey, true);
        }
    }
    // End of if statement
}
// End of for loop.

// REMOVE KEYS
// If all layers & path properties HAVE KEYFRAMES at the current time
if (allPathProps.length == allPathPropsWithKeys.length) {
    // Loop through selected layers
    for (var i = 0; i < myLayers.length; i++) {
        myLayer = myLayers[i];
        // Check if layer Shape Layer
        if (myLayer instanceof ShapeLayer) {
            // Find the contents
            var myContents = myLayer.property("ADBE Root Vectors Group");
            // Remove All Keys
            removeAllPathKeys(myContents);
        }
        // End of if statement
    }
    // End of for loop.
    
}

app.endUndoGroup();

function setKeysForPaths(a) {
    // Loop through first set of properties
    for (var j = 1; j <= a.numProperties; j++) {
        // Loop through second set to find previous property group
        for (var k = 1; k <= a.property(j).numProperties; k++) {

            // Short-hand for each property
            var cycleProps = a.property(j).property(k);

            // Check it's a shape
            if (cycleProps == a.property(j).property("ADBE Vector Shape")) {

                // Add to our shape property collection
                allPathProps.push(cycleProps);

                // If property IS STATIC
                if (cycleProps.isTimeVarying == false) {
                    cycleProps.addKey(atTime); // add key

                //If property is ANIMATED
                } else {

                    // If property has KEYFRAMES
                    if (cycleProps.numKeys >= 1) {

                        // Read Keyframe at CTI
                        var keyAtTime = cycleProps.nearestKeyIndex(atTime);

                        // If property already HAS A KEYFRAME at the current time
                        if (cycleProps.keyTime(keyAtTime) == atTime) {
                            allPathPropsWithKeys.push(cycleProps);
                            continue; // Skip the key
                        } else {
                            // If property HAS NO KEYFRAME at the current time
                            cycleProps.addKey(atTime); // add key
                        }
                    }

                    // If property has an EXPRESSION
                    if (cycleProps.expression.length >= 1) {
                        // Read the post-expression value at time
                        var postExpressionValue = cycleProps.valueAtTime(atTime, false);
                        cycleProps.setValueAtTime(atTime, postExpressionValue); // add key
                    }
                }
            }
            // End of Shape Check
            // Repeat function. Recursively
            setKeysForPaths(a.property(j).property(k));
        }
        // End of K loop 
    }
    // end of J loop
}
// End of Function.

function removeAllPathKeys(a) {
    for (var l = 1; l <= a.numProperties; l++) {
        for (var m = 1; m <= a.property(l).numProperties; m++) {
            var cycleProps = a.property(l).property(m);
            if (cycleProps == a.property(l).property("ADBE Vector Shape")) {
                // Define Keyframe at CTI
                var keyAtTime = cycleProps.nearestKeyIndex(atTime);
                cycleProps.removeKey(keyAtTime) // remove key
            }
            removeAllPathKeys(a.property(l).property(m));
        }
    }
}
