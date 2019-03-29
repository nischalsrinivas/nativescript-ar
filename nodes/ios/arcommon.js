"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ar_common_1 = require("../../ar-common");
var ARCommonNode = (function () {
    function ARCommonNode(options, node) {
        this.onTapHandler = options.onTap;
        this.onLongPressHandler = options.onLongPress;
        this.draggingEnabled = options.draggingEnabled;
        this.rotatingEnabled = options.rotatingEnabled;
        node.position = this.position = options.position;
        if (options.rotation) {
            node.eulerAngles = {
                x: ARCommonNode.degToRadians(options.rotation.x),
                y: ARCommonNode.degToRadians(options.rotation.y),
                z: ARCommonNode.degToRadians(options.rotation.z)
            };
        }
        node.name = this.id = (JSON.stringify(options.position) + "_" + new Date().getTime());
        node.physicsBody = SCNPhysicsBody.bodyWithTypeShape(1, null);
        node.physicsBody.mass = options.mass || 0;
        node.physicsBody.categoryBitMask = 1;
        if (options.scale) {
            node.scale = (options.scale instanceof ar_common_1.ARScale ? options.scale : {
                x: options.scale,
                y: options.scale,
                z: options.scale
            });
        }
        this.ios = node;
    }
    ARCommonNode.prototype.moveBy = function (by) {
        this.ios.position = {
            x: this.ios.position.x + by.x,
            y: this.ios.position.y + by.y,
            z: this.ios.position.z + by.z
        };
    };
    ARCommonNode.prototype.rotateBy = function (by) {
        this.ios.eulerAngles = {
            x: this.ios.eulerAngles.x + ARCommonNode.degToRadians(by.x),
            y: this.ios.eulerAngles.y + ARCommonNode.degToRadians(by.y),
            z: this.ios.eulerAngles.z + ARCommonNode.degToRadians(by.z)
        };
    };
    ARCommonNode.prototype.onTap = function (touchPosition) {
        this.onTapHandler && this.onTapHandler({
            node: this,
            touchPosition: touchPosition
        });
    };
    ARCommonNode.prototype.onLongPress = function (touchPosition) {
        this.onLongPressHandler && this.onLongPressHandler({
            node: this,
            touchPosition: touchPosition
        });
    };
    ARCommonNode.prototype.onPan = function (touchPosition) {
        this.onPanHandler && this.onPanHandler({
            node: this,
            touchPosition: touchPosition
        });
    };
    ARCommonNode.prototype.allowDragging = function () {
        return this.draggingEnabled;
    };
    ARCommonNode.prototype.allowRotating = function () {
        return this.rotatingEnabled;
    };
    ARCommonNode.prototype.remove = function () {
        this.ios.removeFromParentNode();
    };
    ARCommonNode.degToRadians = function (degrees) {
        return degrees * (3.14159265359 / 180);
    };
    return ARCommonNode;
}());
exports.ARCommonNode = ARCommonNode;
