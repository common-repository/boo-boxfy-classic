cfg = {
	url: 'http://boo-box.com/',
	urle: 'http://sledge.boo-box.com',
	urlstatic: 'http://static.boo-box.com'
};

if (typeof(bbD) == 'undefined') {
	$ = jQuery;
	var bbD = new Object();
	var le_fake_dom;

	// do key:value in js querysring
	bbD.add = function( key, val ){
		bbD[ key ] = val;
	}
	// get affiliated options
	var codePairs = $("#booboxfy").attr('src').split('?')[1].split('&');
	$(codePairs).each( function(i){
		// cria um atributo novo no elm DOM
		// pega dois valores e coloca os como key e value respectivamente
		bbD.add( this.split('=')[0], this.split('=')[1] );
	});
	
	bbD.tool = {
		init: function() {
			var wp_version = parseFloat(bbD.version);

			if (wp_version < 2.7) {
				$('#bb-custom-editform').css('background-color','#EAF3FA');	
			}

			bbD.format = 'box';

			if ($('#poststuff input[name=publish]')[0] || $('#poststuff input[name=publish]')[0]) {
				// faz json para saber configuração do camarada
				$.getJSON('http://boo-box.com/profile/login?jsoncallback=?&format=json&boomail='+bbD.email, function(data) {
						if (data.lastformat != 0 && data.lastformat != null) {
							bbD.format = data.lastformat;
						}
				});
			}   

			function closeModal(hash) {
				// faz overlay do jModal sumir
				hash.o.hide();
				// some do DOM de uma vez... evita problema com outros formatos
				hash.w.hide();		
				return false;
			}

			// lightbox
			$('body').prepend('<div class="jqmWindow" id="bboxxy_dialog"><div id="bboxxy_header">boo-boxfy</div><div id="bboxxy_box"><h2 id="bboxxy_tip"></h2><h3 id="bboxxy_tip2"></h3><table id="bboxxy_table"></table></div><div id="bboxxy_box_btn"><a href="javascript:void(0);" id="bboxxy_monetize">'+booboxfyL10n.applyto+'</a><a href="javascript:void(0);" class="jqmClose" id="bboxxy_cancel">'+booboxfyL10n.closewindow+'</a></div><div id="bboxxy_preview"></div></div>');
			$('#bboxxy_dialog').jqm({onHide:closeModal});

			var $btapply = $('#bboxxy_monetize');
			
			$btapply.show();
			
			var self = this;
			
			$btapply.click(function(){
				self._apply($(this));
			});
			
			// monetize button
			$toolbar = $("#editor-toolbar");
			
			if(!$("#edButtonPreview", $toolbar).hasClass("active")) {
				self.monetizeButton();
			} else {
				this.monetizeOff = true;
			}
			$("a[id^=edButton]", $toolbar).click(function(){
				self._checkMonetize($(this));
			});
		},
		
		_checkMonetize: function($obj){
			var $monetize = $("#bboxxy_btn");
			
			// put THE button in html mode
			if ($obj.attr("id") == "edButtonHTML") {
				this.monetizeOff = false;
 				this.monetizeButton();
			} else { 
				this.monetizeOff = true;
				$monetize.hide();
			}
			
		},
		
		_getHtml: function() {
			
			html = (this.monetizeOff) ? tinymce.plugins.BooBoxFy.temp_html : this._rte_get_innerHTML();
			
			return $.trim(html);
		},
		
		setHtml: function (html) {			
			(this.monetizeOff) ? tinymce.plugins.BooBoxFy.set_html(html) : this._rte_set_innerHTML(html);
		},
		
		_rte_get_innerHTML: function () {
			var text, re_pp, html = "";
			if (document.getElementById('content_parent')) {
				if (document.getElementById('content_parent').style.display != 'none') {
					html = document.getElementById('content_ifr').contentWindow.document.body.innerHTML;
					text = $('<div>'+html+'</div>');
					$('br', text).each(function() {
						if ($(this).attr('mce_bogus')) {
							$(this).remove();
						}
					});
					html = text.get(0).innerHTML;
					re_pp = /<p><\/p>/g;
					html = html.replace(re_pp, "");
				} else {
					html = $('#content:first').get(0).value;
				}
			} else {
				html = $('#content:first').get(0).value;
			}
			return html;
		},
		
		_rte_set_innerHTML: function (html) {
			html = (html);
			html = html.replace(/&amp;amp;/gi, '&amp;');
			if (document.getElementById('content_parent')) {
				if (document.getElementById('content_parent').style.display != 'none') {
					document.getElementById('content_ifr').contentWindow.document.body.innerHTML = html;
				} else {
					$('#content:first').get(0).value = html;
				}
			} else {
				$('#content:first').get(0).value = html;
			}
		},
	
		_toggle: function(el,fake,i) {
			var havebox = false;
			var fake = $(fake);
			var fake_class = fake.attr('class');
			var fake_title = fake.attr('title');
			var fake_parent = fake.parent();
			var val = $('#input_bb_'+i).val();
			var fake_param = fake.find('param[name=movie]:first,param[name=src]:first');
			var fake_flashvars = fake.find('param[name=flashvars]:first');
		
			// flash no MCE
			if (fake.is('img') && fake_class == 'mceItemFlash') {
				// se tiver boo-box
				if (fake_title.match(/"src":"http:\/\/stable\.boo-box\.com\/static\/flash\/boo-player\.swf"/)) {
					// mas a tag estiver vazio
					if (val == '') {
						// tira boo-box
						var youtube_src = fake_title.match(/"flashvars":"[^"]*video=([^"&]*)/)[1];
						fake.attr('title', fake_title.replace(/,"flashvars":"[^"]*"/,''));
						fake.attr('title', fake_title.replace(/"src":"[^"]*"/, '"src":"'+youtube_src+'"'));
					} else { // ou se tiver tag
						// atualiza tags
						fake.attr('title', fake_title.replace(/tags=[^"]*/, 'tags='+val));
						havebox = true;
					}
				}
			
				// se for youtube e tiver conteudo
				if (fake_title.match(/"src":"http:\/\/[^\.]*\.?youtube\.com[^"]*"/) && val != '') {
					// passa p/ boo-box
					var youtube_src = fake_title.match(/"src":"([^"]*)"/)[1];
					var replace_title = '"wmode":"transparent","AllowScriptAccess":"all","allowFullScreen":"true","flashvars":"bid='+bbD.bid+'&amp;lang='+bbD.lang+'&amp;video='+youtube_src+'&amp;tags='+val+'","src":"http://stable.boo-box.com/static/flash/boo-player.swf"';
					fake.attr('title', replace_title);
					havebox = true;
				}
			} else if (fake.is('object')) {
				// se tiver boo-box
				if (fake_param.attr('value').match(/http:\/\/stable\.boo-box\.com\/static\/flash\/boo-player\.swf/)) { // quando tiver boo-box
					// mas a tag estiver vazio
					if (val == '') {
						// tira boo-box
						var youtube = fake_flashvars.attr('value').match(/video=[^"&]*(\/v\/|v=)([^"&]*)/)[2];
						var youtube_src = 'http://www.youtube.com/v/'+youtube;
						fake_param.attr('value', youtube_src);
						fake.find('embed:first').attr('src', youtube_src);
						fake.find('embed:first').removeAttr('flashvars');
						// limpa flashvars
						fake_flashvars.remove();
					} else { // ou se tiver tags
						// atualiza tags
						fake.find('embed:first').attr('flashvars', fake.find('embed:first').attr('flashvars').replace(/tags=[^"\&]*/, 'tags='+val));
						fake_flashvars.attr('value', fake_flashvars.attr('value').replace(/tags=[^"\&]*/, 'tags='+val));
						havebox = true;
					}
				}
				// se for youtube e a tag tiver preenchida
				if (fake_param.attr('value').match(/http:\/\/[^\.]*\.?youtube\.com[^"]*/) && val != '') { // quando for youtube
					// passa para boo-box
					var youtube = fake_param.attr('value').match(/(\/v\/|v=)([^"&]*)/)[2];
					var youtube_src = 'http://www.youtube.com/watch?v='+youtube;
					fake.append($('<param/>').attr('value', 'bid='+bbD.bid+'&lang='+bbD.lang+'&video='+youtube_src+'&tags='+val).attr('name', 'flashvars'));
					fake.find('embed:first').attr('src', 'http://stable.boo-box.com/static/flash/boo-player.swf');
					fake.find('embed:first').attr('flashvars', 'bid='+bbD.bid+'&lang='+bbD.lang+'&video='+youtube_src+'&tags='+val);
					fake_param.attr('value', 'http://stable.boo-box.com/static/flash/boo-player.swf');
					havebox = true;
				}
			} else { // imagem em qualquer lugar.
				// se tiver boo-box
				if (fake_parent.is('a') && (fake_parent.attr('class') == 'bbli') && !fake_parent.parent().is('div.bb_video_embed')) { // quando tiver boo-box
					// mas a tag estiver vazio
					if (val == '') {
						// tira boo-box
						var parent = fake_parent;
						parent.before(fake);
						parent.remove();
					} else { // ou se tiver tags
						// atualiza tags
						fake_parent.attr('href', fake_parent.attr('href').replace(/\/tags:[^"\/]*/, 'tags:'+val));
						havebox = true;
					}
				}
				// se for imagem e a tag tiver preenchida
				if (fake.is('img') && val != '' && !fake_parent.parent().is('div.bb_video_embed')) {
					// se tiver link, deleta
					if (fake_parent.is('a')) {
						var parent = fake_parent;
						parent.before(fake);
						parent.remove();
					}

					// passa para boo-box
					var tpl = {};
					 	tpl.format = (bbD.format != 'null' && bbD.format != null && bbD.format != '0') ? bbD.format : 'bar';
					 	tpl.hash = Base64.encode(val+'_##_'+tpl.format+'_##_tagging-tool-wp-image_##_'+bbD.bid);
					fake.wrap('<a href="'+cfg.urle+'/list/page/'+tpl.hash+'" class="bbli"></a>');
					havebox = true;
				}

				// diz que o cara já mecheu na tag e marca a imagem para próxima edição como "usada"
				fake.addClass('bbused');
			}
		
			if (havebox) {
				if (!el.parent().hasClass('hasBooBox')) {
					var self = this;
					var cancel = $('<a href="" class="booboxfy_remove">'+booboxfyL10n.remove+'</a>').click(function() {
						$('#input_bb_'+i).val('');
						self._toggle(el,fake,i);
						return false;
					});
					el.parent().append(cancel);
					el.parent().addClass('hasBooBox');				
				}
			} else {
				el.parent().find('.booboxfy_remove').remove();
				el.parent().removeClass('hasBooBox');
			}
		
			// se o ultimo elemento da box não for '.booboxfy_remove', faz ser um <br/>
			if (!el.parent().find('.booboxfy_remove')[0]) {
				el.parent().append('<br/>');
			} else {
				if (el.parent().find('.booboxfy_remove').prev().is('br')) {
					el.parent().find('.booboxfy_remove').prev().remove();
				}
			}
		},
		
		bbtext: function () {
			$('#bboxxy_monetize').attr('rel','bbtext');
			
			var tooldiv = $('#bboxxy_tagging');
			if (tooldiv.length == 0) {
				$('#bboxxy_table').empty();
				$('#bboxxy_table').html('<tr><td id="bboxxy_tagging"></td></tr>');

				var forms = '<label>Texto:</label><input id="bb_text" type="text" />'
						+	'<label>Tag:</label><input id="bb_tag" type="text" /><button id="preview">Visualizar</button><br />'
						+	'<div id="bb-tt-simulation"><ul id="bb-tt-offerslist"></ul></div>';
				$('#bboxxy_tagging').html(forms);

				var self = this;
				$('#preview').click(function(){
					var bb_tags = $('#bb_tag');
					(bb_tags.val != '') ? self.tag.simulate(bb_tags.val()) : alert('Digite uma tag');
				});
			} else {
				$('#bb-tt-offerslist').empty();
			}
			$('#bb_text, #bb_tag').val(tinymce.plugins.BooBoxFy.temp_html);
			$('#bboxxy_tip').html('Texto / Tags');
			$('#bboxxy_tip2').html(booboxfyL10n.tag);
		},
		
		// gera boo-box em html de imagem
		bbmedia: function () {
			
			$('#bboxxy_monetize').attr('rel','bbmedia');
			
			// se não existir configurações, escreve link para configurar e para a procura
			if (!bbD.bid || !bbD.lang) {
				$('#bboxxy_tip').html(booboxfyL10n.noconfig+"<br/><a href='plugins.php?page=boobox-config' class='bboxxy_configurelink'>"+booboxfyL10n.configbtn+"</a>");
				$('#bboxxy_tip2').hide();
				// esconde link "monetize"
				$('#bboxxy_monetize').hide();
			}
	
			// atualizar o fake
			le_fake_dom = $('<div>'+ this._getHtml() +'</div>');
			
			// video no HTML não funciona no IEs
			var els;
			if ($.browser.msie) {
				els = $('img', le_fake_dom);
			} else  {
				els = $('img,object', le_fake_dom);
			}
	
			var one = false;
	
			$('#bboxxy_table').empty();
	
			var i=0;
			
			// para o this não ser do jquery
			var self = this;
	
			els.each(function(k,fake) {
				var val = '';
				var nu;
				var tarja;
				var url;
		
				var clone = $(this).clone();
				var fake = $(fake);
				var fake_class = fake.attr('class');
				var fake_title = fake.attr('title');
		
				var fake_param = fake.find('param[name=movie]:first,param[name=src]:first').attr('value');
				var fake_flashvars = fake.find('param[name=flashvars]:first');
				
				// se for imagem, cria clone da original para saber se pode utilizar (tamanho)
				if (fake.is('img') && fake_class != 'mceItemFlash' && !fake.parent().parent().is('div.bb_video_embed')) {
					$('#bboxy_temp').remove();
					$('body').append(fake.clone().attr('id', 'bboxy_temp').css('display', 'none').removeAttr('width').removeAttr('height'));
			
					var a = $('#bboxy_temp');
					// n√£o deixa a imagem ser menor que 75px em um dos lados
					if (!(a.height() < 75) && !(a.width() < 75)) {
						// calcula limite de 125 pixels no lado maior
						var tamanho = (a.height() > a.width()) ? {attr: 'height', val: 125} : {attr: 'width', val: 125} ;
						clone.removeAttr('width').removeAttr('height').removeAttr('class');
						clone.attr(tamanho.attr, tamanho.val);
				
						if (!fake.hasClass('bbused')) {
							if (clone.attr('title') != '' && val == '') {
								val = clone.attr('title');
							} else if (clone.attr('alt') != '' && val == '') {
								val = clone.attr('alt');
							}
						}
						// se já tiver boo-box
						if (fake.parent().attr('class') == 'bbli') {
							val = decodeURIComponent(fake.parent().attr('href').match(/\/tags:([^\/]*)/)[1]);
						}
						nu = clone;
						tarja = booboxfyL10n.image;
					} else {
						return true;
					}
				} else if (fake.is('img') && fake_class == 'mceItemFlash' && fake_title.match(/"src":"http:\/\/[^\.]*\.?youtube\.com[^"]*"/) && !$.browser.msie) { // youtube (flash no MCE)
					url = fake_title.match(/(\/v\/|v=)([^"&]*)/)[2];
					nu = $('<img src="http://i3.ytimg.com/vi/'+url+'/default.jpg" title="" />').width(125);
					tarja = 'youtube';
				} else if (fake.is('img') && fake_class == 'mceItemFlash' && fake_title.match(/"src":"http:\/\/stable\.boo-box\.com\/static\/flash\/boo-player\.swf"/) && !$.browser.msie) { // bootube (flash no MCE) - BOO-BOX!
					var source_youtube = fake_title.match(/"flashvars":"[^"]*video=([^"]*)"/)[1];
					url = source_youtube.match(/(\/v\/|v=)([^"&]*)/)[2];
					nu = $('<img src="http://i3.ytimg.com/vi/'+url+'/default.jpg" title="" />').width(125);
					val = fake_title.match(/"flashvars":"[^"]*tags=([^"]*)"/)[1];
					tarja = 'youtube';
				} else if (fake.is('object')) {
					if (fake_param.match(/http:\/\/stable\.boo-box\.com\/static\/flash\/boo-player\.swf/) && !$.browser.msie) { // quando tiver boo-box
						url = fake_flashvars.attr('value').match(/[^"]*video=[^"]*(\/v\/|v=)([^"&]*)/)[2];
						nu = $('<img src="http://i3.ytimg.com/vi/'+url+'/default.jpg" title="" />').width(125);
						val = fake_flashvars.attr('value').match(/tags=([^"]*)/)[1];
					} else if (fake_param.match(/http:\/\/[^\.]*\.?youtube\.com[^"]*/)) { // quando for youtube
						url = fake_param.match(/(\/v\/|v=)([^"&]*)/)[2];
						nu = $('<img src="http://i3.ytimg.com/vi/'+url+'/default.jpg" title="" />').width(125);
					}
					tarja = 'youtube';
				} else {
			
					return true;
				}
		
				var input = $('<br/><input type="text" value="'+val+'" id="input_bb_'+i+'" size="12" /><br/>');
		
				// turn localy to use into clousure
				var n = i;
				input.keyup(function() {
					self._toggle(nu, fake, n);
				});
		
				var td = $('<td></td>').append(nu).append(input);
		
				var identify = $('<div class="icon-div"><span class="icon-box"></div></span><span class="callaction">'+tarja+'</span>');

				// 4 cols
				if (i%4 == 0) {
					$('#bboxxy_table').append("<tr></tr>");
				}
		
				// no focus atualiza
				$('#bboxxy_table tr:last').append(td.append(identify));
				one = true;
				
				self._toggle(nu, fake, i);
				i++;
			});
	
			if (one) {
				
				$('#bboxxy_tip').html(booboxfyL10n.cont);
				$('#bboxxy_tip2').html(booboxfyL10n.tag);
			} else {
				// $('#bboxxy_monetize').hide();
				$('#bboxxy_tip').html(booboxfyL10n.none);
			}
		},
		
		// define ações para o botao aplicar do boo-boxfy
		_apply: function (button) {
			var html;
			if (button.attr('rel') == 'bbtext') {
				html = this.tag.makeCode('html');
			} else if (button.attr('rel') == 'bbmedia') {
				html = le_fake_dom[0].innerHTML;
			}
			
			// reseta botao aplicar para futuras ações
			button.attr('rel','');
			
			// aplica o html final e fecha a janela do jqmodal
			this.setHtml(html);
			$('#bboxxy_dialog').jqmHide();
		},
		
		// cria botao monetize para modo html
		monetizeButton: function() {
			var $monetize = $("#bboxxy_btn");
			if (!$monetize.attr('src') || $monetize.attr('src') == "") {
				var self = this;
				$btn = $('<div><img src="" alt="monetize" id="bboxxy_btn" /></div>');
				$btn.click(function() {
					$('#bboxxy_dialog').jqmShow();
					var html = self._getHtml();
					
					(html.match(/\<img/gi) || html.match(/\<object/gi)) ? self.bbmedia() : $('#bboxxy_dialog').jqmHide();
				
					return html
				});

				var wp_version = parseFloat(bbD.version);

				if (wp_version >= 2.7) {
					if ($('#original_publish')[0]) {
						$('#original_publish').before($btn);
						$('img', $btn).attr('src', '../wp-content/plugins/boo-boxfy-classic/resources/monetize27.gif');
					}
				} else {
					if ($('#poststuff input[name=save]')[0]) {
						$('#poststuff input[name=save]').before($btn);
						$('img', $btn).attr('src', '../wp-content/plugins/boo-boxfy-classic/resources/monetize.gif');
					}
					//Wp classic color
					$('#bb-custom-editform').css('background-color','#EAF3FA');	
				}
			}

			$monetize.show();
		},
		tag: {
			makeCode: function(type) {
				$tags = $('#bb_tag').val();
				var content = {
					type:'text', 
					val: $('#bb_text').val()
				};

				var tpl = new Object();

					tpl.format = (bbD.format != 'null' && bbD.format != null && bbD.format != '0') ? bbD.format : 'bar';

					tpl.tags	= escape( $tags ).replace( /(\%20){1,}/gi , '+' );
					tpl.alt	= tpl.tags.replace( /\+/gi , ' ' );

					tpl.hash = Base64.encode(tpl.tags+'_##_'+tpl.format+'_##_tagging-tool-wp_##_'+bbD.bid);
					
					tpl.script	= '<script src="'+cfg.urlstatic+'/javascripts/engine/boo-box-loader.js" type="text/javascript"></script>';

					tpl.imageindicator 	= '<img src="'+cfg.url+'bbli" alt="[bb]" class="bbic" />';

					tpl.text = '<a href="'+cfg.urle+'/list/page/'+tpl.hash+'" class="bbli">' + content.val + tpl.imageindicator + '</a>';
					
				var html = tpl.text + tpl.script;
				var uri = cfg.urle+'/list/page/'+tpl.hash;
				
				switch (type) {
					case 'html':
						return html;
					break;
					case 'url':
						return uri;
					break;
				}
			},
			simulate: function (tags) {
				var $btsimulate = $('#preview');
				var sintax = 'bb-tt-';
				var $simulation = $('#'+ sintax + 'simulation');
				if ( $btsimulate.attr( 'disabled' ) == 'disabled' ) {
					alert( 'Aguarde enquanto os produtos são carregados' );
					return;
				} else {
					$btsimulate.attr( 'disabled' , 'disabled' );
				}

				// $outputblocks.hide();				

				// última chamada à API
				var lastcall;
		
				// TODO: não usar var xxx = function () {}
				var showoffers = function ( data ) {
					if ( ! $simulation.is( ':visible' ) ) {
						return;
					}


					var hasoffers = false;
			
					$loadingoffers.hide();
					$offersnotloaded.hide();
					$offeritems.remove();
			
					if ( data.item != null )
					if ( data.item.length > 0 ) {
						var hasoffers = true;
						// TODO: passar para o HTML
						var offeritemhtml = '<li class="'+ sintax +'offeritem"><a href="#" class="'+ sintax +'offerlink"><span class="'+ sintax +'offerimage">'
											+ '</span><span class="'+ sintax +'offerdescription">'
											+ '<span class="'+ sintax +'offertitle"></span><span class="'+ sintax +'offerprice"></span>'
											+ '</span></a></li>';
				
						var numitems = data.item.length;
				
						var maxoffers = 6;
						var maxoffers = numitems < maxoffers ? numitems : maxoffers;
				
				
						for (var i=0; i < maxoffers; i++) {
							var offer = data.item[i]._value;
					
							var node = $( offeritemhtml );
					
							$( 'span[class$=offerimage]' , node ).css( 
								'background-image' , 'url(\'' + offer.img + '\')' 
							);
					
					
							$( 'span[class$=offertitle]' , node ).html( offer._name );
							$( 'span[class$=offerprice]' , node ).html( offer.price );
					
							$( 'span[class$=offertitle]' , node ).show(); //debug
					
							var offerlink = $( 'a[class$=offerlink]' , node );
								offerlink.attr( 'href' , offer.url );
								offerlink.attr( 'title' , offer._name );
								offerlink.attr( 'target' , '_blank' );
					
							$offerslist.append( node );
					
						};
				
						$offeritems = $( '.' + sintax + 'offeritem' ).show();
						$offeritems.show();
				
					}
			
					if ( ! hasoffers ) {
						$offersnotloaded = 
							$( '<li></li>' )
								.hide()
								.addClass( sintax + 'offersnotloaded' )
								.html( 
									( data.fail != undefined ) ?
										'offers not loaded'
										: 'no offers found' );
						$offerslist.append( $offersnotloaded );
						$offersnotloaded.fadeIn();
					}
				}
		
				// TODO: declarar no local correto
				$offerslist = $( '#' + sintax + 'offerslist' );
				$loadingoffers = $( '.' + sintax + 'loadingoffers' , $simulation );
				$offersnotloaded = $( '.' + sintax + 'offersnotloaded' , $simulation );

				$offeritems = $( '.' + sintax +  'offeritem' );
				$offeritems.remove();		
		
				$offersnotloaded.hide();
				// $loadingoffers.html( 'loading offers <br />searching for <strong>' + $tags.val() + '</strong>' )
				// $loadingoffers.show();
				// animateloading( 0.5 , null , $loadingoffers );

				var usingbooid = bbD.bid;

				var hash = Base64.encode(tags+'_##_simulation_##_tagging-tool_##_'+usingbooid);
				var uri = cfg.urle+'/list/json/'+hash+'?sinc=true&callback=?';

				// implementar fila caso timeout ou erro
				$btsimulate.animate( { opacity: 0.3 } , function () {
					// tempo de espera pelo servidor
					$.getJSON( uri , function ( data ) {
						$btsimulate.animate( { opacity: 1 } , function () {
							$btsimulate.attr( 'disabled' , '' );
							showoffers( data );
						} );
					} );
				} );

				$simulation.show();
			}
		}
	};
}



if (typeof(Base64) == 'undefined') {
	Base64 = {

	    // private property
	    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

	    // public method for encoding
	    encode : function (input) {
	        var output = "";
	        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
	        var i = 0;

	        input = Base64._utf8_encode(input);

	        while (i < input.length) {

	            chr1 = input.charCodeAt(i++);
	            chr2 = input.charCodeAt(i++);
	            chr3 = input.charCodeAt(i++);

	            enc1 = chr1 >> 2;
	            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
	            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
	            enc4 = chr3 & 63;

	            if (isNaN(chr2)) {
	                enc3 = enc4 = 64;
	            } else if (isNaN(chr3)) {
	                enc4 = 64;
	            }

	            output = output +
	            this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
	            this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

	        }

			// verifica tamanho da string para evitar erros
	        return output + '-' + output.length;
	    },

	    // public method for decoding
	    decode : function (input) {
	        var output = "";
	        var chr1, chr2, chr3;
	        var enc1, enc2, enc3, enc4;
	        var i = 0;

			// limpa verificador antes de mais nada
			input = input.split('-')[0];

	        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

	        while (i < input.length) {

	            enc1 = this._keyStr.indexOf(input.charAt(i++));
	            enc2 = this._keyStr.indexOf(input.charAt(i++));
	            enc3 = this._keyStr.indexOf(input.charAt(i++));
	            enc4 = this._keyStr.indexOf(input.charAt(i++));

	            chr1 = (enc1 << 2) | (enc2 >> 4);
	            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
	            chr3 = ((enc3 & 3) << 6) | enc4;

	            output = output + String.fromCharCode(chr1);

	            if (enc3 != 64) {
	                output = output + String.fromCharCode(chr2);
	            }
	            if (enc4 != 64) {
	                output = output + String.fromCharCode(chr3);
	            }

	        }

	        output = Base64._utf8_decode(output);

	        return output;

	    },

	    // private method for UTF-8 encoding
	    _utf8_encode : function (string) {
	        string = string.replace(/\r\n/g,"\n");
	        var utftext = "";

	        for (var n = 0; n < string.length; n++) {

	            var c = string.charCodeAt(n);

	            if (c < 128) {
	                utftext += String.fromCharCode(c);
	            }
	            else if((c > 127) && (c < 2048)) {
	                utftext += String.fromCharCode((c >> 6) | 192);
	                utftext += String.fromCharCode((c & 63) | 128);
	            }
	            else {
	                utftext += String.fromCharCode((c >> 12) | 224);
	                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
	                utftext += String.fromCharCode((c & 63) | 128);
	            }

	        }

	        return utftext;
	    },

	    // private method for UTF-8 decoding
	    _utf8_decode : function (utftext) {
	        var string = "";
	        var i = 0;
	        var c = c1 = c2 = 0;

	        while ( i < utftext.length ) {

	            c = utftext.charCodeAt(i);

	            if (c < 128) {
	                string += String.fromCharCode(c);
	                i++;
	            }
	            else if((c > 191) && (c < 224)) {
	                c2 = utftext.charCodeAt(i+1);
	                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
	                i += 2;
	            }
	            else {
	                c2 = utftext.charCodeAt(i+1);
	                c3 = utftext.charCodeAt(i+2);
	                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
	                i += 3;
	            }

	        }

	        return string;
	    }

	};
}

// ensina o IE como escrever html
function fIE (dom) {
	// downcase em nome de tag
	dom = dom.replace(/<([^> ]*)/gi,function(s){
		return s.toLowerCase();
	});
	// deleta tag do jquery
	dom = dom.replace(/ ?jQuery([^=]*)=([^> ]*)/gi, '');
	// coloca aspas nos atributos que estiverem sem
	dom = dom.replace(/( )?([^ =]*)=([^"'>][^ >]*)/gi, '$1$2="$3"');
	return dom;
};