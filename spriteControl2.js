// GameSpriteControl
// BLOCKDROP operation Version 
// (editstart 2024/04/12)

/* --- Functions
//(old compatibility)
.set(num, id, col, w, h)
.setMove = function (num, r, v, aliveTime) 
.pos = function (num, x, y, r, z=0) 
.reset = function (num ) 
.get = function (num) (new)Spitem (set)num
.check = function (num) return num_list
.put = function (num, x, y, r, z) 

//system Method
.manualDraw = function (bool) (modeChange)
.useScreen = function( num )
.setPattern = function (id, Param) 

(2024/04/12-)
//New Function Method
.itemCreate = function(Ptn_id, col=false, w=0, h=0 ) return item
.itemList = function() return SpriteTable
.itemFlash = function()
.itemIndexRefresh = function()
.CollisionCheck = function()

.spriteItem
    .view()/Hide() visible true/false
    .pos = function(x, y, r=0, z=0)
    .move = function(dir, speed, aliveTime)
    .stop = function()
    .dispose = function()
    .put = function (x, y, r, z) 
    //.reset = function()
*/

function GameSpriteControl(g) {
    //
    //let MAXSPRITE = 1000;
    //screen size (colision check)

    let sprite_ = [];
    let pattern_ = [];

    let buffer_;

    let autoDrawMode = true;

    function SpItem(){

        let x_, y_, r_, z_; //z (reserve)
        let vx_, vy_;
        let pr_, colE_, col_;//num, bool, {w,h}
        let id_, count_, pcnt_;//
        let v_, hit_;//visible bool, []
        let alive_, index_, live_;

        function variable_reset(){

            x_=0; y_=0; r_=0; z_=0;
            vx_=0; vy_=0; 
            pr_=0; colE_=true; col_={w:0,h:0};
            id_=""; count_=0; pcnt_=0;
            v_=false; hit_=[];
            alive_=0; index_=0; live_=true;
        }

        variable_reset();
        prop_set();

        //inital
        this.x  = x_; this.y  = y_; this.r  = r_; this.z  = z_;
        this.vx = vx_;this.vy = vy_;
        this.priority = pr_;
        this.collisionEnable = colE_; this.collision = col_;
        this.id = id_;
        this.count = count_; this.pcnt = pcnt_;
        this.visible = v_;
        this.hit = hit_;
        this.alive = alive_; //SetMove Frame Length
        this.index = index_; //index No
        this.living = live_; //Bool true
    
        function prop_set(){
            this.x  = x_; this.y  = y_; this.r  = r_; this.z  = z_;
            this.vx = vx_;this.vy = vy_;
            this.priority = pr_;
            this.collisionEnable = colE_; this.collision = col_;
            this.id = id_;
            this.count = count_; this.pcnt = pcnt_;
            this.visible = v_; this.hit = hit_;
            this.alive = alive_; this.index = index_; 
            this.living = live_;
        }

        this.view = function (){ this.visible = true; }
        this.hide = function (){ this.visible = false;}

        this.pos = function(x, y, r=0, z=0){
            this.x = x; this.y = y; this.r = r; this.z = z;
        }

        this.move = function(dir, speed, aliveTime){
            this.visible = true;
            let wr = ((dir - 90) * (Math.PI / 180.0));
            this.vx = Math.cos(wr)*speed;
            this.vy = Math.sin(wr)*speed; 
            this.r = dir;
            this.alive = aliveTime;
        }
        this.stop = function(){
            this.alive = 0;
            this.vx=0; this.vy=0;
        }
        this.dispose = function(){
            this.alive = 0;
            this.visible = false;
            //上の2つで表示も処理もされなくなる
            this.living = false;
        }
        this.put = function (x, y, r=0, z=1) {
    
            if (!Boolean(pattern_[this.id])){
                buffer_.fillText( this.index + " " + this.count , x, y);
            }else{
                spPut(pattern_[this.id].image, pattern_[this.id].pattern[this.pcnt], x, y, r, z);
                this.count++;
                if (this.count > pattern_[this.id].wait) { this.count = 0; this.pcnt++; }
                if (this.pcnt > pattern_[this.id].pattern.length - 1) { this.pcnt = 0; }
            }
        }
        //内部処理用
        this.reset = function(){
            variable_reset();
            prop_set()
        }
    }
    //New add Methods ============================
    this.itemCreate = function(Ptn_id, col=false, w=0, h=0 ){
        //disposeしたItemがある場合、そこを再利用
        let n = -1;
        for (let i in sprite_){
            if (!sprite_[i].living){n = i;}
        }

        let item;
        if (n == -1){
            item = new SpItem();
            n = sprite_.length;
            sprite_.push(item);
        }

        item = sprite_[n];
        item.reset();
        item.index = n;

        item = id;
        item.count = 0;
        item.pcnt = 0;

        item.collisionEnable = col;
        item.collision = { w: w, h: h };

        //default visible:false alive:0

        return item;
    }
    this.itemList = function(){
        return sprite_; 
        //基本Index＝配列番号のはず      
    }
    this.itemFlash = function(){
        sprite_ = [];
    }
    this.itemIndexRefresh = function(){
        //disposeしたSpItemを削除してIndexを振り直す
        let ar = [];
        for (let i in sprite_) if (sprite_[i].living) ar.push(sprite_[i]);
        for (let i in ar) ar[i].index=i;

        sprite_ = ar;
        return sprite_
    }

    //oldversion ===============================================
    //sprite.set( spPtn ,[priority])
    //  collisisonEnable 
    //  size w,h
    // 
    //return num => new .itemCreate(id, col, w, h)
    this.set = function (num, id, col, w, h) {

        let it = this.itemCreate(id, col, w, h);

        /*
        if (!Boolean(sprite_[num])) {
            sprite_[num] = new SpItem();
        }
        
        sprite_[num].id = id;
        sprite_[num].count = 0;
        sprite_[num].pcnt = 0;

        if (Boolean(col)) {
            
            sprite_[num].collisionEnable = true;
            sprite_[num].collision = { w: w, h: h };
         } else {

            sprite_[num].collisionEnable = false;
        }

        sprite_[num].visible = false;
        */
    }
    //old_version => new sprite_[].move(r, v, aliveTime)
    this.setMove = function (num, r, v, aliveTime) {
        let sw = sprite_[num];

        sw.move(r, v, aliveTime);
        sw.view();
        /*
        let wr = ((r - 90) * (Math.PI / 180.0));

        sw.vx = Math.cos(wr) * v;
        sw.vy = Math.sin(wr) * v;

        //sw.r = r;
        
        sw.visible = true;
        sw.alive = aliveTime;

        sprite_[num] = sw;
        */
    }

    //old_version => new sprite_[].pos(x, y, r, z)
    this.pos = function (num, x, y, r, z) {
        let sw = sprite_[num];

        sw.pos(x, y, r, z);
        sw.view();
        /*
        sw.x = x; sw.y = y; sw.r = r;
        sw.z = z;

        sw.visible = true;

        sprite_[num] = sw;
        */
    }

    //old_version => new sprite_[].stop(); new sprite_[].hide(); sprite_[].collisionEnable = false;
    this.reset = function (num ) {
        let sw = sprite_[num];

        sw.visible = false;
        sw.collisionEnable = false;
        sw.alive = 0;
        sw.vx = 0;
        sw.vy = 0;

        sprite_[num] = sw;
    }

    this.manualDraw = function (bool=true) {

        if (bool) {
            autoDrawMode = false;
        } else {
            autoDrawMode = true;
        }
    }

    this.useScreen = function( num ){
        buffer_ = g.screen[num].buffer;
    }
    //old_version => new sprote_[].put(x, y, r, z);
    this.put = function (num, x, y, r, z) {
        let sw = sprite_[num];
        sw.put(x, y, r, z);
        /*
        sw.x = x;
        sw.y = y;
        sw.r = r;
        sw.z = z;

        if (!Boolean(pattern_[sw.id])){
            buffer_.fillText( num + " " + sw.count , x, y);
        }else{
            spPut(pattern_[sw.id].image, pattern_[sw.id].pattern[sw.pcnt], x, y, r, z);
            sw.count++;
            if (sw.count > pattern_[sw.id].wait) { sw.count = 0; sw.pcnt++; }
            if (sw.pcnt > pattern_[sw.id].pattern.length - 1) { sw.pcnt = 0; }
        }

//        sw.count++;
//        if (sw.count > patten_[id].pattern.length) { sw.count = 0; }
        */
    };
    //old_version => .itemList or ItemCreate ->retrun objItem
    this.get = function (num) {

        if (Boolean(num)) {
            
            if (!Boolean(sprite_[num])) {
                sprite_[num] = new SpItem();
            }
            return sprite_[num];

        } else {
            
            let rc = -1;
            for (let i in sprite_) {
                if (!sprite_[i].visible) {
                    rc = i;
                }
            }
            if (rc == -1) {
                rc = sprite_.length;
            }

            return rc;
        }
    }

    this.setPattern = function (id, Param) {
        
        pattern_[id] = { image: g.asset.image[ Param.image ].img, wait:Param.wait, pattern:Param.pattern }
        
    }
    //old_version (1:N) colcheck return numlist
    this.check = function (num) {

        //collisionTest
        let checktarget = [];

        for (let i in sprite_) {
            let sw = sprite_[i];

            if (sw.visible) {
                if (sw.collisionEnable) {
                    checktarget.push(i);
                }
            }
        }

        let ary = [];

        let my = {
            x: sprite_[num].x,
            y: sprite_[num].y,
            w: sprite_[num].collision.w / 2,
            h: sprite_[num].collision.h / 2
        };

        for (let i = 0, loopend = checktarget.length; i < loopend; i++) {

            if (num != checktarget[i]) {
                let tgt = {
                    x: sprite_[checktarget[i]].x, y: sprite_[checktarget[i]].y,
                    w: sprite_[checktarget[i]].collision.w / 2, h: sprite_[checktarget[i]].collision.h / 2
                }

                if ((Math.abs(my.x - tgt.x) < my.w + tgt.w)
                    && (Math.abs(my.y - tgt.y) < my.h + tgt.h)) {

                    ary.push(checktarget[i]);
                }
            }
        }

        //返すのはスプライト番号だけにするか、スプライトオブジェクトを返すべきか？
        //ひとまずスプライト番号のリストを返すこととする。（扱いにくい場合は再度調整）
        return ary;
    }
    //FullCheck return spitem[].hit(array)<-obj
    this.CollisionCheck = function(){
        //総当たりなのでパフォーマンス不足の場合は書き換える必要有。
        let checklist = [];
        for (let i in sprite_) {
            let sp = sprite_[i];
            if (sp.living){//visibleではない場合での当たり判定有の場合がある可能性を考えて処理
                if (sw.collisionEnable) {
                    checklist.push(sp);
                }
            }
        }
        for(let i in checklist){
            let ssp = checklist[i];
            ssp.hit = [];
            for(let j in checklist){
                if (!(i == j)){
                    let dsp = checklist(j);

                    if ((Math.abs(ssp.x - dsp.x) < ((ssp.collision.w/2) + (dsp.collision.w/2)))
                        && (Math.abs(ssp.y - dsp.y) < ((ssp.collision.h/2) + (dsp.collision.h/2)))) {
                            ssp.hit.push(dsp);
                    }
                }
            }
        }
    }

    //Inner Draw Control Functions
    function spPut(img, d, x, y, r, z, alpha) {

        //let simple = true;

        if (!Boolean(r)) { r = d.r; }
        if (!Boolean(alpha)) { alpha = 255; }
        if (!Boolean(z)) { z = 1.0; }

        let simple = ((!d.fv) && (!d.fh) && (r == 0) && (alpha == 255));

        //let simple = false;
        if (simple) {
            buffer_.drawImgXYWHXYWH(
                img,
                d.x, d.y, d.w, d.h,
                x + (-d.w / 2) * z,
                y + (-d.h / 2) * z,
                d.w * z,
                d.h * z
            );

        } else {

            let FlipV = d.fv?-1.0:1.0;
            let FlipH = d.fh?-1.0:1.0;

            buffer_.spPut(
                img,
                d.x, d.y, d.w, d.h,
                (-d.w / 2) * z,
                (-d.h / 2) * z,
                d.w * z,
                d.h * z,
                FlipH, 0, 0, FlipV,
                x, y,
                alpha, r
            );

            //buffer_.fillText(r+" ", x, y);
        }
    }

    //Game System inner Draw Call Function
    const pbuf = new priorityBuffer();

    this.allDrawSprite = function () {

        if (autoDrawMode) {
            pbuf.reset();
            for (let i in sprite_) {
                let o = sprite_[i];
                if (o.living) {
                    //if (dev.gs.in_stage(o.x, o.y)){
                    //画面内であることのチェックはシステム側にないので保留)
                    pbuf.add(o);
                }
            }
            pbuf.sort();
            let wo = pbuf.buffer();
            console.log("pbuf:" + wo.length);

            for (let i in wo) {
                let sw = wo[i];

                if (sw.alive > 0) {
                    sw.alive--;

                    sw.x += sw.vx;
                    sw.y += sw.vy;

                    if (sw.alive <= 0) {
                        sw.visible = false;
                    }else{
                        sw.visible = true;
                    }
                }

                //buffer_.fillText(i + " " + sw.visible, sw.x, sw.y);
                if (sw.visible) {
                    if (!Boolean(pattern_[sw.id])) {
                        buffer_.fillText(i + " " + sw.count, sw.x, sw.y);
                    } else {
                        spPut(pattern_[sw.id].image, pattern_[sw.id].pattern[sw.pcnt], sw.x, sw.y, sw.r, sw.z);
                        sw.count++;
                        if (sw.count > pattern_[sw.id].wait) { sw.count = 0; sw.pcnt++; }
                        if (sw.pcnt > pattern_[sw.id].pattern.length - 1) { sw.pcnt = 0; }
                        console.log("ads:" + i);
                    }
                }
            }
        }
    }
    //priorityBufferControl
    //表示プライオリティ制御
    function priorityBuffer(){
        // .Priorityでソートして表示
        // 0が一番奥で大きい方が手前に表示される(allDrawSpriteにて有効)
        let inbuf = [];
        this.add     =( obj )=>{ inbuf.push(obj);}
        this.sort    =() =>    { inbuf.sort((a,b)=> a.priority - b.priority );}
        this.buffer  =()=>     { return inbuf; }
        this.reset   =()=>     { inbuf = []; }
    }
}