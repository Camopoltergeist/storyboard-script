import { GenerateOptions } from "./dock";
import { Playfield } from "./playfield";
import { SBAble, SBSprite } from "./sbable";
import { TimelineController } from "./timelinecontroller";

const variableString = `[Variables]
$m= M,0,
$r= R,0,
$v= V,0,
$s= S,0,
$f= F,0,
`;

export function* generateStoryboard(tlController: TimelineController, options: GenerateOptions) {
	const sbAbles: SBAble[] = [];
	const playfields: Playfield[] = [];

	tlController.scene.traverse((object3d) => {
		if(object3d instanceof SBSprite){
			sbAbles.push(object3d);
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
		const frameRate = length / Math.floor(length / options.frameRate);

		while(currentTime < endTime){
			tlController.update(currentTime);
	
			sbAble.updateWorldMatrix(true, false);
	
			sbAble.generateKeyframes(tlController.camera, currentTimeRounded);

			currentFrame++;
			currentTime = startTime + 1000 / frameRate * currentFrame;
			currentTimeRounded = Math.round(currentTime);
		}

		yield 1 - (itemsLeft / sbAbles.length);
		itemsLeft--;
	}

	let sbString = variableString + "[Events]\n";

	for(const sb of sbAbles){
		sbString += sb.toSBString();
	}

	sbString += "\n\n";

	return sbString;
}
