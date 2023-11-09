export class TimelineClock{
	private isRunning: boolean = false;
	private startTime: number = 0;
	private timeAtStop: number = 0;

	set time(value: number){
		this.startTime = performance.now() - value;
		this.timeAtStop = value;
	}

	get time(): number{
		if(!this.isRunning){
			return this.timeAtStop;
		}

		return performance.now() - this.startTime;
	}

	start() {
		if (this.isRunning) {
			return;
		}

		this.startTime = performance.now() - this.timeAtStop;
		this.isRunning = true;
	}

	stop(){
		this.timeAtStop = this.time;
		this.isRunning = false;
	}

	reset(){
		this.isRunning = false;
		this.startTime = 0;
		this.timeAtStop = 0;
	}
}
