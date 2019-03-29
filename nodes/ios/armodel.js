"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var arcommon_1 = require("./arcommon");
var ARModel = (function (_super) {
    __extends(ARModel, _super);
    function ARModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ARModel.create = function (options) {
        var modelScene = SCNScene.sceneNamed(options.name);
        var nodeModel = options.childNodeName ? modelScene.rootNode.childNodeWithNameRecursively(options.childNodeName, true) : modelScene.rootNode;
        return new ARModel(options, nodeModel);
    };
    return ARModel;
}(arcommon_1.ARCommonNode));
exports.ARModel = ARModel;
