import {
  AdditiveBlending,
  Color,
  DoubleSide,
  LinearFilter,
  Matrix4,
  MeshBasicMaterial,
  MeshDepthMaterial,
  NoBlending,
  RGBADepthPacking,
  RGBAFormat,
  ShaderLib,
  ShaderMaterial,
  UniformsUtils,
  Vector2,
  Vector3,
  WebGLRenderTarget,
} from 'three';
import { Pass } from 'three/examples/jsm/postprocessing/Pass';
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader';

export default class OutlinePass extends Pass {
  constructor(resolution, scene, camera, selectedObjects = []) {
    super();
    this.resolution =
      resolution !== undefined ? new Vector2(resolution.x, resolution.y) : new Vector2(256, 256);
    this.scene = scene;
    this.camera = camera;
    this.selectedObjects = selectedObjects;
    this.hiddenEdgeColor = new Color(0.05, 0, 0.1);
    this.visibleEdgeColor = new Color(0.1, 0, 0.3);
    this.edgeGlow = 0.1;
    this.edgeThickness = 3;
    this.edgeStrength = 10;
    this.downSampleRatio = 2;
    this.blurDirectionX = new Vector2(1.0, 0.0);
    this.blurDirectionY = new Vector2(0.0, 1.0);
    const pars = {
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      format: RGBAFormat,
    };
    const resx = Math.round(this.resolution.x / this.downSampleRatio);
    const resy = Math.round(this.resolution.y / this.downSampleRatio);
    this.maskBufferMaterial = new MeshBasicMaterial({ color: 0xffffff });
    this.maskBufferMaterial.side = DoubleSide;
    this.renderTargetMaskBuffer = new WebGLRenderTarget(this.resolution.x, this.resolution.y, pars);
    this.renderTargetMaskBuffer.texture.name = 'OutlinePass.mask';
    this.renderTargetMaskBuffer.texture.generateMipmaps = false;
    this.depthMaterial = new MeshDepthMaterial();
    this.depthMaterial.side = DoubleSide;
    this.depthMaterial.depthPacking = RGBADepthPacking;
    this.depthMaterial.blending = NoBlending;
    this.prepareMaskMaterial = this.getPrepareMaskMaterial();
    this.prepareMaskMaterial.side = DoubleSide;
    const cameraType = this.camera.isPerspectiveCamera ? 'perspective' : 'orthographic';
    this.prepareMaskMaterial.fragmentShader = this.prepareMaskMaterial.fragmentShader.replace(
      /DEPTH_TO_VIEW_Z/g,
      cameraType + 'DepthToViewZ',
    );
    this.renderTargetDepthBuffer = new WebGLRenderTarget(
      this.resolution.x,
      this.resolution.y,
      pars,
    );
    this.renderTargetDepthBuffer.texture.name = 'OutlinePass.depth';
    this.renderTargetDepthBuffer.texture.generateMipmaps = false;
    this.renderTargetMaskDownSampleBuffer = new WebGLRenderTarget(resx, resy, pars);
    this.renderTargetMaskDownSampleBuffer.texture.name = 'OutlinePass.depthDownSample';
    this.renderTargetMaskDownSampleBuffer.texture.generateMipmaps = false;
    this.renderTargetBlurBuffer1 = new WebGLRenderTarget(resx, resy, pars);
    this.renderTargetBlurBuffer1.texture.name = 'OutlinePass.blur1';
    this.renderTargetBlurBuffer1.texture.generateMipmaps = false;
    this.renderTargetBlurBuffer2 = new WebGLRenderTarget(
      Math.round(resx / 2),
      Math.round(resy / 2),
      pars,
    );
    this.renderTargetBlurBuffer2.texture.name = 'OutlinePass.blur2';
    this.renderTargetBlurBuffer2.texture.generateMipmaps = false;
    this.edgeDetectionMaterial = this.getEdgeDetectionMaterial();
    this.renderTargetEdgeBuffer1 = new WebGLRenderTarget(resx, resy, pars);
    this.renderTargetEdgeBuffer1.texture.name = 'OutlinePass.edge1';
    this.renderTargetEdgeBuffer1.texture.generateMipmaps = false;
    this.renderTargetEdgeBuffer2 = new WebGLRenderTarget(
      Math.round(resx / 2),
      Math.round(resy / 2),
      pars,
    );
    this.renderTargetEdgeBuffer2.texture.name = 'OutlinePass.edge2';
    this.renderTargetEdgeBuffer2.texture.generateMipmaps = false;
    const MAX_EDGE_THICKNESS = 4;
    const MAX_EDGE_GLOW = 4;
    this.separableBlurMaterial1 = this.getSeperableBlurMaterial(MAX_EDGE_THICKNESS);
    this.separableBlurMaterial1.uniforms['texSize'].value = new Vector2(resx, resy);
    this.separableBlurMaterial1.uniforms['kernelRadius'].value = 1;
    this.separableBlurMaterial2 = this.getSeperableBlurMaterial(MAX_EDGE_GLOW);
    this.separableBlurMaterial2.uniforms['texSize'].value = new Vector2(
      Math.round(resx / 2),
      Math.round(resy / 2),
    );
    this.separableBlurMaterial2.uniforms['kernelRadius'].value = MAX_EDGE_GLOW;
    this.overlayMaterial = this.getOverlayMaterial();
    this.copyUniforms = UniformsUtils.clone(CopyShader.uniforms);
    this.copyUniforms['opacity'].value = 1.0;
    this.materialCopy = new ShaderMaterial({
      uniforms: this.copyUniforms,
      vertexShader: CopyShader.vertexShader,
      fragmentShader: CopyShader.fragmentShader,
      blending: NoBlending,
      depthTest: false,
      depthWrite: false,
      transparent: true,
    });
    this.enabled = true;
    this.needsSwap = false;
    this.oldClearColor = new Color();
    this.oldClearAlpha = 1;
    this.fsQuad = new Pass.FullScreenQuad(null);
    this.tempPulseColor1 = new Color();
    this.tempPulseColor2 = new Color();
    this.textureMatrix = new Matrix4();
  }

