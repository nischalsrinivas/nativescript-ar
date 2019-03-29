"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var arcommongeometry_1 = require("./arcommongeometry");
var ARText = (function (_super) {
    __extends(ARText, _super);
    function ARText() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ARText.create = function (options) {
        var text = SCNText.textWithStringExtrusionDepth(options.text, options.depth || 0.0);
        return new ARText(options, SCNNode.nodeWithGeometry(text));
    };
    return ARText;
}(arcommongeometry_1.ARCommonGeometryNode));
exports.ARText = ARText;
