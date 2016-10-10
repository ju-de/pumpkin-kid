var bitmap;
var shadow;

var map;
var groundLayer, bottomLayer, midLayer, topLayer, aboveLayer, collisionLayer;
var entitiesLayer, playerLayer, bulletsLayer, itemsLayer;
var uiLayer;

var player;
var pumpkins = [];
var enemies = {
    'ghosts': [],
    'skeletons': []
};
var spawnTimers = {}
var spawnPoints = [
    {x: 14, y: 13}, {x: 19, y: 13}, {x: 24, y: 13}, {x: 14, y: 17}, {x: 19, y: 17},
    {x: 57, y: 15}, {x: 62, y: 15}, {x: 57, y: 19}, {x: 62, y: 19}, {x: 62, y: 23},
    {x: 24, y: 49}, {x: 27, y: 49}, {x: 30, y: 49}, {x: 24, y: 55}, {x: 27, y: 55}, {x: 30, y: 55},
    {x: 48, y: 49}, {x: 51, y: 49}, {x: 54, y: 49}, {x: 48, y: 55}, {x: 51, y: 55}, {x: 54, y: 55}
];
var spawnTimes = [
    10000, 7500, 5000, 3000
];
var stage = 0;

var hpOverlay;
var ammoBar;
var loadout;

var cursors;
var keyPumpkin, keyAttack, keyWeapon;

var music;

function create() {
    console.log("Game created");

    game.physics.startSystem(Phaser.Physics.Arcade);

    // draw environment
    game.world.setBounds(0, 0, 640, 624);

    // play music
    music = game.add.audio('bg');
    music.loop = true;
    music.play();

    // set up tilemap
    map = game.add.tilemap('map');
    map.addTilesetImage('environment', 'map_tiles');

    // create tilemap layers
    collisionLayer = map.createLayer('collision');
    groundLayer = map.createLayer('ground');
    bottomLayer = map.createLayer('bottom');
    midLayer = map.createLayer('middle');

    // create player & player-interactable objects between appropriate layers
    itemsLayer = game.add.group();
    entitiesLayer = game.add.group();
    bulletsLayer = game.add.group();
    playerLayer = game.add.group();

    topLayer = map.createLayer('top');
    aboveLayer = map.createLayer('above');

    // make collision layer collidable
    map.setCollisionBetween(1, 100, true, 'collision');
    groundLayer.resizeWorld();


    player = new Player(320, 312);

    spawnTimers.ghosts = game.time.create(false);
    spawnTimers.skeletons = game.time.create(false);

    placePumpkins();
    spawnGhosts();
    spawnSkeletons();






    // draw shadow & reveal masks
    shadow = game.make.sprite(0, 0, 'shadow');
    bitmap = game.make.bitmapData(game.world.width, game.world.height);
    game.add.sprite(0, 0, bitmap);

    // draw UI
    uiLayer = game.add.group();
    uiLayer.fixedToCamera = true;
    setupUI();


    cursors = game.input.keyboard.createCursorKeys();

    keyPumpkin = game.input.keyboard.addKey(Phaser.Keyboard.Z);
    keyPumpkin.onDown.add(togglePumpkin, this);

    keyAttack = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    keyAttack.onDown.add(attack, this);

    keyWeapon = game.input.keyboard.addKey(Phaser.Keyboard.X);
    keyWeapon.onDown.add(switchWeapon, this);

    game.camera.follow(player.sprite);
}

function setupUI() {
    uiLayer.create(5, 5, 'heart_icon');
    var hpBar = uiLayer.create(20, 9, 'player_hp');
    hpOverlay = uiLayer.create(23, 2, 'player_hp_overlay');
    hpBar.addChild(hpOverlay);
    hpOverlay.scale.set(0, 1);

    ammoBar = uiLayer.create(game.width - 6, 7, 'ammo_icon');
    ammoBar.anchor.set(1, 0);
    ammoBar.frame = 5;

    loadout = uiLayer.create(8, game.height - 8, 'loadout');
    loadout.anchor.set(0, 1);
    player.weapons.forEach(function(w) {
        w.loadout = uiLayer.create(0, 0, w.loadoutRes);
        w.loadout.anchor.set(0, 1);
        w.loadout.visible = false;
        loadout.addChild(w.loadout);
    });
    player.weapon.loadout.visible = true;
}

function attack() {
    if (!player.alive) return;
    player.attack();
}


function togglePumpkin() {
    if (!player.alive) return;
    for (var i = 0; i < pumpkins.length; ++i) {
        if (distBetweenCenters(player.sprite, pumpkins[i].sprite) < 20) {
            pumpkins[i].toggle();
            break;
        }
    }
}

function switchWeapon() {
    if (!player.alive) return;
    player.weapon.loadout.visible = false;
    player.switchWeapon();
    player.weapon.loadout.visible = true;
}

function placePumpkins() {
    pumpkins.push(
        new Pumpkin(27*8, 23*8),
        new Pumpkin(55*8, 39*8),
        new Pumpkin(47*8, 23*8),
        new Pumpkin(30*8, 33*8),
        new Pumpkin(36*8, 49*8),
        new Pumpkin(48*8, 59*8),
        new Pumpkin(18*8, 57*8),
        new Pumpkin(30*8, 11*8),
        new Pumpkin(20*8, 43*8)
    );
}

function spawnGhosts() {
    spawnTimers.ghosts.add(
        game.rnd.integerInRange(spawnTimes[stage] - 2000, spawnTimes[stage] + 2000),
        spawnGhosts, this);
    var id = game.rnd.integerInRange(0, spawnPoints.length - 1);
    if (spawnTimers.ghosts.running) {
        enemies['ghosts'].push(new Ghost(spawnPoints[id].x * 8, spawnPoints[id].y * 8));
    } else {
        spawnTimers.ghosts.start();
    }
}

function spawnSkeletons() {
    spawnTimers.skeletons.add(
        game.rnd.integerInRange(spawnTimes[stage] - 2000, spawnTimes[stage] + 2000),
        spawnSkeletons, this);
    var id = game.rnd.integerInRange(0, spawnPoints.length - 1);
    if (spawnTimers.skeletons.running) {
        enemies['skeletons'].push(new Skeleton(spawnPoints[id].x * 8, spawnPoints[id].y * 8));
    } else {
        spawnTimers.skeletons.start();
    }
}

function gameOver() {
    spawnTimers.ghosts.destroy();
    spawnTimers.skeletons.destroy();
    pumpkins.forEach(function(p) {
        if (p.itemSpawnClock) p.itemSpawnClock.destroy();
    });
}

