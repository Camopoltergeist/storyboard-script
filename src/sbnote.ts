import { AnimationClip, BooleanKeyframeTrack, NumberKeyframeTrack, SpriteMaterial } from "three";
import { addAnimation } from "./animations";
import { SBSprite } from "./sbable";

export class SBNote extends SBSprite{
	readonly time: number;

	constructor(material: SpriteMaterial, time: number){
		super(material);

		this.time = time;
	}

	updateVisibility(currentTime: number){
		if(currentTime < this.time - 1000 || currentTime > this.time){
			this.visible = false;
		}
		else{
			this.visible = true;
		}
	}

	createDefaultNoteAnimation(){
		this.visible = false;

		const scaledTime = this.time / 1000;
		const kfStart = scaledTime - 1;
		const kfEnd = scaledTime;

		const noteMovementTrack = new NumberKeyframeTrack(".position[y]", [kfStart, kfEnd], [5, 0]);
		const noteVisibilityTrack = new BooleanKeyframeTrack(".visible", [kfStart, kfStart, kfEnd], [false, true, false]);
		const animationClip = new AnimationClip("note", -1, [noteMovementTrack, noteVisibilityTrack]);

		addAnimation(animationClip, this);
	}
}
