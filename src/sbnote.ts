import { AnimationClip, BooleanKeyframeTrack, NumberKeyframeTrack, SpriteMaterial } from "three";
import { addAnimation } from "./animations";
import { SBSprite } from "./sbable";

export class SBNote extends SBSprite{
	readonly time: number;

	constructor(material: SpriteMaterial, time: number){
		const materialCopy = material.clone();

		super(materialCopy);

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
		// This has to be set to false or the notes will stay visible after the final keyframe for some reason.
		this.visible = false;

		const scaledTime = this.time / 1000;
		const kfStart = scaledTime - 1;
		const kfEnd = scaledTime;

		const noteMovementTrack = new NumberKeyframeTrack(".position[y]", [kfStart, kfEnd], [5, 0]);
		const noteVisibilityTrack = new BooleanKeyframeTrack(".visible", [kfStart, kfStart, kfEnd], [false, true, false]);
		const noteClip = new AnimationClip("note", -1, [noteMovementTrack, noteVisibilityTrack]);

		addAnimation(noteClip, this);

		const noteOpacityTrack = new NumberKeyframeTrack(`.opacity`, [kfStart, kfStart + 0.1], [0.0, 1.0]);
		const materialClip = new AnimationClip("noteMaterial", -1, [noteOpacityTrack]);

		addAnimation(materialClip, this.material);
	}
}
