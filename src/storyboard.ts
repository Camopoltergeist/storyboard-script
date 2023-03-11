import { Camera, Scene, WebGLRenderer } from "three";
import { inverseLerp } from "three/src/math/MathUtils";
import { SBAble } from "./sbable";

const variableString = `[Variables]
$m= M,0,
$r= R,0,
$v= V,0,
$s= S,0,
`;

export function* generateStoryboard(renderer: WebGLRenderer, scene: Scene, camera: Camera, frameRate: number, length: number, startTime: number = 0) {
	const endTime = startTime + length;
	let currentFrame = 0;
	let currentTime = Math.round(startTime);

	while(currentTime < endTime){
		// TODO: Update animations

		// Render call is the easiest way to make sure all world matrises are up to date
		renderer.render(scene, camera);

		for(const child of scene.children as SBAble[]){
			(child as any).updateAnimations(currentTime);
			child.generateKeyframes(camera, currentTime);
		}

		currentTime = Math.round(startTime + 1000 / frameRate * currentFrame);
		currentFrame++;

		yield inverseLerp(startTime, endTime, currentTime);
	}

	let sbString = variableString + "[Events]\n";

	for(const child of scene.children as SBAble[]){
		sbString += child.toSBString();
	}

	sbString += "\n";

	return sbString;
}
