temp = require("./basicunit.js").unit
class BOIII extends temp {
	constructor(x, y, gtx, gty) {
		super()
		//ToDo: DOM For units
		//basic
		this.name = "BOIII"
		this.hp = 100//health points
		this.img = "img/BOIII.png"//place of image of unit
		this.x = x
		this.y = y
		//movement
		this.speed = 20 //after hom many ticks unit go to other place. kinda 1/v or t/s
		this.fly = false //can fly over building(some turrets can attack at this unit and others can)
		//attack
		this.canattackbuildings = false
		this.canattackbase = true
		this.gotspecifictarget = true
		this.typeofattack = "cannon" //cannon or beam
		this.cannonimg = "img/pewpew.png" //img for cannon ball(only when typeofattack="cannon")
		this.beamcolor = "rgba()"//css format color that sets color of beam(only when typeofattack="beam")
		this.damage = 10
		this.firerate = 4 //sets after how many tick units attacks
		//don't touch if you don't know what it does
		this.maxhp=this.hp
		this.gtx = gtx
		this.gty = gty
		this.idle = true
		this.path = undefined
		this.css = "background-image:" + this.img + ";\ntransform:translate(-50%,-50%);"
		this.stop = 0
	}
}
exports.template = false//keep here false to load unit 
exports.name = "BOIII"
exports.object = BOIII