import { SpriteMaterial } from "three";
import { SBSprite } from "./sbable";
import { SBLane } from "./sblane";
import { degToRad } from "three/src/math/MathUtils";

export class SBNote extends SBSprite{
	readonly time: number;
	readonly parentLane: SBLane | null;
	private _baseRotation: number = 0;
	private _noteRotation: number = 0;

	get baseRotation(): number {
		return this._baseRotation;
	}

	set baseRotation(value: number) {
		this._baseRotation = value;

		this.updateRotation();
	}

	get noteRotation(): number {
		return this._noteRotation;
	}

	set noteRotation(value: number) {
		this._noteRotation = value;

		this.updateRotation();
	}

	private updateRotation() {
		this.material.rotation = degToRad(this._baseRotation + this._noteRotation);
	}

	constructor(material: SpriteMaterial, noteRotation: number, time: number, duration: number, parentLane: SBLane | null){
		const materialCopy = material.clone();

		super(materialCopy, time - duration, time);

		this.time = time;
		this.parentLane = parentLane;
		this.baseRotation = noteRotation;
	}
}
