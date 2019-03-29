"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var arcommon_1 = require("./arcommon");
var armaterialfactory_1 = require("./armaterialfactory");
var ARCommonGeometryNode = (function (_super) {
    __extends(ARCommonGeometryNode, _super);
    function ARCommonGeometryNode(options, node) {
        var _this = _super.call(this, options, node) || this;
        if (options.materials) {
            var materialArray_1 = NSMutableArray.alloc().initWithCapacity(options.materials.length);
            options.materials.map(function (material) { return materialArray_1.addObject(armaterialfactory_1.ARMaterialFactory.getMaterial(material)); });
            node.geometry.materials = materialArray_1;
        }
        return _this;
    }
    return ARCommonGeometryNode;
}(arcommon_1.ARCommonNode));
exports.ARCommonGeometryNode = ARCommonGeometryNode;
