import { Camera, Object3D, Sprite, SpriteMaterial } from "three";
import { SBKeyframe } from "./sbkeyframe";
import { SBObject } from "./sbobject";

export interface SBAble extends Object3D{
	generateKeyframes(camera: Camera, time: number): void;
	toSBString(): string;
	getStartTime(): number;
	getEndTime(): number;
}

export class SBSprite extends Sprite implements SBAble{
	readonly sbObject: SBObject;
	readonly startTime: number;
	readonly endTime: number;

	constructor(material: SpriteMaterial, startTime: number = 0, endTime: number = Infinity){
		super(material);

		this.sbObject = new SBObject(this.material.map?.userData.textureName, true);
		this.startTime = startTime;
		this.endTime = endTime;
	}

	generateKeyframes(camera: Camera, time: number){
		if(!this.visible){
			return;
		}

		const kf = SBKeyframe.fromSprite(camera, time, this);

		this.sbObject.keyframes.push(kf);
	}

	toSBString(): string{
		return this.sbObject.toSBString();
	}
	
	getStartTime(): number {
		return this.startTime;
	}

	getEndTime(): number {
		return this.endTime;
	}
}