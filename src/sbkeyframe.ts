import { Camera, Vector2, Vector3 } from "three";
import { inverseLerp, lerp } from "three/src/math/MathUtils";
import { SBSprite } from "./sbable";

export class SBPositionKeyframe{
	time: number;
	position: Vector2;
	rotation: number;
	scale: number;
	scaleBoth: boolean;

	constructor(time: number, pos: Vector2, rot: number, scale: number, scaleBoth: boolean){
		this.time = time;
		this.position = pos;
		this.rotation = rot;
		this.scale = scale;
		this.scaleBoth = scaleBoth;
	}

	private static projectToStoryboard(camera: Camera, point: Vector3): Vector2{
		const vpMat = camera.projectionMatrix.clone().multiply(camera.matrixWorldInverse);

		// Do projection
		const projectedPoint = point.clone().applyMatrix4(vpMat);

		// Convert to Vector2
		const v2ProjectedPoint = new Vector2(projectedPoint.x, projectedPoint.y);

		// Do normalized device coordinate to storyboard coordinate conversion
		const sbPoint = ndcToSbc(v2ProjectedPoint);

		return sbPoint;
	}

	static fromLine(camera: Camera, time: number, lineStart: Vector3, lineEnd: Vector3, lineTextureLength: number = 128){
		const sbStart = this.projectToStoryboard(camera, lineStart);
		const sbEnd = this.projectToStoryboard(camera, lineEnd);

		const scale = sbStart.distanceTo(sbEnd) / lineTextureLength;
		const rotation = sbEnd.sub(sbStart).angle();

		return new SBPositionKeyframe(time, sbStart, rotation, scale, false);
	}
	
	static fromSprite(camera: Camera, time: number, sprite: SBSprite){
		const worldPos = new Vector3();
		sprite.getWorldPosition(worldPos);
		const sizePos = new Vector3(0.5, 0, 0);
		sprite.localToWorld(sizePos);

		const sbCoord = this.projectToStoryboard(camera, worldPos);
		const sbSizeCoord = this.projectToStoryboard(camera, sizePos);

		const sizeDistance = sbCoord.distanceTo(sbSizeCoord);

		const scale = sizeDistance / sprite.textureSize.x * 2;
		const rotation = sprite.material.rotation;

		return new SBPositionKeyframe(time, sbCoord, rotation, scale, true);
	}

	toSBString(nextKeyframe: SBPositionKeyframe): string{
		let nextRotation = nextKeyframe.rotation;

		// Choose shortest rotation path.
		// Raw value rotation path.
		const rot1 = Math.abs(nextKeyframe.rotation - this.rotation);
		// Rotation path, which crosses over the 0 rotation point.
		const rot2 = Math.PI * 2 - rot1;

		// Fix spinny lines.
		if(rot2 < rot1){
			const clockwise = nextKeyframe.rotation > this.rotation;

			if(clockwise){
				nextRotation = nextKeyframe.rotation - Math.PI * 2;
			}
			else{
				nextRotation = nextKeyframe.rotation + Math.PI * 2;
			}
		}

		const retString =
		`$m${this.time},${nextKeyframe.time},${this.position.x.toFixed(2)},${this.position.y.toFixed(2)},${nextKeyframe.position.x.toFixed(2)},${nextKeyframe.position.y.toFixed(2)}\n` + 
		`$r${this.time},${nextKeyframe.time},${this.rotation.toFixed(4)},${nextRotation.toFixed(4)}\n` +
		`$v${this.time},${nextKeyframe.time},${this.scale.toFixed(4)},1,${nextKeyframe.scale.toFixed(4)},1\n`;

		return retString;
	}

	split(): { pos: SBPosition, rot: SBRotation, scale: SBScale }{
		const pos = new SBPosition(this.time, this.position);
		const rot = new SBRotation(this.time, this.rotation);
		const scale = new SBScale(this.time, this.scale, this.scaleBoth);

		return { pos, rot, scale };
	}
}

