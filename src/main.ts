import { Scene, WebGLRenderer, LineBasicMaterial, PerspectiveCamera, LineSegments, BufferGeometry, Vector3, Euler } from "three";
import { SBMesh } from "./sbmesh";

import { createNoteMaterials, loadNoteTextures } from "./notetextureloader";
import { Playfield } from "./playfield";
import { AnimatorNumber, constantPolation, Keyframe, linearPolation } from "./animator";

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

let animator: any;

loadNoteTextures().then((textures) => {
	renderer.setAnimationLoop(step);

	const noteMaterials = createNoteMaterials(textures);
	
	const playfield = new Playfield(noteMaterials);

	for(let i = 0; i < 1000; i++){
		const time = i * 250;
		const lane = i % 4;

		playfield.addNote(lane, time);
	}

	animator = new AnimatorNumber(playfield, "position.x");

	const startKf = new Keyframe<number>(0, -4, linearPolation, constantPolation);
	const endKf = new Keyframe<number>(1000, 4, linearPolation, constantPolation);

	animator.addKeyframe(startKf);
	animator.addKeyframe(endKf);

	scene.add(playfield);
});

function step(time: number){
	const nSin = (Math.sin(time / 1000) + 1) * Math.PI;
	const nCos = (Math.cos(time / 1000) + 1) * Math.PI;

	const rot = new Euler(nSin, 0, nCos)

	cube.setRotationFromEuler(rot);

	animator.update(time);

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