  dispose() {
    this.renderTargetMaskBuffer.dispose();
    this.renderTargetDepthBuffer.dispose();
    this.renderTargetMaskDownSampleBuffer.dispose();
    this.renderTargetBlurBuffer1.dispose();
    this.renderTargetBlurBuffer2.dispose();
    this.renderTargetEdgeBuffer1.dispose();
    this.renderTargetEdgeBuffer2.dispose();
  }

  setSize(width, height) {
    this.renderTargetMaskBuffer.setSize(width, height);
    let resx = Math.round(width / this.downSampleRatio);
    let resy = Math.round(height / this.downSampleRatio);
    this.renderTargetMaskDownSampleBuffer.setSize(resx, resy);
    this.renderTargetBlurBuffer1.setSize(resx, resy);
    this.renderTargetEdgeBuffer1.setSize(resx, resy);
    this.separableBlurMaterial1.uniforms['texSize'].value = new Vector2(resx, resy);
    resx = Math.round(resx / 2);
    resy = Math.round(resy / 2);
    this.renderTargetBlurBuffer2.setSize(resx, resy);
    this.renderTargetEdgeBuffer2.setSize(resx, resy);
    this.separableBlurMaterial2.uniforms['texSize'].value = new Vector2(resx, resy);
  }

  changeVisibilityOfSelectedObjects(bVisible) {
    this.selectedObjects.forEach(selectedObject => {
      selectedObject.traverse(object => {
        if (object.isMesh) {
          if (bVisible) {
            object.visible = object.userData.oldVisible;
            delete object.userData.oldVisible;
          } else {
            object.userData.oldVisible = object.visible;
            object.visible = bVisible;
          }
        }
      });
    });
  }

  changeVisibilityOfNonSelectedObjects(bVisible) {
    const selectedMeshes = [];
    this.selectedObjects.forEach(selectedObject => {
      selectedObject.traverse(object => {
        if (object.isMesh) {
          selectedMeshes.push(object);
        }
      });
    });
    const visibilityChangeCallBack = object => {
      if (object.isMesh || object.isLine || object.isSprite) {
        let bFound = false;
        selectedMeshes.some(selectedObject => {
          if (selectedObject.id === object.id) {
            bFound = true;
            return true;
          }
        });
        if (!bFound) {
          const visibility = object.visible;
          if (!bVisible || object.bVisible) object.visible = bVisible;
          object.bVisible = visibility;
        }
      }
    };
    this.scene.traverse(visibilityChangeCallBack);
  }

