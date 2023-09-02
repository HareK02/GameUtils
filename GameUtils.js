/*------ GameUtils by HareK02 ------*\
    Last Update: 2023/09/02
    Version: 1.1.2
    LICENSE: MIT
 https://github.com/HareK02/GameUtils
\*----------------------------------*/

export class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    normalized() {
        if (this.x == 0 && this.y == 0) return new Vector2(0, 0);
        let normalized = new Vector2();
        normalized.x = this.x / Math.sqrt(this.x * this.x + this.y * this.y);
        normalized.y = this.y / Math.sqrt(this.x * this.x + this.y * this.y);
        return normalized;
    }
    calc(formula) {
        return new Vector2(formula(this.x), formula(this.y));
    }
}

export class GameLoopManager {
    constructor(func, fps, debug = false) {
        this.func = func; // function
        this.fps = fps; // frame per second
        this.mpc = 1000 / this.fps; // ms per frame
        this.debug = debug; // debug mode
        this.total_count = 0; // total count
        this.total_time = 0; // total seconds
        this.isPause = true; // is pause

        this._Interval = null; // interval
        this._lastframe = null; // last frame
        this._adjust = 0; // adjust
    }
    play() {
        if (!this.isPause) return;
        this.isPause = false;
        this._lastframe = Date.now();
        this.update();
        setTimeout(() => {
            this.reset_stats();
        }, 100);
    }
    stop() {
        if (this.isPause) return;
        this.isPause = true;
        clearTimeout(this._Interval);
    }

    update() {
        this._delta = Date.now() - this._lastframe;
        this._lastframe = Date.now();
        this.func(this._delta);
        this.done();
    }
    done() {
        if (this.isPause) return;
        this.total_count++;
        this.total_time += this._delta;
        this._adjust += this._delta - this.mpc;
        if (this.debug) console.log(`[GameLoopManager] ${this._delta}ms | ${this.total_time / this.total_count}`);
        let ms = this.mpc - (Date.now() - this._lastframe);
        this._Interval = setTimeout(() => this.update(), ms - this._adjust);
    }

    reset_stats() {
        this.total_count = 0;
        this.total_time = 0;
        if (this.debug) console.log("[GameLoopManager] Stats Reseted");
    }
}

export class ViewportManager {
    constructor({ area = new Vector2(0, 0), mode = "auto", axis = "auto", app = undefined } = {}) {
        this.area = area;
        this.target_aspect = area.x / area.y;
        this.app = app;
        this._container = this.app ? this.app.querySelector("#mainContainer") : undefined;
        this._canvas = this.app ? this.app.querySelector("#mainCanvas") : undefined;
        this.mode = mode;
        this._ctx = this._canvas ? this._canvas.getContext("2d") : undefined;
        this._canvas.width = this.area.x;
        this._canvas.height = this.area.y;
        window.addEventListener("resize", () => {
            this.refresh();
        });
    }
    refresh() {
        switch (this._mode) {
            case "stretch": //TODO
                // 画面に収まるようにする
                if (this.ratio_mode !== this.app_aspect < this.area.y / this.area.x) {
                    let flag = this.app_aspect < this.area_aspect;
                    this._container.style.height = !flag ? `calc(100vw * ${this.area.y / this.area.x})` : "100%";
                    this._container.style.width = flag ? `calc(100vh * ${this.area.x / this.area.y})` : "100%";
                    this._canvas.width = this.area.x;
                    this._canvas.height = this.area.y;
                }
                this.ratio_mode = this.app_aspect < this.area_aspect;
                break;
            case "cover": //TODO
                // areaのアスペクト比を保ったまま画面いっぱいに広げる
                this._container.style.height = "100%";
                this._container.style.width = "100%";
                this._canvas.width = this.area.x;
                this._canvas.height = this.area.y;
                break;
            case "contain": //TODO
                // ウィンドウに収まるようにする
                if (this.ratio_mode !== this.app_aspect < this.area.y / this.area.x) {
                    let flag = this.app_aspect < this.area_aspect;
                    this._canvas.width = this.app.clientWidth;
                    this._canvas.height = this.app.clientHeight;
                    this.axis = flag ? "x" : "y";
                }
                this.app.style.setProperty(
                    "--height",
                    (this.axis == "x" ? this.appWidth * this.area_aspect : this.appHeight) + "px"
                );
                this.app.style.setProperty(
                    "--width",
                    (this.axis == "x" ? this.appWidth : this.appHeight / this.area_aspect) + "px"
                );
                this.app.style.setProperty(
                    "--pixel",
                    (this.axis == "x" ? this.appHeight / this.area.y : (this.appWidth / this.area.x) * this.area_aspect) +
                        "px"
                );
                this.ratio_mode = this.app_aspect < this.area_aspect;
                break;
            case "limited":
                let flag = this.app_aspect < this.area_aspect;
                this.app.style.setProperty("--height", this.appHeight + "px");
                this.app.style.setProperty("--width", (flag ? this.appHeight / this.area_aspect : this.appWidth) + "px");
                this.pixel = this.appHeight / this.area.y;
                this.app.style.setProperty("--pixel", this.pixel + "px");
                this._canvas.width = this._container.clientWidth;
                this._canvas.height = this._container.clientHeight;
                break;
            default:
                console.error("[ViewportManager] ModeErr");
                break;
        }
    }
    get app_aspect() {
        return this.appHeight / this.appWidth;
    }
    get area_aspect() {
        return this.area.y / this.area.x;
    }
    get x() {
        return this._container.clientWidth;
    }
    get y() {
        return this._container.clientHeight;
    }
    set canvas(value) {
        this._canvas = value;
        this._ctx = this._canvas.getContext("2d");
    }
    get canvas() {
        return this._canvas;
    }
    get ctx() {
        return this._ctx;
    }
    set mode(value) {
        switch (value) {
            case "stretch":
                this.axis = "static";
                break;
            case "contain":
                this.axis = "y";
                break;
            case "cover":
                this.axis = "y";
                break;
            case "limited":
                this.axis = "y";
                break;
            default:
                console.error("[ViewportManager] ModeErr");
                break;
        }
        this._mode = value;
        this.refresh();
    }
    get appHeight() {
        return this.app.clientHeight;
    }
    get appWidth() {
        return this.app.clientWidth;
    }
    clientToCanvas(vec) {
        // client座標をcanvas座標に変換する
        let rect = this._canvas.getBoundingClientRect();
        console.log(`[ViewportManager] client: ${vec.x}, ${vec.y} -> canvas: ${vec.x - rect.left}, ${vec.y - rect.top}`);
        return new Vector2(vec.x - rect.left, vec.y - rect.top);
    }
}

