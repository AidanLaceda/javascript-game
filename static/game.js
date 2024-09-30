
let canvas;
let context;
let request_id;
let score = 0;
// let xhttp;

let fpsInterval = 1000 / 30;
let now;
let then = Date.now();

let pistol = true;
let shotgun = false;
let shotgun_timer = 0;

let moveUp = false;
let moveDown = false;
let moveLeft = false;
let moveRight = false;

let player = new Player(800/2, 500/2)

let shoot = false;
let click;
let xcoord;
let ycoord;
let centre = {
    x: 0,
    y: 0
};

let icon = {
    x: 360,
    y: 20,
    frameX : 1,
    frameY : 0,
    size: 32
};

import { Player, Enemy, Bullet, Background1, Background2, PowerUp} from './objects.js'

let enemies = [];
let enemy_timer = 180;
let enemy_counter = 2;
let enemy_doors = 360;
let bullets = [];
let locations = [0, 816];
let powerUps = [];

let background1 = Background1; 
let background2 = Background2;
let iconImage = new Image();
let powerUpImage = new Image();
let bulletImage = new Image()
let playerImage = new Image();
let backgroundImage1 = new Image();
let backgroundImage2 = new Image();
let enemyImage = new Image()
let tilesPerRow = 10;
let tileSize = 16;

document.addEventListener("DOMContentLoaded", init, false);

function init() {
    canvas = document.querySelector("canvas");
    context = canvas.getContext("2d");

    draw();

    window.addEventListener("keydown", activate, false);
    window.addEventListener("keyup", deactivate, false);
    window.addEventListener("mousedown", shoot_flag, false);

    load_assets([
        {"var" : iconImage, "url": "static/sprites/potion_icon.png"},
        {"var" : bulletImage, "url": "static/sprites/potions.png"},
        {"var" : backgroundImage1, "url":"static/sprites/Dungeon_Tileset.png"},
        {"var": backgroundImage2, "url":"static/sprites/Dungeon_Tileset.png"},
        {"var" : playerImage, "url": "static/sprites/player.png"},
        {"var" : enemyImage, "url": "static/sprites/enemy.png"},
        {"var" : powerUpImage, "url" : "static/sprites/potion_power_ups.png"}
    ], draw);
}

function draw() {
    request_id = window.requestAnimationFrame(draw);
    now = Date.now();
    let elapsed = now - then;
    if (elapsed <= fpsInterval) {
        return;
    }
    then = now - (elapsed % fpsInterval);

    context.clearRect(0, 0, canvas.width, canvas.height);
    for (let r = 0; r < 32; r += 1) {
        for (let c = 0; c < 50; c += 1) {
            let tile = background1[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(backgroundImage1, tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                c * tileSize, r* tileSize, tileSize, tileSize);
            }
        }
    }

    for (let r = 0; r < 32; r += 1) {
        for (let c = 0; c < 50; c += 1) {
            let tile = background2[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(backgroundImage2, tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                c * tileSize, r* tileSize, tileSize, tileSize);
            }
        }
    }

    enemy_spawner()

    // Creating player
    context.drawImage(playerImage, player.frameX * player.width, player.frameY * player.height, player.width, player.height,
        player.x, player.y, player.width, player.height);


    // Weapon Type Icon
    context.globalAlpha = 0.5;
    context.drawImage(iconImage, icon.frameX * icon.size, icon.frameY * icon.size, icon.size, icon.size, icon.x, icon.y, icon.size, icon.size);
    context.globalAlpha = 1;

    // Healthbar
    context.fillStyle = "rgba(169, 169, 169 , 0.5)";
    context.fillRect(30, 30, 300, 20);
    context.fillStyle = "rgba(245, 0, 0, 0.75)";
    context.fillRect(30, 30, player.health*3, 20);
    /*
        Code below prevents enemies from being drawn over one another to
        form one blob of an enemy
    */

    // Drawing the objects
    for (let enemy of enemies) {
        context.drawImage(enemyImage, enemy.frameX * enemy.width, enemy.frameY * enemy.height, enemy.width, enemy.height,
        enemy.x, enemy.y, enemy.width, enemy.height);
    }

    for (let bullet of bullets) {
        if (bullet.type === "pistol") {
            bullet.frameX = 1;
            bullet.frameY = 0;
        }

        else if (bullet.type === "shotgun") {
            bullet.frameX = 1;
            bullet.frameY = 1;
        }
        context.drawImage(bulletImage, bullet.frameX * bullet.size, bullet.frameY * bullet.size, bullet.size, bullet.size,
        bullet.x, bullet.y, bullet.size, bullet.size);
    }

    for (let powerUp of powerUps) {
        context.drawImage(powerUpImage, powerUp.frameX * powerUp.size, powerUp.frameY * powerUp.size, powerUp.size, powerUp.size,
        powerUp.x, powerUp.y, powerUp.size, powerUp.size);
    }

    player_movement();

    enemy_movement(enemies, player);
    enemy_collision(enemies)

    shoot_bullet(bullets);
    move_bullet(bullets);
    if (shotgun_timer > 0) {
        shotgun_timer -= 1;
    }

    enemy_hit(enemies, bullets);

    player_hit(enemies, player);

    let score_element = document.querySelector("#score");
    score_element.innerHTML = "S c o r e : " + score;
}

