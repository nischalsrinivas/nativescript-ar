"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var arcommongeometry_1 = require("./arcommongeometry");
var ARBox = (function (_super) {
    __extends(ARBox, _super);
    function ARBox() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ARBox.create = function (options) {
        var dimensions = (typeof options.dimensions !== "number" ? options.dimensions : {
            x: options.dimensions,
            y: options.dimensions,
            z: options.dimensions
        });
        var box = SCNBox.boxWithWidthHeightLengthChamferRadius(dimensions.x, dimensions.y, dimensions.z, options.chamferRadius || 0.0);
        return new ARBox(options, SCNNode.nodeWithGeometry(box));
    };
    return ARBox;
}(arcommongeometry_1.ARCommonGeometryNode));
exports.ARBox = ARBox;
