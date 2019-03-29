"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils = require("tns-core-modules/utils/utils");
var application = require("tns-core-modules/application");
var ar_common_1 = require("./ar-common");
var CAMERA_PERMISSION_REQUEST_CODE = 853;
var ar;
var sv;
org.nativescript.tns.arlib.TNSSurfaceRenderer.setSurfaceEventCallbackListener(new org.nativescript.tns.arlib.TNSSurfaceRendererListener({
    callback: function (obj) {
        console.log(">>>>>>> from native: " + obj);
    }
}));
org.nativescript.tns.arlib.TNSSurfaceRenderer.setOnPlaneTappedListener(new org.nativescript.tns.arlib.TNSSurfaceRendererListener({
    callback: function (obj) {
        var eventData = {
            eventName: ar_common_1.AR.planeTappedEvent,
            object: ar,
            position: JSON.parse(obj)
        };
        ar.notify(eventData);
    }
}));
var AR = (function (_super) {
    __extends(AR, _super);
    function AR() {
        var _this = _super.call(this) || this;
        ar = _this;
        _this.renderer = new org.nativescript.tns.arlib.TNSSurfaceRenderer();
        return _this;
    }
    AR.isSupported = function () {
        return true;
    };
    AR.prototype.cameraPermissionGranted = function () {
        var hasPermission = android.os.Build.VERSION.SDK_INT < 23;
        if (!hasPermission) {
            hasPermission = android.content.pm.PackageManager.PERMISSION_GRANTED ===
                android.support.v4.content.ContextCompat.checkSelfPermission(utils.ad.getApplicationContext(), android.Manifest.permission.CAMERA);
        }
        return hasPermission;
    };
    AR.prototype.requestCameraPermission = function () {
        return new Promise(function (resolve, reject) {
            application.android.on(application.AndroidApplication.activityRequestPermissionsEvent, function (args) {
                for (var i = 0; i < args.permissions.length; i++) {
                    if (args.grantResults[i] === android.content.pm.PackageManager.PERMISSION_DENIED) {
                        reject("Permission denied");
                        return;
                    }
                }
                resolve();
            });
            android.support.v4.app.ActivityCompat.requestPermissions(application.android.foregroundActivity, [android.Manifest.permission.CAMERA], CAMERA_PERMISSION_REQUEST_CODE);
        });
    };
    AR.prototype.initAR = function () {
        var _this = this;
        application.android.on(application.AndroidApplication.activityResumedEvent, function (args) {
            if (_this.session && _this.surfaceView) {
                console.log(">> resuming");
                _this.session.resume();
                _this.surfaceView.onResume();
            }
        });
        application.android.on(application.AndroidApplication.activityPausedEvent, function (args) {
            if (_this.session && _this.surfaceView) {
                _this.surfaceView.onPause();
                _this.session.pause();
            }
        });
        try {
            var installStatus = com.google.ar.core.ArCoreApk.getInstance().requestInstall(application.android.foregroundActivity || application.android.startActivity, !AR.installRequested);
            if ("" + installStatus !== "INSTALLED") {
                AR.installRequested = true;
                return;
            }
        }
        catch (e) {
            console.log(">>> e: " + e);
        }
        this.surfaceView = sv = new android.opengl.GLSurfaceView(this._context);
        this.nativeView.addView(this.surfaceView);
        this.session = new com.google.ar.core.Session(application.android.foregroundActivity || application.android.startActivity);
        this.renderer.setContext(this._context);
        this.renderer.setSession(this.session);
        this.renderer.setSurfaceView(this.surfaceView);
        this.surfaceView.setPreserveEGLContextOnPause(true);
        this.surfaceView.setEGLContextClientVersion(2);
        this.surfaceView.setEGLConfigChooser(8, 8, 8, 8, 16, 0);
        this.surfaceView.setRenderer(this.renderer);
        this.surfaceView.setRenderMode(android.opengl.GLSurfaceView.RENDERMODE_CONTINUOUSLY);
        this.session.resume();
        var eventData = {
            eventName: ar_common_1.AR.arLoadedEvent,
            object: this,
            android: this.renderer
        };
        this.notify(eventData);
    };
    Object.defineProperty(AR.prototype, "android", {
        get: function () {
            return this.nativeView;
        },
        enumerable: true,
        configurable: true
    });
    AR.prototype.createNativeView = function () {
        var _this = this;
        var nativeView = _super.prototype.createNativeView.call(this);
        if (AR.isSupported()) {
            setTimeout(function () {
                if (_this.cameraPermissionGranted()) {
                    _this.initAR();
                }
                else {
                    _this.requestCameraPermission().then(function () {
                        _this.initAR();
                    });
                }
            }, 0);
        }
        return nativeView;
    };
    AR.prototype.initNativeView = function () {
        console.log(">> initNativeView");
        _super.prototype.initNativeView.call(this);
    };
    AR.prototype.togglePlaneVisibility = function (on) {
        console.log(">> togglePlaneVisibility: " + on);
        this.renderer.setDrawPlanes(on);
    };
    AR.prototype.togglePlaneDetection = function (on) {
        console.log(">> togglePlaneDetection: " + on);
        this.togglePlaneVisibility(on);
    };
    AR.prototype.toggleStatistics = function (on) {
        console.log("Method not implemented: toggleStatistics");
    };
    AR.prototype.setDebugLevel = function (to) {
        var drawPlanesAndPointClound = to === ar_common_1.ARDebugLevel.FEATURE_POINTS || to === ar_common_1.ARDebugLevel.PHYSICS_SHAPES;
        console.log(">> drawPlanesAndPointClound: " + drawPlanesAndPointClound);
        this.renderer.setDrawPointCloud(drawPlanesAndPointClound);
        this.renderer.setDrawPlanes(drawPlanesAndPointClound);
    };
    AR.prototype.grabScreenshot = function () {
        console.log("Method not implemented: grabScreenshot");
        return null;
    };
    AR.prototype.reset = function () {
        console.log("Method not implemented: reset");
        return null;
    };
    AR.prototype.addModel = function (options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.renderer.addModel();
            resolve(null);
        });
    };
    AR.prototype.addBox = function (options) {
        return new Promise(function (resolve, reject) {
            reject("Method not implemented: addBox");
        });
    };
    AR.prototype.addSphere = function (options) {
        return new Promise(function (resolve, reject) {
            reject("Method not implemented: addSphere");
        });
    };
    AR.prototype.addText = function (options) {
        return new Promise(function (resolve, reject) {
            reject("Method not implemented: addText");
        });
    };
    AR.prototype.addTube = function (options) {
        return new Promise(function (resolve, reject) {
            reject("Method not implemented: addTube");
        });
    };
    AR.installRequested = false;
    return AR;
}(ar_common_1.AR));
exports.AR = AR;
