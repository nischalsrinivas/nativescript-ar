"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ar_common_1 = require("../../ar-common");
var ARPlane = (function () {
    function ARPlane() {
    }
    ARPlane.create = function (anchor, opacity, material) {
        var instance = new ARPlane();
        instance.ios = SCNNode.new();
        instance.anchor = anchor;
        var anchorstr = "" + anchor;
        var extentStart = anchorstr.indexOf("extent=(") + "extent=(".length;
        var extentStr = anchorstr.substring(extentStart, anchorstr.indexOf(")", extentStart));
        var extendParts = extentStr.split(" ");
        var planeHeight = 0.01;
        instance.planeGeometry = SCNBox.boxWithWidthHeightLengthChamferRadius(+extendParts[0], planeHeight, +extendParts[2], 0);
        var translationStart = anchorstr.indexOf("<translation=(") + "<translation=(".length;
        var translationStr = anchorstr.substring(translationStart, anchorstr.indexOf(")", translationStart));
        var translationParts = translationStr.split(" ");
        instance.position = new ar_common_1.ARPosition(+translationParts[0], +translationParts[1], +translationParts[2]);
        instance.setMaterial(material, opacity);
        var planeNode = SCNNode.nodeWithGeometry(instance.planeGeometry);
        planeNode.position = { x: 0, y: -planeHeight / 2, z: 0 };
        planeNode.physicsBody = SCNPhysicsBody.bodyWithTypeShape(2, SCNPhysicsShape.shapeWithGeometryOptions(instance.planeGeometry, null));
        ARPlane.setTextureScale(instance.planeGeometry);
        instance.ios.addChildNode(planeNode);
        instance.id = instance.anchor.identifier.UUIDString;
        return instance;
    };
    ARPlane.prototype.setMaterial = function (material, opacity) {
        var transparentMaterial = SCNMaterial.new();
        transparentMaterial.diffuse.contents = UIColor.colorWithWhiteAlpha(1.0, 0.0);
        var materialArray = NSMutableArray.alloc().initWithCapacity(6);
        materialArray.addObject(transparentMaterial);
        materialArray.addObject(transparentMaterial);
        materialArray.addObject(transparentMaterial);
        materialArray.addObject(transparentMaterial);
        if (opacity === 0 || material === null) {
            materialArray.addObject(transparentMaterial);
        }
        else {
            material.transparency = opacity;
            materialArray.addObject(material);
        }
        materialArray.addObject(transparentMaterial);
        this.planeGeometry.materials = materialArray;
    };
    ARPlane.prototype.update = function (anchor) {
        var anchorstr = "" + anchor;
        var extentStart = anchorstr.indexOf("extent=(") + "extent=(".length;
        var extentStr = anchorstr.substring(extentStart, anchorstr.indexOf(")", extentStart));
        var extendParts = extentStr.split(" ");
        this.planeGeometry.width = +extendParts[0];
        this.planeGeometry.length = +extendParts[2];
        var centerStart = anchorstr.indexOf("center=(") + "center=(".length;
        var centerStr = anchorstr.substring(centerStart, anchorstr.indexOf(")", centerStart));
        var centerParts = centerStr.split(" ");
        this.ios.position = { x: +centerParts[0], y: 0, z: +centerParts[2] };
        var childNode = this.ios.childNodes.firstObject;
        childNode.physicsBody = SCNPhysicsBody.bodyWithTypeShape(2, SCNPhysicsShape.shapeWithGeometryOptions(this.planeGeometry, null));
        ARPlane.setTextureScale(this.planeGeometry);
    };
    ARPlane.prototype.remove = function () {
        this.ios.removeFromParentNode();
    };
    ARPlane.setTextureScale = function (planeGeometry) {
        var width = planeGeometry.width;
        var height = planeGeometry.length;
        var material = planeGeometry.materials[4];
        var scaleFactor = 1;
        var m = new SCNMatrix4();
        m.m11 = width * scaleFactor;
        m.m22 = height * scaleFactor;
        m.m33 = 1;
        material.diffuse.contentsTransform = m;
        material.roughness.contentsTransform = m;
        material.metalness.contentsTransform = m;
        material.normal.contentsTransform = m;
    };
    return ARPlane;
}());
exports.ARPlane = ARPlane;
