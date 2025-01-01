var vpeak2peak, vpeak, vrms, power, dBm, dBu, dBV, z0, correction;


function log10(x) {
    return Math.log(x) / Math.LN10;
}

function truncate(num) {
    return Math[num < 0 ? "ceil" : "floor"](num);
}

function ntz(str) {
    return str.replace(/\.0+$|\.(\d*?)0+$/, ".$1").replace(/\.$/, "");
}

function mantissa(num) {
    return num / Math.pow(10, Math.floor(log10(Math.abs(num))));
}

function pretty(n, d) {
    if (n === 0) return "0";
    if (isNaN(n)) return n + "";
    if ((n + "").indexOf("Inf") >= 0) return n + "";

    var exp = Math.floor(log10(Math.abs(n)));
    if (exp < -99) return "0";

    var nm = mantissa(n) * Math.pow(10, d);
    nm = Math.round(nm) / Math.pow(10, d);
    if (Math.abs(nm) >= 10) {
        nm /= 10;
        exp += 1;
    }

    var s = n < 0 ? 1 : 0;
    var ns = (nm * Math.pow(10, d - 1) * Math.pow(10, exp - d + 1)).toFixed(d);

    let result = "";
    if (exp > 3 || exp < -3) {
        let nms = nm.toFixed(d);
        if (nms.substring(0, 1) === ".") nms = "0" + nms;
        if (nms.substring(0, 2) === "-.") nms = "-0" + nms.substring(1);

        result = ntz(nms) + "e" + exp;
    } else {
        if (ns.substring(0, 1) === ".") ns = "0" + ns;
        if (ns.substring(0, 2) === "-.") ns = "-0" + ns.substring(1);

        if (exp < 0) result = ntz(ns.substring(0, -exp + d + s));
        else result = ntz(ns.substring(0, Math.max(exp + s + 1, d + s)));
    }
    return result;
}

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

function addChangeAnimation(element, value) {
    // Remove any existing animations
    element.classList.remove('value-changed', 'error-changed');
    
    // More robust NaN check that works across all browsers
    if (value === "NaN" || value === "" || Number.isNaN(Number(value))) {
        element.classList.add('error-changed');
    } else {
        element.classList.add('value-changed');
    }

    // Remove class after animation completes
    element.addEventListener('animationend', () => {
        element.classList.remove('value-changed', 'error-changed');
    }, {once: true});
}

function update(f) {
    const prevValues = {
        vpeak2peak: f.vpeak2peak.value,
        vpeak: f.vpeak.value,
        vrms: f.vrms.value,
        power: f.power.value,
        dBm: f.dBm.value,
        dBu: f.dBu.value,
        dBV: f.dBV.value
    };

    f.vpeak2peak.value = pretty(vpeak2peak,4);
    f.vpeak.value = pretty(vpeak,4);

    vrms = (vpeak / Math.sqrt(2)) / Math.pow(10, correction / 20);
    f.vrms.value = pretty(vrms, 4);
    f.power.value = pretty(vrms * vrms / z0, 4);
    dBm = log10(1e3 * vrms * vrms / z0) * 10;
    f.dBm.value = pretty(dBm, 4);
    dBu = log10(vrms / dBu0) * 20;
    f.dBu.value = pretty(dBu, 4);
    dBV = log10(vrms) * 20;
    f.dBV.value = pretty(dBV, 4);

    Object.keys(prevValues).forEach(key => {
        if (prevValues[key] !== f[key].value) {
            addChangeAnimation(f[key], f[key].value);
        }
    });
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

function init() {
    update_vpeak2peak(document.forms.convert);
}

if (window.attachEvent)
    window.attachEvent("onload", init);
else window.onload = init;