  updateTextureMatrix() {
    this.textureMatrix.set(
      0.5,
      0.0,
      0.0,
      0.5,
      0.0,
      0.5,
      0.0,
      0.5,
      0.0,
      0.0,
      0.5,
      0.5,
      0.0,
      0.0,
      0.0,
      1.0,
    );
    this.textureMatrix.multiply(this.camera.projectionMatrix);
    this.textureMatrix.multiply(this.camera.matrixWorldInverse);
  }

  render(renderer, writeBuffer, readBuffer, deltaTime, maskActive) {
    if (this.selectedObjects.length > 0) {
      this.oldClearColor.copy(renderer.getClearColor());
      this.oldClearAlpha = renderer.getClearAlpha();
      const oldAutoClear = renderer.autoClear;
      renderer.autoClear = false;
      if (maskActive) {
        renderer.state.buffers.stencil.setTest(false);
      }
      renderer.setClearColor(0xffffff, 1);
      this.changeVisibilityOfSelectedObjects(false);
      var currentBackground = this.scene.background;
      this.scene.background = null;
      this.scene.overrideMaterial = this.depthMaterial;
      renderer.setRenderTarget(this.renderTargetDepthBuffer);
      renderer.clear();
      renderer.render(this.scene, this.camera);
      this.changeVisibilityOfSelectedObjects(true);
      this.updateTextureMatrix();
      this.changeVisibilityOfNonSelectedObjects(false);
      this.scene.overrideMaterial = this.prepareMaskMaterial;
      this.prepareMaskMaterial.uniforms['cameraNearFar'].value = new Vector2(
        this.camera.near,
        this.camera.far,
      );
      this.prepareMaskMaterial.uniforms[
        'depthTexture'
      ].value = this.renderTargetDepthBuffer.texture;
      this.prepareMaskMaterial.uniforms['textureMatrix'].value = this.textureMatrix;
      renderer.setRenderTarget(this.renderTargetMaskBuffer);
      renderer.clear();
      renderer.render(this.scene, this.camera);
      this.scene.overrideMaterial = null;
      this.changeVisibilityOfNonSelectedObjects(true);
      this.scene.background = currentBackground;
      this.fsQuad.material = this.materialCopy;
      this.copyUniforms['tDiffuse'].value = this.renderTargetMaskBuffer.texture;
      renderer.setRenderTarget(this.renderTargetMaskDownSampleBuffer);
      renderer.clear();
      this.fsQuad.render(renderer);
      this.tempPulseColor1.copy(this.visibleEdgeColor);
      this.tempPulseColor2.copy(this.hiddenEdgeColor);
      this.fsQuad.material = this.edgeDetectionMaterial;
      this.edgeDetectionMaterial.uniforms[
        'maskTexture'
      ].value = this.renderTargetMaskDownSampleBuffer.texture;
      this.edgeDetectionMaterial.uniforms['texSize'].value = new Vector2(
        this.renderTargetMaskDownSampleBuffer.width,
        this.renderTargetMaskDownSampleBuffer.height,
      );
      this.edgeDetectionMaterial.uniforms['visibleEdgeColor'].value = this.tempPulseColor1;
      this.edgeDetectionMaterial.uniforms['hiddenEdgeColor'].value = this.tempPulseColor2;
      renderer.setRenderTarget(this.renderTargetEdgeBuffer1);
      renderer.clear();
      this.fsQuad.render(renderer);
      this.fsQuad.material = this.separableBlurMaterial1;
      this.separableBlurMaterial1.uniforms[
        'colorTexture'
      ].value = this.renderTargetEdgeBuffer1.texture;
      this.separableBlurMaterial1.uniforms['direction'].value = this.blurDirectionX;
      this.separableBlurMaterial1.uniforms['kernelRadius'].value = this.edgeThickness;
      renderer.setRenderTarget(this.renderTargetBlurBuffer1);
      renderer.clear();
      this.fsQuad.render(renderer);
      this.separableBlurMaterial1.uniforms[
        'colorTexture'
      ].value = this.renderTargetBlurBuffer1.texture;
      this.separableBlurMaterial1.uniforms['direction'].value = this.blurDirectionY;
      renderer.setRenderTarget(this.renderTargetEdgeBuffer1);
      renderer.clear();
      this.fsQuad.render(renderer);
      this.fsQuad.material = this.separableBlurMaterial2;
      this.separableBlurMaterial2.uniforms[
        'colorTexture'
      ].value = this.renderTargetEdgeBuffer1.texture;
      this.separableBlurMaterial2.uniforms['direction'].value = this.blurDirectionX;
      renderer.setRenderTarget(this.renderTargetBlurBuffer2);
      renderer.clear();
      this.fsQuad.render(renderer);
      this.separableBlurMaterial2.uniforms[
        'colorTexture'
      ].value = this.renderTargetBlurBuffer2.texture;
      this.separableBlurMaterial2.uniforms['direction'].value = this.blurDirectionY;
      renderer.setRenderTarget(this.renderTargetEdgeBuffer2);
      renderer.clear();
      this.fsQuad.render(renderer);
      this.fsQuad.material = this.overlayMaterial;
      this.overlayMaterial.uniforms['maskTexture'].value = this.renderTargetMaskBuffer.texture;
      this.overlayMaterial.uniforms['edgeTexture1'].value = this.renderTargetEdgeBuffer1.texture;
      this.overlayMaterial.uniforms['edgeTexture2'].value = this.renderTargetEdgeBuffer2.texture;
      this.overlayMaterial.uniforms['edgeStrength'].value = this.edgeStrength;
      this.overlayMaterial.uniforms['edgeGlow'].value = this.edgeGlow;
      if (maskActive) {
        renderer.state.buffers.stencil.setTest(true);
      }
      renderer.setRenderTarget(readBuffer);
      this.fsQuad.render(renderer);
      renderer.setClearColor(this.oldClearColor, this.oldClearAlpha);
      renderer.autoClear = oldAutoClear;
    }
    if (this.renderToScreen) {
      this.fsQuad.material = this.materialCopy;
      this.copyUniforms['tDiffuse'].value = readBuffer.texture;
      renderer.setRenderTarget(null);
      this.fsQuad.render(renderer);
    }
  }

