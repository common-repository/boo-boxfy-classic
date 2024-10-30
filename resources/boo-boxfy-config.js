jQuery(document).ready(function(){
	jQuery('#boo_mail_options').submit();
});


// glabalzão bonito ;)
var $booaffid;

// passar parametros sempre como strings
var bb_callOptions = function(booid, booaffid) {
	// manda pro global
	$booaffid = booaffid;
	
	// pega as configs do usuário
	var script = document.createElement('script');
	script.src = 'http://boo-box.com/profile/login?jsoncallback=bb_pushAffiliates&format=json&boomail='+booid;
	script.type = 'text/javascript';
	
	var head = document.getElementsByTagName('head').item(0);
	head.appendChild(script);
}


// receive JSONP request with affiliate data from boo-box master
var bb_pushAffiliates = function(data) {
	select = document.getElementById("boo_booaffid");
	select.innerHTML = "";
	
	// valor nulo acima
	var optionNull = document.createElement('option');
	optionNull.value = '0';
	optionNull.innerHTML = '--- ' + booboxfyL10n.selectone + ' ---';
	select.appendChild(optionNull);
	
	for (shop in data.shoplist) {
		for ( i = 0; i < data.shoplist[shop].bids.length; i++ ) {
	
			var option = document.createElement('option');
			option.value = data.shoplist[shop].bids[i][0]+'='+data.shoplist[shop].bids[i][2];
			option.innerHTML = data.shoplist[shop].bname + ' (' + data.shoplist[shop].bids[i][1] + ')';
			
			// selected?
			(data.shoplist[shop].bids[i][0] == $booaffid) ? option.selected = "selected" : '';
			
			// just attach to #boo_shopid
			select.appendChild(option);
		}
	}
}

// versoes superiores a 1.7
var bb_callOptions_withbid = function(booid, booaffid) {
	// manda pro global
	$booaffid = booaffid;
	
	// pega as configs do usuário
	var script = document.createElement('script');
	script.src = 'http://boo-box.com/profile/login?jsoncallback=bb_innerAffiliate&format=json&boomail='+booid+"&getlastbid=1";
	script.type = 'text/javascript';
	
	var head = document.getElementsByTagName('head').item(0);
	head.appendChild(script);
}

var bb_innerAffiliate = function(data) {
	var e = document.getElementById("boo_booaffid")
	
	if (data.shop && data.lastbid) {
		e.innerHTML = data.shop._name + '(' + data.shop._code + ')' + '<input name="boo_booaffid" type="hidden" value="' + data.lastbid + '=pt-BR"></input>';
	} else { 
		e.innerHTML = "Please, config your affiliate program";
	}
}

var bb_mailform = function() {
	$ = jQuery;
	
	var $bbmail_form = $('#boo_mail_options'), $bbmail_input = $('#boo_boomail'), $bbmail_confirm = $("#boo_updateid"), $bbmail_info = $('<span id="bbmail_info"></span>');
	
	$bbmail_input.after($bbmail_info);
	
	$bbmail_confirm.click(function(){
		$bbmail_form.unbind().submit();
	});
	
	
	$bbmail_form.submit(function() {
		
		// desabilita form
		$bbmail_input.attr('disabled', 'disabled');
		$('#boo_updateid').attr('disabled', 'disabled');
		// faz JSON
		// assincrono :( o que retornar aqui não é o retorno da função
			var url = "http://boo-box.com/profile/login?jsoncallback=?&format=json&boomail=" + $('#boo_boomail').val();
			
			// backward para versao menor 1.7
			url += "&getlastbid=" + (($("#boo_advanced_options").length != 0) ? "1" : "0");

		$.getJSON(url,
		        function(data) {
					$bbmail_input.attr("disabled", "");
					$bbmail_confirm.attr("disabled", "");
					
					if (!data.error) {
						
						if (typeof data.userid != 'undefined') {
							$bbmail_info.html("Ok!");
							
							// se tiver o usuário, preenche o input-hidden e faz submit
							$('#boo_booid').val(data.userid);
						} else {
							$bbmail_info.html('No exists! Please, <a href="http://boo-box.com/site/setup/signup" target="_blank">create your account</a>');
							$("#boo_advanced_button, .button-primary").hide();
						}
					}
		        });
		return false;
	});
}