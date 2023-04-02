import { SpriteMaterial, Texture, TextureLoader } from "three";

import receptor from "./resources/receptor.png";
import note4 from "./resources/note4.png";
import note8 from "./resources/note8.png";
import note16 from "./resources/note16.png";

import bgImage from "./resources/testbg.jpg";

export async function loadNoteTextures(): Promise<Texture[]>{
	const loader = new TextureLoader();

	const texturePromises = [
		loader.loadAsync(receptor),
		loader.loadAsync(note4),
		loader.loadAsync(note8),
		loader.loadAsync(note16)
	];

	const textures = await Promise.all(texturePromises);

	textures[0].userData.textureName = "receptor.png";
	textures[1].userData.textureName = "note4.png";
	textures[2].userData.textureName = "note8.png";
	textures[3].userData.textureName = "note16.png";

	return textures;
}

export async function loadBgTexture(): Promise<Texture>{
	const loader = new TextureLoader();

	const texture = await loader.loadAsync(bgImage);

	return texture;
}

export function createNoteMaterials(noteTextures: Texture[]): SpriteMaterial[]{
	const materials = new Array(noteTextures.length);
	
	let i = 0;

	for(const texture of noteTextures){
		materials[i++] = new SpriteMaterial({map: texture});
	}

	return materials;
}
