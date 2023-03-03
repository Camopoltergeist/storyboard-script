import { Scene, WebGLRenderer, LineBasicMaterial, PerspectiveCamera, LineSegments, BufferGeometry, Vector3, Euler, KeyframeTrack, AnimationClip, AnimationMixer, InterpolateSmooth, Sprite, SpriteMaterial } from "three";
import { SBMesh } from "./sbmesh";

import { loadNoteTextures } from "./notetextureloader";

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

const sbCube = new SBMesh(cube, "line.png");

const kfTrackX = new KeyframeTrack(`${cube.uuid}.position[x]`, [
	0, 2, 4
], [
	-4, 4, -4
], InterpolateSmooth);

const kfTrackY = new KeyframeTrack(`${cube.uuid}.position[y]`, [
	0, 1, 2, 3, 4
], [
	-4, 4, -4, 4, -4
], InterpolateSmooth);

const animationClip = new AnimationClip("testAnim", -1, [kfTrackX, kfTrackY]);
const animationMixer = new AnimationMixer(cube);
const animationAction = animationMixer.clipAction(animationClip);

animationAction.play();

let noteTextures;

loadNoteTextures().then((textures) => {
	noteTextures = textures;
	renderer.setAnimationLoop(step);

	const noteMaterial = new SpriteMaterial({
		map: noteTextures[1]
	});
	
	const noteSprite = new Sprite(noteMaterial);
	
	scene.add(noteSprite);
});

function step(time: number){
	const nSin = (Math.sin(time / 1000) + 1) * Math.PI;
	const nCos = (Math.cos(time / 1000) + 1) * Math.PI;

	const rot = new Euler(nSin, 0, nCos)

	cube.setRotationFromEuler(rot);

	animationMixer.setTime(time / 1000);

	renderer.render(scene, camera);

	// sbCube.generateKeyframes(camera, time);
}

const variableString = `[Variables]
$m= M,0,
$r= R,0,
$v= V,0,
`;

async function generateStoryboard(){
	const endTime = 123452;
	const frameRate = 15;
	let frame = 0;

	while(true){
		const time = Math.round(1000 / frameRate * frame++);

		if(time > endTime){
			break;
		}

		step(time);
	}

	let sbString = variableString + "[Events]\n" + sbCube.toSBString() + "\n";

	console.log(sbString);
}

// generateStoryboard();