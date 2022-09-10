//=============================================================================
// DynamicWeather.js
//=============================================================================
/*:
 * @plugindesc Plugin que introduce clima aleatorio en un mapa.
 *
 * @author Alex
 *
 * @help
 *
 * 
 *
 * TERMS OF USE
 * Solo para uso reservado.
 *
 * COMPATIBILITY
 * Es compatible con todos los plugins.
 */

function dynweather_tick(){  
    //some transition considerations
    var playerisTeleporting = $gameSwitches.value(21);   
    //every tick is a second.
    if(playerisTeleporting == false){
        $gameSwitches.setValue(33,false); //stop randomizing weather process.
        increment = $gameVariables.value(167) + 1;
        $gameVariables.setValue(167,increment);
        tick = $gameVariables.value(167);
        resetTime = $gameVariables.value(168);
        //make a random process every reset time seconds.
        if(tick >= resetTime){
            getID = getRandomInt(0,$gameVariables.value(169)); //obtain the setting that will be randomizing.
            console.log("id selected: " + getID);
            getChance = getRandomInt(0,100); //get Random chance that will be comparated with the setting chance.
            if(getChance <= $gameVariables.value(163)[getID]){
                console.log("Start weather!");
                $gameVariables.setValue(167,0);
                dynweather_start(getID);
            }else{
                console.log("No success!");
                $gameVariables.setValue(167,0); //reset tick timer.
                $gameSwitches.setValue(33,true); //enable randomizing weather process.
            }
        } else {
            $gameSwitches.setValue(33,true); //enable randomizing weather process. 
        }
    
    }

}

function dynweather_init(settings, maptype){
    //meta data    
    var GlobalTime = $gameVariables.value(209);
    var mapID = $gameVariables.value(210);
    try{
        var id = $gameVariables.value(207)[mapID].id;
        var mapTime = $gameVariables.value(207)[mapID].maptime;
        var mapEffect = $gameVariables.value(207)[mapID].effect;
    }
    catch(ex){
        $gameVariables.value(207)[mapID] = {id: 0, maptime: GlobalTime, effect: 0};
        var mapTime = GlobalTime;
        var mapEffect = 0;
        var id = 0;
    }
    console.log('current map effect: ' + mapEffect);
    //save maptype value.
    $gameVariables.setValue(162,maptype);
    //initialization process. 
    if((maptype == 0) || (maptype == 2)){
        dynweather_stop(); //disable weather process.
    }else{
        var mapRelation = $gameVariables.value(180);
        if(mapRelation == 0){
            let a = settings.length;
            var chance, effect, intensity, duration,rgb;
            chance = [];
            effect = [];
            intensity = [];
            duration = [];
            rgb = [];
            for(var i = 0; i < a; i++){
                chance[i] = settings[i].c;
                console.log(chance[i]);
                effect[i] = settings[i].e;
                intensity[i] = settings[i].i;
                duration[i] = settings[i].d;
                rgb[i] = {r: 0, g: 0, b: 0, grey: 0};
                rgb[i].r = settings[i].r;
                rgb[i].g = settings[i].g;
                rgb[i].b = settings[i].b;
                rgb[i].grey = settings[i].grey;
                console.log(settings[i].c + " | " + settings[i].e + " | " + settings[i].i + " | " + settings[i].d);
            }
            $gameVariables.setValue(163,chance);
            $gameVariables.setValue(164,effect);
            $gameVariables.setValue(165,intensity);
            $gameVariables.setValue(166,duration);
            $gameVariables.setValue(169,chance.length);
            $gameVariables.setValue(212,(GlobalTime - mapTime)); //define new weather duration.
            $gameVariables.setValue(213,rgb); //tint screen storage.
            dynweather_stop_last();
            if(mapEffect == 0){
                $gameSwitches.setValue(33,true); //enable randomizing process.
            }else{
                if((GlobalTime - mapTime) > duration[id]){
                    $gameSwitches.setValue(33,true); //enable randomizing process.
                    console.log('fixing map effect: 0');
                }else{
                   dynweather_start(id);
                }
            }
            
        }else{
            var lastMapID = $gameVariables.value(216);
            var id = $gameVariables.value(207)[lastMapID].id;
            var mapTime = $gameVariables.value(207)[lastMapID].maptime;
            var mapEffect = $gameVariables.value(207)[lastMapID].effect;
            $gameVariables.setValue(212,(GlobalTime - mapTime)); //define new weather duration.
            console.log('last map effect: ' + mapEffect);
            if(mapEffect != 0){
                dynweather_start(id);
            }else{
                $gameSwitches.setValue(33,true); //enable randomizing process.  
            }
        }
    }

}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function dynweather_start(getID){
    $gameSwitches.setValue(33,false); //stop randomizing weather process.
    var time;
    var screen = $gameVariables.value(213)[getID];
    var mapID = $gameVariables.value(210); //map id.
    var mapEffect = $gameVariables.value(207)[mapID].effect; //map last effect applied.
    var Interpreter = new Game_Interpreter()
    Interpreter.pluginCommand('clear_weather', [' : ', '0']); //disable default weather 0
    Interpreter.pluginCommand('clear_weather', [' : ', '1']); //disable default weather 1
    //re-define.
    weather = {effect: "none", intensity: 0, duration: 0}
    weather.effect = $gameVariables.value(164)[getID];
    weather.intensity = $gameVariables.value(165)[getID];
    if(mapEffect == 0){ //verify if exist any current effect on the map.
        weather.duration = $gameVariables.value(166)[getID]; //duration in seconds unit.
        time = 240; //generates a smooth screen tint
    }else{
        weather.duration = $gameVariables.value(212); //apply difference duration made by: GlobalTime - mapTime.
        time = 1; //instant screen tint.
    }   
    $gameVariables.setValue(179,weather.effect); //storage weather current effect.
    $gameVariables.setValue(211,getID); //storage current weather id.
    //weather strings: none, rain, storm, snow.
    try{
        $gameScreen.startTint([screen.r,screen.g,screen.b,screen.grey], time); //tint screen
    }
    catch(ex){
        console.log('#########################################################');
        console.log('unexpected exception: unable to initialize startTint function');
        console.log('exception type: ' + ex.message);
        console.log('weather ID: ' + getID);
        console.log('checking values of the dynamic weather screen colors vector');
        for(k = 0; k < $gameVariables.value(213).length; k++){
            console.log('*Weather ID: ' + k + ' | ' + ' RGB Values: ' + ' R: ' + $gameVariables.value(213)[k].r + ' G: ' + $gameVariables.value(213)[k].g + ' B: ' + $gameVariables.value(213)[k].b + ' Grey: ' + $gameVariables.value(213)[k].grey);
        }
        console.log('aborting function process');
        console.log('#########################################################');
        dynweather_stop(); //stoping weather process.
        return 0;
    }
    
    switch(weather.effect){
        case 1:
            weather.effect = "rain";
            AudioManager.playBgs({ name: "Storm1", volume: 100, pitch: 100, pan: 0});
            dynweather_default(weather.effect, weather.intensity);
        break;
        case 2:
            weather.effect = "storm";
            AudioManager.playBgs({ name: "Storm2", volume: 100, pitch: 100, pan: 0});
            dynweather_default(weather.effect, weather.intensity);
        break;
        case 3:
            weather.effect = "snow";
            dynweather_default(weather.effect, weather.intensity);
        break;
        case 4:
            var weather_vector = [];
            //rain
            weather_vector.push({filename: "Rain_01A", power: '50', type: '13', speed: '100', blend_type: '0'});
            //leaf 
            weather_vector.push({filename: 'Leaf_01A', power: '55', type: '1', speed: '139', blend_type: '0'});
            //bgs
            AudioManager.playBgs({ name: "Storm2", volume: 100, pitch: 100, pan: 0});
            //function
            dynweather_plugin(weather_vector);
        break;
        case 5:
            var weather_vector = [];
            //rain
            weather_vector.push({filename: "Rain_01A", power: '80', type: '13', speed: '100', blend_type: '0'});
            //bgs
            AudioManager.playBgs({ name: "Storm1", volume: 100, pitch: 130, pan: 0});
            //function
            dynweather_plugin(weather_vector);
        break;
    }
    $gameVariables.setValue(170, weather.duration); //weather duration variable
    $gameSwitches.setValue(34,true); //weather duration control process.   
}

