let sw = 20, //活动区域一个方块的宽度
    sh = 20, //活动区域一个方块的高度
    tr = 30, //活动区域行数
    td = 30; //活动区域列数

let snake = null, //蛇的实例
    food = null, //食物的实例
    game = null; //游戏的实例

// 方块创建函数
function Square(x, y, className) {
    this.x = x * sw;
    this.y = y * sh;
    this.class = className;

    this.viewContent = document.createElement('div'); //方块对应的DOM元素
    this.viewContent.className = this.class;
    this.parent = document.getElementById('snakeWrap'); //方块的父级
}
Square.prototype.create = function () { //小方块DOM
    this.viewContent.style.position = 'absolute';
    this.viewContent.style.width = sw + 'px';
    this.viewContent.style.height = sh + 'px';
    this.viewContent.style.left = this.x + 'px';
    this.viewContent.style.top = this.y + 'px';

    this.parent.appendChild(this.viewContent); //将小方块添加到页面的活动区域上
}
Square.prototype.remove = function () {
    this.parent.removeChild(this.viewContent); //删除父级的小方块
}

// 蛇
function Snake() {
    this.head = null; //存一下蛇头的信息
    this.tail = null; //存一下蛇尾的信息
    this.pos = []; //存蛇身上的每一个方块的位置

    this.directionNum = { //存储蛇身走的方向
        left: {
            x: -1,
            y: 0,
            rotate: 180 //蛇头在不同的方向中应该进行旋转
        },
        right: {
            x: 1,
            y: 0,
            rotate: 0 //蛇头在不同的方向中应该进行旋转
        },
        up: {
            x: 0,
            y: -1,
            rotate: -90 //蛇头在不同的方向中应该进行旋转
        },
        down: {
            x: 0,
            y: 1,
            rotate: 90 //蛇头在不同的方向中应该进行旋转
        }
    }
}
Snake.prototype.init = function () { //初始化蛇
    //创建蛇头
    let snakeHead = new Square(2, 0, 'snakeHead')
    snakeHead.create();
    this.head = snakeHead; //存储蛇头信息
    this.pos.push([2, 0]); //把蛇头的位置存起来

    // 创建蛇的身体1
    let snakeBody1 = new Square(1, 0, 'snakeBody');
    snakeBody1.create();
    this.pos.push([1, 0]); //把蛇身体1位置存起来

    // 创建蛇身体2
    let snakeBody2 = new Square(0, 0, 'snakeBody');
    snakeBody2.create();
    this.tail = snakeBody2; //把蛇尾的信息存起来
    this.pos.push([0, 0]); //把蛇身体2位置存起来

    // 形成蛇链表关系
    snakeHead.last = null;
    snakeHead.next = snakeBody1;

    snakeBody1.last = snakeHead;
    snakeBody1.next = snakeBody2;

    snakeBody2.last = snakeBody1;
    snakeBody2.next = null;

    // 给蛇添加一条属性，用来表示蛇走的方向
    this.direction = this.directionNum.right
}

