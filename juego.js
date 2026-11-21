var NOMBRE_AUTOR = 'César Sachun Pozo';

var puntos = 0;
var vidas = 3;
var nivel = 1;
var musicaFondo;

var fondo;
var carro;
var cursores;
var enemigos;
var gasolinas;
var timer;
var timerGasolina;
var sonidoChoque;
var sonidoBarril;
var txtPuntos;
var txtVidas;
var txtNivel;
var carriles = [74, 145, 216];
var ultimoCarrilEnemigo = -1;

function activarAudio() {
    if (juego.sound && juego.sound.context && juego.sound.context.state === 'suspended') {
        juego.sound.context.resume();
    }
}

function crearBoton(x, y, texto, color, callback) {
    var btn = juego.add.graphics(x - 85, y - 22);
    btn.beginFill(color);
    btn.lineStyle(2, 0xffffff, 1);
    btn.drawRoundedRect(0, 0, 170, 44, 10);
    btn.endFill();
    btn.hitArea = new Phaser.Rectangle(0, 0, 170, 44);
    btn.inputEnabled = true;
    btn.input.useHandCursor = true;
    btn.events.onInputDown.add(callback);

    var label = juego.add.text(x, y, texto, {
        font: 'bold 18px Arial',
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3
    });
    label.anchor.setTo(0.5);
}