function dynweather_stop(){
    console.log('removing weather..');
    var maptype = $gameVariables.value(162); //maptype value.
    $gameVariables.setValue(179,0); //weather current effect.
    $gameVariables.setValue(211,0); //weather current id.
    $gameScreen.changeWeather("none", 0, 1); //disable weather effect.
    var Interpreter = new Game_Interpreter();
    for(i = 2; i < $gameVariables.value(178) + 2; i++){
        Interpreter.pluginCommand('clear_weather', [' : ', i.toString()]); //clear plugin weather.
    }
    $gameVariables.setValue(170,0); //force duration to zero.
    $gameSwitches.setValue(34,false); //force duration control process to off.
    if ((maptype != 0) && (maptype != 2)){
        $gameSwitches.setValue(33,true); //enable randomizing process only depending of maptype.
    } 
    dynweather_force_default(); //force start default map weather.
    dynweather_tint_screen(); //force tint map default color.

}

function dynweather_stop_last(){
    $gameScreen.changeWeather("none", 0, 1); //disable weather effect.
    var Interpreter = new Game_Interpreter();
    for(i = 2; i < $gameVariables.value(178) + 2; i++){
        Interpreter.pluginCommand('clear_weather', [' : ', i.toString()]); //clear plugin weather.
    }
}

function dynweather_default(effect, intensity){
    $gameScreen.changeWeather(effect, intensity, 0); //start weather with default script.
}

