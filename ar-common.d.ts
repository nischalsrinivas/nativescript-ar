import { ContentView } from "tns-core-modules/ui/content-view";
import { EventData } from "tns-core-modules/data/observable";
import { Color } from "tns-core-modules/color";
import { ARBox } from "./nodes/ios/arbox";
import { ARModel } from "./nodes/ios/armodel";
export declare enum ARDebugLevel {
    NONE,
    WORLD_ORIGIN,
    FEATURE_POINTS,
    PHYSICS_SHAPES
}
export declare enum ARTrackingMode {
    WORLD,
    IMAGE,
    FACE
}
export interface ARNode {
    id: string;
    position: ARPosition;
    scale?: number | ARScale;
    rotation?: ARRotation;
    ios?: any;
    android?: any;
    remove(): void;
}
export interface ARNodeInteraction {
    touchPosition: ARDimensions2D;
    node: ARCommonNode;
}
export interface ARCommonNode extends ARNode {
    moveBy?(to: ARPosition): void;
    rotateBy?(by: ARRotation): void;
}
export interface ARAddOptions {
    position: ARPosition;
    scale?: number | ARScale;
    rotation?: ARRotation;
    mass?: number;
    onTap?: (interaction: ARNodeInteraction) => void;
    onLongPress?: (interaction: ARNodeInteraction) => void;
    draggingEnabled?: boolean;
    rotatingEnabled?: boolean;
}
export declare type ARMaterialWrapMode = "Clamp" | "Repeat" | "ClampToBorder" | "Mirror";
export interface ARMaterialProperty {
    contents: string;
    wrapMode?: ARMaterialWrapMode;
}
export interface ARMaterial {
    diffuse?: string | Color | ARMaterialProperty;
    roughness?: string | Color | ARMaterialProperty;
    metalness?: string | Color | ARMaterialProperty;
    normal?: string | Color | ARMaterialProperty;
    specular?: string | Color | ARMaterialProperty;
    transparency?: number;
}
export interface ARAddGeometryOptions extends ARAddOptions {
    materials?: Array<string | Color | ARMaterial>;
}
export interface ARAddModelOptions extends ARAddOptions {
    name: string;
    childNodeName?: string;
}
export interface ARAddBoxOptions extends ARAddGeometryOptions {
    dimensions: number | ARDimensions;
    chamferRadius?: number;
}
export interface ARAddSphereOptions extends ARAddGeometryOptions {
    radius: number;
    segmentCount?: number;
}
export interface ARAddTextOptions extends ARAddGeometryOptions {
    text: string;
    depth?: number;
}
export interface ARAddTubeOptions extends ARAddGeometryOptions {
    innerRadius: number;
    outerRadius: number;
    height: number;
    radialSegmentCount?: number;
    heightSegmentCount?: number;
}
export interface ARPlane extends ARNode {
}
export interface AREventData extends EventData {
    object: AR;
}
export interface ARLoadedEventData extends AREventData {
    ios?: any;
    android?: any;
}
export interface ARPlaneTappedEventData extends AREventData {
    position: ARPosition;
}
export interface ARSceneTappedEventData extends AREventData {
    position: ARPosition;
}
export interface ARPlaneDetectedEventData extends AREventData {
    plane: ARPlane;
}
export interface ARTrackingImageDetectedEventData extends AREventData {
    position: ARPosition;
    imageName: string;
    imageTrackingActions: ARImageTrackingActions;
}
export declare type ARTrackingFaceEventType = "FOUND" | "UPDATED" | "LOST";
export interface ARTrackingFaceEventData extends AREventData {
    eventType: ARTrackingFaceEventType;
    properties?: {
        eyeBlinkLeft: number;
        eyeBlinkRight: number;
        jawOpen: number;
        lookAtPoint: ARPosition;
        mouthFunnel: number;
        mouthSmileLeft: number;
        mouthSmileRight: number;
        tongueOut: number;
    };
}
export interface ARImageTrackingActions {
    playVideo(nativeUrl: any): void;
    addBox(options: ARAddBoxOptions): Promise<ARBox>;
    addModel(options: ARAddModelOptions): Promise<ARModel>;
}
export declare class ARDimensions {
    x: number;
    y: number;
    z: number;
    constructor(x: number, y: number, z: number);
}
export declare class ARDimensions2D {
    x: number;
    y: number;
    constructor(x: number, y: number);
}
export declare class ARScale extends ARDimensions {
}
export declare class ARPosition extends ARDimensions {
}
export declare class ARRotation extends ARDimensions {
}
export declare abstract class AR extends ContentView {
    static arLoadedEvent: string;
    static sceneTappedEvent: string;
    static planeDetectedEvent: string;
    static planeTappedEvent: string;
    static trackingImageDetectedEvent: string;
    static trackingFaceDetectedEvent: string;
    planeMaterial: string;
    planeOpacity: number;
    detectPlanes: boolean;
    showStatistics: boolean;
    trackingMode: ARTrackingMode;
    trackingImagesBundle: string;
    static isSupported(): boolean;
    static isImageTrackingSupported(): boolean;
    abstract reset(): void;
    abstract addModel(options: ARAddModelOptions): Promise<ARNode>;
    abstract addBox(options: ARAddBoxOptions): Promise<ARNode>;
    abstract addSphere(options: ARAddSphereOptions): Promise<ARNode>;
    abstract addText(options: ARAddTextOptions): Promise<ARNode>;
    abstract addTube(options: ARAddTubeOptions): Promise<ARNode>;
    abstract togglePlaneDetection(on: boolean): void;
    abstract toggleStatistics(on: boolean): void;
    abstract togglePlaneVisibility(on: boolean): void;
    abstract setDebugLevel(to: ARDebugLevel): void;
    abstract grabScreenshot(): any;
}
