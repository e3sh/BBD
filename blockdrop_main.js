// main BLOCKDROP
//----------------------------------------------------------------------
function main() {

    let sysParam = {
		canvasId: "layer0",
        screen: [ 
			{ resolution: { w: 1024, h: 768 , x:0, y:0 } }
        ]
	}

	let game = new GameCore( sysParam );

	//let gpad = new inputGamepad2();
	//let spc = new GameSpriteControl2(game);

	//game.gamepad = gpad;
	//game.sprite = spc;

    //Game Asset Setup
	pictdata(game);

	let spfd = SpriteFontData();
	for (let i in spfd) {
	    game.setSpFont(spfd[i]);
	}
    
    //Game Task Setup
	game.task.add(new GameTask_Main("main"));

	//
	game.screen[0].setBackgroundcolor("Navy"); 
    game.screen[0].setInterval(1); 
    
	game.run();
}

//----------------------------------------------------------------------
// SpriteFontData
function SpriteFontData() {

	let sp_ch_ptn = [];

    for (let i = 0; i < 7; i++) {
        for (j = 0; j < 16; j++) {
            ptn = {
                x: 12 * j,
                y: 16 * i,
                w: 12,
                h: 16
            }

            sp_ch_ptn.push(ptn);
        }
    }
    //12_16_font

    let sp8 = []; //spchrptn8(color)
    let cname = ["white", "red", "green", "blue"];

    for (let t = 0; t <= 3; t++) {

        let ch = [];

        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < 16; j++) {
                ptn = {
                    x: 8 * j + ((t % 2 == 0) ? 0 : 128),
                    y: 8 * i + 128 + ((t >= 2) ? 64 : 0),
                    w: 8,
                    h: 8
                };
                ch.push(ptn);
            }
        }
        sp8[ cname[t] ] = ch;
    }
    //↑↑

    return [
        { name: "std"     , id: "SPGraph", pattern: sp_ch_ptn }
        ,{ name: "8x8red"  , id: "SPGraph", pattern: sp8["red"] }
        ,{ name: "8x8green", id: "SPGraph", pattern: sp8["green"] }
        ,{ name: "8x8blue" , id: "SPGraph", pattern: sp8["blue"] }
		,{ name: "8x8white", id: "SPGraph", pattern: sp8["white"] }

    ]
}

// ----------------------------------------------------------------------
// GameTask
class GameTask_Main extends GameTask {

	_i = 0;
	_x = 0;	_y = 0;
	_sk = ""; _sm = {}; _sc = ""; //KEYBOARD TEXT,MOUSE TEXT, COLISION TEXT
	_tc = 0; _dt = ""; _dc = 1;   //DELAYTIME ,DELTATIME TEXT/ DESTROYBLOCKCOUNT
	_dtt = 0;//DELAYTRIGGER
	_sp = []; //SPRITETABLE
	_block; _bbam; _bhtm; //BLOCK,BLOCKBREAKAFTERMAP,BLOCKHITMAP
	_ene; //Power
	_result; //GameResult SCORE/ TIME etc 
	_titlef;
	titlewait;
	
	_wh = 0;//wheel

	scene;

	_dv;
	
