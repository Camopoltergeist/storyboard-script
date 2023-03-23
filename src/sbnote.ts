import { AnimationClip, BooleanKeyframeTrack, NumberKeyframeTrack, SpriteMaterial } from "three";
import { SBSprite } from "./sbable";
import { SBLane } from "./sblane";

export class SBNote extends SBSprite{
	readonly time: number;
	readonly parentLane: SBLane | null;

	constructor(material: SpriteMaterial, time: number, parentLane: SBLane | null){
		const materialCopy = material.clone();

		super(materialCopy, time - 1000, time);

		this.time = time;
		this.parentLane = parentLane;
	}
}
