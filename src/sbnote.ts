import { SpriteMaterial } from "three";
import { SBSprite } from "./sbable";
import { SBLane } from "./sblane";

export class SBNote extends SBSprite{
	readonly time: number;
	readonly parentLane: SBLane | null;

	constructor(material: SpriteMaterial, time: number, duration: number, parentLane: SBLane | null){
		const materialCopy = material.clone();

		super(materialCopy, time - duration, time);

		this.time = time;
		this.parentLane = parentLane;
	}
}
