"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var arcommongeometry_1 = require("./arcommongeometry");
var ARSphere = (function (_super) {
    __extends(ARSphere, _super);
    function ARSphere() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ARSphere.create = function (options) {
        var sphere = SCNSphere.sphereWithRadius(options.radius);
        if (options.segmentCount) {
            sphere.segmentCount = options.segmentCount;
        }
        return new ARSphere(options, SCNNode.nodeWithGeometry(sphere));
    };
    return ARSphere;
}(arcommongeometry_1.ARCommonGeometryNode));
exports.ARSphere = ARSphere;
