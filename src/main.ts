import { Scene, WebGLRenderer, PerspectiveCamera } from "three";

import { createNoteMaterials, loadNoteTextures } from "./notetextureloader";
import { Playfield } from "./playfield";
import noteData from "./murasame.json";
import { generateStoryboard } from "./storyboard";
import { updateAnimations } from "./animations";
import { GenerateOptions, setGenerateListener, setOutput, setProgressBar } from "./dock";

const mainCanvas = document.getElementById("mainCanvas") as HTMLCanvasElement | null;

if(mainCanvas === null){
	throw new Error("Could not find mainCanvas in document!");
}

const renderer = new WebGLRenderer({
	antialias: true,
	powerPreference: "high-performance",
	canvas: mainCanvas
});

const scene = new Scene();
const camera = new PerspectiveCamera(57, 16 / 9, 0.01, 1000);

camera.translateZ(10);

const resizeObserver = new ResizeObserver((entries, observer) => {
	for(const entry of entries){
		const width = entry.devicePixelContentBoxSize[0].inlineSize;
		const height = entry.devicePixelContentBoxSize[0].blockSize;

		renderer.setSize(width, height, false);

		camera.aspect = width / height;
	}
});

resizeObserver.observe(renderer.domElement, { box: "device-pixel-content-box" });

let playfield: any;

loadNoteTextures().then((textures) => {
	renderer.setAnimationLoop(step);

	const noteMaterials = createNoteMaterials(textures);
	
	playfield = new Playfield(noteMaterials);
	playfield.position.y = -4;
	playfield.position.z = 1;

	for(const note of noteData){
		playfield.addNote(note.lane, note.time, note.snap);
	}

	scene.add(playfield);
});

function generateListener(options: GenerateOptions){
	renderer.setAnimationLoop(null);

	const sbGen = generateStoryboard(scene, camera, options);

	let lastProgress = 0;

	function processItem(){
		const pogress = sbGen.next();

		if(pogress.done){
			setOutput(pogress.value);
			setProgressBar(1);
			return;
		}

		const progress = pogress.value;

		// Update bar only on one percent intervals
		if(lastProgress % 0.01 > progress % 0.01){
			setProgressBar(progress);
		}

		lastProgress = progress;

		setTimeout(processItem, 0);
	}

	setTimeout(processItem, 0);
}

setGenerateListener(generateListener);

function step(time: number){
	updateAnimations(time);
	
	// const rot = new Euler(0, time / 1000 * Math.PI * 2, 0);
	// playfield.setRotationFromEuler(rot);

	renderer.render(scene, camera);
}
