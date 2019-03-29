"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var view_1 = require("tns-core-modules/ui/core/view");
var content_view_1 = require("tns-core-modules/ui/content-view");
var view_base_1 = require("tns-core-modules/ui/core/view-base");
var ARDebugLevel;
(function (ARDebugLevel) {
    ARDebugLevel[ARDebugLevel["NONE"] = "NONE"] = "NONE";
    ARDebugLevel[ARDebugLevel["WORLD_ORIGIN"] = "WORLD_ORIGIN"] = "WORLD_ORIGIN";
    ARDebugLevel[ARDebugLevel["FEATURE_POINTS"] = "FEATURE_POINTS"] = "FEATURE_POINTS";
    ARDebugLevel[ARDebugLevel["PHYSICS_SHAPES"] = "PHYSICS_SHAPES"] = "PHYSICS_SHAPES";
})(ARDebugLevel = exports.ARDebugLevel || (exports.ARDebugLevel = {}));
var ARTrackingMode;
(function (ARTrackingMode) {
    ARTrackingMode[ARTrackingMode["WORLD"] = "WORLD"] = "WORLD";
    ARTrackingMode[ARTrackingMode["IMAGE"] = "IMAGE"] = "IMAGE";
    ARTrackingMode[ARTrackingMode["FACE"] = "FACE"] = "FACE";
})(ARTrackingMode = exports.ARTrackingMode || (exports.ARTrackingMode = {}));
var debugLevelProperty = new view_1.Property({
    name: "debugLevel",
    defaultValue: ARDebugLevel.NONE
});
var trackingModeProperty = new view_1.Property({
    name: "trackingMode",
    defaultValue: ARTrackingMode.WORLD
});
var planeMaterialProperty = new view_1.Property({
    name: "planeMaterial"
});
var trackingImagesBundleProperty = new view_1.Property({
    name: "trackingImagesBundle"
});
var planeOpacityProperty = new view_1.Property({
    name: "planeOpacity",
    defaultValue: 0.1
});
var detectPlanesProperty = new view_1.Property({
    name: "detectPlanes",
    defaultValue: false,
    valueConverter: view_base_1.booleanConverter
});
var showStatisticsProperty = new view_1.Property({
    name: "showStatistics",
    defaultValue: false,
    valueConverter: view_base_1.booleanConverter
});
var ARDimensions = (function () {
    function ARDimensions(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    return ARDimensions;
}());
exports.ARDimensions = ARDimensions;
var ARDimensions2D = (function () {
    function ARDimensions2D(x, y) {
        this.x = x;
        this.y = y;
    }
    return ARDimensions2D;
}());
exports.ARDimensions2D = ARDimensions2D;
var ARScale = (function (_super) {
    __extends(ARScale, _super);
    function ARScale() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ARScale;
}(ARDimensions));
exports.ARScale = ARScale;
var ARPosition = (function (_super) {
    __extends(ARPosition, _super);
    function ARPosition() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ARPosition;
}(ARDimensions));
exports.ARPosition = ARPosition;
var ARRotation = (function (_super) {
    __extends(ARRotation, _super);
    function ARRotation() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ARRotation;
}(ARDimensions));
exports.ARRotation = ARRotation;
var AR = (function (_super) {
    __extends(AR, _super);
    function AR() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AR.isSupported = function () {
        return false;
    };
    AR.isImageTrackingSupported = function () {
        return false;
    };
    AR.prototype[debugLevelProperty.setNative] = function (value) {
        if (value) {
            if (typeof value === "string") {
                this.setDebugLevel(ARDebugLevel[value]);
            }
            else {
                this.setDebugLevel(value);
            }
        }
    };
    AR.prototype[trackingModeProperty.setNative] = function (value) {
        this.trackingMode = typeof value === "string" ? ARTrackingMode[value] : value;
    };
    AR.prototype[planeMaterialProperty.setNative] = function (value) {
        this.planeMaterial = value;
    };
    AR.prototype[trackingImagesBundleProperty.setNative] = function (value) {
        this.trackingImagesBundle = value;
    };
    AR.prototype[detectPlanesProperty.setNative] = function (value) {
        this.detectPlanes = value;
    };
    AR.prototype[showStatisticsProperty.setNative] = function (value) {
        this.showStatistics = value;
    };
    AR.prototype[planeOpacityProperty.setNative] = function (value) {
        if (!isNaN(value)) {
            this.planeOpacity = +value;
        }
    };
    AR.arLoadedEvent = "arLoaded";
    AR.sceneTappedEvent = "sceneTapped";
    AR.planeDetectedEvent = "planeDetected";
    AR.planeTappedEvent = "planeTapped";
    AR.trackingImageDetectedEvent = "trackingImageDetected";
    AR.trackingFaceDetectedEvent = "trackingFaceDetected";
    return AR;
}(content_view_1.ContentView));
exports.AR = AR;
showStatisticsProperty.register(AR);
detectPlanesProperty.register(AR);
debugLevelProperty.register(AR);
trackingModeProperty.register(AR);
trackingImagesBundleProperty.register(AR);
planeMaterialProperty.register(AR);
planeOpacityProperty.register(AR);