  getPrepareMaskMaterial() {
    return new ShaderMaterial({
      skinning: true,
      uniforms: UniformsUtils.merge([
        ShaderLib.basic.uniforms,
        {
          depthTexture: { value: null },
          cameraNearFar: { value: new Vector2(0.5, 0.5) },
          textureMatrix: { value: new Matrix4() },
        },
      ]),
      fragmentShader: `
        #include <packing>
        varying vec4 vPosition;
        varying vec4 projTexCoord;
        uniform sampler2D depthTexture;
        uniform vec2 cameraNearFar;
        void main() {
  
          float depth = unpackRGBAToDepth(texture2DProj(depthTexture, projTexCoord));
          float viewZ = - DEPTH_TO_VIEW_Z(depth, cameraNearFar.x, cameraNearFar.y);
          float depthTest = (-vPosition.z > viewZ) ? 1.0 : 0.0;
          gl_FragColor = vec4(0.0, depthTest, 1.0, 1.0);
  
        }
        `,

      vertexShader: `
        varying vec4 projTexCoord;
        varying vec4 vPosition;
        uniform mat4 textureMatrix;
        #include <common>
        #include <uv_pars_vertex>
        #include <uv2_pars_vertex>
        #include <color_pars_vertex>
        #include <morphtarget_pars_vertex>
        #include <skinning_pars_vertex>
        void main() {
          #include <uv_vertex>
          #include <uv2_vertex>
          #include <color_vertex>
          #include <skinbase_vertex>
          #include <beginnormal_vertex>
          #include <morphnormal_vertex>
          #include <skinnormal_vertex>
          #include <defaultnormal_vertex>
          #include <begin_vertex>
          #include <morphtarget_vertex>
          #include <skinning_vertex>
          #include <project_vertex>
          vPosition = modelViewMatrix * vec4(transformed, 1.0);
          vec4 worldPosition = modelMatrix * vec4(transformed, 1.0);
          projTexCoord = textureMatrix * worldPosition;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
        }
      `,
    });
  }

