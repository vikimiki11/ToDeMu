class unit {
	clock() {
		if (this.stop == 0) {
			if (this.path === undefined) {
				this.path = gotspecifictarget ? this.pathfinder(this.gtx, this.gty) : this.pathfinder()
			}
			if (path == []) {
				gotspecifictarget ? this.attack(this.gtx, this.gty) : this.attack()
			} else {
				this.goto(this.path)
			}
		} else {
			this.stop--
			if (this.stop < 0) {
				this.stop = 0
				console.warn("in some server unit " + this.name + " went with stop under 0")
			}
		}
	}
	pathfinder() {//ToDo:pathfinder basic unit

	}
	attack(x, y) {//ToDo:attack basic unit

	}
	goto(x, y) {//ToDo:goto basic unit
		if (this.fly) {
			this.stop = this.speed
			this.updatepos()
			setTimeout(() => {
				this.updatepos(x, y)
			}, tick * speed / 2);
			setTimeout(() => {

			}, timeout);
		} else {
			this.stop = Math.ceil(this.speed * Math.sqrt((x - this.x)(x - this.x) + (y - this.y)(y - this.y)))
			console.error("f. goto() for not flying units not done")
			this.x = x
			this.y = y
			this.updatepos(x, y)
		}
	}
	updatepos(x, y) {

	}
	destroyedbuilding(x, y) {
		if (x != this.gtx || y != this.gty) {
			this.path = this.pathfinder()
			this.gotspecifictarget = false
		}
	}
	buildbuilding() {
		this.path = gotspecifictarget ? this.pathfinder(this.gtx, this.gty) : this.pathfinder()
	}
}
exports.unit = unit
exports.template = true