export class CanvasComponents {
    static components = [];
    constructor({
        ctx = undefined,
        img = "../assets/error.png",
        size = new Vector2(50, 50),
        position = new Vector2(0, 0),
        motion = new Vector2(0, 0),
        rotate = 0,
        rotation = 0,
        process = (delta) => {},
    } = {}) {
        this.ctx = ctx;
        this.image = new Image();
        this.image.src = img;
        this.size = typeof size == "number" ? new Vector2(size, size) : size;
        this.position = position;
        this.motion = motion;
        this.rotate = rotate;
        this.rotation = rotation;
        this._process = process;
        CanvasComponents.components.push(this);
    }
    static update(delta) {
        for (let i = 0; i < CanvasComponents.components.length; i++) {
            CanvasComponents.components[i].process(delta);
        }
    }
    static draw(viewport, delta) {
        viewport.ctx.clearRect(0, 0, viewport.x, viewport.y);
        for (let i = 0; i < CanvasComponents.components.length; i++) {
            CanvasComponents.components[i].render(delta);
        }
    }

    process(delta) {
        this.position.y += this.motion.y;
        this.position.x += this.motion.x;
        this.rotate += this.rotation;
        this._process(delta);
    }
    render(delta) {
        let x = this.position.x;
        let y = this.position.y;
        let phi = this.rotate * (Math.PI / 180);
        let X = x * Math.cos(-phi) - y * Math.sin(-phi);
        let Y = y * Math.cos(-phi) + x * Math.sin(-phi);
        this.ctx.rotate(phi);
        this.ctx.drawImage(this.image, X - this.size.x / 2, Y - this.size.y / 2, this.size.x, this.size.y);
        this.ctx.rotate(-phi);
    }
    destroy() {
        CanvasComponents.components.splice(CanvasComponents.components.indexOf(this), 1);
    }
}

export class LangManager {
    constructor(langs = {}, lang = undefined, debug = false) {
        this._lang = lang; //選択中の言語
        this.langs = langs; //言語データ
        this.debug = debug;
    }
    set lang(value) {
        if (!this.langs[value]) {
            console.error(`[LangManager] langtypeErr: ${value}`);
            return;
        }
        this._lang = value;
    }
    get lang() {
        return this._lang;
    }
    Apply() {
        console.log(this.langs[this._lang]);
        let elements = document.querySelectorAll("[translate]");
        for (const element of elements) {
            this.debug
                ? (element.innerHTML = element.getAttribute("translate"))
                : (element.innerHTML = this.langs[this._lang].translate[element.getAttribute("translate")]);
        }
    }
}
