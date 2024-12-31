// rci.js
// Miscellaneous utilities
// Copyright 1999-2004 Rode Consulting, Inc.
// All rights reserved.

var rci_lib_version="0.9.22.1";

var bad_browser = true;

function trim(s) {
  while (s.length > 1 && (" \t\r\n").indexOf(s.substring(0,1)) >= 0)
	s = s.substring(1);
  while (s.length > 0 && (" \t\r\n").indexOf(s.substring(s.length-1)) >= 0)
	s = s.substring(0,s.length-1);
  return s;
}

function log10(x) {
	return Math.log(Math.abs(x))/Math.LN10;
}

function pretty(n, d) {
    if (n === 0) return "0";
    if (isNaN(n)) return n + "";
    if ((n + "").indexOf("Inf") >= 0) return n + "";

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


// pretty_abs returns a string truncated to an absolute precision, rather
// than a relative number of decimal places.

var MAX_PREC=8;
function pretty_abs(n,p) {
	if (isNaN(n)) return n+"";
	if ((n+"").indexOf("Inf") >= 0) return n+"";

	var n_log = (n != 0) ? Math.floor(log10(n)) : 0;
	var p_log = (p != 0) ? Math.floor(log10(p)) : 0;
	if (n_log<(p_log-0.30103)) return "0";

	var p_norm = Math.abs(p)/Math.pow(10,p_log);
	var p_norm_str = (p_norm+"").substring(0,MAX_PREC);
	for (p_extra_prec=Math.min(MAX_PREC,p_norm_str.length)-1; p_extra_prec>0; p_extra_prec--)
	if (p_norm_str.substring(p_extra_prec,p_extra_prec+1) != "0") break;

	return pretty(n, n_log-p_log+1+p_extra_prec);
}

// Retrieve a single value from a URL
function getArg(name) {
	var qix = location.href.indexOf("?");
	var value = "";
	if (qix >= 0)
	value = getArgString(name,location.href);

	return value;
}
function getArgString(name,str) {
	var qix = Math.max(str.indexOf("?"),-1);
	var value = "";

	var href = "&"+str.substring(qix+1);
	var loc = href.indexOf("&"+name+"=");
	if (loc < 0) return "";
	value = href.substring(loc+name.length+2);
	if (value.indexOf("&") >= 0)
	value = value.substring(0,value.indexOf("&"));

	return unescape(value);
}

var lower_case_formnames = true;

// Preset form values from URL arguments
function preset(f) {	presetString(f,location.href);	}
function presetString(f,args,doeval,precision,map_arg) {

	if (arguments.length < 3) doeval = false;
	if (arguments.length < 4) precision = 4;
	if (arguments.length < 5) map_arg = null;

	if (args.indexOf("?") >= 0) args = args.substring(args.indexOf("?")+1);
	while (args.indexOf("=") > 0) {
		var name = args.substring(0,args.indexOf("="));
		var value = getArgString(name,args);
		if (doeval) { value=eval(value); }

		if (args.indexOf("&") > 0) args = args.substring(args.indexOf("&")+1);
		else args="";

		if (name == "inamp") continue;

		if (lower_case_formnames) name = name.toLowerCase();
		if (!f[name] && map_arg) name = map_arg[name];

		if (f[name]) {
			if (f[name].units)
				setValueUnits(f[name],value,precision);
			else	f[name].value = value;
			f[name].save = f[name].value;
		}
	}
}

function toHex(n,w){
	var hexchars="0123456789ABCDEF";
	var hex="";
	if (w>0)	// Fixed width
 	for (var i=0; i<w; i++) {
		hex = hexchars.charAt( n&0xF )+hex;
		n >>= 4;
	}
	else	// Variable width
	if (n==0) return "0";
	var neg=(n<0);
	if (neg) n=-n;
	while (n > 0) {
		hex = hexchars.charAt( n&0xF )+hex;
		n >>= 4;
	}
	if (neg) hex = "-"+hex;
	return hex;
}

var originalY = 0;
applet_list = new Array();
function watchY() {
  if (	navigator.appVersion.indexOf("MSIE")<0 || 
	navigator.userAgent.indexOf("Opera")>0 ) return;

  if (document.documentElement.scrollTop != originalY) {
	for (var i=0; i<applet_list.length; i++)
	if (applet_list[i])
	applet_list[i].manualRefresh();
	originalY = document.documentElement.scrollTop;
  }

  setTimeout('watchY()',250);
}

function watchY2() {
  if (	navigator.appVersion.indexOf("MSIE")<0 || 
	navigator.userAgent.indexOf("Opera")>0 ) return;

  if (document.documentElement.scrollTop != originalY) {
	for (var i=0; i<applet_list.length; i++)
	if (applet_list[i]) {
	applet_list[i].hide();
	applet_list[i].show();
	applet_list[i].setVisible(true);
	}
	originalY = document.documentElement.scrollTop;
  }

  setTimeout('watchY2()',250);
}

var originalLayerCount = 0;
function watchLayers() {
  if (document.layers && (document.layers.length < originalLayerCount)) {
	alert("A resize failure has been detected in Netscape 4.\nThe page will now be reloaded and entered form data may be lost.\n");
	history.go(0);
  }

  setTimeout('watchLayers()',250);
}

var ns4w32 = ( (navigator.appName == "Netscape") &&
		(parseFloat(navigator.appVersion) < 5) &&
		(navigator.platform == "Win32") );

var ns4w32_plugin = false;
if (ns4w32) 
	for (i=0; i<navigator.plugins.length; i++)
	ns4w32_plugin =  ns4w32_plugin || (navigator.plugins[i].name.indexOf("Java") >= 0);

var use_prefix = false;

var useEmbed =  ns4w32_plugin && !navigator.javaEnabled();
var useObject = navigator.appVersion.indexOf("MSIE")>=0 && !navigator.javaEnabled();

//alert(navigator.appVersion);
//alert(navigator.javaEnabled());
//alert(useEmbed+" "+useObject);

function param() { this.name=""; this.value="" }
function add_param(params,n,v) {
  params[params.length] = new param();
  params[params.length-1].name = n;
  params[params.length-1].value = v;
}

var write_save="";
function write(s) {
	document.writeln(s);
	write_save+=s;
}

function getApplet(name) {
	if (useEmbed && document.embeds.length > 0)
			return document.embeds.name;
	if (useObject)	return document.all[name];
	else if (document.applets)
			return document.applets[name];
	else		return null;
}
function getAppletInDocument(d,name) {
	if (useEmbed && d.embeds.length > 0)
			return d.embeds.name;
	if (useObject)	return d.all[name];
	else if (d.applets)
			return d.applets[name];
	else		return null;
}

var SunJRE  = "CAFEEFAC-0015-0000-0005-ABCDEFFEDCBA";
//var SunJRE2 = "http://java.sun.com/update/1.4.2/jinstall-1_4_2_10-windows-i586.cab#Version=1,1,0,0";
var SunJRE2 = "http://java.sun.com/update/1.5.0/jinstall-1_5_0_05-windows-i586.cab#Version=1,1,0,0";
var autoinstall = false;

var codebase_prefix = "";

function instantiate_applet(name,code,codebase,archive,width,height,params,extra) {

//	if (!navigator.javaEnabled()) alert("Note: this tool requires Java to be installed and enabled.\n\nAttempting automatic installation of Java plug-in.\nContact your System Administrator for advice and approval.");

// code must be a relative param
// codebase must be an absolute path, i.e. must start with "/"
// archive must be a relative path

	if (codebase.indexOf("/") == 0) {
		 l = location.href;
		 l = l.substr(0,l.lastIndexOf("/")+1);
		 l = l.substr(l.indexOf("techSupport"));
// Temporary hack
		 rd = "_redesign";
		 if (l.indexOf(rd) > 0)
		 l = l.substr(0,l.indexOf(rd))+
			 l.substr(l.indexOf(rd)+rd.length);
		
		 //codebase = codebase.substr(codebase.indexOf(l)+l.length);
		// if (codebase.indexOf("lineAppX")==0) codebase = "../applets/"+codebase;
		// if (codebase == "") codebase = "./";
	}

	write_save="";
	if (useObject) {
	write('<object id="'+name+'" classid="clsid:'+SunJRE+(autoinstall?'" codebase="'+SunJRE2:'')+'" width="'+width+'" height="'+height+'" >');
	write('<param name="type" value="application/x-java-applet;version=1.1">');
	write('<param name="code" value="'+code+'">');
	write('<param name="codebase" value="'+codebase+'">');
	write('<param name="documentbase" value="'+location.href+'">');
	write('<param name="archive"  value="'+archive+'">');
	} 
	else {
		if (useEmbed) write(
			'<embed name="'+name+'" type="application/x-java-applet;version=1.1" pluginspage="http://java.sun.com/products/plugin/index.html#download" scriptable="true" mayscript="true" '
		);
		else write( '<applet name="'+name+'" mayscript ' );

		var host = location.href.substring(5);
		if (host.indexOf(":")>0) {
			host = host.substring(host.indexOf(":"));
			host = host.substring(0,host.indexOf("/"));
		}
		else host = "";

		write(
			'code="'+code+
			'" codebase="'+(use_prefix ? codebase_prefix+host:"")+codebase+
			'" documentbase="'+location.href+
			'" archive="'+archive+
			'" width="'+width+'" height="'+height+'" '+
			((extra!=null)? extra:"")+' '
		);
	}

	if (useEmbed) {
		if (params) 
		for (var i=0; i<params.length; i++)
		  write(params[i].name+'="'+params[i].value+'" ');
		write("></embed>");
	}
	else {
		if (!useObject) write(">");
		write('<param name="scriptable" value="true">');
		write('<param name="mayscript"  value="true">');
		write('<param name="documentbase" value="'+location.href+'">');
		if (params)
		for (var i=0; i<params.length; i++)
		  write('<param name="'+params[i].name+'" value="'+params[i].value+'">');
		if (useObject)
			write("</object>");
		else	write("</applet>");
	}
}

function writeDiv() {}
function moveDiv() {}
function setVisibilityDiv() {}

function save_form_to_cookie(name,f,exclude) {
	var cookie = "";
	for (var i=0; i<f.elements.length; i++) {
		var skip = f.elements[i].name.length == 0;
		if (!skip && exclude != null) 
			for (var j=0; j<exclude.length; j++)
			if (exclude[j] == f.elements[i].name) {
				skip = true;
				break;
			}
		if (!skip) cookie += "&"+f.elements[i].name+"="+f.elements[i].value;
	}
	cookie = name +"="+ cookie.substring(1);
	var expiration = new Date();
	expiration.setMonth(expiration.getMonth()+1);
	document.cookie = escape(cookie); //+";expires="+expiration.toGMTString();
}

function restore_form_from_cookie(name,f) {
	var cookie = document.cookie;
	var start = cookie.indexOf(";"+name);
	if (start >= 0) start += 1;
	if (start < 0 && cookie.indexOf(name) == 0) start = 0;
	if (start < 0) { alert("No saved form data found"); return; }
	start += name.length+1; // "name="

	end = cookie.substring(start).indexOf(";");
	if (end < 0) end = cookie.length;
	presetString( f, unescape(cookie.substring(start,end)) );
}

function loadScript(url)
{
   var se = document.createElement("script");
   se.src = url;
   se.type= "text/javascript";
   document.getElementsByTagName("head")[0].appendChild(se); 
}

