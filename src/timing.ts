export class ChartTime {
	readonly beat: number;
	readonly timingPoint: TimingPoint;
	readonly time: number;

	constructor(timingPoint: TimingPoint, beat: number){
		this.beat = beat;
		this.timingPoint = timingPoint;
		this.time = this.resolve();
	}

	get snap(): number{
		const remainder = this.beat % 1;

		if(remainder < 0.001){
			return 4;
		}

		if(remainder % (1 / 2) < 0.001){
			return 8;
		}

		if(remainder % (1 / 4) < 0.001){
			return 16;
		}

		return 0;
	}

	resolve(): number{
		const timingPointTime = this.timingPoint.resolve();
		return timingPointTime + this.timingPoint.beatLength * this.beat;
	}
}

export class TimingPoint {
	private readonly parentTime: ChartTime | number;
	readonly time: number;
	readonly bpm: number;
	readonly signature: number = 4;

	get beatLength(): number{
		return 60000 / this.bpm;
	}

	constructor(bpm: number, chartTime: ChartTime | number = 0){
		this.parentTime = chartTime;
		this.bpm = bpm;

		this.time = this.resolve();
	}

	getBeatT(currentTime: number){
		const timeDiff = currentTime - this.time;

		return timeDiff % this.beatLength;
	}

	getMeasureT(currentTime: number){
		const timeDiff = currentTime - this.time;

		return timeDiff % (this.beatLength * this.signature);
	}

	resolve(): number{
		if(this.parentTime instanceof ChartTime){
			return this.parentTime.resolve();
		}

		return this.parentTime;
	}
}