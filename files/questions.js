/* exclusion from remix */
var DontIncludeFromRemix1 = [""]; // Jumbled Mode
var DontIncludeFromRemix2 = [""]; // Swap Mode
var DontIncludeFromRemix3 = [""]; // Identification Mode

/* game configuration */
var identificationMode = false;
var drainBy = -0.005;
var wrongDamage = 17;
var examMode = false; // no practice mode 
var PanicMode = false; // with health and timer
var RemixModeRarity = 4; // the lower the value, the more remixes occuring | if 0 then all will be remix mode

/* level management */
var DontIncludeGroups = [""];

/* music configuration*/
var bgmusic0_PF = 'sndtrck/bgmusic0.mp3';
var bgmusic1_PF = 'sndtrck/bgmusic1.mp3';
var bgmusic2_PF = 'sndtrck/bgmusic2.mp3';
var bgmusic3_PF = 'sndtrck/bgmusic3.mp3'; 
var bgmusic4_PF = 'sndtrck/bgmusic4.mp3'; 
var noMusic = false; // noMusic in practice mode??
