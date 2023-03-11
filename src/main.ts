import { Scene, WebGLRenderer, PerspectiveCamera, Euler } from "three";

import { createNoteMaterials, loadNoteTextures } from "./notetextureloader";
import { Playfield } from "./playfield";
import noteData from "./murasame.json";
import { generateStoryboard } from "./storyboard";
import { updateAnimations } from "./animations";

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

let playfield: any;

loadNoteTextures().then((textures) => {
	renderer.setAnimationLoop(step);

	const noteMaterials = createNoteMaterials(textures);
	
	playfield = new Playfield(noteMaterials);
	playfield.position.y = -4;
	playfield.position.z = 1;

	for(const note of noteData){
		playfield.addNote(note.lane, note.time);
	}

	scene.add(playfield);

	return;

	const sbGen = generateStoryboard(renderer, scene, camera, 15, 123452, 0);

	while(true){
		const pogress = sbGen.next();

		if(pogress.done){
			console.log(pogress.value);
			break;
		}

		console.log(pogress.value);
	}
});

function step(time: number){
	updateAnimations(time);
	
	// const rot = new Euler(0, time / 1000 * Math.PI * 2, 0);
	// playfield.setRotationFromEuler(rot);

	renderer.render(scene, camera);
}
