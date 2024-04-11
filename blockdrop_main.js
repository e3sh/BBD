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
	}
//----------------------------------------------------------------------
	draw(g){// this.visible が true時にループ毎に実行される。

		this.scene["Game"].draw(g);
		this.scene["UI"].draw(g);
		this.scene["Debug"].draw(g);
	
		if (this._result.clrf) this.scene["Result"].draw(g);
		if (this._result.govf) this.scene["GameOver"].draw(g);
		if (this._titlef) this.scene["Title"].draw(g);
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
		g.sprite.pos(0, 0, 0, 0, 1);
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

		if (!result.govf){
			g.sprite.pos(0, player.x, player.y,  (player.r+90)% 360, 1);

		}

	    //g.sprite.pos(0, this._x, this._y,  (this._i+90)% 360, 1);

		blkcnt = 0;
		for (let i=0; i<32; i++){
			for (let j=0; j<24; j++){
				if (block[j][i].on){
					g.screen[0].fill(i*32,j*32+8,31,23,"rgb(" + (i*8)%256 + "," + (j*8)%256 + ",255)");
					blkcnt++;
				}
				if ((!block[j][i].break)&&(!block[j][i].hit)){
					g.screen[0].fill(i*32+8,j*32,16,7,"rgb(" + (i*8)%256 + "," + (j*8)%256 + ",255)");
					//g.screen[0].fill(i*32,j*32,15,15,"rgb(" + (i*8)%64 + "," + (j*8)%64 + ",127)");
				}
				if (block[j][i].hit){
					g.screen[0].fill(i*32+14,j*32+2,4,2,"rgb(" + (i*8)%64+128 + "," + (j*8)%64+128 + ",127)");
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

		if (watchdog.check()){
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
//Image Asset Setup
function pictdata(g){

	g.asset.imageLoad( "SPGraph"
	,"data:image/png;base64,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"
	);
	g.asset.imageLoad( "title"
	,"data:image/png;base64,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"
	 );
}