// jQuery().ready(function(){
//Usado OnLoad padrao devido erro com o document.getElementById	
window.onload=function(){
	$ = jQuery;
	
	$.getJSON('http://boo-box.com/profile/login?jsoncallback=?&format=json&boomail='+bbD.email, function(data) {
		// $.getJSON('http://boo-box.com/profile/config?jsoncallback=?&format=json&user_id='+user.userid, function(data) {
			if (data.lastformat != 0 && data.lastformat != null) {
				bbD.format = data.lastformat;
			}
		// });
	});
	
	if (typeof bbD.format == 'undefined' || bbD.format == '') {
		bbD.format = 'bar';
	}	
	
	//inicia objeto booboxFy
	if (typeof booboxFY == 'undefined') {

		 	var	booboxFY = new Object();
		
			booboxFY.lang = {
				logar: 'você precisa se logar para usar',
				profile: 'opções',
				nocontent: 'nenhum conteudo para inserir links da boo-box',
				markall : 'Marcar todos',
			};
			
			booboxFY.make = function () {
				var booHtml = '<div id="boobox-links" class="postbox"><div id="boobox-preferences"><h3 class="hndle"><span>boo-box autotag</span></h3></div><ul id="boobox-links-content"></ul></div>';				
				var wp_version = parseFloat(bbD.version);
				
				if (wp_version >= 2.7) { 
					$('#post-status-info').after(booHtml);
				} else {
					$('#editorcontainer').after(booHtml); 
					$('#boobox-links').addClass('wpunrounded');
				}
				
				//move o custom widget para baixo do autotag
				$('#postdivrich').append($('#bb-custom-editform'));
			};

			booboxFY.helpers = {
				get_editor:function() {
					var win = null, editor = null;

					win = document.getElementById("content_ifr").contentWindow;

					editor = {element: win.document.body, property: 'innerHTML', type: 'RTE', win: win };

					return editor;
				},
				getRoot : function() {
					var t = booboxFY.helpers.get_editor();
					return t.element;
				},
				get_dom:function () {
					var html = null,
						dom = null, d = null,
						editor = booboxFY.helpers.get_editor();
					dom = (editor.type=='RTE')? $(editor.element.cloneNode(true)) : null;
					if (!dom) {
						d = document.createElement('div');
						if (editor.element!==null) {
							html = editor.element[editor.property];
						}
						if (html !== undefined && html !== null && booboxFY._saveNewlines) {
							html = html.replace(booboxFY.nlRegex, booboxFY.nlrep); // no newlines after this point
						}

						d.innerHTML = (html) ? html : '';
						dom = $(d);
					}
					return dom;
				},
				get_html:function(filter) {
					var dom = booboxFY.helpers.get_dom(filter);
					var html = dom? $.trim(dom.html()) : '';
					return html;
				},
				_pixie: function(content) {
					if (!content.match(/script[^>]*src=\"http:\/\/static\.boo-box\.com\/javascripts\/engine\/boo-box-loader\.js\"/)) {
						var script = '<script type="text/javascript" src="http://static.boo-box.com/javascripts/engine/boo-box-loader.js"></script>';
						content = content + script;
					}
					return content;
				},
				_close_tags: function (str, type) { // this should also close embed tags
					var r,
						s = '',
						selfclose = ['img', 'br', 'hr', 'meta', 'link', 'input', 'param', 'area', 'col'], nocontent = ['embed'], tags = [];
					tags = type === '1'? selfclose.concat(nocontent) : nocontent;
					r = arguments.callee['r'+type] = arguments.callee['r'+type] || new RegExp('<(' + tags.join('|') + ')([^>]*)>', 'gi');
					s = str.replace(r, function (str, t, s) {
						while (' /'.indexOf(s.slice(-1)) >= 0 && s.length>0) {
							s = s.substr(0, s.length - 1);
						}
						return $.grep(selfclose, function (e) {
							return e === t.toLowerCase();
						})[0]? '<' + t + s + ' />' : '<' + t + s + '></' + t + '>';
					});
					return s;
				},
				trimNl : function(s) {
					return s.replace(/[\n\r]+/g, '');
				},
				set_html: function(html, pointer) {
					var htmlen = html.length;

					if (html === null || typeof html === 'undefined') {
						return;
					}

					html = booboxFY.helpers._pixie(html);

					if (html && booboxFY.saveNewlines) {
						html = html.replace(booboxFY.nlRegex, '').replace(booboxFY.nlrepRegex, booboxFY.nl); // get the newlines back
					}

					html = booboxFY.helpers._close_tags(html);

					var editor = booboxFY.helpers.get_editor(),
						dom = null, body = null;

					if (editor.element) {
						if (editor.type === 'RTE') {
							// guarda posição do cursor
							var bookmark = booboxFY.cursor.getBookmark();

							// atualiza html
							body = editor.element;
							dom = booboxFY.helpers.create_fragment(html, body.ownerDocument);
							if (editor.win) {
								editor.win.document.ignoreDOMevents = true;
							}
							while (body.firstChild) {
								body.removeChild(body.firstChild);
							}
							body.appendChild(dom);
							if (editor.win) {
								editor.win.document.ignoreDOMevents = false;
							}

							// volta posição do cursor
							if (pointer) {
								booboxFY.cursor.moveToBookmark(bookmark);
							}
						} else {

							// guarda posição do cursor
							var range = booboxFY.cursor.getScroll(editor);

							// atualiza html
							var diff = htmlen - booboxFY.helpers.get_html().length;
							editor.element[editor.property] = html;

							// reseta posição do cursor
							if (pointer) {
								booboxFY.cursor.setScroll(editor, range, diff);	
							}
						}
					}
					booboxFY.control._last_count1 = html.length;
				},
				getParent: function(n, f, r) {
					var na;
					var n = booboxFY.helpers.get_editor();
					var r = booboxFY.helpers.getRoot();

					// Wrap node name as func
					if (typeof(f) == 'string') {

						na = f.toUpperCase();

						f = function(n) {
							var s = false;

							// Any element
							if (n.nodeType == 1 && na === '*') {
								s = true;
								return false;
							}

							$.each(na.split(','), function(v) {
								if (n.nodeType == 1 && (n.nodeName.toUpperCase() == v)) {
									s = true;
									return false; // Break loop
								}
							});

							return s;
						};
					}

					while (n) {
						if (n == r) {
							return null;
						}

						if (f(n)) {
							return n;
						}
						n = n.parentNode;
					}

					return null;
				},
				create_fragment: function (html, doc) {
					doc = doc || document;
					var first = true,
						fragment = doc.createDocumentFragment(),
						temp = doc.createElement('div'),
						n = null;
					temp.innerHTML = '|' + html; // IE eats the first space if - we add a | and remove it later
					while (temp.childNodes.length) {
						n = temp.childNodes[0];
						if (n.nodeType === 3 && first) {
							n.nodeValue = n.nodeValue.substr(1);
							if (n.nodeValue === '') {
								temp.removeChild(n);
								continue;
							}
						}
						fragment.appendChild(n);
						first = false;
					}
					return fragment;
				}				
			};
			booboxFY.cursor = {
				getBookmark : function() {
					var t = booboxFY.helpers.get_editor();
					var r = booboxFY.cursor.getRng();
					var tr, sx, sy, e, sp, bp, le, c = -0xFFFFFF, s, ro = t.element, wb = 0, wa = 0, nv;

					var vp = booboxFY.cursor._getViewPort(t.win);

					sx = vp.x;
					sy = vp.y;

					// Handle W3C
					e = booboxFY.cursor.getNode();
					s = booboxFY.cursor.getSel();

					if (!s)
						return null;

					// Image selection
					if (e && e.nodeName == 'IMG') {
						return {
							scrollX : sx,
							scrollY : sy
						};
					}

					// Text selection
					function getPos(r, sn, en) {
						var w = t.win.document.createTreeWalker(r, NodeFilter.SHOW_TEXT, null, false), n, p = 0, d = {};

						while ((n = w.nextNode()) != null) {
							if (n == sn) {
								d.start = p;
							}

							if (n == en) {
								d.end = p;
								return d;
							}

							p += booboxFY.helpers.trimNl(n.nodeValue || '').length;
						}

						return null;
					};

					// Caret or selection
					if (s.anchorNode == s.focusNode && s.anchorOffset == s.focusOffset) {
						e = getPos(ro, s.anchorNode, s.focusNode);

						if (!e)
							return {scrollX : sx, scrollY : sy};

						// Count whitespace before
						booboxFY.helpers.trimNl(s.anchorNode.nodeValue || '').replace(/^\s+/, function(a) {wb = a.length;});

						return {
							start : Math.max(e.start + s.anchorOffset - wb, 0),
							end : Math.max(e.end + s.focusOffset - wb, 0),
							scrollX : sx,
							scrollY : sy,
							beg : s.anchorOffset - wb == 0
						};
					} else {
						e = getPos(ro, r.startContainer, r.endContainer);

						if (!e)
							return {scrollX : sx, scrollY : sy};

						return {
							start : Math.max(e.start + r.startOffset - wb, 0),
							end : Math.max(e.end + r.endOffset - wa, 0),
							scrollX : sx,
							scrollY : sy,
							beg : r.startOffset - wb == 0
						};
					}
				},
				moveToBookmark : function(b) {			
					var t = booboxFY.helpers.get_editor();
					var r = booboxFY.cursor.getRng();
					var s = booboxFY.cursor.getSel();
					var ro = booboxFY.helpers.getRoot();

					var sd, nvl, nv;

					function getPos(r, sp, ep) {
						var w = t.win.document.createTreeWalker(r, NodeFilter.SHOW_TEXT, null, false), n, p = 0, d = {}, o, v, wa, wb;

						while ((n = w.nextNode()) != null) {
							wa = wb = 0;

							nv = n.nodeValue || '';

							nvl = booboxFY.helpers.trimNl(nv).length;
							p += nvl;

							if (p >= sp && !d.startNode) {
								o = sp - (p - nvl);

								// Fix for odd quirk in FF
								if (b.beg && o >= nvl)
									continue;

								d.startNode = n;
								d.startOffset = o + wb;
							}

							if (p >= ep) {
								d.endNode = n;
								d.endOffset = ep - (p - nvl) + wb;
								return d;
							}
						}

						return null;
					};

					if (!b) {
						return false;
					}
					t.win.scrollTo(b.scrollX, b.scrollY);

					// Handle W3C
					if (!s) {
						return false;
					}

					// Handle simple
					if (b.rng) {
						s.removeAllRanges();
						s.addRange(b.rng);
					} else {
						if ((typeof(b.start) !== 'undefined') && (typeof(b.end) !== 'undefined')) {
							try {
								sd = getPos(ro, b.start, b.end);
								if (sd) {
									r = t.win.document.createRange();
									r.setStart(sd.startNode, sd.startOffset);
									r.setEnd(sd.endNode, sd.endOffset);
									s.removeAllRanges();
									s.addRange(r);
								}

								t.win.focus();
							} catch (ex) {
								// Ignore
							}
						}
					}
				},
				getRng : function() {
					var t = booboxFY.helpers.get_editor();
					var s = booboxFY.cursor.getSel(), r;

					try {
						if (s) {
							r = s.rangeCount > 0 ? s.getRangeAt(0) : (s.createRange ? s.createRange() : t.win.document.createRange());
						}
					} catch (ex) {
						// IE throws unspecified error here if TinyMCE is placed in a frame/iframe
					}

					// No range found then create an empty one
					// This can occur when the editor is placed in a hidden container element on Gecko
					// Or on IE when there was an exception
					if (!r) {
						r = t.win.document.createRange();
					}

					return r;
				},
				getSel : function() {
					var t = booboxFY.helpers.get_editor();
					var w = t.win;

					return w.getSelection();
				},
				getNode : function() {
					var t = booboxFY.helpers.get_editor(), r = booboxFY.cursor.getRng(), s = booboxFY.cursor.getSel(), e;

					// Range maybe lost after the editor is made visible again
					if (!r)
						return booboxFY.helpers.getRoot();

					e = r.commonAncestorContainer;

					// Handle selection a image or other control like element such as anchors
					if (!r.collapsed) {
						if (r.startContainer == r.endContainer) {
							if (r.startOffset - r.endOffset < 2) {
								if (r.startContainer.hasChildNodes())
									e = r.startContainer.childNodes[r.startOffset];
							}
						}
					}

					return booboxFY.helpers.getParent(e, function(n) {
						return n.nodeType == 1;
					});
				},
				_getViewPort : function(w) {
					var d, b;

					d = w.document;
					b = this.boxModel ? d.documentElement : d.body;

					// Returns viewport size excluding scrollbars
					return {
						x : w.pageXOffset || b.scrollLeft,
						y : w.pageYOffset || b.scrollTop,
						w : w.innerWidth || b.clientWidth,
						h : w.innerHeight || b.clientHeight
					};
				},
				setScroll: function (obj, range, diff) {
					var pos = range.selectionStart+diff;

				    if (obj.element.createTextRange) {
				        var range = obj.element.createTextRange();
				        range.move("character", pos);
				        range.select();
				    } else if (obj.element.selectionStart) {
				        obj.element.focus();
				        obj.element.setSelectionRange(pos, pos);
				    }
					obj.scrollTop = range.scrollTop;
				}					
			};
			booboxFY.control = {};
			booboxFY.autoTag = {
				init_watch: function() {

					booboxFY.control._last_count1 = $.trim(booboxFY.helpers.get_dom().html()).length;
					booboxFY.control._last_count2 = $.trim(booboxFY.helpers.get_dom().text()).length;
					booboxFY.control._watch_callback = booboxFY.autoTag.update;

					setInterval(function() {
						booboxFY.autoTag._watch();
					}, 1000);
				},
				_watch: function() {

					var count1 = $.trim(booboxFY.helpers.get_dom().html()).length,
						count2 = $.trim(booboxFY.helpers.get_dom().text()).length,
						delta1 = Math.abs(count1 - booboxFY.control._last_count1),
						delta2 = Math.abs(count2 - booboxFY.control._last_count2);

					// verifica se tem conteudo. se não tiver exibe alerta.
					// if ($('#boobox-links-content').html() == '' && $('#boobox-links-div-ul').html() == '') {
					// 	$('#boobox-links-tip').html('<span class="alert">'+booboxFY.lang.nocontent+'</span>');
					// } else {
					// 	$('#boobox-links-tip').html(booboxFY.lang.content_tip);
					// }

					if (delta1 > 0) {
						booboxFY.control._last_count1 = count1;
						// booboxFY.links._medialink();
					}

					if (delta2 > 10) {
						booboxFY.control._last_count2 = count2;
						booboxFY.autoTag.update();
					}
				},
				update: function (auto) {
					booboxFY._enabled = false;

					var dom = booboxFY.helpers.get_dom(),
						text = $.trim(dom.text()),
						params = {
							method: 'boobox.suggest',
							callback: 'none',
							format: 'json',
							contents: text
						};
						
					booboxFY._enabled = true;
					booboxFY.post("http://boo-box.com/auto", params, booboxFY.autoTag._success);
				},
				_success:function(transport) {
					try {
						var response = eval(transport);
					} catch (er) {
						return;
					}
					if (!response) {
						return;
					}
					booboxFY.autoTag._lastresponse = response;

					if (response.status == 'ok') {
						//call all the sub- _success functions
						setTimeout(function(){
							booboxFY.autoTag._setupLink('',response);
						}, Math.floor(Math.random()*200));
					}
				},
				_setupLink: function(a, b) {

					$('#boobox-links-content').html('');
					for (var i=0; i < b.item.length; i++) {
						var text = b.item[i].name;
						var link = $('<li><a href="">'+text+'</a></li>');
						link.click(function() {
							booboxFY.autoTag._toggleText($(this));
							return false;
						});
						var dom = booboxFY.helpers.get_dom();
						var TxtLink = $('a:contains('+text+')', dom);
						if (typeof(TxtLink[0]) != 'undefined') {
							link.addClass('selected');
						}
						// insere link automatico
						else if (typeof($('span[class=bbused]:contains('+text+')', dom)[0]) == 'undefined') {
							booboxFY.autoTag._toggleText(link);
						}
						if ($('#boobox-links-content li a')) {
							$('#boobox-links-content').show();
						}
						$('#boobox-links-content').append(link);
					}

					// insere link para marcar todos provisoriamente aqui
					if (b.item.length > 0) {
						if (typeof($('#markall')[0]) == 'undefined') {
							$('#boobox-links-content').before($('<a href="" id="markall">'+booboxFY.lang.markall+'</a>').click(function() {
								$('#boobox-links-content li').each(function() {
									booboxFY.autoTag._toggleText($(this), true);
								});
								return false;
							}));
						}
					}
				},
				_toggleText: function(link,force) {
					var text = link.text(), dom = booboxFY.helpers.get_dom(),
						TxtLink = $('a:contains('+text+')', dom), TxtSpan = $('span[class=bbused]:contains('+text+')', dom),
						html = dom.html();
						
						//pega preferencias definidas pelo usuario
						var format = bbD.format,
							bid = bbD.bid;	
					// }

					// workaround para forçar seleção: deleta os links
					if (force) {
						link.removeClass('selected');
						TxtLink.after('<span class="bbused">'+text+'</span>');
						TxtLink.remove();
						html = dom.html();
					}

					// mas se tiver com force, sempre vai para colocar outro (else)
					if (typeof(TxtLink[0]) != 'undefined' && !force) {
						link.removeClass('selected');
						TxtLink.after('<span class="bbused">'+text+'</span>');
						TxtLink.remove();
						html = dom.html();
					} else {
						var strLink = '<a href="http://sledge.boo-box.com/list/page/'+Base64.encode(text+'_##_'+format+'_##_boo-boxfy_##_'+bid)+'" class="bbli">'+text+'<img src="http://boo-box.com/bbli" alt="[bb]" class="bbic" /></a>';
						if (typeof(TxtSpan[0]) != 'undefined') {
							TxtSpan.after(strLink);
							TxtSpan.remove();
							html = dom.html();
						} else {
							html = html.replace(text, strLink);
						}
						link.addClass('selected');
					}

					booboxFY.helpers.set_html(html, true);
				}
			};
			booboxFY.post = function(url, data, callback) {
			    $.ajax({
			        url: url+'?jsonp=?',
			        dataType: 'jsonp',
					jsonp:'jsonp_callback',
			        data: data,
			        success: callback
			    });
			};
			booboxFY._saveNewlines = $.browser.msie;
			booboxFY.nl = $.browser.msie? "\r\n" : "\n"; // ie seems to be the only one to use \r\n - even fx on win doesn't
			// booboxFY.nlRegex = new RegExp(booboxFY.nl,'g');
			booboxFY.nlrep = $('<div><br class="boobox-bogus" /></div>').html();
			//inicia se tudo estiver configurado
			if (typeof bbD.bid != 'undefined' && bbD.bid != '' && typeof(tinymce) != 'undefined') {
				booboxFY.make();
				booboxFY.autoTag.update();
				booboxFY.autoTag.init_watch();
			}
	}	
}

var Base64 = {

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
		
		// modificação da boo-box
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
}