export const sbAspectRatio = 16 / 9;
export const sbHeight = 480;
export const sbWidth = sbAspectRatio * sbHeight;
export const sbLeft = (640 - sbWidth) / 2;

// Normalized device coordinates to Storyboard coordinates
function ndcToSbc(input: Vector2): Vector2{
	const x = (input.x + 1) / 2 * sbWidth + sbLeft;
	const y = (1 - (input.y + 1) / 2) * sbHeight;

	return new Vector2(x, y);
}

function checkThreshold(a: number, b: number, t: number){
	return Math.abs(a - b) < t;
}

export interface Cullable{
	time: number,
	cullable(previous: any, next: any, threshold: number): boolean;
}

export class SBPosition implements Cullable{
	time: number;
	position: Vector2;

	constructor(time: number, pos: Vector2){
		this.time = time;
		this.position = pos;
	}

	cullable(previous: SBPosition, next: SBPosition, threshold: number): boolean{
		const t = inverseLerp(previous.time, next.time, this.time);
		const lerpedPos = previous.position.clone().lerp(next.position, t);

		return checkThreshold(this.position.x, lerpedPos.x, threshold) && checkThreshold(this.position.y, lerpedPos.y, threshold);
	}

	static genSBString(current: SBPosition, next: SBPosition): string{
		return `$m${current.time},${next.time},${current.position.x.toFixed(2)},${current.position.y.toFixed(2)},${next.position.x.toFixed(2)},${next.position.y.toFixed(2)}\n`;
	}
}

export class SBRotation implements Cullable{
	time: number;
	rotation: number;

	constructor(time: number, rot: number){
		this.time = time;
		this.rotation = rot;
	}

	cullable(previous: SBRotation, next: SBRotation, threshold: number): boolean{
		const t = inverseLerp(previous.time, next.time, this.time);
		const lerpedRot = lerp(previous.rotation, next.rotation, t);

		return checkThreshold(this.rotation, lerpedRot, threshold);
	}

	static genSBString(current: SBRotation, next: SBRotation): string{
		let nextRotation = next.rotation;

		// Choose shortest rotation path.
		// Raw value rotation path.
		const rot1 = Math.abs(next.rotation - current.rotation);
		// Rotation path, which crosses over the 0 rotation point.
		const rot2 = Math.PI * 2 - rot1;

		// Fix spinny lines.
		if(rot2 < rot1){
			const clockwise = next.rotation > current.rotation;

			if(clockwise){
				nextRotation = next.rotation - Math.PI * 2;
			}
			else{
				nextRotation = next.rotation + Math.PI * 2;
			}
		}

		return `$r${current.time},${next.time},${current.rotation.toFixed(4)},${nextRotation.toFixed(4)}\n`;
	}
}

export class SBScale implements Cullable{
	time: number;
	scale: number;
	scaleBoth: boolean;

	constructor(time: number, scale: number, scaleBoth: boolean){
		this.time = time;
		this.scale = scale;
		this.scaleBoth = scaleBoth;
	}

	cullable(previous: SBScale, next: SBScale, threshold: number): boolean{
		const t = inverseLerp(previous.time, next.time, this.time);
		const lerpedScale = lerp(previous.scale, next.scale, t);

		return checkThreshold(this.scale, lerpedScale, threshold);
	}

	static genSBString(current: SBScale, next: SBScale): string{
		if(current.scaleBoth){
			return `$s${current.time},${next.time},${current.scale.toFixed(4)},${next.scale.toFixed(4)}\n`;
		}

		return `$v${current.time},${next.time},${current.scale.toFixed(4)},1,${next.scale.toFixed(4)},1\n`;
	}
}

export class SBAlpha {
	time: number;
	alpha: number;

	constructor(time: number, alpha: number){
		this.time = Math.round(time);
		this.alpha = alpha;
	}

	static genSBString(current: SBAlpha, next: SBAlpha): string{
		return `$f${current.time},${next.time},${current.alpha.toFixed(3)},${next.alpha.toFixed(3)}\n`;
	}
}