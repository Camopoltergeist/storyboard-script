import { DoubleSide, OrthographicCamera, Scene, Sprite, SpriteMaterial, Texture, Vector2, WebGLRenderer } from "three";
import { sbAspectRatio, sbWidth } from "./sbkeyframe";

export class BackgroundImage{
	private readonly scene: Scene;
	private readonly camera: OrthographicCamera;
	private readonly backgroundSprite: Sprite;
	private readonly textureSize: Vector2;

	private get aspect(): number{
		return this.textureSize.x / this.textureSize.y;
	}

	private get inverseAspect(): number{
		return this.textureSize.y / this.textureSize.x;
	}

	get storyboardScale(): number{
		if(this.aspect < sbAspectRatio){
			return sbWidth / this.textureSize.x;
		}
		else{
			return 480 / this.textureSize.y;
		}
	}

	constructor(texture: Texture){
		const textureWidth: number = texture.image.naturalWidth;
		const textureHeight: number = texture.image.naturalHeight;
		this.textureSize = new Vector2(textureWidth, textureHeight);

		this.scene = new Scene();
		this.camera = new OrthographicCamera(-0.5, 0.5, -0.5, 0.5, -1, 1);

		texture.flipY = false;
		const bgMaterial = new SpriteMaterial();
		bgMaterial.map = texture;
		bgMaterial.side = DoubleSide;

		this.backgroundSprite = new Sprite(bgMaterial);
		this.scene.add(this.backgroundSprite);
	}

	private setBgSize(rendererSize: Vector2){
		const rendererAspect = rendererSize.x / rendererSize.y;
		
		const halfAspect = rendererAspect / 2;

		let width: number;
		let height: number;

		if(rendererAspect > this.aspect){
			this.camera.left = -halfAspect;
			this.camera.right = halfAspect;
			this.camera.top = -0.5;
			this.camera.bottom = 0.5;

			width = 2;
			height = this.inverseAspect * 2;
		}
		else{
			this.camera.left = -0.5;
			this.camera.right = 0.5;
			this.camera.top = -halfAspect;
			this.camera.bottom = halfAspect;
			
			width = this.inverseAspect * 2;
			height = 2;
		}
		
		this.camera.updateProjectionMatrix();
		this.backgroundSprite.scale.x = width;
		this.backgroundSprite.scale.y = height;
	}

	render(renderer: WebGLRenderer){
		this.setBgSize(renderer.getSize(new Vector2()));
		renderer.render(this.scene, this.camera);
		renderer.clearDepth();
	}
}