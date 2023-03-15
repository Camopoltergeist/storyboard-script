import { Camera, Scene, WebGLRenderer } from "three";
import { inverseLerp } from "three/src/math/MathUtils";
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
		let currentTime = Math.round(options.startTime);

		while(currentTime < options.endTime){
			currentTime = Math.round(options.startTime + 1000 / options.frameRate * currentFrame);
			currentFrame++;

			updateAnimations(currentTime);
	
			// Render call is the easiest way to make sure all world matrises are up to date
			renderer.render(scene, camera);
	
			sb.generateKeyframes(camera, currentTime);
	
			yield {
				itemProgress: inverseLerp(options.startTime, options.endTime, currentTime),
				itemsLeft
			};
		}

		itemsLeft--;
	}

	let sbString = variableString + "[Events]\n";

	for(const sb of sbAbles){
		sbString += sb.toSBString();
	}

	sbString += "\n\n";

	return sbString;
}
