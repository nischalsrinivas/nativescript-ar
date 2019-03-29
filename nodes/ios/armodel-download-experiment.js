"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var arcommon_1 = require("./arcommon");
var http = require("tns-core-modules/http");
var ARModel = (function (_super) {
    __extends(ARModel, _super);
    function ARModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ARModel.create = function (options) {
        console.log(">> create ARModel");
        return new Promise(function (resolve, reject) {
            ARModel.download("https://github.com/EddyVerbruggen/nativescript-ar/raw/master/demo/app/App_Resources/iOS/Models.scnassets/Car.dae")
                .then(function (file) {
                var data = NSFileManager.defaultManager.contentsAtPath(file);
                var sceneSource = SCNSceneSource.sceneSourceWithDataOptions(data, null);
                var arr = sceneSource.identifiersOfEntriesWithClass(SCNMaterial.class());
                console.log(">> identifiers: " + arr.count);
                var modelScene = SCNScene.sceneWithURLOptionsError(NSURL.URLWithString(file), null);
                console.log(">> modelScene: " + modelScene);
                var nodeModel = options.childNodeName ? modelScene.rootNode.childNodeWithNameRecursively(options.childNodeName, true) : modelScene.rootNode;
                resolve(new ARModel(options, nodeModel));
            });
        });
    };
    ARModel.download = function (url) {
        return new Promise(function (resolve, reject) {
            http.getFile(url).then(function (file) {
                console.log(">>> downloaded to " + file.path);
                resolve(file.path);
            }, function (e) { return reject(e); });
        });
    };
    return ARModel;
}(arcommon_1.ARCommonNode));
exports.ARModel = ARModel;
