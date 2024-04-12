function inputGamepad2(){

    var support = (window.Gamepad); //Support Gamepad API
    var connect = (navigator.getGamepads); //GamePad Ready

    var gamepad_list// = navigator.getGamepads();

    this.upkey;// = false;
    this.downkey;// = false;
    this.leftkey = false;
    this.rightkey = false;

    this.btn_start = false;
    this.btn_back = false;
    this.btn_lb = false;
    this.btn_rb = false;
    this.btn_lt = false;
    this.btn_rt = false;
    this.btn_l3 = false;
    this.btn_r3 = false;

    this.btn_a = false;
    this.btn_b = false;
    this.btn_x = false;
    this.btn_y = false;

    this.r; //-1:off 0-360:input_r leftstick 

    this.ls_x; //axes[0]
    this.ls_y; //axes[1]
    this.rs_x; //axes[2]
    this.rs_y; //axes[3]

    var readystate = false;

    this.button;
    this.axes;

    this.check = function(){
        readystate = false;
        
        if (!(support && connect)) return false;

        gamepad_list = navigator.getGamepads();
        var gamepad = gamepad_list[0];

        if(!gamepad) return false;
        readystate = true;

        this.update(gamepad);

        return readystate;  
    }

    //↓これは基本外部から使用しない↓
    //差し替えでGamepadのハード別対応させることが出来る。
    this.update = function( gamepad ){
        //paramater:
        //id: "Logicool Dual Action (STANDARD GAMEPAD Vendor: 046d Product: c216)"
        //mapping: "standard"
        var p = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

        //id: "Xbox 360 Controller (XInput STANDARD GAMEPAD)"
        //mapping: "standard"
        //var p = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

        var button	 = gamepad.buttons;
        var axes	 = gamepad.axes;

        this.button = button;
        this.axes = axes; 

        this.upkey		 = (Boolean(button[ p[12] ]))?button[ p[12] ].pressed:false;
        this.downkey	 = (Boolean(button[ p[13] ]))?button[ p[13] ].pressed:false;
        this.leftkey	 = (Boolean(button[ p[14] ]))?button[ p[14] ].pressed:false;
        this.rightkey	 = (Boolean(button[ p[15] ]))?button[ p[15] ].pressed:false;

        this.btn_start	 = (Boolean(button[ p[ 9] ]))?button[ p[ 9] ].pressed:false;
        this.btn_back	 = (Boolean(button[ p[ 8] ]))?button[ p[ 8] ].pressed:false;
        this.btn_lb		 = (Boolean(button[ p[ 4] ]))?button[ p[ 4] ].pressed:false;
        this.btn_rb		 = (Boolean(button[ p[ 5] ]))?button[ p[ 5] ].pressed:false;
        this.btn_lt		 = (Boolean(button[ p[ 6] ]))?button[ p[ 6] ].pressed:false;
        this.btn_rt		 = (Boolean(button[ p[ 7] ]))?button[ p[ 7] ].pressed:false;
        this.btn_l3		 = (Boolean(button[ p[10] ]))?button[ p[10] ].pressed:false;
        this.btn_r3		 = (Boolean(button[ p[11] ]))?button[ p[11] ].pressed:false;

        this.btn_a	= (Boolean(button[ p[ 3] ]))?button[ p[ 0] ].pressed:false;
        this.btn_b	= (Boolean(button[ p[ 3] ]))?button[ p[ 1] ].pressed:false;
        this.btn_x	= (Boolean(button[ p[ 3] ]))?button[ p[ 2] ].pressed:false;
        this.btn_y	= (Boolean(button[ p[ 3] ]))?button[ p[ 3] ].pressed:false;

        this.ls_x = (Boolean(axes[0]))?axes[0]:0;
        this.ls_y = (Boolean(axes[1]))?axes[1]:0;
        this.rs_x = (Boolean(axes[2]))?axes[2]:0;
        this.rs_y = (Boolean(axes[3]))?axes[3]:0;

        var x = Math.floor(axes[0]*100); //> 0.05)?axes[j]:0;
        var y = Math.floor(axes[1]*100); //> 0.05)?axes[j+1]:0;

        this.r = ((Math.abs(x) < 10)&&(Math.abs(y) < 10)) ? -1: target_r(x*100, y*100);

        return;
    }

    function target_r (wx, wy) {
        var r = (wx == 0)?
        ((wy >= 0)?180: 0):
        ((Math.atan(wy / wx) * (180.0 / Math.PI)) + ((wx >= 0)? 90:270))
        ;
        return r;
    }

    this.infodraw = function(){
        var str = [];
        str.push("[Gamepad]");
         
        // ------------------------------------------------------------
        // Gamepad オブジェクト
        // ------------------------------------------------------------
        // ゲームパッドリストを取得する
        // gamepad_list = navigator.getGamepads();
        // ゲームパッドリスト内のアイテム総数を取得する
        // num = gamepad_list.length;
        // gamepad[num]
        // ------------------------------------------------------------
        // タイムスタンプ情報 // gamepad.timestamp
        // ------------------------------------------------------------
        // ゲームパッドの識別名 // gamepad.id
        // ------------------------------------------------------------
        // ゲームパッドの物理的な接続状態 // gamepad.connected
        // ------------------------------------------------------------
        // マッピングタイプ情報 // gamepad.mapping
        // ------------------------------------------------------------
        // ボタンリスト // gamepad.buttons[] // buttons.length;
        // ------------------------------------------------------------
        // 軸リスト // gamepad.axes[]; //// axes.length;

        str.push("Up   [" + (this.upkey ? "o":"-") + "]");
        str.push("Down [" + (this.downkey ? "o":"-") + "]");
        str.push("Left [" + (this.leftkey ? "o":"-") + "]");
        str.push("Right[" + (this.rightkey ? "o":"-") + "]");
        str.push("");
        str.push("(A)  [" + (this.btn_a ? "o":"-") + "]");
        str.push("(B)  [" + (this.btn_b ? "o":"-") + "]");
        str.push("(X)  [" + (this.btn_x ? "o":"-") + "]");
        str.push("(Y)  [" + (this.btn_y ? "o":"-") + "]");
        str.push("");
        str.push("START[" + (this.btn_start ? "o":"-") + "]");
        str.push("BACK [" + (this.btn_back ? "o":"-") + "]");
        str.push("LB   [" + (this.btn_lb ? "o":"-") + "]");
        str.push("RB   [" + (this.btn_rb ? "o":"-") + "]");
        str.push("LT   [" + (this.btn_lt ? "o":"-") + "]");
        str.push("RT   [" + (this.btn_rt ? "o":"-") + "]");
        str.push("L3   [" + (this.btn_l3 ? "o":"-") + "]");
        str.push("R3   [" + (this.btn_r3 ? "o":"-") + "]");
        str.push("");
        str.push("r = " + this.r );
        str.push("");
        str.push("Ls_x: " + this.ls_x );
        str.push("Ls_y: " + this.ls_y );
        str.push("Rs_x: " + this.rs_x );
        str.push("Rs_y: " + this.rs_y );

        return str;
    }
}