function activate(event) {
    let key = event.key;

    if (key === "ArrowUp" || key === "w") {
        moveUp = true;
    } if (key === "ArrowDown" || key === "s") {
        moveDown = true;
    }  if (key === "ArrowRight" || key === "d") {
        moveRight = true;
    }  if (key === "ArrowLeft" || key === "a") {
        moveLeft = true;
    }

    if (key === "y" && pistol) {
        pistol = false;
        shotgun = true;
        icon.frameY = 1;
    } 
    else if (key === "y" && shotgun) {
        pistol = true;
        shotgun = false;
        icon.frameY = 0;
    }
}

function deactivate(event) {
    let key = event.key;
    if (key === "ArrowUp" || key === "w") {
        moveUp = false;
    } else if (key === "ArrowDown" || key === "s") {
        moveDown = false;
    } else if (key === "ArrowRight" || key === "d") {
        moveRight = false;
    } else if (key === "ArrowLeft" || key === "a") {
        moveLeft = false;
    }
}

function shoot_flag(event) {

    /*
        Method to find location of mouseclick on canvas was found from here
        https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
        and
        https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/clientX
        Both resources were useful to find the coordinates of which the direction
        The bullet shall travel

        clientX and clientY are the coordinates of the click on the viewport

        click.left and click.top are constants
        They represent the dimensions of the canvas beginning at
        the top-left corner
        43 and 8 respectively

        All coordinates are relative to the viewport
    */

    let button = event.button;

    if (button === 0) {
        shoot = true;
        click = canvas.getBoundingClientRect();
        xcoord = event.clientX - click.left;
        ycoord = event.clientY - click.top;
    }
}

function randint(min, max) {
    return Math.round(Math.random() * (max - min)) + min;
}

function player_movement() {

    /*
        Function for player movement
    */

    // Player Movement
    if (moveUp) {
        player.y = player.y - player.speed;
        // Border above
        if (player.y < 0) {
            player.y = 0;
        }
    }

    if (moveDown) {
        player.y = player.y + player.speed;
        // Border below
        if (player.y > (canvas.height - player.height)) {
            player.y = (canvas.height - player.height);
        }
    }

    if (moveRight) {
        player.frameY = 0
        player.x = player.x + player.speed;
        // Border on right
        if (player.x > (canvas.width - player.width)) {
            player.x = (canvas.width - player.width);
        }
    }

    if (moveLeft) {
        player.frameY = 1;
        player.x = player.x - player.speed;
        // Border on left
        if (player.x < 0) {
            player.x = 0;
        }
    }

    if ((moveLeft || moveRight || moveDown || moveUp)
    && ! (moveLeft && moveRight)
    && ! (moveUp && moveDown)) {
        player.frameX = (player.frameX + 1) % 4
    }

}

