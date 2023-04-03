import { WebGLRenderer } from "three";

import { createNoteMaterials, loadBgTexture, loadNoteTextures } from "./notetextureloader";

import { generateStoryboard } from "./storyboard";
import { disableOptions, enableOptions, GenerateOptions, setGenerateListener, setOutput, setPauseListener, setPlayListener, setProgressBar, setSkipToStartListener, setTimelineDisplayTime, setTimelineSeekListener } from "./dock";
import { SceneController } from "./scenecontroller";
import { TimelineClock } from "./clock";
import { BackgroundImage } from "./backgroundimage";

const mainCanvas = document.getElementById("mainCanvas") as HTMLCanvasElement | null;

if(mainCanvas === null){
	throw new Error("Could not find mainCanvas in document!");
}

const renderer = new WebGLRenderer({
	antialias: true,
	powerPreference: "high-performance",
	canvas: mainCanvas
});

renderer.autoClear = false;

const resizeObserver = new ResizeObserver((entries, observer) => {
	for(const entry of entries){
		const width = entry.devicePixelContentBoxSize[0].inlineSize;
		const height = entry.devicePixelContentBoxSize[0].blockSize;

		renderer.setSize(width, height, false);

		tlController.camera.aspect = width / height;
	}
});

let tlController: SceneController;
const tlClock = new TimelineClock();

loadNoteTextures().then(async (textures) => {
	const noteMaterials = createNoteMaterials(textures);
	const bgTexture = await loadBgTexture();

	tlController = new SceneController(noteMaterials, bgTexture);

	resizeObserver.observe(renderer.domElement, { box: "device-pixel-content-box" });

	tlClock.start();
	renderer.setAnimationLoop(animationLoop);
});

function generateListener(options: GenerateOptions){
	disableOptions();
	tlClock.stop();
	renderer.setAnimationLoop(null);

	const sbGen = generateStoryboard(tlController, options);

	let lastProgress = 0;

	function processItem(){
		const pogress = sbGen.next();

		if(pogress.done){
			setOutput(pogress.value);
			setProgressBar(1);
			enableOptions();
			
			tlClock.start();
			renderer.setAnimationLoop(animationLoop);
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

function timelineSeekListener(time: number){
	tlClock.time = time;
}

function skipToStartListener(){
	tlClock.reset();
}

function pauseListener(){
	tlClock.stop();
}

function playListener(){
	tlClock.start();
}

setGenerateListener(generateListener);
setTimelineSeekListener(timelineSeekListener);

setSkipToStartListener(skipToStartListener);
setPauseListener(pauseListener);
setPlayListener(playListener);

function animationLoop(time: number){
	const tlTime = tlClock.time;
	setTimelineDisplayTime(tlTime);

	tlController.update(tlTime);
	renderer.clear();

	tlController.background.render(renderer);

	renderer.render(tlController.scene, tlController.camera);
}
