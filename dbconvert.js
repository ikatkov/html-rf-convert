
var version = "0.9.4";
var vpeak2peak, vpeak, vrms, power, dBm, dBu, dBV, z0, correction;

function parseAll(f) {
    vpeak2peak = Math.abs(parseFloat(f.vpeak2peak.value));
    vpeak = Math.abs(parseFloat(f.vpeak.value));
    vrms = Math.abs(parseFloat(f.vrms.value));
    power = Math.abs(parseFloat(f.power.value));
    // power = Math.abs(parseFloat(f.power.value)) * 1e-3;
    dBm = parseFloat(f.dBm.value);
    dBu = parseFloat(f.dBu.value);
    dBV = parseFloat(f.dBV.value);
    z0 = Math.abs(parseFloat(f.z0.value));
    correction = parseFloat(f.correction.options[f.correction.selectedIndex].value);
}


function update_vpeak2peak(f) {
    parseAll(f);
    vpeak = vpeak2peak/2;
    update(f);
}

function update_vpeak(f) {
    parseAll(f);
    vpeak2peak = 2 * vpeak;
    update(f);
}
function update_vrms(f) {
    parseAll(f);
    vpeak = vrms * Math.sqrt(2) * Math.pow(10, correction / 20);
    vpeak2peak = 2 * vpeak;
    update(f);
}
function update_power(f) {
    parseAll(f);
    vrms = Math.sqrt(power * z0);
    vpeak = vrms * Math.sqrt(2) * Math.pow(10, correction / 20);
    vpeak2peak = 2 * vpeak;
    update(f);
}
function update_dBm(f) {
    parseAll(f);
    vrms = Math.sqrt((Math.pow(10, dBm / 10) / 1e3) * z0);
    vpeak = vrms * Math.sqrt(2) * Math.pow(10, correction / 20);
    vpeak2peak = 2 * vpeak;
    update(f);
}
var dBu0 = Math.sqrt(0.001 * 600);
function update_dBu(f) {
    parseAll(f);
    vrms = Math.pow(10, dBu / 20) * dBu0;
    vpeak = vrms * Math.sqrt(2) * Math.pow(10, correction / 20);
    vpeak2peak = 2 * vpeak;
    update(f);
}
function update_dBV(f) {
    parseAll(f);
    vrms = Math.pow(10, dBV / 20);	// /1e6
    vpeak = vrms * Math.sqrt(2) * Math.pow(10, correction / 20);
    vpeak2peak = 2 * vpeak;
    update(f);
}
function update_z0(f) {
    update_vpeak(f);
}

function update(f) {
    f.vpeak2peak.value = pretty(vpeak2peak,4);
    f.vpeak.value = pretty(vpeak,4);

    vrms = (vpeak / Math.sqrt(2)) / Math.pow(10, correction / 20);
    f.vrms.value = pretty(vrms, 4);
    f.power.value = pretty(vrms * vrms / z0, 4);
    //f.power.value = pretty(1000 * vrms * vrms / z0, 4);
    dBm = log10(1e3 * vrms * vrms / z0) * 10;
    f.dBm.value = pretty(dBm, 4);
    dBu = log10(vrms / dBu0) * 20;
    // log10(1e6*vrms*vrms/z0)*10;
    f.dBu.value = pretty(dBu, 4);
    dBV = log10(vrms) * 20;	// log10(1e6*vrms)
    f.dBV.value = pretty(dBV, 4);
}

var db_per_neper = (20 / Math.log(10));
function vgain_changed(f) {
    var vgain = parseFloat(f.vgain.value);
    var dbgain = log10(vgain) * 20;
    f.dbgain.value = pretty(dbgain, 4);
    f.npgain.value = pretty(dbgain / db_per_neper, 4);
}

function dbgain_changed(f) {
    var dbgain = parseFloat(f.dbgain.value);
    f.vgain.value = pretty(Math.pow(10, dbgain / 20), 4);
    f.npgain.value = pretty(dbgain / db_per_neper, 4);
}

function npgain_changed(f) {
    var npgain = parseFloat(f.npgain.value);
    var dbgain = npgain * db_per_neper;
    f.dbgain.value = pretty(dbgain, 4);
    f.vgain.value = pretty(Math.pow(10, dbgain / 20), 4);
}


function nc(el) {
    alert("This is a data output field and can't be changed");
}

function init() {
    preset(document.forms.convert);
    update_vpeak2peak(document.forms.convert);
    // vgain_changed(document.forms.convert);
}

if (window.attachEvent)
    window.attachEvent("onload", init);
else window.onload = init;