	constructor(id){
		super(id);
	}
//----------------------------------------------------------------------
	pre(g){// 最初の実行時に実行。
		this.scene = [];

		this.scene[	"Game"	] = new SceneGame();
		this.scene[	"UI"	] = new SceneGameUI();
		this.scene[	"Debug"	] = new SceneDebug();
		this.scene[	"Result"] = new SceneResult();
		this.scene["GameOver"] = new SceneGameOver();
		this.scene[	"Title"	] = new SceneTitle();
		this.scene[	"Gpad"	] = new SceneGPad();

		
 	    //g.font["8x8white"].useScreen(1);

	    g.sprite.setPattern("Player", {
	        image: "SPGraph",
	        wait: 0,
	        pattern: [
                { x:224, y: 0, w: 32, h: 32, r: 0, fv: false, fh: false }
	            ]
	        }
        )

	    g.sprite.setPattern("Enemy", {
	        image: "SPGraph",
	        wait: 10,
	        pattern: [
                { x:224, y: 32, w: 32, h: 32, r: 0, fv: false, fh: false }
                ,{ x:224, y: 64, w: 32, h: 32, r: 0, fv: false, fh: false }
                ,{ x:224, y: 96, w: 32, h: 32, r: 0, fv: false, fh: false }
	            ]
    	    }
        )

	    g.sprite.setPattern( "dummy",  {
	        image: "SPGraph",
	        wait: 10,
	        pattern: [
                { x:224, y: 32, w: 32, h: 32, r: 0, fv: false, fh: false }
                ,{ x:224, y: 64, w: 32, h: 32, r: 0, fv: false, fh: false }
                ,{ x:224, y: 96, w: 32, h: 32, r: 0, fv: false, fh: false }
 	            ]
    	    }
	    )

	    g.sprite.setPattern("block", {
	        image: "SPGraph",
	        wait: 0,
	        pattern: [
                { x: 0, y: 0, w: 2, h: 2, r: 0, fv: false, fh: false }
	            ]
	        }
        )
	    g.sprite.set(0, "Player", true, 32, 32);

		this.scene["Game"].init(g);
		this._initGame(g);
		this._sm = {x:0, y:0, old_x:0, old_y:0};
	}

	_resetblock(sw){
		const ROW = 32;
		const COL = 25;

		let blk = new Array(COL);
		for (let j=0; j<COL; j++){
			blk[j] = new Array(ROW);
			for (let i=0; i<ROW; i++){
				blk[j][i] = {}//new sw;
				blk[j][i].on = sw.on;
				blk[j][i].break = sw.break;
				blk[j][i].hit = sw.hit;
			}
			//blk[j].fill(sw);
		}
		//alert(blk);
		return blk;
	}
	
