class building {
	clock() {
		if (this.stop == 0) {
			this.attack()
		} else {
			this.stop--
			if (this.stop < 0) {
				this.stop = 0
				console.warn("in some server building " + this.name + " went with stop under 0")
			}
		}
	}
	/* attack(x, y) {//ToDo: after grid is done
		for (i in ret) {

		}
	} */
	rangetoarray(r) {
		/* ret = [] */
		for (let i = 1; i < r; i++) {
			for (let y = 1; Math.sqrt(i * i + y * y) < r; i++) {
				if (false) {
					ret[ret.length] = []//ToDo: after grid is done
				}
			}
		}
	}
	destroyed() {

	}
	attack() {

	}
}
exports.building = building
exports.template = true