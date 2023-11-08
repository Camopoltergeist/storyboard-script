import { GenerateOptions } from "./dock";
import { Playfield } from "./playfield";
import { SBAble, SBSprite } from "./sbable";
import { SceneController } from "./scenecontroller";

const variableString = `[Variables]
$m= M,0,
$r= R,0,
$v= V,0,
$s= S,0,
$f= F,0,
`;

export function* generateStoryboard(tlController: SceneController, options: GenerateOptions) {
	const sbAbles: SBAble[] = [];
	const playfields: Playfield[] = [];

	tlController.scene.traverse((object3d) => {
		if(object3d instanceof SBSprite){
			sbAbles.push(object3d);
			object3d.clearKeyframes();
		}

		if(object3d instanceof Playfield){
			playfields.push(object3d);
		}
	});

	let itemsLeft = sbAbles.length;

	for(const sbAble of sbAbles){
		const startTime = Math.max(options.startTime, sbAble.getStartTime());
		const endTime = Math.min(options.endTime, sbAble.getEndTime());
		const length = endTime - startTime;

		let currentFrame = 0;
		let currentTime = startTime;
		let currentTimeRounded = Math.round(currentTime);

		// Adjust frame rate so final frame lands on the end time.
		// This doesn't work, should probably be removed
		const frameRate = length / Math.floor(length / options.frameRate);

		function genFrame(){
			tlController.update(currentTimeRounded);
	
			sbAble.updateWorldMatrix(true, false);
	
			sbAble.generateKeyframes(tlController.camera, currentTimeRounded);
		}

		while(currentTime < endTime){
			genFrame();

			currentFrame++;
			currentTime = startTime + 1000 / frameRate * currentFrame;
			currentTimeRounded = Math.round(currentTime);
		}

		// Generate final keyframe at endTime
		if(currentTime > endTime){
			currentTime = endTime;
			currentTimeRounded = Math.round(currentTime);

			genFrame();
		}

		yield 1 - (itemsLeft / sbAbles.length);
		itemsLeft--;
	}

	let sbString = variableString + "[Events]\n";

	// Add BG object string
	sbString += `Sprite,4,1,"bg.jpg",320,240\n` + `$s${options.startTime},${options.endTime},${tlController.background.storyboardScale.toFixed(2)},${tlController.background.storyboardScale.toFixed(2)}\n`;

	for(const sb of sbAbles){
		sbString += sb.toSBString();
	}

	sbString += "\n\n";

	return sbString;
}
