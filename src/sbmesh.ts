import { Camera, LineSegments, Matrix4, Mesh, Vector3 } from "three";
import { SBKeyframe } from "./sbkeyframe";
import { SBObject } from "./sbobject";

export class SBMesh{
	readonly mesh: Mesh | LineSegments;
	readonly children: SBObject[] = [];

	constructor(mesh: Mesh | LineSegments, textureName: string) {
		this.mesh = mesh;

		const geometry = mesh.geometry;
		const vertexCount = geometry.index === null ? geometry.attributes.position.count : geometry.index.count;

		if(vertexCount % 2 !== 0){
			throw new Error("Can't create SBGroup from Mesh: Vertex count is not divisible by 2!");
		}

		for(let i = 0; i < vertexCount; i += 2){
			this.children.push(new SBObject(textureName));
		}
	}

	generateKeyframes(camera: Camera, time: number){
		for(let i = 0; i < this.children.length; i++){
			this.generateKeyframe(camera, time, i);
		}
	}

	private generateKeyframe(camera: Camera, time: number, childIndex: number){
		const child = this.children[childIndex];
		const geometry = this.mesh.geometry;

		let lineStart: Vector3;
		let lineEnd: Vector3;

		const posArray: Float32Array = (geometry.attributes.position as any).array;
		
		if(geometry.index === null){
			const posIndex = childIndex * 2 * 3;

			const startX = posArray[posIndex + 0];
			const startY = posArray[posIndex + 1];
			const startZ = posArray[posIndex + 2];

			const endX = posArray[posIndex + 3];
			const endY = posArray[posIndex + 4];
			const endZ = posArray[posIndex + 5];

			lineStart = new Vector3(startX, startY, startZ);
			lineEnd = new Vector3(endX, endY, endZ);
		}
		else{
			const posIndex = childIndex * 2;
			const startIndex = geometry.index.array[posIndex];
			const endIndex = geometry.index.array[posIndex + 1];

			const startX = posArray[startIndex + 0];
			const startY = posArray[startIndex + 1];
			const startZ = posArray[startIndex + 2];

			const endX = posArray[endIndex + 0];
			const endY = posArray[endIndex + 1];
			const endZ = posArray[endIndex + 2];

			lineStart = new Vector3(startX, startY, startZ);
			lineEnd = new Vector3(endX, endY, endZ);
		}

		lineStart.applyMatrix4(this.mesh.matrixWorld);
		lineEnd.applyMatrix4(this.mesh.matrixWorld);

		const kf = SBKeyframe.fromLine(camera, time, lineStart, lineEnd);
		child.keyframes.push(kf);
	}

	toSBString(): string{
		let ret = "";

		for(const child of this.children){
			ret += child.toSBString();
		}

		return ret;
	}
}