function enemy_collision(enemies_array) {
    for (let enemy of enemies_array) {
        let temp_array = temp_enemy_array(enemies_array, enemy);
        for (let other_enemy of temp_array) {
            if (enemy.x + enemy.width <= other_enemy.x ||
                other_enemy.x + other_enemy.width <= enemy.x ||
                enemy.y >= other_enemy.y + other_enemy.height ||
                other_enemy.y >= enemy.y + enemy.height) {
            }
            
            else {
                enemy.x += 10;
                other_enemy.x -= 10;
            }
    }   }
}

function enemy_movement(enemies_array) {
    /*
        Function for enemy movement
        Parameter is an array of enemy objects

        Enemy collision
        Prevents enemy from being drawn over other enemy sprite
        True if enemy is allowed to move over free space
        False if another enemy exists there.

        Respectively checks:
        1. Enemy on the left of other enemy
        2. Enemy on the right of other enemy
        3. Enemy underneath other enemy
        4. Enemy above other enemy
    */

        
        for (let enemy of enemies_array) {
    
            // Enemy on the left
            if (enemy.x + enemy.width < player.x) {
                enemy.frameY = 0;
                enemy.x = enemy.x + enemy.speed;
            }
            
            // Enemy on the right
            if (enemy.x > player.x + enemy.width) {
                enemy.frameY = 1;
                enemy.x = enemy.x - enemy.speed;
            }

            // Enemy underneath player
            if (enemy.y + enemy.height < player.y) {
                enemy.y = enemy.y + enemy.speed;
            }

            // Enemy above player
            if (enemy.y > player.y + enemy.height) {
                enemy.y = enemy.y - enemy.speed;
            }

            enemy.frameX = (enemy.frameX + 1) % 4;

            // Border above enemy
            if (enemy.y < 0) {
                enemy.y = 0;
            }

            // Border underneath enemy
            if (enemy.y > (canvas.height - enemy.height)) {
                enemy.y = (canvas.height - enemy.height);
            }

            // Border on right of enemy
            if (enemy.x > (canvas.width - enemy.width)) {
                enemy.x = (canvas.width - enemy.width);
            }
            // Border on left of enemy
            if (enemy.x < 0) {
                enemy.x = 0;
            }
        }
    
}


function shoot_bullet(bullets_array) {
    /*
        Function for creating bullets
        
        Calculating the angle that the bullet will have to fly in.
        Resource below was used to find the trajectory
        https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/atan2
    */

    if (shoot && pistol) {
        centre.x = player.x + (player.width/2);
        centre.y = player.y + (player.height/2);
        let angle = Math.atan2(ycoord - centre.y, xcoord - centre.x);
        let new_bullet = new Bullet(centre.x, centre.y, angle, 5, "pistol");
        bullets_array.push(new_bullet);
        shoot = false;
    }

    if (shoot && shotgun && (shotgun_timer === 0)) {
        centre.x = player.x + (player.width/2);
        centre.y = player.y + (player.height/2);
        let angle1 = Math.atan2((ycoord - 30) - (centre.y - 3), (xcoord - 30) - (centre.x - 3));
        let angle2 = Math.atan2(ycoord - centre.y, xcoord - centre.x);
        let angle3 = Math.atan2((ycoord + 30) - (centre.y + 3), (xcoord + 30) - (centre.x + 3));
        let new_bullet1 = new Bullet(centre.x, centre.y, angle1, 3, "shotgun");
        let new_bullet2 = new Bullet(centre.x, centre.y, angle2, 3, "shotgun");
        let new_bullet3 = new Bullet(centre.x, centre.y, angle3, 3, "shotgun");
        bullets_array.push(new_bullet1);
        bullets_array.push(new_bullet2);
        bullets_array.push(new_bullet3);
        shoot = false;
        shotgun_timer += 30;
    }
                
}

function move_bullet(bullets_array) {
    // Removing bullet if it hits border
    for (let bullet of bullets_array) {
        
        bullet.x += bullet.speed * Math.cos(bullet.angle)
        bullet.y += bullet.speed * Math.sin(bullet.angle)

    if (bullet.x - bullet.size <= 0 || 
        bullet.x >= canvas.width || 
        bullet.y >= canvas.height ||
        bullet.y + bullet.size <= 0) {
            let bullet_index = bullets_array.indexOf(bullet);
            bullets_array.splice(bullet_index, 1);
        }
    }    
}

