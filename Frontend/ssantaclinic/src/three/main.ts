import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import Stats from 'three/examples/jsm/libs/stats.module.js'; // fps 표시하기위 한 모듈
//충돌 감지 를 위한 모듈들
import { Octree } from 'three/examples/jsm/math/Octree.js';
// import { Capsule } from 'three/examples/jsm/math/Capsule.js';
import { Mesh, Vector3 } from 'three';
import { gsap } from 'gsap';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
import { threadId } from 'worker_threads';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
import axios from 'axios';

// import { chdir } from 'process';

// type RGB = `rgb(${number}, ${number}, ${number})`;
// type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;
// type HEX = `#${string}`;

// type Color = RGB | RGBA | HEX;

// 오브젝트 3d 구성하는 요소들의 이름목록 표시
function dumpObject(obj: any, lines: string[], isLast = true, prefix = '') {
  const localPrefix = isLast ? '└─' : '├─';
  const word = `${prefix}${prefix ? localPrefix : ''}
  ${obj.name || '*no-name*'} [${obj.type}]`;
  lines.push(word);
  const newPrefix = prefix + (isLast ? '  ' : '│ ');
  const lastNdx: number = obj.children.length - 1;
  obj.children.forEach((child: Mesh, ndx: number) => {
    const isLast = ndx === lastNdx;
    dumpObject(child, lines, isLast, newPrefix);
  });
  return lines;
}

export class MainCanvas {
  _canvasContainer: any;
  _renderer: any;
  _scene: any;
  _worldOctree: any;
  _controls: any;
  _camera: any;
  _fps: any;
  _pressedKeys: any;
  _currentAnimationAction: any;
  _animationMap: any;
  _mixer: any;
  _capsule: any;
  _boxHelper: any;
  _model: any;
  _raycaster3: any;
  _raycaster2: any;
  _raycaster: any;
  _group: any;
  _isAlert: boolean;
  _inven: any;
  _scene2: any;

  _previousTime: any;
  _requestId: any;
  _isTreeModal: boolean;
  _tree: any;
  _items: any[];
  _position: any[];
  _showcase: any;
  _close: any;

  // 보여줘야하는 scene 이어떤건지 결정
  // 1이 기본, 2가 트리꾸미는 scene
  _scenenumber = 1;

  constructor(items: number[]) {
    //(9, 0, -4.5);  오른쪽, 위, 앞
    this._position = [
      [7, 0.5, -2],
      [7.5, 0.5, -2],
      [8, 0.5, -2],
      [8.5, 0.5, -2],
      [9, 0.5, -2],
      [7, 1, -2.5],
      [7.5, 1, -2.5],
      [8, 1, -2.5],
      [8.5, 1, -2.5],
      [9, 1, -2.5],
    ];
    this._items = items;
    this._isAlert = false;
    this._isTreeModal = false;
    // const divContainer = document.querySelector('#webgl-container');
    // this._divContainer = divContainer;
    console.log('constructor');
    const canvasContainer = document.querySelector('#main-canvas');
    this._canvasContainer = canvasContainer;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    canvasContainer?.appendChild(renderer.domElement);

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap;

    this._renderer = renderer;

    const scene = new THREE.Scene();
    this._scene = scene;

    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // this._setupOctree();
    this._setupLight();
    this._setupModel();
    this._setupCamera();

    const scene2 = scene;
    this._scene2 = scene2;

    this._setupControls();
    this._setupPicking();
    this._setupHover();

    window.onresize = this.resize.bind(this);
    this.resize();
  }

  render(time: number) {
    // console.log('!!!!');
    if (this._scenenumber === 1) {
      this._renderer.render(this._scene, this._camera);
      this.update(time);

      requestAnimationFrame(this.render.bind(this));
    } else {
      // inven scene
      this._renderer.render(this._scene2, this._camera);
      this.update2(time);

      requestAnimationFrame(this.render.bind(this));
    }
  }

  update2(time: number) {
    time *= 0.001;
    // console.log('updaete2');
    this._controls.update();
  }

