import { Camera, Object3D, Sprite, SpriteMaterial } from "three";
import { SBKeyframe } from "./sbkeyframe";
import { SBObject } from "./sbobject";

export interface SBAble extends Object3D{
	generateKeyframes(camera: Camera, time: number): void;
	toSBString(): string;
}

export class SBSprite extends Sprite implements SBAble{
	readonly sbObject: SBObject;

	constructor(material: SpriteMaterial){
		super(material);

		this.sbObject = new SBObject(this.material.map?.userData.textureName, true);
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
}