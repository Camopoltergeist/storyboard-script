import { Mesh } from "three";
import { SBObject } from "./sbobject";

export class SBGroup{
	readonly children: SBObject[] = [];

	fromMesh(obj: Mesh, textureName: string): SBGroup{
		const geometry = obj.geometry;
		const vertexCount = geometry.index === null ? geometry.attributes.position.count : geometry.index.count;

		if(vertexCount % 2 !== 0){
			throw new Error("Can't create SBGroup from Mesh: Vertex count is not divisible by 2!");
		}

		const group = new SBGroup();

		for(let i = 0; i < vertexCount; i += 2){
			group.children.push(new SBObject(textureName));
		}

		return group;
	}
}