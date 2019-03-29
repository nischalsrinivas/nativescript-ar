"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var arcommongeometry_1 = require("./arcommongeometry");
var ARTube = (function (_super) {
    __extends(ARTube, _super);
    function ARTube() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ARTube.create = function (options) {
        var tube = SCNTube.tubeWithInnerRadiusOuterRadiusHeight(options.innerRadius, options.outerRadius, options.height);
        return new ARTube(options, SCNNode.nodeWithGeometry(tube));
    };
    return ARTube;
}(arcommongeometry_1.ARCommonGeometryNode));
exports.ARTube = ARTube;
