temp = require("./basicbuilding.js").building
class Base extends temp {
	constructor(x, y) {
		super()
		//basic
		this.max = 1//sets maximum number of buildings
		this.name = "Base"
		this.hp = 100//health points
		this.img = "img/Base.png"//place of image of buildings
		this.icon = "img/Base.png"//icon i buy menu
		this.x = x
		this.y = y
		this.cost = 0
		this.moneygen = 50//after how many secconds  building generate money
		this.buymenu = ["hp;HP", "damage;Damage", "firerate;Fire rate", "range;Range"]//wat stats should be shown and under wat name
		//attack
		this.range = 2 //fire range
		this.splash = true //attack all units on one field
		this.attacktodensefilds = true //attack to fild with most units(good to set on things with this.splash = true)
		this.canattackfly = true //can attack flying units
		this.canattackground = true //can attack units on ground
		this.typeofattack = "beam" //cannon or beam
		this.cannonimg = "img/pewpew.png" //img for cannon ball(only when typeofattack="cannon")
		this.beamcolor = "rgba(255,255,255,0.8)"//css format color that sets color of beam(only when typeofattack="beam")
		this.damage = 10
		this.firerate = 4 //sets after how many tick buildings attacks
		//don't touch if you don't know what it does
		this.maxhp = this.hp
		this.css = "#"+this.name+"{\nbackground-image:" + this.img + ";\ntransform:translate(-50%,-50%);\n}"
		this.stop = 0
		this.rangearray = this.rangetoarray(this.range)
	}
}
exports.template = false
exports.name = "Base"
exports.object = Base
exports.placement = ["ground"]//array of typs of fields you can place this building
exports.css = "#Base{\nbackground-image:" + this.img + ";\ntransform:translate(-50%,-50%);\n}"