  update(time: number) {
    time *= 0.001; // second unit

    this._controls.update();

    // 모델이 움직일때마다 모델박스 바껴야 하므로
    if (this._boxHelper) {
      this._boxHelper.update();
    }

    this._fps.update();

    this._previousTime = time;
  }

  _setupOctree(model: any) {
    this._worldOctree = new Octree();
    this._worldOctree.fromGraphNode(model);
    console.dir(this._worldOctree);
  }

  // scene 1을 위한 controls
  _setupControls() {
    if (this._scenenumber === 1) {
      this._controls = new OrbitControls(this._camera, this._canvasContainer);

      //orbicontrol shift 기능 없애기
      this._controls.enablePan = false;

      //마우스 회전 부드럽게
      this._controls.enableDamping = true;

      const stats = Stats();
      this._canvasContainer.appendChild(stats.dom);
      this._fps = stats;
      console.log('setoucontrols111');
    } else {
      // 트리 위주로 돌릴 수 있게
      // 드래그앤 드롭
      this._controls.enabled = false;
      console.log('setupcontrols222');
    }
  }

  _setupModel() {
    const inven: any[] = [];
    const group: any = [];
    const loader = new GLTFLoader();

    // 안눌러도 되는 맵 로드
    loader.load('main/santa.glb', (gltf) => {
      const model = gltf.scene;
      this._model = model;
      this._scene.add(model);
      // console.log('model:', model);

      model.traverse((child) => {
        // console.log(child);
        // model은 그림자 생성 true

        if (child instanceof THREE.PointLight) {
          child.intensity = 2;
        }
        if (child instanceof THREE.Group) {
          // console.log(child, child.name);
          group.push(child);
        }
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          // console.log('traverse child: ', child);
          if (child.parent) {
            child.name = child.parent.name;
          }
        }
      });

      this._setupOctree(model);
      // console.log(dumpObject(model, [], true, '').join('\n'));
      group.push(model);
    });

    loader.load('main/camera.glb', (gltf) => {
      const model: any = gltf.scene;

      console.log(model);
    });

    loader.load('main/showcase.glb', (gltf) => {
      const model: any = gltf.scene;
      model.traverse((child: any) => {
        if (child instanceof THREE.Group) {
          // console.log(child, child.name);
          // group.push(child);
        }
      });
      model.scale.set(20, 20, 20);
      model.position.set(9, 0, -4.5);
      model.children[0].children[0].children[0].children[0].children[0].material.color.set(
        0xff00ff,
      );

      // this._scene.add(model);
      // console.dir(model);
      console.log('showcase:', model);
      this._showcase = model;
      inven.push(model);
    });

    loader.load('main/lowtree.glb', (gltf) => {
      const tree: any[] = [];
      const model: any = gltf.scene;
      model.traverse((child: any) => {
        if (child instanceof THREE.Group) {
          // console.log(child, child.name);
          group.push(child);
        }
      });
      model.position.set(5, 0, -4.5);
      model.name = 'tree';
      model.traverse((child: THREE.Object3D) => {
        tree.push(child);
        child.name = 'tree';
      });
      this._scene.add(model);
      inven.push(model);
      console.log('treegltf:', model);
      this._tree = tree;
    });
    const items: any[] = [];
    // 유저가 갖고있는 아이템 정보(리스트)에 맞게 아이템 로드
    this._items.forEach((item, index) => {
      // console.log('item:', item);
      // console.log(index);
      loader.load(`main/${item}.glb`, (gltf) => {
        // console.log(index);
        const model = gltf.scene;
        // console.log(`${index}: `, model);
        model.scale.set(0.01, 0.01, 0.01);
        const position = this._position[`${index}`];
        model.position.set(position[0], position[1], position[2]);
        items.push(model);
        // this._scene.add(model);
      });
    });

    // loader.load('main/11.glb', (gltf) => {
    //   // console.log(index);
    //   const model = gltf.scene;
    //   // console.log(`${index}: `, model);
    //   model.scale.set(0.01, 0.01, 0.01);
    //   model.position.set(9, 5, -3);
    //   // model.position.set(position[0], position[1], position[2]);

    //   items.push(model);
    //   console.log('10번:', model);
    //   this._scene.add(model);
    // });