function dynweather_plugin(weather){
    //weather : 2 : 13 : 50 : 100 : 0 : Rain_01A
    $gameVariables.setValue(178,weather.length);
    var Interpreter = new Game_Interpreter()
    for(i = 0; i < weather.length; i++){
        Interpreter.pluginCommand('weather', [' : ', (i+2).toString(), ' : ', weather[i].type, ' : ', weather[i].power, ' : ', weather[i].speed, ' : ', weather[i].blend_type, ' : ', weather[i].filename]);
    }   
}

function dynweather_save_default(weather,sound){ //save map default weather configs.
    if(weather.length != 0){
    var a = weather.length;
    var id,type,speed,blend_type,filename;
    id = [];
    type = [];
    power = [];
    speed = [];
    blend_type = [];
    filename = [];
    for(var i = 0; i < a; i++){
        id[i] = weather[i].id;
        type[i] = weather[i].type;
        power[i] = weather[i].power;
        speed[i] = weather[i].speed;
        blend_type[i] = weather[i].blend_type;
        filename[i] = weather[i].filename;
    }
    $gameVariables.setValue(171,id);
    $gameVariables.setValue(172,type);
    $gameVariables.setValue(173,power);
    $gameVariables.setValue(174,speed);
    $gameVariables.setValue(175,blend_type);
    $gameVariables.setValue(176,filename);
    $gameVariables.setValue(177,a);
    $gameVariables.setValue(214,{name: 'null'});
    }else{
        var a = weather.length;
        var id,type,speed,blend_type,filename;
        id = [];
        type = [];
        power = [];
        speed = [];
        blend_type = [];
        filename = []; 
        $gameVariables.setValue(171,id);
        $gameVariables.setValue(172,type);
        $gameVariables.setValue(173,power);
        $gameVariables.setValue(174,speed);
        $gameVariables.setValue(175,blend_type);
        $gameVariables.setValue(176,filename);
        $gameVariables.setValue(177,a);
    }
    if(sound.name != 'null'){
        $gameVariables.setValue(214,sound);
    }
}

function dynweather_start_default(weather,sound){ //start map default weather configs.
    console.log('weather default length = ' + weather.length);
    if(weather.length != 0){
        var Interpreter = new Game_Interpreter();
        for(var i = 0; i < $gameVariables.value(177); i++){
            Interpreter.pluginCommand('weather', [' : ', weather[i].id.toString(), ' : ', weather[i].type.toString(), ' : ', weather[i].power.toString(), ' : ', weather[i].speed.toString(), ' : ', weather[i].blend_type.toString(), ' : ', weather[i].filename]);   
        }
    }  
    if(sound.name != 'null'){
        AudioManager.playBgs({ name: sound.name, volume: sound.volume, pitch: sound.pitch, pan: sound.pan});
    }   
}

function dynweather_force_default(){ //force map default weather configs without weather array.
    if($gameVariables.value(177) != 0){
        var id,type,speed,blend_type,filename,sound;
        sound = $gameVariables.value(214);
        id = [];
        type = [];
        power = [];
        speed = [];
        blend_type = [];
        filename = [];
        for(var i = 0; i < $gameVariables.value(177); i++){
            id[i] = $gameVariables.value(171)[i];
            type[i] = $gameVariables.value(172)[i];
            power[i] = $gameVariables.value(173)[i];
            speed[i] = $gameVariables.value(174)[i];
            blend_type[i] = $gameVariables.value(175)[i];
            filename[i] = $gameVariables.value(176)[i];
        }
        var Interpreter = new Game_Interpreter();
        for(var i = 0; i < $gameVariables.value(177); i++){
            Interpreter.pluginCommand('weather', [' : ', id[i].toString(), ' : ', type[i].toString(), ' : ', power[i].toString(), ' : ', speed[i].toString(), ' : ', blend_type[i].toString(), ' : ', filename[i]]);   
        }
        if(sound.name != 'null'){
            AudioManager.playBgs({name: sound.name, volume: sound.volume, pitch: sound.pitch, pan: sound.pan});
        }else{
            AudioManager.fadeOutBgs(1);
        }
    }    
}

function init_tint_screen(r,g,b,grey,frames){
    $gameVariables.setValue(202,r);
    $gameVariables.setValue(203,g);
    $gameVariables.setValue(204,b);
    $gameVariables.setValue(205,grey);
    $gameVariables.setValue(206,frames);
    $gameScreen.startTint([r,g,b,grey], frames);
}

function dynweather_tint_screen(){ //force tint screen.
    r = $gameVariables.value(202);
    g = $gameVariables.value(203);
    b = $gameVariables.value(204);
    grey = $gameVariables.value(205);
    frames = $gameVariables.value(206);
    $gameScreen.startTint([r,g,b,grey], frames);
}

//var myInterpreter = new Game_Interpreter()
//myInterpreter.pluginCommand('OuterSelfSwitch', ['on', '3', 'A']);
//clear_weather : 2

//tasks:
/*
-fix bug, that start a weather in another map.
-fix bug, that in map of relation type 1, the default weather is not removing in both cases.
-fix bug, sound of weather or default sound of another map dont stoping in some maps that doesnt have default sound.
-fix bug, exception on tint screen color on dynweather_start function ?? WTF.
*/