function enemy_hit(enemies_array, bullets_array) {
    for (let enemy of enemies_array) {
        for (let bullet of bullets_array) {
            if (enemy.x + enemy.width < bullet.x ||
            bullet.x + bullet.size < enemy.x ||
            enemy.y > bullet.y + bullet.size ||
            bullet.y > enemy.y + enemy.height) {
            }

            else {  
                enemy.health = enemy.health - bullet.damage;
                if (enemy.health <= 0) {
                    score += 100;

                    // 0.05 chance to spawn power-up
                    if (power_up_spawn() === 0) {
                        let powerUp = new PowerUp(enemy.x, enemy.y);
                        powerUps.push(powerUp);
                    }
                    
                    let bullet_index = bullets_array.indexOf(bullet);
                    bullets_array.splice(bullet_index, 1);
                    let enemy_index = enemies_array.indexOf(enemy);
                    enemies_array.splice(enemy_index, 1);
                }
            }
        }
          
    }
}

function player_hit(enemies_array, player) {
    for (let enemy of enemies_array) {
    if (enemy.x + enemy.width < player.x ||
        player.x + player.width < enemy.x ||
        enemy.y > player.y + player.height ||
        player.y > enemy.y + enemy.height) {
            player.hit = false;
    }

    else {
        player.hit = true;
    }

    // 1 second of immunity frames for player if he is hit
    if (player.counter > 0) {
        player.counter -= 1;
    }

    else if (player.counter === 0 && player.hit) {
        player.health -=10;
        player.counter = 60;
        if (player.health === 0) {
            death()
        }
    }
    }
}

function death() {
    canvas.style.display = "none"
    window.cancelAnimationFrame(request_id);
    window.removeEventListener("keydown", activate);
    window.removeEventListener("keyup", deactivate);
    window.removeEventListener("mousedown", shoot_flag);
    let outcome_element = document.querySelector("#outcome");
    outcome_element.style.display = "block"

//     let data = new FormData();
//     data.append("score", score);

//     xhttp = new XMLHttpRequest();
//     xhttp.addEventListener("readystatechange", handle_response, false);
//     xhttp.open("POST", "store_score", true);
//     xhttp.send(data);
// }

// function handle_response() {
//     if ( xhttp.readyState === 4) {
//         if ( xhttp.status === 200 ) {
//             if ( xhttp.responseText === "success" ) {
//                 console.log("Yes")
//             }
//             else {
//                 console.log("No")
//             }
//         }
//     }
}

function load_assets(assets, callback) {
    let num_assets = assets.length;
    let loaded = function() {
        console.log("loaded");
        num_assets = num_assets - 1;
        if (num_assets === 0) {
            callback();
        }
    };
    for (let asset of assets) {
        let element = asset.var;
        if ( element instanceof HTMLImageElement ) {
            console.log("img");
            element.addEventListener("load", loaded, false);
        }
        else if ( element instanceof HTMLAudioElement ) {
            console.log("audio");
            element.addEventListener("canplaythrough", loaded, false);
        }
        element.src = asset.url;
    }
}

function temp_enemy_array(enemies_array, enemy) {
    let temp_array = [];
    for (let i = 0; i < enemies_array.length; i += 1) {
        if (enemies_array[i] != enemy) {
            temp_array.push(enemies_array[i]);
        }
    }
    return temp_array;
}

function enemy_spawner() {

// Creating enemies and adding them to an array
    if (enemies.length < enemy_counter) {
        let enemy = new Enemy(canvas.width/2, canvas.height);
        enemies.push(enemy);
        if (enemy_doors === 0) {
            let enemy = new Enemy(locations[randint(0, 1)], canvas.height/2);
            enemies.push(enemy);
        }
    }

    if (enemy_doors > 0) {
        enemy_doors -= 1;
    }

    if (enemy_timer > 0) {
        enemy_timer -= 1;
    }

    // Every 6 seconds, a new enemy will be added to the enemies array
    if (enemy_timer === 0) {
        enemy_counter += 1;
        enemy_timer += 240;
    }
}

function power_up_spawn() {
    let chance = Math.floor(Math.random() * 20)
    return chance;
}