    // x button load
    loader.load('main/close.glb', (gltf) => {
      const model: any = gltf.scene;
      this._close = model;

      // model.position.set(10, 5, -4.5);
      model.position.set(1, 1, 1);
      model.name = 'close';
    });

    this._items = items;
    this._inven = inven;

    // scene에 있는 모든 3dobj 검사

    this._group = group;
    console.log(group);
  }

  _setupHover() {
    const raycaster3 = new THREE.Raycaster();
    this._canvasContainer.addEventListener(
      'mouseover',
      this._setTest.bind(this),
    );
    this._raycaster3 = raycaster3;
  }
  _setTest(event: any) {
    const width = this._canvasContainer.clientWidth;
    const height = this._canvasContainer.clientHeight;
    const xy = {
      x: (event.offsetX / width) * 2 - 1,
      y: -(event.offsetY / height) * 2 + 1,
    };
    this._raycaster3.setFromCamera(xy, this._camera);

    const cars: any = [];
    this._scene.traverse((obj3d: any) => {
      if (obj3d.name === 'car') {
        cars.push(obj3d);
      }
    });

    for (let i = 0; i < cars.length; i++) {
      const car = cars[i];
      const targets = this._raycaster3.intersectObject(car, true);
      if (targets.length > 0) {
        console.log('!!!');
        return;
      }
    }
  }

  _setupPicking() {
    // raycaster로 뭘 눌렀는지 판단해야함
    console.log('setpupicking');
    const raycaster = new THREE.Raycaster();

    this._canvasContainer.addEventListener('click', this._onClick.bind(this));
    this._raycaster = raycaster;
    this._canvasContainer.addEventListener(
      'wheel',
      this._setupRotate.bind(this),
    );
  }

  //클릭 함수
  _onClick(event: any) {
    function saveArrayBuffer(buffer: any) {
      const file = new Blob([buffer], { type: 'application/octet-stream' });
      console.log('saveArray:', file);
      return file;
    }

    let glbFile: Blob;

    const width = this._canvasContainer.clientWidth;
    const height = this._canvasContainer.clientHeight;
    // console.log('click event:', event);
    // console.log(event.offsetX);
    // console.log(event.offsetY);

    const xy = {
      x: (event.offsetX / width) * 2 - 1,
      y: -(event.offsetY / height) * 2 + 1,
    };

    //xy : coords — 2D coordinates of the mouse, in normalized device coordinates (NDC)---X
    //  and Y components should be between -1 and 1.
    this._raycaster.setFromCamera(xy, this._camera);
    if (this._scenenumber === 1) {
      // console.log('scenenumber1 _camera:', this._camera);
      // 모든 3d 돌면서 더블클릭된 객체 zoomfit
      // console.log('click함수 실행:', this._group);    클릭한것 검사
      const targets = this._raycaster.intersectObjects(this._group);
      // const target = this._raycaster.intersectObject(this._group[11]);
      // console.log('target : ', target);
      // console.log('targets: ', targets);
      if (targets.length > 0) {
        if (targets[0].object.name === 'tree') {
          console.log('tree!!!!!');
          // 트리 줌인 후에 꾸밀수 있도록 인벤토리
          // this._zoomFit(targets[0].object.parent, 60);
          // setTimeout(() => {
          // }, 1600);
          // this._setupTreeModal();
        } else if (targets[0].object.name === 'house') {
          console.log('house!!!!!!!!');
          this._zoomFit(targets[0].object.parent, 60);
          setTimeout(() => {
            this._setupAlert();
          }, 1500);
        } else if (targets[0].object.name === 'ball1') {
          console.log('ball1!!!!!!!!!!!!!!');
        } else {
          if (this._isAlert) {
            this._removeAlert();
          }

          if (this._isTreeModal) {
            this._removeTreeModal();
          }
          this._scenenumber = 1;

          this._removeModal();
          setTimeout(() => {
            // this._setupControls();
            this._zoomFit(this._model, 60);
          }, 100);
        }
      } else {
        this._scenenumber = 1;
        if (this._isAlert) {
          this._removeAlert();
        }

        if (this._isTreeModal) {
          this._removeTreeModal();
        }

        this._removeModal();
        setTimeout(() => {
          // this._setupControls();
          this._zoomFit(this._model, 60);
        }, 100);
      }

      const targets2 = this._raycaster.intersectObjects(this._tree);
      if (targets2.length > 0) {
        let object = targets2[0].object;
        while (object.parent) {
          object = object.parent;
          if (object instanceof THREE.Group) {
            break;
          }
        }
        console.log('parent:', object);
        this._isTreeModal = true;
        this._zoomInven(this._inven, 90);
      }
    } else {
      const exporter = new GLTFExporter();

      // console.log('scenenumber2 _camera:', this._camera);
      // scenenumber == 2 일때
      // console.log('onclick2');
      // drag & drop 구현

      // x누르면 다시 돌아가는거 구현
      // console.log('close:', this._close);
      // console.log('raycaster:', this._raycaster);
      const closeTarget = this._raycaster.intersectObject(this._close);
      const treeTarget = this._raycaster.intersectObjects(this._tree);

      console.log('asdfasdf', this._tree);
      // object = treeTarget[0].object;
      // while (object.parent) {
      //   object = object.parent;
      //   if (object instanceof THREE.Group && object.name === 'tree') {
      //     break;
      //   }
      // }

      const itemTarget = this._raycaster.intersectObjects(this._items);
      const formData = new FormData();
      // console.log('closeTarget:', closeTarget);
      if (closeTarget.length > 0) {
        // scene1으롣 돌아가기
        let glbFile: Blob;
        exporter.parse(
          this._tree[0],
          function (result) {
            console.log('result:', result);
            glbFile = saveArrayBuffer(result);
            formData.append('glbfile', glbFile);
            console.log('result : ', glbFile);

            axios({
              url: 'http://localhost:8080/api/test',
              method: 'post',
              data: formData,
            }).then((res) => {
              console.log(res);
            });
          },
          function (error) {
            console.log(error);
          },
          { binary: true },
        );

        // 백에 glb 보내기

        this._scene2.remove(this._showcase);
        this._scene2.remove(...this._items);
        this._scene2.remove(this._close);
        this._dragControls.forEach((control) => {
          control.deactivate();
        });

        this._scenenumber = 1;
        this._setupControls();
        setTimeout(() => {
          this._zoomFit(this._model, 60);
        }, 100);
      }
      // if (itemTarget.length > 0) {
      //   this._setupDrag(itemTarget[0]);
      // }
      console.log('treetarget:', treeTarget);
      // console.log('itemTarget:', itemTarget);
    }
  }

  _setupRotate(event: any) {
    if (this._scenenumber === 2) {
      event.preventDefault();
      // console.log('rotate', this._tree[0]);
      this._tree[0].rotateY(event.deltaY * 0.0005);
    }
  }
  // _setupTreeModal() {
  //   const treeModal = document.querySelector(
  //     '.treemodal',
  //   ) as HTMLElement | null;
  //   if (treeModal !== null) {
  //     treeModal.style.display = 'flex';
  //   }
  //   this._isTreeModal = true;
  // }
  _dragControls: any[] = [];
  _setupDrag() {
    console.log('items:', this._items);
    console.log('tree:', this._tree);
    const positions = this._position;
    const tree = this._tree;
    let items = this._items;
    // const raycaster = this._raycaster;

    items.forEach((child, index) => {
      // console.log('item child:', child);
      child.name = index;
      const controls = new DragControls(
        [child],
        this._camera,
        this._renderer.domElement,
      );
      controls.transformGroup = true;

      controls.addEventListener('dragstart', function (event) {
        const targets = controls.getRaycaster().intersectObjects(tree);
        let object;
        if (targets.length > 0) {
          object = targets[0].object;
          while (object.parent) {
            object = object.parent;
            if (object instanceof THREE.Group && object.name === 'tree') {
              break;
            }
          }
        }
        console.log('dragstart!!!!!!!!!!!!!', event.object, targets, object);
        // 장식품이 트리에 붙어있는 것일때
        if (event.object.parent === object) {
          console.log('parent = event.object');
          event.object.removeFromParent();
        }
        event.object.children[0].children[0].material.emissive.set(0xaaaaaa);
      });

      controls.addEventListener('dragend', (event) => {
        const targets = controls.getRaycaster().intersectObjects(tree);
        console.log('dragend targets:', targets);
        event.object.children[0].children[0].material.emissive.set(0x000000);

        //drag가 끝났을 때 raycaster로 tree와 만나는지 판단
        // console.log('world position:', event.object.getWorldPosition());

        if (targets.length > 0) {
          if (targets[0].object.name === 'tree') {
            //만난다면 장식품을 tree에 붙이고 종속시킴
            console.log('tree 장식!', event.object, targets);
            event.object.position.setX(targets[0].point.x);
            event.object.position.setY(targets[0].point.y);
            event.object.position.setZ(targets[0].point.z);
            let object = targets[0].object;
            while (object.parent) {
              object = object.parent;
              if (object instanceof THREE.Group) {
                break;
              }
            }

            items = items.filter((obj) => obj !== event.object);
            object.attach(event.object);
            this._items = items;
          } else {
            // 나눌 필요 있음
            // event.object.removeFromParent();
            console.log('tree가 아닌것 raycast');
            event.object.position.setX(positions[child.name][0]);
            event.object.position.setY(positions[child.name][1]);
            event.object.position.setZ(positions[child.name][2]);
          }
        } else {
          // event.object.removeFromParent();
          console.log('remove object:', event.object);
          console.log('target.length === 0');
          // console.log('else event:', event);
          console.log(positions[child.name][0]);
          event.object.position.setX(positions[child.name][0]);
          event.object.position.setY(positions[child.name][1]);
          event.object.position.setZ(positions[child.name][2]);
          console.log(event.object.position);
        }

        //tree와 만나지 않는다면 다시 원래 위치로 돌려보냄
      });

      controls.addEventListener('drag', function (event) {
        // console.log('drag position:', position);
        event.object.position.z = child.position.z; // This will prevent moving z axis, but will be on 0 line. change this to your object position of z axis.
      });
      this._dragControls.push(controls);
    });
    // this._tree = tree;

    // this._items = items;
  }

  _removeTreeModal() {
    this._scene.remove(this._showcase);
    this._scene.remove(...this._items);
  }

  _removeAlert() {
    const alert = document.querySelector('.alert') as HTMLElement | null;
    console.log(alert);
    if (alert !== null) {
      alert.style.display = 'none';
    }
    this._isAlert = false;
  }
  _setupAlert() {
    const alert = document.querySelector('.alert') as HTMLElement | null;
    console.log(alert);
    if (alert !== null) {
      console.log('alert');
      alert.style.display = 'flex';
    }
    this._isAlert = true;
  }

  _removeModal() {
    const modal = document.querySelector('.modal') as HTMLElement | null;
    if (modal !== null) {
      modal.style.display = 'none';
    }
  }
  _setupModal() {
    const modal = document.querySelector('.modal') as HTMLElement | null;
    if (modal !== null) {
      modal.style.display = 'block';
    }
  }

  // https://www.youtube.com/watch?v=OgC3kGKKb7A
  // viewangle 은 수직축으로의 각도 90 도면 평면과 평행하게 바라봄. 0 도면 위에서 바라봄.
  _zoomFit(object3d: any, viewAngle: number) {
    // console.log('zoomfit object3d: ', object3d);
    //box 는 객체를 담는 최소크기 박스
    const box = new THREE.Box3().setFromObject(object3d);
    //box를통해 얻을 수있는 가장 긴 모서리 길이
    const sizeBox = box.getSize(new THREE.Vector3()).length();
    //box 중심점 ;; 카메라가 바라보는 곳으로 설정하면 좋음
    const centerBox = box.getCenter(new THREE.Vector3());

    const direction = new THREE.Vector3(0, 1, 0);
    direction.applyAxisAngle(
      new THREE.Vector3(1, 0, 0),
      THREE.MathUtils.degToRad(viewAngle),
    );

    const halfSizeModel = sizeBox * 0.5;
    const halfFov = THREE.MathUtils.degToRad(this._camera.fov * 0.5);
    const distance = halfSizeModel / Math.tan(halfFov);

    const newPosition = new THREE.Vector3().copy(
      direction.multiplyScalar(distance).add(centerBox),
    );

    // this._camera.position.copy(newPosition);
    // this._controls.target.copy(centerBox);

    //애니메이션 라이브러리 gsap
    //카메라 위치변경
    gsap.to(this._camera.position, {
      duration: 1.5,
      x: newPosition.x,
      y: newPosition.y,
      z: newPosition.z,
    });

    //this._controls.target.copy(centerBox);
    // console.log(this._controls);
    // console.log(this._controls.target);
    // 타겟위치변경
    gsap.to(this._controls.target, {
      duration: 0.5,
      x: centerBox.x,
      y: centerBox.y,
      z: centerBox.z,
      onUpdate: () => {
        //애니메이션 수행중에 깜빡거리는 현상 방지
        this._camera.lookAt(
          this._controls.target.x,
          this._controls.target.y,
          this._controls.target.z,
        );
      },
    });
  }

  _zoomInven(object3d: any[], viewAngle: number) {
    const positions: any[] = [];
    this._items.forEach((child) => {
      positions.push(child.position);
    });
    // console.log('zoomfit object3d: ', object3d);
    //box 는 객체를 담는 최소크기 박스
    const box1 = new THREE.Box3().setFromObject(object3d[0]);
    const box2 = new THREE.Box3().setFromObject(object3d[1]);
    const box = new THREE.Box3().union(box1);
    box.union(box2);
    //box를통해 얻을 수있는 가장 긴 모서리 길이
    const sizeBox = box.getSize(new THREE.Vector3()).length();
    //box 중심점 ;; 카메라가 바라보는 곳으로 설정하면 좋음
    const centerBox = box.getCenter(new THREE.Vector3());

    const direction = new THREE.Vector3(0, 1, 0);
    direction.applyAxisAngle(
      new THREE.Vector3(1, 0, 0),
      THREE.MathUtils.degToRad(viewAngle),
    );

    const halfSizeModel = sizeBox * 0.5;
    const halfFov = THREE.MathUtils.degToRad(this._camera.fov * 0.5);
    const distance = halfSizeModel / Math.tan(halfFov);

    const newPosition = new THREE.Vector3().copy(
      direction.multiplyScalar(distance).add(centerBox),
    );

    // this._camera.position.copy(newPosition);
    // this._controls.target.copy(centerBox);

    //애니메이션 라이브러리 gsap
    //카메라 위치변경
    gsap.to(this._camera.position, {
      duration: 1.5,
      x: newPosition.x,
      y: newPosition.y,
      z: newPosition.z,
    });

    //this._controls.target.copy(centerBox);
    // console.log(this._controls);
    // console.log(this._controls.target);
    // 타겟위치변경
    gsap.to(this._controls.target, {
      duration: 0.5,
      x: centerBox.x,
      y: centerBox.y,
      z: centerBox.z,
      onUpdate: () => {
        //애니메이션 수행중에 깜빡거리는 현상 방지
        this._camera.lookAt(
          this._controls.target.x,
          this._controls.target.y,
          this._controls.target.z,
        );
      },
    });
    setTimeout(() => {
      this._scene2.add(object3d[0]);
      this._scene2.add(...this._items);
      this._scene2.add(this._close);
      this._scenenumber = 2;
      this._setupControls();

      this._setupDrag();
    }, 1500);
  }

  //zoomout 함수
  _zoomOut(object3d: any, viewAngle: number) {
    // console.log('zoomfit object3d: ', object3d);
    //box 는 객체를 담는 최소크기 박스
    const box = new THREE.Box3().setFromObject(object3d);
    //box를통해 얻을 수있는 가장 긴 모서리 길이
    const sizeBox = box.getSize(new THREE.Vector3()).length();
    //box 중심점 ;; 카메라가 바라보는 곳으로 설정하면 좋음
    const centerBox = box.getCenter(new THREE.Vector3());

    const direction = new THREE.Vector3(0, 1, 0);
    direction.applyAxisAngle(
      new THREE.Vector3(1, 0, 0),
      THREE.MathUtils.degToRad(viewAngle),
    );

    const halfSizeModel = sizeBox * 0.5;
    const halfFov = THREE.MathUtils.degToRad(this._camera.fov * 0.5);
    const distance = halfSizeModel / Math.tan(halfFov);

    const newPosition = new THREE.Vector3().copy(
      direction.multiplyScalar(distance).add(centerBox),
    );

    // this._camera.position.copy(newPosition);
    // this._controls.target.copy(centerBox);

    //애니메이션 라이브러리 gsap
    //카메라 위치변경
    gsap.to(this._camera.position, {
      duration: 1.5,
      x: newPosition.x,
      y: newPosition.y,
      z: newPosition.z,
    });

    //this._controls.target.copy(centerBox);
    // console.log(this._controls);
    // console.log(this._controls.target);
    // 타겟위치변경
    gsap.to(this._controls.target, {
      duration: 0.5,
      x: centerBox.x,
      y: centerBox.y,
      z: centerBox.z,
      onUpdate: () => {
        //애니메이션 수행중에 깜빡거리는 현상 방지
        this._camera.lookAt(
          this._controls.target.x,
          this._controls.target.y,
          this._controls.target.z,
        );
      },
    });
  }

  _setupCamera() {
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      500,
    );
    console.log('camera');
    camera.position.set(15, 10, 15);
    camera.getWorldDirection(new THREE.Vector3(0, 0, 0));
    // camera.lookAt(target);

    // const cameraHelper = new THREE.CameraHelper(camera);
    // this._scene.add(cameraHelper);

    // console.log('setupcamera:', this._model);  //undefined
    // const camera = this._model.children[1];
    this._camera = camera;
  }

  _addPointLight(x: number, y: number, z: number, helperColr: number) {
    const color = 0xffffff;
    const intensity = 1.5;

    const pointLight = new THREE.PointLight(color, intensity, 2000);
    pointLight.position.set(x, y, z);

    this._scene.add(pointLight);

    const pointLightHelper = new THREE.PointLightHelper(
      pointLight,
      10,
      helperColr,
    );
    this._scene.add(pointLightHelper);
  }

  _setupLight() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this._scene.add(ambientLight);

    this._addPointLight(50, 20, 50, 0xff0000);
    this._addPointLight(-50, 20, 50, 0xffff00);
    this._addPointLight(-50, 20, -50, 0x00ff00);
    this._addPointLight(50, 20, -50, 0x0000ff);

    const shadowLight = new THREE.DirectionalLight(0xffffff, 0.2);
    shadowLight.position.set(20, 50, 20);
    shadowLight.target.position.set(0, 0, 0);
    const directionalLightHelper = new THREE.DirectionalLightHelper(
      shadowLight,
      10,
    );
    this._scene.add(directionalLightHelper);

    this._scene.add(shadowLight);
    this._scene.add(shadowLight.target);

    //그림자 광원처리
    shadowLight.castShadow = true;
    shadowLight.shadow.mapSize.width = 1024;
    shadowLight.shadow.mapSize.height = 1024;
    shadowLight.shadow.camera.top = shadowLight.shadow.camera.right = 70;
    shadowLight.shadow.camera.bottom = shadowLight.shadow.camera.left = -70;
    shadowLight.shadow.camera.near = 10;
    shadowLight.shadow.camera.far = 90;
    shadowLight.shadow.radius = 5;
    const shadowCameraHelper = new THREE.CameraHelper(
      shadowLight.shadow.camera,
    );
    this._scene.add(shadowCameraHelper);
  }

  _previousDirectionOffset = 0;

  //초기 속도
  _speed = 0;
  _maxSpeed = 0;
  _acceleration = 0;

  _bOnTheGround = false; //모델이 바닥위에 있는지 여부체크
  _fallingAcceleration = 0;
  _fallingSpeed = 0;

  resize() {
    const width = this._canvasContainer.clientWidth;
    const height = this._canvasContainer.clientHeight;

    this._camera.aspect = width / height;
    this._camera.updateProjectionMatrix();

    this._renderer.setSize(width, height);
  }
}