// 用来获取蛇头下一个位置对应的元素，根据元素做不同的事件
Snake.prototype.getNextPos = function () {
    let nextPos = [ //蛇头要走的下一个点的坐标
        this.head.x / sw + this.direction.x,
        this.head.y / sh + this.direction.y
    ]

    // 下一个点是自己身体，撞到身体游戏结束
    let selfCollied = false; //是否撞到自己
    this.pos.forEach(item => {
        if (item[0] === nextPos[0] && item[1] === nextPos[1]) {
            // 代表撞到自己==>游戏结束
            selfCollied = true;
        }
    });
    if (selfCollied) {
        console.log('撞到自己了')
        this.strategies.die.call(this);
        return;
    }

    // 下一个点是围墙，游戏结束
    if (nextPos[0] < 0 || nextPos[1] < 0 || nextPos[0] > td - 1 || nextPos[1] > tr - 1) {
        console.log('撞墙了')
        this.strategies.die.call(this);
        return;
    }

    // 下个点是食物==>吃
    if (food && food.pos[0] === nextPos[0] && food.pos[1] === nextPos[1]) {
        // 要吃到食物，吃
        this.strategies.eat.call(this);
        return
    }

    // 下个点没东西==>走
    this.strategies.move.call(this);

}
//碰撞后需要处理的事件
Snake.prototype.strategies = {
    move: function (format) { // format决定是否要删除蛇尾
        // 1、在旧蛇头的位置，创建一个新身体
        let newBody = new Square(this.head.x / sw, this.head.y / sh, 'snakeBody');
        // 更新链表的关系
        newBody.next = this.head.next;
        newBody.next.last = newBody;
        newBody.last = null;

        this.head.remove(); //把旧蛇头从原来的位置删除
        newBody.create(); //把新身体创建到旧蛇头的位置

        // 创建一个新蛇头（蛇头下一个碰撞的点）
        let newHead = new Square(this.head.x / sw + this.direction.x, this.head.y / sh + this.direction.y, 'snakeHead')
        // 更新链表关系
        newHead.next = newBody;
        newHead.last = null;
        newBody.last = newHead;
        newHead.viewContent.style.transform = 'rotate(' + this.direction.rotate + 'deg)'
        newHead.create(); //创建新蛇头

        // 更新蛇身体的数组集合
        this.pos.unshift([this.head.x / sw + this.direction.x, this.head.y / sh + this.direction.y]);
        // this.pos.splice(0, 0, [this.head.x / sw + this.direction.x, this.head.y / sh + this.direction.y])
        this.head = newHead //还要把this.head更新一次

        if (!format) {
            // 去掉蛇尾
            this.tail.remove();
            this.tail = this.tail.last
            this.pos.pop();
        }

    },
    eat: function () {
        this.strategies.move.call(this, true);
        game.score++;
        createFood();
    },
    die: function () {
        game.over();
    }
}

snake = new Snake();


// 创建食物
function createFood() {
    // 食物坐标
    let x = null;
    let y = null;

    let include = true; //循环跳出的条件，true表示食物坐标在蛇身上（需继续循环），false表示食物坐标不在蛇身上（不循环了）
    while (include) {
        x = Math.round(Math.random() * (td - 1));
        y = Math.round(Math.random() * (tr - 1));

        snake.pos.forEach(item => {
            if (x != item[0] && y != item[1]) {
                include = false;
            }
        });
    }
    // 生成食物
    food = new Square(x, y, 'food');
    food.pos = [x, y]; //存储食物坐标
    let foodDom = document.querySelector('.food');
    if (foodDom) {
        foodDom.style.left = x * sw + 'px'
        foodDom.style.top = y * sh + 'px'
    } else {
        food.create();
    }
}


// 创建游戏逻辑
function Game() {
    this.timer = null;
    this.score = 0;
}
Game.prototype.init = function () {
    snake.init();
    // snake.getNextPos();
    createFood();
    document.onkeydown = function (ev) {
        //用户按下左键的时候，不能是正在往右走
        if (ev.which === 37 && snake.direction != snake.directionNum.right) {
            snake.direction = snake.directionNum.left;
        } else if (ev.which === 38 && snake.direction != snake.directionNum.down) {
            snake.direction = snake.directionNum.up;
        } else if (ev.which === 39 && snake.direction != snake.directionNum.left) {
            snake.direction = snake.directionNum.right;
        } else if (ev.which === 40 && snake.direction != snake.directionNum.up) {
            snake.direction = snake.directionNum.down;
        }
    }
    this.start();
}
Game.prototype.start = function () {  //开始游戏
    this.timer = setInterval(function () {
        snake.getNextPos();
    }, 200)
}
Game.prototype.pause = function () {
    clearInterval(this.timer);
}
Game.prototype.over = function () {
    clearInterval(this.timer);
    alert('最终得分为：' + this.score)

    // 游戏回到最初的样子
    let snakeWrap = document.getElementById('snakeWrap');
    snakeWrap.innerHTML = '';
    snake = new Snake();
    game = new Game();

    let startBtnWrap = document.querySelector('.startBtn');
    startBtnWrap.style.display = 'block';
}

// 开启游戏
game = new Game();
let startBtn = document.querySelector('.startBtn button')
startBtn.onclick = function () {
    startBtn.parentNode.style.display = 'none';
    game.init();
}

// 暂停游戏
let snakeWrap = document.getElementById('snakeWrap');
let pauseBtn = document.querySelector('.pauseBtn button')
snakeWrap.onclick = function () {
    game.pause();
    pauseBtn.parentNode.style.display = 'block';
}

pauseBtn.onclick = function () {
    game.start();
    pauseBtn.parentNode.style.display = 'none';
}

