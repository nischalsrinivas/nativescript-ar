"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ar_common_1 = require("./ar-common");
exports.ARDebugLevel = ar_common_1.ARDebugLevel;
exports.ARTrackingMode = ar_common_1.ARTrackingMode;
var armaterialfactory_1 = require("./nodes/ios/armaterialfactory");
var arbox_1 = require("./nodes/ios/arbox");
var arplane_1 = require("./nodes/ios/arplane");
var armodel_1 = require("./nodes/ios/armodel");
var arsphere_1 = require("./nodes/ios/arsphere");
var artext_1 = require("./nodes/ios/artext");
var artube_1 = require("./nodes/ios/artube");
var ARState = {
    planes: new Map(),
    shapes: new Map(),
};
var addBox = function (options, parentNode) {
    return new Promise(function (resolve, reject) {
        var box = arbox_1.ARBox.create(options);
        ARState.shapes.set(box.id, box);
        parentNode.addChildNode(box.ios);
        resolve(box);
    });
};
var addModel = function (options, parentNode) {
    return new Promise(function (resolve, reject) {
        var model = armodel_1.ARModel.create(options);
        ARState.shapes.set(model.id, model);
        parentNode.addChildNode(model.ios);
        resolve(model);
    });
};
var AR = (function (_super) {
    __extends(AR, _super);
    function AR() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AR.isSupported = function () {
        try {
            return !!ARSCNView && NSProcessInfo.processInfo.environment.objectForKey("SIMULATOR_DEVICE_NAME") === null;
        }
        catch (ignore) {
            return false;
        }
    };
    AR.isImageTrackingSupported = function () {
        try {
            return !!ARImageTrackingConfiguration && ARImageTrackingConfiguration.isSupported;
        }
        catch (ignore) {
            return false;
        }
    };
    AR.isFaceTrackingSupported = function () {
        try {
            return !!ARFaceTrackingConfiguration && ARFaceTrackingConfiguration.isSupported;
        }
        catch (ignore) {
            return false;
        }
    };
    AR.prototype.setDebugLevel = function (to) {
        if (!this.sceneView) {
            return;
        }
        if (to === ar_common_1.ARDebugLevel.WORLD_ORIGIN) {
            this.sceneView.debugOptions = ARSCNDebugOptionShowWorldOrigin;
        }
        else if (to === ar_common_1.ARDebugLevel.FEATURE_POINTS) {
            this.sceneView.debugOptions = ARSCNDebugOptionShowFeaturePoints;
        }
        else if (to === ar_common_1.ARDebugLevel.PHYSICS_SHAPES) {
            this.sceneView.debugOptions = 1;
        }
        else {
            this.sceneView.debugOptions = 0;
        }
    };
    AR.prototype.grabScreenshot = function () {
        return this.sceneView ? this.sceneView.snapshot() : null;
    };
    AR.prototype.toggleStatistics = function (on) {
        if (!this.sceneView) {
            return;
        }
        this.sceneView.showsStatistics = on;
    };
    AR.prototype.togglePlaneDetection = function (on) {
        if (!this.sceneView) {
            return;
        }
        this.configuration.planeDetection = on ? 1 : 0;
        this.sceneView.session.runWithConfiguration(this.configuration);
    };
    AR.prototype.togglePlaneVisibility = function (on) {
        var _this = this;
        var material = armaterialfactory_1.ARMaterialFactory.getMaterial(this.planeMaterial);
        ARState.planes.forEach(function (plane) {
            plane.setMaterial(material, on ? _this.planeOpacity : 0);
        });
    };
    AR.prototype.initAR = function () {
        var _this = this;
        if (!AR.isSupported()) {
            console.log("############### AR is not supported on this device.");
            return;
        }
        if (this.trackingMode === ar_common_1.ARTrackingMode.IMAGE) {
            if (!AR.isImageTrackingSupported()) {
                console.log("############### Image tracking is not supported on this device. It's probably not running iOS 12+.");
                return;
            }
            var imageTrackingConfig = ARImageTrackingConfiguration.new();
            if (this.trackingImagesBundle) {
                var trackingImages = ARReferenceImage.referenceImagesInGroupNamedBundle(this.trackingImagesBundle, null);
                if (!trackingImages) {
                    console.log("Could not load images from bundle!");
                    return;
                }
                imageTrackingConfig.trackingImages = trackingImages;
                imageTrackingConfig.maximumNumberOfTrackedImages = Math.min(trackingImages.count, 10);
            }
            this.configuration = imageTrackingConfig;
        }
        else if (this.trackingMode === ar_common_1.ARTrackingMode.FACE) {
            if (!AR.isFaceTrackingSupported()) {
                console.log("############### Face tracking is not supported on this device. It's probably not running iOS 12+.");
                return;
            }
            this.configuration = ARFaceTrackingConfiguration.new();
        }
        else {
            var worldTrackingConfig = ARWorldTrackingConfiguration.new();
            worldTrackingConfig.detectionImages = ARReferenceImage.referenceImagesInGroupNamedBundle("AR Resources", null);
            this.configuration = worldTrackingConfig;
        }
        this.configuration.lightEstimationEnabled = true;
        this.sceneView = ARSCNView.new();
        this.sceneView.delegate = this.delegate = ARSCNViewDelegateImpl.createWithOwnerResultCallbackAndOptions(new WeakRef(this), function (data) {
        }, {});
        this.toggleStatistics(this.showStatistics);
        this.togglePlaneDetection(this.detectPlanes);
        this.sceneView.autoenablesDefaultLighting = true;
        this.sceneView.automaticallyUpdatesLighting = true;
        this.sceneView.scene.rootNode.name = "root";
        var scene = SCNScene.new();
        this.sceneView.scene = scene;
        this.addBottomPlane(scene);
        this.sceneTapHandler = SceneTapHandlerImpl.initWithOwner(new WeakRef(this));
        var tapGestureRecognizer = UITapGestureRecognizer.alloc().initWithTargetAction(this.sceneTapHandler, "tap");
        tapGestureRecognizer.numberOfTapsRequired = 1;
        this.sceneView.addGestureRecognizer(tapGestureRecognizer);
        this.sceneLongPressHandler = SceneLongPressHandlerImpl.initWithOwner(new WeakRef(this));
        var longPressGestureRecognizer = UILongPressGestureRecognizer.alloc().initWithTargetAction(this.sceneLongPressHandler, "longpress");
        longPressGestureRecognizer.minimumPressDuration = 0.5;
        this.sceneView.addGestureRecognizer(longPressGestureRecognizer);
        this.scenePanHandler = ScenePanHandlerImpl.initWithOwner(new WeakRef(this));
        var panGestureRecognizer = UIPanGestureRecognizer.alloc().initWithTargetAction(this.scenePanHandler, "pan");
        panGestureRecognizer.minimumNumberOfTouches = 1;
        this.sceneView.addGestureRecognizer(panGestureRecognizer);
        this.sceneRotationHandler = SceneRotationHandlerImpl.initWithOwner(new WeakRef(this));
        var rotationGestureRecognizer = UIRotationGestureRecognizer.alloc().initWithTargetAction(this.sceneRotationHandler, "rotate");
        this.sceneView.addGestureRecognizer(rotationGestureRecognizer);
        this.sceneView.antialiasingMode = 2;
        setTimeout(function () {
            _this.nativeView.addSubview(_this.sceneView);
            var eventData = {
                eventName: ar_common_1.AR.arLoadedEvent,
                object: _this,
                ios: _this.sceneView
            };
            _this.notify(eventData);
        });
    };
    AR.prototype.addBottomPlane = function (scene) {
        var bottomPlane = SCNBox.boxWithWidthHeightLengthChamferRadius(1000, 0.5, 1000, 0);
        var bottomMaterial = SCNMaterial.new();
        bottomMaterial.diffuse.contents = UIColor.colorWithWhiteAlpha(1.0, 0.0);
        var materialArray = NSMutableArray.alloc().initWithCapacity(6);
        materialArray.addObject(bottomMaterial);
        bottomPlane.materials = materialArray;
        var bottomNode = SCNNode.nodeWithGeometry(bottomPlane);
        bottomNode.position = new ar_common_1.ARPosition(0, -25, 0);
        bottomNode.physicsBody = SCNPhysicsBody.bodyWithTypeShape(2, null);
        bottomNode.physicsBody.categoryBitMask = 0;
        bottomNode.physicsBody.contactTestBitMask = 1;
        scene.rootNode.addChildNode(bottomNode);
        scene.physicsWorld.contactDelegate = this.physicsWorldContactDelegate = SCNPhysicsContactDelegateImpl.createWithOwner(new WeakRef(this));
    };
    AR.prototype.createNativeView = function () {
        var v = _super.prototype.createNativeView.call(this);
        this.initAR();
        return v;
    };
    AR.prototype.onLayout = function (left, top, right, bottom) {
        _super.prototype.onLayout.call(this, left, top, right, bottom);
        if (this.sceneView) {
            this.sceneView.layer.frame = this.ios.layer.bounds;
        }
    };
    AR.prototype.sceneLongPressed = function (recognizer) {
        if (recognizer.state !== 1) {
            return;
        }
        var tapPoint = recognizer.locationInView(this.sceneView);
        var hitTestResults = this.sceneView.hitTestOptions(tapPoint, {
            SCNHitTestBoundingBoxOnlyKey: true,
            SCNHitTestFirstFoundOnlyKey: true
        });
        if (hitTestResults.count === 0) {
            return;
        }
        var hitResult = hitTestResults.firstObject;
        var savedModel = ARState.shapes.get(hitResult.node.name) || ARState.shapes.get(hitResult.node.parentNode.name);
        if (savedModel) {
            savedModel.onLongPress({
                x: tapPoint.x,
                y: tapPoint.y
            });
        }
    };
    AR.prototype.scenePanned = function (recognizer) {
        var state = recognizer.state;
        if (state === 5 || state === 4) {
            return;
        }
        var position = recognizer.locationInView(this.sceneView);
        if (state === 1) {
            this.lastPositionForPanning = position;
            var hitTestResults = this.sceneView.hitTestOptions(position, {
                SCNHitTestBoundingBoxOnlyKey: true,
                SCNHitTestFirstFoundOnlyKey: true
            });
            if (hitTestResults.count === 0) {
                this.targetNodeForPanning = undefined;
                return;
            }
            var hitResult = hitTestResults.firstObject;
            var savedModel = ARState.shapes.get(hitResult.node.name);
            if (savedModel && savedModel.draggingEnabled && savedModel.ios) {
                this.targetNodeForPanning = savedModel.ios;
                savedModel.onPan({
                    x: position.x,
                    y: position.y
                });
            }
            else {
                this.targetNodeForPanning = undefined;
            }
        }
        else if (this.targetNodeForPanning) {
            if (state === 2) {
                var deltaX = (position.x - this.lastPositionForPanning.x) / 700;
                var deltaY = (position.y - this.lastPositionForPanning.y) / 700;
                this.targetNodeForPanning.localTranslateBy({ x: deltaX, y: -deltaY, z: 0 });
                this.lastPositionForPanning = position;
            }
            else if (state === 3) {
                this.targetNodeForPanning = undefined;
            }
        }
    };
    AR.prototype.sceneRotated = function (recognizer) {
        var state = recognizer.state;
        if (state === 5 || state === 4) {
            return;
        }
        var position = recognizer.locationInView(this.sceneView);
        if (state === 1) {
            var hitTestResults = this.sceneView.hitTestOptions(position, {
                SCNHitTestBoundingBoxOnlyKey: true,
                SCNHitTestFirstFoundOnlyKey: true
            });
            if (hitTestResults.count === 0) {
                this.targetNodeForRotating = undefined;
                return;
            }
            var hitResult = hitTestResults.firstObject;
            var savedModel = ARState.shapes.get(hitResult.node.name);
            if (savedModel && savedModel.rotatingEnabled && savedModel.ios) {
                this.targetNodeForRotating = savedModel.ios;
            }
            else {
                this.targetNodeForRotating = undefined;
            }
        }
        else if (this.targetNodeForRotating) {
            if (state === 2) {
                var previousAngles = this.targetNodeForRotating.eulerAngles;
                this.targetNodeForRotating.eulerAngles = {
                    x: previousAngles.x,
                    y: previousAngles.y - recognizer.rotation,
                    z: previousAngles.z
                };
                recognizer.rotation = 0;
            }
            else if (state === 3) {
                this.targetNodeForRotating = undefined;
            }
        }
    };
    AR.prototype.sceneTapped = function (recognizer) {
        var sceneView = recognizer.view;
        var tapPoint = recognizer.locationInView(sceneView);
        var hitTestResults = sceneView.hitTestOptions(tapPoint, null);
        if (hitTestResults.count === 0) {
            var eventData = {
                eventName: ar_common_1.AR.sceneTappedEvent,
                object: this,
                position: {
                    x: tapPoint.x,
                    y: tapPoint.y,
                    z: 0
                }
            };
            this.notify(eventData);
            return;
        }
        var hitResult = hitTestResults.firstObject;
        var node = hitResult.node;
        if (node !== undefined) {
            var savedModel = ARState.shapes.get(node.name) || ARState.shapes.get(node.parentNode.name);
            if (savedModel !== undefined) {
                savedModel.onTap({
                    x: tapPoint.x,
                    y: tapPoint.y
                });
                return;
            }
        }
        var planeTapResults = this.sceneView.hitTestTypes(tapPoint, 16);
        if (planeTapResults.count > 0) {
            var planeHitResult = planeTapResults.firstObject;
            var hitResultStr = "" + planeHitResult;
            var transformStart = hitResultStr.indexOf("worldTransform=<translation=(") + "worldTransform=<translation=(".length;
            var transformStr = hitResultStr.substring(transformStart, hitResultStr.indexOf(")", transformStart));
            var transformParts = transformStr.split(" ");
            var eventData = {
                eventName: ar_common_1.AR.planeTappedEvent,
                object: this,
                position: {
                    x: +transformParts[0],
                    y: +transformParts[1],
                    z: +transformParts[2]
                }
            };
            this.notify(eventData);
        }
    };
    AR.prototype.addModel = function (options) {
        return addModel(options, this.sceneView.scene.rootNode);
    };
    AR.prototype.addBox = function (options) {
        return addBox(options, this.sceneView.scene.rootNode);
    };
    AR.prototype.addSphere = function (options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var sphere = arsphere_1.ARSphere.create(options);
            ARState.shapes.set(sphere.id, sphere);
            _this.sceneView.scene.rootNode.addChildNode(sphere.ios);
            resolve(sphere);
        });
    };
    AR.prototype.addText = function (options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var text = artext_1.ARText.create(options);
            ARState.shapes.set(text.id, text);
            _this.sceneView.scene.rootNode.addChildNode(text.ios);
            resolve(text);
        });
    };
    AR.prototype.addTube = function (options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var tube = artube_1.ARTube.create(options);
            ARState.shapes.set(tube.id, tube);
            _this.sceneView.scene.rootNode.addChildNode(tube.ios);
            resolve(tube);
        });
    };
    AR.prototype.reset = function () {
        this.configuration.planeDetection = 1;
        this.sceneView.session.runWithConfigurationOptions(this.configuration, 1 | 2);
        ARState.planes.forEach(function (plane) { return plane.remove(); });
        ARState.planes.clear();
        ARState.shapes.forEach(function (node) { return node.remove(); });
        ARState.shapes.clear();
    };
    return AR;
}(ar_common_1.AR));
var SceneTapHandlerImpl = (function (_super) {
    __extends(SceneTapHandlerImpl, _super);
    function SceneTapHandlerImpl() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SceneTapHandlerImpl.initWithOwner = function (owner) {
        var handler = SceneTapHandlerImpl.new();
        handler._owner = owner;
        return handler;
    };
    SceneTapHandlerImpl.prototype.tap = function (args) {
        this._owner.get().sceneTapped(args);
    };
    SceneTapHandlerImpl.ObjCExposedMethods = {
        "tap": { returns: interop.types.void, params: [interop.types.id] }
    };
    return SceneTapHandlerImpl;
}(NSObject));
var SceneLongPressHandlerImpl = (function (_super) {
    __extends(SceneLongPressHandlerImpl, _super);
    function SceneLongPressHandlerImpl() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SceneLongPressHandlerImpl.initWithOwner = function (owner) {
        var handler = SceneLongPressHandlerImpl.new();
        handler._owner = owner;
        return handler;
    };
    SceneLongPressHandlerImpl.prototype.longpress = function (args) {
        this._owner.get().sceneLongPressed(args);
    };
    SceneLongPressHandlerImpl.ObjCExposedMethods = {
        "longpress": { returns: interop.types.void, params: [interop.types.id] }
    };
    return SceneLongPressHandlerImpl;
}(NSObject));
var ScenePanHandlerImpl = (function (_super) {
    __extends(ScenePanHandlerImpl, _super);
    function ScenePanHandlerImpl() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ScenePanHandlerImpl.initWithOwner = function (owner) {
        var handler = ScenePanHandlerImpl.new();
        handler._owner = owner;
        return handler;
    };
    ScenePanHandlerImpl.prototype.pan = function (args) {
        this._owner.get().scenePanned(args);
    };
    ScenePanHandlerImpl.ObjCExposedMethods = {
        "pan": { returns: interop.types.void, params: [interop.types.id] }
    };
    return ScenePanHandlerImpl;
}(NSObject));
var SceneRotationHandlerImpl = (function (_super) {
    __extends(SceneRotationHandlerImpl, _super);
    function SceneRotationHandlerImpl() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SceneRotationHandlerImpl.initWithOwner = function (owner) {
        var handler = SceneRotationHandlerImpl.new();
        handler._owner = owner;
        return handler;
    };
    SceneRotationHandlerImpl.prototype.rotate = function (args) {
        this._owner.get().sceneRotated(args);
    };
    SceneRotationHandlerImpl.ObjCExposedMethods = {
        "rotate": { returns: interop.types.void, params: [interop.types.id] }
    };
    return SceneRotationHandlerImpl;
}(NSObject));
var ARSCNViewDelegateImpl = (function (_super) {
    __extends(ARSCNViewDelegateImpl, _super);
    function ARSCNViewDelegateImpl() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.currentTrackingState = 2;
        _this.hasFace = false;
        return _this;
    }
    ARSCNViewDelegateImpl.new = function () {
        try {
            ARSCNViewDelegateImpl.ObjCProtocols.push(ARSCNViewDelegate);
        }
        catch (ignore) {
        }
        return _super.new.call(this);
    };
    ARSCNViewDelegateImpl.createWithOwnerResultCallbackAndOptions = function (owner, callback, options) {
        var delegate = ARSCNViewDelegateImpl.new();
        delegate.owner = owner;
        delegate.options = options;
        delegate.resultCallback = callback;
        return delegate;
    };
    ARSCNViewDelegateImpl.prototype.sessionDidFailWithError = function (session, error) {
        console.log(">>> sessionDidFailWithError: " + error);
    };
    ARSCNViewDelegateImpl.prototype.sessionWasInterrupted = function (session) {
        console.log(">>> sessionWasInterrupted: The tracking session has been interrupted. The session will be reset once the interruption has completed");
    };
    ARSCNViewDelegateImpl.prototype.sessionInterruptionEnded = function (session) {
        console.log(">>> sessionInterruptionEnded, calling reset");
        this.owner.get().reset();
    };
    ARSCNViewDelegateImpl.prototype.sessionCameraDidChangeTrackingState = function (session, camera) {
        if (this.currentTrackingState === camera.trackingState) {
            return;
        }
        this.currentTrackingState = camera.trackingState;
        var trackingState = null, limitedTrackingStateReason = null;
        if (camera.trackingState === 0) {
            trackingState = "Not available";
        }
        else if (camera.trackingState === 1) {
            trackingState = "Limited";
            var reason = camera.trackingStateReason;
            if (reason === 2) {
                limitedTrackingStateReason = "Excessive motion";
            }
            else if (reason === 3) {
                limitedTrackingStateReason = "Insufficient features";
            }
            else if (reason === 1) {
                limitedTrackingStateReason = "Initializing";
            }
            else if (reason === 0) {
                limitedTrackingStateReason = "None";
            }
        }
        else if (camera.trackingState === 2) {
            trackingState = "Normal";
        }
        if (trackingState !== null) {
            console.log("Tracking state changed to: " + trackingState);
            if (limitedTrackingStateReason !== null) {
                console.log("Limited tracking state reason: " + limitedTrackingStateReason);
            }
        }
    };
    ARSCNViewDelegateImpl.prototype.rendererDidAddNodeForAnchor = function (renderer, node, anchor) {
        if (anchor instanceof ARPlaneAnchor) {
            var owner = this.owner.get();
            var plane = arplane_1.ARPlane.create(anchor, owner.planeOpacity, armaterialfactory_1.ARMaterialFactory.getMaterial(owner.planeMaterial));
            ARState.planes.set(anchor.identifier.UUIDString, plane);
            node.addChildNode(plane.ios);
            var eventData = {
                eventName: ar_common_1.AR.planeDetectedEvent,
                object: owner,
                plane: plane
            };
            owner.notify(eventData);
        }
    };
    ARSCNViewDelegateImpl.prototype.rendererDidUpdateNodeForAnchor = function (renderer, node, anchor) {
        if (anchor instanceof ARPlaneAnchor) {
            var plane = ARState.planes.get(anchor.identifier.UUIDString);
            if (plane) {
                plane.update(anchor);
            }
            return;
        }
        var owner = this.owner.get();
        if (!(anchor instanceof ARFaceAnchor)) {
            if (this.hasFace) {
                this.hasFace = false;
                owner.notify({
                    eventName: ar_common_1.AR.trackingFaceDetectedEvent,
                    object: owner,
                    eventType: "LOST"
                });
            }
            return;
        }
        var faceAnchor = anchor;
        var eventType = "UPDATED";
        if (!this.hasFace) {
            this.hasFace = true;
            owner.reset();
            eventType = "FOUND";
        }
        var blendShapes = faceAnchor.blendShapes;
        owner.notify({
            eventName: ar_common_1.AR.trackingFaceDetectedEvent,
            object: owner,
            eventType: eventType,
            properties: {
                eyeBlinkLeft: blendShapes.valueForKey(ARBlendShapeLocationEyeBlinkLeft),
                eyeBlinkRight: blendShapes.valueForKey(ARBlendShapeLocationEyeBlinkRight),
                jawOpen: blendShapes.valueForKey(ARBlendShapeLocationJawOpen),
                lookAtPoint: {
                    x: faceAnchor.lookAtPoint[0],
                    y: faceAnchor.lookAtPoint[1],
                    z: faceAnchor.lookAtPoint[2]
                },
                mouthFunnel: blendShapes.valueForKey(ARBlendShapeLocationMouthFunnel),
                mouthSmileLeft: blendShapes.valueForKey(ARBlendShapeLocationMouthSmileLeft),
                mouthSmileRight: blendShapes.valueForKey(ARBlendShapeLocationMouthSmileRight),
                tongueOut: blendShapes.valueForKey(ARBlendShapeLocationTongueOut)
            }
        });
    };
    ARSCNViewDelegateImpl.prototype.rendererDidRemoveNodeForAnchor = function (renderer, node, anchor) {
        ARState.planes.delete(anchor.identifier.UUIDString);
    };
    ARSCNViewDelegateImpl.prototype.rendererNodeForAnchor = function (renderer, anchor) {
        var node = SCNNode.new();
        if (!(anchor instanceof ARImageAnchor)) {
            return node;
        }
        var imageAnchor = anchor;
        var plane = SCNPlane.planeWithWidthHeight(imageAnchor.referenceImage.physicalSize.width, imageAnchor.referenceImage.physicalSize.height);
        var planeNode = SCNNode.nodeWithGeometry(plane);
        planeNode.eulerAngles = {
            x: -3.14159265359 / 2,
            y: 0,
            z: 0
        };
        plane.firstMaterial.diffuse.contents = UIColor.colorWithWhiteAlpha(1, 0);
        var owner = this.owner.get();
        var eventData = {
            eventName: ar_common_1.AR.trackingImageDetectedEvent,
            object: owner,
            position: planeNode.position,
            imageName: imageAnchor.referenceImage.name,
            imageTrackingActions: new ARImageTrackingActionsImpl(plane, planeNode)
        };
        owner.notify(eventData);
        node.addChildNode(planeNode);
        return node;
    };
    ARSCNViewDelegateImpl.ObjCProtocols = [];
    return ARSCNViewDelegateImpl;
}(NSObject));
var ARImageTrackingActionsImpl = (function () {
    function ARImageTrackingActionsImpl(plane, planeNode) {
        this.plane = plane;
        this.planeNode = planeNode;
    }
    ARImageTrackingActionsImpl.prototype.playVideo = function (nativeUrl) {
        var videoPlayer = AVPlayer.playerWithURL(nativeUrl);
        this.plane.firstMaterial.diffuse.contents = videoPlayer;
        videoPlayer.play();
    };
    ARImageTrackingActionsImpl.prototype.addBox = function (options) {
        return addBox(options, this.planeNode);
    };
    ;
    ARImageTrackingActionsImpl.prototype.addModel = function (options) {
        return addModel(options, this.planeNode);
    };
    ;
    return ARImageTrackingActionsImpl;
}());
var ARSessionDelegateImpl = (function (_super) {
    __extends(ARSessionDelegateImpl, _super);
    function ARSessionDelegateImpl() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.currentTrackingState = 2;
        return _this;
    }
    ARSessionDelegateImpl.new = function () {
        try {
            ARSessionDelegateImpl.ObjCProtocols.push(ARSessionDelegate);
        }
        catch (ignore) {
        }
        return _super.new.call(this);
    };
    ARSessionDelegateImpl.createWithOwnerResultCallbackAndOptions = function (owner, callback, options) {
        var delegate = ARSessionDelegateImpl.new();
        delegate.owner = owner;
        delegate.options = options;
        delegate.resultCallback = callback;
        return delegate;
    };
    ARSessionDelegateImpl.prototype.sessionDidUpdateFrame = function (session, frame) {
        console.log("frame updated @ " + new Date().getTime());
    };
    ARSessionDelegateImpl.ObjCProtocols = [];
    return ARSessionDelegateImpl;
}(NSObject));
var SCNPhysicsContactDelegateImpl = (function (_super) {
    __extends(SCNPhysicsContactDelegateImpl, _super);
    function SCNPhysicsContactDelegateImpl() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SCNPhysicsContactDelegateImpl.new = function () {
        return _super.new.call(this);
    };
    SCNPhysicsContactDelegateImpl.createWithOwner = function (owner) {
        var delegate = SCNPhysicsContactDelegateImpl.new();
        delegate.owner = owner;
        return delegate;
    };
    SCNPhysicsContactDelegateImpl.prototype.physicsWorldDidBeginContact = function (world, contact) {
        var contactMask = contact.nodeA.physicsBody.categoryBitMask | contact.nodeB.physicsBody.categoryBitMask;
        if (contactMask === (0 | 1)) {
            if (contact.nodeA.physicsBody.categoryBitMask === 0) {
                contact.nodeB.removeFromParentNode();
            }
            else {
                contact.nodeA.removeFromParentNode();
            }
        }
    };
    SCNPhysicsContactDelegateImpl.prototype.physicsWorldDidEndContact = function (world, contact) {
    };
    SCNPhysicsContactDelegateImpl.prototype.physicsWorldDidUpdateContact = function (world, contact) {
    };
    SCNPhysicsContactDelegateImpl.ObjCProtocols = [SCNPhysicsContactDelegate];
    return SCNPhysicsContactDelegateImpl;
}(NSObject));
exports.AR = AR;
