import { Camera, Scene, WebGLRenderer } from "three";
import { inverseLerp } from "three/src/math/MathUtils";
import { updateAnimations } from "./animations";
import { GenerateOptions } from "./dock";
import { SBAble } from "./sbable";

const variableString = `[Variables]
$m= M,0,
$r= R,0,
$v= V,0,
$s= S,0,
$f= F,0,
`;

export function* generateStoryboard(renderer: WebGLRenderer, scene: Scene, camera: Camera, options: GenerateOptions) {
	let currentFrame = 0;
	let currentTime = Math.round(options.startTime);

	while(currentTime < options.endTime){
		updateAnimations(currentTime);

		// Render call is the easiest way to make sure all world matrises are up to date
		renderer.render(scene, camera);

		for(const child of scene.children as SBAble[]){
			child.generateKeyframes(camera, currentTime);
		}

		currentTime = Math.round(options.startTime + 1000 / options.frameRate * currentFrame);
		currentFrame++;

		yield inverseLerp(options.startTime, options.endTime, currentTime);
	}

	let sbString = variableString + "[Events]\n";

	for(const child of scene.children as SBAble[]){
		sbString += child.toSBString();
	}

	sbString += "\n";

	return sbString;
}
