import { Scene, OrthographicCamera, WebGLRenderer, Color, Mesh, BoxGeometry, LineBasicMaterial, MeshBasicMaterial, Line, PerspectiveCamera, LineSegments, BufferGeometry, Vector3, Quaternion, Euler, Matrix4, Camera, Vector2, BufferAttribute } from "three";
import { degToRad, radToDeg } from "three/src/math/MathUtils";

const renderer = new WebGLRenderer({
	alpha: true,
	antialias: true,
	powerPreference: "high-performance"
});

const scene = new Scene();
const camera = new PerspectiveCamera(57, 16 / 9, 0.01, 1000);

camera.translateZ(10);

let resizeObserver = new ResizeObserver((entries, observer) => {
	for(const entry of entries){
		const width = entry.devicePixelContentBoxSize[0].inlineSize;
		const height = entry.devicePixelContentBoxSize[0].blockSize;

		renderer.setSize(width, height, false);

		camera.aspect = width / height;
	}
});

resizeObserver.observe(renderer.domElement, { box: "device-pixel-content-box" });

document.body.appendChild(renderer.domElement);

function getBoxLines(): BufferGeometry{
	const geometry = new BufferGeometry();

	const points = [
		new Vector3(-0.5, -0.5, -0.5),
		new Vector3(0.5, -0.5, -0.5),
		new Vector3(0.5, 0.5, -0.5),
		new Vector3(-0.5, 0.5, -0.5),

		new Vector3(-0.5, -0.5, 0.5),
		new Vector3(0.5, -0.5, 0.5),
		new Vector3(0.5, 0.5, 0.5),
		new Vector3(-0.5, 0.5, 0.5),
	];

	const indices = [
		0, 1,
		1, 2,
		2, 3,
		3, 0,

		4, 5,
		5, 6,
		6, 7,
		7, 4,

		0, 4,
		1, 5,
		2, 6,
		3, 7
	];

	geometry.setFromPoints(points);
	geometry.setIndex(indices);

	return geometry;
}

const cube = new LineSegments(getBoxLines(), new LineBasicMaterial());
scene.add(cube);

function step(time: DOMHighResTimeStamp){
	const nSin = (Math.sin(time / 1000) + 1) * Math.PI;
	const nCos = (Math.cos(time / 1000) + 1) * Math.PI;

	const rot = new Euler(nSin, 0, nCos)

	cube.setRotationFromEuler(rot);

	renderer.render(scene, camera);
}

camera.updateWorldMatrix(false, false);

class LineKeyframe{
	time: number;
	position: Vector2;
	rotation: number;
	length: number;

	constructor(time: number, pos: Vector2, rot: number, length: number){
		this.time = time;
		this.position = pos;
		this.rotation = rot;
		this.length = length;
	}
}

const sbHeight = 480;
const sbWidth = 16 / 9 * sbHeight;
const sbLeft = (640 - sbWidth) / 2;

function sbLineKF(camera: Camera, time: number, lineStart: Vector3, lineEnd: Vector3) {
	const vpMat = camera.projectionMatrix.clone().multiply(camera.matrixWorldInverse);

	const projStart = lineStart.clone().applyMatrix4(vpMat);
	const projEnd = lineEnd.clone().applyMatrix4(vpMat);

	const v2Start = new Vector2(projStart.x, projStart.y);
	const v2End = new Vector2(projEnd.x, projEnd.y);

	const sbStart = ndcToSbc(v2Start);
	const sbEnd = ndcToSbc(v2End);

	const scale = sbStart.distanceTo(sbEnd) / 128;
	const rotation = sbEnd.sub(sbStart).angle();

	return new LineKeyframe(time, sbStart, rotation, scale);
}

function createSBCode(currentKeyframe: LineKeyframe, nextKeyframe: LineKeyframe){
	const retString =
	` M,0,${currentKeyframe.time},${nextKeyframe.time},${currentKeyframe.position.x.toPrecision(7)},${currentKeyframe.position.y.toPrecision(7)},${nextKeyframe.position.x.toPrecision(7)},${nextKeyframe.position.y.toPrecision(7)}\n` + 
	` R,0,${currentKeyframe.time},${nextKeyframe.time},${currentKeyframe.rotation.toPrecision(7)},${nextKeyframe.rotation.toPrecision(7)}\n` +
	` V,0,${currentKeyframe.time},${nextKeyframe.time},${currentKeyframe.length.toPrecision(7)},1,${nextKeyframe.length.toPrecision(7)},1\n`;

	return retString;
}

function generateStoryboard(frameRate: number = 30, frameCount: number = 3600){
	const keyframes = [];
	const geometry = cube.geometry;

	const posArr = (geometry.attributes.position as any).array;

	const startX = posArr[0];
	const startY = posArr[1];
	const startZ = posArr[2];

	const endX = posArr[3];
	const endY = posArr[4];
	const endZ = posArr[5];

	const lineStart = new Vector3(startX, startY, startZ);
	const lineEnd = new Vector3(endX, endY, endZ);
	
	for(let frame = 0; frame < frameCount; frame++){
		const time = Math.round(1000 / frameRate * frame);

		const nSin = (Math.sin(time / 1000) + 1) * Math.PI;
		const nCos = (Math.cos(time / 1000) + 1) * Math.PI;

		const rot = new Euler(nSin, 0, nCos)

		cube.setRotationFromEuler(rot);
		cube.updateMatrixWorld();

		const mLineStart = lineStart.clone().applyMatrix4(cube.matrixWorld);
		const mLineEnd = lineEnd.clone().applyMatrix4(cube.matrixWorld);

		const kf = sbLineKF(camera, time, mLineStart, mLineEnd);

		keyframes.push(kf);
	}

	let sbString = `Sprite,4,CentreLeft,"line.png",0,0\n`;

	for(let frame = 0; frame < frameCount - 1; frame++){
		const currentKf = keyframes[frame];
		const nextKf = keyframes[frame + 1];

		sbString += createSBCode(currentKf, nextKf);
	}

	console.log(sbString);
}

// Normalized device coordinates to Storyboard coordinates
function ndcToSbc(input: Vector2): Vector2{
	const x = (input.x + 1) / 2 * sbWidth + sbLeft;
	const y = (1 - (input.y + 1) / 2) * sbHeight;

	return new Vector2(x, y)
}

generateStoryboard(30, 3600);

renderer.setAnimationLoop(step);