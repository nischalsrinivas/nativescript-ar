"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ARMaterialFactory = (function () {
    function ARMaterialFactory() {
    }
    ARMaterialFactory.getMaterial = function (material) {
        if (!material) {
            return null;
        }
        var mat = SCNMaterial.new();
        mat.lightingModelName = SCNLightingModelConstant;
        if (typeof material === "string") {
            ARMaterialFactory.applyMaterialByString(mat, material);
        }
        else if (material.constructor.name === "Color") {
            ARMaterialFactory.applyMaterialByColor(mat, material);
        }
        else {
            ARMaterialFactory.applyMaterialByARMaterial(mat, material);
        }
        return mat;
    };
    ARMaterialFactory.applyMaterialByColor = function (mat, material) {
        mat.diffuse.contents = material.ios;
        mat.specular.contents = material.ios;
    };
    ARMaterialFactory.applyMaterialByString = function (mat, material) {
        this.applyMaterialProperty(mat.diffuse, {
            contents: material,
            wrapMode: "Repeat"
        });
    };
    ARMaterialFactory.applyMaterialByARMaterial = function (mat, material) {
        this.applyMaterialProperty(mat.diffuse, material.diffuse);
        this.applyMaterialProperty(mat.roughness, material.roughness);
        this.applyMaterialProperty(mat.metalness, material.metalness);
        this.applyMaterialProperty(mat.normal, material.normal);
        this.applyMaterialProperty(mat.specular, material.specular);
        if (material.transparency !== undefined) {
            mat.transparency = material.transparency;
        }
    };
    ARMaterialFactory.applyMaterialProperty = function (scnMaterialProperty, materialProperty) {
        if (materialProperty === undefined) {
            return;
        }
        if (typeof materialProperty === "string") {
            console.log(">>> UIImage.imageNamed(materialProperty): " + UIImage.imageNamed(materialProperty));
            scnMaterialProperty.contents = UIImage.imageNamed(materialProperty);
            scnMaterialProperty.wrapS = 2;
            scnMaterialProperty.wrapT = 2;
        }
        else if (materialProperty.constructor.name === "Color") {
            scnMaterialProperty.contents = materialProperty.ios;
        }
        else {
            var prop = materialProperty;
            scnMaterialProperty.contents = UIImage.imageNamed(prop.contents);
            if (prop.wrapMode) {
                var wrapMode = ARMaterialFactory.getWrapMode(prop.wrapMode);
                scnMaterialProperty.wrapS = wrapMode;
                scnMaterialProperty.wrapT = wrapMode;
            }
            else {
                scnMaterialProperty.wrapS = 2;
                scnMaterialProperty.wrapT = 2;
            }
        }
    };
    ARMaterialFactory.getWrapMode = function (wrapMode) {
        if (wrapMode === "Mirror") {
            return 4;
        }
        else if (wrapMode === "Clamp") {
            return 1;
        }
        else if (wrapMode === "ClampToBorder") {
            return 3;
        }
        else {
            return 2;
        }
    };
    return ARMaterialFactory;
}());
exports.ARMaterialFactory = ARMaterialFactory;
