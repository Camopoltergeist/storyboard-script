import { AnimationClip, BooleanKeyframeTrack, NumberKeyframeTrack, SpriteMaterial } from "three";
import { addAnimation } from "./animations";
import { SBSprite } from "./sbable";

export class SBNote extends SBSprite{
	readonly time: number;

	constructor(material: SpriteMaterial, time: number){
		const materialCopy = material.clone();

		super(materialCopy, time - 1000, time);

		this.time = time;
	}

	createDefaultNoteAnimation(){
		// This has to be set to false or the notes will stay visible after the final keyframe for some reason.
		this.visible = false;

		const scaledTime = this.time / 1000;
		const kfStart = scaledTime - 1;
		const kfEnd = scaledTime;

		const noteMovementTrack = new NumberKeyframeTrack(".position[y]", [kfStart, kfEnd], [5, 0]);
		const noteVisibilityTrack = new BooleanKeyframeTrack(".visible", [kfStart, kfStart, kfEnd], [false, true, false]);
		const noteOpacityTrack = new NumberKeyframeTrack(`.material.opacity`, [kfStart, kfStart + 0.1], [0.0, 1.0]);
		const noteClip = new AnimationClip("note", -1, [noteMovementTrack, noteVisibilityTrack, noteOpacityTrack]);

		addAnimation(noteClip, this);
	}
}
