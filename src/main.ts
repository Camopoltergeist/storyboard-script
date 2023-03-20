import { WebGLRenderer } from "three";

import { createNoteMaterials, loadNoteTextures } from "./notetextureloader";

import { generateStoryboard } from "./storyboard";
import { disableOptions, enableOptions, GenerateOptions, setGenerateListener, setOutput, setProgressBar } from "./dock";
import { TimelineController } from "./timelinecontroller";

const mainCanvas = document.getElementById("mainCanvas") as HTMLCanvasElement | null;

if(mainCanvas === null){
	throw new Error("Could not find mainCanvas in document!");
}

const renderer = new WebGLRenderer({
	antialias: true,
	powerPreference: "high-performance",
	canvas: mainCanvas
});

const resizeObserver = new ResizeObserver((entries, observer) => {
	for(const entry of entries){
		const width = entry.devicePixelContentBoxSize[0].inlineSize;
		const height = entry.devicePixelContentBoxSize[0].blockSize;

		renderer.setSize(width, height, false);

		tlController.camera.aspect = width / height;
	}
});

let tlController: TimelineController;

loadNoteTextures().then((textures) => {
	const noteMaterials = createNoteMaterials(textures);
	tlController = new TimelineController(noteMaterials);

	resizeObserver.observe(renderer.domElement, { box: "device-pixel-content-box" });

	renderer.setAnimationLoop(animationLoop);
});

function generateListener(options: GenerateOptions){
	disableOptions();
	renderer.setAnimationLoop(null);

	const sbGen = generateStoryboard(tlController, options);

	let lastProgress = 0;

	function processItem(){
		const pogress = sbGen.next();

		if(pogress.done){
			setOutput(pogress.value);
			setProgressBar(1);
			enableOptions();
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

function animationLoop(time: number){
	tlController.update(time);
	renderer.render(tlController.scene, tlController.camera);
}