var Portada = {
    preload: function () {
        juego.load.image('bg', 'img/bg.png');
        juego.load.image('carro', 'img/carro.png');
        juego.load.image('carroMalo', 'img/carroMalo.png');
        juego.load.image('carroMalo1', 'img/carroMalo1.png');
        juego.load.image('gasolina', 'img/gas.png');
        juego.load.spritesheet('explosion', 'img/explosion.png', 36, 37, 14);
        juego.load.audio('musica', 'sonidos/fondo.wav');
        juego.load.audio('choque', 'sonidos/choque.wav');
        juego.load.audio('barril', 'sonidos/barril.wav');
        juego.forceSingleUpdate = true;
    },

    create: function () {
        fondo = juego.add.tileSprite(0, 0, 290, 540, 'bg');

        var velo = juego.add.graphics(0, 0);
        velo.beginFill(0x000000, 0.58);
        velo.drawRect(0, 0, 290, 540);
        velo.endFill();

        var titulo = juego.add.text(145, 90, 'CARRERA\nEXTREMA', {
            font: 'bold 36px Arial',
            fill: '#ffd700',
            stroke: '#000000',
            strokeThickness: 6,
            align: 'center'
        });
        titulo.anchor.setTo(0.5);

        var demoCarro = juego.add.sprite(145, 220, 'carro');
        demoCarro.anchor.setTo(0.5);
        demoCarro.scale.setTo(0.5);

        var autor = juego.add.text(145, 315, 'Desarrollado por:\n' + NOMBRE_AUTOR, {
            font: 'bold 17px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        });
        autor.anchor.setTo(0.5);

        var info = juego.add.text(145, 378, 'Usa ← → para moverte\nRecoge barriles y evita autos', {
            font: '13px Arial',
            fill: '#e0e0e0',
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center'
        });
        info.anchor.setTo(0.5);

        crearBoton(145, 450, 'JUGAR', 0x28a745, this.iniciarJuego);

        juego.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onDown.add(this.iniciarJuego, this);
        juego.input.keyboard.addKey(Phaser.Keyboard.ENTER).onDown.add(this.iniciarJuego, this);
    },

    update: function () {
        fondo.tilePosition.y += 2;
    },

    iniciarJuego: function () {
        activarAudio();
        puntos = 0;
        vidas = 3;
        nivel = 1;
        juego.state.start('Juego');
    }
};

var Juego = {
    create: function () {
        juego.physics.startSystem(Phaser.Physics.ARCADE);

        fondo = juego.add.tileSprite(0, 0, 290, 540, 'bg');

        var esNivel2 = (nivel === 2);
        this.velocidadFondo = esNivel2 ? 5 : 3;
        this.velocidadEnemigo = esNivel2 ? 340 : 200;
        this.velocidadBarril = esNivel2 ? 250 : 200;
        var spriteEnemigo = esNivel2 ? 'carroMalo1' : 'carroMalo';
        var tiempoEnemigo = esNivel2 ? 950 : 1500;

        carro = juego.add.sprite(145, 475, 'carro');
        carro.anchor.setTo(0.5);
        carro.scale.setTo(0.48);
        juego.physics.arcade.enable(carro);

        enemigos = juego.add.group();
        enemigos.enableBody = true;
        enemigos.physicsBodyType = Phaser.Physics.ARCADE;
        enemigos.createMultiple(20, spriteEnemigo);
        enemigos.setAll('scale.x', 0.48);
        enemigos.setAll('scale.y', 0.48);
        enemigos.setAll('anchor.x', 0.5);
        enemigos.setAll('anchor.y', 0.5);
        enemigos.setAll('outOfBoundsKill', true);
        enemigos.setAll('checkWorldBounds', true);

        gasolinas = juego.add.group();
        gasolinas.enableBody = true;
        gasolinas.physicsBodyType = Phaser.Physics.ARCADE;
        gasolinas.createMultiple(20, 'gasolina');
        gasolinas.setAll('anchor.x', 0.5);
        gasolinas.setAll('anchor.y', 0.5);
        gasolinas.setAll('outOfBoundsKill', true);
        gasolinas.setAll('checkWorldBounds', true);

        var barraHud = juego.add.graphics(0, 0);
        barraHud.beginFill(0x000000, 0.55);
        barraHud.drawRect(0, 0, 290, 34);
        barraHud.endFill();

        var estiloHud = { font: 'bold 15px Arial', fill: '#ffffff', stroke: '#000000', strokeThickness: 3 };
        txtPuntos = juego.add.text(10, 8, 'Puntos: ' + puntos, estiloHud);
        txtNivel = juego.add.text(145, 8, 'Nivel: ' + nivel, { font: 'bold 15px Arial', fill: '#ffd700', stroke: '#000000', strokeThickness: 3 });
        txtNivel.anchor.setTo(0.5, 0);
        txtVidas = juego.add.text(280, 8, 'Vidas: ' + vidas, { font: 'bold 15px Arial', fill: '#ff6b6b', stroke: '#000000', strokeThickness: 3 });
        txtVidas.anchor.setTo(1, 0);

        sonidoChoque = juego.add.audio('choque');
        sonidoBarril = juego.add.audio('barril');

        if (!musicaFondo) {
            musicaFondo = juego.add.audio('musica');
        }
        if (!musicaFondo.isPlaying) {
            musicaFondo.loopFull(0.35);
        }

        if (esNivel2) {
            var aviso = juego.add.text(145, 220, '¡NIVEL 2!\nMÁS RÁPIDO', {
                font: 'bold 30px Arial',
                fill: '#ffd700',
                stroke: '#000000',
                strokeThickness: 6,
                align: 'center'
            });
            aviso.anchor.setTo(0.5);
            juego.time.events.add(1400, function () { aviso.destroy(); });
        }

        timer = juego.time.events.loop(tiempoEnemigo, this.crearCarroMalo, this);
        timerGasolina = juego.time.events.loop(1900, this.crearGasolina, this);
        cursores = juego.input.keyboard.createCursorKeys();
    },

    update: function () {
        fondo.tilePosition.y += this.velocidadFondo;

        if (cursores.right.isDown && carro.position.x < 232) {
            carro.position.x += 5;
        } else if (cursores.left.isDown && carro.position.x > 58) {
            carro.position.x -= 5;
        }

        juego.physics.arcade.overlap(carro, enemigos, this.chocarEnemigo, null, this);
        juego.physics.arcade.overlap(carro, gasolinas, this.recogerBarril, null, this);
    },

    crearCarroMalo: function () {
        var indice = Math.floor(Math.random() * 3);
        ultimoCarrilEnemigo = indice;
        var enemigo = enemigos.getFirstDead();
        if (!enemigo) return;
        enemigo.reset(carriles[indice], 0);
        enemigo.body.velocity.y = this.velocidadEnemigo;
    },

    crearGasolina: function () {
        var indice = Math.floor(Math.random() * 3);
        if (indice === ultimoCarrilEnemigo) {
            indice = (indice + 1) % 3;
        }
        var gasolina = gasolinas.getFirstDead();
        if (!gasolina) return;
        gasolina.reset(carriles[indice], 0);
        gasolina.body.velocity.y = this.velocidadBarril;
    },

    chocarEnemigo: function (auto, enemigo) {
        if (vidas <= 0) return;
        var ex = enemigo.x;
        var ey = enemigo.y;
        enemigo.kill();
        sonidoChoque.play();

        var exp = juego.add.sprite(ex, ey, 'explosion');
        exp.anchor.setTo(0.5);
        exp.scale.setTo(1.3);
        exp.animations.add('boom');
        exp.animations.play('boom', 24, false, true);

        vidas -= 1;
        txtVidas.text = 'Vidas: ' + vidas;

        auto.tint = 0xff4444;
        juego.time.events.add(200, function () {
            if (auto && auto.alive) auto.tint = 0xffffff;
        });

        if (vidas <= 0) {
            if (musicaFondo) musicaFondo.stop();
            juego.state.start('Final', true, false, false);
        }
    },

    recogerBarril: function (auto, gasolina) {
        gasolina.kill();
        sonidoBarril.play();

        puntos += 1;
        txtPuntos.text = 'Puntos: ' + puntos;

        if (nivel === 1 && puntos >= 3) {
            nivel = 2;
            juego.state.start('Juego');
        } else if (nivel === 2 && puntos >= 6) {
            if (musicaFondo) musicaFondo.stop();
            juego.state.start('Final', true, false, true);
        }
    }
};

var Final = {
    init: function (gano) {
        this.gano = gano;
    },

    create: function () {
        fondo = juego.add.tileSprite(0, 0, 290, 540, 'bg');

        var velo = juego.add.graphics(0, 0);
        velo.beginFill(0x000000, 0.72);
        velo.drawRect(0, 0, 290, 540);
        velo.endFill();

        var mensaje = this.gano ? 'GANASTE' : 'VUELVE A\nINTENTARLO';
        var color = this.gano ? '#2ecc71' : '#ff4d4d';

        var titulo = juego.add.text(145, 165, mensaje, {
            font: 'bold 34px Arial',
            fill: color,
            stroke: '#000000',
            strokeThickness: 6,
            align: 'center'
        });
        titulo.anchor.setTo(0.5);

        var detalle = juego.add.text(145, 255, 'Puntos obtenidos: ' + puntos + '\nNivel alcanzado: ' + nivel, {
            font: 'bold 17px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center'
        });
        detalle.anchor.setTo(0.5);

        crearBoton(145, 360, 'JUGAR DE NUEVO', 0x28a745, this.reintentar);
        crearBoton(145, 425, 'PORTADA', 0x007bff, this.irPortada);

        juego.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onDown.add(this.reintentar, this);
        juego.input.keyboard.addKey(Phaser.Keyboard.ENTER).onDown.add(this.reintentar, this);
    },

    reintentar: function () {
        activarAudio();
        puntos = 0;
        vidas = 3;
        nivel = 1;
        juego.state.start('Juego');
    },

    irPortada: function () {
        juego.state.start('Portada');
    }
};
