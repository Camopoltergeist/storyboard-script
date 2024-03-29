import { Camera, Object3D, Sprite, SpriteMaterial, Vector2 } from "three";
import { SBAlpha, SBPositionKeyframe } from "./sbkeyframe";
import { SBObject } from "./sbobject";

export interface SBAble extends Object3D{
	generateKeyframes(camera: Camera, time: number): void;
	clearKeyframes(): void;
	toSBString(): string;
	getStartTime(): number;
	getEndTime(): number;
}

export class SBSprite extends Sprite implements SBAble{
	readonly sbObject: SBObject;
	readonly startTime: number;
	readonly endTime: number;
	readonly textureSize: Vector2;

	constructor(material: SpriteMaterial, startTime: number = 0, endTime: number = Infinity){
		super(material);

		this.sbObject = new SBObject(this.material.map?.userData.textureName, true);
		this.startTime = startTime;
		this.endTime = endTime;
		
		const image = this.material.map?.image;
		const imageWidth = image.naturalWidth;
		const imageHeight = image.naturalHeight;

		this.textureSize = new Vector2(imageWidth, imageHeight);
	}

	generateKeyframes(camera: Camera, time: number){
		const kf = SBPositionKeyframe.fromSprite(camera, time, this);

		this.sbObject.posKeyframes.push(kf);
	}

	clearKeyframes(): void {
		this.sbObject.clearKeyframes();
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