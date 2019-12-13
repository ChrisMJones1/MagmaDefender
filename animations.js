/*jslint browser: true*/
/*global $, jQuery*/
//set the onload function
window.onload = function() {
  //set all the needed global variables
  var Move_Box = document.getElementById("move_box");
  var play_stage = document.getElementById("stage");
  var position = 0;
  var enemy_id = 0;
  var projectile_id = 0;
  var game_speed = 33;
  var shoot_reset = true;
  var gameOver = false;
  var kill_count = 0;
  var lives = 3;
  var game_timer;
  var damage_reset = true;
  var enemy_spawn_chance = 0.98;
  var max_enemy_spawn = 3;
  //set listener function for click on the stage element to begin the game
  $("#stage").click(start_click);
  function start_click() {
    //set the scroll of the html to match the game stage
    $('html').scrollTop($("#stage").offset().top);
    //remove click listener
    $("#stage").unbind('click');
    //remove message and overlay
    $(".message_background").remove();
    //begin game render function interval
    var game_timer = setInterval(play_game, game_speed);
  }
  //begin game
  function play_game() {
    //game over handling
    if (gameOver === true) {
      clearInterval(game_timer);
      return;
    }
    //move projectile and enemy elements each cycle
    $('.projectile_box').animate({bottom: '+=5'}, 33, "linear");
    $('.enemy_box').animate({bottom: '-=3'}, 33, "linear");
    //run function to check and handle volcano position
    checkbounds();
    //check collision and boundaries of projectiles
    if($('.projectile_box').length > 0) {
      $('.projectile_box').each(function(projectile_index, projectile_element){
        var projectile_position = $(projectile_element).position();
        //remove the projectile if it is passed the top boundary, and remove it if it is
        if(projectile_position.top < -68) {
         $(projectile_element).remove();
        }
        //check collision between projectiles and enemies only if there are enemies spawned
        if($('.enemy_box').length > 0) {
          $('.enemy_box').each(function(enemy_index, enemy_element) {
            var enemy_position = $(enemy_element).position();
            //check if there is collision between the projectiles and the enemies
            if((enemy_position.top + $(enemy_element).height()) > projectile_position.top && enemy_position.left < (projectile_position.left + $(projectile_element).width()) && (enemy_position.left + $(enemy_element).width()) > projectile_position.left) {
              //create and insert explosion animated element
              var explosion;
              explosion = document.createElement('div');
              explosion.setAttribute('class', 'enemy_kill');
              explosion.setAttribute('id', 'enemy_kill_' + kill_count);
              explosion.style.left = enemy_position.left + "px";
              explosion.style.top = enemy_position.top + 'px';
              explosion.style.transform = "rotate(" + getRotationDegrees($(enemy_element)) + "deg)";
              play_stage.appendChild(explosion);
              //set listener for when the explosion ends to remove it
              $('#enemy_kill_' + kill_count).on('webkitAnimationEnd oanimationend oAnimationEnd msAnimationEnd animationend', remove_explosion);
              enemy_element.remove();
              projectile_element.remove();
              kill_count++;
              //increase the spawn rate and max enemy limit every 5 and 10 points respectively
              if(kill_count % 5 === 0 && enemy_spawn_chance > 0) {
                enemy_spawn_chance -= 0.01;
                if (kill_count % 10 === 0) {
                  max_enemy_spawn++;
                }
              }
              //output the score
              $(".score_box").html(kill_count);

            }
          });
        }
      });
    }
    //check if an enemy has hit the ground, and make them lose a life / end the game
    if($('.enemy_box').length > 0) {
      $('.enemy_box').each(function(enemy_index, enemy_element) {
        var enemy_position = $(enemy_element).position();
        if(enemy_position.top > 600) {
          //if a magma ball hits the ground with no lives left, begin game over
          if(lives <= 0) {
            $('.enemy_box').remove();
            $("#damage_box").remove();
            clearInterval(game_timer);
            $('#stage').html("<div class='message_background'><h3 class='message'>GAME OVER!</h3><h3 class='message second'>Your score was: "+ kill_count +"</h3></div>");
            gameOver = true;
            return;
          }
          enemy_element.remove();
          //if enemy hits the ground with lives left, remove the life, and run the flicker damage animation, which will also give invincibility frames
          if (damage_reset === true) {
            damage_reset = false;
            $('#damage_box').addClass("run_flicker");
            $('.run_flicker').on('webkitAnimationEnd oanimationend oAnimationEnd msAnimationEnd animationend', remove_flicker);
          }

        }
      });
    }
    //game over handling
    if (gameOver === true) {
      return;
    }
    //enemy spawn function, creates enemy based off of max_enemy_spawn and enemy spawn chance
    if($('.enemy_box').length < max_enemy_spawn && Math.random() > enemy_spawn_chance && gameOver === false) {
      var enemy;
      var enemy_pos = (Math.random() * (380));
      enemy = document.createElement('div');
      enemy.setAttribute('class', 'enemy_box');
      enemy.setAttribute('id', "enemy_" + enemy_id);
      enemy.style.left = enemy_pos + "px";
      enemy.style.bottom = 625 + 'px';
      play_stage.appendChild(enemy);
      enemy_id++;
    }
  }
  //listeners for keypress and keyup events
  document.addEventListener('keydown', box_move);
  document.addEventListener('keyup', fire_reset);

  //function to handle volcano jumping from one edge of the page to the other when it goes past the stage boundary
  function checkbounds() {
    position = $('#move_box').position();
    if(position.left  < -50 || (position.left + $('move_box').width()) > 350) {
      if(position.left < -50) {
        $('#move_box').css('left', '350px');
      }
      else {
        $('#move_box').css('left', '-50px');
      }
    }
  }
    //function to remove explosion animation after the animation finishes
    function remove_explosion() {
    this.remove();
    $('#enemy_kill_' + kill_count).off('webkitAnimationEnd oanimationend oAnimationEnd msAnimationEnd animationend', remove_explosion);
  }
  // function to remove and reset flicker after animation completed, take away a life, and reset invincibility state conferred by damage_reset
  function remove_flicker() {
    $('.run_flicker').off('webkitAnimationEnd oanimationend oAnimationEnd msAnimationEnd animationend', remove_flicker);
    $('#damage_box').removeClass('run_flicker');
    $('#life_' + lives).remove();
    lives--;
    damage_reset = true;
  }
  //function to remove/reset volcano shoot animation class after animation completes
  function remove_shoot() {
    $('.volcano_shoot').on('webkitAnimationEnd oanimationend oAnimationEnd msAnimationEnd animationend', remove_shoot);
    $('#volcano').removeClass('volcano_shoot');
  }
  //function to remove/reset right skew (when the volcano moves right) animation class after animation completes
  function remove_Rskew() {
    $('.skew_right').off('webkitAnimationEnd oanimationend oAnimationEnd msAnimationEnd animationend', remove_Rskew);
    $('#skew_box').removeClass('skew_right');
  }
  //same as Rskew, but for the left move skew
  function remove_Lskew() {
    $('.skew_left').off('webkitAnimationEnd oanimationend oAnimationEnd msAnimationEnd animationend', remove_Lskew);
    $('#skew_box').removeClass('skew_left');
  }
  //function that resets button input trigger such that the volcano cannot shoot/move without releasing the key first.
  function fire_reset() {
      shoot_reset = true;
  }

  /*Credit to user stackoverflow user TwystO for the following function for computing the current rotation state of an element*/
  function getRotationDegrees(obj) {
    var matrix = obj.css("-webkit-transform") ||
    obj.css("-moz-transform")    ||
    obj.css("-ms-transform")     ||
    obj.css("-o-transform")      ||
    obj.css("transform");
    if(matrix !== 'none') {
        var values = matrix.split('(')[1].split(')')[0].split(',');
        var a = values[0];
        var b = values[1];
        var angle = Math.round(Math.atan2(b, a) * (180/Math.PI));
    } else { var angle = 0; }
    return (angle < 0) ? angle + 360 : angle;
}
  //function to handle keyboard inputs, right arrow key, left arrow key, and space button to shoot
  function box_move(ko) {
    //moving the volcano right when the right arrow key is pressed
    if (ko.keyCode === 39 && shoot_reset === true){
      $('#move_box').animate({left: '+=50'}, 33, "linear");
      $('#skew_box').addClass("skew_right");
      $('.skew_right').on('webkitAnimationEnd oanimationend oAnimationEnd msAnimationEnd animationend', remove_Rskew);
      shoot_reset = false;
    }
    //moving the volcano left when the left arrow key is pressed
    if (ko.keyCode === 37 && shoot_reset === true){
      $('#move_box').animate({left: '-=50'}, 33, "linear");
      $('#skew_box').addClass("skew_left");
      $('.skew_left').on('webkitAnimationEnd oanimationend oAnimationEnd msAnimationEnd animationend', remove_Lskew);
      shoot_reset = false;
    }
    //shoot a fireball if the spacebar is pressed, and disable the spacebar scroll
    if (ko.keyCode === 32){
      ko.preventDefault();
      if(shoot_reset === true) {
        var shooty;
        shooty = document.createElement('div');
        shooty.setAttribute('class', 'projectile_box');
        shooty.setAttribute('id', 'projectile_' + projectile_id);
        shooty.style.left = position.left + 48 + "px";
        shooty.style.bottom = 0 + 'px';
        play_stage.appendChild(shooty);
        flamey = document.createElement('div');
        flamey.setAttribute('class', 'fireball');
        document.getElementById('projectile_' + projectile_id).appendChild(flamey);
        $('#volcano').addClass("volcano_shoot");
        $('.volcano_shoot').on('webkitAnimationEnd oanimationend oAnimationEnd msAnimationEnd animationend', remove_shoot);
        $('.projectile_box')
        projectile_id++
        shoot_reset = false;
      }

      }
    }
  }
