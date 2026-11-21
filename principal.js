var juego = new Phaser.Game(290, 540, Phaser.CANVAS, 'runner');

juego.state.add('Portada', Portada);
juego.state.add('Juego', Juego);
juego.state.add('Final', Final);
juego.state.start('Portada');
