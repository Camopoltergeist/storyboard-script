import { SpriteMaterial } from "three";
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
}