  getEdgeDetectionMaterial() {
    return new ShaderMaterial({
      uniforms: {
        maskTexture: { value: null },
        texSize: { value: new Vector2(0.5, 0.5) },
        visibleEdgeColor: { value: new Vector3(1.0, 1.0, 1.0) },
        hiddenEdgeColor: { value: new Vector3(1.0, 1.0, 1.0) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,

      fragmentShader: `
        varying vec2 vUv;
        uniform sampler2D maskTexture;
        uniform vec2 texSize;
        uniform vec3 visibleEdgeColor;
        uniform vec3 hiddenEdgeColor;
        
        void main() {
          vec2 invSize = 1.0 / texSize;
          vec4 uvOffset = vec4(1.0, 0.0, 0.0, 1.0) * vec4(invSize, invSize);
          vec4 c1 = texture2D(maskTexture, vUv + uvOffset.xy);
          vec4 c2 = texture2D(maskTexture, vUv - uvOffset.xy);
          vec4 c3 = texture2D(maskTexture, vUv + uvOffset.yw);
          vec4 c4 = texture2D(maskTexture, vUv - uvOffset.yw);
          float diff1 = (c1.r - c2.r)*0.5;
          float diff2 = (c3.r - c4.r)*0.5;
          float d = length(vec2(diff1, diff2));
          float a1 = min(c1.g, c2.g);
          float a2 = min(c3.g, c4.g);
          // float visibilityFactor = max(a1, a2);
          float visibilityFactor = min(a1, a2);
          vec3 edgeColor = 1.0 - visibilityFactor > 0.001 ? visibleEdgeColor : hiddenEdgeColor;
          gl_FragColor = vec4(edgeColor, 1.0) * vec4(d);
        }
      `,
    });
  }

  getSeperableBlurMaterial(maxRadius) {
    return new ShaderMaterial({
      defines: {
        MAX_RADIUS: maxRadius,
      },
      uniforms: {
        colorTexture: { value: null },
        texSize: { value: new Vector2(0.5, 0.5) },
        direction: { value: new Vector2(0.5, 0.5) },
        kernelRadius: { value: 1.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        #include <common>
        varying vec2 vUv;
        uniform sampler2D colorTexture;
        uniform vec2 texSize;
        uniform vec2 direction;
        uniform float kernelRadius;
        
        float gaussianPdf(in float x, in float sigma) {
          return 0.39894 * exp(-0.5 * x * x/(sigma * sigma))/sigma;
        }
        void main() {
          vec2 invSize = 1.0 / texSize;
          float weightSum = gaussianPdf(0.0, kernelRadius);
          vec4 diffuseSum = texture2D(colorTexture, vUv) * weightSum;
          vec2 delta = direction * invSize * kernelRadius/float(MAX_RADIUS);
          vec2 uvOffset = delta;
          for(int i = 1; i <= MAX_RADIUS; i ++) {
            float w = gaussianPdf(uvOffset.x, kernelRadius);
            vec4 sample1 = texture2D(colorTexture, vUv + uvOffset);
            vec4 sample2 = texture2D(colorTexture, vUv - uvOffset);
            diffuseSum += ((sample1 + sample2) * w);
            weightSum += (2.0 * w);
            uvOffset += delta;
          }
          gl_FragColor = diffuseSum/weightSum;
        }
      `,
    });
  }

  getOverlayMaterial() {
    return new ShaderMaterial({
      uniforms: {
        maskTexture: { value: null },
        edgeTexture1: { value: null },
        edgeTexture2: { value: null },
        edgeStrength: { value: 1.0 },
        edgeGlow: { value: 1.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform sampler2D maskTexture;
        uniform sampler2D edgeTexture1;
        uniform sampler2D edgeTexture2;
        uniform float edgeStrength;
        uniform float edgeGlow;
        
        void main() {
          vec4 edgeValue1 = texture2D(edgeTexture1, vUv);
          vec4 edgeValue2 = texture2D(edgeTexture2, vUv);
          vec4 maskColor = texture2D(maskTexture, vUv);
          float visibilityFactor = 1.0 - maskColor.g > 0.0 ? 1.0 : 0.5;
          vec4 edgeValue = edgeValue1 + edgeValue2 * edgeGlow;
          vec4 finalColor = edgeStrength * maskColor.r * edgeValue;
          gl_FragColor = finalColor;
        }
      `,
      blending: AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      transparent: true,
    });
  }
}
