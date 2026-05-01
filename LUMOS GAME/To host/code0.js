gdjs.TRAILERCode = {};
gdjs.TRAILERCode.localVariables = [];
gdjs.TRAILERCode.idToCallbackMap = new Map();
gdjs.TRAILERCode.GDNewVideoObjects1= [];
gdjs.TRAILERCode.GDNewVideoObjects2= [];


gdjs.TRAILERCode.eventsList0 = function(runtimeScene) {

{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.runtimeScene.sceneJustBegins(runtimeScene);
if (isConditionTrue_0) {
gdjs.copyArray(runtimeScene.getObjects("NewVideo"), gdjs.TRAILERCode.GDNewVideoObjects1);
{for(var i = 0, len = gdjs.TRAILERCode.GDNewVideoObjects1.length ;i < len;++i) {
    gdjs.TRAILERCode.GDNewVideoObjects1[i].play();
}
}
}

}


{

gdjs.copyArray(runtimeScene.getObjects("NewVideo"), gdjs.TRAILERCode.GDNewVideoObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.TRAILERCode.GDNewVideoObjects1.length;i<l;++i) {
    if ( gdjs.TRAILERCode.GDNewVideoObjects1[i].isEnded() ) {
        isConditionTrue_0 = true;
        gdjs.TRAILERCode.GDNewVideoObjects1[k] = gdjs.TRAILERCode.GDNewVideoObjects1[i];
        ++k;
    }
}
gdjs.TRAILERCode.GDNewVideoObjects1.length = k;
if (isConditionTrue_0) {
{gdjs.evtTools.runtimeScene.replaceScene(runtimeScene, "Level1", false);
}
}

}


{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.isKeyPressed(runtimeScene, "Space");
if (isConditionTrue_0) {
{gdjs.evtTools.runtimeScene.replaceScene(runtimeScene, "Level1", false);
}
}

}


};

gdjs.TRAILERCode.func = function(runtimeScene) {
runtimeScene.getOnceTriggers().startNewFrame();

gdjs.TRAILERCode.GDNewVideoObjects1.length = 0;
gdjs.TRAILERCode.GDNewVideoObjects2.length = 0;

gdjs.TRAILERCode.eventsList0(runtimeScene);
gdjs.TRAILERCode.GDNewVideoObjects1.length = 0;
gdjs.TRAILERCode.GDNewVideoObjects2.length = 0;


return;

}

gdjs['TRAILERCode'] = gdjs.TRAILERCode;
