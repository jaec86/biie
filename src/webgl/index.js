import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import Stage3D from './Stage3D';

export function loadGLTF(modelName) {
  const loader = new GLTFLoader().setPath(process.env.BASE_URL + 'models/');
  return new Promise(accept => {
    loader.load(
      modelName,
      gltf => {
        accept(gltf);
      },
      xhr => {
        console.log(xhr);
      },
    );
  });
}

export function start(gltf) {
  const container = document.querySelector('#container');
  new Stage3D(container, gltf);
  listenToParentFrame();
  handleResize();
  window.addEventListener('resize', handleResize);
}

function listenToParentFrame() {
  try {
    window.parent.postMessage({ 'event-type': 'iframe-content-play' }, document.location.origin);
  } catch (e) {
    console.log(e);
  }
}

const handleResize = () => {
  const container = document.querySelector('#container');
  const { width, height } = container.getBoundingClientRect();
  try {
    window.parent.postMessage(
      {
        'event-type': 'iframe-content-resize',
        width,
        height,
      },
      document.location.origin,
    );
  } catch (e) {
    console.log(e);
  }
};