	_initGame(g){
		this.scene["Game"].reset(g);
		this._titlef = true;
		this.titlewait = g.time()+1000;

	}
//----------------------------------------------------------------------
	step(g){// this.enable が true時にループ毎に実行される。

	    let w = g.keyboard.check();

        if (Boolean(w[70])) {//[f]key Fullscreen
            if (w[70]){
                if (!document.fullscreenElement){ 
                    //g.systemCanvas.requestFullscreen();
					//FULLSCREENにするとマウス座標が一致しなくなる
               }
            }
        }

		let akey = false; if (Boolean(w[65])) {if (w[65]) akey = true;}
		let dkey = false; if (Boolean(w[68])) {if (w[68]) dkey = true;}
		let pkey = false; if (Boolean(w[80])) {if (w[80]) pkey = true;}

		let r = g.gamepad.check();

		let lb = g.gamepad.btn_lb;
		let rb = g.gamepad.btn_rb;
		let abtn = g.gamepad.btn_a;
		let xbtn = g.gamepad.btn_x;
		let axes = g.gamepad.axes;

	    let mstate = g.mouse.check();

		if ((mstate.x != this._sm.old_x)||(mstate.x != this._sm.old_x)){
			this._x = mstate.x;
			this._y = mstate.y;
			this._sm.old_x = mstate.x;
			this._sm.old_y = mstate.y;
		}else{
			if (r){
				let vx = Math.trunc(axes[0]*30);
				let vy = Math.trunc(axes[1]*30);

				vx = (Math.abs(vx) > 3)? vx:0; vy = (Math.abs(vy) > 3)?vy:0; //StickのDrift対応　閾値10％

				this._x = this._x + vx;
				this._y = this._y + vy;
			}
		}

		let whl = false; 
		let whr = false; 
		if (mstate.wheel != 0) {
			whl = (Math.sign(mstate.wheel)<0)?true:false;
			whr = (Math.sign(mstate.wheel)>0)?true:false;
		}
		
		if (this._x < 32)		this._x = 32;
		if (this._x > 1024-32)	this._x = 1024-32;
		if (this._y < 32)		this._y	= 32;
		if (this._y >768-32)	this._y = 768-32;

		let leftbutton = (akey || lb || whl);
		let rightbutton = (dkey || rb || whr);
		let trigger = (abtn || xbtn || (mstate.button == 0));

		let input = {x: this._x, y:this._y, trigger: trigger, left: leftbutton, right: rightbutton}

		let param = this.scene["Game"].state();
		this._result = param.result;

		if (this._titlef){
			param.block = 0; param.sprite = 0;
			if (this.scene["Title"].step(g, input, {delay: this.titlewait} )){
				this._titlef = false; 
			}
		}else if (param.gameover){
			if (this.scene["GameOver"].step(g, input, param)){
				this._initGame(g);
			};
		} else 	this.scene["Game"].step(g, input);
 

		this.scene["UI"].step(g, input, param);
		this.scene["Debug"].step(g, input, param);

		this._dv = (pkey)?true:false;
		if (this._dv) this.scene["Gpad"].step(g, input, param);

	}
//----------------------------------------------------------------------
	draw(g){// this.visible が true時にループ毎に実行される。

		if (!this._titlef)this.scene["Game"].draw(g);
		if (!this._titlef) this.scene["UI"].draw(g);
		this.scene["Debug"].draw(g);
	
		if (this._result.clrf) this.scene["Result"].draw(g);
		if (this._result.govf) this.scene["GameOver"].draw(g);
		if (this._titlef) this.scene["Title"].draw(g);
		if (this._dv) this.scene["Gpad"].draw(g);
	}
}
//----------------------------------------------------------------------
//Scene
//----------------------------------------------------------------------
// GameMain
function SceneGame(){

	const ROW = 32;
	const COL = 25;

	let player = {r:0, vr:0, x:0, y:0, trgger_delay:0};
	let spriteTable;
	let block;
	let result;
	let delay;
	let trig_wait;
	let stagetime;

	let blkcnt;

	let ene;
	let watchdog;

	function step_running_check(){
		let stepc;
		let store;

		this.run = function(){
			stepc++;
		}
		this.set = function(){
			store = 0; 
			stepc = 0;
		}
		this.check = function(){
			return (stepc != store);
		}
	}

	this.state = function() {

		return {
			ene: ene
			,result: result
			,time: stagetime
			,stage: result.stage
			,score: result.score
			,delay: delay
			,block: blkcnt
			,collision: 0
			,sprite: spriteTable.length
			,clear: result.clrf
			,gameover: result.govf
		};
	}

	this.init = function(g){
		watchdog = new step_running_check();

		spriteTable = [];
		this.reset(g);
	}

	this.reset = function(g){
		g.sprite.set(0, "Player", true, 32, 32);
		g.sprite.pos(0, 0, 0, 0, 0.01);
		block = resetblock({on:true, break:false, hit:false});

		for ( let i in block[24]){
			block[24][i].break = true;
		}

		for (let i in this.spriteTable){
			spriteTable[i].visible = false;
		}

		player = {r:0, vr:0, x:0, y:0, trgger_delay:0};
		ene = {now:1000,max:1000,before: this.now};
		result = {score:0, time:g.time(), stage:1, clrf:false, govf:false};

		delay = 0;
		trig_wait = 0;
	}

	function resetblock(sw){

		let blk = new Array(COL);
		for (let j=0; j<COL; j++){
			blk[j] = new Array(ROW);
			for (let i=0; i<ROW; i++){
				blk[j][i] = {}//new sw;
				blk[j][i].on = sw.on;
				blk[j][i].break = sw.break;
				blk[j][i].hit = sw.hit;
			}
		}
		return blk;
	}

	this.step = function(g, input, param){

		let x = input.x;
		let y = input.y;
		let trigger = input.trigger;
		let lb = input.left;
		let rb = input.right;

		stagetime = Math.trunc((g.time() - result.time)/100);
	
		if (trigger) {
			if (trig_wait < g.time()){
				trig_wait = g.time()+250;

				let n = g.sprite.get();//空値の場合は未使用スプライトの番号を返す。
				g.sprite.set(n, "Enemy", true, 32, 32);

				let px = x + Math.cos((Math.PI/180)*player.r)*48
				let py = y + Math.sin((Math.PI/180)*player.r)*48 

				g.sprite.pos(n, px, py, 0, 0.6 );
				g.sprite.setMove(n, (player.r+90)% 360, 8, 3000);// number, r, speed, lifetime//3kf 5min
				spriteTable.push(g.sprite.get(n));
			}
		}

		player.x = x;
		player.y = y;

		if (lb)	player.r-=4; 
		if (rb)	player.r+=4;
		
		if (delay < g.time()) {

			delay = g.time()+500;
			spriteTable = flashsp(spriteTable);

			ene.before = ene.now;
			result.clrf = false; 

			if (blkcnt <=0){ //Stage Clear;
				let b = (10000-(g.time()-result.time));
				
				result.score += (b < 0)?100: b+100;//SCORE
				result.time = g.time();
				result.stage ++;

				block = resetblock({on:true, break:false, hit:false});
				for ( let i in block[24]){
					block[24][i].break = true;
				}

				ene.now = (ene.now +30>ene.max)?ene.max:ene.now +30;//ENERGY

				result.clrf = true; 
				delay = g.time()+1500;//MESSAGE WAIT
			}
			if (ene.now <=0){ //Game Over;

				g.sprite.reset(0);

				delay = g.time()+3000;//MESSAGE WAIT
				ene.now = 0;
				result.govf = true; 
			}
		}

		for (let i=0; i<=0; i++){
			let c = g.sprite.check(i);//対象のSpriteに衝突しているSpriteNoを返す

			for (let lp in c) {
				let spitem = g.sprite.get(c[lp]);//SpNo指定の場合は、SpriteItem
				if (spitem.id == "Enemy"){
					spitem.vx = spitem.vx*-1;//.05;
					spitem.vy = spitem.vy*-1;//.05;
				}
				ene.now--;
				//spItemのrは更新されない(undefined):2024/04/08時点のバグ/coremin.js) 
			}
		}

		spriteTable = flashsp(spriteTable);
		function flashsp(s){
			let ar = new Array(0);
			for (let i in s){
				let p = s[i];
				if ((p.x < 0)||(p.x > 1024)||(p.y < 0)||(p.y>768)) {//p.visible = false;

					if ((p.x < 0)||(p.x > 1024)) p.vx *=-1;//.05;
					if ((p.y < 0)||(p.y>768)) p.visible = false;//p.vy *=-1.05;

					if (p.x < 0) p.x = 0;
					if (p.x > 1024) p.x = 1024;
					if (p.y < 0) p.y = 0;
					if (p.y>768) p.y = 768;

				}
				if (p.visible) ar.push(s[i]);
			}
			return ar;
		}
		//---------------------breakcheck(block sprite hit check
		for (let i in spriteTable){
			let p = spriteTable[i];
			let cx = Math.trunc(p.x/32);
			let cy = Math.trunc(p.y/32);
			if (cy < block.length){
				if (cx < block[cy].length){
					if (block[cy][cx].on){
						if (p.id == "Enemy"){
							block[cy][cx].on = false;
							block[cy][cx].break = true;
							block[cy][cx].hit = true;

							if (p.beforehit){
								p.vx = p.vx*-1;//.05
								p.vy = p.vy*-1;//.05;
							}else{
								if (Math.abs(p.vx) >= Math.abs(p.vy)) p.vx = p.vx*-1;//.05
								if (Math.abs(p.vx) <= Math.abs(p.vy)) p.vy = p.vy*-1;//.05;
							}
							p.beforehit = true;

							result.score ++;
						}else{
							if (p.id == "block"){
								if (cy>=1){
								block[cy-1][cx].on = true;
								block[cy-1][cx].break = false;
								//this._bhtm[cy-1][cx] = false;
								p.visible = false;
								}
							}
						}
					}else{
						p.beforehit = false;
					}
				}
			}
		}
		//-scan
		
		let f = false;
		let c = []; 
		for (let i=0; i<ROW; i++){
			for (let j=COL-1; j>=0; j--){
				if (block[j][i].on){
						if (!f){
							c.push({x:i,y:j});
						}
						f = true;
					}else{
						//this._block.break[j][i] = true;		
						f = false;
					continue;
				}	
			}
		}
		/*
		for (let i in c){
			if (!this._block.break[c[i].y][c[i].x]){
				this._block.break[c[i].y][c[i].x] = true;
			}else{
				delete c[i];
			}
		}
		*/
		for (let i in c){
			if (!block[c[i].y][c[i].x].break){
				block[c[i].y][c[i].x].break = true;
				block[c[i].y][c[i].x].on = false;
				let n = g.sprite.get();//空値の場合は未使用スプライトの番号を返す。
				g.sprite.set(n, "block", true, 32, 32);
				g.sprite.pos(n, c[i].x*32, c[i].y*32+32);
				g.sprite.setMove(n, 180, 6, 500);// number, r, speed, lifetime
				spriteTable.push(g.sprite.get(n));
			}
		}
		watchdog.run();
	}

	this.draw = function(g){

		let wdt = watchdog.check();

		if (!result.govf){
			g.sprite.pos(0, player.x, player.y,  (player.r+90)% 360, 1);

		}

	    //g.sprite.pos(0, this._x, this._y,  (this._i+90)% 360, 1);

		let l = (Math.trunc(g.time()/100)%2);
		blkcnt = 0;
		for (let i=0; i<32; i++){
			for (let j=0; j<24; j++){
				if (block[j][i].on){
					if (true){
						g.screen[0].fill(i*32,j*32+8,31,23,"rgb(" + (i*8)%256 + "," + (j*8)%256 + ",255)");
					}else{
						g.screen[0].fill(i*32,j*32+8,31,23,"rgb(" + (i*8)%256 + "," + (j*8)%256 + ",255)");
					}
					blkcnt++;
				}
				if ((!block[j][i].break)&&(!block[j][i].hit)){
					if (true){
						g.screen[0].fill(i*32+4,j*32,23,7,"rgb(" + (i*8)%256 + "," + (j*8)%256 + ",255)");
					}else{
						g.screen[0].fill(i*32+3,j*32,23,7,"rgb(" + (i*8)%256 + "," + (j*8)%256 + ",255)");
					}
					//g.screen[0].fill(i*32,j*32,15,15,"rgb(" + (i*8)%64 + "," + (j*8)%64 + ",127)");
				}
				if (block[j][i].hit){
					if (l==0){
						g.screen[0].fill(i*32+15,j*32+2,3,2,"rgb(" + (i*8)%64+128 + "," + (j*8)%64+128 + ",127)");
					}else{
						g.screen[0].fill(i*32+16,j*32+2,2,2,"rgb(" + (i*8)%64+128 + "," + (j*8)%64+128 + ",127)");
					}
					//g.screen[0].fill(i*32+14,j*32+2,4,2,"rgb(" + (i*8)%64+128 + "," + (j*8)%64+128 + ",127)");
				}
			}
		}

		for (let i in spriteTable){
			let p = spriteTable[i];
			if (p.id == "block"){
				g.screen[0].fill(p.x,p.y-32,31,23,"white");
				g.screen[0].fill(p.x+1,p.y-31,29,21,"rgb(" + (Math.trunc(p.x/32)*8)%256 + "," + (Math.trunc((p.y-32)/32)*8)%256 + ",255)");
			}
		}

		if (wdt){//watchdog.check()){
			if ((ene.now != ene.before)&&(ene.now >0)){
				let w = {x:player.x, y:player.y, c:((ene.now/ene.max)<0.2)?"red":"yellow"
					, draw(dev){
						dev.beginPath();
						dev.strokeStyle = this.c;
						dev.lineWidth = 4;
						dev.arc(this.x, this.y, 32, 0, 2 * Math.PI, false);
						dev.stroke();
					} 
				}
				g.screen[0].putFunc(w);
				//g.screen[0].fill(this._x-32, this._y-32, 64 ,64,"yellow");
			}
		}
		//g.screen[0].fill(player.x, player.y, 32,32,(watchdog.check())?"cyan":"red");
		watchdog.set();
	}
}
//----------------------------------------------------------------------
// UI
function SceneGameUI(){

	const X = 0;
	const Y = 0;
	const BAR_Y = 32;

	let ene;
	let result;
	let time;

	this.step = function(g, input, p){

		ene = p.ene;
		result = p.result;
		time = p.time
	}
	this.draw = function(g){

		const BAR_Y = 32;
		g.screen[0].fill(X	,Y+BAR_Y  ,1024,16,"white");
		g.screen[0].fill(X+1,Y+BAR_Y+1,1022,14,"black");
		g.screen[0].fill(X+1,Y+BAR_Y+1,1022*(ene.before	/ene.max), 14,"yellow");
		g.screen[0].fill(X+1,Y+BAR_Y+1,1022*(ene.now	/ene.max), 14,((ene.now/ene.max)<0.2)?"red":"cyan");

		g.font["std"].putchr("ENERGY:" + ene.now + " SCORE:" + Math.trunc(result.score) + " STAGE:" + result.stage + " TIME:" + time, X, Y);
	}
}
//----------------------------------------------------------------------
// TitleScene
function SceneResult(){

	const X = 1024/2-150;
	const Y = 768/2;

	this.step = function(g, input){
		//Non Process (Draw Only)

	}
	this.draw = function(g){

		g.font["std"].putchr("STAGE CLEAR", X, Y, 2.5);
	}
}
//----------------------------------------------------------------------
// TitleScene
function SceneTitle(){

	const X = 1024/2;
	const Y = 768/2;

	let inp;

	this.step = function(g, input, p){
		inp = input;

		delay = ((p.delay - g.time()) <0);

		let rf = false;
		if (delay){
			if (input.trigger) rf = true;
		}	
		return rf;
	}
	this.draw = function(g){

		g.font["std"].putchr("THEME BLOCK/BALLANCE(DONICHI THREAD16)", X-200, Y-116);
		g.screen[0].putImage(g.asset.image["title"].img,X-250, Y-100	);
		g.font["std"].putchr("START MOUSE BUTTON",		X-200, Y+50	, 2.0);
		g.font["std"].putchr("or GamePad Button X/A",	X-100, Y+70		);
		
	}
}
//----------------------------------------------------------------------
// GameOverScene
function SceneGameOver(){

	const X = 1024/2;
	const Y = 768/2;

	let stage;
	let score;
	let delay;

	this.step = function(g, input, p){

		stage = p.stage;
		score = Math.trunc(p.score);
		delay = ((p.delay - g.time()) <0);

		if (delay){
			if (input.trigger){
				return true;
			};
		}
	}
	this.draw = function(g){

		g.font["std"	].putchr("GAME OVER",		 X-200, Y-50, 4.0);
		g.font["std"	].putchr("STAGE:" + stage,	 X-80, Y, 2.0);
		g.font["std"	].putchr("SCORE:" + score, X-80, Y+30, 2.0);
		g.font["8x8white"].putchr(":" + (delay?"OK":"WAIT") , X+120, Y);
	}
}
//----------------------------------------------------------------------
// DEBUGScene
function SceneDebug(){

	const X = 1024 - 100;
	const Y = 0;

	let block;
	let deltatime;
	let collision;
	let sprite;
	let input;

	this.step = function(g, i, p){

		block	= p.block;
		deltatime= g.deltaTime().toString().substring(0, 5);
		collision= p.collision;
		sprite	= p.sprite;
		input = i;
	}
	this.draw = function(g){

		g.screen[0].fill(1024 - 100, 0,100,32,"black");

		g.font["8x8white"	].putchr("block:"	 + block	,X, Y+24);
		g.font["8x8white"	].putchr("DeltaT:"	 + deltatime,X, Y	);
		g.font["8x8red"		].putchr("Sprite:"	 + sprite	,X, Y+ 8);
		let T = (input.trigger)?"T":"-";
		let L = (input.left)?"L":"-";
		let R = (input.right)?"R":"-";
		g.font["8x8green"	].putchr("Input:" + T + ":" + L + ":" + R , X, Y+16);
	}
}
//----------------------------------------------------------------------
// GPadScene
function SceneGPad(){

	const X = 0;
	const Y = 48;

	let st;

	this.step = function(g, i, p){

		st = g.gamepad.infodraw()
	}
	this.draw = function(g){

		for (let i in st){
			g.font["8x8white"].putchr(st[i],X, Y+i*8);
		}
	}
}

//----------------------------------------------------------------------
//Image Asset Setup
function pictdata(g){
	g.asset.imageLoad( "SPGraph","pict/cha.png"	);
	g.asset.imageLoad( "title","pict/TitleLogo.png" );
}