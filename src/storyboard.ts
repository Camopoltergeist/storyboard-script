import { Camera, Scene, WebGLRenderer } from "three";
import { updateAnimations } from "./animations";
import { GenerateOptions } from "./dock";
import { SBAble, SBSprite } from "./sbable";

const variableString = `[Variables]
$m= M,0,
$r= R,0,
$v= V,0,
$s= S,0,
$f= F,0,
`;

export function* generateStoryboard(renderer: WebGLRenderer, scene: Scene, camera: Camera, options: GenerateOptions) {
	const sbAbles: SBAble[] = [];

	scene.traverse((object3d) => {
		if(object3d instanceof SBSprite){
			sbAbles.push(object3d);
		}
	});

	let itemsLeft = sbAbles.length;

	for(const sb of sbAbles){
		let currentFrame = 0;
		let currentTime = Math.round(Math.max(options.startTime, sb.getStartTime()));

		while(currentTime < options.endTime){
			currentTime = Math.round(options.startTime + 1000 / options.frameRate * currentFrame);
			currentFrame++;

			updateAnimations(currentTime);
	
			sb.updateWorldMatrix(true, false);
	
			sb.generateKeyframes(camera, currentTime);
		}

		yield itemsLeft;
		itemsLeft--;
	}

	let sbString = variableString + "[Events]\n";

	for(const sb of sbAbles){
		sbString += sb.toSBString();
	}

	sbString += "\n\n";

	return sbString;
}
