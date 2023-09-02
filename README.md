# GameUtils

A collection of utilities for game development in JavaScript.
JavaScript でのゲーム開発用に作った簡易的なライブラリです。

## Classes

### Vector2

2 次元ベクトルを表すクラスです。

#### Constructor

```js
new Vector2(x, y);
```

#### Properties

```js
x; // X座標
y; // Y座標
```

#### Methods

```js
normalize(); // 正規化 (長さ1のベクトルを返す)
calc(formula); // 計算 (引数に関数を渡すことで計算式を指定できます)
calc((it) => {
    it * 2;
}); // 用例：全体に2倍
```

### GameLoopManager

ゲームループを管理するクラスです。

#### Constructor

```js
new GameLoopManager(func, fps, (debug = false));
/*
 * func: ゲームループ内で実行する関数
 * fps: 一秒間に実行する回数
 * debug: デバッグモード (FPSをログに出力するか)
 */
```

#### Properties

```js
fps; // FPS
total_count; // ゲームループが実行された回数
total_time; // ゲームループが実行された時間 (ミリ秒)
isPaused; // ゲームループが一時停止しているか
```

#### Methods

```js
play(); // ゲームループを開始する
stop(); // ゲームループを停止する
reset_stats(); // ゲームループの統計情報をリセットする
```

### ViewportManager

ビューポートを管理するクラスです。
スケーリングやウィンドウサイズの変更に対応しています。
説明は省略します。

#### 用例

以下の DOM を用意します。

```html
<div id="#App">
    <canvas id="#mainCanvas"></canvas>
    <div id="#mainContainer"></div>
</div>
```

id を使用して DOM を指定します。

```js
new ViewportManager({
    area: new Vector2(720, 360),
    app: document.querySelector("#App"),
    mode: "limited",
});
```

#### Methods

```js
clientToCanvas(vec);
// client座標をcanvas座標に変換する
```

### CanvasComponents

キャンバス上に描画するコンポーネントです。

#### Constructor
プロセス関数を指定することで、ゲームループ内で実行する処理を指定できます。
```js
new CanvasComponents({
    ctx = <ViewportManager>.ctx,
    img = "../assets/error.png",
    size = new Vector2(50, 50),
    position = new Vector2(0, 0),
    motion = new Vector2(0, 0),
    rotate = 0,
    rotation = 0,
    process = (delta) => {},
});
```